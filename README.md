<div align="center">

# ⏱️ TimeMark AI

### Neural Video Intelligence, Chapter Synthesis & Timestamped Q&A

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3_Flash-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <b>Turn hours of lecture, podcast, or tutorial videos into structured knowledge in seconds.</b><br/>
  Featuring instant sub-second timestamp seeking, Notion-style chapter notes, and conversational Q&A.
</p>

</div>

---

## ✨ Features

- 🎥 **Multi-Source Ingestion**: Process public YouTube links (with instant thumbnail preview detection) or upload local video files (`.mp4`, `.mkv`, `.mov`, `.webm`).
- 🧠 **Gemini 3 Flash Engine**: Powered by Google Gemini 3 Flash (`gemini-3-flash-preview`) with native audio multimodal comprehension and a massive 1-million-token context window.
- ⏱️ **Interactive Timestamp Seeking**: Every AI answer and chapter card includes a clickable `⏱ Seek to MM:SS` citation that jumps the video player directly to that exact moment.
- 📑 **Notion-Style Knowledge Hub**:
  - **Executive Summary & Key Takeaways**: High-level synthesis with structured bullet points.
  - **Timeline Chapters**: Clickable chapter cards with preview descriptions.
  - **Searchable Transcript**: Real-time keyword search filter across all transcribed spoken lines.
  - **Export Options**: One-click **Copy to Clipboard** and **Download Markdown (`.md`)**.
- 🎬 **Cinematic Theater Mode**: Ambient backlight glow surrounding the video player with quick `-10s` and `+10s` relative jump controls.
- 🌟 **Zero-Friction Portfolio Demos**: Preloaded showcase lectures (*3Blue1Brown Neural Networks* & *Andrej Karpathy Intro to LLMs*) allowing reviewers to test the entire interactive experience instantly with zero setup.
- 🚀 **Production-Ready**: Configured with a production `Dockerfile` and dynamic environment variables for seamless deployment on **Vercel** and **Render**.

---

## 🏛️ System Architecture

```text
┌─────────────────┐       ┌────────────────────────┐       ┌──────────────────────┐
│  YouTube URL /  │ ───► │   FastAPI Backend      │ ───► │  Google Gemini 3     │
│  Local MP4 File │       │   (yt-dlp + ffmpeg)    │       │  Flash Engine        │
└─────────────────┘       └───────────┬────────────┘       └──────────┬───────────┘
                                      │                               │
                                      ▼                               ▼
                          ┌────────────────────────┐       ┌──────────────────────┐
                          │  Next.js 16 Web UI     │ ◄──── │  • Sub-Second Seek   │
                          │  (Dark Glassmorphism)  │       │  • Chapter Timeline  │
                          │  • Video Player        │       │  • Grounded Q&A      │
                          │  • Knowledge Hub       │       │  • Markdown Notes    │
                          │  • Chat Assistant      │       │                      │
                          └────────────────────────┘       └──────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, React Markdown.
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic, python-multipart.
- **AI / LLM**: Google Gemini 3 Flash (`google-genai` SDK v2.29+).
- **Media Processing**: `yt-dlp`, FFmpeg, FFprobe.
- **Containerization**: Docker (Debian slim + FFmpeg).

---

## 🚀 Quickstart Guide

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [Python 3.10+](https://www.python.org/)
- [FFmpeg](https://ffmpeg.org/) (bundled in backend directory for Windows)
- A free API key from [Google AI Studio](https://aistudio.google.com/apikey)

---

### 1. Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your `.env` file in `backend/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3-flash-preview
   ```

5. Launch the backend API server:
   ```bash
   python main.py
   ```
   *The server will start at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.*

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open **`http://localhost:3000`** in your browser.

---

## 🌐 Production Deployment

### Frontend (Vercel)
1. Push your repository to GitHub.
2. Import the project on [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. (Optional) Under Environment Variables, add:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```
5. Click **Deploy**.

### Backend (Render / Docker)
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your repository and set **Root Directory** to `backend`.
3. Select **Docker** environment (Render automatically uses [`backend/Dockerfile`](backend/Dockerfile)).
4. Add your Environment Variables:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` = `gemini-3-flash-preview`
5. Click **Create Web Service**.

---

## 📁 Repository Structure

```text
TimeMark/
├── backend/
│   ├── services/
│   │   ├── ai_pipeline.py     # Gemini 3 Flash synthesis & Q&A logic
│   │   ├── transcription.py   # Audio extraction & Gemini transcription
│   │   └── downloader.py      # yt-dlp & local video audio processing
│   ├── Dockerfile             # Production container setup
│   ├── requirements.txt       # Production Python dependencies
│   ├── main.py                # FastAPI endpoints & CORS config
│   └── .env                   # Environment keys (ignored by git)
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css    # Dark obsidian tokens & glassmorphism
│   │   │   ├── layout.tsx     # App layout & typography
│   │   │   └── page.tsx       # Main page & 4-stage pipeline visualizer
│   │   ├── components/
│   │   │   ├── UploadForm.tsx # Hero, input tabs, thumbnail detector
│   │   │   ├── VideoPlayer.tsx# Ambient video player with seek controls
│   │   │   ├── NotesPanel.tsx # 3-tab Knowledge Hub & transcript search
│   │   │   └── ChatInterface.tsx # Conversational Q&A with seek pills
│   │   ├── config/
│   │   │   └── api.ts         # Dynamic API endpoint configuration
│   │   └── data/
│   │       └── demoPresets.ts # Showcase demo presets
│   └── package.json
│
├── LICENSE                    # MIT License
└── README.md                  # Project documentation
```

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
