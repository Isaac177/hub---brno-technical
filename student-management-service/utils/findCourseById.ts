import axios from 'axios';

const courseServiceUrl = process.env.COURSE_SERVICE_URL || 'https://course.ybyraihub.kz/api';

export const findCourseById = async (courseId: string) => {
    try {
        const response = await axios.get(`${courseServiceUrl}/courses/${courseId}`);

        return response.data;
    } catch (error: any) {
        if (error.response.status === 404) {
            return null;
        }

        console.log('Failed to fetch course:', error);
        throw error;
    }
}
