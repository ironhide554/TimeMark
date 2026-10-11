import os
import json
import math
import subprocess
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

def get_audio_duration(audio_path: str) -> float:
    """Returns the duration of the audio in seconds using ffprobe."""
    command = [
        'ffprobe', 
        '-v', 'error', 
        '-show_entries', 'format=duration', 
        '-of', 'default=noprint_wrappers=1:nokey=1', 
        audio_path
    ]
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return float(result.stdout.strip())
    except Exception as e:
        print(f"Error getting duration: {e}")
        return 0.0

def transcribe_with_gemini(audio_path: str):
    """
    Transcribes audio using Gemini 3.8 Flash multimodal understanding
    with timestamp extraction.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
        
    client = genai.Client(api_key=api_key)
    print(f"Uploading {audio_path} to Gemini Files API...")
    
    uploaded_file = client.files.upload(
        file=audio_path,
        mime_type="audio/mp3"
    )
    
    print(f"Uploaded audio as {uploaded_file.name}. Transcribing with Gemini 3.8 Flash...")
    
    prompt = """
Transcribe this audio completely into structured JSON.
Format the output as a JSON object with:
1. "full_text": the complete transcription text
2. "segments": an array of objects where each item has:
   - "start": start time in seconds (float)
   - "end": end time in seconds (float)
   - "text": transcribed text segment (string)

Output ONLY valid JSON.
"""

    response = client.models.generate_content(
        model=os.getenv("GEMINI_MODEL", "gemini-3-flash-preview"),
        contents=[
            uploaded_file,
            prompt
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )
    
    # Clean up uploaded file from Gemini storage
    try:
        client.files.delete(name=uploaded_file.name)
    except Exception:
        pass
        
    data = json.loads(response.text)
    return {
        "full_text": data.get("full_text", ""),
        "segments": data.get("segments", [])
    }

def transcribe_with_groq(audio_path: str):
    """Fallback transcription with Groq Whisper."""
    from groq import Groq
    client = Groq()
    CHUNK_LENGTH_SEC = 600
    chunk_prefix = f"{audio_path}_chunk_"
    
    split_command = [
        'ffmpeg',
        '-i', audio_path,
        '-f', 'segment',
        '-segment_time', str(CHUNK_LENGTH_SEC),
        '-c:a', 'mp3',
        '-b:a', '64k',
        '-y',
        '-loglevel', 'error',
        f"{chunk_prefix}%03d.mp3"
    ]
    
    subprocess.run(split_command, check=True)
    import glob
    chunks = sorted(glob.glob(f"{chunk_prefix}*.mp3"))
    
    transcript_segments = []
    full_text = ""
    
    for i, chunk_path in enumerate(chunks):
        offset_seconds = i * CHUNK_LENGTH_SEC
        with open(chunk_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(os.path.basename(chunk_path), file.read()),
                model="whisper-large-v3",
                response_format="verbose_json",
            )
        
        full_text += getattr(transcription, 'text', '') + " "
        if hasattr(transcription, 'segments') and transcription.segments:
            for segment in transcription.segments:
                start_val = segment.get("start", 0) if isinstance(segment, dict) else getattr(segment, "start", 0)
                end_val = segment.get("end", 0) if isinstance(segment, dict) else getattr(segment, "end", 0)
                text_val = segment.get("text", "") if isinstance(segment, dict) else getattr(segment, "text", "")
                transcript_segments.append({
                    "start": start_val + offset_seconds,
                    "end": end_val + offset_seconds,
                    "text": text_val
                })
        os.remove(chunk_path)
        
    return {
        "full_text": full_text.strip(),
        "segments": transcript_segments
    }

def transcribe_audio(audio_path: str):
    """
    Main transcription entry point: prefers Gemini 3.8 Flash, falls back to Groq.
    """
    # 1. Try Gemini 3.8 Flash first if GEMINI_API_KEY is configured
    if os.getenv("GEMINI_API_KEY"):
        try:
            res = transcribe_with_gemini(audio_path)
            if res and res.get("full_text"):
                print("Successfully transcribed with Gemini 3.8 Flash.")
                return res
        except Exception as e:
            print(f"Gemini transcription failed ({e}), attempting fallback...")

    # 2. Fallback to Groq Whisper
    return transcribe_with_groq(audio_path)
