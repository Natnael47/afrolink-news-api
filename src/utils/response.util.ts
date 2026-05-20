export interface ApiResponse {
  Success: boolean;
  Message: string;
  Object: any | null;
  Errors: string[] | null;
}

export interface PaginatedResponse extends ApiResponse {
  PageNumber: number;
  PageSize: number;
  TotalSize: number;
}

export const successResponse = (
  message: string,
  object: any = null,
): ApiResponse => ({
  Success: true,
  Message: message,
  Object: object,
  Errors: null,
});

export const errorResponse = (
  message: string,
  errors: string[] = [],
): ApiResponse => ({
  Success: false,
  Message: message,
  Object: null,
  Errors: errors,
});

export const paginatedResponse = (
  objects: any[],
  pageNumber: number,
  pageSize: number,
  totalSize: number,
  message: string = "Success",
): PaginatedResponse => ({
  Success: true,
  Message: message,
  Object: objects,
  PageNumber: pageNumber,
  PageSize: pageSize,
  TotalSize: totalSize,
  Errors: null,
});
