import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import FileUploader from "../shared/FileUploader";
import { PostValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  useCreatePost,
  useUpdatePost,
} from "@/lib/react-query/queriesAndMutations";
import type { PostDoc } from "@/types";

// post?用來表示可能有存在也可能不存在
// Models來自appwrite
// type PostFormProps = {
//   post?: Models.Document;
// };
// type PostRecord = {
//   imageUrl?: string;
//   caption?: string;
//   location?: string;
//   tags?: string[];
//   imageId?: string;
// };

// export type PostDoc = Models.Document & PostRecord;

type PostFormProps = {
  post?: PostDoc;
  action: "Create" | "Update";
};

// 如果有updating post 才會有{ post }
const PostForm = ({ post, action }: PostFormProps) => {
  const { mutateAsync: createPost, isPending: isLoadingCreate } =
    useCreatePost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } =
    useUpdatePost();
  const { user } = useUserContext();
  const navigate = useNavigate();

  // 1. Define your form.
  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      // if post exists, 選用post?.caption(?.表示可能沒有或正在輸入中)
      caption: post ? post.caption : "",
      file: [],
      location: post ? post?.location : "",
      // tags: (post?.tags ?? []).join(","),
      tags: post?.tags?.join(",") ?? "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof PostValidation>) {
    // console.log({ ...values });
    const tagsArray = (values.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean); // "art, gallery" -> ["art","gallery"]
    // console.log(tagsArray);

    if (post && action === "Update") {
      const updatedPost = await updatePost({
        ...values,
        postId: post.$id,
        imageId: post?.imageId,
        imageUrl: post?.imageUrl,
        tags: tagsArray,
      });

      if (!updatedPost) {
        return toast.error("Please try again.");
      }
      return navigate(`/posts/${post.$id}`);
    }
    // ...values 指的是spread所有post裡含有的值

    const newPost = await createPost({
      ...values,
      tags: tagsArray,
      userId: user.id,
    });

    if (!newPost) {
      return toast.error("Please try again.");
    }

    navigate("/");
  }

  // console.log(post?.imageUrl);

  // 用來檢查FileUploader中的{post?.imageUrl}為甚麼當時沒有圖片
  // <FileUploader fieldChange={field.onChange} mediaUrl={post?.imageUrl} />;
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-9 w-full  max-w-5xl"
      >
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Caption</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  {...field}
                />
              </FormControl>

              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Photos</FormLabel>
              <FormControl>
                <FileUploader
                  // field來自render={({ field })
                  // post來自const PostForm = ({ post })
                  // 如果 post 是 null 或 undefined → 整個表達式直接回傳 undefined
                  // （不會拋出「Cannot read properties of undefined」的錯）。
                  // 如果 post 不是 null/undefined → 回傳 post.imageUrl 的值
                  fieldChange={field.onChange}
                  mediaUrl={post?.imageUrl}
                />
              </FormControl>

              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Location</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>

              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Add Tags (separated by comma " , ")
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="shad-input"
                  placeholder="Art, Expression, Learn"
                  {...field}
                />
              </FormControl>

              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <div className="flex gap-4 items-center justify-end">
          <Button type="button" className="shad-button_dark_4">
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}
            // 在loading的時候不讓多次觸發避免多次寫入db
          >
            {isLoadingCreate || (isLoadingUpdate && "Loading...")}
            {action} Post
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
