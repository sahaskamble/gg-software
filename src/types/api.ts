import { NextRequest } from 'next/server';
import { NextApiRequest } from 'next';

export interface ApiRequest extends NextRequest {
  query?: {
    [key: string]: string | string[];
  };
  body: any;
}

export interface ApiParams {
  params: {
    id?: string;
    [key: string]: string | undefined;
  };
}

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
