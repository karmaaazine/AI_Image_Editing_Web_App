import os
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()
app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("STABILITY_API_KEY")
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "image/*",  # or "application/json" if you want base64
    "Content-Type": "application/json"
}

@app.route("/erase_direct_upload", methods=["POST"])
def erase_direct_upload():
    prompt = request.form.get("prompt")
    image_file = request.files.get("image")
    mask_file = request.files.get("mask")

    if not image_file or not mask_file:
        return jsonify({"error": "Image and mask files are required"}), 400

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Accept": "image/*"
    }

    files = {
        "image": image_file,
        "mask": mask_file,
        "prompt": (None, prompt if prompt else ""),  # prompt can be empty
        "output_format": (None, "png")
    }

    response = requests.post(
        "https://api.stability.ai/v2beta/stable-image/edit/erase",
        headers=headers,
        files=files
    )

    if response.status_code == 200:
        return response.content, 200, {"Content-Type": "image/png"}
    else:
        return jsonify({"error": response.text}), response.status_code



