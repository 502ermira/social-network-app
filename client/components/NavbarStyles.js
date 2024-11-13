import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  navbarTopContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    paddingTop:55,
    borderBottomWidth: 0.5,
  },
  logo: {
    width: 77,
    height:55,
    marginTop: -11,
  },
  authContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authButton: {
    backgroundColor: '#6200ea',
    paddingVertical: 8.5,
    paddingHorizontal: 19,
    borderRadius: 20,
    marginLeft: 8,
    shadowColor: '#6200ea',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 15.4,
    fontWeight: '500',
  },
  navbarBottomContainer: {
    width: '100%',
    height: 75,
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 8,
    paddingHorizontal:11,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5,
    zIndex: 10,
    borderTopWidth: 0.5,
  },
  navIcon: {
    fontSize: 26,
    color: '#ddd',
  },
});