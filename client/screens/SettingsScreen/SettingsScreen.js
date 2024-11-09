import React, { useContext, useState } from 'react';
import { Text, TouchableOpacity, View, Switch } from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import { UserContext } from '../../contexts/UserContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import styles from './SettingsScreenStyles.js';

export default function SettingsScreen({ navigation }) {
  const { handleLogout} = useContext(UserContext);
  const { currentTheme, toggleTheme, theme } = useContext(ThemeContext);

  const handleLogoutAndRefresh = () => {
    handleLogout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'TextPromptScreen' }],
    });
  };

  const navigateToChangePassword = () => {
    navigation.navigate('ChangePasswordScreen');
  };

  const navigateToFavorites = () => {
    navigation.navigate('FavoritesScreen');
  };

  const navigateToBlockedUsers = () => {
    navigation.navigate('BlockedUsersScreen');
    };

  return (
    <>
      <CustomHeader title="Settings" screenType={null} />
      <View style={[styles.container,{ backgroundColor: currentTheme.backgroundColor }]}>
        <TouchableOpacity style={[styles.option,{ backgroundColor: currentTheme.optionBackground }]} onPress={navigateToChangePassword}>
          <Text style={[styles.optionText,{ color: currentTheme.textColor }]}>Change Password</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.option,{ backgroundColor: currentTheme.optionBackground }]} onPress={navigateToFavorites}>
          <Text style={[styles.optionText,{ color: currentTheme.textColor }]}>Favorites</Text>
        </TouchableOpacity>

        <View style={[styles.switchContainer,{ backgroundColor: currentTheme.optionBackground }]}>
          <Text style={[styles.optionText,{ color: currentTheme.textColor }]}>Dark Mode</Text>
          <Switch
           value={theme === 'dark'}
           onValueChange={toggleTheme}
           trackColor={{ false: '#767577', true: '#222' }}
           thumbColor={theme === 'dark' ? '#bbb' : '#fff'}
           ios_backgroundColor="#888"
          />
        </View>

        <TouchableOpacity style={[styles.option,{ backgroundColor: currentTheme.optionBackground }]} onPress={navigateToBlockedUsers}>
          <Text style={[styles.optionText,{ color: currentTheme.textColor }]}>Blocked Users</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.option,{ backgroundColor: currentTheme.optionBackground }]} onPress={handleLogoutAndRefresh}>
          <Text style={[styles.optionText,{ color: currentTheme.textColor }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}