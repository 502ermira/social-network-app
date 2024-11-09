const User = require('../models/User');
const Post = require('../models/Post');
const Search = require('../models/Search');

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
  
      const response = await fetch(`${process.env.FLASK_SERVER_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
  
      if (!response.ok) {
        throw new Error('Search failed with status ' + response.status);
      }
  
      const data = await response.json();
      const postIds = data.results.map(result => result.id);
  
      const posts = await Post.find({ _id: { $in: postIds } })
        .populate('image')
        .populate('user', 'username profilePicture');
        
      const sortedPosts = postIds.map(id => 
        posts.find(post => post._id.toString() === id)
      );
  
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