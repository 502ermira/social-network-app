import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const getUserProfileScreenStyles = (currentTheme) => StyleSheet.create({  
  container: {
    flex: 1,
    backgroundColor: currentTheme.inputBackground,
    paddingTop: 0,
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
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 1,
  },
  profileImage: {
    width: width,
    height: 325,
    objectFit:'cover'
  },
  profileInfoContainer: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
    backgroundColor: currentTheme.inputBackground,
    marginTop: -28,
    marginHorizontal:-2
  },
  profileInfoInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal:25,
    paddingTop:17,
  },
  fullname: {
    fontSize: 18,
    fontWeight: '600',
    color: currentTheme.textColor,
  },
  username: {
    fontSize: 14,
    fontWeight: '400',
    color: currentTheme.tertiaryTextColor,
    paddingTop:2,
  },
  bio : {
    paddingHorizontal: 21,
    marginTop: 10,
    color: currentTheme.secondaryTextColor,
    marginBottom:-7,
  },
  
  followInfo: {
    flexDirection: 'row',
    marginTop: 17,
    alignSelf:'center',
    borderRadius:10,
    justifyContent:'space-between',
    width:"100%",
    paddingHorizontal:24,
  },
  followersContainer: {
    backgroundColor: currentTheme.backgroundColor,
    padding: 10,
    paddingHorizontal:17,
    borderRadius: 9,
    textAlign:'left'
  },

profileImagesContainer: {
  flexDirection: 'row',
},
roundedProfileImage: {
  width: 32,
  height: 32,
  borderRadius: 15,
  marginLeft: -7,
  borderColor:currentTheme.backgroundColor,
  borderWidth:1,
  marginRight:0,
},
  
  followersText: {
    color: currentTheme.secondaryTextColor,
    paddingTop:5,
    fontSize:14.5,
  },
  
  followingContainer: {
    backgroundColor: currentTheme.backgroundColor,
    padding: 10,
    borderRadius: 9,
    textAlign:'left',
    paddingHorizontal:17,
  },

  postsContainer: {
    backgroundColor: currentTheme.backgroundColor,
    padding: 10,
    borderRadius: 9,
    textAlign:'left',
    paddingHorizontal:17,
  },
  
  followingText: {
    color: currentTheme.secondaryTextColor,
    paddingTop:5,
    fontSize:14.5,
  },

  postsText: {
    color: currentTheme.secondaryTextColor,
    paddingTop:5,
    fontSize:14.5,
  },

  count: {
    fontWeight:'bold',
    fontSize:14.5,
  },

  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 10,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius:10,
  },
  postContainer: {
    overflow: 'hidden',
    padding: 4,
    justifyContent: 'flex-start',
  },
  buttonContainer: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  followButton: {
    paddingVertical: 10.5,
    paddingHorizontal: 30,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize:15,
  },
  tabBar: {
    backgroundColor: currentTheme.inputBackground,
    marginTop: 13,
    marginHorizontal: 15,
    height: 43,
    marginBottom:-10,
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