import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import Toolbar from "../components/Toolbar";
import DataTable from "../components/DataTable";
import StatusPill from "../components/StatusPill";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Button from "../components/Button";
import { Field, Input, Select, Textarea } from "../components/FormFields";

const OEMsPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/oems", { params: { search } });
      setRows(data.data);
    } catch (err) {
      toast.error("Could not load OEMs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", contactPerson: "", email: "", phone: "", address: "", partNumbers: "", contractValue: 0, status: "active", notes: "" });
    setModalOpen(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    reset({ ...r, partNumbers: (r.partNumbers || []).join(", ") });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      const payload = { ...values, partNumbers: values.partNumbers ? values.partNumbers.split(",").map((s) => s.trim()) : [] };
      if (editing) {
        await api.put(`/oems/${editing._id}`, payload);
        toast.success("OEM updated.");
      } else {
        await api.post("/oems", payload);
        toast.success("OEM created.");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/oems/${deleteTarget._id}`);
      toast.success("OEM deleted.");
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error("Could not delete OEM.");
    }
  };

  const columns = [
    { header: "Name", accessor: (r) => <p className="font-medium text-ink-900">{r.name}</p> },
    { header: "Contact", accessor: (r) => (
      <div className="text-xs text-slate-500">
        <p>{r.contactPerson}</p>
        <p>{r.email}</p>
      </div>
    )},
    { header: "Number", accessor: (r) => <span className="font-data text-xs">{r.phone||"-"}</span> },
    { header: "Status", accessor: (r) => <StatusPill status={r.status} /> },
    { header: "", accessor: (r) => (
      <div className="flex justify-end gap-1">
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
        eyebrow="Channel"
        title="OEMs"
        subtitle="Original equipment manufacturers you supply parts or contracts to."
        action={<Button icon={Plus} onClick={openCreate}>New OEM</Button>}
      />

      <Toolbar search={search} onSearchChange={setSearch} placeholder="Search OEMs..." />

      <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No OEMs yet." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit OEM" : "New OEM"}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Field label="Name" required error={errors.name?.message}>
            <Input {...register("name", { required: "Name is required" })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact Person">
              <Input {...register("contactPerson")} />
            </Field>
            <Field label="Contract Value (₹)">
              <Input type="number" step="0.01" {...register("contractValue")} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <Input type="email" {...register("email")} />
            </Field>
            <Field label="Phone">
              <Input {...register("phone")} />
            </Field>
          </div>
          <Field label="Address">
            <Textarea {...register("address")} />
          </Field>
          <Field label="Part Numbers (comma separated)">
            <Input {...register("partNumbers")} placeholder="PN-1001, PN-1002" />
          </Field>
          <Field label="Status">
            <Select {...register("status")}>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </Select>
          </Field>
          <Field label="Notes">
            <Textarea {...register("notes")} />
          </Field>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{editing ? "Save Changes" : "Create OEM"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete OEM?"
        description={`This will permanently remove ${deleteTarget?.name || "this OEM"}.`}
      />
    </div>
  );
};

export default OEMsPage;
