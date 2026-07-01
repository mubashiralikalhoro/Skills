import React from "react";
import { TbError404 } from "react-icons/tb";
import { Link } from "react-router";

const Page404 = () => {
  return (
    <div className="w-screen h-[100dvh] flex items-center justify-center flex-col">
      <TbError404 className="text-7xl" />
      <h1 className="text-2xl font-bold">Page Not Found</h1>
      <p>
        Go to{" "}
        <Link to={"/"} className="text-[var(--primary)] hover:underline">
          Home
        </Link>
      </p>
    </div>
  );
};

export default Page404;
