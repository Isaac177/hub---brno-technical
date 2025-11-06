
export const validateUserPermission = (userRole: string) => {
    if (userRole === 'SCHOOL_ADMIN' || userRole === 'MODERATOR' || userRole === 'PLATFORM_ADMIN') {
        return true;
    }
    return false;
}