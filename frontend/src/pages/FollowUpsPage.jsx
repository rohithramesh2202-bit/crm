import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2, Send, CheckCircle2, XCircle } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusPill from "../components/StatusPill";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import { Field, Input, Select, Textarea } from "../components/FormFields";
import { useUsers } from "../utils/useUsers";

const TYPE_OPTIONS = ["call", "email", "meeting", "demo", "other"];

const FollowUpsPage = () => {
  const [rows, setRows] = useState([]);
  const [due, setDue] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [outcomeTarget, setOutcomeTarget] = useState(null);
  const [outcomeStatus, setOutcomeStatus] = useState("done");
  const [outcomeNote, setOutcomeNote] = useState("");
  const [sendTarget, setSendTarget] = useState(null);
  const [emailForm, setEmailForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const users = useUsers();

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { relatedKind: "Lead", relatedItem: "", type: "call", dueDate: "", notes: "", assignedTo: "" },
  });
  const relatedKind = watch("relatedKind");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [all, dueList, l, c] = await Promise.all([
        api.get("/followups"),
        api.get("/followups/due"),
        api.get("/leads", { params: { limit: 200 } }),
        api.get("/customers", { params: { limit: 200 } }),
      ]);
      setRows(all.data.data);
      setDue(dueList.data.data);
      setLeads(l.data.data);
      setCustomers(c.data.data);
      
    } catch (err) {
      toast.error("Could not load follow-ups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreate = () => {
    reset({ relatedKind: "Lead", relatedItem: "", type: "call", dueDate: "", notes: "", assignedTo: "" });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      await api.post("/followups", {
        relatedTo: { kind: values.relatedKind, item: values.relatedItem },
        type: values.type,
        dueDate: values.dueDate,
        notes: values.notes,
        assignedTo: values.assignedTo || undefined,
      });
      toast.success("Follow-up scheduled.");
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/followups/${deleteTarget._id}`);
      toast.success("Follow-up deleted.");
      setDeleteTarget(null);
      fetchAll();
    } catch (err) {
      toast.error("Could not delete follow-up.");
    }
  };

  const handleOutcome = async () => {
    try {
      await api.patch(`/followups/${outcomeTarget._id}/status`, { status: outcomeStatus, outcome: outcomeNote });
      toast.success("Follow-up updated.");
      setOutcomeTarget(null);
      setOutcomeNote("");
      fetchAll();
    } catch (err) {
      toast.error("Could not update follow-up.");
    }
  };

  const handleSendEmail = async () => {
    setSending(true);
    try {
      const { data } = await api.post(`/followups/${sendTarget._id}/send-email`, emailForm);
      toast.success(data.message);
      setSendTarget(null);
      setEmailForm({ subject: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send email. Check SMTP settings.");
    } finally {
      setSending(false);
    }
  };

  const contactOptions = relatedKind === "Lead" ? leads : customers;

  const dueBadge = (dueDate) => {
    if (isPast(new Date(dueDate)) && !isToday(new Date(dueDate))) return <span className="font-data text-xs font-medium text-red-600">Overdue</span>;
    if (isToday(new Date(dueDate))) return <span className="font-data text-xs font-medium text-amber-600">Today</span>;
    return <span className="font-data text-xs text-slate-500">{format(new Date(dueDate), "dd MMM yyyy")}</span>;
  };

  const columns = [
    { header: "Due", accessor: (r) => dueBadge(r.dueDate) },
    { header: "Type", accessor: (r) => <span className="capitalize text-xs text-slate-600">{r.type}</span> },
    { header: "For", accessor: (r) => <span className="text-xs text-slate-600">{r.relatedTo.kind}</span> },
    { header: "Assigned", accessor: (r) => <span className="text-xs text-slate-600">{r.assignedTo?.name || "—"}</span> },
    { header: "Status", accessor: (r) => <StatusPill status={r.status} /> },
    { header: "", accessor: (r) => (
      <div className="flex justify-end gap-1">
        {r.status === "open" && (
          <>
            <button title="Mark done" onClick={() => { setOutcomeTarget(r); setOutcomeStatus("done"); }} className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50">
              <CheckCircle2 size={16} />
            </button>
            <button title="Mark missed" onClick={() => { setOutcomeTarget(r); setOutcomeStatus("missed"); }} className="rounded-md p-1.5 text-red-500 hover:bg-red-50">
              <XCircle size={16} />
            </button>
          </>
        )}
        <button title="Send email" onClick={() => setSendTarget(r)} className="rounded-md p-1.5 text-teal-600 hover:bg-teal-50">
          <Send size={16} />
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
        eyebrow="Cadence"
        title="Follow-ups"
        subtitle="Never let a lead or customer go quiet."
        action={<Button icon={Plus} onClick={openCreate}>Schedule Follow-up</Button>}
      />

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
        <p className="mb-2 text-sm font-medium text-amber-800">Due today or overdue ({due.length})</p>
        {due.length === 0 ? (
          <p className="text-xs text-amber-700/70">You're all caught up.</p>
        ) : (
          <ul className="space-y-1">
            {due.map((f) => (
              <li key={f._id} className="flex items-center justify-between text-xs text-amber-800">
                <span className="capitalize">{f.type} — {f.relatedTo.kind}</span>
                <span className="font-data">{format(new Date(f.dueDate), "dd MMM yyyy")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No follow-ups scheduled yet." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Follow-up">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Relates To">
              <Select {...register("relatedKind")}>
                <option value="Lead">Lead</option>
                <option value="Customer">Customer</option>
              </Select>
            </Field>
            <Field label={relatedKind} required error={errors.relatedItem?.message}>
              <Select {...register("relatedItem", { required: "Please select one" })}>
                <option value="">Select {relatedKind}</option>
                {contactOptions.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}{c.company ? ` — ${c.company}` : ""}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select {...register("type")}>
                {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Due Date" required error={errors.dueDate?.message}>
              <Input type="date" {...register("dueDate", { required: "Due date is required" })} />
            </Field>
          </div>
          <Field label="Assign To">
            <Select {...register("assignedTo")}>
              <option value="">Unassigned</option>
              {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </Select>
          </Field>
          <Field label="Notes">
            <Textarea {...register("notes")} />
          </Field>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Schedule</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!outcomeTarget} onClose={() => setOutcomeTarget(null)} title={outcomeStatus === "done" ? "Mark as done" : "Mark as missed"} width="max-w-sm">
        <Field label="Outcome notes">
          <Textarea value={outcomeNote} onChange={(e) => setOutcomeNote(e.target.value)} placeholder="What happened?" />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOutcomeTarget(null)}>Cancel</Button>
          <Button onClick={handleOutcome}>Save</Button>
        </div>
      </Modal>

      <Modal open={!!sendTarget} onClose={() => setSendTarget(null)} title="Send follow-up email" width="max-w-sm">
        <Field label="Subject">
          <Input value={emailForm.subject} onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} placeholder="Following up on our conversation" />
        </Field>
        <Field label="Message">
          <Textarea value={emailForm.message} onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })} placeholder="Hi, just checking in..." />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setSendTarget(null)}>Cancel</Button>
          <Button icon={Send} onClick={handleSendEmail} loading={sending}>Send</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete follow-up?"
        description="This will permanently remove this scheduled follow-up."
      />
    </div>
  );
};

export default FollowUpsPage;
