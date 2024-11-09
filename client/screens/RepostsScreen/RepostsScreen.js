import { useEffect, useState, useContext } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { getRepostScreenStyles } from './RepostsScreenStyles';
import Loader from '@/components/Loader';
import CustomHeader from '@/components/CustomHeader';
import { API_ENDPOINTS } from '@/config/apiConfig';

export default function RepostsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { postId } = route.params;
  const { token, username: loggedInUsername } = useContext(UserContext);
  const { currentTheme } = useContext(ThemeContext);
  const styles = getRepostScreenStyles(currentTheme);
  const [reposts, setReposts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedByUsers, setBlockedByUsers] = useState([]);

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

    const fetchReposts = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.POST_REPOSTS(postId), {
          headers: { Authorization: token },
        });
        const data = await response.json();

        if (response.ok) {
          setReposts(data);
        } else {
          console.error('Failed to fetch reposts:', data.error);
        }
      } catch (error) {
        console.error('Error fetching reposts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlockedUsers();
    fetchReposts();
  }, [postId, token]);

  const handleUserPress = (user) => {
    if (user.username === loggedInUsername) {
      navigation.push('Profile');
    } else {
      navigation.push('UserProfile', { username: user.username });
    }
  };

const filteredReposts = reposts.filter(
  repost =>
    !blockedUsers.includes(repost.user.username) &&
    !blockedByUsers.includes(repost.user.username) &&
    (repost.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
     repost.user.fullname.toLowerCase().includes(searchQuery.toLowerCase()))
);

  return (
    <View style={styles.container}>
      <CustomHeader title="Reposts" />
      <TextInput
        style={styles.searchBar}
        placeholder="Search Reposts"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={currentTheme.placeholderTextColor}
      />
      
      {isLoading ? ( 
        <Loader />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {filteredReposts.length > 0 ? (
            filteredReposts.map((repost) => (
              <TouchableOpacity key={repost._id} style={styles.repost} onPress={() => handleUserPress(repost.user)}>
                <Image source={{ uri: repost.user.profilePicture }} style={styles.profileImage} />
                <View style={styles.repostInfo}>
                  <Text style={styles.username}>{repost.user.fullname} (@{repost.user.username})</Text>
                  <Text style={styles.repostedAt}>
                    Reposted on {new Date(repost.repostedAt).toLocaleTimeString([], { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No user found.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}