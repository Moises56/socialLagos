import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/user.model";
import { registerSchema } from "@/lib/utils/validators";
import { successResponse, errorResponse, AppError } from "@/lib/utils/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(
          new AppError(
            parsed.error.issues[0].message,
            "VALIDATION_ERROR",
            400
          )
        ),
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        errorResponse(
          new AppError("Ya existe una cuenta con este email", "USER_EXISTS", 409)
        ),
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      hashedPassword,
      plan: "free",
      usage: {
        contentGenerated: 0,
        postsPublished: 0,
        storageUsedMB: 0,
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      defaults: {
        language: "es",
        timezone: "America/Tegucigalpa",
      },
    });

    return NextResponse.json(
      successResponse({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        plan: user.plan,
      }),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      errorResponse(error instanceof Error ? error : new Error("Error desconocido")),
      { status: 500 }
    );
  }
}
