import React, { useRef, useEffect, useState, useContext } from 'react';
import { View, Animated, Text, Image, TouchableOpacity, PanResponder } from 'react-native';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { getGlobalNotificationPopupStyles } from './GlobalNotificationPopupStyles.js';
import io from 'socket.io-client';
import { SOCKET_URL } from '@/config/apiConfig';
import { useNavigation, useNavigationState } from '@react-navigation/native';

export default function GlobalNotificationPopup() {
  const { token, username: loggedInUsername } = useContext(UserContext);
  const { currentTheme, theme } = useContext(ThemeContext);
  const styles = getGlobalNotificationPopupStyles(currentTheme);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const popupAnimation = useRef(new Animated.Value(-100)).current;
  const socket = useRef(null);
  const navigation = useNavigation();

  const isDarkMode = theme === 'dark'; 
  const popupBackground = isDarkMode ? '#303030' : '#fff';

  const currentRouteName = useNavigationState((state) => {
    if (!state || !state.routes || state.routes.length === 0) {
      return null;
    }
    const route = state.routes[state.index];
    return route.name;
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 10 || Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy < 0 || gestureState.dx < 0) {
          popupAnimation.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy < -50 || gestureState.dx < -50) {
          hidePopup();
        } else {
          Animated.timing(popupAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (currentRouteName === 'NotificationScreen') return;
  
    socket.current = io(SOCKET_URL);
    socket.current.emit('joinRoom', loggedInUsername);
  
    const handleNewNotification = (notification) => {
      if (notification.fromUser?.username === loggedInUsername) {
        return;
      }
  
      if (currentRouteName !== 'NotificationScreen') {
        showPopup(
          notification.message,
          notification.fromUser?.username,
          notification.fromUser?.profilePicture,
          notification.post?.image?.image
        );
      }
    };
  
    socket.current.on('newNotification', handleNewNotification);
  
    return () => {
      socket.current.off('newNotification', handleNewNotification);
      socket.current.disconnect();
    };
  }, [loggedInUsername, currentRouteName]);
  
  const showPopup = (message, fromUser, profilePicture, postImage) => {
    setPopupMessage({ message, fromUser, profilePicture, postImage });
    setPopupVisible(true);

    Animated.timing(popupAnimation, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      hidePopup();
    }, 5000);
  };

  const hidePopup = () => {
    Animated.timing(popupAnimation, {
      toValue: -100,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setPopupVisible(false);
      setPopupMessage(null);
    });
  };

  const handlePopupPress = () => {
    hidePopup();
    navigation.navigate('NotificationScreen');
  };

  if (!popupVisible || !popupMessage) return null;

  return (
    <Animated.View
      style={[styles.popup, { transform: [{ translateY: popupAnimation }], backgroundColor: popupBackground }]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity onPress={handlePopupPress} style={styles.popupContainer}>
        <View style={styles.popupUserInfo}>
          <Image 
            source={{ uri: popupMessage.profilePicture }}
            style={styles.popupProfileImage}
          />
          <Text style={styles.popupMessage}>
            {popupMessage.message}
          </Text>
        </View>
        {popupMessage.postImage && (
          <Image
            source={{ uri: popupMessage.postImage }}
            style={styles.popupPostImage}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}