import { useContext } from 'react';
import { View, ActivityIndicator} from 'react-native';
import { ThemeContext } from '@/contexts/ThemeContext';

export default function Loader() {
  const { currentTheme } = useContext(ThemeContext);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -55, backgroundColor: currentTheme.backgroundColor }}>
      <ActivityIndicator size="large" color="#7049f6" />
    </View>
  );
}