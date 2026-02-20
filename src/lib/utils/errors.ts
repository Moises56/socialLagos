export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "No autenticado") {
    super(message, "AUTHENTICATION_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "No autorizado") {
    super(message, "AUTHORIZATION_ERROR", 403);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} no encontrado`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class PlatformError extends AppError {
  constructor(platform: string, message: string, details?: Record<string, unknown>) {
    super(`[${platform}] ${message}`, "PLATFORM_ERROR", 502, details);
    this.name = "PlatformError";
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super("Demasiadas solicitudes, intenta más tarde", "RATE_LIMIT_ERROR", 429);
    this.name = "RateLimitError";
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function errorResponse(error: AppError | Error): ApiResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      error: { code: error.code, message: error.message },
    };
  }
  return {
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" },
  };
}
