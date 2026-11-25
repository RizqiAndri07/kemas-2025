export interface BlogSelect {
  id: string;
  title: string;
  description: string;
  tag: string | null;
  status: "PUBLIC" | "PRIVATE";
  commentStatus: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogInsert {
  id?: string;
  title: string;
  description: string;
  tag?: string | null;
  status?: "PUBLIC" | "PRIVATE";
  commentStatus?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CommentSelect {
  id: string;
  blogId: string;
  name: string;
  email: string | null;
  content: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentInsert {
  id?: string;
  blogId: string;
  name: string;
  email?: string | null;
  content: string;
  isApproved?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
