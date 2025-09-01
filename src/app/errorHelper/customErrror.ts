class customError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number, stack?: string) {
    super(message);
    this.statusCode = statusCode;

    // Only capture stack if not provided
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set the prototype explicitly (needed for instanceof checks in TS)
    Object.setPrototypeOf(this, customError.prototype);
  }
}

export default customError;
