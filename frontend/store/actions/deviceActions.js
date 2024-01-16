import {
  ADD_ANIMATION,
  ADD_DEVICE,
  REMOVE_ANIMATION,
  REMOVE_DEVICE,
  RETRIEVE_DEVICES,
  SELECT_DEVICE,
} from '../actionTypes';

export const addDevice = (device) => ({
  type: ADD_DEVICE,
  payload: device,
});

export const removeDevice = (deviceId) => ({
  type: REMOVE_DEVICE,
  payload: deviceId,
});

export const retrieveDevices = (devices) => ({
  type: RETRIEVE_DEVICES,
  payload: devices,
});

export const selectedDevice = (device) => ({
  type: SELECT_DEVICE,
  payload: device,
});

export const addAnimation = (animation) => ({
  type: ADD_ANIMATION,
  payload: animation,
});

export const removeAnimation = (animation) => ({
  type: REMOVE_ANIMATION,
  payload: animation,
});
