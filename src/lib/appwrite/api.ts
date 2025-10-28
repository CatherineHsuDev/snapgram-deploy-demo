import { ID, ImageGravity, Query, type Models } from "appwrite";

import { appwriteConfig, account, databases, storage, avatars } from "./config";
import {
  type INewPost,
  type INewUser,
  type IUpdatePost,
  type PostDoc,
} from "@/types";

// https://appwrite.io/docs/sdks --> D.unique()
export async function createUserAccount(user: INewUser) {
  try {
    // account在config.ts
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);

    // $id 是appwrite儲存的寫法
    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  username?: string;
  imageUrl: string;
  // 影片是寫imageUrl: URL;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.error(error);
  }
}

export async function signInAccount(user: { email: string; password: string }) {
  const existing = await account.get().catch(() => null); // 檢查是否已登入
  // console.log(existing);
  if (existing) return existing; // 已登入就不要再建 session

  try {
    const session = await account.createEmailPasswordSession(
      user.email,
      user.password
    );
    return session;
  } catch (error) {
    console.log(error);
  }
}

// export async function getAccount() {
//   try {
//     const currentAccount = await account.get();

//     return currentAccount;
//   } catch (error) {
//     console.log(error);
//   }
// }

export async function getCurrentUser() {
  console.log("running getCurrentUser in api.ts");

  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
}

export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
  }
}
export async function createPost(post: INewPost) {
  try {
    // post.file是PostForm裡面的項目
    // uploadFile下面的子function
    const uploadedFile = await uploadFile(post.file[0]);

    // check if file is uploaded
    if (!uploadedFile) throw Error;

    // get file url, 下面的子function 上傳後預覽
    const fileUrl = getFilePreview(uploadedFile.$id);

    // check if url is got
    if (!fileUrl) {
      deleteFile(uploadedFile.$id);
      throw Error;
    }

    // 原本儲存
    // 存入db以及未來瀏覽專用
    const viewUrl = getImageView(uploadedFile.$id);
    // console.log(viewUrl);

    // convert tags in an array

    // save post to db

    // console.log("typeof post.tags");
    // console.log(Array.isArray(post.tags));
    // console.log("tags: post.tags");
    // console.log(post.tags);
    // console.log("下面開始await databases.createDocument");

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: viewUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: post.tags,
      }
    );

    // check if new post is created
    // cloud的storage還是有存成照片
    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      // 以下來自appwrite內建
      // https://appwrite.io/docs/products/storage/quick-start
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      ImageGravity.Center,
      100
    );
    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

// export async function getRecentPosts() {
//   const posts = await databases.listDocuments(
//     appwriteConfig.databaseId,
//     appwriteConfig.postCollectionId
//     // define which order do we want ot get it
//     // latest at first and limit amount to 20
//     [Query.orderDesc('$createAt'), Query.limit(20)]
//   );

//   if(!posts) throw Error;
//   return posts;
// }

export async function getRecentPosts(): Promise<Models.DocumentList<PostDoc>> {
  const res = await databases.listDocuments<PostDoc>(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    [
      Query.orderDesc("$createdAt"), // ✅ 別寫成 $createAt
      Query.limit(20),
    ]
  );

  // listDocuments 正常情況不會回 falsy，這行可省略
  // if (!res) throw new Error("Failed to fetch posts");

  return res; // 型別 = Models.DocumentList<PostDoc>，其中 documents: PostDoc[]
}

export function getImageView(fileId: string) {
  try {
    const viewUrl = storage.getFileView(appwriteConfig.storageId, fileId);
    return viewUrl;
  } catch (error) {
    console.log(error);
  }
}

export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );
    if (!updatedPost) throw Error;
    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function savePost(postId: string, userId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );
    if (!updatedPost) throw Error;
    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );
    if (!statusCode) throw Error;
    return { statuse: "Remove post from saved successfully" };
  } catch (error) {
    console.log(error);
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await databases.getDocument<PostDoc>(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );
    return post;
  } catch (error) {
    console.log(error);
  }
}

export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0; // 大於0表示有上傳東西，0就是沒傳東西
  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // post.file是PostForm裡面的項目
      // uploadFile下面的子function
      const uploadedFile = await uploadFile(post.file[0]);

      // check if file is uploaded
      if (!uploadedFile) throw Error;
      // get file url, 下面的子function 上傳後預覽
      const fileUrl = getFilePreview(uploadedFile.$id);

      // check if url is got
      if (!fileUrl) {
        deleteFile(uploadedFile.$id);
        throw Error;
      }

      // 原本儲存
      // 存入db以及未來瀏覽專用
      const viewUrl = getImageView(uploadedFile.$id);
      console.log(viewUrl);
      image = { ...image, imageUrl: viewUrl, imageId: uploadedFile.$id };
    }

    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: post.tags,
      }
    );

    // check if new post is created
    // cloud的storage還是有存成照片
    if (!updatedPost) {
      await deleteFile(post.imageId);
      throw Error;
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function deletePost(postId: string, imageId: string) {
  if (!postId || !imageId) throw Error;

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );
    return { status: "delete post successfully" };
  } catch (error) {
    console.log(error);
  }
}

// https://appwrite.io/docs/products/databases/queries
export async function getInfinitePosts({ pageParam }: { pageParam?: string }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(3)];

  // 如果在page2 ,跳過前面10項，Query.limit(10)已經設定一次10個
  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments<PostDoc>(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;
    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function searchPosts(searchTerm: string) {
  try {
    console.log("searchTerm", searchTerm);

    const posts = await databases.listDocuments<PostDoc>(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      // 從caption欄位搜尋關鍵字
      [Query.search("caption", searchTerm)]
    );

    console.log("posts from api");
    console.log(posts);

    if (!posts) throw Error;
    return posts;
  } catch (error) {
    console.log(error);
  }
}
