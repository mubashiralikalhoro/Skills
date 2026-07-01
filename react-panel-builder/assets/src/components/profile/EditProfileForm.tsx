import React, { useState } from "react";
import FormBuilder from "../global/form-builder/FormBuilder";
import * as Yup from "yup";
import { User } from "../../types";
import { FaSave } from "react-icons/fa";

interface EditProfileFormProps {
  user: User;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ user, onSubmit, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial form values derived from user object
  const initialValues = {
    fullname: user.fullname || "",
    email: user.email || "",
  };

  // Validation schema
  const validationSchema = Yup.object().shape({
    fullname: Yup.string().required("*Required"),
    email: Yup.string().email("Invalid email address").required("*Required"),
  });

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const apiPayload: any = {
        fullname: values.fullname,
        email: values.email,
      };

      await onSubmit(apiPayload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="font-medium text-gray-700 pb-2 border-b border-gray-200 mb-4">
        Edit Profile Information
      </h3>

      <FormBuilder
        className="grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
        value={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        SubmitButton={({ isValid, handleSubmit }) => (
          <div className="col-span-1 md:col-span-2 mt-4 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm font-medium disabled:opacity-70"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium flex items-center disabled:opacity-70"
            >
              <FaSave className="mr-2" /> {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
        design={[
          {
            fieldName: "fullName",
            inputType: "text",
            label: "Full Name",
            placeholder: "Enter your full name",
            className: "w-full",
          },
          {
            fieldName: "email",
            inputType: "text",
            label: "Email",
            placeholder: "Enter your email",
            className: "w-full",
          },
        ]}
      />
    </div>
  );
};

export default EditProfileForm;
