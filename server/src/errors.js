export class AppError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

export const errorOf = (status, code, message) => new AppError(status, code, message)
