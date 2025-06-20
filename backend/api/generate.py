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

@app.route("/generate", methods=["POST"])
def generate_image():
    print("Flask backend is running!")
    prompt = request.form.get("prompt")
    aspect_ratio = request.form.get("aspect_ratio", "1:1")  # default is square


    if not prompt:
        return jsonify({"error": "Missing prompt"}), 400

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Accept": "image/*"  
    }

    files = {
        "prompt": (None, prompt),
        "output_format": (None, "png"),
        "aspect_ratio": (None, aspect_ratio)

    }

    response = requests.post(
        "https://api.stability.ai/v2beta/stable-image/generate/core",
        headers=headers,
        files=files  
    )

    if response.status_code != 200:
        print("Stability API error:", response.text)
        return jsonify({"error": response.text}), response.status_code

    return response.content, 200, {"Content-Type": "image/png"}

