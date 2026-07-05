import io
from pypdf import PdfReader

def extract_text_from_pdf_bytes(file_bytes: bytes) -> dict:
    """
    Extracts text, counts pages, and computes word count from PDF binary data.
    """
    try:
        # Wrap bytes in a file-like object
        pdf_file = io.BytesIO(file_bytes)
        reader = PdfReader(pdf_file)
        
        page_count = len(reader.pages)
        full_text = []
        
        for page in reader.pages:
            text = page.extract_text()
            if text:
                full_text.append(text)
                
        compiled_text = "\n".join(full_text)
        word_count = len(compiled_text.split())
        
        return {
            "text": compiled_text,
            "pages": page_count,
            "word_count": word_count
        }
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        raise ValueError(f"Failed to parse PDF document: {str(e)}")
