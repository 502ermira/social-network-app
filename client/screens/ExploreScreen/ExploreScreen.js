import { useState, useEffect, useContext } from 'react';
import { View, FlatList, TouchableOpacity, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import Loader from '@/components/Loader';
import { getExploreScreenStyles } from './ExploreScreenStyles.js';
import { API_ENDPOINTS } from '../../config/apiConfig';

export default function ExploreScreen({ route }) {
  const { token } = useContext(UserContext);
  const { currentTheme } = useContext(ThemeContext);
  const styles = getExploreScreenStyles(currentTheme);
  const [explorePosts, setExplorePosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const navigation = useNavigation();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedByUsers, setBlockedByUsers] = useState([]);

  const fetchBlockedUsers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.BLOCKED_USERS, {
        headers: {
          Authorization: token,
        },
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

  const fetchExplorePosts = async (pageNumber = 1) => {
    if (!hasMore || isFetchingMore) return;

    setIsFetchingMore(true);
    try {
      const response = await fetch(API_ENDPOINTS.EXPLORE_POSTS(pageNumber), {
        headers: {
          Authorization: token,
        },
      });
      const data = await response.json();

      if (data.length > 0) {
        setExplorePosts((prevPosts) => [...prevPosts, ...data]);
        setPage(pageNumber + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching explore posts:', error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
    fetchExplorePosts();
  }, []);

  const filteredExplorePosts = explorePosts.filter(
    post => 
      !blockedUsers.includes(post.user.username) && 
      !blockedByUsers.includes(post.user.username)
  );

  const handlePostPress = (postId) => {
    navigation.push('PostScreen', { postId });
  };

  const renderPostItem = ({ item }) => (
    <TouchableOpacity style={styles.postContainer} onPress={() => handlePostPress(item._id)}>
      <Image source={{ uri: item.image.image }} style={styles.postImage} />
      <View style={styles.textContainer}>
        <Image source={{ uri: item.user.profilePicture }} style={styles.profileImage} />
        <Text style={styles.username}>{item.user.username}</Text>
      </View>
    </TouchableOpacity>
  );

  const loadMorePosts = () => {
    if (!isLoading && hasMore) {
      fetchExplorePosts(page);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Page</Text>
      {isLoading ? (
        <Loader />
      ) : (
        <FlatList
          data={filteredExplorePosts}
          keyExtractor={(item) => item._id}
          renderItem={renderPostItem}
          numColumns={2}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore ? (
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