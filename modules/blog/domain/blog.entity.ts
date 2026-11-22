export interface BlogPostEntity {
  id: string;
  title: string;
  description: string;
  tag?: string | null;
  status: "PUBLIC" | "PRIVATE";
  commentStatus: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogCommentEntity {
  id: string;
  blogId: string;
  name: string;
  email?: string | null;
  content: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}
