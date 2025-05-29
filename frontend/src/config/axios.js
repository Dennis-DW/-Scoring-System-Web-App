// frontend/src/config/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://sysde-f6ghapgxbaepefdd.canadacentral-01.azurewebsites.net',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;