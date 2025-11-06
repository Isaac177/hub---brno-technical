import axios from 'axios';

const userServiceUrl = process.env.USER_SERVICE_URL || 'https://user.ybyraihub.kz/api';

export const findUserByEmail = async (email: string | null) => {
    try {
        if (!email) {
            return null;
        }

        const requestUrl = `${userServiceUrl}/user/byEmail/${encodeURIComponent(email)}`;

        const response = await axios.get(requestUrl);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null;
        }
        console.error('Failed to fetch user:', error);
        throw error;
    }
}
