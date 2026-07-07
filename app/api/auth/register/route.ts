import { NextResponse } from "next/server";

import {
  EmailAlreadyExistsError,
  registerUser,
} from "@/lib/services/auth.service";
import { registerSchema } from "@/validators/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const user = await registerUser(parsed.data);

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        data: { user },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof EmailAlreadyExistsError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 409 },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON in request body",
        },
        { status: 400 },
      );
    }

    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
