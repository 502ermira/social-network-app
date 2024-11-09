import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const getCommentsScreenStyles = (currentTheme) => StyleSheet.create({  
  container: {
    backgroundColor: '#fff',
    minHeight: '100%',
    width: width,
    paddingBottom: 75,
    paddingTop: 13,
    backgroundColor: currentTheme.backgroundColor,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comment: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: currentTheme.inputBackground,
    borderRadius: 8,
    marginBottom: 5,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  commentContentText: {
    fontSize:15,
    fontWeight: 500,
    color: currentTheme.textColor,
  },
  profileImageComment: {
    width: 44,
    height: 44,
    borderRadius: 50,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontWeight: '600',
    fontSize: 15,
    color: currentTheme.textColor,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: currentTheme.borderColor,
    margin: 12,
    paddingTop: 13,
    marginRight:16,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: currentTheme.borderColor,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 11,
  },
  commentDate: {
    fontSize: 12,
    marginTop: 4,
    color: '#888',
  },
  suggestionItem :{
    padding:7,
    flex: 1,
  },
  profileImageSuggestion : {
    width: 27,
    height: 27,
    borderRadius: 50,
    marginRight: 10,
  },
  suggestionContainer : {
    flexDirection: 'row', 
    alignItems: 'center' ,
  },
  suggestionText: {
    color: currentTheme.textColor
  },
  deleteButton: {
    backgroundColor: '#9F0000',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginRight:3,
    paddingVertical: 10,
    marginVertical: 3,
    marginBottom: 7,
    borderRadius: 3,
  },
});