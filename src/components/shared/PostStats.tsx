import {
  useDeleteSavedPost,
  useGetCurrentUser,
  useLikePost,
  useSavePost,
} from "@/lib/react-query/queriesAndMutations";
import { checkIsLiked } from "@/lib/utils";
import type { PostDoc, SaveDoc, UserDoc } from "@/types";

import React, { useState, useEffect } from "react";
import Loader from "./Loader";

type PostStatsProps = {
  post?: PostDoc;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  // 先轉換array of object成array of id(string)
  const likesList = (post?.likes ?? []).map(
    (likeUser: UserDoc) => likeUser.$id
  );
  const { data: currentUser } = useGetCurrentUser();

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost, isPending: isSavingPost } = useSavePost();
  const { mutate: deleteSavedPost, isPending: isDeletingSaved } =
    useDeleteSavedPost();

  const [likes, setLikes] = useState(likesList);
  const isLiked = checkIsLiked(likes, userId);

  const [isSaved, setIsSaved] = useState(false);

  // const [isSaved, setIsSaved] = useState<boolean>(() =>
  //   checkIsSaved(currentUser?.save, post.$id)
  // );
  // useEffect(() => {
  //   setIsSaved(checkIsSaved(currentUser?.save, post.$id));
  // }, [currentUser?.save, post.$id]);

  // const testcheckIsSaved = checkIsSaved(currentUser?.save, post.$id);
  if (!post) return null;
  const savedPostRecord = currentUser?.save.find((record: SaveDoc) => {
    return record.post.$id === post.$id;
  });

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [currentUser]);

  const handleLikePost = (e: React.MouseEvent) => {
    e.stopPropagation();

    let newLikes = [...likes]; // 列出所有有按like的id

    // 如果這個使用者id存在這串array,表示這個user按過like，return a boolean
    const hasLiked = newLikes.includes(userId);

    if (hasLiked) {
      // 找到不是這個userId的所有id,排除userId後把剩下的id以array存在newLikes
      newLikes = newLikes.filter((id) => id !== userId);
    } else {
      // 如果userId沒有在newLikes中，則加入這個array
      newLikes.push(userId);
    }

    setLikes(newLikes); // 把新的like array更新在頁面
    likePost({ postId: post.$id, likesArray: newLikes }); // 傳到mutation再傳到api再到雲端db更新
  };

  const handleSavePost = (e: React.MouseEvent) => {
    e.stopPropagation();

    // console.log(savedPostRecord);

    // const savedPostRecord = currentUser?.save.find(
    //   (record: Models.Document) => record.$id === post.$id
    // );

    if (savedPostRecord) {
      setIsSaved(false);
      deleteSavedPost(savedPostRecord.$id);
    } else {
      savePost({ postId: post.$id, userId });
      setIsSaved(true);
    }
  };

  return (
    <div className="flex justify-between items-center z-20">
      <div className="flex gap-2 mr-5">
        <img
          src={isLiked ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
          alt="like"
          width={20}
          height={20}
          onClick={
            handleLikePost
            // we want to get the click event, and call handleLikePost
          }
          className="cursor-pointer"
        />

        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>
      <div className="flex gap-2">
        {isSavingPost || isDeletingSaved ? (
          <Loader />
        ) : (
          <img
            src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
            alt="like"
            width={20}
            height={20}
            onClick={handleSavePost}
            className="cursor-pointer"
          />
        )}
      </div>
    </div>
  );
};

export default PostStats;
