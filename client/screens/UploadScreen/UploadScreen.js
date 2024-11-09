import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { getUploadScreenStyles } from './UploadScreenStyles';
import { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const UploadScreen = ({ navigation }) => {
  const { currentTheme } = useContext(ThemeContext);
  const styles = getUploadScreenStyles(currentTheme);

  const [imageUri, setImageUri] = useState(null);
  const [error, setError] = useState('');

  const selectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      setError('Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      navigateToPostImage(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      setError('Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      navigateToPostImage(result.assets[0].uri);
    }
  };

  const navigateToPostImage = async (uri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      navigation.navigate('PostImageScreen', {
        imageUri: `data:image/jpeg;base64,${base64}`
      });
    } catch (err) {
      setError('Failed to upload image');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload</Text>
      
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      )}

      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={selectImage} style={styles.iconButton}>
          <Ionicons name="images-outline" size={30} color={currentTheme.primaryColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={openCamera} style={styles.iconButton}>
          <Ionicons name="camera-outline" size={30} color={currentTheme.primaryColor} />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default UploadScreen;