export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string | string[];
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: string | undefined;
  file: File[];
  location?: string;
  tags?: string[];
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
};

// refer to input fields in SignupForm.tsx
export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};

import { type Models } from "appwrite";

/** Users */
export type UserDoc = Models.Document & {
  name?: string;
  username?: string;
  accountId: string; // required
  email: string; // required
  bio?: string | null;
  imageId?: string;
  imageUrl: string; // required

  // 反向關聯（可能回展開文件或 id，因此用 union）
  // posts?: (PostDoc | string)[];
  // liked?: string[];
};

/** Posts */
export type PostDoc = Models.Document & {
  caption?: string;
  tags?: string[];
  imageUrl: string; // required
  imageId: string; // required
  location?: string;

  creator: UserDoc; // Many-to-one
  // creator?: UserDoc | string;         // Many-to-one
  likes: UserDoc[]; // Many-to-many
  // ❌ 建議移除 Post.save；用 Saves 集合來表示收藏
};

/** Saves（收藏） */
export type SaveDoc = Models.Document & {
  user: UserDoc; // Many-to-one
  post: PostDoc; // Many-to-one
};

// likeList
export type likeUser = Models.Document & {
  name?: string;
  username?: string;
  accountId: string; // required
  email: string; // required
  bio?: string | null;
  imageId?: string;
  imageUrl: string; // required

  // 反向關聯（可能回展開文件或 id，因此用 union）
  posts?: (PostDoc | string)[];
  liked?: (PostDoc | string)[];
};
