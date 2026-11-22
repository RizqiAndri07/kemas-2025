"use server";

import { revalidatePath } from "next/cache";
import {
  blogFormSchema,
  BlogFormInput,
  commentFormSchema,
  CommentFormInput,
} from "../domain/blog.schema";
import * as blogRepo from "../infrastructure/blog.repository";
import {
  extractImageUrlsFromHtml,
  deleteStorageImagesByUrls,
} from "../infrastructure/blog-storage.helper";
import { ActionResult } from "@/modules/shared/domain/common.types";
import { requireAuthUser } from "@/modules/auth/application/auth.guard";

export async function createBlogAction(
  payload: BlogFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // Proteksi sesi dashboard (CUD Protection)
    await requireAuthUser();

    const validated = blogFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi gagal",
      };
    }

    const newBlog = await blogRepo.createBlog({
      title: validated.data.title,
      description: validated.data.description,
      tag: validated.data.tag || null,
      status: validated.data.status,
      commentStatus: validated.data.commentStatus,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/blog");
    return { success: true, data: { id: newBlog.id }, message: "Artikel berhasil dibuat!" };
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
    // Proteksi sesi dashboard (CUD Protection)
    await requireAuthUser();

    const validated = blogFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi gagal",
      };
    }

    // 1. Ambil data artikel lama untuk diffing pembersihan gambar yang dihapus
    const oldBlog = await blogRepo.getBlogById(id);
    if (!oldBlog) {
      return { success: false, error: "Artikel tidak ditemukan" };
    }

    // 2. Deteksi gambar lama yang sudah tidak ada lagi di konten baru
    const oldImageUrls = extractImageUrlsFromHtml(oldBlog.description);
    const newImageUrls = extractImageUrlsFromHtml(validated.data.description);
    const removedImageUrls = oldImageUrls.filter((url) => !newImageUrls.includes(url));

    // 3. Hapus gambar yang dibuang dari Supabase Storage
    if (removedImageUrls.length > 0) {
      await deleteStorageImagesByUrls(removedImageUrls);
    }

    // 4. Perbarui data artikel di database
    const updated = await blogRepo.updateBlog(id, {
      title: validated.data.title,
      description: validated.data.description,
      tag: validated.data.tag || null,
      status: validated.data.status,
      commentStatus: validated.data.commentStatus,
    });

    if (!updated) {
      return { success: false, error: "Gagal memperbarui artikel" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/blog");
    revalidatePath(`/dashboard/blog/${id}/edit`);
    return { success: true, data: { id: updated.id }, message: "Artikel berhasil diperbarui!" };
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
    // Proteksi sesi dashboard (CUD Protection)
    await requireAuthUser();

    // 1. Ambil data artikel sebelum dihapus untuk membersihkan seluruh gambarnya dari storage
    const blog = await blogRepo.getBlogById(id);
    if (blog && blog.description) {
      const imageUrls = extractImageUrlsFromHtml(blog.description);
      if (imageUrls.length > 0) {
        await deleteStorageImagesByUrls(imageUrls);
      }
    }

    // 2. Hapus artikel dari database
    const success = await blogRepo.deleteBlog(id);
    if (!success) {
      return { success: false, error: "Gagal menghapus artikel atau artikel tidak ditemukan" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/blog");
    return { success: true, message: "Artikel berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting blog:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus artikel",
    };
  }
}

export async function toggleBlogCommentAction(
  id: string,
  newStatus: boolean
): Promise<ActionResult<void>> {
  try {
    // Proteksi sesi dashboard (CUD Protection)
    await requireAuthUser();

    const updated = await blogRepo.toggleCommentStatus(id, newStatus);
    if (!updated) {
      return { success: false, error: "Artikel tidak ditemukan" };
    }

    revalidatePath("/dashboard/blog");
    return {
      success: true,
      message: `Status komentar diubah ke: ${newStatus ? "Diizinkan" : "Dinonaktifkan"}`,
    };
  } catch (error) {
    console.error("Error toggling comment status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengubah status komentar",
    };
  }
}

export async function toggleBlogStatusAction(
  id: string,
  newStatus: "PUBLIC" | "PRIVATE"
): Promise<ActionResult<void>> {
  try {
    // Proteksi sesi dashboard (CUD Protection)
    await requireAuthUser();

    const updated = await blogRepo.toggleBlogStatus(id, newStatus);
    if (!updated) {
      return { success: false, error: "Artikel tidak ditemukan" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/blog");
    return {
      success: true,
      message: `Status publikasi artikel diubah ke: ${newStatus === "PUBLIC" ? "Public" : "Private"}`,
    };
  } catch (error) {
    console.error("Error toggling blog status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengubah status publikasi artikel",
    };
  }
}

// Comment Actions
export async function createCommentAction(
  payload: CommentFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = commentFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi komentar gagal",
      };
    }

    // Periksa apakah status komentar blog mengizinkan komentar
    const blog = await blogRepo.getBlogById(validated.data.blogId);
    if (!blog) {
      return { success: false, error: "Artikel tidak ditemukan" };
    }

    if (!blog.commentStatus) {
      return { success: false, error: "Komentar dinonaktifkan untuk artikel ini" };
    }

    const comment = await blogRepo.createComment({
      blogId: validated.data.blogId,
      name: validated.data.name,
      email: validated.data.email || null,
      content: validated.data.content,
      isApproved: true,
    });

    revalidatePath(`/blog/${validated.data.blogId}`);
    return { success: true, data: { id: comment.id }, message: "Komentar berhasil dikirim!" };
  } catch (error) {
    console.error("Error creating comment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengirim komentar",
    };
  }
}

export async function deleteCommentAction(id: string, blogId: string): Promise<ActionResult<void>> {
  try {
    // Proteksi sesi dashboard (CUD Protection)
    await requireAuthUser();

    const success = await blogRepo.deleteComment(id);
    if (!success) {
      return { success: false, error: "Komentar tidak ditemukan" };
    }

    revalidatePath(`/blog/${blogId}`);
    return { success: true, message: "Komentar berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus komentar",
    };
  }
}
