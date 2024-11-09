import { useContext, useState } from 'react';
import { ScrollView, TextInput, Pressable, Text, Alert, View } from 'react-native';
import { UserContext } from '../../contexts/UserContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { API_ENDPOINTS } from '../../config/apiConfig';
import CustomHeader from '../../components/CustomHeader';
import { getEditProfileScreenStyles } from '../EditProfileScreen/EditProfileScreenStyles';

export default function ChangePasswordScreen({ navigation }) {
  const { token } = useContext(UserContext);
  const { currentTheme } = useContext(ThemeContext);
  const styles = getEditProfileScreenStyles(currentTheme);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.CHANGE_PASSWORD, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Password updated successfully');
        setOldPassword('');
        setNewPassword('');
        navigation.goBack();
      } else {
        setError(result.error || 'Failed to update password');
      }
    } catch (err) {
      setError('Password change failed');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <CustomHeader title="Change Password" screenType={null} />

      <ScrollView contentContainerStyle={[styles.scrollContainer, {paddingTop:30 }]}>
        <TextInput
          placeholder="Old Password"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry={true}
          style={[styles.input, { color: currentTheme.textColor, backgroundColor: currentTheme.inputBackground,  borderColor: currentTheme.borderColor }]}
          placeholderTextColor={currentTheme.placeholderTextColor}
        />
        <TextInput
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={true}
          style={[styles.input, { color: currentTheme.textColor, backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.borderColor }]}
          placeholderTextColor={currentTheme.placeholderTextColor}
        />
        <Pressable onPress={handleChangePassword} style={styles.saveButton}>
          <Text style={[styles.saveButtonText, { color: currentTheme.buttonText }]}>Change Password</Text>
        </Pressable>
        {error ? <Text style={[styles.errorText, { color: 'red' }]}>{error}</Text> : null}
      </ScrollView>
    </View>
  );
}