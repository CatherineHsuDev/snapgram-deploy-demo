// allow to drop somethin in --> npm i react-dropzone
import React, { useCallback, useState } from "react";
import { type FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "../ui/button";

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl?: string;
};

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
  // 因為可以上傳多張照片-->使用empty array
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState(mediaUrl);
  // 預設初始fileUrl使用mediaUrl的資料
  // 在create post階段mediaUrl沒有資料，所以只有上傳圖示
  // 在edit post階段mediaUrl會使用post.imageUrl取得圖片再呈現在畫面

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      // Do something with the files

      setFile(acceptedFiles);
      fieldChange(acceptedFiles);
      setFileUrl(URL.createObjectURL(acceptedFiles[0]));
    },
    [file]
  );
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".svg"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer"
    >
      <input {...getInputProps()} className="cursor-pointer" />
      {fileUrl ? (
        <>
          <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
            <img src={fileUrl} alt="image" className="file_uploader-img" />
          </div>
          <p className="file_uploader-label">Click or drag photo to replace</p>
        </>
      ) : (
        <div className="file_uploader-box ">
          <img
            src="/assets/icons/file-upload.svg"
            width={96}
            height={77}
            alt="file upload"
          />

          <h3 className="base-medium text-light-2 mb-2 mt-6">
            Drag photo here
          </h3>
          <p className="text-light-4 small-regular mb-6">SVG, PNG, JPG</p>

          <Button type="button" className="shad-button_dark_4">
            Select from computer
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
