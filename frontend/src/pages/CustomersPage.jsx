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
import { useUsers } from "../utils/useUsers";

const TYPE_OPTIONS = ["direct", "distributor", "oem"];

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const users = useUsers();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/customers", { params: { search } });
      setCustomers(data.data);
      console.log(data.data)
    } catch (err) {
      toast.error("Could not load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", company: "", email: "", phone: "", customerType: "direct", gstNumber: "", billingAddress: "", shippingAddress: "", notes: "", accountOwner: "", status: "active" });
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    reset({
      name: c.name, company: c.company, email: c.email, phone: c.phone,
      customerType: c.customerType, gstNumber: c.gstNumber, billingAddress: c.billingAddress,
      shippingAddress: c.shippingAddress, notes: c.notes, accountOwner: c.accountOwner?._id || "", status: c.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      const payload = { ...values, accountOwner: values.accountOwner || null };
      if (editing) {
        await api.put(`/customers/${editing._id}`, payload);
        toast.success("Customer updated.");
      } else {
        await api.post("/customers", payload);
        toast.success("Customer created.");
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/customers/${deleteTarget._id}`);
      toast.success("Customer deleted.");
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      toast.error("Could not delete customer.");
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
    { header: "Type", accessor: (r) => <span className="capitalize text-xs text-slate-600">{r.customerType}</span> },
    { header: "Owner", accessor: (r) => <span className="text-xs text-slate-600">{r.accountOwner?.name || "—"}</span> },
    { header: "Product", accessor:(r)=> <span className="text-xs text-slate-600">{r.notes}</span>},
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
        eyebrow="Accounts"
        title="Customers"
        subtitle="Direct customers, and accounts converted from won leads."
        action={<Button icon={Plus} onClick={openCreate}>New Customer</Button>}
      />

      <Toolbar search={search} onSearchChange={setSearch} placeholder="Search customers..." />

      <DataTable columns={columns} rows={customers} loading={loading} emptyMessage="No customers yet." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Customer" : "New Customer"}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Field label="Name" required error={errors.name?.message}>
            <Input {...register("name", { required: "Name is required" })} />
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
            <Field label="Customer Type">
              <Select {...register("customerType")}>
                {TYPE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="GST Number">
              <Input {...register("gstNumber")} />
            </Field>
          </div>
          <Field label="Billing Address">
            <Textarea {...register("billingAddress")} />
          </Field>
          <Field label="Shipping Address">
            <Textarea {...register("shippingAddress")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Account Owner">
              <Select {...register("accountOwner")}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select {...register("status")}>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </Select>
            </Field>
          </div>
          <Field label="Notes">
            <Textarea {...register("notes")} />
          </Field>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{editing ? "Save Changes" : "Create Customer"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete customer?"
        description={`This will permanently remove ${deleteTarget?.name || "this customer"}.`}
      />
    </div>
  );
};

export default CustomersPage;
