import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../utils/apiService';

const EnrollmentContext = createContext();

export const useEnrollment = () => {
    const context = useContext(EnrollmentContext);
    if (!context) {
        throw new Error('useEnrollment must be used within an EnrollmentProvider');
    }
    return context;
};

export const EnrollmentProvider = ({ children }) => {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [progressData, setProgressData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEnrollmentData = async () => {
        if (!user?.email) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await apiService.student.get(
                `/enrollments/by-email?userEmail=${encodeURIComponent(user.email)}`,
                {
                    headers: { 'Accept-Language': 'en' }
                }
            );

            const enrollmentData = response.data || [];

            if (enrollmentData.length === 0) {
                setEnrollments([]);
                setCourses([]);
                setProgressData({});
                return;
            }

            const enrollmentList = enrollmentData.map(enrollment => ({
                id: enrollment.id,
                courseId: enrollment.courseId,
                status: enrollment.status,
                progress: enrollment.progress,
                certificate: enrollment.certificate,
                lastProgressUpdate: enrollment.lastProgressUpdate,
            }));

            const progressByCourse = {};
            enrollmentData.forEach(enrollment => {
                if (enrollment.topicsProgress) {
                    progressByCourse[enrollment.courseId] = {
                        overallProgress: enrollment.progress || 0,
                        completedComponents: enrollment.completedComponents || 0,
                        totalComponents: enrollment.totalComponents || 0,
                        componentProgress: enrollment.componentProgress || {},
                        topicsProgress: enrollment.topicsProgress || {},
                        lastUpdated: enrollment.lastProgressUpdate,
                    };
                }
            });

            setEnrollments(enrollmentList);
            setProgressData(progressByCourse);

            const courseIds = enrollmentList.map(enrollment => enrollment.courseId);

            if (courseIds.length > 0) {
                const coursesResponse = await apiService.course.post(
                    '/courses/batch',
                    { courseIds: courseIds },
                    {
                        headers: { 'Accept-Language': 'en' }
                    }
                );

                const courseList = coursesResponse.courses || [];
                setCourses(courseList);
            }

        } catch (error) {
            console.error('[EnrollmentContext] Error fetching enrollment data:', error);
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.email) {
            fetchEnrollmentData();
        } else {
            setEnrollments([]);
            setCourses([]);
            setProgressData({});
        }
    }, [user?.email]);

    const getEnrollmentByCourseId = (courseId) => {
        return enrollments.find(enrollment => enrollment.courseId === courseId);
    };

    const getProgressByCourseId = (courseId) => {
        return progressData[courseId] || null;
    };

    const getCourseByCourseId = (courseId) => {
        return courses.find(course => course.id === courseId);
    };

    const isEnrolledInCourse = (courseId) => {
        return enrollments.some(enrollment => enrollment.courseId === courseId);
    };

    const getTopicProgress = (courseId, topicId) => {
        const courseProgress = progressData[courseId];
        return courseProgress?.topicsProgress?.[topicId] || null;
    };

    const canAccessQuiz = (courseId, topicId, requiredProgress = 50) => {
        const topicProgress = getTopicProgress(courseId, topicId);
        const videoProgress = topicProgress?.videoProgress || 0;
        return videoProgress >= requiredProgress;
    };

    const refreshEnrollmentData = () => {
        fetchEnrollmentData();
    };

    const value = {
        enrollments,
        courses,
        progressData,
        isLoading,
        error,
        getEnrollmentByCourseId,
        getProgressByCourseId,
        getCourseByCourseId,
        isEnrolledInCourse,
        getTopicProgress,
        canAccessQuiz,
        refreshEnrollmentData,
    };

    return (
        <EnrollmentContext.Provider value={value}>
            {children}
        </EnrollmentContext.Provider>
    );
};

export default EnrollmentProvider;
