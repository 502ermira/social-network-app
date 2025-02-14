import React, { useContext } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import logo from '../assets/images/logo.png';
import styles from './NavbarStyles';

export default function Navbar() {
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
        <View style={[styles.navbarBottomContainer,  { backgroundColor: currentTheme.backgroundColor, borderTopColor: borderColor }]}>
          <TouchableOpacity onPress={() => handleNavigation('HomeScreen')}>
            <Icon name="home" style={[styles.navIcon, { color: currentTheme.iconColor }]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => handleNavigation('SearchScreen')}>
            <Icon name="search" style={[styles.navIcon, { color: currentTheme.iconColor }]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigation('UploadScreen')}>
            <Icon name="plus" style={[styles.navIcon, { color: currentTheme.iconColor }]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigation('NotificationScreen')}>
          <MaterialCommunityIcons name="bell" style={[styles.navIcon, { color: currentTheme.iconColor }]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigation('Profile')}>
            <Icon name="user" style={[styles.navIcon, { color: currentTheme.iconColor }]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigation('SettingsScreen')}>
           <MaterialIcons name="settings" style={[styles.navIcon, { color: currentTheme.iconColor }]} />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}