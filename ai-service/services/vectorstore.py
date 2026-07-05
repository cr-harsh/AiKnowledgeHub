import os
import shutil
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from services.embedding import get_embedding_model

def create_vector_store(text: str, user_id: str, document_id: str) -> tuple:
    """
    Splits text into chunks, computes sentence embeddings, and builds a FAISS index.
    Saves the index to 'vectors/{user_id}/{document_id}'.
    Returns the chunk count and index folder path.
    """
    if not text.strip():
        raise ValueError("Document contains no readable text.")

    # Split text into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(text)
    chunk_count = len(chunks)
    
    # Load embedding model and FAISS
    embeddings = get_embedding_model()
    db = FAISS.from_texts(chunks, embeddings)
    
    # Structure: vectors/userId/documentId
    vector_dir = os.path.join("vectors", str(user_id), str(document_id))
    os.makedirs(vector_dir, exist_ok=True)
    
    db.save_local(vector_dir)
    
    return chunk_count, vector_dir

def load_vector_store(user_id: str, document_id: str):
    """
    Loads the local FAISS vector index corresponding to a document.
    """
    vector_dir = os.path.join("vectors", str(user_id), str(document_id))
    
    if not os.path.exists(vector_dir):
        raise FileNotFoundError(f"Vector store index not found for document: {document_id}")
        
    embeddings = get_embedding_model()
    # allow_dangerous_deserialization=True is required to load local pickle-serialized FAISS files
    db = FAISS.load_local(vector_dir, embeddings, allow_dangerous_deserialization=True)
    return db

def delete_vector_store(user_id: str, document_id: str) -> bool:
    """
    Purges the folder containing the FAISS index.
    """
    vector_dir = os.path.join("vectors", str(user_id), str(document_id))
    if os.path.exists(vector_dir):
        try:
            shutil.rmtree(vector_dir)
            return True
        except Exception as e:
            print(f"Error purging FAISS vector store path {vector_dir}: {e}")
            return False
    return False
