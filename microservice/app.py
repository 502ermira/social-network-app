import os
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util
from pymongo import MongoClient
import numpy as np
import torch
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Load the pre-trained SBERT model
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)

try:
    client.admin.command('ping') 
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")

db = client['art_generator']
post_collection = db['posts']

def get_similarities(query_embedding, skip=0, limit=None):
    # Fetch posts with their associated images and embeddings
    pipeline = [
        {
            '$lookup': {
                'from': 'images',
                'localField': 'image',
                'foreignField': '_id',
                'as': 'imageData'
            }
        },
        {
            '$unwind': '$imageData'
        },
        {
            '$project': {
                'imageData.prompt': 1,
                'imageData.embedding': 1
            }
        }
    ]
    
    if skip:
        pipeline.append({'$skip': skip})
    if limit:
        pipeline.append({'$limit': limit})

    post_docs = post_collection.aggregate(pipeline)

    # Calculate cosine similarity
    similarities = []
    for doc in post_docs:
        if 'embedding' not in doc['imageData']:
            continue
        
        prompt_embedding = np.array(doc['imageData']['embedding'], dtype=np.float32)
        prompt_embedding_tensor = torch.tensor(prompt_embedding, dtype=torch.float32)
        
        similarity_score = util.pytorch_cos_sim(query_embedding, prompt_embedding_tensor).item()
        similarities.append((doc['_id'], doc['imageData']['prompt'], similarity_score))

    # Sort by similarity score
    similarities = sorted(similarities, key=lambda x: x[2], reverse=True)
    return similarities

# Search API endpoint
@app.route('/search', methods=['POST'])
def search():
    query = request.json.get('query')
    if not query:
        return jsonify({'error': 'No query provided'}), 400

    # Convert search query to embedding
    query_embedding = model.encode(query, convert_to_tensor=True).to(torch.float32)

    similarities = get_similarities(query_embedding)

    # Return top 50 results
    results = [{'id': str(sim[0]), 'prompt': sim[1], 'score': sim[2]} for sim in similarities[:50]]

    return jsonify({'results': results}), 200

# Search API endpoint with pagination
@app.route('/search-pagination', methods=['POST'])
def searchPaginaton():
    query = request.json.get('query')
    page = request.json.get('page', 1)
    limit = request.json.get('limit', 10)

    if not query:
        return jsonify({'error': 'No query provided'}), 400

    # Convert search query to embedding
    query_embedding = model.encode(query, convert_to_tensor=True).to(torch.float32)

    # Calculate how many posts to skip for pagination
    skip = (page - 1) * limit

    similarities = get_similarities(query_embedding, skip, limit)

    # Return results
    results = [{'id': str(sim[0]), 'prompt': sim[1], 'score': sim[2]} for sim in similarities]

    return jsonify({'results': results, 'page': page, 'limit': limit}), 200

# Embed API endpoint
@app.route('/embed', methods=['POST'])
def embed():
    sentence = request.json.get('sentence')
    if not sentence:
        return jsonify({'error': 'No sentence provided'}), 400

    # Compute the embedding
    embedding = model.encode(sentence).tolist()
    return jsonify(embedding), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)