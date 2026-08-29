import yt_dlp
import os
import uuid

def download_youtube_audio(url: str, output_dir: str = "temp") -> str:
    """Downloads audio from a YouTube URL and returns the file path."""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    video_id = str(uuid.uuid4())
    output_path = os.path.join(output_dir, f"{video_id}.%(ext)s")
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': output_path,
        'quiet': True
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
        
    return os.path.join(output_dir, f"{video_id}.mp3")

def extract_audio_from_video(video_path: str, output_dir: str = "temp") -> str:
    """Extracts audio from a local video file using ffmpeg."""
    import subprocess
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    video_id = str(uuid.uuid4())
    audio_path = os.path.join(output_dir, f"{video_id}.mp3")
    
    # Use ffmpeg to extract audio
    command = [
        'ffmpeg',
        '-i', video_path,
        '-q:a', '0',
        '-map', 'a',
        audio_path,
        '-y', # Overwrite output
        '-loglevel', 'error'
    ]
    
    subprocess.run(command, check=True)
    return audio_path
