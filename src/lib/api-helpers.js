import { NextResponse } from 'next/server';

export function createApiResponse(
  success,
  data,
  error,
  message
) {
  const response = {
    success,
    ...(data && { data }),
    ...(error && { error }),
    ...(message && { message }),
  };

  return NextResponse.json(response);
}

export async function handleApiError(error) {
  console.error('API Error:', error);

  if (error instanceof Error) {
    return createApiResponse(false, undefined, error.message);
  }

  return createApiResponse(false, undefined, 'An unexpected error occurred');
}

export function validateRequestBody(
  req,
  requiredFields
) {
  try {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      return { isValid: false, error: 'Request body is required and must be an object' };
    }

    for (const field of requiredFields) {
      if (!(field in (body))) {
        return { isValid: false, error: `${String(field)} is required` };
      }
    }

    return { isValid: true, body };
  } catch (error) {
    return { isValid: false, error: 'Invalid request body' };
  }
}
