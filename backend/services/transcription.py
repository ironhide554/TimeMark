from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

def transcribe_audio(audio_path: str):
    """
    Transcribes audio and returns a list of segments with timestamps using Groq API.
    """
    client = Groq()
    
    with open(audio_path, "rb") as file:
        print("Sending audio to Groq Whisper API...")
        transcription = client.audio.transcriptions.create(
            file=(os.path.basename(audio_path), file.read()),
            model="whisper-large-v3",
            response_format="verbose_json",
        )
        
    print("Transcription complete.")
    
    transcript_segments = []
    full_text = transcription.text
    
    # Groq's verbose_json response includes segments
    if hasattr(transcription, 'segments') and transcription.segments:
        for segment in transcription.segments:
            # Handle different formats just in case
            if isinstance(segment, dict):
                transcript_segments.append({
                    "start": segment.get("start", 0),
                    "end": segment.get("end", 0),
                    "text": segment.get("text", "")
                })
            else:
                transcript_segments.append({
                    "start": getattr(segment, "start", 0),
                    "end": getattr(segment, "end", 0),
                    "text": getattr(segment, "text", "")
                })
    else:
        # Fallback if segments aren't returned properly
        transcript_segments.append({
            "start": 0,
            "end": 0,
            "text": full_text
        })
        
    return {
        "full_text": full_text.strip(),
        "segments": transcript_segments
    }
