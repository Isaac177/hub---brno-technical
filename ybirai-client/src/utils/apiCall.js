import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const API_VERSION = import.meta.env.VITE_API_VERSION;

export const apiCall = async (endpoint, method = 'GET', data = null, config = {}) => {
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    ...(config.headers || {}),
  };

  if (config.authToken) {
    headers['Authorization'] = `Bearer ${config.authToken}`;
  }

  if (config.language) {
    headers['Accept-Language'] = config.language;
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${API_URL}/${API_VERSION}${normalizedEndpoint}`;

  const axiosConfig = {
    method,
    url: fullUrl,
    headers,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 30000,
    withCredentials: false,
    ...config,
  };

  if (data) {
    if (data instanceof FormData) {
      axiosConfig.data = data;
      delete axiosConfig.headers['Content-Type'];
    } else {
      axiosConfig.headers['Content-Type'] = 'application/json';
      axiosConfig.data = data;
    }
  }

  try {
    const response = await axios(axiosConfig);
    return response.data;
  } catch (error) {
    console.error('❌ Production API Call Error:', {
      endpoint,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error;
  }
};
