const { HfInference } = require('@huggingface/inference');
const inference = new HfInference(process.env.HUGGINGFACE_API_KEY);
const jwt = require('jsonwebtoken');
const Image = require('../models/Image');
const Post = require('../models/Post');
const User = require('../models/User');

exports.generateImage = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const inference = new HfInference(process.env.HUGGINGFACE_API_KEY);

    const seed = Math.floor(Math.random() * 100000);

    const result = await inference.textToImage({
      model: 'stabilityai/stable-diffusion-2',
      inputs: prompt,
      parameters: {
        negative_prompt: 'blurry',
        height: 512,
        width: 512,
        num_inference_steps: 50,
        seed: seed,
      },
    });

    if (result) {
      const base64Image = Buffer.from(await result.arrayBuffer()).toString('base64');
      const imageUrl = `data:image/png;base64,${base64Image}`;

      const fetch = (await import('node-fetch')).default;
      const embeddingResponse = await fetch(`${process.env.FLASK_SERVER_URL}/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: prompt }),
      });

      if (!embeddingResponse.ok) {
        throw new Error('Failed to get embedding from Flask service');
      }

      const embedding = await embeddingResponse.json();

      res.status(200).json({ image: imageUrl, embedding });
    } else {
      res.status(500).json({ error: 'Failed to generate image' });
    }
  } catch (error) {
    console.error('Error generating image:', error.message);
    res.status(500).json({ error: 'Error generating image' });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const favoriteUrls = user.favorites;

    const favoriteImages = await Image.find({ image: { $in: favoriteUrls } });

    const favoritesWithEmbeddings = favoriteImages.map(image => ({
      prompt: image.prompt,
      image: image.image,
      embedding: image.embedding
    }));

    res.json({ favorites: favoritesWithEmbeddings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
};  

exports.saveFavorite = async (req, res) => {
  const { image, prompt, embedding } = req.body;
  const { authorization } = req.headers;

  try {
    const decoded = jwt.verify(authorization, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const isFavorite = user.favorites.includes(image);
    if (isFavorite) {
      return res.status(400).json({ error: 'Image is already a favorite' });
    }

    const newImage = new Image({
      prompt,
      image,
      embedding,
      user: user._id,
    });
    await newImage.save();

    user.favorites.push(image);
    await user.save();

    res.status(200).json({ message: 'Favorite saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};    

exports.unfavorite = async (req, res) => {
  const { image } = req.body;
  const { authorization } = req.headers;

  try {
    const decoded = jwt.verify(authorization, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const favoriteIndex = user.favorites.indexOf(image);
    if (favoriteIndex === -1) {
      return res.status(400).json({ error: 'Image is not a favorite' });
    }

    user.favorites.splice(favoriteIndex, 1);
    await user.save();

    const imageDocument = await Image.findOne({ image }); 

    if (!imageDocument) {
      return res.status(400).json({ error: 'Image not found in the database' });
    }

    const otherUsers = await User.find({ favorites: image });

    const imageInPosts = await Post.findOne({ image: imageDocument._id });

    if (otherUsers.length === 0 && !imageInPosts) {
      await Image.findByIdAndDelete(imageDocument._id);
    }

    res.status(200).json({ message: 'Image unfavorited successfully and removed from database if not used elsewhere' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 