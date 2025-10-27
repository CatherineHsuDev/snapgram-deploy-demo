// 用來管理快取更新快取同步 寫入同步
// useMutation：用來做寫操作（POST/PUT/PATCH/DELETE）。跟 useQuery（讀取）相對。用它讀/改/失效快取
// 格式參考api.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
// fetching data -> useQuery
// modify data -> useMutation
import {
  createUserAccount,
  signInAccount,
  signOutAccount,
  createPost,
  getRecentPosts,
  likePost,
  savePost,
  deleteSavedPost,
  getCurrentUser,
  getPostById,
  updatePost,
  deletePost,
  searchPosts,
  getInfinitePosts,
} from "../appwrite/api";
import type { INewUser, INewPost, IUpdatePost, PostDoc } from "@/types";
import { QUERY_KEYS } from "./queryKeys";
import type { Models } from "appwrite";

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user),
  });
};
export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
      // invalidate data 使資料無效
      // 在建立最新post後，他會更新到剛剛的post為最新貼文並使前一個最新的為無效
      // allows to fetch the new fresh data not stale data
      // if we get recent post, it invalidateQueries (won't get data from cache)
      // will recall get data again from the server
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    // queryFn function means what will get executed from appwrite api.tsx
    queryFn: getRecentPosts,
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient(); // 使用修改功能的宣告
  return useMutation({
    mutationFn: ({
      postId,
      likesArray,
    }: {
      postId: string;
      likesArray: string[];
    }) => likePost(postId, likesArray), // 使用修改的fn
    onSuccess: (data) => {
      // 以下這些會在上面執行成功後重新更新
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id], // 更新那一篇的like的數量
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS], // 取得
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, userId }: { postId: string; userId: string }) =>
      savePost(postId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });
};

export const useGetPostById = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
    // enabled Set this to false or a function that returns false to disable automatic refetching when the query mounts or changes query keys.
    // 只有不同id的情況下會getPostById(postId)->refetch
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
      // get all the data and call queryClient, abandon old query key and update query key GET_POST_BY_ID (to get updated post)
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, imageId }: { postId: string; imageId: string }) =>
      deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: getInfinitePosts,
    initialPageParam: undefined, // ★ 第一頁沒有游標
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.documents.length === 0) return null;

      const lastId = lastPage?.documents[lastPage?.documents.length - 1].$id;
      return lastId;
    },
  });
};

export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    // 當searchTerm改變的時候才enable refetch
    enabled: !!searchTerm,
  });
};
