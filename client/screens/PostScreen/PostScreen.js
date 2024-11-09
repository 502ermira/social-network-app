import { useEffect, useRef, useState, useContext } from 'react';
import { View, KeyboardAvoidingView, Keyboard, Platform, Text, Image, ScrollView, TextInput, TouchableOpacity , Dimensions, Modal, RefreshControl} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Icon from 'react-native-vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import { getPostScreenStyles } from './PostScreenStyles.js';
import { UserContext } from '../../contexts/UserContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import CustomHeader from '@/components/CustomHeader';
import Loader from '@/components/Loader.js';

const { height } = Dimensions.get('window');

export default function PostScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { postId, repostedBy, repostedAt } = route.params;
  const { token, username } = useContext(UserContext);
  const { currentTheme, theme } = useContext(ThemeContext);
  const styles = getPostScreenStyles(currentTheme);
  const [postData, setPostData] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [visibleComments, setVisibleComments] = useState(1);
  const [isRepostedByUser, setIsRepostedByUser] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputPosition, setInputPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedByUsers, setBlockedByUsers] = useState([]);

  const textInputRef = useRef(null);

  const fetchBlockedUsers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.BLOCKED_USERS, {
        headers: { Authorization: token },
      });
      const data = await response.json();
      if (response.ok) {
        setBlockedUsers((data.blockedUsers || []).map(user => user.username));
        setBlockedByUsers((data.blockedByUsers || []).map(user => user.username));
      } else {
        console.error('Failed to fetch blocked users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    }
  };  

  const fetchPostData = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.POST_DETAILS(postId), {
        headers: { Authorization: token },
      });
      const data = await response.json();

      if (response.ok) {
        setPostData(data);
        const repostResponse = await fetch(API_ENDPOINTS.POST_REPOSTS(postId), {
          headers: { Authorization: token },
        });
        const reposts = await repostResponse.json();
        const hasReposted = reposts.some(repost => repost.user.username === username);
        setIsRepostedByUser(hasReposted);
      } else {
        console.error('Failed to fetch post:', data.error);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.POST_COMMENTS(postId), {
        headers: { Authorization: token },
      });
      const data = await response.json();

      if (response.ok) {
        setComments(data);
      } else {
        console.error('Failed to fetch comments:', data.error);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
    fetchPostData();
    fetchComments();

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };

  }, [postId, token]);

  const handleLike = async (postId) => {
    try {
      const response = await fetch(API_ENDPOINTS.LIKE_POST(postId),{
        method: 'POST',
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setPostData((prev) => ({
          ...prev,
          isLikedByUser: !prev.isLikedByUser,
          likes: prev.isLikedByUser ? prev.likes - 1 : prev.likes + 1,
        }));
      } else {
        console.error('Failed to like post:', data.error);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleRepost = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.REPOST_POST(postId), {
        method: 'POST',
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setPostData((prev) => ({
          ...prev,
          reposts: isRepostedByUser ? prev.reposts - 1 : prev.reposts + 1,
        }));
        setIsRepostedByUser(!isRepostedByUser);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error handling repost:', error);
    }
  };  

  const handleDeletePost = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.DELETE_POST(postId), {
        method: 'DELETE',
        headers: { Authorization: token },
      });
  
      if (response.ok) {
        setDeleteMessage('Post successfully deleted');
        setModalVisible(true);
        route.params?.onRefreshProfile?.();
      } else {
        const data = await response.json();
        console.error('Failed to delete post:', data.error);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const fetchUserSuggestions = async (searchTerm) => {
    try {
      const response = await fetch(API_ENDPOINTS.USER_SUGGESTIONS(searchTerm), {
        headers: { Authorization: token },
      });
      const data = await response.json();
  
      if (response.ok) {
        const filteredSuggestions = data.filter(
          user => !blockedUsers.includes(user.username) && !blockedByUsers.includes(user.username)
        );
        setSuggestions(filteredSuggestions);
      } else {
        console.error('Failed to fetch user suggestions:', data.error);
      }
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
    }
  };  

  const handleMentionPress = (username) => {
    const words = newComment.split(' ');
    words.pop();
    setNewComment([...words, `@${username}`].join(' ') + ' ');
    setShowSuggestions(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
  
    const optimisticComment = {
      _id: Date.now().toString(),
      content: newComment,
      user: {
        fullname: "Adding comment...",
        username: username,
        profilePicture: '',
      },
    };
  
    setComments((prev) => [optimisticComment, ...prev]);
  
    setNewComment('');
  
    try {
      const response = await fetch(API_ENDPOINTS.POST_COMMENTS(postId), {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });
  
      const data = await response.json();
      if (response.ok) {
        await fetchComments();
      } else {
        console.error('Failed to add comment:', data.error);
        setComments((prev) => prev.filter(comment => comment._id !== optimisticComment._id));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setComments((prev) => prev.filter(comment => comment._id !== optimisticComment._id));
    }
  };
  
  const handleCommentChange = (text) => {
    setNewComment(text);

    const lastWord = text.split(' ').pop();
    if (lastWord.startsWith('@')) {
      const searchTerm = lastWord.slice(1);
      if (searchTerm) {
        fetchUserSuggestions(searchTerm);
        setShowSuggestions(true);
        measureInputPosition();
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const filteredComments = comments.filter(
    comment =>
      !blockedUsers.includes(comment.user.username) &&
      !blockedByUsers.includes(comment.user.username)
  );  

  const handleCommentsPress = () => {
    navigation.push('CommentsScreen', { postId: postData._id });
  };

  const handleLikesPress = () => {
    navigation.push('LikesScreen', { postId: postData._id });
  };

  const handleRepostsPress = () => {
    navigation.push('RepostsScreen', { postId: postData._id });
  };

  if (loading) {
    return (
      <Loader />
    );
  }

  const measureInputPosition = () => {
    if (textInputRef.current) {
      textInputRef.current.measureInWindow((x, y, width, height) => {
        setInputPosition({ x, y, width, height });
      },500);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchPostData();
      await fetchComments();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };  

  const formattedDate = new Date(postData.sharedAt).toLocaleDateString();
  const formattedTime = new Date(postData.sharedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const formattedRepostDate = repostedAt ? new Date(repostedAt).toLocaleTimeString([], { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '';

  return (
   <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <CustomHeader title="Post Details" />
    <ScrollView
     contentContainerStyle={styles.container}
     keyboardShouldPersistTaps="handled"
     style={{ backgroundColor: currentTheme.backgroundColor }}
     refreshControl={
      <RefreshControl 
      refreshing={refreshing} 
      onRefresh={onRefresh}
      tintColor="#7049f6"
      colors={['#7049f6', '#ff6347', '#32cd32']}
      />
    }
    >
      {deleteMessage && (
          <Text style={styles.deleteMessage}>{deleteMessage}</Text>
        )}

      {repostedBy && repostedAt && (
        <Text style={styles.repostedByText}>
         <AntDesign name="retweet" style={[styles.repostIcon]} size={18.5} color={'#999'} />
          &nbsp;
          {repostedBy === username ? 'You reposted' : `${repostedBy} reposted`} 
          &nbsp;on&nbsp;<Text style={styles.repostDate}>{formattedRepostDate}</Text>
        </Text>
      )}
      <View style={styles.userInfo}>
       <TouchableOpacity style={styles.userInfoInner}
         onPress={() => {
          if (postData.user.username === username) {
            navigation.push('Profile');
          } else {
            navigation.push('UserProfile', { username: postData.user.username });
          }
        }} >
        <Image source={{ uri: postData.user.profilePicture }} style={styles.profileImage} />
        <View style={styles.userDetails}>
          <Text style={styles.fullname}>{postData.user.fullname}</Text>
          <Text style={styles.username}>@{postData.user.username}</Text>
        </View>
        </TouchableOpacity>
        {postData.user.username === username && (
            <TouchableOpacity onPress={handleDeletePost}>
              <AntDesign name="delete" size={22} color="#7049f6" />
            </TouchableOpacity>
          )}
      </View>

      <Image source={{ uri: postData.image.image }} style={styles.postImage} />
      
      <View style={styles.likesContainer}>
        <TouchableOpacity onPress={handleLikesPress}>
          <Text style={{color : currentTheme.darkIconColor}}>{postData.likes} {postData.likes === 1 ? 'Like' : 'Likes'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={postData.isLikedByUser ? styles.unlikeButton : styles.likeButton} 
          onPress={() => handleLike(postId)}
        >
          {postData.isLikedByUser ? (
            <Icon name="heart" style={styles.likeIcon} size={25} color="#7049f6" />
          ) : (
            <Icon name="heart-o" style={styles.likeIcon} size={25} color={currentTheme.darkIconColor} />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCommentsPress} style={styles.commentButton}>
          <Text style={{color : currentTheme.darkIconColor}}>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</Text>
          <Icon name="comment-o" style={styles.commentIcon} size={24.5} color={currentTheme.darkIconColor} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRepostsPress} style={styles.commentButton}>
          <Text style={{color : currentTheme.darkIconColor}}>{postData.reposts} {postData.reposts === 1 ? 'Repost' : 'Reposts'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRepost} style={styles.repostButton}>
          <AntDesign name="retweet" style={styles.commentIcon} size={25.5} color={isRepostedByUser ? currentTheme.violet : currentTheme.darkIconColor}  />
        </TouchableOpacity>
      </View>

      {postData.description ? (
         <Text style={styles.description}>{postData.description}</Text>
      ) : null}

      {comments ? (
      <View style={styles.commentsSection}>
      {comments.length > visibleComments && (
        <TouchableOpacity onPress={handleCommentsPress}>
          <Text style={styles.viewMoreText}>View {comments.length - visibleComments} more comments</Text>
        </TouchableOpacity>
      )}
      {filteredComments.slice(0, visibleComments).map((comment) => (
        <View key={comment._id} style={styles.comment}>
          <Image source={{ uri: comment.user.profilePicture }} style={styles.profileImageComment} />
          <Text style={styles.commentUser}>{comment.user.fullname}: {comment.content}</Text>
        </View>
      ))}
    </View>
    ) : null}

      <View style={styles.commentInputContainer}>
        <TextInput
          ref={textInputRef}
          style={styles.commentInput}
          placeholder="Leave a comment"
          placeholderTextColor={currentTheme.placeholderTextColor}
          value={newComment}
          onChangeText={handleCommentChange}
          onFocus={measureInputPosition}
          blurOnSubmit={false}
        />
        <TouchableOpacity style={styles.commentSubmitButton} onPress={handleAddComment}>
          <Icon name="paper-plane" style={styles.submitIcon} size={27} color={currentTheme.darkIconColor} />
        </TouchableOpacity>
      </View>
      {showSuggestions && (
      <View
        style={{
        position: 'absolute',
        bottom: height - inputPosition.y - keyboardHeight,
        left: inputPosition.x,
        width: inputPosition.width,
        backgroundColor: currentTheme.optionBackground,
        borderRadius: 5,
        paddingVertical: 10,
        zIndex: 1000,
        bottom: 215,
        maxHeight: 155,
        zIndex: 1000,
       }}
      >
       <ScrollView keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        style={{ maxHeight: 150 }}
        persistentScrollbar={true}
       >
      {suggestions.slice(0, 10).map((item) => (
        <TouchableOpacity
          key={item._id}
          onPress={() => handleMentionPress(item.username)}
          style={styles.suggestionItem}
        >
          <View style={styles.suggestionContainer}>
            <Image source={{ uri: item.profilePicture }} style={styles.profileImageSuggestion} />
            <Text style={styles.suggestionText}>
              @{item.username} ({item.fullname})
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      </ScrollView>
      </View>
      )}
    <Text style={styles.date}>Posted on {formattedDate} at {formattedTime}</Text>
    </ScrollView>

        <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalView}>
             <View style={styles.modalContent}>
              <Text style={styles.modalText}>Post deleted successfully!</Text>
              <TouchableOpacity onPress={() => {
               navigation.goBack();
               setModalVisible(false);
              }} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
             </View>
            </View>
          </Modal>
    </KeyboardAvoidingView>

  );
}