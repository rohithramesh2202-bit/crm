import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar user={user} />
      <div className="pl-60">
        <Topbar title="Workspace" />
        <main className="mx-auto max-w-6xl px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
