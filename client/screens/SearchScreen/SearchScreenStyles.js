import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const getSearchScreenStyles = (currentTheme) => StyleSheet.create({  
  container: {
    flex: 1,
    padding: 7,
    backgroundColor: currentTheme.backgroundColor,
    paddingTop: 66,
    paddingBottom: 75,
  },
  searchContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    height: 38,
    borderColor: currentTheme.borderColor,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: currentTheme.inputBackground,
    fontSize: 15,
    marginRight: 8,
    width: '85%',
    color: currentTheme.iconColor,
  },
  resultContainer: {
    flex: 1,
    margin: 3.5,
    justifyContent: 'center',
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: currentTheme.optionBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: '48%',
    },
  userResultContainer: {
    flex: 1,
    margin: 3.5,
    justifyContent: 'center',
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: currentTheme.inputBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    },
  userResult: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    justifyItems: 'flex-start',
  },
  profileImage: {
    width: 47,
    height: 47,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#7049f6',
    left: 8,
    marginRight: 11,
  },
  userInfoContainer : {
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture : {
    width:21,
    height:21,
    borderRadius: 50,
    marginRight: 6,
  },
  textContainer: {
    marginLeft: 10,
    flexDirection: 'column',
  },
  fullname: {
    fontSize: 16.5,
    fontWeight: '500',
    color : currentTheme.textColor,
    marginTop: 2.5,
  },
  username: {
    fontSize: 15,
    color: currentTheme.secondaryTextColor,
    marginTop: 1,
  },
  usernamePost : {
    fontSize: 12,
    fontWeight: '500',
    color: currentTheme.secondaryTextColor,
  },
  photoImage: {
    width: (width / 2) ,
    height: (height / 4) - 20,
    resizeMode: 'cover',
  },
  searchIconContainer : {
    color: currentTheme.iconColor
  },
  tabBar: {
    marginTop: 10,
    backgroundColor: 'none',
    marginHorizontal: 5,
  },
  tabIndicator: {
    backgroundColor: '#7049f6',
    marginBottom: 2,
  },
  tabLabel: {
    color: currentTheme.secondaryTextColor,
    fontSize: 13,
  },
  noResultsText: {
    fontSize: 16,
    color: '#888',
    top: 32,
    textAlign: 'center',
    color: currentTheme.secondaryTextColor,
  },
});