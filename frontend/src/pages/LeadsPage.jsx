import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, ArrowRightCircle } from "lucide-react";
import { format } from "date-fns";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import Toolbar from "../components/Toolbar";
import DataTable from "../components/DataTable";
import StatusPill from "../components/StatusPill";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Button from "../components/Button";
import { Field, Input, Select, Textarea } from "../components/FormFields";
import { useUsers } from "../utils/useUsers";

const STATUS_OPTIONS = ["new", "contacted", "qualified", "negotiation", "won", "lost"];
const SOURCE_OPTIONS = ["website", "referral", "cold-call", "exhibition", "social-media", "other"];

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [convertTarget, setConvertTarget] = useState(null);
  const users = useUsers();

  const [nameError, setNameError] = useState("");

  const { register, handleSubmit, reset, clearErrors, formState: { errors, isSubmitting } } = useForm({
    mode: "onChange",
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/leads", { params: { search } });
      setLeads(data.data);
    } catch (err) {
      toast.error("Could not load leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchLeads, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", company: "", email: "", phone: "", source: "website", status: "new", estimatedValue: 0, notes: "", assignedTo: "" });
    clearErrors();
    setNameError("");
    setModalOpen(true);
  };

  const openEdit = (lead) => {
    setEditing(lead);
    reset({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      estimatedValue: lead.estimatedValue,
      notes: lead.notes,
      assignedTo: lead.assignedTo?._id || "",
    });
    clearErrors();
    setNameError("");
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    const trimmedName = (values.name || "").trim();
    if (!trimmedName) {
      setNameError("Name is required");
      return;
    }
    setNameError("");

    console.log(values)
    try {
      const payload = { ...values, name: trimmedName, assignedTo: values.assignedTo || null };
      if (editing) {
        await api.put(`/leads/${editing._id}`, payload);
        toast.success("Lead updated.");
      } else {
        await api.post("/leads", payload);
        toast.success("Lead created.");
      }
      setModalOpen(false);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/leads/${deleteTarget._id}`);
      toast.success("Lead deleted.");
      setDeleteTarget(null);
      fetchLeads();
    } catch (err) {
      toast.error("Could not delete lead.");
    }
  };

  const handleConvert = async () => {
    try {
      await api.post(`/leads/${convertTarget._id}/convert`);
      toast.success("Lead converted to customer.");
      setConvertTarget(null);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not convert lead.");
    }
  };

  const columns = [
    { header: "Name", accessor: (r) => (
      <div>
        <p className="font-medium text-ink-900">{r.name}</p>
        <p className="text-xs text-slate-500">{r.company}</p>
      </div>
    )},
    { header: "Contact", accessor: (r) => (
      <div className="text-xs text-slate-500">
        <p>{r.email}</p>
        <p>{r.phone}</p>
      </div>
    )},
    { header: "Value", accessor: (r) => <span className="font-data text-xs">₹{Number(r.estimatedValue || 0).toLocaleString("en-IN")}</span> },
    { header: "Status", accessor: (r) => <StatusPill status={r.status} /> },
    { header: "Assigned", accessor: (r) => <span className="text-xs text-slate-600">{r.assignedTo?.name || "—"}</span> },
    { header: "Created", accessor: (r) => <span className="font-data text-xs text-slate-400">{format(new Date(r.createdAt), "dd MMM yyyy")}</span> },
    { header: "", accessor: (r) => (
      <div className="flex justify-end gap-1">
        {!r.convertedToCustomer && (
          <button title="Convert to customer" onClick={() => setConvertTarget(r)} className="rounded-md p-1.5 text-teal-600 hover:bg-teal-50">
            <ArrowRightCircle size={16} />
          </button>
        )}
        <button title="Edit" onClick={() => openEdit(r)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
          <Pencil size={16} />
        </button>
        <button title="Delete" onClick={() => setDeleteTarget(r)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50">
          <Trash2 size={16} />
        </button>
      </div>
    ), className: "text-right" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Pipeline"
        title="Leads"
        subtitle="Track prospects from first contact through to conversion."
        action={<Button icon={Plus} onClick={openCreate}>New Lead</Button>}
      />

      <Toolbar search={search} onSearchChange={setSearch} placeholder="Search leads by name, company, email..." />

      <DataTable columns={columns} rows={leads} loading={loading} emptyMessage="No leads yet — add your first prospect." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Lead" : "New Lead"}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Field label="Name" required error={nameError}>
            <Input autoComplete="off" {...register("name")} />
          </Field>
          <Field label="Company">
            <Input {...register("company")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <Input type="email" {...register("email")} />
            </Field>
            <Field label="Phone">
              <Input {...register("phone")} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Source">
              <Select {...register("source")}>
                {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select {...register("status")}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estimated Value (₹)">
              <Input type="number" step="0.01" {...register("estimatedValue")} />
            </Field>
            <Field label="Assigned To">
              <Select {...register("assignedTo")}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Notes">
            <Textarea {...register("notes")} />
          </Field>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{editing ? "Save Changes" : "Create Lead"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete lead?"
        description={`This will permanently remove ${deleteTarget?.name || "this lead"}.`}
      />

      <Modal open={!!convertTarget} onClose={() => setConvertTarget(null)} title="Convert to Customer" width="max-w-sm">
        <p className="mb-5 text-sm text-slate-600">
          This creates a new Customer record from <strong>{convertTarget?.name}</strong> and marks the lead as won.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConvertTarget(null)}>Cancel</Button>
          <Button onClick={handleConvert}>Convert</Button>
        </div>
      </Modal>
    </div>
  );
};

export default LeadsPage;