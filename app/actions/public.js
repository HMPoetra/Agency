"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createReview } from "@/lib/queries";

const ReviewSchema = z.object({
  name_server: z.string().min(2, "Nama/Server minimal 2 karakter"),
  rating: z.coerce.number().int().min(1).max(5),
  message: z.string().min(5, "Pesan minimal 5 karakter"),
});

export async function submitReviewAction(prevState, formData) {
  const parsed = ReviewSchema.safeParse({
    name_server: formData.get("name_server"),
    rating: formData.get("rating"),
    message: formData.get("message"),
  });
  
  if (!parsed.success) {
    const errorMsg = parsed.error.errors?.[0]?.message || parsed.error.issues?.[0]?.message || "Data yang dimasukkan tidak valid.";
    return { error: errorMsg };
  }
  
  try {
    await createReview(parsed.data);
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: "Gagal mengirim ulasan. Silakan coba lagi." };
  }
}
