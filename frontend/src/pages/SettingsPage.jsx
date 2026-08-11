import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { UserPlus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusPill from "../components/StatusPill";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Button from "../components/Button";
import { Field, Input, Select } from "../components/FormFields";

const SettingsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data.data);
    } catch (err) {
      toast.error("Could not load team members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (values) => {
    try {
      await api.post("/auth/register", values);
      toast.success("Team member added.");
      setModalOpen(false);
      reset();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add team member.");
    }
  };

  const toggleActive = async (user) => {
    try {
      await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      toast.success(`${user.name} ${user.isActive ? "deactivated" : "activated"}.`);
      fetchUsers();
    } catch (err) {
      toast.error("Could not update user.");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteTarget._id}`);
      toast.success("User removed.");
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error("Could not remove user.");
    }
  };

  const columns = [
    { header: "Name", accessor: (r) => <p className="font-medium text-ink-900">{r.name}</p> },
    { header: "Email", accessor: (r) => <span className="text-xs text-slate-500">{r.email}</span> },
    { header: "Role", accessor: (r) => <span className="font-data text-xs uppercase text-teal-600">{r.role}</span> },
    { header: "Status", accessor: (r) => <StatusPill status={r.isActive ? "active" : "inactive"} /> },
    { header: "Last Login", accessor: (r) => <span className="font-data text-xs text-slate-400">{r.lastLogin ? format(new Date(r.lastLogin), "dd MMM yyyy") : "Never"}</span> },
    { header: "", accessor: (r) => (
      <div className="flex justify-end gap-2">
        <button onClick={() => toggleActive(r)} className="text-xs font-medium text-slate-500 hover:text-teal-600">
          {r.isActive ? "Deactivate" : "Activate"}
        </button>
        <button title="Remove" onClick={() => setDeleteTarget(r)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50">
          <Trash2 size={16} />
        </button>
      </div>
    ), className: "text-right" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Team & Settings"
        subtitle="Manage who has access to your CRM and their roles."
        action={<Button icon={UserPlus} onClick={() => setModalOpen(true)}>Add Team Member</Button>}
      />

      <DataTable columns={columns} rows={users} loading={loading} emptyMessage="No team members yet." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Team Member">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Field label="Name" required error={errors.name?.message}>
            <Input {...register("name", { required: "Name is required" })} />
          </Field>
          <Field label="Email" required error={errors.email?.message}>
            <Input type="email" {...register("email", { required: "Email is required" })} />
          </Field>
          <Field label="Temporary Password" required error={errors.password?.message}>
            <Input type="password" {...register("password", { required: "Password is required", minLength: { value: 6, message: "At least 6 characters" } })} />
          </Field>
          <Field label="Role">
            <Select {...register("role")}>
              <option value="sales">sales</option>
              <option value="manager">manager</option>
              <option value="admin">admin</option>
            </Select>
          </Field>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Add Member</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove team member?"
        description={`${deleteTarget?.name || "This user"} will lose access immediately.`}
      />
    </div>
  );
};

export default SettingsPage;
