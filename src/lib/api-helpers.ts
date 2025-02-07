import { NextRequest, NextResponse } from 'next/server';

export interface ApiContext {
  params: {
    id?: string;
    [key: string]: string | undefined;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success,
    ...(data && { data }),
    ...(error && { error }),
    ...(message && { message }),
  };

  return NextResponse.json(response);
}

export async function handleApiError(error: unknown): Promise<NextResponse> {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return createApiResponse(false, undefined, error.message);
  }
  
  return createApiResponse(false, undefined, 'An unexpected error occurred');
}

export function validateRequestBody<T>(
  req: NextRequest,
  requiredFields: (keyof T)[]
): { isValid: boolean; body?: T; error?: string } {
  try {
    const body = req.body as T;
    
    if (!body || typeof body !== 'object') {
      return { isValid: false, error: 'Request body is required and must be an object' };
    }

    for (const field of requiredFields) {
      if (!(field in (body as Record<keyof T, unknown>))) {
        return { isValid: false, error: `${String(field)} is required` };
      }
    }

    return { isValid: true, body };
  } catch (error) {
    return { isValid: false, error: 'Invalid request body' };
  }
}
