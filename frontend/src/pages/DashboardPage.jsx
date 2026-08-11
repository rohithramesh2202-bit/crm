import { useEffect, useState } from "react";
import { Users, Building2, Truck, Factory, Wallet, CalendarClock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";
import { format } from "date-fns";

const STATUS_COLORS = {
  new: "#94A3B8",
  contacted: "#60A5FA",
  qualified: "#0F8B8D",
  negotiation: "#E8A33D",
  won: "#34D399",
  lost: "#F87171",
};

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then(({ data }) => setSummary(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  const leadsPie = (summary?.leadsByStatus || []).map((s) => ({
    name: s._id,
    value: s.count,
  }));

  const quotationBars = (summary?.quotationsByStatus || []).map((s) => ({
    status: s._id,
    count: s.count,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        subtitle="Your pipeline, quotations and follow-ups at a glance."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Leads" value={summary?.totals.totalLeads ?? 0} icon={Users} accent="teal" />
        <StatCard label="Customers" value={summary?.totals.totalCustomers ?? 0} icon={Building2} accent="slate" />
        <StatCard label="Distributors" value={summary?.totals.totalDistributors ?? 0} icon={Truck} accent="slate" />
        <StatCard label="OEMs" value={summary?.totals.totalOEMs ?? 0} icon={Factory} accent="slate" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Pipeline Value (Sent + Accepted Quotations)"
          value={`₹ ${Number(summary?.pipelineValue || 0).toLocaleString("en-IN")}`}
          icon={Wallet}
          accent="amber"
        />
        <StatCard
          label="Follow-ups Due Today / Overdue"
          value={summary?.dueFollowUps ?? 0}
          icon={CalendarClock}
          accent="red"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <p className="mb-4 text-sm font-medium text-ink-800">Leads by Status</p>
          {leadsPie.length === 0 ? (
            <EmptyState message="No leads yet." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={leadsPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {leadsPie.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || "#94A3B8"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <p className="mb-4 text-sm font-medium text-ink-800">Quotations by Status</p>
          {quotationBars.length === 0 ? (
            <EmptyState message="No quotations yet." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={quotationBars}>
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0F8B8D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <p className="mb-4 text-sm font-medium text-ink-800">Recent Leads</p>
        {summary?.recentLeads?.length ? (
          <ul className="divide-y divide-slate-50">
            {summary.recentLeads.map((lead) => (
              <li key={lead._id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-ink-800">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.company}</p>
                </div>
                <p className="font-data text-xs text-slate-400">
                  {format(new Date(lead.createdAt), "dd MMM yyyy")}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No leads yet — add your first one from the Leads page." />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
