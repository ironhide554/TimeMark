import os
import json
import re
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# In-memory storage for video transcript segments
transcript_store = {}

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    return genai.Client(api_key=api_key)

def generate_summary_and_notes(full_text: str) -> str:
    """Uses Gemini 3.8 Flash to generate structured executive summary and key notes."""
    client = get_gemini_client()
    
    if client:
        try:
            prompt = f"""
You are an expert video content analyst. Analyze the following video transcript and produce:
1. Executive Summary (2-3 concise, impactful sentences).
2. Key Architectural / Core Concepts (detailed bullet points with bold headers).
3. Actionable Takeaways & Conclusions.

Transcript:
{full_text}

Format the output cleanly in markdown with clear headings, bullet points, and high contrast styling.
"""
            response = client.models.generate_content(
                model=os.getenv("GEMINI_MODEL", "gemini-3-flash-preview"),
                contents=prompt
            )
            return response.text or "Summary generation completed."
        except Exception as e:
            print(f"Gemini API error during summary generation: {e}")
            # Fall back to Groq if available
            pass

    # Fallback to Groq if Gemini key not set
    try:
        from langchain_groq import ChatGroq
        from langchain_core.prompts import PromptTemplate
        llm = ChatGroq(model="qwen/qwen3.8-27b", temperature=0)
        prompt = PromptTemplate(
            input_variables=["text"],
            template="""
You are an expert assistant. Read the following transcript and provide:
1. A brief 2-3 sentence summary.
2. Key bullet point notes.

Transcript:
{text}
"""
        )
        chain = prompt | llm
        result = chain.invoke({"text": full_text})
        return result.content
    except Exception as e:
        return f"Summary generation error: {e}"

def index_transcript_for_rag(video_id: str, segments: list) -> bool:
    """Stores the transcript segments in memory for timestamped lookup."""
    transcript_store[video_id] = segments
    return True

def ask_question(video_id: str, question: str):
    """
    Uses Gemini 3.8 Flash to answer questions grounded in the video transcript
    and cite exact timestamps.
    """
    segments = transcript_store.get(video_id, [])
    
    # Format context lines with timestamps
    context_lines = []
    for seg in segments:
        start_sec = int(seg.get("start", 0))
        m = start_sec // 60
        s = start_sec % 60
        ts_str = f"{m:02d}:{s:02d}"
        context_lines.append(f"[Time: {ts_str} | Seconds: {start_sec}]: {seg.get('text', '')}")
        
    context = "\n".join(context_lines)
    
    client = get_gemini_client()
    if client:
        try:
            prompt = f"""
You are an expert video Q&A assistant.
Answer the user's question accurately using ONLY the provided transcript snippets.
Each snippet is tagged with [Time: MM:SS | Seconds: X].

At the very end of your response, specify the single best timestamp in seconds where this topic is discussed:
TIMESTAMP_SECONDS: <integer seconds>

Transcript Context:
{context}

Question: {question}
"""
            response = client.models.generate_content(
                model=os.getenv("GEMINI_MODEL", "gemini-3-flash-preview"),
                contents=prompt
            )
            
            raw_text = response.text or ""
            
            # Extract timestamp
            timestamp = 0
            match = re.search(r"TIMESTAMP_SECONDS:\s*(\d+)", raw_text)
            if match:
                timestamp = int(match.group(1))
                clean_text = re.sub(r"TIMESTAMP_SECONDS:\s*\d+", "", raw_text).strip()
            else:
                clean_text = raw_text
                if segments:
                    timestamp = int(segments[0].get("start", 0))
                    
            return {
                "answer": clean_text,
                "timestamp": timestamp
            }
        except Exception as e:
            print(f"Gemini API error during Q&A: {e}")
            pass

    # Fallback to Groq
    try:
        from langchain_groq import ChatGroq
        from langchain_core.prompts import PromptTemplate
        llm = ChatGroq(model="qwen/qwen3.8-27b", temperature=0)
        
        best_timestamp = segments[0].get("start", 0) if segments else 0
        prompt = PromptTemplate(
            input_variables=["context", "question"],
            template="""
Answer the user's question using this transcript context:
{context}

Question: {question}
"""
        )
        chain = prompt | llm
        ans = chain.invoke({"context": context[:4000], "question": question})
        return {
            "answer": ans.content,
            "timestamp": int(best_timestamp)
        }
    except Exception as e:
        return {
            "answer": f"Error answering question: {e}",
            "timestamp": 0
        }
