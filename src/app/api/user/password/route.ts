import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/user.model";
import { successResponse, errorResponse, AppError } from "@/lib/utils/errors";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse(new AppError("No autenticado", "AUTH_ERROR", 401)),
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(
          new AppError(parsed.error.issues[0].message, "VALIDATION_ERROR", 400)
        ),
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select("+hashedPassword");
    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        errorResponse(new AppError("Usuario no encontrado", "NOT_FOUND", 404)),
        { status: 404 }
      );
    }

    const isValid = await bcrypt.compare(
      parsed.data.currentPassword,
      user.hashedPassword
    );
    if (!isValid) {
      return NextResponse.json(
        errorResponse(
          new AppError("Contraseña actual incorrecta", "INVALID_PASSWORD", 400)
        ),
        { status: 400 }
      );
    }

    const hashedNew = await bcrypt.hash(parsed.data.newPassword, 12);
    await User.findByIdAndUpdate(session.user.id, {
      $set: { hashedPassword: hashedNew },
    });

    return NextResponse.json(
      successResponse({ changed: true })
    );
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error : new Error("Error desconocido")
      ),
      { status: 500 }
    );
  }
}
