import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { syncAllMetrics, syncAllMetricsCron } from "@/lib/social/metrics-sync";
import { successResponse, errorResponse, AppError } from "@/lib/utils/errors";

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * POST — manual sync triggered by the user from the analytics page.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse(new AppError("No autenticado", "AUTH_ERROR", 401)),
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const accountId = body.accountId as string | undefined;

    const result = await syncAllMetrics(session.user.id, accountId);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error : new Error("Error desconocido")
      ),
      { status: 500 }
    );
  }
}

/**
 * GET — cron trigger (Vercel Cron or external cron service).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await syncAllMetricsCron();
    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cron error" },
      { status: 500 }
    );
  }
}
