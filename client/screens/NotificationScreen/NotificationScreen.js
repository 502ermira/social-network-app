import { useRef, useEffect, useState, useContext } from 'react';
import { View, RefreshControl, Text, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { UserContext } from '../../contexts/UserContext';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { getNotificationScreenStyles } from './NotificationScreenStyles.js';
import Loader from '@/components/Loader';
import { SOCKET_URL } from '@/config/apiConfig';
import io from 'socket.io-client';

export default function NotificationScreen() {
  const { token, username: loggedInUsername } = useContext(UserContext);
  const { currentTheme, theme } = useContext(ThemeContext);
  const styles = getNotificationScreenStyles(currentTheme);
  const [notifications, setNotifications] = useState([]);
  const [followingStatus, setFollowingStatus] = useState({});
  const navigation = useNavigation();
  const socket = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const isDarkMode = theme === 'dark'; 
  const borderColor = isDarkMode ? '#232323' : '#dedede';

  useEffect(() => {
    socket.current = io(SOCKET_URL);
    socket.current.emit('joinRoom', loggedInUsername);
  
    const handleNewNotification = (notification) => {
      setNotifications((prevNotifications) => {
        const isDuplicate = prevNotifications.some(
          (existingNotification) =>
            existingNotification.fromUser?._id === notification.fromUser?._id &&
            existingNotification.type === notification.type &&
            (notification.type === 'like' || notification.type === 'repost' || notification.type === 'follow')
        );

        const filteredNotifications = prevNotifications.filter(
          (existingNotification) =>
            !(
              existingNotification.fromUser?._id === notification.fromUser?._id &&
              existingNotification.type === notification.type &&
              (notification.type === 'like' || notification.type === 'repost' || notification.type === 'follow')
            )
        );

        return [notification, ...filteredNotifications];
      });
    };
  
    socket.current.on('newNotification', handleNewNotification);
  
    return () => {
      socket.current.disconnect();
    };
  }, [loggedInUsername]);  

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS(page), {
        headers: { Authorization: token },
      });
      const data = await response.json();
      if (response.ok) {
        const filteredNotifications = data.filter(
          (notification) => notification.fromUser?.username !== loggedInUsername
        );
        setNotifications((prevNotifications) => [...prevNotifications, ...filteredNotifications]);
        setHasMore(filteredNotifications.length > 0);
      } else {
        console.error('Failed to fetch notifications:', data.error);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowingStatus = async () => {
    try {
      const statusResponse = await fetch(API_ENDPOINTS.FOLLOWERS_FOLLOWING(loggedInUsername), {
        headers: { Authorization: token },
      });
      const statusData = await statusResponse.json();

      const status = {};
      statusData.following.forEach(user => {
        status[user.followingId.username] = true;
      });
      statusData.followers.forEach(user => {
        if (!status[user.followerId.username]) {
          status[user.followerId.username] = false;
        }
      });
      setFollowingStatus(status);
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchFollowingStatus();
  }, [token, loggedInUsername, page]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setNotifications([]);
    await fetchNotifications();
    await fetchFollowingStatus();
    setRefreshing(false);
  };

  const handleFollowToggle = async (user) => {
    const isFollowing = followingStatus[user.username];
    const url = isFollowing
      ? API_ENDPOINTS.UNFOLLOW_USER(user.username)
      : API_ENDPOINTS.FOLLOW_USER(user.username);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setFollowingStatus((prevStatus) => ({
          ...prevStatus,
          [user.username]: !isFollowing,
        }));
      } else {
        console.error('Error toggling follow status');
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  const handlePostPress = (postId) => {
    navigation.navigate('PostScreen', { postId });
  };

  const truncateComment = (content) => {
    const screenWidth = Dimensions.get('window').width;
    const maxCharacters = Math.floor(screenWidth / 10);
    return content.length > maxCharacters ? content.slice(0, maxCharacters) + '...' : content;
  };

  const handleUserPress = (username) => {
    navigation.push('UserProfile', { username });
  };

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (isCloseToBottom && hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <View>
      <ScrollView 
        contentContainerStyle={styles.container}
        style={{ backgroundColor: currentTheme.backgroundColor, }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#7049f6"
            colors={['#7049f6', '#ff6347', '#32cd32']}
            progressBackgroundColor="#fafafa"
          />
        }
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        <Text style={styles.title}>Notifications</Text>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification._id}
            style={[styles.notification, { borderBottomColor: borderColor }]}
            onPress={() => {
              if (notification.type !== 'follow') {
                handlePostPress(notification.post._id);
              }
            }}
          >
            <View style={styles.notificationContent}>
              <View style={styles.profileContainer}>
                <TouchableOpacity onPress={() => handleUserPress(notification.fromUser?.username)}>
                  <Image
                    source={{ uri: notification.fromUser?.profilePicture }}
                    style={styles.profilePicture}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.notificationTextContainer}>
                <View style={styles.usernameAndTextContainer}>
                  <Text style={styles.notificationText}>
                    {notification.fromUser?.username ? (
                      <TouchableOpacity onPress={() => handleUserPress(notification.fromUser.username)}>
                        <Text style={styles.usernameText}>{notification.fromUser.username}</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.usernameText}>Unknown User</Text>
                    )}
                    {notification.type === 'like' && ' liked your post'}
                    {notification.type === 'comment' && ` commented on your post: ${truncateComment(notification.comment?.content || '')}`}                   
                    {notification.type === 'mention' && ` mentioned you in a comment: ${truncateComment(notification.comment?.content || '')}`}
                    {notification.type === 'repost' && ' reposted your post'}
                    {notification.type === 'follow' && ' started following you'}
                  </Text>
                </View>
                
                <Text style={styles.notificationTime}>
                  {new Date(notification.createdAt).toLocaleString()}
                </Text>
              </View>

              {notification.type !== 'follow' && notification.post?.image && (
                <Image
                  source={{ uri: notification.post.image.image }}
                  style={styles.notificationImage}
                />
              )}

              {notification.type === 'follow' && (
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    followingStatus[notification.fromUser.username]
                      ? styles.following
                      : styles.notFollowing,
                  ]}
                  onPress={() => handleFollowToggle(notification.fromUser)}
                >
                  <Text style={styles.followButtonText}>
                    {followingStatus[notification.fromUser.username] ? 'Following' : 'Follow Back'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
        {loading && !refreshing && (
          <View style={styles.loader}>
            <Loader />
          </View>
        )}
      </ScrollView>
    </View>
  );
}