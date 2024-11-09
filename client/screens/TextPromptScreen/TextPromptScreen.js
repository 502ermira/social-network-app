import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ImageBackground, TextInput, ScrollView, Image, TouchableOpacity, Switch  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../../contexts/UserContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getTextPromptScreenStyles } from './TextPromptScreenStyles';
import { API_ENDPOINTS } from '@/config/apiConfig';

const darkBackgroundImage = require('../../assets/images/bg.jpg');
const lightBackgroundImage = require('../../assets/images/light-bg.jpg');

export default function TextPromptScreen() {
  const { isLoggedIn } = useContext(UserContext);
  const { currentTheme, theme } = useContext(ThemeContext);
  const styles = getTextPromptScreenStyles(currentTheme);
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [token, setToken] = useState('');
  const [embedding, setEmbedding] = useState(null);

  const navigation = useNavigation();

  const isDarkMode = theme === 'dark'; 
  const bgImage = isDarkMode ? darkBackgroundImage : lightBackgroundImage;
  const fontWeight = isDarkMode ? 500 : 700;
  const descriptionFontWeight = isDarkMode ? 400 : 500;

  const loadFavorites = async () => {
    const storedToken = await AsyncStorage.getItem('token');
    setToken(storedToken);

    if (storedToken) {
      const response = await fetch(API_ENDPOINTS.GET_FAVORITES, {
        headers: { Authorization: storedToken },
      });
      const data = await response.json();
      setFavorites(data.favorites || []);
    } else {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      } else {
        setFavorites([]);
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  useEffect(() => {
    loadFavorites();
  }, [isLoggedIn]);

  const isFavorited = favorites.some(favorite => favorite.image === imageUrl);

  const generateImage = async () => {
    setLoading(true);
    setError(null);
    try {
        const response = await fetch(API_ENDPOINTS.GENERATE_IMAGE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify({ prompt }),
        });
        const data = await response.json();

        if (response.ok) {
            setImageUrl(data.image);
            const embedding = data.embedding;
            setEmbedding(embedding);
        } else {
            setError(data.error || 'Failed to generate image');
        }
    } catch (err) {
        setError('Error occurred: ' + err.message);
    } finally {
        setLoading(false);
    }
};

const saveFavorite = async () => {
  const favoriteObject = {
    prompt,
    image: imageUrl,
    embedding,
  };

  try {
    if (token) {
      // Save to backend if user is logged in
      const response = await fetch(API_ENDPOINTS.GET_FAVORITES, {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(favoriteObject),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save favorite');
      } else {
        setFavorites(prevFavorites => [...prevFavorites, favoriteObject]);
        alert('Favorite saved successfully');
      }
    } else {
      // Save to AsyncStorage for guest users
      const updatedFavorites = [...favorites, favoriteObject];
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      alert('Favorite saved locally');
    }
  } catch (error) {
    console.error('Error saving favorite:', error);
    alert('Error saving favorite: ' + error.message);
  }
};
  
const toggleFavorite = async () => {
  if (isFavorited) {
    try {
      if (token) {
        const response = await fetch(API_ENDPOINTS.UNFAVORITE, {
          method: 'POST',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: imageUrl }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to unfavorite');
        }
      }

      const updatedFavorites = favorites.filter(favorite => favorite.image !== imageUrl);
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      alert('Image unfavorited');
    } catch (error) {
      console.error('Error unfavoriting image:', error);
      alert('Error unfavoriting image: ' + error.message);
    }
  } else {
    await saveFavorite();
  }
};
  
const previewFavorites = [...favorites].reverse().slice(0, 6);

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <ScrollView  contentContainerStyle={isLoggedIn ? styles.scrollViewLoggedIn : styles.scrollViewLoggedOut}>
        <View style={styles.container}>
          <Text style={[styles.title, {fontWeight: fontWeight}]}>Create, Share, and Inspire with ART-GEN!</Text>
          <Text style={[styles.description, {fontWeight:descriptionFontWeight}]}>
            Enter a creative prompt and watch as AI transforms it into a unique piece of art. Share your work with others and build your gallery!
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter prompt"
            value={prompt}
            onChangeText={setPrompt}
            placeholderTextColor={currentTheme.placeholderTextColor}
            maxLength={85}
          />
          <TouchableOpacity style={styles.button} onPress={generateImage} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Generating...' : 'Generate Image'}</Text>
          </TouchableOpacity>
          {error && <Text style={styles.error}>{error}</Text>}
  
          {imageUrl && (
            <>
              <Image source={{ uri: imageUrl }} style={styles.image} />
              <TouchableOpacity style={styles.favoritesButton} onPress={toggleFavorite}>
                <Text style={styles.buttonText}>{isFavorited ? '  Unfavorite  ' : '  Favorite  '}</Text>
              </TouchableOpacity>
            </>
          )}
  
          {previewFavorites.length > 0 ? (
            <View style={styles.previewContainer}>
              <Text style={[styles.favoritesTitle, {fontWeight: fontWeight}]}>Favorite Images</Text>
              <View style={styles.previewGrid}>
                {previewFavorites.map((favorite, index) => (
                  <Image
                    key={index}
                    source={{ uri: typeof favorite === 'string' ? favorite : favorite.image }}
                    style={styles.previewImage}
                  />
                ))}
              </View>
              <TouchableOpacity style={styles.favoritesButton} onPress={() => navigation.navigate('FavoritesScreen')}>
                <Text style={styles.buttonText}>See All Favorites</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </ImageBackground>
  );  
}