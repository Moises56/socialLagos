import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db/mongoose";
import SocialAccount from "@/lib/db/models/social-account.model";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Facebook Data Deletion Callback
 * Required by Meta for apps that handle user data.
 * When a user removes the app from their Facebook settings,
 * Meta sends a signed request to this endpoint.
 */
export async function POST(request: Request) {
  try {
    const body = await request.formData();
    const signedRequest = body.get("signed_request") as string;

    if (!signedRequest) {
      return NextResponse.json({ error: "Missing signed_request" }, { status: 400 });
    }

    // Parse signed request from Facebook
    const [encodedSig, payload] = signedRequest.split(".");
    const sig = Buffer.from(
      encodedSig.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    );
    const data = JSON.parse(
      Buffer.from(
        payload.replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      ).toString("utf-8")
    );

    // Verify signature
    const appSecret = process.env.META_APP_SECRET;
    if (appSecret) {
      const expectedSig = crypto
        .createHmac("sha256", appSecret)
        .update(payload)
        .digest();

      if (!crypto.timingSafeEqual(sig, expectedSig)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    const userId = data.user_id;

    // Delete user's Facebook/Instagram social accounts
    await connectDB();
    await SocialAccount.deleteMany({
      platformAccountId: userId,
      platform: { $in: ["facebook", "instagram"] },
    });

    // Generate a confirmation code
    const confirmationCode = crypto.randomBytes(10).toString("hex");

    // Facebook expects this response format
    return NextResponse.json({
      url: `${APP_URL}/api/social/data-deletion/status?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  } catch {
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }
}

/**
 * Status check endpoint for data deletion confirmation
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing confirmation code" }, { status: 400 });
  }

  return NextResponse.json({
    status: "completed",
    confirmation_code: code,
    message: "User data has been deleted successfully.",
  });
}
