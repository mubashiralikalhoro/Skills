import React, { useState } from "react";
import { Link } from "react-router";
import { FaSearch, FaPlus, FaEye, FaEdit, FaTimes } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";
import DynamicTable from "../../components/global/DynamicTable";
import CenterModal from "../../components/global/CenterModal";
import { formatDate } from "../../utils";

// Mock data for users
const mockUsers = [
  {
    UserID: "U001",
    FirstName: "John",
    LastName: "Doe",
    Email: "john.doe@example.com",
    PhoneNo: "+1 (555) 123-4567",
    DOB: "1990-05-15",
    GenderID: 1,
    StatusID: 1,
    Address: "123 Main St, New York, NY 10001",
    RegistrationDate: "2023-01-15",
    LastLogin: "2024-01-10",
  },
  {
    UserID: "U002",
    FirstName: "Jane",
    LastName: "Smith",
    Email: "jane.smith@example.com",
    PhoneNo: "+1 (555) 234-5678",
    DOB: "1988-12-03",
    GenderID: 2,
    StatusID: 1,
    Address: "456 Oak Ave, Los Angeles, CA 90210",
    RegistrationDate: "2023-02-20",
    LastLogin: "2024-01-12",
  },
  {
    UserID: "U003",
    FirstName: "Mike",
    LastName: "Johnson",
    Email: "mike.johnson@example.com",
    PhoneNo: "+1 (555) 345-6789",
    DOB: "1992-08-22",
    GenderID: 1,
    StatusID: 2,
    Address: "789 Pine Rd, Chicago, IL 60601",
    RegistrationDate: "2023-03-10",
    LastLogin: "2024-01-08",
  },
  {
    UserID: "U004",
    FirstName: "Sarah",
    LastName: "Wilson",
    Email: "sarah.wilson@example.com",
    PhoneNo: "+1 (555) 456-7890",
    DOB: "1995-11-18",
    GenderID: 2,
    StatusID: 1,
    Address: "321 Elm St, Houston, TX 77001",
    RegistrationDate: "2023-04-05",
    LastLogin: "2024-01-14",
  },
  {
    UserID: "U005",
    FirstName: "David",
    LastName: "Brown",
    Email: "david.brown@example.com",
    PhoneNo: "+1 (555) 567-8901",
    DOB: "1987-03-25",
    GenderID: 1,
    StatusID: 3,
    Address: "654 Maple Dr, Phoenix, AZ 85001",
    RegistrationDate: "2023-05-12",
    LastLogin: "2024-01-05",
  },
];

// Mock status data
const userStatuses = [
  { StatusID: 1, StatusName: "Active" },
  { StatusID: 2, StatusName: "Inactive" },
  { StatusID: 3, StatusName: "Suspended" },
];

const UsersPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter users based on search
  const filteredUsers = mockUsers.filter(
    (user) =>
      user.FirstName.toLowerCase().includes(search.toLowerCase()) ||
      user.LastName.toLowerCase().includes(search.toLowerCase()) ||
      user.Email.toLowerCase().includes(search.toLowerCase()) ||
      user.UserID.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const showGender = (genderId: number) => {
    return genderId === 1 ? "Male" : "Female";
  };

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      case 3:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const tableStructure = [
    {
      heading: "User ID",
      sortField: "userid",
      loadItem: (user: any) => <span className="text-sm font-medium text-gray-900">{user.UserID}</span>,
    },
    {
      sortField: "name",
      heading: "Name",
      loadItem: (user: any) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 aspect-square rounded-full bg-[var(--primary)]/15 flex items-center justify-center">
            <FaUser className="text-[var(--primary)]" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.FirstName} {user.LastName}
            </div>
            <div className="text-xs text-gray-500">Member since {formatDate(user.RegistrationDate)}</div>
          </div>
        </div>
      ),
    },
    {
      heading: "Age/Gender",
      loadItem: (user: any) => (
        <span className="text-sm text-gray-500">
          {calculateAge(user.DOB)} yrs / {showGender(user.GenderID)}
        </span>
      ),
    },
    {
      heading: "Contact",
      loadItem: (user: any) => (
        <div className="text-sm text-gray-500">
          {!!user?.PhoneNo && <div>{user.PhoneNo}</div>}
          <div className="truncate max-w-[200px]">{user.Email}</div>
        </div>
      ),
    },
    {
      heading: "Status",
      loadItem: (user: any) => (
        <span
          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
            user.StatusID
          )}`}
        >
          {userStatuses.find((status) => status.StatusID === user.StatusID)?.StatusName || "N/A"}
        </span>
      ),
    },
    {
      heading: "Last Login",
      loadItem: (user: any) => <span className="text-sm text-gray-500">{formatDate(user.LastLogin)}</span>,
    },
    {
      heading: "Actions",
      loadItem: (user: any) => (
        <div className="flex space-x-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleViewUser(user);
            }}
            className="text-[var(--primary)] hover:text-[var(--primary-dark)]"
          >
            <FaEye className="inline-block" title="View User" />
          </button>
          <Link
            to={`/listing/${user.UserID}`}
            className="text-[var(--primary)] hover:text-[var(--primary-dark)]"
          >
            <FaEdit className="inline-block" title="Edit User" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full mx-auto">
      {/* Header with search and filters */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-1/2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] block w-full pl-10 p-2.5"
              placeholder="Search users by name, ID, or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full md:w-auto">
          <Link
            to="/listing/create"
            className="bg-[var(--primary)] text-white py-2.5 px-4 rounded-lg flex items-center gap-2 whitespace-nowrap"
          >
            <FaPlus /> Add User
          </Link>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg overflow-hidden border border-zinc-200">
        <div className="overflow-x-auto">
          <DynamicTable
            data={currentUsers}
            tableStructure={tableStructure}
            thClassName="px-6 py-3"
            tdClassName="px-6 py-4"
            tableClassName="min-w-full divide-y divide-gray-200"
          />
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of{" "}
            {filteredUsers.length} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* User View Modal */}
      <CenterModal isOpen={isModalOpen} setOpen={setIsModalOpen}>
        {selectedUser && (
          <div className="bg-white rounded-lg shadow-xl w-[90vw] md:w-[60vw] max-w-3xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b border-zinc-200 rounded-t-lg">
              <h2 className="text-xl font-semibold text-gray-800">User Information</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* User Header */}
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 rounded-full bg-[var(--primary)]/15 flex items-center justify-center">
                  <FaUser size={28} className="text-[var(--primary)]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold">
                    {selectedUser.FirstName} {selectedUser.LastName}
                  </h3>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500 mr-3">ID: {selectedUser.UserID}</span>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        selectedUser.StatusID
                      )}`}
                    >
                      {userStatuses.find((status) => status.StatusID === selectedUser.StatusID)?.StatusName ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 pb-2">Basic Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Birth Date:</span> {formatDate(selectedUser.DOB)} (
                        {calculateAge(selectedUser.DOB)} years)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Gender:</span> {showGender(selectedUser.GenderID)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Registration Date:</span>{" "}
                        {formatDate(selectedUser.RegistrationDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 pb-2">Contact Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Mobile:</span> {selectedUser.PhoneNo || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Email:</span> {selectedUser.Email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Address:</span> {selectedUser.Address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 pb-2">Account Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Last Login:</span> {formatDate(selectedUser.LastLogin)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Account Status:</span>{" "}
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          selectedUser.StatusID
                        )}`}
                      >
                        {userStatuses.find((status) => status.StatusID === selectedUser.StatusID)
                          ?.StatusName || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-zinc-200 rounded-b-lg">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <Link
                to={`/listing/${selectedUser.UserID}`}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-medium hover:bg-[var(--primary)]/50"
              >
                Edit
              </Link>
            </div>
          </div>
        )}
      </CenterModal>
    </div>
  );
};

export default UsersPage;
