from faster_whisper import WhisperModel
import os

# Initialize the model (it will download on first run)
# We use 'base' or 'small' for speed, compute_type 'int8' or 'float16' depending on GPU
# Since the user has an RTX 3050, we can try float16
MODEL_SIZE = "small"

def get_transcription_model():
    # Use GPU if available, fallback to CPU
    try:
        model = WhisperModel(MODEL_SIZE, device="cuda", compute_type="float16")
    except Exception as e:
        print(f"CUDA initialization failed, falling back to CPU: {e}")
        model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
    return model

def transcribe_audio(audio_path: str):
    """
    Transcribes audio and returns a list of segments with timestamps.
    """
    model = get_transcription_model()
    
    segments, info = model.transcribe(audio_path, beam_size=5)
    
    print("Detected language '%s' with probability %f" % (info.language, info.language_probability))
    
    transcript_segments = []
    full_text = ""
    
    for segment in segments:
        transcript_segments.append({
            "start": segment.start,
            "end": segment.end,
            "text": segment.text
        })
        full_text += segment.text + " "
        
    return {
        "full_text": full_text.strip(),
        "segments": transcript_segments
    }
