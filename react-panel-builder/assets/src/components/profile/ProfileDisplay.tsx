import React from "react";
import { User } from "../../types";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaGlobe,
  FaBuilding,
  FaPencilAlt,
} from "react-icons/fa";
import { useAppContext } from "../../context/app-context";
interface ProfileDisplayProps {
  user: User;
  onEditClick: () => void;
}

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ user, onEditClick }) => {
  // Format date of birth
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not provided";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  const { appData } = useAppContext();

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-zinc-200">
      <div className="p-6">
        {/* Profile Header */}
        <div className="flex justify-between mb-6">
          <div className="flex items-center">
            <div className="h-24 w-24 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] text-3xl font-semibold mr-6">
              {user?.profileUrl ? (
                <img
                  src={user?.profileUrl}
                  alt={`${user.fullname}`}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                `${user.fullname.charAt(0)}${user.fullname.charAt(0)}`
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{`${user.fullname}`}</h2>
              <p className="text-gray-600">{user.email}</p>
              {/* {user.Company && <p className="text-gray-500 text-sm">{user.Company}</p>} */}
            </div>
          </div>

          <button
            onClick={onEditClick}
            className="h-10 w-10 flex items-center justify-center bg-[var(--primary-light)] text-[var(--primary)] rounded-full hover:bg-[var(--primary)] hover:text-white transition-colors"
            title="Edit Profile"
          >
            <FaPencilAlt size={16} />
          </button>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700 pb-2 border-b border-gray-200">Personal Information</h3>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                <div className="flex items-center ">
                  <FaUser className="mr-2 text-gray-500" />
                  Full Name
                </div>
              </label>
              <p className=" text-gray-800  font-semibold">{`${user.fullname}`}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-gray-500" />
                  Date of Birth
                </div>
              </label>
              <p className="text-gray-800 font-semibold">{formatDate(user.fullname)}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">
                <div className="flex items-center">
                  <FaIdCard className="mr-2 text-gray-500" />
                  User Type
                </div>
              </label>
              <p className="text-gray-800 font-semibold">{user.fullname}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700 pb-2 border-b border-gray-200">Contact Information</h3>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                <div className="flex items-center">
                  <FaEnvelope className="mr-2 text-gray-500" />
                  Email Address
                </div>
              </label>
              <p className="text-gray-800 font-semibold">{user.email}</p>
            </div>

            {/* <div>
              <label className="block text-xs font-medium text-gray-700">
                <div className="flex items-center">
                  <FaPhone className="mr-2 text-gray-500" />
                  Phone Number
                </div>
              </label>
              <p className="text-gray-800 font-semibold">{user.PhoneNo || "Not provided"}</p>
            </div> */}

            {/* <div>
              <label className="block text-xs font-medium text-gray-700">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-gray-500" />
                  Address
                </div>
              </label>
              <p className="text-gray-800 font-semibold">{user.Address || "Not provided"}</p>
            </div> */}
          </div>
        </div>

        {/* Additional Information */}
        {/* <div className="mt-6">
          <h3 className="font-medium text-gray-700 pb-2 border-b border-gray-200 mb-4">
            Additional Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                <div className="flex items-center">
                  <FaBuilding className="mr-2 text-gray-500" />
                  Company
                </div>
              </label>
              <p className="text-gray-800 font-semibold">{user.Company || "Not provided"}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                <div className="flex items-center">
                  <FaGlobe className="mr-2 text-gray-500" />
                  Website
                </div>
              </label>
              <p className="text-gray-800 font-semibold">
                {user.Website ? (
                  <a
                    href={user.Website.startsWith("http") ? user.Website : `https://${user.Website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] hover:underline font-semibold"
                  >
                    {user.Website}
                  </a>
                ) : (
                  "Not provided"
                )}
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ProfileDisplay;
