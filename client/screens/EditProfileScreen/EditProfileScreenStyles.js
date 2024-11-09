import { StyleSheet } from 'react-native';

export const getEditProfileScreenStyles = (currentTheme) => StyleSheet.create({  
  container: {
    flex: 1,
    backgroundColor: currentTheme.backgroundColor,
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 0,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: currentTheme.borderColor,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: currentTheme.borderColor,
  },
  placeholderText: {
    fontSize: 16,
    color: currentTheme.placeholderText,
  },
  imageButton: {
    padding: 11,
    backgroundColor: '#7049f6',
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal:20,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 9,
    borderWidth: 0.5,
    borderColor: currentTheme.borderColor,
    borderRadius: 8,
    backgroundColor: currentTheme.inputBackground,
    color: currentTheme.textColor
  },
  bioInput: {
    height: 100
  },  
  characterCount: {
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: -5,
    fontSize:12.5,
  }, 
  saveButton: {
    width: '100%',
    padding: 14,
    backgroundColor: '#7049f6',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  errorText: {
    color: '#9F0000',
    textAlign: 'center',
  },
  successText: {
    color: 'green',
    textAlign: 'center',
    marginVertical: 10,
  },
  fieldErrorText: {
    color: '#9F0000',
    fontSize: 12,
    marginTop: -5,
    marginBottom: 10,
    textAlign: 'left',
    width: '100%',
  },
});