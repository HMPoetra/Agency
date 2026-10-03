import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Downloads an image from a URL and saves it to the local public/uploads directory.
 * Returns the local path (e.g., /uploads/filename.png)
 * If the URL is already local or downloading fails, it returns the original URL.
 */
export async function processImageUrl(fileOrUrl) {
  if (!fileOrUrl) return fileOrUrl;

  // Handle direct File upload from FormData
  if (typeof fileOrUrl === "object" && fileOrUrl.constructor.name === "File") {
    if (fileOrUrl.size === 0) return null; // empty file input
    try {
      const buffer = await fileOrUrl.arrayBuffer();
      const ext = path.extname(fileOrUrl.name) || ".jpg";
      const hash = crypto.randomBytes(8).toString("hex");
      const filename = `img_${Date.now()}_${hash}${ext}`;
      
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, Buffer.from(buffer));
      return `/uploads/${filename}`;
    } catch (e) {
      console.error("Error processing file upload:", e);
      return null;
    }
  }

  // Handle URL string
  const url = fileOrUrl;
  if (typeof url !== "string") return url;
  if (!url.startsWith("http")) return url; // Already local or invalid

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);

    const buffer = await res.arrayBuffer();
    
    // Attempt to guess extension from content-type or URL
    const contentType = res.headers.get("content-type") || "";
    let ext = ".jpg"; // Default
    if (contentType.includes("png")) ext = ".png";
    else if (contentType.includes("gif")) ext = ".gif";
    else if (contentType.includes("webp")) ext = ".webp";
    else {
      const match = url.match(/\.([a-zA-Z0-9]+)(\?|$)/);
      if (match && match[1]) ext = `.${match[1]}`;
    }

    const hash = crypto.randomBytes(8).toString("hex");
    const filename = `img_${Date.now()}_${hash}${ext}`;
    
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, Buffer.from(buffer));

    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Error processing image URL:", error);
    return url; // Fallback to original URL on failure
  }
}
