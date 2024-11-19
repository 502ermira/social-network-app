import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemeContext } from '../contexts/ThemeContext';

export default function CustomHeader({ title, screenType, toggleMenu }) {
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();
  
  const { currentTheme } = useContext(ThemeContext);
  return (
    <View 
      style={[
        screenType === 'UserProfileScreen' ? styles.headerContainer 
        : screenType === 'ProfileScreen' && !canGoBack ? styles.headerContainerNew
        : screenType === 'ProfileScreen' ? styles.headerContainerProfile 
        : screenType === 'FollowersFollowing' ? styles.headerContainerFollowers 
        : styles.headerContainerNull,
        { backgroundColor: currentTheme.backgroundColor, borderColor: currentTheme.borderColor }
      ]}
    >
      {canGoBack && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back-outline" size={24} color={currentTheme.textColor} />
        </TouchableOpacity>
      )}
      
      <Text style={[styles.headerTitle, { color: currentTheme.textColor }]}>{title}</Text>

      {screenType === 'UserProfileScreen' ? (
        <TouchableOpacity onPress={toggleMenu} style={[styles.menuButton,{ marginLeft : 0}]}>
         <MaterialIcons name="menu-open" size={26.5} color={currentTheme.textColor} />
        </TouchableOpacity>

      ) : screenType === 'ProfileScreen' ? (
        <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')} style={styles.menuButton}>
          <Ionicons name="settings" size={24} color={currentTheme.textColor} />
        </TouchableOpacity>
      ) : screenType === 'FollowersFollowing' ? (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.followersButton}>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 11,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    textAlign: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop:56,
  },
  headerContainerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 11,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    textAlign: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop:56,
  },
  headerContainerNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 16,
    textAlign: 'center',
    width: '100%',
    justifyContent: 'space-between',
    paddingLeft: '46%',
    paddingTop:56,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  headerContainerNull: {
    paddingTop:56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding:15,
    borderBottomWidth: 0,
    textAlign: 'center',
    width: '100%',
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  headerContainerFollowers : {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 11,
    textAlign: 'center',
    width: '100%',
    justifyContent: 'space-between',
    paddingRight: '14%',
    paddingTop:56,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  headerTitle: {
    fontSize: 17.5,
    fontWeight: '600',
  },
  followersButton : {
    marginLeft:0,
    marginRight: '90%,'
  },
  backButton :{
    marginRight: 13,
  },
  menuButton : {
    marginLeft: 'auto',
  }
});
