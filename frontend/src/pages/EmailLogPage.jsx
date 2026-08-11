import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Send } from "lucide-react";
import { format } from "date-fns";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusPill from "../components/StatusPill";
import Modal from "../components/Modal";
import Button from "../components/Button";
import { Field, Input, Textarea } from "../components/FormFields";

const EmailLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/emails/logs");
      setLogs(data.data);
    } catch (err) {
      toast.error("Could not load email logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const onSubmit = async (values) => {
    try {
      await api.post("/emails/send", values);
      toast.success("Email sent.");
      setModalOpen(false);
      reset();
      fetchLogs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send email. Check SMTP settings.");
    }
  };

  const columns = [
    { header: "To", accessor: (r) => <span className="text-xs text-slate-700">{r.to}</span> },
    { header: "Subject", accessor: (r) => <span className="text-xs font-medium text-ink-800">{r.subject}</span> },
    { header: "Related", accessor: (r) => <span className="text-xs text-slate-500">{r.relatedTo?.kind || "General"}</span> },
    { header: "Sent By", accessor: (r) => <span className="text-xs text-slate-500">{r.sentBy?.name || "—"}</span> },
    { header: "Status", accessor: (r) => <StatusPill status={r.status === "sent" ? "active" : "lost"} /> },
    { header: "Date", accessor: (r) => <span className="font-data text-xs text-slate-400">{format(new Date(r.createdAt), "dd MMM yyyy HH:mm")}</span> },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Communication"
        title="Email Log"
        subtitle="Every email the CRM has sent — quotations, follow-ups, and ad-hoc messages."
        action={<Button icon={Send} onClick={() => setModalOpen(true)}>Send Email</Button>}
      />

      <DataTable columns={columns} rows={logs} loading={loading} emptyMessage="No emails sent yet." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Send Ad-hoc Email">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Field label="To" required error={errors.to?.message}>
            <Input type="email" {...register("to", { required: "Recipient is required" })} />
          </Field>
          <Field label="Subject" required error={errors.subject?.message}>
            <Input {...register("subject", { required: "Subject is required" })} />
          </Field>
          <Field label="Message" required error={errors.message?.message}>
            <Textarea rows={6} {...register("message", { required: "Message is required" })} />
          </Field>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Send</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmailLogPage;
