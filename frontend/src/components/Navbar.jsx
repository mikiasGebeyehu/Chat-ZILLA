import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X, User, MessageSquare, Lock, Mail, LogOut } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { authUser, logout } = useAuthStore();

  const navLinks = [
    { name: "Home", path: "/", icon: <MessageSquare className="size-5" /> },
    { name: "Events", path: "/events", icon: <User className="size-5" /> },
    { name: "Contact", path: "/contact", icon: <Mail className="size-5" /> },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="navbar bg-base-100 px-6 py-4 shadow-lg sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="font-bold text-2xl tracking-wider cursor-pointer flex items-center gap-2 text-primary"
        >
          <MessageSquare /> CHAT-ZILLA
        </motion.div>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-8 font-medium items-center text-base-content">
          {navLinks.map((link) => (
            <motion.li
              key={link.name}
              whileHover={{ scale: 1.1, color: "#FFD700" }}
              transition={{ type: "spring", stiffness: 150 }}
              className="cursor-pointer flex items-center gap-1"
            >
              {link.icon} <Link to={link.path}>{link.name}</Link>
            </motion.li>
          ))}

          {/* Conditional: Show username dropdown if logged in, else Sign Up */}
          {authUser ? (
            <div className="relative">
              <motion.button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-Secondary"
              >
                <User className="size-5" /> {authUser.username}
              </motion.button>

              {dropdownOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-40 bg-base-100 text-base-content rounded-xl shadow-lg flex flex-col py-2"
                >
                  <Link to="/profile">
                    <li className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center gap-2">
                      <User className="size-4" /> Profile
                    </li>
                  </Link>
                  <Link to="/settings">
                    <li className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center gap-2">
                      <Lock className="size-4" /> Settings
                    </li>
                  </Link>
                  <li
                    onClick={() => logout()}
                    className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="size-4" /> Logout
                  </li>
                </motion.ul>
              )}
            </div>
          ) : (
            <motion.li
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-secondary cursor-pointer"
            >
              <Link to="/signup">
                <User className="inline size-5" /> Sign Up
              </Link>
            </motion.li>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden text-base-content">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.ul
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="md:hidden mt-4 space-y-4 font-medium flex flex-col items-center text-base-content"
        >
          {navLinks.map((link) => (
            <motion.li
              key={link.name}
              whileHover={{ scale: 1.05, color: "#FFD700" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1"
            >
              {link.icon}{" "}
              <Link to={link.path} onClick={() => setIsOpen(false)}>
                {link.name}
              </Link>
            </motion.li>
          ))}

          {authUser ? (
            <div className="relative">
              <motion.button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
              >
                <User className="size-5" /> {authUser.username}
              </motion.button>

              {dropdownOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-40 bg-base-100 text-base-content rounded-xl shadow-lg flex flex-col py-2"
                >
                  <Link to="/profile">
                    <li className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center gap-2">
                      <User className="size-4" /> Profile
                    </li>
                  </Link>
                  <Link to="/settings">
                    <li className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center gap-2">
                      <Lock className="size-4" /> Settings
                    </li>
                  </Link>
                  <li
                    onClick={() => logout()}
                    className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="size-4" /> Logout
                  </li>
                </motion.ul>
              )}
            </div>
          ) : (
            <Link to="/signup">
              <li className="btn btn-secondary cursor-pointer">
                <User className="inline size-5" /> Sign Up
              </li>
            </Link>
          )}
        </motion.ul>
      )}
    </motion.nav>
  );
};

export default Navbar;
