import { Routes, Route } from "react-router-dom";
import SigninForm from "./_auth/forms/SigninForm";
import {
  Home,
  AllUsers,
  CreatePost,
  EditPost,
  PostDetails,
  Profile,
  UpdateProfile,
  Explore,
  Saved,
} from "./_root/pages";
import SignupForm from "./_auth/forms/SignupForm";
import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";

import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <main className="flex h-screen">
      <Routes>
        {/* public route */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SigninForm />}></Route>
          <Route path="/sign-up" element={<SignupForm />}></Route>
        </Route>
        {/* private route */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/update-post/:id" element={<EditPost />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          {/* :id/* "*"表示所有profile後面寫的都指向這個id的profile */}
          <Route path="/profile/:id/*" element={<Profile />} />
          <Route path="/update-profile/:id" element={<UpdateProfile />} />
        </Route>
      </Routes>
      <Toaster />
    </main>
  );
}

export default App;
