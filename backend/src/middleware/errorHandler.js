const notFound = (request, _response, next) => {
  const error = new Error(`Route not found: ${request.method} ${request.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, _request, response, _next) => {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) console.error(`${error.name || 'Error'}: ${error.message}`);

  response.status(statusCode).json({
    success: false,
    error: { message: error.publicMessage || (statusCode < 500 ? error.message : 'Internal server error') },
  });
};

module.exports = { notFound, errorHandler };
