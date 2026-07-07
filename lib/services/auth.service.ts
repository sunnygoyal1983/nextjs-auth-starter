import { Prisma } from "@prisma/client";

import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { type RegisterInput } from "@/validators/auth";

export class EmailAlreadyExistsError extends Error {
  constructor() {
    super("A user with this email already exists");
    this.name = "EmailAlreadyExistsError";
  }
}

function isUniqueConstraintViolation(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

const publicUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
  role: true,
  isVerified: true,
  createdAt: true,
});

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

export async function registerUser(
  input: RegisterInput,
): Promise<PublicUser> {
  const { name, password } = input;
  const email = input.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new EmailAlreadyExistsError();
  }

  const hashedPassword = await hashPassword(password);

  try {
    return await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: publicUserSelect,
    });
  } catch (error: unknown) {
    if (isUniqueConstraintViolation(error)) {
      throw new EmailAlreadyExistsError();
    }

    throw error;
  }
}
