import { StyleSheet } from 'react-native';

export const getRepostScreenStyles = (currentTheme) => StyleSheet.create({  
  container: {
      flex: 1,
      backgroundColor: currentTheme.backgroundColor,
    },
    scrollContainer: {
      paddingVertical: 20,
      marginHorizontal: 17,
    },
    repost: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 9,
      borderRadius: 10,
      marginBottom: 6,
      backgroundColor: currentTheme.optionBackground,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      elevation: 5,
      paddingHorizontal: 13,
    },
    profileImage: {
      width: 49,
      height: 49,
      borderRadius: 50,
      marginRight: 13,
    },
    repostInfo: {
      flex: 1,
    },
    username: {
      fontSize: 15,
      color: currentTheme.textColor,
      fontWeight: '600',
    },
    repostedAt: {
      fontSize: 13,
      color: currentTheme.tertiaryTextColor,
      marginTop: 4,
    },
    emptyText: {
      fontSize: 16,
      color: currentTheme.tertiaryTextColor,
      textAlign: 'center',
      marginTop: 20,
    },
    searchBar: {
      height: 37,
      borderColor: currentTheme.borderColor,
      backgroundColor: currentTheme.inputBackground,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      marginTop: 25,
      color: currentTheme.secondaryTextColor,
      marginHorizontal: 18,
      marginVertical:3,
    }  
  });