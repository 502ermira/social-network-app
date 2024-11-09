import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const getHomeScreenStyles = (currentTheme) => StyleSheet.create({  
  container: {
    flex: 1,
    backgroundColor: currentTheme.backgroundColor,
    padding: 12,
    paddingTop: 50,
    paddingBottom: 50,
  },
  postContainer: {
    backgroundColor: currentTheme.inputBackground,
    borderRadius: 7,
    marginBottom: 25,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  logo: {
    resizeMode: 'contain',
    height:65,
    width: 110,
    marginTop:4,
    marginBottom: 18,
    alignSelf: 'center',
  },
  image: {
    height: (height / 2) - 65,
    resizeMode: 'cover',
    borderRadius: 5,
    marginBottom: 5,
  },
  description: {
    fontSize: 14.5,
    fontWeight: '500',
    color : currentTheme.secondaryTextColor,
    lineHeight: 22,
    marginTop: 5,
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1.3,
    borderColor: '#7049f6',
  },
  username: {
    fontSize: 14.8,
    fontWeight: '600',
    color: currentTheme.violet,
  },
  date: {
    fontSize: 11,
    color: '#909090',
    marginTop: 4,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfoAndEngagement: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 9,
  },
  engagementContainer: {
    flexDirection: 'row',
    right:7,
  },
  likes: {
    fontWeight: '500',
    marginHorizontal: 7,
    alignContent: 'center',
    color : currentTheme.darkIconColor,
  },
  comments: {
    fontWeight: '500',
    marginHorizontal: 7,
    alignContent: 'center',
    color : currentTheme.darkIconColor,
  },
  commentIcon : {
    top:-2,
    color : currentTheme.darkIconColor,
  },
  reposts: {
    fontWeight: '500',
    marginHorizontal: 7,
    alignContent: 'center',
    alignItems: 'center',
    color : currentTheme.darkIconColor,
  },
  repostIcon : {
    top:-1.5,
  },
  prompt : {
    fontSize: 13,
    color: currentTheme.tertiaryTextColor,
    fontStyle: 'italic',
    marginBottom: 5,
  },
  readMoreText: {
    color: currentTheme.violet,
    fontWeight: 'bold',
    marginTop: 5,
  },
  loaderContainer: {
    paddingVertical: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
