"""
Real-time ASL fingerspelling recognition on your local machine's webcam.

Uses the MODERN MediaPipe Tasks API (mediapipe.tasks.python.vision.HandLandmarker),
NOT the deprecated mediapipe.solutions.hands.

Before running, place these files (downloaded from the Colab notebook's zip) in the
SAME folder as this script:
    - asl_model.h5            (or asl_model.tflite, see USE_TFLITE below)
    - labels.json
    - hand_landmarker.task

Install dependencies first:
    pip install -r requirements_local.txt

Run:
    python asl_realtime_inference.py
"""

import json
import os
import time
from collections import deque, Counter

import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision as mp_vision

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
HAND_LANDMARKER_PATH = os.path.join(MODEL_DIR, "hand_landmarker.task")
LABELS_PATH = os.path.join(MODEL_DIR, "labels.json")

USE_TFLITE = False  # set True to use asl_model.tflite instead of the Keras .h5 model
KERAS_MODEL_PATH = os.path.join(MODEL_DIR, "asl_model.h5")
TFLITE_MODEL_PATH = os.path.join(MODEL_DIR, "asl_model.tflite")

CAMERA_INDEX = 0          # change if you have multiple webcams
CONFIDENCE_THRESHOLD = 0.9  # only show a prediction above this confidence
SMOOTHING_WINDOW = 15         # majority-vote over the last N predictions, reduces flicker

NUM_LANDMARKS = 21
FEATURES_PER_HAND = NUM_LANDMARKS * 3
FEATURE_DIM = FEATURES_PER_HAND * 2  # 126, must match training notebook

# ---------------------------------------------------------------------------
# Sanity checks
# ---------------------------------------------------------------------------
for required_path, name in [
    (HAND_LANDMARKER_PATH, "hand_landmarker.task"),
    (LABELS_PATH, "labels.json"),
    (TFLITE_MODEL_PATH if USE_TFLITE else KERAS_MODEL_PATH,
     "asl_model.tflite" if USE_TFLITE else "asl_model.h5"),
]:
    if not os.path.exists(required_path):
        raise FileNotFoundError(
            f"Could not find '{name}' at {required_path}. "
            f"Copy it from the zip downloaded out of the Colab training notebook "
            f"into this script's folder."
        )

with open(LABELS_PATH) as f:
    CLASS_NAMES = json.load(f)

# ---------------------------------------------------------------------------
# Load the classifier
# ---------------------------------------------------------------------------
if USE_TFLITE:
    import tensorflow as tf
    interpreter = tf.lite.Interpreter(model_path=TFLITE_MODEL_PATH)
    interpreter.allocate_tensors()
    in_details = interpreter.get_input_details()
    out_details = interpreter.get_output_details()

    def predict(feature_vector: np.ndarray) -> np.ndarray:
        x = feature_vector.reshape(1, -1).astype(np.float32)
        interpreter.set_tensor(in_details[0]["index"], x)
        interpreter.invoke()
        return interpreter.get_tensor(out_details[0]["index"])[0]

else:
    import tensorflow as tf
    keras_model = tf.keras.models.load_model(KERAS_MODEL_PATH)

    def predict(feature_vector: np.ndarray) -> np.ndarray:
        x = feature_vector.reshape(1, -1).astype(np.float32)
        return keras_model.predict(x, verbose=0)[0]

# ---------------------------------------------------------------------------
# MediaPipe Tasks HandLandmarker setup (modern API)
# ---------------------------------------------------------------------------
base_options = mp_tasks.BaseOptions(model_asset_path=HAND_LANDMARKER_PATH)
hand_options = mp_vision.HandLandmarkerOptions(
    base_options=base_options,
    num_hands=2,
    min_hand_detection_confidence=0.75,
    min_hand_presence_confidence=0.75,
    min_tracking_confidence=0.85,
    running_mode=mp_vision.RunningMode.VIDEO,
)
hand_landmarker = mp_vision.HandLandmarker.create_from_options(hand_options)

mp_drawing_utils = mp.solutions.drawing_utils if hasattr(mp, "solutions") else None
# NOTE: we only use mp.solutions.drawing_utils (a pure drawing helper, not the
# deprecated detection pipeline) if available; otherwise we draw manually below.

HAND_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 4),          # thumb
    (0, 5), (5, 6), (6, 7), (7, 8),          # index
    (0, 9), (9, 10), (10, 11), (11, 12),     # middle
    (0, 13), (13, 14), (14, 15), (15, 16),   # ring
    (0, 17), (17, 18), (18, 19), (19, 20),   # pinky
    (5, 9), (9, 13), (13, 17),               # palm
]
prev_features = None
SMOOTHING_ALPHA = 0.75


