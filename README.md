# TimeMark: AI Video Summarizer & QA System

TimeMark is a completely free, open-source web application that allows you to summarize and chat with video content (either YouTube URLs or local video uploads) while maintaining precise timestamps. 

## Features
- **100% Free & Local:** Uses local models (faster-whisper, Ollama) and vector databases (ChromaDB) to process videos without any API costs.
- **YouTube & Local Video Support:** Enter a YouTube link or upload an `.mp4` file.
- **Timestamped Chat:** Ask questions about the video and click the timestamp in the answer to immediately seek the video player to that exact moment.
- **Automated Notes:** Generates structured summaries and bullet-point notes.

## Tech Stack
- **Frontend:** Next.js (React), TailwindCSS
- **Backend:** Python, FastAPI
- **AI / Pipeline:** LangChain, ChromaDB, HuggingFace Embeddings, faster-whisper, Ollama (Llama 3/Phi-3)

## Setup Instructions

### Prerequisites
- Node.js (for frontend)
- Python 3.10+ (for backend)
- [FFmpeg](https://ffmpeg.org/download.html) installed and in your system PATH.
- [Ollama](https://ollama.com/) installed and running locally. You must pull the `llama3` model by running `ollama run llama3`.

### 1. Backend Setup
1. Navigate to the `backend` folder: `cd backend`
2. Create and activate a virtual environment:
   - Windows: `python -m venv venv` and `.\venv\Scripts\activate`
3. Install dependencies (Requires PyTorch, transformers, faster-whisper, etc.):
   - `pip install fastapi uvicorn yt-dlp faster-whisper langchain langchain-community langchain-huggingface chromadb sentence-transformers pydantic python-multipart`
4. Run the backend server: `uvicorn main:app --reload`

### 2. Frontend Setup
1. Navigate to the `frontend` folder: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

### 3. Usage
Open `http://localhost:3000` in your browser. Input a YouTube URL or upload a video. Wait for the processing to finish, and start chatting!
