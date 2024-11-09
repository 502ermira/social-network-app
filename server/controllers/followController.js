const User = require('../models/User');
const Follower = require('../models/Follower');
const Notification = require('../models/Notification');
const { sendNotification } = require('../services/notificationService');

exports.followUser = async (req, res) => {
    const { userId: followerId } = req;
    const { username } = req.params;
  
    try {
      const followingUser = await User.findOne({ username });
      if (!followingUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const alreadyFollowing = await Follower.findOne({
        followerId,
        followingId: followingUser._id,
      });
  
      if (alreadyFollowing) {
        return res.status(400).json({ error: 'You are already following this user' });
      }
  
      const newFollow = new Follower({
        followerId,
        followingId: followingUser._id,
      });
      await newFollow.save();
  
      await Notification.deleteMany({
        user: followingUser._id,
        fromUser: followerId,
        type: 'follow',
      });
  
      const followerUser = await User.findById(followerId);
  
      const notification = new Notification({
        user: followingUser._id,
        fromUser: followerId,
        message: `${followerUser.username} started following you`,
        type: 'follow',
      });
      await notification.save();
  
      const populatedNotification = await Notification.findById(notification._id)
        .populate('fromUser', 'username profilePicture fullname')
        .exec();  
  
      if (populatedNotification) {
        sendNotification(followingUser.username, {
          message: populatedNotification.message,
          type: 'follow',
          fromUser: populatedNotification.fromUser,
          createdAt: populatedNotification.createdAt,
        });
      }
  
      res.status(200).json({ message: 'Followed successfully' });
    } catch (error) {
      console.error('Error following user:', error);
      res.status(500).json({ error: 'Failed to follow user' });
    }
  };

  exports.getFollowCount = async (req, res) => {
    const { username } = req.params;
  
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const followCount = await Follower.countDocuments({ followingId: user._id });
      res.json({ followCount });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch follow count' });
    }
  };
  
  exports.getFollowersAndFollowing = async (req, res) => {
    const { username } = req.params;
  
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const followers = await Follower.find({ followingId: user._id }).populate('followerId', 'username fullname profilePicture');
      const following = await Follower.find({ followerId: user._id }).populate('followingId', 'username fullname profilePicture');
  
      const blockedUsers = await User.findById(user._id).select('blockedUsers');
  
      const blockedByUsers = await User.find({ blockedUsers: user._id }).select('username');
  
      res.json({ 
        followers, 
        following, 
        blockedUsers: blockedUsers?.blockedUsers || [], 
        blockedByUsers: blockedByUsers || []
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch followers/following' });
    }
  };
  
  exports.unfollowUser = async (req, res) => {
    const { userId: followerId } = req;
    const { username } = req.params;
  
    try {
      const followingUser = await User.findOne({ username });
      if (!followingUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const followRecord = await Follower.findOneAndDelete({
        followerId,
        followingId: followingUser._id,
      });
  
      if (!followRecord) {
        return res.status(400).json({ error: 'You are not following this user' });
      }
  
       await Notification.deleteMany({
        user: followingUser._id,
        fromUser: followerId,
        type: 'follow',
      });
  
      res.status(200).json({ message: 'Unfollowed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to unfollow user' });
    }
  };