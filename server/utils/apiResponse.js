/**
 * Utility to send standardized success API response.
 */
export const sendSuccess = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Utility to send standardized error API response.
 */
export const sendError = (res, statusCode, message, error = null) => {
  const responseBody = {
    success: false,
    message
  };

  if (error) {
    responseBody.error = typeof error === 'object' ? error.message || error : error;
  }

  return res.status(statusCode).json(responseBody);
};
