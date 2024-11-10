import React, { useContext, useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Screens from '../screens';
import Navbar from '../components/Navbar';
import GlobalNotificationPopup from '../components/GlobalNotificationPopup';
import { UserProvider, UserContext } from '../contexts/UserContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export default function Index() {
    return (
        <UserProvider>
            <ThemeProvider>
                <NavigationContainer independent={true}>
                    <AppNavigator />
                    <GlobalNotificationPopup />
                </NavigationContainer>
            </ThemeProvider>
        </UserProvider>
    );
}

function AppNavigator() {
  const { isLoggedIn } = useContext(UserContext);
  const [currentRoute, setCurrentRoute] = useState('TextPromptScreen');
  const navigation = useNavigation();

  useFocusEffect(
      React.useCallback(() => {
          const unsubscribe = navigation.addListener('state', () => {
              const state = navigation.getState();
              if (state && state.routes && state.routes.length > 0) {
                  const currentRouteName = state.routes[state.index].name;
                  setCurrentRoute(currentRouteName);
              }
          });

          return unsubscribe;
      }, [navigation])
  );

  const shouldShowNavbar = () => {
      const hiddenScreens = ['PostImageScreen', 'FavoritesScreen'];
      return !(hiddenScreens.includes(currentRoute) && !isLoggedIn);
  };


    return (
        <>
          {shouldShowNavbar() && <Navbar isLoggedIn={isLoggedIn} />}

            <Stack.Navigator initialRouteName="Profile">
                <Stack.Screen name="Login" component={Screens.LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Signup" component={Screens.SignupScreen} options={{ headerShown: false }} />
                <Stack.Screen name="FavoritesScreen" component={Screens.FavoritesScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Profile" component={Screens.ProfileScreen} options={{ headerShown: false }} />
                <Stack.Screen name="EditProfile" component={Screens.EditProfileScreen} options={{ headerShown: false }} />
                <Stack.Screen name="SearchScreen" component={Screens.SearchScreen} options={{ headerShown: false }} />
                <Stack.Screen name="UserProfile" component={Screens.UserProfileScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Followers" component={Screens.FollowersScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Following" component={Screens.FollowersScreen} options={{ headerShown: false }} />
                <Stack.Screen name="LikesScreen" component={Screens.LikesScreen} options={{ headerShown: false }} />
                <Stack.Screen name="PostScreen" component={Screens.PostScreen} options={{ headerShown: false }} />
                <Stack.Screen name="CommentsScreen" component={Screens.CommentsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="RepostsScreen" component={Screens.RepostsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="NotificationScreen" component={Screens.NotificationScreen} options={{ headerShown: false }} />
                <Stack.Screen name="HomeScreen" component={Screens.HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ChangePasswordScreen" component={Screens.ChangePasswordScreen} options={{ headerShown: false }} />
                <Stack.Screen name="PostImageScreen" component={Screens.PostImageScreen} options={{ headerShown: false }} />
                <Stack.Screen name="SettingsScreen" component={Screens.SettingsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="BlockedUsersScreen" component={Screens.BlockedUsersScreen} options={{ headerShown: false }} />
                <Stack.Screen name="UploadScreen" component={Screens.UploadScreen} options={{ headerShown: false }}/>
            </Stack.Navigator>
        </>
    );
}