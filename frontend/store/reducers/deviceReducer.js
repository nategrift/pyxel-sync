import {
  ADD_ANIMATION,
  ADD_DEVICE,
  REMOVE_ANIMATION,
  REMOVE_DEVICE,
  RETRIEVE_DEVICES,
  SELECT_DEVICE,
} from '../actionTypes';

const initialState = {
  devices: [],
  selectedDevice: null,
  animations: [],
};

function deviceReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_DEVICE:
      return { ...state, devices: [...state.devices, action.payload] };
    case REMOVE_DEVICE:
      return {
        ...state,
        devices: state.devices.filter((device) => device.id !== action.payload),
      };
    case RETRIEVE_DEVICES:
      return { ...state, devices: action.payload };
    case SELECT_DEVICE:
      return { ...state, selectedDevice: action.payload };
    case ADD_ANIMATION:
      return {
        ...state,
        animations: [
          ...state.animations.filter(
            (animation) => animation != action.payload,
          ),
          action.payload,
        ],
      };
    case REMOVE_ANIMATION:
      return {
        ...state,
        animations: state.animations.filter(
          (animation) => animation != action.payload,
        ),
      };
    default:
      return state;
  }
}

export default deviceReducer;
