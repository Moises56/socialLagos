import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/user.model";
import { successResponse, errorResponse, AppError } from "@/lib/utils/errors";

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50)
    .optional(),
  avatarUrl: z.string().url("URL inválida").optional(),
  defaults: z
    .object({
      language: z.string().optional(),
      timezone: z.string().optional(),
      defaultTone: z.string().optional(),
      defaultNiche: z.string().optional(),
    })
    .optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse(new AppError("No autenticado", "AUTH_ERROR", 401)),
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json(
        errorResponse(new AppError("Usuario no encontrado", "NOT_FOUND", 404)),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
        usage: user.usage,
        defaults: user.defaults,
        createdAt: user.createdAt,
      })
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

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse(new AppError("No autenticado", "AUTH_ERROR", 401)),
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(
          new AppError(parsed.error.issues[0].message, "VALIDATION_ERROR", 400)
        ),
        { status: 400 }
      );
    }

    await connectDB();

    const updateFields: Record<string, unknown> = {};
    if (parsed.data.name) updateFields.name = parsed.data.name;
    if (parsed.data.avatarUrl) updateFields.avatarUrl = parsed.data.avatarUrl;
    if (parsed.data.defaults) {
      for (const [key, val] of Object.entries(parsed.data.defaults)) {
        if (val !== undefined) {
          updateFields[`defaults.${key}`] = val;
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!user) {
      return NextResponse.json(
        errorResponse(new AppError("Usuario no encontrado", "NOT_FOUND", 404)),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
        defaults: user.defaults,
      })
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
