const Post = require('../models/Post');
const Follower = require('../models/Follower');
const PostView = require('../models/PostView');
const User = require('../models/User');
const Image = require('../models/Image');
const Repost = require('../models/Repost');
const Comment = require('../models/Comment');
const Search = require('../models/Search');
const Like = require('../models/Like');
const Notification = require('../models/Notification');
const { sendNotification } = require('../services/notificationService');
const jwt = require('jsonwebtoken');

exports.getRelevantPosts = async (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const user = await User.findById(userId).select('blockedUsers blockedBy');
    const blockedUserIds = user.blockedUsers.concat(user.blockedBy);

    const following = await Follower.find({ followerId: userId }).select('followingId');
    const followedUserIds = following.map(f => f.followingId);

    const followedPosts = await Post.find({ 
        user: { $in: followedUserIds, $nin: blockedUserIds }
      })
      .populate('user')
      .populate('image')
      .sort({ sharedAt: -1 })
      .skip(skip)
      .limit(limit / 2); 

    const additionalPosts = await Post.find({
      user: { $nin: followedUserIds.concat(blockedUserIds) }
    })
      .populate('user')
      .populate('image')
      .sort({ sharedAt: -1 })
      .skip(skip)
      .limit(limit / 2); 

    const allPosts = [...followedPosts, ...additionalPosts];

    const scoredPosts = await Promise.all(
      allPosts.map(async (post) => {
        const engagementScore = await getEngagementScore(post._id);

        let relevanceScore;
        try {
          relevanceScore = await getRelevanceScore(post, userId);
        } catch (error) {
          console.error(`Failed to fetch relevance score for user ${userId}:`, error);
          relevanceScore = 0;
        }

        const recencyScore = new Date() - post.sharedAt;

        const likesCount = await Like.countDocuments({ post: post._id });
        const commentsCount = await Comment.countDocuments({ post: post._id });
        const repostsCount = await Repost.countDocuments({ post: post._id });

        const isLikedByUser = await Like.exists({ post: post._id, user: userId });
        const isRepostedByUser = await Repost.exists({ post: post._id, user: userId });

        const finalScore = (engagementScore * 0.3) + (relevanceScore * 0.5) - (recencyScore * 0.2);

        return {
          post: {
            ...post.toObject(),
            likes: likesCount,
            comments: commentsCount,
            reposts: repostsCount,
            isLikedByUser,
            isRepostedByUser
          },
          finalScore
        };
      })
    );

    scoredPosts.sort((a, b) => b.finalScore - a.finalScore);
    return res.json(scoredPosts.map(sp => sp.post));
  } catch (error) {
    console.error('Error fetching relevant posts:', error);
    return res.status(500).json({ error: 'Unable to get posts.' });
  }
};

exports.getPopularizedPosts = async (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const user = await User.findById(userId).select('blockedUsers blockedBy');
    const blockedUserIds = user.blockedUsers.concat(user.blockedBy);

    const following = await Follower.find({ followerId: userId }).select('followingId');
    const followedUserIds = following.map(f => f.followingId);

    const popularPosts = await Post.find({ 
      user: { $nin: [...followedUserIds, userId, ...blockedUserIds] } 
    })
      .populate('user')
      .populate('image')
      .sort({ sharedAt: -1 })
      .skip(skip)
      .limit(limit);

    const scoredPosts = await Promise.all(
      popularPosts.map(async (post) => {
        const engagementScore = await getEngagementScore(post._id);
        const recencyScore = new Date() - post.sharedAt;

        const finalScore = (engagementScore * 0.7) - (recencyScore * 0.3);
        return { post, finalScore };
      })
    );

    scoredPosts.sort((a, b) => b.finalScore - a.finalScore);

    return res.json(scoredPosts.map(sp => sp.post));
  } catch (error) {
    console.error('Error fetching popularized posts:', error);
    return res.status(500).json({ error: 'Unable to get posts.' });
  }
};

