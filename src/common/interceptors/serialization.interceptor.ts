import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';
import type { ClassTransformOptions } from 'class-transformer';

@Injectable()
export class SerializationInterceptor implements NestInterceptor {
  constructor(
    private readonly dto: any,
    private readonly options?: ClassTransformOptions,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Transform MongoDB documents to plain objects and apply DTO transformation
        if (data === null || data === undefined) {
          return data;
        }

        // Handle arrays
        if (Array.isArray(data)) {
          return data.map((item) => this.transformItem(item));
        }

        // Handle single objects
        return this.transformItem(data);
      }),
    );
  }

  private transformItem(item: any): any {
    if (item === null || item === undefined) {
      return item;
    }

    // Convert Mongoose document to plain object if needed
    const plainObject = item.toObject ? item.toObject() : item;

    // Apply DTO transformation if DTO is provided
    if (this.dto) {
      return plainToClass(this.dto, plainObject, {
        excludeExtraneousValues: true,
        ...this.options,
      });
    }

    // Return plain object with sensitive fields removed
    const { _id, __v, ...sanitized } = plainObject;
    return sanitized;
  }
}

// Specific serialization interceptor for MongoDB documents
@Injectable()
export class MongoSerializationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data === null || data === undefined) {
          return data;
        }

        // Handle arrays
        if (Array.isArray(data)) {
          return data.map((item) => this.sanitizeMongoDocument(item));
        }

        // Handle single objects
        return this.sanitizeMongoDocument(data);
      }),
    );
  }

  private sanitizeMongoDocument(document: any): any {
    if (document === null || document === undefined) {
      return document;
    }

    // Convert Mongoose document to plain object
    const plainObject = document.toObject ? document.toObject() : document;

    // Remove MongoDB-specific fields
    const { _id, __v, createdAt, updatedAt, ...sanitized } = plainObject;
    
    // Add back only the fields we want to expose
    return {
      ...sanitized,
      // Optionally add back specific timestamp fields if needed
      // createdAt: createdAt,
      // updatedAt: updatedAt,
    };
  }
}
