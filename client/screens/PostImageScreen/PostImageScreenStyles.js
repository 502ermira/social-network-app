import { StyleSheet, Dimensions } from 'react-native';

const {width } = Dimensions.get('window');

export const getPostImageScreenStyles = (currentTheme) => StyleSheet.create({  
  container: {
      flex: 1,
      justifyContent:'center',
      alignContent: 'center',
      alignItems: 'center',
      backgroundColor: currentTheme.backgroundColor,
     },
     innerContainer : {
      marginHorizontal: 20,
     },
      image: {
        width: width * 0.9,
        height: width * 0.9,
        borderRadius: 3,
        marginBottom: 10,
        resizeMode: 'cover',
        marginTop: 33,
      },
      input: {
        height: 40,
        borderColor: currentTheme.borderColor,
        borderWidth: 1,
        marginBottom: 16,
        height: 100,
        borderRadius: 7,
        paddingHorizontal:6,
        backgroundColor: currentTheme.inputBackground,
        color: currentTheme.secondaryTextColor,
      },
      shareButton: {
        backgroundColor: '#7049f6',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 38,
      },
      shareButtonText: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 16.5,
      },
      characterCount: {
        color: '#ccc',
        alignSelf: 'flex-end',
        marginBottom: 10,
        marginTop: -10,
      },  
});