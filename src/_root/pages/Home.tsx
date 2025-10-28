import Loader from "@/components/shared/Loader";
import { useGetRecentPosts } from "@/lib/react-query/queriesAndMutations";
import PostCard from "@/components/shared/PostCard";
import { useUserContext } from "@/context/AuthContext";

const Home = () => {
  // const isPostLoading = true;
  // const posts = null;
  // 上面兩行是測試isPostLoading && !posts能不能使用的測試性code
  console.log("進到home.tsx");
  console.log("即將進行useGetRecentPosts()");
  const { isAuthenticated, isLoading } = useUserContext(); // ← 新增
  if (isLoading || !isAuthenticated) return null; // ← 新增：驗證前/未登入不渲染
  const { data: posts, isPending: isPostLoading } = useGetRecentPosts();

  // console.log(useGetRecentPosts().data);

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>
          {/* if isPostLoading and no posts */}
          {isPostLoading && !posts ? (
            <Loader />
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full ">
              {posts?.documents.map((post) => (
                <li key={post.$id} className="flex justify-center w-full">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
