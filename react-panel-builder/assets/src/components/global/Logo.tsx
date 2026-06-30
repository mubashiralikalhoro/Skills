import React from "react";
import { APP_NAME } from "../../constants";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
}

const Logo: React.FC<LogoProps> = ({ className = "", variant = "dark" }) => {
  return (
    <span
      className={`font-bold tracking-tight text-xl ${
        variant === "light" ? "text-white" : "text-gray-900"
      } ${className}`}
    >
      {APP_NAME}
    </span>
  );
};

export default Logo;
