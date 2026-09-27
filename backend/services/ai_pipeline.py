from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Setup LLM (Groq Cloud API)
llm = ChatGroq(model="qwen/qwen3.8-27b", temperature=0)

# Setup Embeddings (HuggingFace Local)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

CHROMA_DB_DIR = "./chroma_db"

def generate_summary_and_notes(full_text: str):
    """Uses Ollama to generate a summary and structured notes."""
    prompt = PromptTemplate(
        input_variables=["text"],
        template="""
You are an expert assistant. Please read the following video transcript and provide:
1. A brief 2-3 sentence summary.
2. Key bullet point notes.

Transcript:
{text}

Format the output cleanly in markdown.
"""
    )
    
    chain = prompt | llm
    result = chain.invoke({"text": full_text})
    return result.content

def index_transcript_for_rag(video_id: str, segments: list):
    """
    Chunks the transcript segments and stores them in ChromaDB.
    We attach the start timestamp to each chunk's metadata.
    """
    documents = []
    # A segment from Whisper usually corresponds to a sentence or phrase.
    # We can group a few segments together or just index them individually.
    # For precise timestamps, indexing individually or combining 2-3 is best.
    
    current_chunk_text = ""
    start_time = 0
    
    for i, seg in enumerate(segments):
        # Very simplistic chunking: 1 segment = 1 document for exact timestamps
        doc = Document(
            page_content=seg["text"],
            metadata={
                "video_id": video_id,
                "start_time": seg["start"],
                "end_time": seg["end"]
            }
        )
        documents.append(doc)
        
    # Store in ChromaDB
    vectorstore = Chroma.from_documents(
        documents, 
        embedding=embeddings, 
        persist_directory=CHROMA_DB_DIR
    )
    return True

def ask_question(video_id: str, question: str):
    """
    Queries ChromaDB for the most relevant segments and asks Ollama.
    """
    vectorstore = Chroma(persist_directory=CHROMA_DB_DIR, embedding_function=embeddings)
    
    # Retrieve top 10 relevant segments for this specific video
    # Note: in a real app, we'd filter by video_id
    retriever = vectorstore.as_retriever(
        search_kwargs={
            "k": 10,
            "filter": {"video_id": video_id}
        }
    )
    
    relevant_docs = retriever.invoke(question)
    
    if not relevant_docs:
        return {"answer": "I couldn't find relevant information in the video.", "timestamp": 0}
        
    # Build context with timestamps
    context = ""
    # Sort docs by start_time to keep them chronological
    relevant_docs.sort(key=lambda x: x.metadata['start_time'])
    
    for doc in relevant_docs:
        context += f"[Timestamp: {doc.metadata['start_time']} seconds]: {doc.page_content}\n"
        
    # Best guess for the timestamp is the first returned document's start time (chronologically or highest relevance)
    best_timestamp = relevant_docs[0].metadata['start_time']
    
    prompt = PromptTemplate(
        input_variables=["context", "question"],
        template="""
You are a helpful assistant answering questions about a video.
Use ONLY the following context snippets (which include timestamps) to answer the user's question.
If the answer is not in the context, say "I don't know based on the video."

Context:
{context}

Question: {question}

Answer:
"""
    )
    
    chain = prompt | llm
    answer = chain.invoke({"context": context, "question": question})
    
    return {
        "answer": answer.content,
        "timestamp": int(best_timestamp)
    }
