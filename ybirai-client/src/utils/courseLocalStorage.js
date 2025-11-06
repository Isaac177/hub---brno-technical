const FORM_DATA_KEY = 'course_form_data';

export const saveFormData = (formData) => {
  localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
};

export const getFormData = () => {
  const savedData = localStorage.getItem(FORM_DATA_KEY);
  return savedData ? JSON.parse(savedData) : null;
};

export const clearFormData = () => {
  localStorage.removeItem(FORM_DATA_KEY);
};
