import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If it's already formatted as ApiResponse, return as-is
        if (this.isApiResponse(data)) {
          return data;
        }

        // If it's a paginated response with meta and data
        if (this.isPaginatedResponse(data)) {
          return {
            success: true,
            message: 'Operation successful',
            data: data.data,
            meta: data.meta,
          };
        }

        // For all other successful responses
        return {
          success: true,
          message: 'Operation successful',
          data,
        };
      }),
    );
  }

  private isApiResponse(data: any): data is ApiResponse<any> {
    return data &&
      typeof data === 'object' &&
      'success' in data &&
      'message' in data &&
      'data' in data;
  }

  private isPaginatedResponse(data: any): data is { data: any; meta: any } {
    return data &&
      typeof data === 'object' &&
      'data' in data &&
      'meta' in data;
  }
}