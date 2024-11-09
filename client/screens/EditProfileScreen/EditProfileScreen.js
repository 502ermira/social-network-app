import { useContext, useState, useEffect } from 'react';
import { ScrollView, TextInput, Pressable, Text, Image, View, Alert, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { UserContext } from '../../contexts/UserContext';
import CustomHeader from '../../components/CustomHeader'; 
import * as FileSystem from 'expo-file-system';
import { ThemeContext } from '@/contexts/ThemeContext';
import { getEditProfileScreenStyles } from './EditProfileScreenStyles';

let debounceTimeout;

export default function EditProfileScreen({ navigation, route }) {
  const { token, setUsername: setContextUsername } = useContext(UserContext);
  const { currentTheme } = useContext(ThemeContext);
  const styles = getEditProfileScreenStyles(currentTheme);
  const { updateUserData } = route.params;

  const [fullname, setFullname] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  const [validationLoading, setValidationLoading] = useState(false);
  const [initialFullname, setInitialFullname] = useState('');
  const [initialProfilePicture, setInitialProfilePicture] = useState('');
  const [initialUsername, setInitialUsername] = useState('');
  const [initialEmail, setInitialEmail] = useState('');
  const [initialBio, setInitialBio] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [fullnameError, setFullnameError] = useState('');
  const [bioError, setBioError] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PROFILE, {
          headers: { Authorization: token },
        });
        const data = await response.json();
        setFullname(data.fullname || '');
        setProfilePicture(data.profilePicture || '');
        setUsername(data.username || '');
        setEmail(data.email || '');
        setBio(data.bio || '');

        setInitialFullname(data.fullname || '');
        setInitialProfilePicture(data.profilePicture || '');
        setInitialUsername(data.username || '');
        setInitialEmail(data.email || '');
        setInitialBio(data.bio || '');
      } catch (error) {
        Alert.alert('Error', 'Failed to load profile data');
      }
    };

    fetchUserData();
  }, [token]);

  const debounce = (func, delay) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(func, delay);
  };

  useEffect(() => {
    if (email && email.trim().toLowerCase() !== initialEmail.trim().toLowerCase() && initialEmail) {
      debounce(async () => {
        try {
          const response = await fetch(API_ENDPOINTS.UPDATE_EMAIL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token,
            },
            body: JSON.stringify({ email: email.trim().toLowerCase() }),
          });
          const result = await response.json();
          if (result.error) {
            setEmailError(result.error);
          } else {
            setEmailError('');
          }
        } catch (err) {
          setEmailError('Error validating email');
        }
      }, 1000);
    } else if (!email.trim()) {
      setEmailError('');
    }
  }, [email, initialEmail]);  

  useEffect(() => {
    if (fullname && fullname !== initialFullname) {
      debounce(() => {
        if (fullname.length < 3 || fullname.length > 25) {
          setFullnameError('Full name must be between 3 and 25 characters.');
        } else if (/\d/.test(fullname)) {
          setFullnameError('Full name must not contain numbers.');
        } else if (/ {2,}/.test(fullname)) {
          setFullnameError('Full name must not contain consecutive spaces.');
        } else if (!/^[a-zA-Z]+(?: [a-zA-Z]+)*$/.test(fullname)) {
          setFullnameError('Full name must start with a letter and contain only letters and spaces.');
        } else {
          setFullnameError('');
        }
      }, 1000);
    } else {
      setFullnameError('');
    }
  }, [fullname, initialFullname]);  
  
  useEffect(() => {
    if (bio && bio !== initialBio) {
      debounce(() => {
        if (bio.length > 150) {
          setBioError('Bio cannot exceed 150 characters.');
        } else {
          setBioError('');
        }
      }, 1000);
    } else {
      setBioError('');
    }
  }, [bio, initialBio]);  
  
  useEffect(() => {
    if (username && username !== initialUsername && initialUsername) {
        setValidationLoading(true);
        debounce(async () => {
            try {
                if (/_{2,}/.test(username) || /\.(?=\.)/.test(username) || /[_.]{2,}/.test(username)) {
                    setUsernameError('Username cannot contain consecutive underscores or full stops.');
                    setValidationLoading(false);
                    return;
                }

                const response = await fetch(API_ENDPOINTS.UPDATE_USERNAME, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: token,
                    },
                    body: JSON.stringify({ username }),
                });
                const result = await response.json();
                if (result.error) {
                    setUsernameError(result.error);
                } else {
                    setUsernameError('');
                }
            } catch (err) {
                setUsernameError('Error validating username');
            } finally {
                setValidationLoading(false);
            }
        }, 1000);
    } else if (!username.trim()) {
        setUsernameError('');
    }
}, [username, initialUsername]);

  const handleSave = async () => {
    if (validationLoading) {
      Alert.alert('Error', 'Please wait for validation to finish.');
      return;
    }
  
    setUsernameError('');
    setEmailError('');
    setFullnameError('');
    setBioError('');

    const trimmedFullname = fullname.trim();
    const trimmedBio = bio.trim();
  
    if (
      trimmedFullname === initialFullname &&
      trimmedBio === initialBio &&
      profilePicture === initialProfilePicture &&
      username.toLowerCase() === initialUsername.toLowerCase() &&
      email.toLowerCase() === initialEmail.toLowerCase()
    ) {
      navigation.goBack();
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          fullname: trimmedFullname,
          profilePicture,
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          bio: trimmedBio,
        }),
      });
  
      const result = await response.json();
      setLoading(false);
  
      if (response.ok) {
        if (result.updates) {
          updateUserData(result.updates);
  
          if (result.updates.username && result.updates.username !== initialUsername) {
            setUsername(result.updates.username);
            setContextUsername(result.updates.username);
  
            await AsyncStorage.setItem('username', result.updates.username);
          }
        }
        Alert.alert('Success', 'Profile updated successfully');
        route.params?.onRefreshProfile?.();
        navigation.goBack();
      } else {
        if (result.error.includes('Username already taken')) {
          setUsernameError('Username already taken');
        }
        if (result.error.includes('Email already in use')) {
          setEmailError('Email already in use');
        }
      }
    } catch (err) {
      setLoading(false);
      console.error('Update failed:', err);
      Alert.alert('Error', 'Update failed');
    }
  };  
  
  const selectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Error', 'Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      if (Platform.OS === 'web') {
        const webUri = result.assets[0].uri;
        setProfilePicture(webUri);
      } else {
        const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setProfilePicture(`data:image/jpeg;base64,${base64}`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Edit Profile" screenType={null} />
    <ScrollView>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.imageContainer}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
          </View>
          <Pressable onPress={selectImage} style={styles.imageButton}>
            <Text style={styles.imageButtonText}>Select Profile Picture</Text>
          </Pressable>

          <TextInput
            placeholder="Full Name"
            value={fullname}
            onChangeText={setFullname}
            style={styles.input}
            placeholderTextColor={currentTheme.placeholderTextColor}
          />
          {fullnameError ? <Text style={styles.fieldErrorText}>{fullnameError}</Text> : null}

          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholderTextColor={currentTheme.placeholderTextColor}
          />
          {usernameError ? <Text style={styles.fieldErrorText}>{usernameError}</Text> : null}

          <TextInput
           placeholder="Add bio"
           placeholderTextColor={currentTheme.placeholderTextColor}
           value={bio}
           onChangeText={(text) => {
             if (text.length <= 150) {
             setBio(text);
             }
           }}
           maxLength={150}
           multiline={true}
           onSubmitEditing={() => {
            Keyboard.dismiss();
           }}
           style={[styles.input, styles.bioInput]}
           blurOnSubmit={true}
          />
           <Text style={styles.characterCount}>
             {bio.length}/150 characters
           </Text>
           {bioError ? <Text style={styles.fieldErrorText}>{bioError}</Text> : null}

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            placeholderTextColor={currentTheme.placeholderTextColor}
          />
          {emailError ? <Text style={styles.fieldErrorText}>{emailError}</Text> : null}

          <Pressable onPress={handleSave} style={styles.saveButton} disabled={loading}>
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScrollView>
    </View>
  );
}