import React from "react";
import { Link } from "react-router";
import LoaderIcon from "./LoaderIcon";
import { cn } from "../../utils";

interface FormButtonsProps {
  isValid: boolean;
  isLoading: boolean;
  handleSubmit: () => void;
  handleCancel: () => void;
  createButtonText?: string;
  cancelButtonText?: string;
  className?: string;
}

const FormButtons = ({
  isValid,
  isLoading,
  handleSubmit,
  handleCancel,
  createButtonText = "Create",
  cancelButtonText = "Cancel",
  className,
}: FormButtonsProps) => {
  return (
    <div className={cn("flex justify-end gap-4 pt-6 border-t border-gray-200", className)}>
      <button
        onClick={handleCancel}
        className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        {cancelButtonText}
      </button>
      <button
        disabled={!isValid || isLoading}
        onClick={handleSubmit}
        className="px-6 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:bg-[var(--primary)]/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <LoaderIcon />
          </>
        ) : (
          createButtonText
        )}
      </button>
    </div>
  );
};

export default FormButtons;
