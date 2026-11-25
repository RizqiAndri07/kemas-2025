"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api-client";
import {
  blogFormSchema,
  BlogFormInput,
  commentFormSchema,
  CommentFormInput,
} from "../domain/blog.schema";
import { ActionResult } from "@/modules/shared/domain/common.types";

export async function createBlogAction(
  payload: BlogFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = blogFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi gagal",
      };
    }

    const res = await apiClient<{ id: string }>("blogs", {
      method: "POST",
      body: JSON.stringify(validated.data),
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Gagal membuat artikel",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/blog");
    return { success: true, data: res.data, message: res.message || "Artikel berhasil dibuat!" };
  } catch (error) {
    console.error("Error creating blog:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat artikel",
    };
  }
}

export async function updateBlogAction(
  id: string,
  payload: BlogFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = blogFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi gagal",
      };
    }

    const res = await apiClient<{ id: string }>(`blogs/${id}`, {
      method: "PUT",
      body: JSON.stringify(validated.data),
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Gagal memperbarui artikel",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/blog");
    return { success: true, data: res.data, message: res.message || "Artikel berhasil diperbarui!" };
  } catch (error) {
    console.error("Error updating blog:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui artikel",
    };
  }
}

export async function deleteBlogAction(id: string): Promise<ActionResult<void>> {
  try {
    const res = await apiClient(`blogs/${id}`, {
      method: "DELETE",
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal menghapus artikel",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/blog");
    return { success: true, data: undefined, message: res.message || "Artikel berhasil dihapus!" };
  } catch (error) {
    console.error("Error deleting blog:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus artikel",
    };
  }
}

export async function toggleBlogStatusAction(
  id: string,
  newStatus: "PUBLIC" | "PRIVATE"
): Promise<ActionResult<void>> {
  try {
    const res = await apiClient(`blogs/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal mengubah status artikel",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/blog");
    return {
      success: true,
      data: undefined,
      message: res.message || `Status artikel berhasil diubah ke ${newStatus}!`,
    };
  } catch (error) {
    console.error("Error toggling blog status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui status",
    };
  }
}

export async function toggleCommentStatusAction(
  id: string,
  newStatus: boolean
): Promise<ActionResult<void>> {
  try {
    const res = await apiClient(`blogs/${id}/comment-status`, {
      method: "PATCH",
      body: JSON.stringify({ commentStatus: newStatus }),
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal mengubah status komentar artikel",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/blog");
    return {
      success: true,
      data: undefined,
      message: res.message || `Fitur komentar berhasil ${newStatus ? "diaktifkan" : "dinonaktifkan"}!`,
    };
  } catch (error) {
    console.error("Error toggling comment status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui status komentar",
    };
  }
}

export const toggleBlogCommentAction = toggleCommentStatusAction;

export async function createCommentAction(
  blogId: string,
  payload: CommentFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = commentFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi gagal",
      };
    }

    const res = await apiClient<{ id: string }>(`blogs/${blogId}/comments`, {
      method: "POST",
      body: JSON.stringify(validated.data),
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Gagal menambahkan komentar",
      };
    }

    revalidatePath(`/blog/${blogId}`);
    return { success: true, data: res.data, message: res.message || "Komentar berhasil dikirim!" };
  } catch (error) {
    console.error("Error creating comment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menambahkan komentar",
    };
  }
}

export async function deleteCommentAction(commentId: string): Promise<ActionResult<void>> {
  try {
    const res = await apiClient(`blogs/comments/${commentId}`, {
      method: "DELETE",
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal menghapus komentar",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/blog");
    return { success: true, data: undefined, message: res.message || "Komentar berhasil dihapus!" };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus komentar",
    };
  }
}

export async function toggleCommentApprovalAction(
  commentId: string,
  isApproved: boolean
): Promise<ActionResult<void>> {
  try {
    const res = await apiClient(`blogs/comments/${commentId}/approval`, {
      method: "PATCH",
      body: JSON.stringify({ isApproved }),
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal memperbarui status persetujuan",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/blog");
    return {
      success: true,
      data: undefined,
      message: res.message || `Komentar berhasil ${isApproved ? "disetujui" : "disembunyikan"}!`,
    };
  } catch (error) {
    console.error("Error toggling comment approval:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui status persetujuan",
    };
  }
}
