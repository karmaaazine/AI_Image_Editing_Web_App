import os
import requests
from flask import Flask, request, send_file
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()
app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()
STABILITY_API_KEY = os.getenv('STABILITY_API_KEY')

@app.route('/inpaint', methods=['POST'])
def inpaint():
    try:
        # Get files and prompt from request
        image = request.files['image']
        mask = request.files['mask']
        prompt = request.form['prompt']

        # Prepare the payload
        payload = {
            'image': ('image.png', image.stream, 'image/png'),
            'mask': ('mask.png', mask.stream, 'image/png'),
            'prompt': prompt,
            'output_format': 'webp'
        }

        # Make request to Stability AI
        response = requests.post(
            'https://api.stability.ai/v2beta/stable-image/edit/inpaint',
            files=payload,
            headers={
                'Authorization': f'Bearer {STABILITY_API_KEY}',
                'Accept': 'image/*'
            }
        )

        if response.status_code == 200:
            # Return the image directly to frontend
            return response.content, 200, {'Content-Type': 'image/webp'}
        else:
            return {'error': f'API Error: {response.status_code}'}, response.status_code

    except Exception as e:
        return {'error': str(e)}, 500

if __name__ == '__main__':
    app.run(debug=True)
