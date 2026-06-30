import React, { useRef, useState } from "react";
import { CropperRef, Cropper } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import CenterModal from "../../CenterModal";
import { IoCheckmark, IoClose } from "react-icons/io5";
import useWindowSize from "../../../../hooks/useWindowSize";

// local

type Props = {
  value: string;
  aspectRatio: number;
  notifyError?: (errorString: string) => void;
  height?: number;
  width?: number;
  onChange: (base64: string | null) => void;
  error?: string;
  placeHolder?: string;
  name?: string;
};

const ImageCropInput = ({
  height,
  width,
  onChange,
  value,
  error,
  aspectRatio = 4 / 3,
  placeHolder,
  name,
}: Props) => {
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const cropperRef = useRef<CropperRef>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropperImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCrop = () => {
    if (!cropperRef.current) {
      return;
    }

    const croppedImage = cropperRef.current.getCanvas()?.toDataURL("image/jpeg");
    if (croppedImage) {
      onChange(croppedImage as any);
      setCropperImage(null);
    }
  };

  const size = useWindowSize();

  const viewWidth = Math.min(size.width - size.width * 0.2, 1024);
  const viewHeight = Math.min(viewWidth, Math.min(size.height - size.height * 0.2, 768));

  return (
    <>
      <CenterModal
        isOpen={!!cropperImage}
        setOpen={() => {
          setCropperImage(null);
        }}
      >
        <div className="w-fit h-fit bg-white p-2  rounded-md">
          <div className="w-full h-full relative">
            <Cropper
              ref={cropperRef}
              style={{
                width: viewWidth,
                height: viewHeight,
              }}
              // @ts-ignore
              aspectRatio={aspectRatio}
              src={cropperImage}
              className={"cropper"}
            />
          </div>
          <div className="flex gap-2 mt-2 justify-end">
            <div
              className="p-2 px-4 bg-red-500 rounded w-fit text-white cursor-pointer"
              onClick={() => {
                setCropperImage(null);
              }}
            >
              <IoClose />
            </div>
            <div
              className="p-2 px-4 bg-green-500 rounded w-fit text-white cursor-pointer"
              onClick={handleCrop}
            >
              <IoCheckmark />
            </div>
          </div>
        </div>
      </CenterModal>
      <div className="w-full scrollbar-hide">
        <div className="flex flex-col items-center justify-center w-full h-40 rounded-lg bg-lightWhite text-black relative mt-2">
          {error && (
            <div className="text-sm text-red-500 absolute  -top-2 right-2 px-2 bg-white rounded-md border-[1px] border-red-500">
              {error}
            </div>
          )}

          {placeHolder && (
            <div className="text-[12px] text-sidebarColor absolute  -top-2 left-2 px-2 bg-white rounded-md border-[0.5px] border-slate-200">
              {placeHolder}
            </div>
          )}

          {value && (
            <div
              onClick={() => {
                setCropperImage(null);
                onChange(null);
              }}
              className="bg-red-500 cursor-pointer h-5 w-5 rounded-full flex items-center justify-center hover:bg-black absolute top-2 right-2 z-10"
            >
              <IoClose className="text-white cursor-pointer text-xs" />
            </div>
          )}

          <label htmlFor={`dropzone-file-${name}`} className="cursor-pointer">
            {value ? (
              <img src={value} className="flex-1 bg-inherit h-36   object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm ">
                  <span className="font-semibold">Click to upload</span>
                </p>
                <p className="text-xs ">PNG, JPG {width && height && `(Min. ${width}x${height}px)`}</p>
              </div>
            )}
          </label>

          <input
            id={`dropzone-file-${name}`}
            onChange={handleFileSelect}
            accept="image/*"
            type="file"
            className="hidden"
          />
        </div>
      </div>
    </>
  );
};

export default ImageCropInput;
