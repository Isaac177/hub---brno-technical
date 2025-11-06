
const DEV_ENDPOINTS = {
  STUDENT_MANAGEMENT_SERVICE: 'https://ums.ybyraihub.kz',
  COURSE_SERVICE: 'https://course.ybyraihub.kz',
  USER_SERVICE: 'https://user.ybyraihub.kz',
};

const devApiCall = async (service, endpoint, options = {}) => {
  const serviceKey = `${service}_SERVICE`;
  const baseUrl = DEV_ENDPOINTS[serviceKey];

  if (!baseUrl) {
    throw new Error(`Invalid service: ${service}. Available services: ${Object.keys(DEV_ENDPOINTS).map(key => key.replace('_SERVICE', '')).join(', ')}`);
  }

  const url = new URL(`${baseUrl}${endpoint}`);
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const headers = {
    ...(!options.body || options.body instanceof FormData
      ? {}
      : { 'Content-Type': 'application/json' }),
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      body: options.body instanceof FormData
        ? options.body
        : options.body ? JSON.stringify(options.body)
          : undefined
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }

    if (!response.ok) {
      throw {
        status: response.status,
        message: data?.message || response.statusText,
        data,
        headers: Object.fromEntries(response.headers.entries())
      };
    }

    return data;
  } catch (error) {
    // console.error('❌ DEV API call failed:', {
    //   service,
    //   endpoint,
    //   status: error.status,
    //   response: error.data
    // });
    if (error.status) {
      throw error;
    }
    throw {
      status: 500,
      message: error.message || 'Network error',
      error
    };
  }
};

export const courseServiceDev = {
  get: (endpoint, options) => {
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
    return devApiCall('COURSE', apiEndpoint, { method: 'GET', ...options });
  },
  post: (endpoint, body, options) => {
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
    return devApiCall('COURSE', apiEndpoint, { method: 'POST', body, ...options });
  },
  put: (endpoint, body, options) => {
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
    return devApiCall('COURSE', apiEndpoint, { method: 'PUT', body, ...options });
  },
  delete: (endpoint, options) => {
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
    return devApiCall('COURSE', apiEndpoint, { method: 'DELETE', ...options });
  },
};

export const userServiceDev = {
  get: (endpoint, options) => {
    return devApiCall('USER', endpoint, { method: 'GET', ...options });
  },
  post: (endpoint, body, options) => {
    return devApiCall('USER', endpoint, { method: 'POST', body, ...options });
  },
  put: (endpoint, body, options) => {
    return devApiCall('USER', endpoint, { method: 'PUT', body, ...options });
  },
  delete: (endpoint, options) => {
    return devApiCall('USER', endpoint, { method: 'DELETE', ...options });
  },
};

export const studentServiceDev = {
  get: (endpoint, options) => {
    return devApiCall('STUDENT_MANAGEMENT', endpoint, { method: 'GET', ...options });
  },
  post: (endpoint, body, options) => {
    return devApiCall('STUDENT_MANAGEMENT', endpoint, { method: 'POST', body, ...options });
  },
  put: (endpoint, body, options) => {
    return devApiCall('STUDENT_MANAGEMENT', endpoint, { method: 'PUT', body, ...options });
  },
  delete: (endpoint, options) => {
    return devApiCall('STUDENT_MANAGEMENT', endpoint, { method: 'DELETE', ...options });
  },
};

export default devApiCall;