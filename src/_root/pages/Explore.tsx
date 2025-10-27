import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import SearchResults from "@/components/shared/SearchResults";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import {
  useGetPosts,
  useSearchPosts,
} from "@/lib/react-query/queriesAndMutations";
import { useState, useEffect, type ChangeEvent } from "react";
import { useInView } from "react-intersection-observer";

const Explore = () => {
  const { ref, inView } = useInView();
  // const posts: PostDoc[] = [];

  const { data, isPending, fetchNextPage, hasNextPage } = useGetPosts();

  const [searchValue, setSearchValue] = useState<string>("");
  const debouncedValue = useDebounce(searchValue, 2500); // 5000ms後更新一次
  const {
    data: searchedPosts,
    isFetching: isSearchFetching,
    isPending: isSearchLoading,
  } = useSearchPosts(debouncedValue);

  // console.log("searchValue", searchValue);
  // console.log("debouncedValue", debouncedValue);
  // console.log("searchedPosts in explore");
  // console.log(searchedPosts);

  // data 是 InfiniteData<Models.DocumentList<PostDoc>, string | undefined>
  const pages = data?.pages ?? [];

  // 在inView, searchValue狀態更改時，才觸發
  useEffect(() => {
    if (inView && !searchValue) fetchNextPage();
  }, [inView, searchValue]);

  if (!pages || isPending) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const hasSearchText = searchValue.trim() !== "";
  const hasAnyPosts = !hasSearchText && pages;

  // const shouldShowSearchResults = searchValue.trim() !== ""; // 查詢值有輸入內容(不是"")時，需要顯示查詢結果 true(有searchValue)--> show,  false(沒有searchValue)-->do not show

  // const hasAnyPosts =
  //   !hasSearchText && posts.pages.every((item) => item.documents.length === 0); // !shouldShowSearchResults表示沒有查詢到結果

  // const shouldShowPosts =
  //   !shouldShowSearchResults &&
  //   posts.pages.every((item) => item.documents.length > 0); // !shouldShowSearchResults表示沒有查詢到結果

  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">Search Posts</h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img
            src="/assets/icons/search.svg"
            width={24}
            height={24}
            alt="search"
          />
          <Input
            type="text"
            placeholder="Search"
            className="explore-search"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold">Popular Today</h3>
        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
          <p className="small-medium md:base-medium text-light-2">All</p>
          <img
            src="/assets/icons/filter.svg"
            width={20}
            height={20}
            alt="filter"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {/* hasSearchText為true，表示有查詢到結果，顯示查詢結果 */}
        {hasSearchText ? (
          <SearchResults
            isSearchFetching={isSearchFetching || isSearchLoading}
            searchedPosts={searchedPosts}
          />
        ) : !hasAnyPosts ? (
          <p>End of posts / No posts yet</p>
        ) : (
          // posts.pages.map((item: any, index: any) => (
          //   <GridPostList key={`page-${index}`} posts={item.documents} />
          // ))
          pages.map((page: any, index: any) => (
            <GridPostList key={`page-${index}`} posts={page.documents} />
          ))
        )}
      </div>
      {hasNextPage && !searchValue && (
        // 一旦ref={ref}進到滑動視窗，表示已達頁面底部，必須觸發載入新的內容
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Explore;
