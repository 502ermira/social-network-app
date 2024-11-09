import { StyleSheet, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

export const getPostScreenStyles = (currentTheme) => StyleSheet.create({  
  container: {
    backgroundColor: currentTheme.backgroundColor,
    minHeight: height,
    width: width,
    paddingBottom: 75,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    justifyContent:'space-between',
    alignItems: 'center'
  },
  userInfoInner : {
    flexDirection: 'row',
  },
  profileImage: {
    width: 49,
    height: 49,
    borderRadius: 25,
    marginRight: 9,
    borderColor: '#7049f6',
    borderWidth: 1
  },
  userDetails: {
    justifyContent: 'center',
  },
  fullname: {
    fontWeight: '600',
    fontSize: 16,
    color: currentTheme.secondaryTextColor
  },
  username: {
    color: currentTheme.tertiaryTextColor,
    fontSize: 14,
  },
  postImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  description: {
    fontWeight: '600',
    fontSize: 15.5,
    color: currentTheme.secondaryTextColor,
    paddingLeft: 16,
  },
  date: {
    color: '#888',
    paddingLeft: 16,
    marginTop: 19,
    fontSize: 13,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  likeIcon: {
    marginRight: 5,
  },
  likeButton: {
    padding: 9,
    borderRadius: 50,
    marginLeft: -3,
  },
  unlikeButton: {
    padding: 9,
    borderRadius: 50,
    marginLeft: -3,
  },
  commentsSection: {
    marginTop: 0,
    paddingTop: 9,
    textAlign: 'center',
    justifyItems : 'center',
  },
  comment: {
    paddingHorizontal: 3,
    paddingRight: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyItems: 'center',
    alignContent: 'center',
    textAlign: 'center',
    paddingLeft: 16,
  },
  profileImageComment : {
    width: 30,
    height: 30,
    borderRadius: 50,
    marginRight: 10,
  },
  commentUser: {
    marginBottom: 4,
    fontSize: 15,
    justifyContent: 'center',
    color: currentTheme.secondaryTextColor,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
    paddingHorizontal: 14,
  },
  commentInput: {
    flex: 1,
    borderColor: currentTheme.borderColor,
    borderWidth: 1,
    borderRadius: 8,
    padding: 9,
    marginRight: 10,
    fontSize: 14,
    backgroundColor: currentTheme.inputBackground,
    color: currentTheme.secondaryTextColor,
  },
  commentButton: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  commentIcon: {
    marginLeft: 10,
    marginTop: -3,
    marginRight:12,
  },
  submitIcon: {
    paddingRight: 2,
  },
  viewMoreText : {
    marginBottom: 4,
    paddingLeft: 16,
    color: currentTheme.tertiaryTextColor,
  },
  repostedByText: {  
    fontSize: 15, 
    fontStyle: 'italic',
    color: '#999',
    paddingLeft: 18,
    paddingTop:13,
    alignItems: 'center',
    padding: 10,
  },
  repostDate : {
    fontSize: 13.5,
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
  suggestionText : {
    color: currentTheme.secondaryTextColor,
  },
  deleteButton: {
    color: 'red',
    fontWeight: 'bold',
    marginLeft: 'auto',
    marginRight: 0,
  },
  deleteMessage : {
    color: '#7049f6',
    paddingTop : 18,
    textAlign: 'center',
    fontWeight: 500,
    fontSize: 14.5
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '70%',
    backgroundColor: '#eee',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: currentTheme.backgroundColor,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: currentTheme.secondaryTextColor 
   },
  modalButton: {
    backgroundColor: '#7049f6',
    borderRadius: 5,
    padding: 10,
    width: '50%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});