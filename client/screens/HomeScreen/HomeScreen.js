import { useEffect, useState, useContext } from 'react';
import { View, FlatList, Text, Image, TouchableOpacity, RefreshControl } from 'react-native';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { UserContext } from '../../contexts/UserContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { getHomeScreenStyles } from './HomeScreenStyles.js';
import Loader from '@/components/Loader';
const logo = require('../../assets/images/nav-logo.png');

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20; 
  const { token, username } = useContext(UserContext);
  const { currentTheme, theme } = useContext(ThemeContext);
  const styles = getHomeScreenStyles(currentTheme);
  const navigation = useNavigation();

  const isDarkMode = theme === 'dark'; 
  const logoTintColor = isDarkMode ? 'rgba(300, 300, 300, 0.52)' : 'rgba(0, 0, 0, 0.33)';

  useEffect(() => {
    fetchPosts(1);
  }, []);

  const fetchPosts = async (page) => {
    if (!hasMorePosts && page > 1) return;
    try {
      if (page === 1) setIsLoading(true);
      const response = await axios.get(API_ENDPOINTS.RELEVANT_POSTS(page, limit), {
        headers: {
          Authorization: token,
        },
      });
      
      const newPosts = response.data;

      if (newPosts.length === 0 && page === 1) {
        setPosts([{ message: 'Discover new people to follow!' }]);
      } else {
        setPosts(prevPosts => (page === 1 ? newPosts : [...prevPosts, ...newPosts]));
      }

      if (newPosts.length < limit) setHasMorePosts(false);
      
      setPage(page + 1);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
};

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMorePosts(true);
    await fetchPosts(1);
    setRefreshing(false);
  };

  const loadMorePosts = async () => {
    if (!loadingMore && hasMorePosts) {
      setLoadingMore(true);
      await fetchPosts(page);
      setLoadingMore(false);
    }
  };

  const renderNoPostsMessage = () => (
    <View style={styles.noPostsContainer}>
      <Text style={styles.noPostsText}>No posts available. Follow someone to see their posts!</Text>
    </View>
  );

  const handleLike = async (postId, isLikedByUser) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.LIKE_POST(postId),
        {},
        {
          headers: { Authorization: token }
        }
      );
  
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                isLikedByUser: !isLikedByUser,
                likes: isLikedByUser ? post.likes - 1 : post.likes + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleRepost = async (postId, isRepostedByUser) => {
    try {
      const response = await fetch(API_ENDPOINTS.REPOST_POST(postId), {
        method: 'POST',
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  reposts: isRepostedByUser ? post.reposts - 1 : post.reposts + 1,
                  isRepostedByUser: !isRepostedByUser,
                }
              : post
          )
        );
      } else {
        console.error('Failed to repost:', data.error);
      }
    } catch (error) {
      console.error('Error handling repost:', error);
    }
  };

  const handleCommentsPress = (postId) => {
    navigation.push('CommentsScreen', { postId });
  };

  const handleLikesPress = (postId) => {
    navigation.push('LikesScreen', { postId });
  };

  const handleRepostsPress = (postId) => {
    navigation.push('RepostsScreen', { postId });
  };

  const handleUserPress = (user) => {
    if (user.username === username) {
      navigation.push('Profile');
    } else {
      navigation.push('UserProfile', { username: user.username });
    }
  };

  const RenderDescriptionWithReadMore = ({ text }) => {
    const [showFullDescription, setShowFullDescription] = useState(false);

    return (
      <View>
        <Text
          style={styles.description}
          numberOfLines={showFullDescription ? undefined : 2} 
        >
          {text}
        </Text>
        {text.length > 150 && (
          <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
            <Text style={styles.readMoreText}>
              {showFullDescription ? 'Show Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading && page === 1 ? (
        <Loader/>
      ) : posts.length === 0 ? (
        renderNoPostsMessage()
      ) : (
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            <Image source={{ uri: item.image.image }} style={styles.image} />
            {item.description ? (
              <RenderDescriptionWithReadMore text={item.description} />
            ) : null}
            <View style={styles.userInfoAndEngagement}>
              <View style={styles.userInfoContainer}>
                <TouchableOpacity onPress={() => handleUserPress(item.user)}>
                  <Image source={{ uri: item.user.profilePicture }} style={styles.profileImage} />
                </TouchableOpacity>
                <View>
                  <TouchableOpacity onPress={() => handleUserPress(item.user)}>
                    <Text style={styles.username}>{item.user.username}</Text>
                  </TouchableOpacity>
                  <Text style={styles.date}>{new Date(item.sharedAt).toLocaleDateString()}</Text>
                </View>
              </View>

              <View style={styles.engagementContainer}>
                <TouchableOpacity onPress={() => handleLikesPress(item._id)}>
                  <Text style={styles.likes}>{item.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleLike(item._id, item.isLikedByUser)}>
                  <Icon
                    name={item.isLikedByUser ? 'heart' : 'heart-o'}
                    style={styles.icon}
                    size={21}
                    color={item.isLikedByUser ? '#7049f6' : currentTheme.darkIconColor }
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleCommentsPress(item._id)}>
                  <Text style={styles.comments}>{item.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleCommentsPress(item._id)}>
                  <Icon name="comment-o" style={styles.commentIcon} size={21} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleRepostsPress(item._id)}>
                  <Text style={styles.reposts}>{item.reposts}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRepost(item._id, item.isRepostedByUser)}>
                  <AntDesign
                    name="retweet"
                    style={[styles.icon]}
                    size={21}
                    color={item.isRepostedByUser ? currentTheme.violet : currentTheme.darkIconColor }
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListHeaderComponent={() => (
          <Image source={logo}  style={[styles.logo, { tintColor: logoTintColor }]}  />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loaderContainer}>
              <Loader />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}              
      />
      )}
    </View>
  );
}