import { StyleSheet } from 'react-native';

export const getUploadScreenStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textColor,
    marginBottom: 20,
  },
  iconContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  iconButton: {
    marginHorizontal: 20,
    padding: 10,
    backgroundColor: theme.textColor,
    borderRadius: 50,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});
