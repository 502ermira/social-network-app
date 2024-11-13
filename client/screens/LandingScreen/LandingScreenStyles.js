import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const getLandingScreenStyles = (currentTheme) => StyleSheet.create({  
    container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: width,
    marginTop:-20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
    background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
    resizeMode: 'contain',
    zIndex:1111,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#eee',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: '#aaa',
    marginBottom: 45,
    textAlign: 'center',
  },
  signupButton: {
    backgroundColor: '#7049f6',
    paddingVertical: 15,
    paddingHorizontal: 120,
    borderRadius: 25,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  signupText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  loginButton: {
    borderColor: '#7049f6',
    borderWidth: 2.5,
    paddingVertical: 14,
    paddingHorizontal: 123,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
  },
  loginText: {
    color: '#7049f6',
    fontSize: 17,
    fontWeight: '800',
    textTransform: 'uppercase',

  },
});
