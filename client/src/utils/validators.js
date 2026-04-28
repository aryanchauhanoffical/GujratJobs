export const validators = {
  required: (msg = 'This field is required') => ({
    required: msg,
  }),

  email: {
    required: 'Email is required',
    pattern: {
      value: /^\S+@\S+\.\S+$/,
      message: 'Please enter a valid email address',
    },
  },

  password: {
    required: 'Password is required',
    minLength: {
      value: 6,
      message: 'Password must be at least 6 characters',
    },
  },

  phone: {
    pattern: {
      value: /^[6-9]\d{9}$/,
      message: 'Please enter a valid 10-digit Indian phone number',
    },
  },

  name: {
    required: 'Name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters',
    },
    maxLength: {
      value: 50,
      message: 'Name cannot exceed 50 characters',
    },
  },

  confirmPassword: (getValues) => ({
    required: 'Please confirm your password',
    validate: (value) => value === getValues('password') || 'Passwords do not match',
  }),

  salary: {
    min: (val) => !val || val >= 0 || 'Salary must be positive',
    max: (val, minVal) => !val || !minVal || parseInt(val) >= parseInt(minVal) || 'Max salary must be greater than min',
  },
};
