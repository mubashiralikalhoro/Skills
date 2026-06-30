import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import FormBuilder, { FormikSubmitOptions } from "../../components/global/form-builder/FormBuilder";
import * as Yup from "yup";
import { useUserContext } from "../../context/user-context";
import ProfileDisplay from "../../components/profile/ProfileDisplay";
import EditProfileForm from "../../components/profile/EditProfileForm";
import notify from "../../utils/notify";
import LoaderIcon from "../../components/global/LoaderIcon";

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const { user, setUser } = useUserContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const handleProfileSubmit = async (values: any) => {
    if (!user) return;

    setIsLoading(true);
    const updatedUser = false;
    setIsLoading(false);

    if (updatedUser) {
      notify.success("Profile updated successfully");
      setIsEditing(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (values: any, options: FormikSubmitOptions) => {
    setPasswordLoading(true);

    const updatedUser = false;
    setPasswordLoading(false);

    if (updatedUser) {
      options.resetForm();
      notify.success("Password updated successfully");
    }
  };

  // If the user is not logged in or the context is still loading
  if (!user) {
    return (
      <div className="w-full mx-auto p-8 bg-white rounded-lg shadow">
        <p className="text-center text-gray-600">Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex flex-wrap -mb-px">
          <button
            className={`mr-2 py-2 px-4 font-medium text-sm inline-flex items-center ${
              activeTab === "profile"
                ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <FaUser className="mr-2" />
            Update Profile
          </button>
          <button
            className={`mr-2 py-2 px-4 font-medium text-sm inline-flex items-center ${
              activeTab === "password"
                ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("password")}
          >
            <FaLock className="mr-2" />
            Change Password
          </button>
        </div>
      </div>

      {/* Profile Tab Content */}
      {activeTab === "profile" && (
        <>
          {isEditing ? (
            <EditProfileForm
              user={user}
              onSubmit={handleProfileSubmit}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <ProfileDisplay user={user} onEditClick={() => setIsEditing(true)} />
          )}
        </>
      )}

      {/* Password Tab Content */}
      {activeTab === "password" && (
        <div className="bg-white rounded-lg overflow-hidden border border-zinc-200">
          <div className="p-6">
            <h3 className="font-medium text-gray-700 pb-2 border-b border-gray-200 mb-4">Change Password</h3>

            <div className="max-w-lg">
              <FormBuilder
                className="gap-4"
                value={{
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                }}
                validationSchema={Yup.object().shape({
                  currentPassword: Yup.string().required("*Required"),
                  newPassword: Yup.string()
                    .min(8, "Password must be at least 8 characters")
                    .required("*Required"),
                  confirmPassword: Yup.string()
                    .oneOf([Yup.ref("newPassword")], "Passwords must match")
                    .required("*Required"),
                })}
                onSubmit={handlePasswordChange as any}
                SubmitButton={({ isValid, handleSubmit }) => (
                  <div className="flex mt-4">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!isValid || passwordLoading}
                      className="px-6 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium cursor-pointer disabled:opacity-70"
                    >
                      {passwordLoading ? <LoaderIcon /> : "Update Password"}
                    </button>
                  </div>
                )}
                design={[
                  {
                    fieldName: "currentPassword",
                    inputType: "password",
                    label: "Current Password",
                    placeholder: "Enter your current password",
                    className: "w-full",
                  },
                  {
                    fieldName: "newPassword",
                    inputType: "password",
                    label: "New Password",
                    placeholder: "Enter new password",
                    className: "w-full",
                  },
                  {
                    fieldName: "confirmPassword",
                    inputType: "password",
                    label: "Confirm New Password",
                    placeholder: "Confirm new password",
                    className: "w-full",
                  },
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
