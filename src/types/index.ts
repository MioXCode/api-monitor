import { JwtPayload } from "jsonwebtoken";
import { UserRole } from "@prisma/client";

export interface JWTPayload extends JwtPayload {
  userId: string;
  role: UserRole;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface EndpointRequest {
  name: string;
  url: string;
  headers: Record<string, string>;
  checkInterval?: number;
  timeout?: number;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?:
    | string
    | {
        code: string;
        details: string;
      };
}
