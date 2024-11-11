const User = require('../models/User');
const Post = require('../models/Post');
const Search = require('../models/Search');
const mongoose = require('mongoose');

exports.searchUsers = async (req, res) => {
    const { searchQuery } = req.query;
    const userId = req.userId;
  
    if (!searchQuery) {
      return res.status(400).json({ error: 'Search query is required' });
    }
  
    try {
      const users = await User.find({
        $or: [
          { username: { $regex: searchQuery, $options: 'i' } },
          { fullname: { $regex: searchQuery, $options: 'i' } }
        ]
      }).select('username fullname profilePicture');
  
      if (userId) {
        await Search.create({ user: userId, query: searchQuery, type: 'users' });
      }
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search users' });
    }
  };

  exports.searchImages = async (req, res) => {
    const { query } = req.body;
    const userId = req.userId;
  
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
  
    try {
      const fetch = (await import('node-fetch')).default;
  
      const embeddingResponse = await fetch(`${process.env.FLASK_SERVER_URL}/embed-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query }),
      });
  
      if (!embeddingResponse.ok) {
        throw new Error('Failed to get embedding for query');
      }
  
      const embedding = await embeddingResponse.json();
  
      const searchResponse = await fetch(`${process.env.FLASK_SERVER_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embedding }),
      });
  
      if (!searchResponse.ok) {
        throw new Error('Search failed with status ' + searchResponse.status);
      }
  
      const data = await searchResponse.json();
      const imageIds = data.results.map(result => result.id);
  
      const objectIds = imageIds.map(id => new mongoose.Types.ObjectId(id));
  
      const posts = await Post.find({ image: { $in: objectIds } })
        .populate('image')
        .populate('user', 'username profilePicture');
  
      const sortedPosts = objectIds.map(id => posts.find(post => post.image._id.toString() === id.toString()));
  
      const results = sortedPosts.map(post => {
        if (!post || !post.image) {
          console.error('Post or image missing for post:', post);
          return null;
        }
  
        return {
          id: post.image._id,
          image: post.image.image,
          prompt: post.image.prompt,
          postId: post._id,
          username: post.user.username,
          profilePicture: post.user.profilePicture,
        };
      }).filter(post => post !== null);
  
      res.status(200).json({ results });
    } catch (error) {
      console.error('Search error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.suggestUsers = async (req, res) => {
    const { searchTerm } = req.query;
  
    try {
      const users = await User.find({ username: { $regex: `^${searchTerm}`, $options: 'i' } })
                              .limit(10)
                              .select('username fullname profilePicture');
      res.json(users);
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
      res.status(500).json({ error: 'Failed to fetch user suggestions' });
    }
  };