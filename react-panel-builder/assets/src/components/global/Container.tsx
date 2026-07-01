import React from "react";
import { cn } from "../../utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const Container = ({ children, className }: Props) => {
  return <div className={cn("max-w-7xl mx-auto", className)}>{children}</div>;
};

export default Container;
