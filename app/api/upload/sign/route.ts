import { auth } from "@/lib/auth";
import { generateUploadSignature } from "@/lib/cloudinary";
import { NextResponse } from "next/server";

/**
 * POST /api/upload/sign
 * Body: { folder: string; public_id?: string }
 *
 * Returns signed Cloudinary upload credentials.
 * Admin-only — the browser then posts directly to Cloudinary.
 */
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await request.json();
  const folder: string = body.folder ?? "kens-products";
  const public_id: string | undefined = body.public_id;

  const signedParams = generateUploadSignature({ folder, public_id });

  return NextResponse.json(signedParams);
}
