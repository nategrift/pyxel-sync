import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, Animated, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Nav from '../components/Nav';
import IconButton from '../components/IconButton';
import AddDeviceSlide from '../components/AddDeviceSlide';
import { removeDevice, selectedDevice } from '../store/actions/deviceActions';
import Icon from 'react-native-vector-icons/FontAwesome5';
import HelpMenu from '../components/HelpMenu';
import PyxelGridSDK from '../lib/PyxelGridSDK';

const Devices = () => {
  const devices = useSelector((state) => state.devices);
  const [addDeviceSlideFocus, setAddDeviceSlideFocus] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState(new Map());
  const dispatch = useDispatch();

  const handleAddButton = () => {
    setAddDeviceSlideFocus(true);
  };

  const handleBackdropPress = () => {
    slideOut();
    setTimeout(() => {
      setAddDeviceSlideFocus(false);
    }, 300);
  };

  const handleOpenDevice = (device) => {
    dispatch(selectedDevice(device));
  };

  const handleRemoveDevice = (device) => {
    dispatch(removeDevice(device.id));
  };

  // Animated value for sliding
  const slideAnim = useRef(new Animated.Value(-300)).current; // Start off-screen

  // Slide in
  const slideIn = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Slide out
  const slideOut = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Trigger slide-in effect on mount
  useEffect(() => {
    if (addDeviceSlideFocus) {
      slideIn();
    } else {
      slideOut();
    }
  }, [addDeviceSlideFocus]);

  // on all device update
  useEffect(() => {
    updateIsDeviceOnline();
  }, [devices]);

  // on mounted
  useEffect(() => {
    updateIsDeviceOnline();
  }, []);

  function updateIsDeviceOnline() {
    const promises = devices.map((device) => {
      return PyxelGridSDK.getStatus(device.id, device.password)
        .then((response) => {
          if (response.success) {
            return { id: device.id, data: response.data };
          }
          throw new Error('Failed to get status for ' + device.id);
        })
        .catch((error) => {
          console.error(`Error getting status for device ${device.id}:`, error);
        });
    });

    return Promise.all(promises).then((results) => {
      const updatedStatuses = new Map();
      results.forEach((result) => {
        if (result) {
          updatedStatuses.set(result.id, result.data);
        }
      });
      setDeviceStatus(updatedStatuses);
    });
  }

  function isDeviceActive(id) {
    return new Date().getTime() - deviceStatus.get(id)?.lastPing < 30000;
  }

  return (
    <View style={{ height: '100vh' }}>
      <Nav
        name="Devices"
        slot={
          <IconButton
            name="plus"
            onPress={handleAddButton}
            size={20}
            color="#b5b5b5"
          />
        }
      />
      <View style={styles.deviceList}>
        {devices.map((device) => (
          <Pressable
            key={device.id}
            style={styles.device}
            onPress={() => handleOpenDevice(device)}
            onLongPress={() => handleRemoveDevice(device)}
          >
            <Icon
              name="th"
              size={20}
              color="#bc491c"
              style={{ width: 18, height: 22, marginRight: '10px' }}
            />
            <Text style={styles.text}>{device.id}</Text>
            <Text
              style={[
                styles.badge,
                {
                  backgroundColor: isDeviceActive(device.id)
                    ? '#4dbc4f'
                    : '#bc4d5f',
                  color: '#f4f4f4',
                },
              ]}
            >
              {isDeviceActive(device.id) ? 'Online' : 'Offline'}
            </Text>
          </Pressable>
        ))}
      </View>
      <Animated.View
        style={{ ...styles.slideIn, transform: [{ translateY: slideAnim }] }}
      >
        {addDeviceSlideFocus ? (
          <AddDeviceSlide handleClose={handleBackdropPress} />
        ) : undefined}
      </Animated.View>
      <HelpMenu>Hold a device for a long period of time to delete</HelpMenu>
    </View>
  );
};

const styles = StyleSheet.create({
  slideIn: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  deviceList: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  device: {
    flexDirection: 'row',
    backgroundColor: '#2b2b2b',
    padding: 20,
    width: '90%',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  text: {
    color: '#b5b5b5',
    fontSize: 16,
  },
  badge: {
    borderRadius: 10,
    marginLeft: 'auto',
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 5,
    paddingRight: 5,
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default Devices;
