import type { PostDoc } from "@/types";
import Loader from "./Loader";
import GridPostList from "./GridPostList";
import type { Models } from "appwrite";
type SearchResultsProps = {
  isSearchFetching: boolean;
  // searchedPosts: PostDoc[];
  searchedPosts?: Models.DocumentList<PostDoc>; // 接受整個 DocumentList 或 undefined
};

const SearchResults = ({
  isSearchFetching,
  searchedPosts,
}: SearchResultsProps) => {
  // console.log("isSearchFetching", isSearchFetching);
  // console.log("searchedPosts", searchedPosts);

  if (isSearchFetching) return <Loader />;

  if (searchedPosts && searchedPosts.documents.length > 0) {
    const list = searchedPosts?.documents ?? []; // ← 轉成陣列
    return <GridPostList posts={list} />;
  }
  return <p>No results found</p>;
};

export default SearchResults;
