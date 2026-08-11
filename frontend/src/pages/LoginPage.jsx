import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Orbit, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      toast.success("Welcome back.");
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Left: brand panel */}
      <div className="relative hidden flex-col justify-between bg-ink-950 p-12 text-slate-300 md:flex">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-teal-500/15 p-2 text-teal-400">
            <Orbit size={20} />
          </span>
          <span className="text-lg font-semibold text-white">Orbit CRM</span>
        </div>

        <div>
          <p className="font-data text-xs uppercase tracking-widest text-teal-400">
            Ledger 01 · Pipeline
          </p>
          <h1 className="mt-3 max-w-md text-3xl font-semibold leading-snug text-white">
            Every lead, quotation and follow-up, entered once and never lost.
          </h1>
          <p className="mt-4 max-w-sm text-sm text-slate-400">
            Track Leads, Customers, Distributors and OEMs from first contact to signed quotation —
            with reminders that keep you following up on time.
          </p>
        </div>

        <p className="font-data text-xs text-slate-600">© {new Date().getFullYear()} Orbit CRM</p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center bg-canvas p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden flex items-center gap-2">
            <span className="rounded-lg bg-teal-50 p-2 text-teal-600">
              <Orbit size={20} />
            </span>
            <span className="text-lg font-semibold text-ink-900">Orbit CRM</span>
          </div>

          <h2 className="text-xl font-semibold text-ink-900">Sign in to your workspace</h2>
          <p className="mt-1 text-sm text-slate-500">Enter your credentials to continue.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-800">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  {...register("email", { required: "Email is required" })}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="you@company.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-800">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  autoComplete="current-password"
                  {...register("password", { required: "Password is required" })}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            First time setting up? The first account created via{" "}
            <span className="font-data text-slate-500">/register-first-admin</span> becomes the
            workspace admin. Ask your admin for an invite otherwise.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
