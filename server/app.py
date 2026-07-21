from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from asl import recognize_frame

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "ASL Recognition API Running"
    }


@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):

    image = await file.read()

    result = recognize_frame(image)

    return result