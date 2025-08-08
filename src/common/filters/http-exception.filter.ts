import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiError } from '../interfaces/api-response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse: ApiError = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    };

    const exceptionResponse = exception.getResponse();
    if (typeof exceptionResponse === 'object') {
      errorResponse.error = (exceptionResponse as any).error;
      if ((exceptionResponse as any).message) {
        errorResponse.message = Array.isArray((exceptionResponse as any).message)
          ? (exceptionResponse as any).message.join(', ')
          : (exceptionResponse as any).message;
      }
    }

    response.status(status).json(errorResponse);
  }
}