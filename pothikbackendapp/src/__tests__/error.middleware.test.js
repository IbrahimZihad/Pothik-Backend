const multer = require('multer');
const { errorHandler } = require('../middleware/error.middleware');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ─── Multer Errors ─────────────────────────────
  describe('Multer Errors', () => {
    it('should handle LIMIT_FILE_SIZE error', () => {
      const err = new multer.MulterError('LIMIT_FILE_SIZE');

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'File too large',
        details: 'Maximum file size is 5MB',
      });
    });

    it('should handle LIMIT_UNEXPECTED_FILE error', () => {
      const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image');

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unexpected field',
        details: err.message,
      });
    });

    it('should handle generic Multer error', () => {
      const err = new multer.MulterError('LIMIT_PART_COUNT');

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'File upload error',
        details: err.message,
      });
    });
  });

  // ─── Custom File Filter Error ─────────────────────────────
  describe('Custom File Filter Error', () => {
    it('should handle invalid file type error', () => {
      const err = new Error('Only image files are allowed!');

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid file type',
        details: 'Only JPEG, JPG, PNG, GIF, and WEBP images are allowed',
      });
    });
  });

  // ─── Generic Errors ─────────────────────────────
  describe('Generic Errors', () => {
    it('should handle generic error with status', () => {
      const err = new Error('Something went wrong');
      err.status = 404;

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Something went wrong',
        details: undefined,
      });
    });

    it('should handle generic error without status (default 500)', () => {
      const err = new Error('Server crash');

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Server crash',
        details: undefined,
      });
    });

    it('should include stack trace in development mode', () => {
      process.env.NODE_ENV = 'development';

      const err = new Error('Dev error');

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Dev error',
        details: err.stack,
      });

      process.env.NODE_ENV = 'test'; // reset
    });
  });

  // ─── Console Logging ─────────────────────────────
  describe('Logging', () => {
    it('should log error message to console', () => {
      const consoleSpy = jest.spyOn(console, 'error');

      const err = new Error('Log this error');

      errorHandler(err, req, res, next);

      expect(consoleSpy).toHaveBeenCalledWith('Error:', 'Log this error');
    });
  });
});