import { sign, verify, Secret, SignOptions } from "jsonwebtoken";
import { config } from "../config";
import { JWTPayload } from "../types/index";

export const generateToken = (payload: JWTPayload): string => {
  if (!config.jwtSecret) {
    throw new Error("JWT secret is not configured");
  }

  const options: SignOptions = {
    expiresIn: config.jwtExpiry as any,
    algorithm: "HS256",
  };

  return sign(payload, config.jwtSecret as Secret, options);
};

export const verifyToken = (token: string): JWTPayload => {
  if (!config.jwtSecret) {
    throw new Error("JWT secret is not configured");
  }

  try {
    return verify(token, config.jwtSecret as Secret) as JWTPayload;
  } catch (error: any) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};
