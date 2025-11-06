/**
 * Extracts initials from a name string.
 * For a single name, returns the first letter.
 * For multiple names, returns the first letter of the first and last name.
 * Handles null/undefined values and trims whitespace.
 * 
 * @param {string} name - The full name to extract initials from
 * @returns {string} The extracted initials (max 2 characters)
 * 
 * @example
 * getInitials('John Doe') // Returns 'JD'
 * getInitials('John') // Returns 'J'
 * getInitials('John Middle Doe') // Returns 'JD'
 * getInitials(null) // Returns 'A'
 * getInitials('') // Returns 'A'
 */
export const getInitials = (name) => {
  if (!name) return 'A';

  const names = name.trim().split(' ').filter(n => n);
  if (names.length === 0) return 'A';

  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }

  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};
