import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";

export default function ProtectedLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar onMenuClick={() => setOpen(true)} />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 p-5 sm:p-8 lg:p-10"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
