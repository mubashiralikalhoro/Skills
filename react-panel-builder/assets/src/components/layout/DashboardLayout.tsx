import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaUserInjured,
  FaCalendarAlt,
  FaSignOutAlt,
  FaChevronRight,
  FaPhone,
  FaUser,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaList,
} from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import Logo from "../global/Logo";
import useWindowSize from "../../hooks/useWindowSize";
import { useUserContext } from "../../context/user-context";
interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { isMobile } = useWindowSize();
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarItems: SidebarItem[] = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaHome className="w-5 h-5" />,
    },
    {
      name: "Listing",
      path: "/listing",
      icon: <FaList className="w-5 h-5" />,
    },
  ];

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
      setIsCollapsed(false);
    }
  }, [location, isMobile]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileDropdownOpen(false);
        if (isMobile) setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  const { user, setUser } = useUserContext();

  const handleLogout = () => {
    setUser(null);
    navigate("/auth/login");
  };

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case "/dashboard":
        return "Dashboard";
      case "/listing":
        return "Listing";
      case "/listing/create":
        return "Create Listing";
      case "/listing/create":
        return "Create Listing";
      case "/profile":
        return "My Profile";
      default:
        return "Dashboard";
    }
  };

  const sidebarWidth = isCollapsed ? "w-20" : "w-64";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10 transition-all"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`bg-zinc-900 text-white fixed md:relative transition-all duration-300 h-full z-20
          ${isMobile ? (isSidebarOpen ? "left-0 w-64" : "-left-64 w-64") : `left-0 ${sidebarWidth}`}
        `}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          {!isCollapsed && (
            <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : ""}`}>
              <Logo variant="light" className="text-lg transition-all" />
            </div>
          )}
          {isMobile ? (
            <button onClick={toggleSidebar} className="p-1 rounded-full hover:bg-zinc-800">
              <FaTimes className="w-5 h-5 text-gray-300" />
            </button>
          ) : (
            <button
              onClick={toggleCollapse}
              className="p-1 rounded-full hover:bg-zinc-800 text-gray-300 mx-auto"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <FaAngleDoubleRight className="w-4 h-4 mx-auto" />
              ) : (
                <FaAngleDoubleLeft className="w-4 h-4 mx-auto" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="mt-5 px-2">
          <ul className="space-y-1">
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center py-3 px-3 rounded-lg transition-all
                    ${isCollapsed ? "justify-center" : ""}
                    ${
                      location.pathname === item.path
                        ? "bg-zinc-800 text-white"
                        : "hover:bg-zinc-800 text-gray-300"
                    }
                  `}
                  title={isCollapsed ? item.name : ""}
                >
                  <div className={`${isCollapsed ? "" : "mr-3"} text-lg`}>{item.icon}</div>
                  {!isCollapsed && (
                    <>
                      <span>{item.name}</span>
                      {location.pathname === item.path && (
                        <div className="ml-auto bg-gray-700 p-1 rounded">
                          <FaChevronRight className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 px-3">
            <div className={`border-t border-gray-700 pt-4 ${isCollapsed ? "text-center" : ""}`}>
              {!isCollapsed && <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Account</p>}
            </div>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/profile"
                  className={`flex items-center py-3 px-3 rounded-lg transition-all
                    ${isCollapsed ? "justify-center" : ""} 
                    ${
                      location.pathname === "/profile"
                        ? "bg-zinc-800 text-white"
                        : "hover:bg-zinc-800 text-gray-300"
                    }
                  `}
                  title={isCollapsed ? "My Profile" : ""}
                >
                  <div className={`${isCollapsed ? "" : "mr-3"} text-lg`}>
                    <FaUser className="w-5 h-5" />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span>My Profile</span>
                      {location.pathname === "/profile" && (
                        <div className="ml-auto bg-gray-700 p-1 rounded">
                          <FaChevronRight className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </>
                  )}
                </Link>
              </li>
              <li>
                <button
                  className={`cursor-pointer flex items-center py-3 px-3 w-full rounded-lg transition-all
                    ${isCollapsed ? "justify-center" : ""} hover:bg-red-900 text-red-400
                  `}
                  onClick={handleLogout}
                  title={isCollapsed ? "Logout" : ""}
                >
                  <div className={`${isCollapsed ? "" : "mr-3"} text-lg`}>
                    <FaSignOutAlt className="w-5 h-5" />
                  </div>
                  {!isCollapsed && <span>Logout</span>}
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 flex-1 flex flex-col`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 mr-2 rounded-full hover:bg-gray-100"
                  aria-label="Toggle sidebar"
                >
                  <FaBars className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
            </div>

            {/* User profile/avatar with dropdown */}
            <div className="relative">
              <button
                onClick={toggleProfileDropdown}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white">
                  <span className="text-sm font-medium text-indigo-700">
                    {`${user?.fullname?.charAt(0)}${user?.fullname?.charAt(0)}`}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">{`${user?.fullname}`}</span>
              </button>

              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={closeProfileDropdown}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg py-2 z-20 border border-gray-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                      }}
                    >
                      Profile
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 bg-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
