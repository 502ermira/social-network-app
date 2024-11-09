import { useState, useEffect, useContext } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Image } from 'react-native';
import { UserContext } from '../../contexts/UserContext';
import { API_ENDPOINTS } from '../../config/apiConfig';
import CustomHeader from '@/components/CustomHeader';
import Loader from '@/components/Loader';
import { ThemeContext } from '../../contexts/ThemeContext';
import { getFollowersScreenStyles } from '../FollowersScreen/FollowersScreenStyles';

export default function BlockedUsersScreen() {
  const { token } = useContext(UserContext);
  const { currentTheme } = useContext(ThemeContext);
  const styles = getFollowersScreenStyles(currentTheme);

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.BLOCKED_USERS, {
          headers: { Authorization: token },
        });
        const data = await response.json();

        if (response.ok) {
          setBlockedUsers(data.blockedUsers);
        } else {
          console.error('Failed to fetch blocked users:', data.error);
        }
      } catch (error) {
        console.error('Error fetching blocked users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedUsers();
  }, [token]);

  const handleUnblockUser = async (username) => {
    try {
      const response = await fetch(API_ENDPOINTS.UNBLOCK_USER(username), {
        method: 'POST',
        headers: { Authorization: token },
      });

      if (response.ok) {
        setBlockedUsers((prevUsers) => 
          prevUsers.filter(user => user.username !== username)
        );
      } else {
        const data = await response.json();
        console.error('Failed to unblock user:', data.error);
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="Blocked Users" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {blockedUsers.length > 0 ? (
          blockedUsers.map((user, index) => (
            <View key={index} style={styles.userItemContainer}>
              <View style={styles.userItem}>
                <Image 
                  source={{ uri: user.profilePicture }} 
                  style={styles.userImage} 
                />
                <View style={styles.userInfo}>
                  <Text style={styles.fullname}>{user.fullname}</Text>
                  <Text style={styles.username}>@{user.username}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.followButton}
                onPress={() => handleUnblockUser(user.username)}
              >
                <Text style={styles.followButtonText}>Unblock</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No blocked users</Text>
        )}
      </ScrollView>
    </View>
  );
}