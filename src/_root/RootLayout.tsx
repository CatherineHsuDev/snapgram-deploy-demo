import Bottombar from "@/components/shared/Bottombar";
import LeftSideBar from "@/components/shared/LeftSideBar";
import Topbar from "@/components/shared/Topbar";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

const RootLayout = () => {
  const { isLoading, isAuthenticated } = useUserContext(); // ← 新增
  const location = useLocation();

  if (isLoading) return null; // ← 新增：驗證前不渲染（避免 Home 閃一下）
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />; // ← 新增
  }
  return (
    <div className="w-full md:flex">
      <Topbar />
      <LeftSideBar />

      <section className="flex flex-1 h-full">
        <Outlet />
      </section>

      <Bottombar />
    </div>
  );
};

export default RootLayout;
