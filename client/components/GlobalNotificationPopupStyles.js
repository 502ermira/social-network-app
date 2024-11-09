import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const getGlobalNotificationPopupStyles = (currentTheme) => StyleSheet.create({  
  popup: {
    position: 'absolute',
    maxWidth: width,
    padding: 16,
    paddingVertical: 9,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0.5 },
    elevation: 5,
    marginTop:41,
    marginHorizontal:10,
    borderRadius:10,
  },
  
  popupMessage: {
    color: currentTheme.textColor,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    alignItems: 'center',
  },
  
  popupProfileImage: {
    width: 48,
    height: 48,
    borderRadius: 25,
    marginRight:12,
  },
  
  popupPostImage: {
    width: 54,
    height: 54,
    borderRadius: 4,
    marginLeft:10,
  },
  
  popupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    justifyItems: 'center',
    alignContent: 'center',
  },
  
  popupTextContainer: {
    flex: 1,
    alignItems: 'center',
    },

  popupUserInfo : {
   alignContent: 'flex-start',
   flexDirection:'row',
   flex:1,
   alignItems: 'center',
  },
});