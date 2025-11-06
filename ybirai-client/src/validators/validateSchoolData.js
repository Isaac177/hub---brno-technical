


export const validateSchoolData = (data) => {
    const errors = {};

    if (!data.name?.trim()) {
        errors.name = 'School name is required';
    }

    if (!data.website?.trim()) {
        errors.website = 'Website is required';
    } else if (!/^https?:\/\/.+\..+/.test(data.website)) {
        errors.website = 'Please enter a valid URL';
    }

    if (!data.foundedYear) {
        errors.foundedYear = 'Founded year is required';
    } else if (isNaN(data.foundedYear) || data.foundedYear < 1800 || data.foundedYear > new Date().getFullYear()) {
        errors.foundedYear = 'Please enter a valid year';
    }

    if (!data.phoneNumber?.trim()) {
        errors.phoneNumber = 'Phone number is required';
    }

    if (!data.address?.trim()) {
        errors.address = 'Address is required';
    }

    if (!data.city?.trim()) {
        errors.city = 'City is required';
    }

    if (!data.country?.trim()) {
        errors.country = 'Country is required';
    }

    return errors;
};