const getEngagementScore = async (postId) => {
  const viewCount = await PostView.countDocuments({ post: postId });
  const commentCount = await Comment.countDocuments({ post: postId });
  const repostCount = await Repost.countDocuments({ post: postId });
  const likeCount = await Like.countDocuments({ post: postId });
  return likeCount + viewCount + (commentCount * 2) + (repostCount * 3);
}

const getRelevanceScore = async (post, userId) => {
  const fetch = (await import('node-fetch')).default;

  const userRecentSearch = await Search.findOne({ user: userId }).sort({ timestamp: -1 });

  if (!userRecentSearch) {
    console.warn(`No search history found for user ${userId}. Assigning default relevance score.`);
    return 0;
  }

  const query = userRecentSearch ? userRecentSearch.query : post.description;

  try {
    const response = await fetch(`${process.env.FLASK_SERVER_URL}/search-pagination`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch relevance score from microservice');
    }

    const searchResults = await response.json();
    const isRelevant = searchResults.results.some(result => result.id === post.image._id.toString());

    return isRelevant ? 10 : 0;

  } catch (error) {
    console.error(`Error fetching relevance score: ${error.message}`);
    
    const postDescription = post.description.toLowerCase();
    const relevanceFallback = query.toLowerCase().split(' ').some(keyword => postDescription.includes(keyword)) ? 5 : 0;

    return relevanceFallback;
  }
};

