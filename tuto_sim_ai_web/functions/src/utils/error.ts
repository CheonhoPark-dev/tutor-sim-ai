export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static notFound(message: string = '리소스를 찾을 수 없습니다.') {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static badRequest(message: string = '잘못된 요청입니다.') {
    return new AppError(message, 400, 'BAD_REQUEST');
  }

  static unauthorized(message: string = '인증이 필요합니다.') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = '권한이 없습니다.') {
    return new AppError(message, 403, 'FORBIDDEN');
  }
} 