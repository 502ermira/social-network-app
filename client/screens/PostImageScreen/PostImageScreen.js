import { useState, useContext } from 'react';
import { Text, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ScrollView, Alert } from 'react-native';
import { UserContext } from '../../contexts/UserContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import CustomHeader from '../../components/CustomHeader';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { getPostImageScreenStyles } from './PostImageScreenStyles';

export default function PostImageScreen({ route, navigation }) {
  const { imageUri, description: initialDescription } = route.params;
  const { token, setIsLoggedIn, setUsername } = useContext(UserContext);
  const { currentTheme } = useContext(ThemeContext);
  const styles = getPostImageScreenStyles(currentTheme);
  const [description, setDescription] = useState(initialDescription || '');

  const handleShare = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.SHARE, {
          method: 'POST',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: imageUri, description }),
        });

        if (response.ok) {
          if (Platform.OS === 'web') {
            window.alert('Image shared successfully!');
          } else {
            Alert.alert('Success', 'Image shared successfully!', [{ text: 'OK', onPress: () => navigation.navigate('FavoritesScreen') }]);
          }
        } else {
          const errorData = await response.json();
          console.error(errorData);
          if (Platform.OS === 'web') window.alert('Failed to share image.');
          else Alert.alert('Error', 'Failed to share image.');
        }
      } catch (err) {
        console.error(err);
        if (Platform.OS === 'web') window.alert('Error occurred: ' + err.message);
        else Alert.alert('Error', 'Error occurred: ' + err.message);
      }
  };

  const handleDescriptionChange = (text) => {
    if (text.length <= 250) setDescription(text);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <CustomHeader title="Share Image" screenType="headerContainerNull" />

      <ScrollView contentContainerStyle={styles.innerContainer} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: imageUri }} style={styles.image} />

        <TextInput
          value={description}
          onChangeText={handleDescriptionChange}
          placeholder="Enter a description"
          placeholderTextColor={currentTheme.placeholderTextColor}
          style={styles.input}
          maxLength={250}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          onSubmitEditing={() => Keyboard.dismiss()}
          blurOnSubmit={true}
        />
        <Text style={styles.characterCount}>{description.length}/250 characters</Text>

        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
