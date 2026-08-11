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

const DistributorsPage = () => {
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
      const { data } = await api.get("/distributors", { params: { search } });
      setRows(data.data);
    } catch (err) {
      toast.error("Could not load distributors.");
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
    reset({ name: "", region: "", contactPerson: "", email: "", phone: "", address: "", productLines: "", status: "active", notes: "" });
    setModalOpen(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    reset({ ...r, productLines: (r.productLines || []).join(", ") });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      const payload = { ...values, productLines: values.productLines ? values.productLines.split(",").map((s) => s.trim()) : [] };
      if (editing) {
        await api.put(`/distributors/${editing._id}`, payload);
        toast.success("Distributor updated.");
      } else {
        await api.post("/distributors", payload);
        toast.success("Distributor created.");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/distributors/${deleteTarget._id}`);
      toast.success("Distributor deleted.");
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error("Could not delete distributor.");
    }
  };

  const columns = [
    { header: "Name", accessor: (r) => <p className="font-medium text-ink-900">{r.name}</p> },
    { header: "Region", accessor: (r) => <span className="text-xs text-slate-600">{r.region}</span> },
    { header: "Contact", accessor: (r) => (
      <div className="text-xs text-slate-500">
        <p>{r.contactPerson}</p>
        <p>{r.email}</p>
      </div>
    )},
    { header: "Product Lines", accessor: (r) => <span className="text-xs text-slate-600">{(r.productLines || []).join(", ") || "—"}</span> },
    { header: "Phone", accessor: (r) => <span className="text-xs text-slate-600">{(r.phone|| "—")}</span> },
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
        title="Distributors"
        subtitle="Regional partners who resell on your behalf."
        action={<Button icon={Plus} onClick={openCreate}>New Distributor</Button>}
      />

      <Toolbar search={search} onSearchChange={setSearch} placeholder="Search distributors..." />

      <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No distributors yet." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Distributor" : "New Distributor"}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Field label="Name" required error={errors.name?.message}>
            <Input {...register("name", { required: "Name is required" })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Region">
              <Input {...register("region")} />
            </Field>
            <Field label="Contact Person">
              <Input {...register("contactPerson")} />
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
          <Field label="Product Lines (comma separated)">
            <Input {...register("productLines")} placeholder="Pumps, Valves, Motors" />
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
            <Button type="submit" loading={isSubmitting}>{editing ? "Save Changes" : "Create Distributor"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete distributor?"
        description={`This will permanently remove ${deleteTarget?.name || "this distributor"}.`}
      />
    </div>
  );
};

export default DistributorsPage;
