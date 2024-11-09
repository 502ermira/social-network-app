import { useState, useContext } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../../contexts/UserContext';
import ExploreScreen from '../ExploreScreen/ExploreScreen';
import { ThemeContext } from '../../contexts/ThemeContext';
import { getSearchScreenStyles } from './SearchScreenStyles';

export default function SearchScreen() {
  const { token, username: loggedInUsername } = useContext(UserContext);
  const { currentTheme } = useContext(ThemeContext);
  const styles = getSearchScreenStyles(currentTheme);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageResults, setImageResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const layout = Dimensions.get('window');

  const fetchBlockedUsers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.BLOCKED_USERS, {
        headers: { Authorization: token },
      });
      const data = await response.json();
      if (response.ok) {
        return {
          blockedUsers: (data.blockedUsers || []).map(user => user.username),
          blockedByUsers: (data.blockedByUsers || []).map(user => user.username),
        };
      } else {
        console.error('Failed to fetch blocked users:', data.error);
        return { blockedUsers: [], blockedByUsers: [] };
      }
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      return { blockedUsers: [], blockedByUsers: [] };
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') return;
    setIsLoading(true);

    try {
      const { blockedUsers, blockedByUsers } = await fetchBlockedUsers();
      const imageResponse = await fetch(API_ENDPOINTS.SEARCH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const imageData = await imageResponse.json();
      const filteredImages = (imageData.results || []).filter(
        item => !blockedUsers.includes(item.username) && !blockedByUsers.includes(item.username)
      );
      setImageResults(filteredImages);

      const userResponse = await fetch(API_ENDPOINTS.SEARCH_USERS(searchQuery), {
        headers: { Authorization: token },
      });

      const userData = await userResponse.json();
      const filteredUsers = userData.filter(
        user => !blockedUsers.includes(user.username) && !blockedByUsers.includes(user.username)
      );
  
      setUserResults(filteredUsers);

    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultPress = (item) => {
    if (index === 0) {
      navigation.navigate('PostScreen', { postId: item.postId });
    } else if (index === 1) {
      if (item.username === loggedInUsername) {
        navigation.navigate('Profile');
      } else {
        navigation.navigate('UserProfile', { username: item.username });
      }
    }
  };

  const renderSearchResults = (type) => {
    const results = type === 'images' ? imageResults : userResults;
  
    if (!isLoading && results.length === 0) {
      return (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            {type === 'images' ? 'No images found' : 'No users found'}
          </Text>
        </View>
      );
    }
  
    return (
      <FlatList
        data={results}
        keyExtractor={(item) => (type === 'images' ? item.id : item.username)}
        numColumns={type === 'images' ? 2 : 1}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={type === 'images' ? styles.resultContainer : styles.userResultContainer}
            onPress={() => handleResultPress(item)}
          >
            {type === 'images' ? (
              <View style={styles.postContainer}>
                <Image source={{ uri: item.image }} style={styles.photoImage} />
                <View style={styles.userInfoContainer}>
                  <Image source={{ uri: item.profilePicture }} style={styles.profilePicture} />
                  <Text style={styles.usernamePost}>{item.username}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.userResult}>
                <Image source={{ uri: item.profilePicture }} style={styles.profileImage} />
                <View style={styles.textContainer}>
                  <Text style={styles.fullname}>{item.fullname}</Text>
                  <Text style={styles.username}>@{item.username}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    );
  };  

  const renderScene = SceneMap({
    images: () => renderSearchResults('images'),
    users: () => renderSearchResults('users'),
  });

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'images', title: 'Images' },
    { key: 'users', title: 'Users' },
  ]);

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      style={styles.tabBar}
      indicatorStyle={styles.tabIndicator}
      labelStyle={styles.tabLabel}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          placeholderTextColor={currentTheme.placeholderTextColor}
        />
        <TouchableOpacity
          style={styles.searchIconContainer}
          onPress={handleSearch}
        >
          <Icon name="search" size={28} style={styles.searchIconContainer}/>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : (imageResults.length > 0 || userResults.length > 0) ? (
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
        />
      ) : (
        <ExploreScreen />
      )}
    </View>
  );
}