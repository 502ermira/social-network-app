import { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import { ThemeContext } from '@/contexts/ThemeContext';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { getUserProfileScreenStyles } from './UserProfileScreenStyles';
import CustomHeader from '@/components/CustomHeader';
import Loader from '@/components/Loader';
import { API_ENDPOINTS } from '@/config/apiConfig';

export default function UserProfileScreen() {
  const { token, username: loggedInUsername } = useContext(UserContext);
  const { currentTheme } = useContext(ThemeContext);
  const styles = getUserProfileScreenStyles(currentTheme);
  const route = useRoute();
  const { username } = route.params;
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [posts, setPosts] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [index, setIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [routes] = useState([
    { key: 'posts', title: 'Posts' },
    { key: 'reposts', title: 'Reposts' },
  ]);

  const screenWidth = Dimensions.get('window').width;
  const numColumns = screenWidth > 600 ? 3 : 2;
  const imageSize = screenWidth / numColumns - 2.5;

  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
  };  

  const checkIfBlocked = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.BLOCKED_USERS, {
        headers: { Authorization: token },
      });
      const data = await response.json();

      if (response.ok) {
        const blocked = data.blockedUsers.some(user => user.username === username);
        setIsBlocked(blocked);
      } else {
        console.error('Failed to fetch blocked users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.USER_PROFILE(username), {
        headers: { Authorization: token },
      });
      const data = await response.json();

      if (response.ok) {
        setProfileData(data.user);
        setIsBlocked(data.isBlocked);

        if (data.isBlocked) {
          setReposts([]);
        } else {
          setReposts(data.reposts);
        }

        const followResponse = await fetch(API_ENDPOINTS.FOLLOWERS_FOLLOWING(username));
        const followData = await followResponse.json();

        setFollowerCount(data.isBlocked ? 0 : followData.followers.length);
        setFollowingCount(data.isBlocked ? 0 : followData.following.length);

        const isUserFollowing = followData.followers.some(
          (follower) => follower.followerId.username === loggedInUsername
        );
        setIsFollowing(isUserFollowing);
        await checkIfBlocked();
      } else {
        console.error('Failed to fetch profile:', data.error);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.USER_POSTS(username), {
        headers: { Authorization: token },
      });
      const data = await response.json();
  
      if (data.length === 0) {
        setPosts([]);
        setIsBlocked(true);
      } else {
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };  

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    await fetchUserPosts();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, [username, token, loggedInUsername]);

  const handleFollowToggle = async () => {
    try {
      const url = isFollowing 
         ? API_ENDPOINTS.UNFOLLOW_USER(username)
         : API_ENDPOINTS.FOLLOW_USER(username);

      const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: token },
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1);
      } else {
        const data = await response.json();
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  const navigateToFollowers = () => {
    if (isBlocked) {
      return;
    }
    navigation.push('Followers', { username, type: 'followers' });
  };
  
  const navigateToFollowing = () => {
    if (isBlocked) {
      return;
    }
    navigation.push('Following', { username, type: 'following' });
  };
  
  const PostsRoute = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {posts.length > 0 ? (
        <View style={styles.previewGrid}>
          {posts
            .sort((a, b) => new Date(b.sharedAt) - new Date(a.sharedAt))
            .map((post, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.postContainer, { width: imageSize, height: imageSize }]} 
                onPress={() => navigation.navigate('PostScreen', { postId: post._id })}
              >
                <Image source={{ uri: post.image.image }} style={styles.previewImage}  />
              </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.noPostsText}>No posts available</Text>
      )}
    </ScrollView>
  );
  
  const RepostsRoute = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {reposts.length > 0 ? (
        <View style={styles.previewGrid}>
          {reposts
            .sort((a, b) => new Date(b.repostedAt) - new Date(a.repostedAt))
            .map((repost, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.postContainer, { width: imageSize, height: imageSize }]} 
                onPress={() => navigation.navigate('PostScreen', { postId: repost.post._id, repostedBy: username, repostedAt: repost.repostedAt })} 
              >
                <Image source={{ uri: repost.post.image.image }} style={styles.previewImage} />
              </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.noPostsText}>No reposts available</Text>
      )}
    </ScrollView>
  );
  
  const renderScene = SceneMap({
    posts: PostsRoute,
    reposts: RepostsRoute,
  });


  const handleBlockToggle = async () => {
    const endpoint = isBlocked ? API_ENDPOINTS.UNBLOCK_USER(username) : API_ENDPOINTS.BLOCK_USER(username);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: token },
      });
  
      if (response.ok) {
        setIsBlocked(!isBlocked);
        setReposts([]);
        setIsMenuOpen(false);
        await onRefresh();
      } else {
        const data = await response.json();
        console.error(`Failed to ${isBlocked ? 'unblock' : 'block'} user:`, data.error);
      }
    } catch (error) {
      console.error(`Error ${isBlocked ? 'unblocking' : 'blocking'} user:`, error);
    }
  };

  if (loading) {
    return (
      <Loader />
    );
  }

  return (
  <>
    <CustomHeader 
      title={username} 
      screenType="UserProfileScreen"
      toggleMenu={toggleMenu}
    />
      {isMenuOpen && (
        <View style={styles.menuContainer}>
          <TouchableOpacity onPress={handleBlockToggle} style={styles.menuOption}>
            <Text style={styles.menuOptionText}>{isBlocked ? 'Unblock User' : 'Block User'}</Text>
          </TouchableOpacity>
        </View>
      )}

    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      style={{  backgroundColor: currentTheme.backgroundColor, }}
      refreshControl={ 
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor="#7049f6"
          colors={['#7049f6', '#ff6347', '#32cd32']}
        />
      }
    >
      <View style={styles.container}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: profileData.profilePicture }} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <Text style={styles.fullname}>{profileData.fullname}</Text>
            <View style={styles.followInfo}>
              <TouchableOpacity onPress={navigateToFollowers}>
                <Text style={styles.followers}>{followerCount} Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={navigateToFollowing}>
                <Text style={styles.following}>{followingCount} Following</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {profileData.bio ? (
         <Text style={styles.bio}>{profileData.bio}</Text>
          ) : null}

        <TouchableOpacity 
          style={styles.followButton} 
          onPress={isBlocked ? handleBlockToggle : handleFollowToggle}
        >
          <Text style={styles.followButtonText}>
            {isBlocked ? 'Unblock' : isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: Dimensions.get('window').width }}
          renderTabBar={props => (
            <TabBar
              {...props}
              indicatorStyle={{ backgroundColor: '#7049f6', marginBottom:1.5 }}
              style={styles.tabBar}
              labelStyle={{ color: currentTheme.textColor, fontWeight: '400', fontSize: 13 }}
            />
          )}
        />
      </View>
    </ScrollView>
  </>
  );
}