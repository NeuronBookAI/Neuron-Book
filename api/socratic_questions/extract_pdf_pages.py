"""
Extract pages from PDF and upload to Sanity.
Usage: python extract_pdf_pages.py <textbook_id>
"""
import sys
import os
from dotenv import load_dotenv
import PyPDF2
from sanity import Client
import requests
import logging

load_dotenv()

logger = logging.getLogger(__name__)

SANITY_PROJECT_ID = os.getenv("SANITY_PROJECT_ID")
SANITY_DATASET = os.getenv("SANITY_DATASET")
SANITY_TOKEN = os.getenv("SANITY_WRITE_TOKEN")

sanity_client = Client(
    logger,
    project_id=SANITY_PROJECT_ID,
    dataset=SANITY_DATASET,
    token=SANITY_TOKEN,
    use_cdn=False
)


def get_pdf_path(textbook_id):
    """Get the PDF file path from Sanity textbook document."""
    result = sanity_client.query(
        f'*[_id == "{textbook_id}"][0]{{title, file}}'
    )
    
    if not result or 'result' not in result:
        print(f"Textbook {textbook_id} not found")
        return None, None
    
    doc = result['result']
    title = doc.get('title', 'Unknown')
    file_ref = doc.get('file', {}).get('asset', {}).get('_ref')
    
    if not file_ref:
        print("No PDF file found in textbook")
        return None, None
    
    # Get the actual file URL
    asset_result = sanity_client.query(
        f'*[_id == "{file_ref}"][0]{{url}}'
    )
    
    if not asset_result or 'result' not in asset_result:
        print("Could not fetch PDF asset")
        return None, None
    
    pdf_url = asset_result['result'].get('url')
    print(f"Found textbook: {title}")
    print(f"PDF URL: {pdf_url}")
    
    return title, pdf_url


def extract_pages_from_pdf(pdf_path, textbook_id, textbook_title):
    """Extract text from each page and upload to Sanity."""
    import requests
    
    # Download PDF if it's a URL
    if pdf_path.startswith('http'):
        response = requests.get(pdf_path)
        pdf_path = '/tmp/temp_textbook.pdf'
        with open(pdf_path, 'wb') as f:
            f.write(response.content)
    
    # Read PDF
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        total_pages = len(pdf_reader.pages)
        
        print(f"\nExtracting {total_pages} pages from '{textbook_title}'...")
        
        # Prepare mutations API endpoint
        url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/{SANITY_DATASET}"
        headers = {
            "Authorization": f"Bearer {SANITY_TOKEN}",
            "Content-Type": "application/json"
        }
        
        for page_num in range(total_pages):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            
            # Create page document using mutations API
            mutation = {
                "mutations": [
                    {
                        "create": {
                            "_type": "page",
                            "textbook": {
                                "_type": "reference",
                                "_ref": textbook_id
                            },
                            "pageNumber": page_num + 1,
                            "content": text,
                            "title": f"{textbook_title} - Page {page_num + 1}"
                        }
                    }
                ]
            }
            
            try:
                response = requests.post(url, json=mutation, headers=headers)
                response.raise_for_status()
                print(f"✓ Page {page_num + 1}/{total_pages} uploaded")
            except Exception as e:
                print(f"✗ Page {page_num + 1} failed: {e}")
        
        print(f"\n✓ Extraction complete! {total_pages} pages uploaded.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_pdf_pages.py <textbook_id>")
        print("\nExample:")
        print("  python extract_pdf_pages.py c3ad59b5-2dc2-41a8-9418-16c439b35758")
        sys.exit(1)
    
    textbook_id = sys.argv[1]
    
    title, pdf_url = get_pdf_path(textbook_id)
    if pdf_url:
        extract_pages_from_pdf(pdf_url, textbook_id, title)