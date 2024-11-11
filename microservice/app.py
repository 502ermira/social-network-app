import os
import base64
from flask import Flask, request, jsonify
from PIL import Image
from io import BytesIO
import torch
from transformers import CLIPProcessor, CLIPModel
from pymongo import MongoClient
import numpy as np
from dotenv import load_dotenv
from sklearn.metrics.pairwise import cosine_similarity

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
image_collection = db['images']

# Helper function to calculate cosine similarity
def calculate_cosine_similarity(embedding1, embedding2):
    return cosine_similarity([embedding1], [embedding2])[0][0]

@app.route('/embed-image', methods=['POST'])
def embed_image():
    image_data = request.json.get('image')
    
    if not image_data:
        return jsonify({'error': 'No image provided'}), 400

    # Convert base64 image to a PIL image
    try:
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        image = Image.open(BytesIO(base64.b64decode(image_data)))
    except Exception as e:
        return jsonify({'error': 'Invalid image data'}), 400

    # Preprocess the image for CLIP and generate embeddings
    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        image_embedding = model.get_image_features(**inputs).squeeze().tolist()
    
    return jsonify(image_embedding), 200

@app.route('/embed-text', methods=['POST'])
def embed_text():
    text = request.json.get('text')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    # Preprocess the text for embedding
    inputs = processor(text=[text], return_tensors="pt", padding=True, truncation=True)

    with torch.no_grad():
        text_embedding = model.get_text_features(**inputs).squeeze().tolist()

    return jsonify(text_embedding), 200

@app.route('/search', methods=['POST'])
def search():
    query_embedding = request.json.get('embedding')
    
    if not query_embedding:
        return jsonify({'error': 'No query embedding provided'}), 400

    # Convert the query embedding to a numpy array
    query_embedding = np.array(query_embedding, dtype=np.float32)

    # Check if the query embedding is valid (non-empty)
    if query_embedding.size == 0:
        return jsonify({'error': 'Query embedding is invalid'}), 400

    # Fetch all images and their embeddings from the database
    image_docs = image_collection.find({}, {'embedding': 1})

    similarities = []
    for doc in image_docs:
        # Skip documents without an embedding
        if 'embedding' not in doc:
            print(f"Document with ID {doc['_id']} is missing 'embedding'")
            continue

        image_embedding = np.array(doc['embedding'], dtype=np.float32)

        # Skip if the image embedding is empty
        if image_embedding.size == 0:
            print(f"Document with ID {doc['_id']} has an empty embedding")
            continue

        # Calculate cosine similarity
        similarity_score = calculate_cosine_similarity(query_embedding, image_embedding)
        similarities.append((doc['_id'], similarity_score))

    # Sort results by similarity score in descending order
    similarities = sorted(similarities, key=lambda x: x[1], reverse=True)

    # Return top 50 results
    results = [{'id': str(sim[0]), 'score': float(sim[1])} for sim in similarities[:50]]

    return jsonify({'results': results}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)