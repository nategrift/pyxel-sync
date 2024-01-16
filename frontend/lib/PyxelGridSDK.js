// PyxelGridSDK.js
import axios from 'axios';

export class Pixel {
  r = 0;
  g = 0;
  b = 0;
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

// based on whether we are using compiled build of frontend or debug
let BASE_URL;
if (window.location.href.includes('19006')) {
  BASE_URL = 'http://10.0.0.168:3000/api';
} else {
  BASE_URL = '/api';
}

const login = async (pyxelGridId, pyxelGridPassword) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      id: pyxelGridId,
      password: pyxelGridPassword,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Error logging in. Not Valid Credentials.',
    };
  }
};

const updateData = async (pyxelGridId, pyxelGridPassword, pixels) => {
  try {
    const response = await axios.put(`${BASE_URL}/setData`, {
      id: pyxelGridId,
      password: pyxelGridPassword,
      pixels, // Array of 64 pixels
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Update error:', error);
    return {
      success: false,
      error: 'Error logging in. Not Valid Credentials.',
    };
  }
};

const getData = async (pyxelGridId, pyxelGridPassword) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/getData/${pyxelGridId}/${pyxelGridPassword}`,
      {},
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get data error:', error);
    return {
      success: false,
      error: 'Error logging in. Not Valid Credentials.',
    };
  }
};

const getStatus = async (pyxelGridId, pyxelGridPassword) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/status/${pyxelGridId}/${pyxelGridPassword}`,
      {},
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get data error:', error);
    return {
      success: false,
      error: 'Error getting status. Not Valid Credentials.',
    };
  }
};
export default {
  login,
  updateData,
  getData,
  getStatus,
};
