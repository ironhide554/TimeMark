from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
import uuid

from services.downloader import download_youtube_audio, extract_audio_from_video
from services.transcription import transcribe_audio
from services.ai_pipeline import generate_summary_and_notes, index_transcript_for_rag, ask_question

app = FastAPI(title="TimeMark API", description="API for Video Summarizer & Q&A")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory storage for demo purposes
db = {}

class YouTubeRequest(BaseModel):
    url: str

class ChatRequest(BaseModel):
    video_id: str
    question: str

def process_video_task(video_id: str, audio_path: str):
    try:
        print(f"Starting transcription for {video_id}...")
        transcript_data = transcribe_audio(audio_path)
        
        print("Generating summary...")
        ai_response = generate_summary_and_notes(transcript_data["full_text"])
        
        print("Indexing for RAG...")
        index_transcript_for_rag(video_id, transcript_data["segments"])
        
        db[video_id]["status"] = "completed"
        db[video_id]["summary"] = ai_response
        db[video_id]["transcript"] = transcript_data["segments"]
        
        # Cleanup audio file
        if os.path.exists(audio_path):
            os.remove(audio_path)
    except Exception as e:
        print(f"Error processing video {video_id}: {e}")
        db[video_id]["status"] = "failed"

@app.post("/api/process/youtube")
async def process_youtube(request: YouTubeRequest, background_tasks: BackgroundTasks):
    video_id = str(uuid.uuid4())
    db[video_id] = {"status": "processing"}
    
    try:
        audio_path = download_youtube_audio(request.url)
        background_tasks.add_task(process_video_task, video_id, audio_path)
        return {"status": "processing", "video_id": video_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/process/upload")
async def process_upload(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    video_id = str(uuid.uuid4())
    db[video_id] = {"status": "processing"}
    
    temp_dir = "temp"
    os.makedirs(temp_dir, exist_ok=True)
    video_path = os.path.join(temp_dir, f"{video_id}_{file.filename}")
    
    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        audio_path = extract_audio_from_video(video_path, temp_dir)
        # Cleanup video file immediately after extracting audio
        os.remove(video_path)
        
        background_tasks.add_task(process_video_task, video_id, audio_path)
        return {"status": "processing", "video_id": video_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/video/{video_id}/status")
async def get_status(video_id: str):
    if video_id not in db:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if db[video_id]["status"] == "completed":
        return {
            "status": "completed",
            "summary": db[video_id]["summary"]
        }
    return {"status": db[video_id]["status"]}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    if request.video_id not in db:
        raise HTTPException(status_code=404, detail="Video not found")
        
    if db[request.video_id]["status"] != "completed":
        raise HTTPException(status_code=400, detail="Video processing not finished")
        
    response = ask_question(request.video_id, request.question)
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
