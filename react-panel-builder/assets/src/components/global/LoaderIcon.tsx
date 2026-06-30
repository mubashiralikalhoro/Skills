import { cn } from "../../utils";
import { FaSpinner } from "react-icons/fa";
import React from "react";

const LoaderIcon = ({ className }: { className?: string }) => {
  return <FaSpinner className={cn("animate-spin text-2xl", className)} />;
};

export default LoaderIcon;
