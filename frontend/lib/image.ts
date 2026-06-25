/** Normalizes .jfif files to .jpg so browsers send the correct MIME type. */
export function normalizeImageFile(file: File): File {
  if (file.name.toLowerCase().endsWith(".jfif")) {
    return new File([file], file.name.replace(/\.jfif$/i, ".jpg"), { type: "image/jpeg" });
  }
  return file;
}

const STORAGE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

/**
 * Resolves an image_path stored in the database to a full URL.
 *
 * - If it's already a full URL (Cloudinary or any http/https URL) → use as-is.
 * - If it's a relative path (old local storage) → prepend STORAGE_URL.
 * - If null/undefined → return null.
 */
export function getImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `${STORAGE_URL}/${imagePath}`;
}

/**
 * Returns a Cloudinary transformation URL for optimized sizes.
 * Falls back gracefully to the original URL if it's not a Cloudinary URL.
 *
 * @param url      Full image URL (Cloudinary or local)
 * @param width    Desired width in px
 * @param height   Desired height in px (optional, defaults to square crop)
 */
export function getOptimizedUrl(
  url: string | null | undefined,
  width: number,
  height?: number
): string | null {
  if (!url) return null;

  if (!url.includes("res.cloudinary.com")) {
    return url; // local dev — return as-is
  }

  const h = height ?? width;
  // Insert transformation before /upload/
  return url.replace(
    "/upload/",
    `/upload/w_${width},h_${h},c_fill,q_auto,f_auto/`
  );
}
