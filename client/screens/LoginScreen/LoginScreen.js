import { useState, useContext } from 'react';
import { TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../components/Loader.js';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { UserContext } from '../../contexts/UserContext.js';
import { ThemeContext } from '../../contexts/ThemeContext.js';
import { getLoginScreenStyles } from './LoginScreenStyles';

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setIsLoggedIn, setUsername } = useContext(UserContext);
  const { currentTheme } = useContext(ThemeContext);
  const styles = getLoginScreenStyles(currentTheme);

  const { redirectTo, imageParams } = route.params || {};

  const loginUser = async () => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase();
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('username', data.username);

        setIsLoggedIn(true);
        setUsername(data.username);

        if (redirectTo) {
          navigation.replace(redirectTo, imageParams);
        } else {
          navigation.replace('TextPromptScreen');
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Login request failed:', err);
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {loading ? (
        <Loader />
      ) : (
        <>
          <Text style={styles.title}>Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#eee"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#eee"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.button} onPress={loginUser}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text 
              style={styles.signupLink}
              onPress={() => navigation.navigate('Signup', { redirectTo, imageParams })}
            >
              Sign up
            </Text>
          </Text>
        </>
      )}
    </KeyboardAvoidingView>
  );
}