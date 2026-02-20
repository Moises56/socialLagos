import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import SocialAccount from "@/lib/db/models/social-account.model";
import { successResponse, errorResponse, AppError } from "@/lib/utils/errors";

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

    const accounts = await SocialAccount.find({
      userId: session.user.id,
      isActive: true,
    })
      .select("-auth")
      .lean();

    return NextResponse.json(
      successResponse(
        accounts.map((a) => ({
          id: a._id.toString(),
          platform: a.platform,
          accountName: a.accountName,
          accountType: a.accountType,
          avatarUrl: a.avatarUrl,
          monetization: a.monetization,
          isActive: a.isActive,
          connectedAt: a.connectedAt,
        }))
      )
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
