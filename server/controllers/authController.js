const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { bucket } = require('../firebaseAdmin');
const { Buffer } = require('buffer');

exports.signup = async (req, res) => {
  const { username, email, password, fullname, profilePicture, bio } = req.body;

  if (!username || !email || !password || !fullname) {
    return res.status(400).json({ error: 'All fields except profile picture and bio are required' });
  }

  let firebaseUrl = profilePicture || 'https://t3.ftcdn.net/jpg/05/66/32/22/360_F_566322207_Fa1DSykWMr5IjvNFFdgKapoCHJn36RgV.jpg';

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email is already in use' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username is already in use' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (profilePicture) {
      const base64EncodedImageString = profilePicture.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');

      const fileName = `profilePictures/${Date.now()}_${username}.jpg`;
      const blob = bucket.file(fileName);
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: { contentType: 'image/jpeg' },
      });

      blobStream.on('error', (err) => {
        console.error('Error uploading file to Firebase:', err);
        return res.status(500).json({ error: 'Failed to upload image' });
      });

      blobStream.on('finish', async () => {
        await blob.makePublic();
        firebaseUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

        const user = new User({
          username,
          email,
          password: hashedPassword,
          fullname,
          profilePicture: firebaseUrl,
          bio,
        });

        await user.save();
        return res.status(201).json({ message: 'User registered successfully', profilePicture: firebaseUrl });
      });

      blobStream.end(imageBuffer);
    } else {
      const user = new User({
        username,
        email,
        password: hashedPassword,
        fullname,
        profilePicture: firebaseUrl,
        bio,
      });

      await user.save();
      res.status(201).json({ message: 'User registered successfully', profilePicture: firebaseUrl });
    }
  } catch (error) {
    console.error('Error during signup process:', error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
      res.json({ token, username: user.username, theme: user.theme });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  };   
