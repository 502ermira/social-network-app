import React, { useContext } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import logo from '../assets/images/logo.png';
import styles from './NavbarStyles';

export default function Navbar({currentRoute}) {
  const navigation = useNavigation();
  const { isLoggedIn } = useContext(UserContext);
  const { currentTheme, theme } = useContext(ThemeContext);

  const handleNavigation = (screen) => {
    navigation.reset({
      index: 0,
      routes: [{ name: screen }],
    });
  };

  const isDarkMode = theme === 'dark'; 
  const borderColor = isDarkMode ? '#0a0a0a' : '#ccc';
  const tintColor = isDarkMode ? '#rgba(255,255,255,1)' : '#rgba(0,0,0,0.85)';
  topNavBackground = isDarkMode ? '#000' : currentTheme.backgroundColor;
  
  return (
    <>
      {!isLoggedIn ? (
        // Navbar for Logged Out Users (Top Navbar)
        <View style={[styles.navbarTopContainer, { backgroundColor: topNavBackground, borderColor: borderColor }]}>
          <TouchableOpacity onPress={() => handleNavigation('LandingScreen')}>
          <Image source={logo} style={styles.logo} />
          </TouchableOpacity>
          <View style={styles.authContainer}>
            <TouchableOpacity
              style={styles.authButton}
              onPress={() => handleNavigation('Login')}>
              <Text style={styles.authButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.authButton}
              onPress={() => handleNavigation('Signup')}>
              <Text style={styles.authButtonText}>Signup</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Navbar for Logged In Users (Bottom Navbar)
        <BlurView intensity={20} tint="light" style={styles.navbarBottomContainer}>
        <TouchableOpacity 
          onPress={() => handleNavigation('HomeScreen')} 
          style={[styles.navButton, currentRoute === 'HomeScreen' && styles.activeTab]}>
          <Feather 
            name="home" 
            style={[styles.navIcon, currentRoute === 'HomeScreen' && styles.activeIcon]} 
          />
        </TouchableOpacity>
  
        <TouchableOpacity 
          onPress={() => handleNavigation('SearchScreen')} 
          style={[styles.navButton, currentRoute === 'SearchScreen' && styles.activeTab]}>
          <Feather 
            name="search" 
            style={[styles.navIcon, currentRoute === 'SearchScreen' && styles.activeIcon]} 
          />
        </TouchableOpacity>
  
        <TouchableOpacity 
          onPress={() => handleNavigation('UploadScreen')} 
          style={[styles.navButton, currentRoute === 'UploadScreen' && styles.activeTab]}>
          <SimpleLineIcons 
            name="camera" 
            style={[styles.navIcon, currentRoute === 'UploadScreen' && styles.activeIcon]} 
          />
        </TouchableOpacity>
  
        <TouchableOpacity 
          onPress={() => handleNavigation('NotificationScreen')} 
          style={[styles.navButton, currentRoute === 'NotificationScreen' && styles.activeTab]}>
          <FontAwesome 
            name="bell-o" 
            style={[styles.navIcon, currentRoute === 'NotificationScreen' && styles.activeIcon]} 
          />
        </TouchableOpacity>
  
        <TouchableOpacity 
          onPress={() => handleNavigation('Profile')} 
          style={[styles.navButton, currentRoute === 'Profile' && styles.activeTab]}>
          <FontAwesome 
            name="user-o" 
            style={[styles.navIcon, currentRoute === 'Profile' && styles.activeIcon]} 
          />
        </TouchableOpacity>
      </BlurView>

      )}
    </>
  );
}