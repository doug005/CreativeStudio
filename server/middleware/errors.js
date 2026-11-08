export function notFound(req, res) {
  res.status(404).json({ message: 'The requested resource was not found.' });
}

export function errorHandler(error, req, res, _next) {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid record identifier.' });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'This action has already been recorded.' });
  }
  console.error(error);
  res.status(error.status || 500).json({ message: error.status ? error.message : 'Something went wrong. Please try again.' });
}
