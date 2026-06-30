import React from "react";
import { Outlet } from "react-router";
import { CODE_VERSION, env } from "../../constants";
import Logo from "../global/Logo";

const AuthLayout = () => {
  return (
    <div className="bg-white flex justify-center flex-1 min-h-screen">
      <div className="flex-1 bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/60 text-center hidden lg:flex items-center justify-center p-10">
        <Logo variant="light" className="text-4xl" />
      </div>

      <div className="lg:w-1/2 p-6 sm:p-12 flex flex-col justify-center items-center w-full relative">
        <div className="absolute right-0 bottom-0 text-xs text-gray-500 opacity-0">
          {CODE_VERSION}-{env.VITE_NODE_ENV}
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
