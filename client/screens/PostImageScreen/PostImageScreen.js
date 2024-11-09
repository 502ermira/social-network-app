import { useState, useContext } from 'react';
import { Text, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ScrollView, Alert } from 'react-native';
import { UserContext } from '../../contexts/UserContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import CustomHeader from '../../components/CustomHeader';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { getPostImageScreenStyles } from './PostImageScreenStyles';

export default function PostImageScreen({ route, navigation }) {
  const { selectedImage, imagePrompt, embedding } = route.params;
  const { token, setIsLoggedIn, setUsername } = useContext(UserContext);
  const { currentTheme } = useContext(ThemeContext);
  const styles = getPostImageScreenStyles(currentTheme);
  const [description, setDescription] = useState('');
  
  const handleShare = async () => {
    try {
      if (!token) {
        // If user is not logged in, handle login based on platform
        if (Platform.OS === 'web') {
          const loginConfirm = window.confirm('Login Required: You need to log in to share images. Do you want to login?');
          if (loginConfirm) {
            navigation.navigate('Login', { 
              redirectTo: 'PostImageScreen', 
              imageParams: { selectedImage, imagePrompt, embedding } 
            });
          }
        } else {
          Alert.alert(
            'Login Required',
            'You need to log in to share images.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Login',
                onPress: () => navigation.navigate('Login', { 
                  redirectTo: 'PostImageScreen', 
                  imageParams: { selectedImage, imagePrompt, embedding } 
                }),
              },
            ]
          );
        }
      } else {
        // User is logged in, proceed with the sharing process
        const response = await fetch(API_ENDPOINTS.SHARE, {
          method: 'POST',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: { url: selectedImage, prompt: imagePrompt, embedding },
            description,
          }),
        });
  
        if (response.ok) {
          if (Platform.OS === 'web') {
            window.alert('Image shared successfully!');
            navigation.navigate('FavoritesScreen', { 
            });
          } else {
            Alert.alert('Success', 'Image shared successfully!', [
              {
                text: 'OK', 
                onPress: () => navigation.navigate('FavoritesScreen'),
              }
            ]);
          }
        } else {
          const errorData = await response.json();
          console.error(errorData);
          if (Platform.OS === 'web') {
            window.alert('Failed to share image.');
          } else {
            Alert.alert('Error', 'Failed to share image.');
          }
        }
      }
    } catch (err) {
      console.error(err);
      if (Platform.OS === 'web') {
        window.alert('Error occurred: ' + err.message);
      } else {
        Alert.alert('Error', 'Error occurred: ' + err.message);
      }
    }
  };  
  
  const handleDescriptionChange = (text) => {
    if (text.length <= 250) {
      setDescription(text);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 10, android: 10 })}
    >
      <CustomHeader title="Share Image" screenType="headerContainerNull" />

      <ScrollView 
        contentContainerStyle={styles.innerContainer}         
        showsVerticalScrollIndicator={false}              
      >
        <Image source={{ uri: selectedImage }} style={styles.image} />

        <Text style={styles.promptText}>
          Prompt: {imagePrompt}
        </Text>

        <TextInput
          value={description}
          onChangeText={handleDescriptionChange}
          placeholder="Enter a description"
          placeholderTextColor= {currentTheme.placeholderTextColor}
          style={styles.input}
          maxLength={250}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          onSubmitEditing={() => {
            Keyboard.dismiss();
          }}
          blurOnSubmit={true}
        />
        <Text style={styles.characterCount}>
          {description.length}/250 characters
        </Text>

        <TouchableOpacity   onPress={() => {handleShare()}} style={styles.shareButton} >
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}