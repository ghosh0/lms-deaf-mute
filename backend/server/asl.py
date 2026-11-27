import json
import os
from collections import deque, Counter

import cv2
import numpy as np
import mediapipe as mp

from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision as mp_vision

import tensorflow as tf


# -------------------------------------------------------------
# Paths
# -------------------------------------------------------------

ROOT_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        ".."
    )
)

MODEL_DIR = os.path.join(ROOT_DIR, "model")

KERAS_MODEL_PATH = os.path.join(
    MODEL_DIR,
    "asl_model.h5"
)

LABELS_PATH = os.path.join(
    MODEL_DIR,
    "labels.json"
)

HAND_LANDMARKER_PATH = os.path.join(
    MODEL_DIR,
    "hand_landmarker.task"
)


# -------------------------------------------------------------
# Constants
# -------------------------------------------------------------

CONFIDENCE_THRESHOLD = 0.80

NUM_LANDMARKS = 21

FEATURES_PER_HAND = NUM_LANDMARKS * 3

FEATURE_DIM = FEATURES_PER_HAND * 2


# -------------------------------------------------------------
# Verify Files
# -------------------------------------------------------------

required = [

    KERAS_MODEL_PATH,

    LABELS_PATH,

    HAND_LANDMARKER_PATH

]

for path in required:

    if not os.path.exists(path):

        raise FileNotFoundError(path)


# -------------------------------------------------------------
# Labels
# -------------------------------------------------------------

with open(LABELS_PATH) as f:

    CLASS_NAMES = json.load(f)


# -------------------------------------------------------------
# TensorFlow Model
# -------------------------------------------------------------

print("Loading TensorFlow model...")

keras_model = tf.keras.models.load_model(
    KERAS_MODEL_PATH
)

print("TensorFlow model loaded.")


# -------------------------------------------------------------
# Prediction Function
# -------------------------------------------------------------

def predict(feature_vector):

    x = feature_vector.reshape(1,-1).astype(np.float32)

    probs = keras_model.predict(

        x,

        verbose=0

    )[0]

    return probs


# -------------------------------------------------------------
# MediaPipe
# -------------------------------------------------------------

base_options = mp_tasks.BaseOptions(

    model_asset_path=HAND_LANDMARKER_PATH

)

hand_options = mp_vision.HandLandmarkerOptions(

    base_options=base_options,

    num_hands=2,

    min_hand_detection_confidence=0.5,

    min_hand_presence_confidence=0.5,

    running_mode=mp_vision.RunningMode.IMAGE,

)

hand_landmarker = mp_vision.HandLandmarker.create_from_options(

    hand_options

)


HAND_CONNECTIONS = [

    (0,1),(1,2),(2,3),(3,4),

    (0,5),(5,6),(6,7),(7,8),

    (0,9),(9,10),(10,11),(11,12),

    (0,13),(13,14),(14,15),(15,16),

    (0,17),(17,18),(18,19),(19,20),

    (5,9),

    (9,13),

    (13,17)

]

# -------------------------------------------------------------
# Feature Extraction
# -------------------------------------------------------------

def normalize_hand(landmarks):

    pts = np.array(
        [[lm.x, lm.y, lm.z] for lm in landmarks],
        dtype=np.float32
    )

    wrist = pts[0].copy()

    pts -= wrist

    max_dist = np.max(
        np.linalg.norm(pts, axis=1)
    )

    if max_dist > 1e-6:
        pts /= max_dist

    return pts.flatten()


# -------------------------------------------------------------
# Build Feature Vector
# -------------------------------------------------------------

def extract_features_from_result(result):

    if not result.hand_landmarks:

        return None

    left_vec = np.zeros(
        FEATURES_PER_HAND,
        dtype=np.float32
    )

    right_vec = np.zeros(
        FEATURES_PER_HAND,
        dtype=np.float32
    )

    for landmarks, handedness in zip(
        result.hand_landmarks,
        result.handedness
    ):

        label = handedness[0].category_name

        vec = normalize_hand(landmarks)

        if label == "Left":

            left_vec = vec

        else:

            right_vec = vec

    features = np.concatenate([
        left_vec,
        right_vec
    ])

    return features


# -------------------------------------------------------------
# Optional Debug Drawing
# -------------------------------------------------------------

def draw_landmarks(frame, result):

    h, w = frame.shape[:2]

    for landmarks in result.hand_landmarks:

        pts = [

            (

                int(lm.x * w),

                int(lm.y * h)

            )

            for lm in landmarks

        ]

        for a, b in HAND_CONNECTIONS:

            cv2.line(

                frame,

                pts[a],

                pts[b],

                (0,255,0),

                2

            )

        for x, y in pts:

            cv2.circle(

                frame,

                (x,y),

                4,

                (0,0,255),

                -1

            )

    return frame


# -------------------------------------------------------------
# -------------------------------------------------------------
# Public API
# -------------------------------------------------------------

def recognize_frame(image_bytes):

    try:

        arr = np.frombuffer(
            image_bytes,
            np.uint8
        )

        frame = cv2.imdecode(
            arr,
            cv2.IMREAD_COLOR
        )

        if frame is None:

            return {

                "success": False,

                "letter": "",

                "confidence": 0.0,

                "message": "Invalid image"

            }

        frame = cv2.flip(frame, 1)

        rgb = cv2.cvtColor(

            frame,

            cv2.COLOR_BGR2RGB

        )

        mp_image = mp.Image(

            image_format=mp.ImageFormat.SRGB,

            data=rgb

        )

        result = hand_landmarker.detect(mp_image)

        if not result.hand_landmarks:

            return {

                "success": True,

                "letter": "",

                "confidence": 0.0,

                "message": "No hand detected"

            }

        features = extract_features_from_result(result)

        if features is None:

            return {

                "success": True,

                "letter": "",

                "confidence": 0.0,

                "message": "No features"

            }

        # ---------- Prediction ----------

        probs = predict(features)

        best_idx = int(np.argmax(probs))

        confidence = float(probs[best_idx])

        if confidence < CONFIDENCE_THRESHOLD:

            return {

                "success": True,

                "letter": "",

                "confidence": confidence,

                "message": "Low confidence"

            }

        predicted_letter = CLASS_NAMES[best_idx]

        return {

            "success": True,

            "letter": predicted_letter,

            "confidence": confidence

        }

    except Exception as e:

        return {

            "success": False,

            "letter": "",

            "confidence": 0.0,

            "message": str(e)

        }