const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Follower = require('../models/Follower');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const Repost = require('../models/Repost');
const Notification = require('../models/Notification');
const { bucket } = require('../firebaseAdmin');
const { Buffer } = require('buffer');

exports.getProfile = async (req, res) => {
  try {
      const user = await User.findById(req.userId)
          .select('fullname username email profilePicture bio theme posts');

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      const postCount = user.posts.length;

      res.json({
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          bio: user.bio,
          theme: user.theme,
          postCount,
      });
  } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

  exports.getUserProfileByUsername = async (req, res) => {
    const { username } = req.params;
    const loggedInUserId = req.userId;
  
    try {
      const user = await User.findOne({ username })
        .select('fullname username profilePicture posts bio blockedUsers')
        .populate({
          path: 'posts',
          populate: {
            path: 'image',
            model: 'Image',
            select: 'image',
          },
        });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const loggedInUser = await User.findById(loggedInUserId).select('blockedUsers');
      
      const isBlocked = 
        user.blockedUsers.includes(loggedInUserId) || 
        loggedInUser.blockedUsers.includes(user._id);
  
      if (isBlocked) {
        return res.json({
          user: {
            username: user.username,
            fullname: user.fullname,
            profilePicture: user.profilePicture,
            bio: user.bio,
          },
          reposts: [],
          isBlocked: true,
        });
      }
  
      const reposts = await Repost.find({ user: user._id })
        .populate({
          path: 'post',
          populate: {
            path: 'image',
            model: 'Image',
            select: 'image',
          },
        });
  
      res.json({ user, reposts, isBlocked });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  };
  

  exports.updateProfile = async (req, res) => {
    const { fullname, profilePicture, username, email, bio } = req.body;
  
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const updates = {};
  
      if (username && username !== user.username) {
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
          return res.status(400).json({ error: 'Username already taken' });
        }
        updates.username = username;
      }
  
      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ error: 'Email already in use' });
        }
        updates.email = email;
      }
  
      if (fullname && fullname !== user.fullname) {
        updates.fullname = fullname;
      }
  
      if (bio && bio !== user.bio) {
        updates.bio = bio;
      }
  
      if (profilePicture && profilePicture.startsWith('data:image')) {
        const base64EncodedImageString = profilePicture.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');
  
        const fileName = `profilePictures/${Date.now()}_${username}.jpg`;
        const blob = bucket.file(fileName);
  
        const blobStream = blob.createWriteStream({
          resumable: false,
          metadata: {
            contentType: 'image/jpeg',
          },
        });
  
        blobStream.on('error', (err) => {
          console.error('Error uploading file to Firebase:', err);
          return res.status(500).json({ error: 'Failed to upload image' });
        });
  
        blobStream.on('finish', async () => {
          await blob.makePublic();
  
          const firebaseUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
  
          updates.profilePicture = firebaseUrl;
  
          Object.assign(user, updates);
          await user.save();
  
          res.status(200).json({
            message: 'Profile updated successfully',
            profilePicture: firebaseUrl,
            updates,
          });
        });
        
        blobStream.end(imageBuffer);
      } else {
        Object.assign(user, updates);
        await user.save();
        res.status(200).json({
          message: 'Profile updated successfully',
          updates,
        });
      }
    } catch (error) {
      console.error('Error during profile update:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  };
  
  exports.updateUsername = async (req, res) => {
    const { username } = req.body;
  
    if (!username || username.length < 3 || username.length > 18) {
        return res.status(400).json({ error: 'Username must be between 3 and 18 characters' });
    }
  
    if (!/^[a-zA-Z]/.test(username)) {
        return res.status(400).json({ error: 'Username must start with a letter' });
    }
  
    if (/\s/.test(username)) {
        return res.status(400).json({ error: 'Username cannot contain spaces' });
    }
  
    if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
        return res.status(400).json({ error: 'Username can only contain letters, numbers, underscores, and full stops.' });
    }
  
    if (/_{2,}/.test(username) || /\.(?=\.)/.test(username)) {
        return res.status(400).json({ error: 'Username cannot contain consecutive underscores or full stops.' });
    }
  
    if (!/[a-zA-Z]/.test(username)) {
        return res.status(400).json({ error: 'Username must contain at least one letter' });
    }
  
    try {
        const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
        if (user) {
            return res.status(409).json({ error: 'Username already taken' });
        }
  
        res.status(200).json({ message: 'Username available' });
    } catch (error) {
        console.error('Error checking username:', error);
        res.status(500).json({ error: 'Server error' });
    }
  };
  
  exports.updateEmail = async (req, res) => {
    const { email } = req.body;
  
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
  
    try {
      const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
      if (user) {
        return res.status(409).json({ error: 'Email already in use' });
      }
  
      res.status(200).json({ message: 'Email available' });
    } catch (error) {
      console.error('Error checking email:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
  
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Incorrect old password' });
      }
  
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
  
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update password' });
    }
  };

  exports.blockUser = async (req, res) => {
    const { username } = req.params;
    const { authorization } = req.headers;
  
    try {
      const decoded = jwt.verify(authorization, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      const userToBlock = await User.findOne({ username });
  
      if (!user || !userToBlock) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      await Follower.deleteMany({
        $or: [
          { followerId: user._id, followingId: userToBlock._id },
          { followerId: userToBlock._id, followingId: user._id }
        ]
      });
  
      await Like.deleteMany({
        $or: [
          { user: user._id, post: { $in: userToBlock.posts } },
          { user: userToBlock._id, post: { $in: user.posts } }
        ]
      });
  
      await Comment.deleteMany({
        $or: [
          { user: user._id, post: { $in: userToBlock.posts } },
          { user: userToBlock._id, post: { $in: user.posts } }
        ]
      });
  
      await Repost.deleteMany({
        $or: [
          { user: user._id, post: { $in: userToBlock.posts } },
          { user: userToBlock._id, post: { $in: user.posts } }
        ]
      });
  
      await Comment.updateMany(
        { mentions: { $in: [user._id, userToBlock._id] } },
        { $pull: { mentions: { $in: [user._id, userToBlock._id] } } }
      );
  
      await Notification.deleteMany({
        $or: [
          { user: user._id, fromUser: userToBlock._id },
          { user: userToBlock._id, fromUser: user._id }
        ]
      });
  
      if (!user.blockedUsers.includes(userToBlock._id)) {
        user.blockedUsers.push(userToBlock._id);
        await user.save();
      }
  
      if (!userToBlock.blockedBy.includes(user._id)) {
        userToBlock.blockedBy.push(user._id);
        await userToBlock.save();
      }
  
      res.status(200).json({ message: 'User blocked successfully' });
    } catch (error) {
      console.error('Error blocking user:', error);
      res.status(500).json({ error: 'Failed to block user' });
    }
  };
  
  exports.unblockUser = async (req, res) => {
    const { username } = req.params;
    const { authorization } = req.headers;
  
    try {
      const decoded = jwt.verify(authorization, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      const userToUnblock = await User.findOne({ username });
  
      if (!user || !userToUnblock) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      user.blockedUsers = user.blockedUsers.filter(
        (blockedUserId) => !blockedUserId.equals(userToUnblock._id)
      );
      await user.save();
  
      userToUnblock.blockedBy = userToUnblock.blockedBy.filter(
        (blockedById) => !blockedById.equals(user._id)
      );
      await userToUnblock.save();
  
      res.status(200).json({ message: 'User unblocked successfully' });
    } catch (error) {
      console.error('Error unblocking user:', error);
      res.status(500).json({ error: 'Failed to unblock user' });
    }
  };
  
  exports.getBlockedUsers = async (req, res) => {
    const { authorization } = req.headers;
  
    try {
      const decoded = jwt.verify(authorization, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId)
        .populate('blockedUsers', 'username profilePicture fullname')
        .populate('blockedBy', 'username profilePicture fullname');
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json({ 
        blockedUsers: user.blockedUsers, 
        blockedByUsers: user.blockedBy 
      });
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      res.status(500).json({ error: 'Failed to fetch blocked users' });
    }
  };

  exports.updateTheme = async (req, res) => {
    const { theme } = req.body;
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      user.theme = theme;
      await user.save();
      res.json({ message: 'Theme updated successfully', theme: user.theme });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update theme' });
    }
  };    

  exports.getNotifications = async (req, res) => {
    const { authorization } = req.headers;
    const { page = 1, limit = 10 } = req.query;
  
    try {
      const decoded = jwt.verify(authorization, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
  
      if (!user) return res.status(401).json({ error: 'User not found' });
  
      const notifications = await Notification.find({ user: user._id })
        .populate('fromUser', 'username profilePicture fullname')
        .populate({
          path: 'post',
          populate: { path: 'image', model: 'Image', select: 'image' },
        })
        .populate('comment', 'content')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
  
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  };