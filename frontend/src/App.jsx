import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import LeadsPage from "./pages/LeadsPage";
import CustomersPage from "./pages/CustomersPage";
import DistributorsPage from "./pages/DistributorsPage";
import OEMsPage from "./pages/OEMsPage";
import QuotationsPage from "./pages/QuotationsPage";
import FollowUpsPage from "./pages/FollowUpsPage";
import EmailLogPage from "./pages/EmailLogPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/distributors" element={<DistributorsPage />} />
        <Route path="/oems" element={<OEMsPage />} />
        <Route path="/quotations" element={<QuotationsPage />} />
        <Route path="/followups" element={<FollowUpsPage />} />
        <Route path="/emails" element={<EmailLogPage />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute roles={["admin"]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<DashboardPage />} />
    </Routes>
  );
}

export default App;
