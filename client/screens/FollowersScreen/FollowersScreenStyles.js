import { StyleSheet, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

export const getFollowersScreenStyles = (currentTheme) => StyleSheet.create({  
  container: {
    flex: 1,
    backgroundColor: currentTheme.backgroundColor,
    minHeight: height,
    width:width,
    paddingBottom:75,
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 17,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    borderRadius: 10,
    elevation: 5,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    width:'100%',
  },
  userInfo: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'space-between',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  username: {
    fontSize: 14.5,
    color: currentTheme.secondaryTextColor,
    fontWeight: '400',
  },
  fullname: {
    fontSize: 16,
    color: currentTheme.textColor,
    fontWeight: '600',
    marginBottom: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 7,
    marginHorizontal: 18,
  },
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#7049f6',
    borderRadius: 20,
  },
  following: {
    backgroundColor: '#999',
  },
  notFollowing: {
    backgroundColor: '#7049f6',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  userItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: currentTheme.optionBackground,
    paddingRight: 105,
    marginBottom:6,
    borderRadius: 10,
    width: width - 36,
  },
  tabBar : {
    backgroundColor: currentTheme.backgroundColor,
    height: 46.5,
    marginHorizontal: 10,
  },
  searchBar: {
    height: 36,
    borderColor: currentTheme.borderColor,
    borderWidth: 1,
    color: currentTheme.secondaryTextColor,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 23,
    marginHorizontal: 18,
    backgroundColor: currentTheme.optionBackground,
  }  
});
