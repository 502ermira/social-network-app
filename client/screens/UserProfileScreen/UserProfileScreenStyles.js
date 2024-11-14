import { StyleSheet } from 'react-native';

export const getUserProfileScreenStyles = (currentTheme) => StyleSheet.create({  
  container: {
    flex: 1,
    backgroundColor: currentTheme.backgroundColor,
    padding: 0,
    paddingBottom: 75,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  profileImage: {
    width: 95,
    height: 95,
    borderRadius: 50,
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  fullname: {
    fontSize: 23,
    fontWeight: 'bold',
    color: currentTheme.textColor,
    top: 8,
  },
  bio : {
    paddingHorizontal: 21,
    fontSize: 15,
    marginBottom: 4,
    color: currentTheme.secondaryTextColor,
  },
  followInfo: {
    flexDirection: 'row',
    marginTop: 17,
  },
  followers: {
    marginRight: 10,
    color: currentTheme.secondaryTextColor,
  },
  following :{
    color: currentTheme.secondaryTextColor,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 1
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  postContainer: {
    overflow: 'hidden',
    padding: 1,
    justifyContent: 'flex-start',
  },
  followButton: {
    backgroundColor: '#7049f6',
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 6,
    marginHorizontal: 20,
    marginBottom: -11,
  },
  followButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: currentTheme.backgroundColor,
    marginTop: 13,
    marginHorizontal: 3,
    height: 43,
    marginBottom:1,
    color: currentTheme.textColor,
  },
  noPostsText : {
    textAlign: 'center',
    top:23,
    fontSize: 15,
    color: currentTheme.tertiaryTextColor,
  },
  menuContainer: {
    position: 'absolute',
    top: 80,
    right: 11,
    backgroundColor: currentTheme.inputBackground,
    borderRadius: 5,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    zIndex:1,
  },
  menuOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  menuOptionText: {
    fontSize: 16,
    color:currentTheme.textColor,
    fontWeight: '500'

  },
});