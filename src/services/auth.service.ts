import { prisma } from "../lib/prisma";
import type { SignupInput } from "../schemas/user.schema.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.util.js";
import { generateToken } from "../utils/jwt.util.js";
import { errorResponse } from "../utils/response.util.js";

export const signup = async (userData: SignupInput) => {

  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    return {
      error: true,
      status: 409,
      response: errorResponse("Email already exists", ["Duplicate email"]),
    };
  }

  const hashedPassword = await hashPassword(userData.password);

  const user = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return { error: false, user };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { error: true, message: "Invalid credentials" };
  }

  const isValid = await comparePassword(password, user.password);

  if (!isValid) {
    return { error: true, message: "Invalid credentials" };
  }

  const token = generateToken(user.id, user.role);

  return {
    error: false,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
