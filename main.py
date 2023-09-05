# main.py
import mimetypes
import threading
import webbrowser
import click
import uvicorn
import shutil

from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path

from service.deepgram import dg_client

UPLOAD_DIR = "static/audio"
Path(UPLOAD_DIR).mkdir(exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to your React build directory
REACT_BUILD_PATH = Path("public")

# Serve static files
app.mount("/static", StaticFiles(directory=REACT_BUILD_PATH / "static", check_dir=False), name="static")


@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    # If the requested file exists, serve it
    file_path = REACT_BUILD_PATH / full_path
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)

    # Otherwise, serve index.html
    return FileResponse(REACT_BUILD_PATH / "index.html")


class GetTranscriptionRequest(BaseModel):
    fileName: str


@app.post("/api/upload")
async def upload_audio(file: UploadFile = None):
    """
    Upload audio file to local disk space. File is located at UPLOAD_DIR
    :param file: to upload
    :return: file
    """
    if not file:
        raise HTTPException(status_code=400, detail="File not provided")

    file_path = Path(UPLOAD_DIR) / file.filename

    # Check if the file already exists
    if file_path.exists():
        # Remove the existing file
        file_path.unlink()

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"fileName": file.filename, "message": "File uploaded successfully at /static/audio folder"}
    finally:
        file.file.close()


class GetTranscriptionRequest(BaseModel):
    fileName: str


@app.post("/api/transcribe")
async def transcribe(data: GetTranscriptionRequest):
    """
    Generate transcript based on the filename passed in.
    If debug query parameter set to True, it will return a mock response
    and will not call the underlying transcription service.
    :param data: request model
    :return: transcript in JSON
    """
    file_path = Path(UPLOAD_DIR) / data.fileName

    if not file_path.exists():
        raise HTTPException(status_code=400, detail="File does not exist")

    audio = open(file_path, 'rb')
    mime_type, _ = mimetypes.guess_type(file_path)

    source = {"buffer": audio, 'mimetype': mime_type}
    response = await dg_client.transcription.prerecorded(
        source, {"smart_format": True, "model": "whisper-medium", "diarize": True}
    )
    transcript = response["results"]["channels"][0]["alternatives"][0]["paragraphs"]["transcript"]
    paragraphs = response["results"]["channels"][0]["alternatives"][0]["paragraphs"]["paragraphs"]
    formated_paragraph = list()
    # Merge pauses of the same speaker into a single paragraph
    for i in range(len(paragraphs)):
        joined_sentences = " ".join(x["text"] for x in paragraphs[i]["sentences"])
        formated_paragraph.append({
            "content": joined_sentences,
            "speaker": paragraphs[i]["speaker"]
        })
    return {"transcript": transcript, "paragraphs": formated_paragraph}


@click.command()
@click.option("--reload", default=False, is_flag=True, help="Reload the server when source files change")
@click.option("--host", type=str, default="127.0.0.1", help="Host of the app, default is 127.0.0.1")
@click.option("--port", type=int, default=8000, help="Port of the app, default is 8000")
def start_server(reload, host, port):
    config = uvicorn.Config("main:app", host=host, port=port, log_level="info", workers=4, reload=reload)

    def open_browser():
        webbrowser.open_new(f"http://{host}:{port}/")

    threading.Thread(target=open_browser).start()

    server = uvicorn.Server(config)
    server.run()


if __name__ == "__main__":
    start_server()
