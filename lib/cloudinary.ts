import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

/**
 * Generate a signed upload payload so the browser can upload directly
 * to Cloudinary without the image bytes ever touching our server.
 */
export function generateUploadSignature(params: { folder: string; public_id?: string }): {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
  public_id?: string;
} {
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign: Record<string, string | number> = {
    folder: params.folder,
    timestamp,
  };
  if (params.public_id) paramsToSign.public_id = params.public_id;

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY!,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    folder: params.folder,
    ...(params.public_id ? { public_id: params.public_id } : {}),
  };
}
