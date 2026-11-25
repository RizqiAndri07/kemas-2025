import { apiClient } from "@/lib/api-client";
import { BlogInsert, BlogSelect, CommentInsert, CommentSelect } from "./blog.table";

export async function getAllBlogs(): Promise<BlogSelect[]> {
  const res = await apiClient<BlogSelect[]>("blogs");
  return res.data || [];
}

export async function getBlogById(id: string): Promise<BlogSelect | null> {
  const res = await apiClient<BlogSelect>(`blogs/${id}`);
  return res.data || null;
}

export async function createBlog(data: BlogInsert): Promise<BlogSelect> {
  const res = await apiClient<BlogSelect>("blogs", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data!;
}

export async function updateBlog(id: string, data: Partial<BlogInsert>): Promise<BlogSelect | null> {
  const res = await apiClient<BlogSelect>(`blogs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data || null;
}

export async function deleteBlog(id: string): Promise<boolean> {
  const res = await apiClient(`blogs/${id}`, {
    method: "DELETE",
  });
  return res.success;
}

export async function toggleCommentStatus(id: string, newStatus: boolean): Promise<BlogSelect | null> {
  const res = await apiClient<BlogSelect>(`blogs/${id}/comment-status`, {
    method: "PATCH",
    body: JSON.stringify({ commentStatus: newStatus }),
  });
  return res.data || null;
}

export async function toggleBlogStatus(id: string, newStatus: "PUBLIC" | "PRIVATE"): Promise<BlogSelect | null> {
  const res = await apiClient<BlogSelect>(`blogs/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: newStatus }),
  });
  return res.data || null;
}

export async function getCommentsByBlogId(blogId: string): Promise<CommentSelect[]> {
  const blog = await getBlogById(blogId);
  return (blog as any)?.comments || [];
}

export async function createComment(data: CommentInsert): Promise<CommentSelect> {
  const res = await apiClient<CommentSelect>(`blogs/${data.blogId}/comments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data!;
}

export async function deleteComment(id: string): Promise<boolean> {
  const res = await apiClient(`blogs/comments/${id}`, {
    method: "DELETE",
  });
  return res.success;
}

export async function toggleCommentApproval(id: string, isApproved: boolean): Promise<CommentSelect | null> {
  const res = await apiClient<CommentSelect>(`blogs/comments/${id}/approval`, {
    method: "PATCH",
    body: JSON.stringify({ isApproved }),
  });
  return res.data || null;
}
