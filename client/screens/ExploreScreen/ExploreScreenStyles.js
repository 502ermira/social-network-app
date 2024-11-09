import { StyleSheet, Dimensions } from 'react-native';

const{ width, height } = Dimensions.get('window'); 

export const getExploreScreenStyles = (currentTheme) => StyleSheet.create({  
  container: {
    flex: 1,
  },
  postContainer: {
    flex: 1,
    margin: 3.5,
    justifyContent: 'center',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: currentTheme.optionBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: '48%'
  },
  title : {
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 17,
    paddingBottom: 8,
    color: currentTheme.textColor,
  },
  postImage: {
    width: (width / 2),
    height: (height / 5),
    resizeMode: 'cover',
  },
  profileImage : {
    width:21,
    height:21,
    borderRadius: 50,
    marginRight: 6,
  },
  textContainer: {
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    left:2
  },
  username: {
    fontSize: 12,
    fontWeight: '500',
    color: currentTheme.secondaryTextColor,
  },
  loaderContainer: {
    paddingBottom: 10,
    paddingTop: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
});