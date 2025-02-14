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
    width: '84%',
    height: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 9,
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    elevation: 5,
    zIndex: 10,
    borderRadius: 50,
    overflow: 'hidden',
},
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)', 
    borderRadius: 50,
    padding:16,
    margin:-11,
  },
  navIcon: {
    fontSize: 25.5,
    color: '#B0B0B0',
  },
  activeIcon: {
    color: '#eee',
  },
});