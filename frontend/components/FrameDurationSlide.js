import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';

const FrameDurationSlide = ({ handleClose, duration, setDuration }) => {
  return (
    <View>
      <Pressable onPress={handleClose}>
        <View style={styles.backdrop}></View>
      </Pressable>
      <View style={styles.con}>
        <Text style={styles.title}>Duration</Text>
        <TextInput
          style={styles.input}
          placeholder="Milliseconds"
          onChangeText={setDuration}
          value={duration}
          keyboardType="numeric"
        />
        <Text style={styles.subtitle}>In Milliseconds (1000ms = 1s)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  con: {
    position: 'absolute',
    width: '100%',
    backgroundColor: '#2b2b2b',
    padding: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    marginLeft: 0,
    color: '#CCC5B9',
    borderColor: '#CCC5B9',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CCC5B9',
  },
  error: {
    color: '#EB5E28',
  },
  submit: {
    marginTop: 20,
  },
  backdrop: {
    height: '100vh',
    width: '100%',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'medium',
    color: '#CCC5B9',
  },
});

export default FrameDurationSlide;
