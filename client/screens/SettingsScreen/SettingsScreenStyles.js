import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: 20,
      },
      option: {
        padding: 18,
        marginVertical: 4,
        width: '93%',
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
      },
      optionText: {
        color: '#000',
        fontSize: 17,
      },
      switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
        marginVertical: 4,
        width: '93%',
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        paddingVertical: 16,
      },
    });
  
  export default styles;