# ---------------------------------------------------------------------------
# Feature extraction — MUST MATCH the Colab training notebook exactly
# ---------------------------------------------------------------------------
def normalize_hand(landmarks) -> np.ndarray:
    pts = np.array([[lm.x, lm.y, lm.z] for lm in landmarks], dtype=np.float32)
    wrist = pts[0].copy()
    pts -= wrist
    max_dist = np.max(np.linalg.norm(pts, axis=1))
    if max_dist > 1e-6:
        pts /= max_dist
    return pts.flatten()


def extract_features_from_result(result):
    global prev_features

    if not result.hand_landmarks:
        prev_features = None
        return None

    left_vec = np.zeros(FEATURES_PER_HAND, dtype=np.float32)
    right_vec = np.zeros(FEATURES_PER_HAND, dtype=np.float32)

    for landmarks, handedness in zip(result.hand_landmarks, result.handedness):

        label = handedness[0].category_name

        vec = normalize_hand(landmarks)

        if label == "Left":
            left_vec = vec
        else:
            right_vec = vec

    features = np.concatenate([left_vec, right_vec])

    if prev_features is None:
        prev_features = features
    else:
        features = (
            SMOOTHING_ALPHA * prev_features
            + (1 - SMOOTHING_ALPHA) * features
        )
        prev_features = features

    return features


def draw_landmarks(frame, result):
    h, w, _ = frame.shape
    for landmarks in result.hand_landmarks:
        pts_px = [(int(lm.x * w), int(lm.y * h)) for lm in landmarks]
        for a, b in HAND_CONNECTIONS:
            cv2.line(frame, pts_px[a], pts_px[b], (0, 255, 0), 2)
        for x, y in pts_px:
            cv2.circle(frame, (x, y), 3, (0, 128, 255), -1)


# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------
def main():
    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        raise RuntimeError(f"Could not open webcam at index {CAMERA_INDEX}.")

    recent_predictions: deque[str] = deque(maxlen=SMOOTHING_WINDOW)
    start_time = time.time()
    frame_count = 0

    print("Starting webcam. Press 'q' to quit.")
    last_probs = np.zeros(len(CLASS_NAMES), dtype=np.float32)

    while True:
        ok, frame = cap.read()
        if not ok:
            print("Failed to read frame from webcam.")
            break

        frame = cv2.flip(frame, 1)  # mirror for natural selfie-view
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

        timestamp_ms = int((time.time() - start_time) * 1000)
        result = hand_landmarker.detect_for_video(mp_image, timestamp_ms)

        display_text = ""
        if result.hand_landmarks:
            draw_landmarks(frame, result)
            features = extract_features_from_result(result)
            if frame_count % 2 == 0:
                probs = predict(features)
                last_probs = probs
            else:
                probs = last_probs
            best_idx = int(np.argmax(probs))
            best_conf = float(probs[best_idx])

            if best_conf >= CONFIDENCE_THRESHOLD:

                recent_predictions.append(CLASS_NAMES[best_idx])

            else:

                if len(recent_predictions):

                    recent_predictions.append(recent_predictions[-1])

                else:

                    recent_predictions.append("")

            if recent_predictions:
                counter = Counter(recent_predictions)

                most_common, count = counter.most_common(1)[0]

                if count < SMOOTHING_WINDOW // 2:
                    most_common = ""
                if most_common:
                    display_text = f"{most_common.upper()}"

                    bar = int(best_conf * 250)

                    cv2.rectangle(frame, (20, 80), (270, 100), (50,50,50), -1)

                    cv2.rectangle(frame, (20, 80), (20 + bar, 100), (0,255,0), -1)

                    cv2.putText(
                        frame,
                        f"{best_conf*100:.1f}%",
                        (280,97),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (255,255,255),
                        2
                    )
        else:
            recent_predictions.clear()

            display_text = "No Hand Detected"

        frame_count += 1
        fps = frame_count / max(time.time() - start_time, 1e-6)

        cv2.rectangle(frame, (0, 0), (frame.shape[1], 70), (0, 0, 0), -1)
        cv2.putText(frame, display_text if display_text else "...", (15, 48),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.3, (255, 255, 255), 3)
        cv2.putText(frame, f"FPS: {fps:.1f}", (frame.shape[1] - 140, 25),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)

        cv2.imshow("ASL Real-Time Recognition (press q to quit)", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    hand_landmarker.close()


if __name__ == "__main__":
    main()