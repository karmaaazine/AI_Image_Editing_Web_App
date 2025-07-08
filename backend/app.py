import os
import requests
from flask import Flask, request, send_file
from dotenv import load_dotenv
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
STABILITY_API_KEY = os.getenv('STABILITY_API_KEY')

# Validate API key on startup
if not STABILITY_API_KEY:
    raise ValueError("STABILITY_API_KEY not found in environment variables")

@app.route('/', methods=['GET'])
def index():
    return "Inpainting API is running!"

@app.route('/inpaint', methods=['POST'])
def inpaint():
    try:
        # Validate request contents
        if 'image' not in request.files:
            return {'error': 'No image file provided'}, 400
        if 'mask' not in request.files:
            return {'error': 'No mask file provided'}, 400
        if 'prompt' not in request.form:
            return {'error': 'No prompt provided'}, 400

        # Get files and prompt from request
        image = request.files['image']
        mask = request.files['mask']
        prompt = request.form['prompt']

        # Validate file types
        allowed_extensions = {'png', 'jpg', 'jpeg', 'webp'}
        if not allowed_file(image.filename, allowed_extensions):
            return {'error': 'Invalid image file type'}, 400
        if not allowed_file(mask.filename, allowed_extensions):
            return {'error': 'Invalid mask file type'}, 400

        # Prepare the payload
        payload = {
            'image': ('image.png', image.stream, 'image/png'),
            'mask': ('mask.png', mask.stream, 'image/png'),
            'prompt': prompt,
            'output_format': 'webp'
        }

        logger.info(f"Making request to Stability AI with prompt: {prompt}")

        # Make request to Stability AI
        response = requests.post(
            'https://api.stability.ai/v2beta/stable-image/edit/inpaint',
            files=payload,
            headers={
                'Authorization': f'Bearer {STABILITY_API_KEY}',
                'Accept': 'image/*'
            },
            timeout=30  # Add timeout to prevent hanging
        )

        if response.status_code == 200:
            logger.info("Successfully received response from Stability AI")
            return response.content, 200, {'Content-Type': 'image/webp'}
        else:
            error_message = f"Stability AI Error: {response.status_code}"
            try:
                error_message += f" - {response.json()}"
            except:
                pass
            logger.error(error_message)
            return {'error': error_message}, response.status_code

    except requests.exceptions.Timeout:
        logger.error("Request to Stability AI timed out")
        return {'error': 'Request timed out'}, 504
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        return {'error': 'Failed to communicate with Stability AI'}, 502
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {'error': str(e)}, 500

def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'healthy', 'api_key_configured': bool(STABILITY_API_KEY)}

if __name__ == '__main__':
    # Use environment variables for host and port if available
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
