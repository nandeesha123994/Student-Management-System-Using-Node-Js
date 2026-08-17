const errorMiddleware = (err, req, res, next) => {
  console.error("Global Error:", err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || "Internal Server Error"
  });
};

module.exports = errorMiddleware;