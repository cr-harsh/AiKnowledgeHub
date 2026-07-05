/**
 * Validates registration request body.
 */
export const validateRegisterInput = (data) => {
  const errors = {};
  const { username, email, password } = data;

  if (!username || username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters long';
  }

  if (!email) {
    errors.email = 'Email is required';
  } else {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
  }

  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

/**
 * Validates login request body.
 */
export const validateLoginInput = (data) => {
  const errors = {};
  const { email, password } = data;

  if (!email) {
    errors.email = 'Email is required';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};
