import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';
import { getLandingScreenStyles } from './LandingScreenStyles.js';

import logo from '@/assets/images/logo.png';
const bgImage = require('../../assets/images/bg1.jpg');

const LandingScreen = ({ navigation }) => {
  const { currentTheme, theme } = useContext(ThemeContext);
  const styles = getLandingScreenStyles(currentTheme);

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.overlay} />

      <View style={styles.container}>
        <Image source={logo} style={styles.logo} />
        
        <Text style={styles.title}>Welcome to ErLink</Text>
        <Text style={styles.subtitle}>Connect, Share, and Explore</Text>

        <TouchableOpacity 
          style={styles.signupButton} 
          onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default LandingScreen;