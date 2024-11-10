import os
import base64 
from flask import Flask, request, jsonify
from PIL import Image
import requests
from io import BytesIO
import torch
from transformers import CLIPProcessor, CLIPModel
from pymongo import MongoClient
import numpy as np
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Load the CLIP model and processor
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)

try:
    client.admin.command('ping') 
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")

db = client['er-link']
post_collection = db['posts']

@app.route('/embed-image', methods=['POST'])
def embed_image():
    image_data = request.json.get('image')
    
    if not image_data:
        print("Error: No image data provided")
        return jsonify({'error': 'No image provided'}), 400

    # Convert base64 image to a PIL image
    try:
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        image = Image.open(BytesIO(base64.b64decode(image_data)))
        print("Image successfully decoded")
    except Exception as e:
        print("Error decoding image data:", e)
        return jsonify({'error': 'Invalid image data'}), 400

    # Preprocess the image for CLIP and generate embeddings
    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        image_embedding = model.get_image_features(**inputs).squeeze().tolist()
    
    return jsonify(image_embedding), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)