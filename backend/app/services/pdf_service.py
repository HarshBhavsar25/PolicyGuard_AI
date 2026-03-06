import os
import PyPDF2

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts text from a given PDF file."""
    text = ""
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        raise e
    return text
