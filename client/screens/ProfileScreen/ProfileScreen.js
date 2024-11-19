import { useContext, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { UserContext } from '../../contexts/UserContext.js';
import { ThemeContext } from '@/contexts/ThemeContext.js';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import CustomHeader from '@/components/CustomHeader.js';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Loader from '@/components/Loader.js';
import { getUserProfileScreenStyles } from '../UserProfileScreen/UserProfileScreenStyles.js';
import { API_ENDPOINTS } from '@/config/apiConfig.js';

export default function ProfileScreen({ navigation }) {
  const { token, username: loggedInUsername, loading: contextLoading } = useContext(UserContext);
  const { currentTheme } = useContext(ThemeContext);
  const styles = getUserProfileScreenStyles(currentTheme);
  const [userData, setUserData] = useState({});
  const [posts, setPosts] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [likes, setLikes] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [routes] = useState([
    { key: 'posts', icon: 'apps-sharp' },
    { key: 'reposts', icon: 'repeat' },
    { key: 'likes', icon: 'heart-sharp' },
    { key: 'bookmarks', icon: 'bookmarks-sharp' }
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const numColumns = screenWidth > 600 ? 3 : 2;
  const imageSize = screenWidth / numColumns - 10;

  const fetchUserData = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        headers: { Authorization: token },
      });
      const data = await response.json();
      setUserData(data);
      
      const postsResponse = await fetch(API_ENDPOINTS.USER_POSTS(loggedInUsername), {
        headers: { Authorization: token },
      });
      const postsData = await postsResponse.json();
      if (postsResponse.ok) {
        setPosts(postsData);
      } else {
        console.error('Failed to fetch posts:', postsData.error);
      }
  
      const repostsResponse = await fetch(API_ENDPOINTS.USER_REPOSTS(loggedInUsername), {
        headers: { Authorization: token },
      });
      const repostsData = await repostsResponse.json();
      if (repostsResponse.ok) {
        setReposts(repostsData);
      } else {
        console.error('Failed to fetch reposts:', repostsData.error);
      }
  
      const likesResponse = await fetch(API_ENDPOINTS.USER_LIKES(loggedInUsername), {
        headers: { Authorization: token },
      });
      const likesData = await likesResponse.json();
      if (likesResponse.ok) {
        setLikes(likesData);
      } else {
        console.error('Failed to fetch likes:', likesData.error);
      } 
  
      const bookmarksResponse = await fetch(API_ENDPOINTS.USER_BOOKMARKS(loggedInUsername), {
        headers: { Authorization: token },
      });
      const bookmarksData = await bookmarksResponse.json();
      if (bookmarksResponse.ok) {
        setBookmarkedPosts(bookmarksData);
      } else {
        console.error('Failed to fetch bookmarks:', bookmarksData.error);
      }
  
      const followResponse = await fetch(API_ENDPOINTS.FOLLOWERS_FOLLOWING(loggedInUsername), {
        headers: { Authorization: token },
      });
      const followData = await followResponse.json();
      if (followResponse.ok) {
        setFollowerCount(followData.followers.length);
        setFollowingCount(followData.following.length);
        setFollowers(followData.followers);
        setFollowing(followData.following); 
      } else {
        console.error('Failed to fetch followers and following:', followData.error);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefreshProfile = () => {
    fetchUserData();
};

  useEffect(() => {
    if (!contextLoading && token) {
      fetchUserData();
    }
  }, [token, contextLoading, loggedInUsername]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchUserData();
  };

  const navigateToFollowers = () => {
    navigation.push('Followers', { username: loggedInUsername, type: 'followers' });
  };

  const navigateToFollowing = () => {
    navigation.push('Following', { username: loggedInUsername, type: 'following' });
  };

  const PostsRoute = () => (
    <ScrollView 
      contentContainerStyle={styles.tabContent}
    >
      {posts.length > 0 ? (
        <View style={[styles.previewGrid, { width: screenWidth }]}>
          {posts
            .sort((a, b) => new Date(b.sharedAt) - new Date(a.sharedAt))
            .map((post, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.postContainer, { width: imageSize, height: imageSize }]} 
                onPress={() => navigation.navigate('PostScreen', { postId: post._id , onRefreshProfile: handleRefreshProfile, })}
              >
                <Image source={{ uri: post.image.image }} style={styles.previewImage} />
              </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.noPostsText}>No posts available</Text>
      )}
    </ScrollView>
  );

const RepostsRoute = () => (
  <ScrollView 
    contentContainerStyle={styles.tabContent}
  >
    {reposts.length > 0 ? (
      <View style={[styles.previewGrid, { width: screenWidth }]}>
        {reposts
          .sort((a, b) => new Date(b.repostedAt) - new Date(a.repostedAt))
          .map((repost, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.postContainer, { width: imageSize, height: imageSize }]} 
              onPress={() => navigation.navigate('PostScreen', { postId: repost.post._id, repostedBy: loggedInUsername ,repostedAt: repost.repostedAt })} 
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

const BookmarksRoute = () => (
  <ScrollView contentContainerStyle={styles.tabContent}>
    {bookmarkedPosts.length > 0 ? (
      <View style={[styles.previewGrid, { width: screenWidth }]}>
        {bookmarkedPosts.map((bookmark, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.postContainer, { width: imageSize, height: imageSize }]}
            onPress={() => navigation.navigate('PostScreen', { postId: bookmark.post._id })}
          >
            <Image source={{ uri: bookmark.post.image.image }} style={styles.previewImage} />
          </TouchableOpacity>
        ))}
      </View>
    ) : (
      <Text style={styles.noPostsText}>No saved posts available</Text>
    )}
  </ScrollView>
);

const LikesRoute = () => (
  <ScrollView 
    contentContainerStyle={styles.tabContent}
  >
    {likes.length > 0 ? (
      <View style={[styles.previewGrid, { width: screenWidth }]}>
        {likes.map((like, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.postContainer, { width: imageSize, height: imageSize }]} 
            onPress={() => navigation.navigate('PostScreen', { postId: like.post._id })}
          >
            <Image source={{ uri: like.post.image.image }} style={styles.previewImage} />
          </TouchableOpacity>
        ))}
      </View>
    ) : (
      <Text style={styles.noPostsText}>No liked posts available</Text>
    )}
  </ScrollView>
);

  const renderScene = SceneMap({
    posts: PostsRoute,
    reposts: RepostsRoute,
    likes: LikesRoute,
    bookmarks: BookmarksRoute,
  });

  if (contextLoading || loading) {
    return (
      <Loader />
    );
  }

  return (
    <>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        style={{ backgroundColor: currentTheme.backgroundColor }}
        refreshControl={
          <RefreshControl
           refreshing={isRefreshing} 
           onRefresh={onRefresh}
           tintColor="#7049f6"
           colors={['#7049f6', '#ff6347', '#32cd32']}
           progressBackgroundColor="#fafafa"
          />
        }
      >
        <View style={styles.container}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: userData.profilePicture }} style={styles.profileImage} />
          
          <View style={styles.profileInfoContainer}>
            <View style={styles.profileInfoInner}>
              <View style={styles.profileInfoData}>
                <Text style={styles.fullname}>{userData.fullname}</Text>
                <Text style={styles.username}>@{userData.username}</Text>
              </View> 
        
              <TouchableOpacity
                style={styles.followButton}
                onPress={() => navigation.navigate('EditProfile', { updateUserData: setUserData, onRefreshProfile: handleRefreshProfile })}
              >
                <Text style={styles.followButtonText}>Edit Profile</Text>
              </TouchableOpacity>
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
                    <Text style={styles.count}>
                     {userData.postCount}
                    </Text>
                    &nbsp;posts</Text>
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
                    <Text style={styles.count}>
                      {followerCount}
                    </Text>
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
                    <Text style={styles.count}>
                    {followingCount}
                    </Text>
                     &nbsp;following
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

          </View>
        </View>

           {userData.bio ? (
            <Text style={styles.bio}>{userData.bio}</Text>
            ) : null}

          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: screenWidth }}
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
                else if (route.key === 'likes') {
                  iconSize = 22;
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