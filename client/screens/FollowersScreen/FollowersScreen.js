import { useState, useEffect, useContext, memo } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { getFollowersScreenStyles } from './FollowersScreenStyles';
import { UserContext } from '../../contexts/UserContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import CustomHeader from '@/components/CustomHeader';
import Loader from '@/components/Loader';
import { API_ENDPOINTS } from '@/config/apiConfig';

export default function FollowersFollowingScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { username: loggedInUsername, token } = useContext(UserContext);
  const { currentTheme } = useContext(ThemeContext);
  const styles = getFollowersScreenStyles(currentTheme);
  const { username, type } = route.params;
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedByUsers, setBlockedByUsers] = useState([]);
  const [followingStatus, setFollowingStatus] = useState({});
  const [index, setIndex] = useState(type === 'followers' ? 0 : 1);
  const [routes] = useState([
    { key: 'followers', title: 'Followers' },
    { key: 'following', title: 'Following' },
  ]);


  useEffect(() => {
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
  
    const fetchFollowersAndFollowing = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.FOLLOWERS_FOLLOWING(username), {
          headers: {
            Authorization: token,
          },
        });
        const data = await response.json();
        setFollowers(data.followers);
        setFollowing(data.following);

        const status = {};
        data.following.forEach(user => {
          status[user.followingId.username] = true;
        });
        data.followers.forEach(user => {
          if (!status[user.followerId.username]) {
            status[user.followerId.username] = false;
          }
        });
        setFollowingStatus(status);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching followers and following:', error);
        setLoading(false);
      }
    };

    fetchBlockedUsers(); 
    fetchFollowersAndFollowing();
  }, [username, token]);

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

  const handleUserPress = (user) => {
    if (user.username === loggedInUsername) {
      navigation.push('Profile');
    } else {
      navigation.push('UserProfile', { username: user.username });
    }
  };

  const renderUserItem = (user, isFollowing) => (
    <View key={user.username} style={styles.userItemContainer}>
      <TouchableOpacity style={styles.userItem} onPress={() => handleUserPress(user)}>
        <Image source={{ uri: user.profilePicture }} style={styles.userImage} />
        <View style={styles.userInfo}>
          <Text style={styles.fullname}>{user.fullname}</Text>
          <Text style={styles.username}>@{user.username}</Text>
        </View>
      </TouchableOpacity>
      {user.username !== loggedInUsername && (
        <TouchableOpacity
          style={[styles.followButton, isFollowing ? styles.following : styles.notFollowing]}
          onPress={() => handleFollowToggle(user)}
        >
          <Text style={styles.followButtonText}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const FollowersRoute = memo(() => {
    const [searchQuery, setSearchQuery] = useState('');
    const filteredFollowers = followers.filter(follower => 
      !blockedUsers.includes(follower.followerId.username) && 
      !blockedByUsers.includes(follower.followerId.username) && 
      (follower.followerId.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
       follower.followerId.fullname.toLowerCase().includes(searchQuery.toLowerCase()))
    );
       
  
    return (
      <View style={styles.tabSceneContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search Followers"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor='#aaa'
        />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {filteredFollowers.length > 0 ? (
            filteredFollowers.map((follower) =>
              renderUserItem(follower.followerId, followingStatus[follower.followerId.username])
            )
          ) : (
            <Text style={styles.emptyText}>No followers found</Text>
          )}
        </ScrollView>
      </View>
    );
  });
  
  const FollowingRoute = memo(() => {
    const [searchQuery, setSearchQuery] = useState('');
    const filteredFollowing = following.filter(user => 
      !blockedUsers.includes(user.followingId.username) && 
      !blockedByUsers.includes(user.followingId.username) && 
      (user.followingId.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
       user.followingId.fullname.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    return (
      <View style={styles.tabSceneContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search Following"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor='#aaa'
        />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {filteredFollowing.length > 0 ? (
            filteredFollowing.map((user) =>
              renderUserItem(user.followingId, followingStatus[user.followingId.username])
            )
          ) : (
            <Text style={styles.emptyText}>No following found</Text>
          )}
        </ScrollView>
      </View>
    );
  });

  const renderScene = SceneMap({
    followers: FollowersRoute,
    following: FollowingRoute,
  });

  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title={`${username}`} screenType={`FollowersFollowing`} />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ height: 1.8, backgroundColor: '#7049f6', marginBottom:1 }}
            style={styles.tabBar}
            labelStyle={{ color: currentTheme.textColor, fontWeight: '400', fontSize:13.5 }}
          />
        )}
      />
    </View>
  );
}