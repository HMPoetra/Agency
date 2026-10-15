// lib/upload.js
// Menyimpan gambar langsung ke database sebagai data URL (base64).
// Vercel serverless tidak punya filesystem yang writable/persistent.

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

function toDataUrl(type, buffer) {
  const mime = type && type.startsWith("image/") ? type : "image/jpeg";
  return `data:${mime};base64,${Buffer.from(buffer).toString("base64")}`;
}

export async function processImageUrl(fileOrUrl) {
  if (!fileOrUrl) return fileOrUrl;

  // Handle direct File upload from FormData
  if (typeof fileOrUrl === "object" && typeof fileOrUrl.arrayBuffer === "function" && fileOrUrl.name !== undefined) {
    if (fileOrUrl.size === 0) return null;
    if (fileOrUrl.size > MAX_BYTES) return null;
    const buffer = await fileOrUrl.arrayBuffer();
    return toDataUrl(fileOrUrl.type, buffer);
  }

  // Handle URL string — fetch lalu simpan sebagai data URL agar tidak expired
  const url = fileOrUrl;
  if (typeof url !== "string") return url;
  if (url.startsWith("data:") || !url.startsWith("http")) return url;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) return url;
    return toDataUrl(res.headers.get("content-type"), buffer);
  } catch (error) {
    console.error("Error processing image URL:", error);
    return url;
  }
}