exports.deletePost = async (req, res) => {
  const { postId } = req.params;
  const { authorization } = req.headers;

  try {
    const decoded = jwt.verify(authorization, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user.toString() !== userId) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await Comment.deleteMany({ post: postId });
    await Like.deleteMany({ post: postId });
    await Repost.deleteMany({ post: postId });
    await PostView.deleteMany({ post: postId });
    await Notification.deleteMany({ post: postId });
    await User.updateMany({ posts: postId }, { $pull: { posts: postId } });
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: 'Post and related data deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

exports.postImage = async (req, res) => {
  const { image, description } = req.body;
  const { authorization } = req.headers;

  try {
    const decoded = jwt.verify(authorization, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      console.error("User not found");
      return res.status(401).json({ error: 'User not found' });
    }

    const newImage = new Image({ image, user: user._id });
    await newImage.save();

    const fetch = (await import('node-fetch')).default;

    const embeddingResponse = await fetch(`${process.env.FLASK_SERVER_URL}/embed-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: image }),
    });
    

    if (!embeddingResponse.ok) {
      console.error("Failed to get embedding from Flask service");
      throw new Error('Failed to get image embedding from Flask service');
    }

    const embedding = await embeddingResponse.json();
    console.log("Received embedding from Flask:", embedding);

    newImage.embedding = embedding;
    await newImage.save();
    console.log("Image embedding saved in database:", newImage._id);

    const newPost = new Post({ image: newImage._id, description, user: user._id });
    await newPost.save();

    user.posts.push(newPost._id);
    await user.save();

    console.log("New post created successfully:", newPost._id);
    res.status(200).json({ message: 'Image posted successfully', post: newPost });
  } catch (err) {
    console.error("Error posting image:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserPosts = async (req, res) => {
  const { username } = req.params;
  const { authorization } = req.headers;

  try {
    const decoded = jwt.verify(authorization, process.env.JWT_SECRET);
    const requestingUser = await User.findById(decoded.userId).select('blockedUsers');

    if (!requestingUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = await User.findOne({ username }).select('posts blockedUsers');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isBlocked =
      requestingUser.blockedUsers.includes(user._id) ||
      user.blockedUsers.includes(requestingUser._id);

    if (isBlocked) {
      return res.json([]);
    }

    const posts = await Post.find({ _id: { $in: user.posts } })
      .populate({
        path: 'image',
        model: 'Image',
        select: 'image',
      });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
};

exports.getPostById = async (req, res) => {
  const { postId } = req.params;
  const { authorization } = req.headers;

  try {
    const decoded = jwt.verify(authorization, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const post = await Post.findById(postId)
      .populate('image', 'image prompt')
      .populate('user', 'username fullname profilePicture');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const existingPostView = await PostView.findOne({ post: postId, user: user._id });

    if (existingPostView) {
      existingPostView.viewCount += 1;
      existingPostView.viewedAt = Date.now();
      await existingPostView.save();
    } else {
      await PostView.create({
        post: postId,
        user: user._id,
        viewedAt: Date.now(),
        viewCount: 1,
      });
    }

    const likesCount = await Like.countDocuments({ post: postId });
    const repostsCount = await Repost.countDocuments({ post: postId });
    const isLikedByUser = await Like.findOne({ post: postId, user: user._id });

    res.json({
      ...post.toObject(),
      likes: likesCount,
      reposts: repostsCount,
      isLikedByUser: !!isLikedByUser,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

exports.likePost = async (req, res) => {
  const { postId } = req.params;
  const { authorization } = req.headers;

  try {
    const decoded = jwt.verify(authorization, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const post = await Post.findById(postId).populate('user', 'username');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const existingLike = await Like.findOne({ post: postId, user: user._id });
    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      await Notification.deleteOne({ post: postId, fromUser: user._id, type: 'like' });
      return res.status(200).json({ message: 'Post unliked' });
    }

    const newLike = new Like({ post: postId, user: user._id });
    await newLike.save();

    const existingNotification = await Notification.findOne({
      post: postId,
      fromUser: user._id,
      type: 'like',
    });

    if (existingNotification) {
      existingNotification.createdAt = Date.now();
      await existingNotification.save();
    } else {
      if (post.user && post.user.toString() !== user._id.toString()) {
        const notification = new Notification({
          user: post.user,
          fromUser: user._id,
          post: postId,
          message: `${user.username} liked your post`,
          type: 'like',
        });
        await notification.save();

        const populatedNotification = await Notification.findById(notification._id)
          .populate('fromUser', 'username profilePicture')
          .populate({
            path: 'post',
            populate: { path: 'image', model: 'Image', select: 'image' },
          })
          .exec();

        if (populatedNotification) {
          sendNotification(post.user.username, {
            message: populatedNotification.message,
            type: 'like',
            postId: postId,
            fromUser: populatedNotification.fromUser,
            createdAt: populatedNotification.createdAt,
            post: populatedNotification.post,
          });
        }
      }
    }

    res.status(201).json({ message: 'Post liked', like: newLike });
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getLikesByPostId = async (req, res) => {
  const { postId } = req.params;

  if (!postId || postId.length !== 24) {
    return res.status(400).json({ error: 'Invalid postId' });
  }

  try {
    const likes = await Like.find({ post: postId })
      .populate('user', 'username fullname profilePicture');

    res.json({ likers: likes.map(like => like.user) });
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
};

exports.getCommentsByPostId = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await Comment.find({ post: postId })
      .populate('user', 'username fullname profilePicture')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

exports.addCommentToPost = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const { authorization } = req.headers;

  try {
    const decoded = jwt.verify(authorization, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const post = await Post.findById(postId).populate('user', 'username');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const mentionedUsernames = content.match(/@(\w+)/g)?.map((m) => m.slice(1)) || [];
    const mentionedUsers = await User.find({ username: { $in: mentionedUsernames } });

    const newComment = new Comment({
      post: postId,
      user: user._id,
      content,
      mentions: mentionedUsers.map((u) => u._id),
    });
    await newComment.save();

    if (post.user._id.toString() !== user._id.toString()) {
      const notification = new Notification({
        user: post.user._id,
        fromUser: user._id,
        post: postId,
        comment: newComment._id,
        message: `${user.username} commented on your post: "${content.slice(0, 100)}..."`,
        type: 'comment',
      });
      await notification.save();

      const populatedNotification = await Notification.findById(notification._id)
        .populate('fromUser', 'username profilePicture')
        .populate({
          path: 'post',
          populate: { path: 'image', model: 'Image', select: 'image' },
        })
        .populate('comment', 'content') 
        .exec();

      if (populatedNotification) {
        sendNotification(post.user.username, {
          message: populatedNotification.message,
          type: 'comment',
          postId: postId,
          fromUser: populatedNotification.fromUser,
          createdAt: populatedNotification.createdAt,
          post: populatedNotification.post,
          comment: populatedNotification.comment,
        });
      }
    }

    for (const mentionedUser of mentionedUsers) {
      const notification = new Notification({
        user: mentionedUser._id,
        fromUser: user._id,
        post: postId,
        comment: newComment._id,
        message: `${user.username} mentioned you in a comment: "${content.slice(0, 100)}..."`,
        type: 'mention',
      });
      await notification.save();

      const populatedNotification = await Notification.findById(notification._id)
        .populate('fromUser', 'username profilePicture')
        .populate({
          path: 'post',
          populate: { path: 'image', model: 'Image', select: 'image' },
        })
        .exec();

      if (populatedNotification) {
        sendNotification(mentionedUser.username, {
          message: populatedNotification.message,
          type: 'mention',
          postId: postId,
          fromUser: populatedNotification.fromUser,
          createdAt: populatedNotification.createdAt,
          post: populatedNotification.post,
        });
      }
    }

    res.status(201).json({ message: 'Comment added', comment: newComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const { authorization } = req.headers;

  try {
    const decoded = jwt.verify(authorization, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(commentId);

    await Notification.deleteMany({
      comment: commentId,
    });

    res.json({ success: true, message: 'Comment and related notifications deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

exports.repostPost = async (req, res) => {
  const { postId } = req.params;
  const { authorization } = req.headers;

  try {
    const decoded = jwt.verify(authorization, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const post = await Post.findById(postId).populate('user', 'username');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const existingRepost = await Repost.findOne({ user: user._id, post: postId });

    if (existingRepost) {
      await Repost.deleteOne({ _id: existingRepost._id });
      await Notification.deleteOne({ post: postId, fromUser: user._id, type: 'repost' });
      return res.status(200).json({ message: 'Post unreposted successfully' });
    }

    const repost = new Repost({ user: user._id, post: postId });
    await repost.save();

    const existingNotification = await Notification.findOne({
      post: postId,
      fromUser: user._id,
      type: 'repost',
    });

    if (existingNotification) {
      existingNotification.createdAt = Date.now();
      await existingNotification.save();
    } else {
      if (post.user && post.user._id.toString() !== user._id.toString()) {
        const notification = new Notification({
          user: post.user._id,
          fromUser: user._id,
          post: postId,
          message: `${user.username} reposted your post`,
          type: 'repost',
        });
        await notification.save();

        const populatedNotification = await Notification.findById(notification._id)
          .populate('fromUser', 'username profilePicture')
          .populate({
            path: 'post',
            populate: { path: 'image', model: 'Image', select: 'image' },
          })
          .exec();

        if (populatedNotification) {
          sendNotification(post.user.username, {
            message: populatedNotification.message,
            type: 'repost',
            postId: postId,
            fromUser: populatedNotification.fromUser,
            createdAt: populatedNotification.createdAt,
            post: populatedNotification.post,
          });
        }
      }
    }

    res.status(201).json({ message: 'Post reposted successfully', repost });
  } catch (error) {
    console.error('Error reposting post:', error);
    res.status(500).json({ error: 'Failed to repost post' });
  }
};

exports.getReposts = async (req, res) => {
  const { postId } = req.params;

  try {
    const reposts = await Repost.find({ post: postId })
      .populate('user', 'username fullname profilePicture')
      .sort({ repostedAt: -1 });

    res.json(reposts);
  } catch (error) {
    console.error('Error fetching reposts:', error);
    res.status(500).json({ error: 'Failed to fetch reposts' });
  }
};

exports.getRepostsByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
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

    res.json(reposts);
  } catch (error) {
    console.error('Error fetching reposts:', error);
    res.status(500).json({ error: 'Failed to fetch reposts' });
  }
};

exports.getLikedPosts = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const likedPosts = await Like.find({ user: user._id })
      .populate({
        path: 'post',
        populate: { path: 'image', model: 'Image' },
      })
      .sort({ likedAt: -1 })
      .exec();

    if (!likedPosts) {
      return res.status(404).json({ error: 'No liked posts found' });
    }

    res.json(likedPosts);
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    res.status(500).json({ error: 'Failed to fetch liked posts' });
  }
};