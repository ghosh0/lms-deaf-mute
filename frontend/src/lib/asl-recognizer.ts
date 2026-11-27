import {
  FilesetResolver,
  HandLandmarker,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision';

interface DenseLayer {
  kernel: number[][];
  bias: number[];
}

interface BatchNormLayer {
  gamma: number[];
  beta: number[];
  movingMean: number[];
  movingVariance: number[];
  epsilon: number;
}

interface AslWeights {
  dense: DenseLayer;
  bn: BatchNormLayer;
  dense1: DenseLayer;
  bn1: BatchNormLayer;
  dense2: DenseLayer;
  dense3: DenseLayer;
}

export interface AslPredictionResult {
  success: boolean;
  letter: string;
  confidence: number;
  message?: string;
}

const CONFIDENCE_THRESHOLD = 0.8;
const NUM_LANDMARKS = 21;
const FEATURES_PER_HAND = NUM_LANDMARKS * 3;
const MEDIAPIPE_WASM_URL = '/wasm';

let handLandmarker: HandLandmarker | null = null;
let weights: AslWeights | null = null;
let classNames: string[] = [];
let initPromise: Promise<void> | null = null;

async function initialize(): Promise<void> {
  const [vision, weightsRes, labelsRes] = await Promise.all([
    FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL),
    fetch('/models/asl_weights.json'),
    fetch('/models/labels.json'),
  ]);

  if (!weightsRes.ok) {
    throw new Error(`Failed to load ASL weights (${weightsRes.status})`);
  }
  if (!labelsRes.ok) {
    throw new Error(`Failed to load ASL labels (${labelsRes.status})`);
  }

  const [loadedWeights, loadedLabels, landmarker] = await Promise.all([
    weightsRes.json() as Promise<AslWeights>,
    labelsRes.json() as Promise<string[]>,
    HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/models/hand_landmarker.task',
        delegate: 'GPU',
      },
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      runningMode: 'IMAGE',
    }).catch(() =>
      // Fallback to CPU delegate if WebGL/GPU delegate is unavailable
      HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/models/hand_landmarker.task',
        },
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        runningMode: 'IMAGE',
      })
    ),
  ]);

  weights = loadedWeights;
  classNames = loadedLabels;
  handLandmarker = landmarker;
}

export async function ensureAslRecognizerReady(): Promise<void> {
  if (handLandmarker && weights && classNames.length > 0) {
    return;
  }
  if (!initPromise) {
    initPromise = initialize().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

function normalizeHand(landmarks: NormalizedLandmark[]): Float32Array {
  const out = new Float32Array(FEATURES_PER_HAND);
  const wx = landmarks[0].x;
  const wy = landmarks[0].y;
  const wz = landmarks[0].z;

  let maxDist = 0;
  for (let i = 0; i < NUM_LANDMARKS; i++) {
    const dx = landmarks[i].x - wx;
    const dy = landmarks[i].y - wy;
    const dz = landmarks[i].z - wz;
    out[i * 3] = dx;
    out[i * 3 + 1] = dy;
    out[i * 3 + 2] = dz;
    const dist = Math.hypot(dx, dy, dz);
    if (dist > maxDist) {
      maxDist = dist;
    }
  }

  if (maxDist > 1e-6) {
    for (let i = 0; i < out.length; i++) {
      out[i] /= maxDist;
    }
  }

  return out;
}

function denseForward(
  input: Float32Array,
  layer: DenseLayer,
  activation: 'relu' | 'softmax'
): Float32Array {
  const inDim = input.length;
  const outDim = layer.bias.length;
  const out = new Float32Array(outDim);

  for (let j = 0; j < outDim; j++) {
    let sum = layer.bias[j];
    for (let i = 0; i < inDim; i++) {
      sum += input[i] * layer.kernel[i][j];
    }
    out[j] = activation === 'relu' ? (sum > 0 ? sum : 0) : sum;
  }

  if (activation === 'softmax') {
    let maxVal = -Infinity;
    for (let j = 0; j < outDim; j++) {
      if (out[j] > maxVal) maxVal = out[j];
    }
    let expSum = 0;
    for (let j = 0; j < outDim; j++) {
      const e = Math.exp(out[j] - maxVal);
      out[j] = e;
      expSum += e;
    }
    for (let j = 0; j < outDim; j++) {
      out[j] /= expSum;
    }
  }

  return out;
}

function batchNormForward(
  input: Float32Array,
  layer: BatchNormLayer
): Float32Array {
  const out = new Float32Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const invStd = 1 / Math.sqrt(layer.movingVariance[i] + layer.epsilon);
    out[i] = layer.gamma[i] * (input[i] - layer.movingMean[i]) * invStd + layer.beta[i];
  }
  return out;
}

function predictFromFeatures(features: Float32Array, model: AslWeights): Float32Array {
  const h1 = batchNormForward(denseForward(features, model.dense, 'relu'), model.bn);
  const h2 = batchNormForward(denseForward(h1, model.dense1, 'relu'), model.bn1);
  const h3 = denseForward(h2, model.dense2, 'relu');
  return denseForward(h3, model.dense3, 'softmax');
}

export async function recognizeVideoFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
): Promise<AslPredictionResult> {
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    return { success: true, letter: '', confidence: 0, message: 'Video not ready' };
  }

  await ensureAslRecognizerReady();
  if (!handLandmarker || !weights || classNames.length === 0) {
    return { success: false, letter: '', confidence: 0, message: 'Model not initialized' };
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { success: false, letter: '', confidence: 0, message: 'Canvas context unavailable' };
  }

  // Flip horizontally to match cv2.flip(frame, 1) used during training/server inference
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  const result = handLandmarker.detect(canvas);
  if (!result.landmarks || result.landmarks.length === 0) {
    return { success: true, letter: '', confidence: 0, message: 'No hand detected' };
  }

  let leftVec: Float32Array = new Float32Array(FEATURES_PER_HAND);
  let rightVec: Float32Array = new Float32Array(FEATURES_PER_HAND);

  for (let i = 0; i < result.landmarks.length; i++) {
    const landmarks = result.landmarks[i];
    const handedness = result.handednesses?.[i]?.[0]?.categoryName;
    const vec = normalizeHand(landmarks);
    if (handedness === 'Left') {
      leftVec = vec;
    } else {
      rightVec = vec;
    }
  }

  const features = new Float32Array(FEATURES_PER_HAND * 2);
  features.set(leftVec, 0);
  features.set(rightVec, FEATURES_PER_HAND);

  const probs = predictFromFeatures(features, weights);
  let bestIdx = 0;
  let bestConf = probs[0];
  for (let i = 1; i < probs.length; i++) {
    if (probs[i] > bestConf) {
      bestConf = probs[i];
      bestIdx = i;
    }
  }

  if (bestConf < CONFIDENCE_THRESHOLD) {
    return {
      success: true,
      letter: '',
      confidence: bestConf,
      message: 'Low confidence',
    };
  }

  return {
    success: true,
    letter: classNames[bestIdx] ?? '',
    confidence: bestConf,
  };
}
