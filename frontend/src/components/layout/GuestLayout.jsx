import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export default function GuestLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar variant="guest" />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
