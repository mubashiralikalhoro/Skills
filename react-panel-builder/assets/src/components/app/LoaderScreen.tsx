import React from "react";
import LoaderIcon from "../global/LoaderIcon";
import Logo from "../global/Logo";

const LoaderScreen = () => {
  return (
    <div className="flex flex-col gap-5 items-center justify-center h-screen p-5">
      <Logo className="text-2xl" />
      <LoaderIcon className="text-3xl text-gray-900" />
    </div>
  );
};

export default LoaderScreen;
