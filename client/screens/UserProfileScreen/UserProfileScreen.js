import { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { UserContext } from '../../contexts/UserContext';
import { ThemeContext } from '@/contexts/ThemeContext';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { getUserProfileScreenStyles } from './UserProfileScreenStyles';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [index, setIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [routes] = useState([
     { key: 'posts', icon: 'apps-sharp' },
     { key: 'reposts', icon: 'repeat' },
  ]);

  const screenWidth = Dimensions.get('window').width;
  const numColumns = screenWidth > 600 ? 3 : 2;
  const imageSize = screenWidth / numColumns - 10;

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

        setFollowers(followData.followers);
        setFollowing(followData.following);

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
          <View style={styles.profileInfoContainer}>
          <View style={styles.profileInfoInner}>
            
            <Text style={styles.fullname}>{profileData.fullname}</Text>
             <TouchableOpacity 
                style={styles.buttonContainer} 
                onPress={isBlocked ? handleBlockToggle : handleFollowToggle}
             >
                  <LinearGradient
                    colors={['#FFA500', '#FF4500']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.followButton}
                  >
                    <Text style={styles.followButtonText}>
                     {isBlocked ? 'Unblock' : isFollowing ? 'Following' : 'Follow'}
                   </Text>
                  </LinearGradient>

             </TouchableOpacity>

          </View>
        </View>
        </View>

        <View style={styles.followInfo}>
                <TouchableOpacity>
                  <View style={styles.postsContainer}>
                    <View style={styles.profileImagesContainer}>
                      {posts.slice(0, 3).map((post, index) => (
                        <Image
                          key={index}
                          source={{ uri: post.image.image }}
                          style={styles.roundedProfileImage} 
                        />
                      ))}
                    </View>
                    <Text style={styles.postsText}>
                      <Text style={styles.count}>{profileData.postCount}</Text>
                      &nbsp;posts
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={navigateToFollowers}>
                  <View style={styles.followersContainer}>
                    <View style={styles.profileImagesContainer}>
                      {followers.slice(0, 3).map((follower, index) => (
                        <Image
                          key={index}
                          source={{ uri: follower.followerId.profilePicture }}
                          style={styles.roundedProfileImage}
                        />
                      ))}
                    </View>
                    <Text style={styles.followersText}>
                      <Text style={styles.count}>{followerCount}</Text>
                      &nbsp;followers
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={navigateToFollowing}>
                  <View style={styles.followingContainer}>
                    <View style={styles.profileImagesContainer}>
                      {following.slice(0, 3).map((user, index) => (
                        <Image
                          key={index}
                          source={{ uri: user.followingId.profilePicture }}
                          style={styles.roundedProfileImage}
                        />
                      ))}
                    </View>
                    <Text style={styles.followingText}>
                      <Text style={styles.count}>{followingCount}</Text>
                      &nbsp;following
                    </Text>
                  </View>
                </TouchableOpacity>
            </View>
        {profileData.bio ? (
         <Text style={styles.bio}>{profileData.bio}</Text>
          ) : null}

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: Dimensions.get('window').width }}
          renderTabBar={props => (
            <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: currentTheme.secondaryTextColor , marginBottom: 1.5, height:1 }}
            style={styles.tabBar}
            renderIcon={({ route, focused, color }) => {
              let iconSize = 19;
              let iconStyle = {};
      
              if (route.key === 'reposts') {
                iconSize = 25;
                iconStyle = { marginTop: -1.2 }; 
              }
              else if (route.key === 'posts') {
                iconSize = 21;
              }
      
              return (
                <View style={iconStyle}>
                  <Ionicons
                    name={route.icon}
                    size={iconSize}
                    color={focused ? currentTheme.textColor : currentTheme.tertiaryTextColor}
                  />
                </View>
              );
            }}
          />
        )}
      />
      </View>
    </ScrollView>
  </>
  );
}