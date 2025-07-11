import os
import requests
from flask import Flask, request, jsonify, send_file
from dotenv import load_dotenv
from flask_cors import CORS
import logging
from PIL import Image
import io

app = Flask(__name__)
# Update CORS configuration
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",  # Development
            "https://*.vercel.app",   # Vercel deployments
            # Add your production domain here
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "expose_headers": ["Content-Type"]
    }
})

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
STABILITY_API_KEY = os.getenv('STABILITY_API_KEY')

# Validate API key on startup
if not STABILITY_API_KEY:
    logger.warning("STABILITY_API_KEY not found in environment variables")
    # Don't raise an error, just log it

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

        image = request.files['image']
        mask = request.files['mask']
        prompt = request.form['prompt']

        # Validate and resize images if needed
        def process_image(file, max_size=(1024, 1024)):
            img = Image.open(file)
            
            # Convert to PNG if not already
            if img.format != 'PNG':
                img = img.convert('RGBA')
            
            # Resize if too large
            if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save to bytes
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)
            return img_byte_arr

        # Process both images
        image_data = process_image(image)
        mask_data = process_image(mask)

        # Make request to Stability AI with increased timeout
        response = requests.post(
            'https://api.stability.ai/v2beta/stable-image/edit/inpaint',
            headers={
                'Authorization': f'Bearer {STABILITY_API_KEY}',
                'Accept': 'image/png'
            },
            files={
                'image': ('image.png', image_data, 'image/png'),
                'mask': ('mask.png', mask_data, 'image/png')
            },
            data={
                'prompt': prompt
            },
            timeout=60  # 60 seconds timeout
        )

        if response.status_code == 200:
            return response.content, 200, {'Content-Type': 'image/png'}
        else:
            error_message = f"Stability AI Error: {response.status_code}"
            try:
                error_message += f" - {response.json()}"
            except:
                pass
            return {'error': error_message}, response.status_code

    except requests.exceptions.Timeout:
        return {'error': 'Request timed out. Please try again.'}, 504
    except Exception as e:
        return {'error': str(e)}, 500


@app.route('/generate', methods=['POST'])
def generate():
    try:
        # Validate request contents
        if 'prompt' not in request.form:
            return {'error': 'No prompt provided'}, 400

        # Get prompt and optional parameters
        prompt = request.form['prompt']
        aspect_ratio = request.form.get('aspect_ratio', '1:1')  # Default to square if not provided

        # Map aspect ratios to dimensions
        aspect_ratio_dimensions = {
            '1:1': {'width': 1024, 'height': 1024},
            '16:9': {'width': 1024, 'height': 576},
            '9:16': {'width': 576, 'height': 1024},
            '4:3': {'width': 1024, 'height': 768}
        }

        # Get dimensions based on aspect ratio
        dimensions = aspect_ratio_dimensions.get(aspect_ratio, {'width': 1024, 'height': 1024})

        logger.info(f"Making text-to-image request with prompt: {prompt}, aspect ratio: {aspect_ratio}")

        # Make request to Stability AI
        response = requests.post(
            "https://api.stability.ai/v2beta/stable-image/generate/ultra",
            headers={
                "Authorization": f"Bearer {STABILITY_API_KEY}",
                "Accept": "image/*"
            },
            files={"none": ''},
            data={
                "prompt": prompt,
                "output_format": "webp",
                "width": str(dimensions['width']),
                "height": str(dimensions['height']),
                "steps": "30",  # Optional: You can make these configurable
                "cfg_scale": "7",  # Optional: You can make these configurable
                "samples": "1"  # Number of images to generate
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

@app.route('/erase_direct_upload', methods=['POST'])
def erase():
    try:
        logger.info("Received erase request")
        
        if 'image' not in request.files:
            logger.error("No image file in request")
            return jsonify({'error': 'No image file provided'}), 400
            
        if 'mask' not in request.files:
            logger.error("No mask file in request")
            return jsonify({'error': 'No mask file provided'}), 400

        image = request.files['image']
        mask = request.files['mask']
        
        # Validate and resize images if needed
        def process_image(file, max_size=(1024, 1024)):
            img = Image.open(file)
            
            # Convert to PNG if not already
            if img.format != 'PNG':
                img = img.convert('RGBA')
            
            # Resize if too large
            if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save to bytes
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)
            return img_byte_arr

        # Process both images
        image_data = process_image(image)
        mask_data = process_image(mask)
        
        logger.info(f"Making request to Stability AI")
        
        response = requests.post(
            "https://api.stability.ai/v2beta/stable-image/edit/erase",
            headers={
                "Authorization": f"Bearer {STABILITY_API_KEY}",
                "Accept": "image/png"
            },
            files={
                "image": ("image.png", image_data, "image/png"),
                "mask": ("mask.png", mask_data, "image/png")
            },
            timeout=60  # 60 seconds timeout
        )
        
        logger.info(f"Stability AI response status: {response.status_code}")
        
        if response.status_code != 200:
            error_message = response.text
            logger.error(f"Error response: {error_message}")
            return jsonify({'error': error_message}), response.status_code

        return response.content, 200, {'Content-Type': 'image/png'}

    except requests.exceptions.Timeout:
        logger.error("Request to Stability AI timed out")
        return jsonify({'error': 'Request timed out'}), 504
    except Exception as e:
        logger.error(f"Error in erase endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/test-api-key', methods=['GET'])
def test_api_key():
    try:
        if not STABILITY_API_KEY:
            return jsonify({'error': 'API key not found'}), 500
            
        return jsonify({
            'status': 'ok',
            'message': 'API key is present',
            'key_starts_with': STABILITY_API_KEY[:5]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
