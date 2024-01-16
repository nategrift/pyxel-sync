import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Pressable,
} from 'react-native';
import PyxelGridSDK from '../lib/PyxelGridSDK';
import { useSelector, useDispatch } from 'react-redux';
import { addDevice } from '../store/actions/deviceActions';

const AddDeviceSlide = ({ handleClose }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  const devices = useSelector((state) => state.devices);

  const reset = () => {
    setId('');
    setPassword('');
    setError('');
  };

  const handleLogin = async () => {
    if (!id || !password || id.length < 6 || password.length < 6) {
      setError('Please enter a valid ID and password. (min 6 characters)');
      return;
    }

    // Check if the device with the same ID already exists
    const deviceExists = devices.some((device) => device.id === id);
    if (deviceExists) {
      setError('A device with this ID already exists.');
      return;
    }

    const loginResponse = await PyxelGridSDK.login(id, password);
    if (loginResponse.success) {
      dispatch(addDevice({ id, password }));
      handleClose();
      reset();
    } else {
      setError(loginResponse.error);
    }
  };

  return (
    <View>
      <Pressable onPress={handleClose}>
        <View style={styles.backdrop}></View>
      </Pressable>
      <View style={styles.con}>
        <Text style={styles.title}>Add PyxelSync Device</Text>
        {error ? <Text style={styles.error}>Error: {error}</Text> : undefined}
        <TextInput
          style={styles.input}
          placeholder="ID"
          onChangeText={setId}
          value={id}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          onChangeText={setPassword}
          value={password}
          secureTextEntry
        />
        <View style={styles.submit}>
          <Button title="Add" color="#EB5E28" onPress={handleLogin} />
        </View>
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
});

export default AddDeviceSlide;
