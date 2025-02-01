import { hash, compare } from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
  try {
    return await hash(password, 12);
  } catch (error: any) {
    throw new Error(`Failed to hash password: ${error.message}`);
  }
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  try {
    return await compare(password, hash);
  } catch (error: any) {
    throw new Error(`Failed to verify password: ${error.message}`);
  }
};
