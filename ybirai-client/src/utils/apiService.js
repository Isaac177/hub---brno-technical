import { courseServiceDev, userServiceDev, studentServiceDev } from './devApiCall';

const isDevelopment = true;

// Direct service URLs for production
const SERVICE_URLS = {
    course: 'https://course.ybyraihub.kz/api',
    user: 'https://user.ybyraihub.kz/api',
    student: 'https://ums.ybyraihub.kz/api'
};

// Direct API call function for production
const directApiCall = async (serviceUrl, endpoint, method = 'GET', data = null, options = {}) => {
    const url = `${serviceUrl}${endpoint}`;
    const config = {
        method,
        headers: {
            ...options.headers,
            'Content-Type': 'application/json'
        },
        ...options
    };

    if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
    }

    console.log('directApiCall - URL:', url);
    console.log('directApiCall - Config:', JSON.stringify(config, null, 2));
    console.log('directApiCall - Data:', JSON.stringify(data, null, 2));

    const response = await fetch(url, config);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
};

const addApiPrefix = (endpoint) => {
    if (isDevelopment && !endpoint.startsWith('/api/')) {
        const prefixedEndpoint = `/api${endpoint}`;
        return prefixedEndpoint;
    }
    return endpoint;
};

export const apiService = {
    call: async (endpoint, method = 'GET', data = null, config = {}) => {
        if (isDevelopment) {
            const service = getServiceForEndpoint(endpoint);
            return service[method.toLowerCase()](addApiPrefix(endpoint), data, config);
        } else {
            const serviceUrl = getServiceUrlForEndpoint(endpoint);
            return directApiCall(serviceUrl, endpoint, method, data, config);
        }
    },

    course: isDevelopment ? {
        get: (endpoint, options) => {
            return courseServiceDev.get(addApiPrefix(endpoint), options);
        },
        post: (endpoint, body, options) => {
            return courseServiceDev.post(addApiPrefix(endpoint), body, options);
        },
        put: (endpoint, body, options) => {
            return courseServiceDev.put(addApiPrefix(endpoint), body, options);
        },
        delete: (endpoint, options) => {
            return courseServiceDev.delete(addApiPrefix(endpoint), options);
        },
    } : {
        get: (endpoint, options) => {
            return directApiCall(SERVICE_URLS.course, endpoint, 'GET', null, options);
        },
        post: (endpoint, body, options) => {
            return directApiCall(SERVICE_URLS.course, endpoint, 'POST', body, options);
        },
        put: (endpoint, body, options) => {
            return directApiCall(SERVICE_URLS.course, endpoint, 'PUT', body, options);
        },
        delete: (endpoint, options) => {
            return directApiCall(SERVICE_URLS.course, endpoint, 'DELETE', null, options);
        },
    },

    user: isDevelopment ? {
        get: async (endpoint, options = {}) => {
            console.log('[apiService.user.get] DEV - Calling:', JSON.stringify({ endpoint, options }, null, 2));
            try {
                const result = await userServiceDev.get(addApiPrefix(endpoint), options);
                console.log('[apiService.user.get] DEV - Result:', JSON.stringify(result, null, 2));
                return result;
            } catch (error) {
                console.error('[apiService.user.get] DEV - Error:', JSON.stringify(error, null, 2));
                throw error;
            }
        },
        post: async (endpoint, body, options = {}) => {
            console.log('[apiService.user.post] DEV - Calling:', JSON.stringify({ endpoint, body, options }, null, 2));
            return userServiceDev.post(addApiPrefix(endpoint), body, options);
        },
        put: async (endpoint, body, options = {}) => {
            return userServiceDev.put(addApiPrefix(endpoint), body, options);
        },
        delete: async (endpoint, options = {}) => {
            return userServiceDev.delete(addApiPrefix(endpoint), options);
        },
    } : {
        get: async (endpoint, options = {}) => {
            console.log('[apiService.user.get] PROD - Calling:', JSON.stringify({ endpoint, options }, null, 2));
            try {
                const result = await directApiCall(SERVICE_URLS.user, endpoint, 'GET', null, options);
                console.log('[apiService.user.get] PROD - Result:', JSON.stringify(result, null, 2));
                return result;
            } catch (error) {
                console.error('[apiService.user.get] PROD - Error:', JSON.stringify(error, null, 2));
                throw error;
            }
        },
        post: async (endpoint, body, options = {}) => {
            return directApiCall(SERVICE_URLS.user, endpoint, 'POST', body, options);
        },
        put: async (endpoint, body, options = {}) => {
            return directApiCall(SERVICE_URLS.user, endpoint, 'PUT', body, options);
        },
        delete: async (endpoint, options = {}) => {
            return directApiCall(SERVICE_URLS.user, endpoint, 'DELETE', null, options);
        },
    },

    student: isDevelopment ? {
        get: (endpoint, options) => {
            return studentServiceDev.get(addApiPrefix(endpoint), options);
        },
        post: (endpoint, body, options) => {
            return studentServiceDev.post(addApiPrefix(endpoint), body, options);
        },
        put: (endpoint, body, options) => {
            return studentServiceDev.put(addApiPrefix(endpoint), body, options);
        },
        delete: (endpoint, options) => {
            return studentServiceDev.delete(addApiPrefix(endpoint), options);
        },
    } : {
        get: (endpoint, options) => {
            return directApiCall(SERVICE_URLS.student, endpoint, 'GET', null, options);
        },
        post: (endpoint, body, options = {}) => {
            return directApiCall(SERVICE_URLS.student, endpoint, 'POST', body, options);
        },
        put: (endpoint, body, options) => {
            return directApiCall(SERVICE_URLS.student, endpoint, 'PUT', body, options);
        },
        delete: (endpoint, options) => {
            return directApiCall(SERVICE_URLS.student, endpoint, 'DELETE', null, options);
        },
    }
};

function getServiceForEndpoint(endpoint) {
    const servicePatterns = {
        course: ['/course', '/courses', '/category', '/categories'],
        user: ['/user', '/users', '/auth', '/profile'],
        student: ['/student', '/students', '/school', '/schools']
    };

    for (const [serviceName, patterns] of Object.entries(servicePatterns)) {
        if (patterns.some(pattern => endpoint.startsWith(pattern))) {
            return apiService[serviceName];
        }
    }

    return apiService.student;
}

function getServiceUrlForEndpoint(endpoint) {
    const servicePatterns = {
        course: ['/course', '/courses', '/category', '/categories'],
        user: ['/user', '/users', '/auth', '/profile'],
        student: ['/student', '/students', '/school', '/schools']
    };

    for (const [serviceName, patterns] of Object.entries(servicePatterns)) {
        if (patterns.some(pattern => endpoint.startsWith(pattern))) {
            return SERVICE_URLS[serviceName];
        }
    }

    return SERVICE_URLS.student;
}

export const { course: courseService, user: userService, student: studentService } = apiService;

export { isDevelopment };
