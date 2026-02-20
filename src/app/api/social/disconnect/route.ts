import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { disconnectAccount } from "@/lib/social/oauth-manager";
import { successResponse, errorResponse, AppError } from "@/lib/utils/errors";

const schema = z.object({
  accountId: z.string().min(1),
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
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(new AppError("accountId es requerido", "VALIDATION_ERROR", 400)),
        { status: 400 }
      );
    }

    const result = await disconnectAccount(
      parsed.data.accountId,
      session.user.id
    );

    if (!result) {
      return NextResponse.json(
        errorResponse(new AppError("Cuenta no encontrada", "NOT_FOUND", 404)),
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse({ disconnected: true }));
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error : new Error("Error desconocido")
      ),
      { status: 500 }
    );
  }
}
