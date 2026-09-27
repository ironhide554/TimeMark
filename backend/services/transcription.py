from groq import Groq
import os
import math
import subprocess
from dotenv import load_dotenv

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

def transcribe_audio(audio_path: str):
    """
    Transcribes audio (chunking if needed) and returns a list of segments with timestamps using Groq API.
    """
    client = Groq()
    
    # Groq has a 25MB file size limit. 
    # We chunk the audio into 10-minute (600 seconds) segments to ensure it fits the limit.
    CHUNK_LENGTH_SEC = 600
    
    duration = get_audio_duration(audio_path)
    print(f"Audio duration: {duration} seconds")
    
    transcript_segments = []
    full_text = ""
    
    # If duration couldn't be determined or is small, we can just process as one chunk (or chunk it anyway using ffmpeg segment muxer)
    # The safest way is to use ffmpeg to split it into 10-minute chunks automatically.
    
    chunk_prefix = f"{audio_path}_chunk_"
    
    # Use ffmpeg to split the file into chunks
    # -f segment -segment_time 600 -c:a mp3 -b:a 64k
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
    
    print("Chunking audio with ffmpeg...")
    subprocess.run(split_command, check=True)
    
    # Now find all generated chunks
    import glob
    chunks = sorted(glob.glob(f"{chunk_prefix}*.mp3"))
    
    print(f"Split into {len(chunks)} chunks.")
    
    for i, chunk_path in enumerate(chunks):
        offset_seconds = i * CHUNK_LENGTH_SEC
        
        with open(chunk_path, "rb") as file:
            print(f"Sending chunk {i + 1} to Groq Whisper API...")
            try:
                transcription = client.audio.transcriptions.create(
                    file=(os.path.basename(chunk_path), file.read()),
                    model="whisper-large-v3",
                    response_format="verbose_json",
                )
            except Exception as e:
                print(f"Groq API Error on chunk {i + 1}: {e}")
                file.close()
                for c in chunks:
                    if os.path.exists(c):
                        os.remove(c)
                raise e
                
        # Append full text
        full_text += getattr(transcription, 'text', '') + " "
        
        # Append segments with offset
        if hasattr(transcription, 'segments') and transcription.segments:
            for segment in transcription.segments:
                if isinstance(segment, dict):
                    transcript_segments.append({
                        "start": segment.get("start", 0) + offset_seconds,
                        "end": segment.get("end", 0) + offset_seconds,
                        "text": segment.get("text", "")
                    })
                else:
                    transcript_segments.append({
                        "start": getattr(segment, "start", 0) + offset_seconds,
                        "end": getattr(segment, "end", 0) + offset_seconds,
                        "text": getattr(segment, "text", "")
                    })
        else:
            # Fallback
            transcript_segments.append({
                "start": offset_seconds,
                "end": offset_seconds + CHUNK_LENGTH_SEC,
                "text": getattr(transcription, 'text', '')
            })
            
        os.remove(chunk_path)
        
    print("Transcription complete.")
        
    return {
        "full_text": full_text.strip(),
        "segments": transcript_segments
    }
