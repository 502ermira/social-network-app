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
post_collection = db['posts']
post_view_collection = db['postviews']
comment_collection = db['comments']
repost_collection = db['reposts']
like_collection = db['likes']
user_collection = db['users']

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

# Helper function to calculate engagement score
def get_engagement_score(post_id):
    try:
        # Fetch counts from the respective collections
        view_count = post_view_collection.count_documents({'post': ObjectId(post_id)})
        comment_count = comment_collection.count_documents({'post': ObjectId(post_id)})
        repost_count = repost_collection.count_documents({'post': ObjectId(post_id)})
        like_count = like_collection.count_documents({'post': ObjectId(post_id)})

        # Engagement score calculation
        engagement_score = like_count + view_count + (comment_count * 2) + (repost_count * 3)
        return engagement_score

    except Exception as e:
        print(f"Error fetching engagement scores for post {post_id}: {e}")
        return 0  # Default to 0 if there's an error

# Helper function to calculate relevance score
def get_relevance_score(post_image, query_embedding):
    if 'embedding' in post_image:
        image_embedding = np.array(post_image['embedding'], dtype=np.float32)
        return cosine_similarity([query_embedding], [image_embedding])[0][0]
    return 0

# Helper function to check if the user liked or reposted a post
def user_interactions(post_id, user_id):
    is_liked_by_user = like_collection.find_one({'post': ObjectId(post_id), 'user': ObjectId(user_id)}) is not None
    is_reposted_by_user = repost_collection.find_one({'post': ObjectId(post_id), 'user': ObjectId(user_id)}) is not None
    return is_liked_by_user, is_reposted_by_user

# Route to fetch popularized posts with pagination
@app.route('/explore', methods=['POST'])
def explore_posts():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    skip = (page - 1) * limit
    
    query_embedding = request.json.get('embedding', None)

    # Fetch posts from the database
    try:
        posts_cursor = post_collection.find().skip(skip).limit(limit)
        posts = list(posts_cursor)
        
        scored_posts = []
        for post in posts:
            # Calculate engagement score by querying the respective collections
            engagement_score = get_engagement_score(post['_id'])
            
            # Calculate relevance score if the query embedding is provided
            if query_embedding:
                post_image = image_collection.find_one({'_id': ObjectId(post['image'])})
                if post_image:
                    relevance_score = get_relevance_score(post_image, query_embedding)
                else:
                    relevance_score = 0
            else:
                relevance_score = 0

            # Final score is a weighted combination of engagement and relevance
            final_score = (engagement_score * 0.7) + (relevance_score * 0.3)
            scored_posts.append({'post': post, 'final_score': final_score})

        # Sort posts by final score in descending order
        scored_posts.sort(key=lambda x: x['final_score'], reverse=True)
        
        # Extract the posts to return
        response_data = [sp['post'] for sp in scored_posts]

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# Route to fetch relevant posts for home screen
@app.route('/home', methods=['GET'])
def get_relevant_posts():
    user_id = request.args.get('userId')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    skip = (page - 1) * limit

    try:
        # Fetch the user
        user = user_collection.find_one({'_id': ObjectId(user_id)}, {'blockedUsers': 1, 'blockedBy': 1})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        blocked_user_ids = user['blockedUsers'] + user['blockedBy']

        # Fetch the users this user is following
        following_cursor = follower_collection.find({'followerId': ObjectId(user_id)}, {'followingId': 1})
        followed_user_ids = [f['followingId'] for f in following_cursor]

        # Fetch posts from followed users, excluding blocked users
        followed_posts_cursor = post_collection.find({
            'user': {'$in': followed_user_ids, '$nin': blocked_user_ids}
        }).sort('sharedAt', -1).skip(skip).limit(limit // 2)
        followed_posts = list(followed_posts_cursor)

        # Fetch additional posts from users not followed and not blocked
        additional_posts_cursor = post_collection.find({
            'user': {'$nin': followed_user_ids + blocked_user_ids}
        }).sort('sharedAt', -1).skip(skip).limit(limit // 2)
        additional_posts = list(additional_posts_cursor)

        # Combine followed and additional posts
        all_posts = followed_posts + additional_posts

        scored_posts = []
        for post in all_posts:
            # Calculate engagement score
            engagement_score = get_engagement_score(post['_id'])

            # Calculate relevance score if query embedding is provided (this assumes relevance is based on embedding)
            query_embedding = request.json.get('embedding', None)
            if query_embedding:
                post_image = image_collection.find_one({'_id': ObjectId(post['image'])})
                if post_image:
                    relevance_score = get_relevance_score(post_image, query_embedding)
                else:
                    relevance_score = 0
            else:
                relevance_score = 0

            # Calculate recency score (more recent posts score higher)
            recency_score = (datetime.utcnow() - post['sharedAt']).total_seconds()

            # Check if the user has liked or reposted the post
            is_liked_by_user, is_reposted_by_user = user_interactions(post['_id'], user_id)

            # Total engagement counts for the post
            likes_count = like_collection.count_documents({'post': ObjectId(post['_id'])})
            comments_count = comment_collection.count_documents({'post': ObjectId(post['_id'])})
            reposts_count = repost_collection.count_documents({'post': ObjectId(post['_id'])})

            # Final score
            final_score = (engagement_score * 0.3) + (relevance_score * 0.5) - (recency_score * 0.2)

            # Append post data with interaction details and score
            scored_posts.append({
                'post': {
                    **post,
                    'likes': likes_count,
                    'comments': comments_count,
                    'reposts': reposts_count,
                    'isLikedByUser': is_liked_by_user,
                    'isRepostedByUser': is_reposted_by_user
                },
                'final_score': final_score
            })

        # Sort posts by final score
        scored_posts.sort(key=lambda x: x['final_score'], reverse=True)

        # Return the posts sorted by score
        return jsonify([sp['post'] for sp in scored_posts]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)