/**
 * Standard API response builders adhering to agent.md specifications:
 * { success: boolean, data?: any, message?: string, error?: any }
 */

export const successResponse = (res, data = null, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const errorResponse = (res, message = 'An error occurred', statusCode = 500, error = null) => {
  const payload = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV !== 'production' && error) {
    payload.error = typeof error === 'string' ? error : error.message || error;
  }

  return res.status(statusCode).json(payload);
};
