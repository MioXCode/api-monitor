import { prisma } from "../config/database";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  sendEmail,
} from "../utils";
import { RegisterRequest, LoginRequest } from "../types";
import { config } from "../config";
import { User, UserSettings } from "@prisma/client";
import * as crypto from "crypto";

export class AuthService {
  async register(data: RegisterRequest) {
    try {
      await this.validateNewUser(data);

      const hashedPassword = await hashPassword(data.password);
      const { verificationToken, tokenExpiry } =
        this.generateVerificationToken();

      const user = await prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
          verificationToken,
          tokenExpiry,
          settings: {
            create: {
              emailNotifications: true,
            },
          },
        },
        include: {
          settings: true,
        },
      });

      try {
        await sendEmail(
          user.email,
          "Verify your email",
          `<p>Click <a href="http://localhost:3000/verify-email?token=${verificationToken}">here</a> to verify your email</p>`
        );
      } catch (emailError) {
        await prisma.user.delete({ where: { id: user.id } });
        throw new Error("Failed to send verification email. Please try again later.");
      }

      return this.excludePassword(user);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Registration failed");
    }
  }

  async login(data: LoginRequest) {
    try {
      const user = await this.getUserByEmail(data.email);
      await this.validateLogin(user, data.password);

      const token = generateToken({
        userId: user.id,
        role: user.role,
      });

      return {
        user: this.excludePassword(user),
        token,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  }

  async verifyEmail(token: string) {
    const user = await this.getUserByVerificationToken(token);
    this.validateVerificationToken(user);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        tokenExpiry: null,
      },
      include: {
        settings: true,
      },
    });

    return this.excludePassword(updatedUser);
  }

  async resendVerificationEmail(email: string) {
    const user = await this.getUserByEmail(email);
    this.validateResendVerification(user);

    const { verificationToken, tokenExpiry } = this.generateVerificationToken();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        tokenExpiry,
      },
      include: {
        settings: true,
      },
    });

    try {
      await sendEmail(
        user.email,
        "Verify your email",
        `<p>Click <a href="http://localhost:3000/verify-email?token=${verificationToken}">here</a> to verify your email</p>`
      );
    } catch (emailError) {
      await prisma.user.delete({ where: { id: user.id } });
      console.error("Email sending error:", emailError);
      throw new Error(
        "Failed to send verification email. Please try again later."
      );
    }

    return { user: this.excludePassword(updatedUser) };
  }

  private async validateNewUser(data: RegisterRequest): Promise<void> {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      throw new Error(
        existingUser.email === data.email
          ? "Email already registered"
          : "Username already taken"
      );
    }
  }

  private async getUserByEmail(
    email: string
  ): Promise<User & { settings: UserSettings | null }> {
    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        settings: true,
      },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    return user as User & { settings: UserSettings | null };
  }

  private async validateLogin(user: User, password: string): Promise<void> {
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    if (!user.isEmailVerified) {
      throw new Error("Please verify your email first");
    }
  }

  private async getUserByVerificationToken(
    token: string
  ): Promise<User & { settings: UserSettings | null }> {
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
      include: {
        settings: true,
      },
    });

    if (token != user?.verificationToken) {
      throw new Error("Invalid verification token");
    }

    if (!user) {
      throw new Error("Invalid verification token");
    }

    return user as User & { settings: UserSettings | null };
  }

  private validateVerificationToken(user: User): void {
    if (user.tokenExpiry && user.tokenExpiry < new Date()) {
      throw new Error("Verification token has expired");
    }
  }

  private validateResendVerification(user: User): void {
    if (user.isEmailVerified) {
      throw new Error("Email already verified");
    }
  }

  private generateVerificationToken(): {
    verificationToken: string;
    tokenExpiry: Date;
  } {
    return {
      verificationToken: crypto.randomUUID(),
      tokenExpiry: new Date(Date.now() + config.emailVerificationExpiry),
    };
  }

  private excludePassword<T extends { password: string }>(
    user: T
  ): Omit<T, "password"> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
