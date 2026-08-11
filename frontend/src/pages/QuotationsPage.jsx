import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Send, Eye } from "lucide-react";
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

const emptyItem = { description: "", quantity: 1, unitPrice: 0 };

const QuotationsPage = () => {
  const [rows, setRows] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sendTarget, setSendTarget] = useState(null);
  const [sending, setSending] = useState(false);
  const [overrideEmail, setOverrideEmail] = useState("");

  const { register, handleSubmit, control, watch, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { relatedKind: "Lead", relatedItem: "", items: [emptyItem], discountPercent: 0, taxPercent: 0, currency: "INR", validUntil: "", notes: "", status: "draft" },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");
  const relatedKind = watch("relatedKind");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [q, l, c] = await Promise.all([
        api.get("/quotations", { params: { search } }),
        api.get("/leads", { params: { limit: 200 } }),
        api.get("/customers", { params: { limit: 200 } }),
      ]);
      setRows(q.data.data);
      setLeads(l.data.data);
      setCustomers(c.data.data);
    } catch (err) {
      toast.error("Could not load quotations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchAll, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const calcTotals = () => {
    const items = watchedItems || [];
    const subTotal = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);
    const discountPercent = Number(watch("discountPercent")) || 0;
    const taxPercent = Number(watch("taxPercent")) || 0;
    const afterDiscount = subTotal - (subTotal * discountPercent) / 100;
    const grandTotal = afterDiscount + (afterDiscount * taxPercent) / 100;
    return { subTotal, grandTotal };
  };

  const openCreate = () => {
    setEditing(null);
    reset({ relatedKind: "Lead", relatedItem: "", items: [emptyItem], discountPercent: 0, taxPercent: 0, currency: "INR", validUntil: "", notes: "", status: "draft" });
    setModalOpen(true);
  };

  const openEdit = (q) => {
    setEditing(q);
    reset({
      relatedKind: q.relatedTo.kind,
      relatedItem: q.relatedTo.item,
      items: q.items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })),
      discountPercent: q.discountPercent,
      taxPercent: q.taxPercent,
      currency: q.currency,
      validUntil: q.validUntil ? q.validUntil.slice(0, 10) : "",
      notes: q.notes,
      status: q.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      const payload = {
        relatedTo: { kind: values.relatedKind, item: values.relatedItem },
        items: values.items.map((i) => ({ description: i.description, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
        discountPercent: Number(values.discountPercent) || 0,
        taxPercent: Number(values.taxPercent) || 0,
        currency: values.currency,
        validUntil: values.validUntil || undefined,
        notes: values.notes,
        status: values.status,
      };
      if (editing) {
        await api.put(`/quotations/${editing._id}`, payload);
        toast.success("Quotation updated.");
      } else {
        await api.post("/quotations", payload);
        toast.success("Quotation created.");
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/quotations/${deleteTarget._id}`);
      toast.success("Quotation deleted.");
      setDeleteTarget(null);
      fetchAll();
    } catch (err) {
      toast.error("Could not delete quotation.");
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const { data } = await api.post(`/quotations/${sendTarget._id}/send`, {
        email: overrideEmail || undefined,
      });
      toast.success(data.message);
      setSendTarget(null);
      setOverrideEmail("");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send email. Check SMTP settings.");
    } finally {
      setSending(false);
    }
  };

  const contactOptions = relatedKind === "Lead" ? leads : customers;

  const columns = [
    { header: "Quotation #", accessor: (r) => <span className="font-data text-xs font-medium text-ink-900">{r.quotationNumber}</span> },
    { header: "For", accessor: (r) => <span className="text-xs text-slate-600">{r.relatedTo.kind}</span> },
    { header: "Grand Total", accessor: (r) => <span className="font-data text-xs">{r.currency} {Number(r.grandTotal).toLocaleString("en-IN")}</span> },
    { header: "Valid Until", accessor: (r) => <span className="font-data text-xs text-slate-500">{r.validUntil ? format(new Date(r.validUntil), "dd MMM yyyy") : "—"}</span> },
    { header: "Status", accessor: (r) => <StatusPill status={r.status} /> },
    { header: "", accessor: (r) => (
      <div className="flex justify-end gap-1">
        <button title="View" onClick={() => setViewing(r)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
          <Eye size={16} />
        </button>
        <button title="Email quotation" onClick={() => setSendTarget(r)} className="rounded-md p-1.5 text-teal-600 hover:bg-teal-50">
          <Send size={16} />
        </button>
        <button title="Edit" onClick={() => openEdit(r)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
          <Pencil size={16} />
        </button>
        <button title="Delete" onClick={() => setDeleteTarget(r)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50">
          <Trash2 size={16} />
        </button>
      </div>
    ), className: "text-right" },
  ];

  const totals = calcTotals();

  return (
    <div>
      <PageHeader
        eyebrow="Sales Documents"
        title="Quotations"
        subtitle="Build, send and track quotations for leads and customers."
        action={<Button icon={Plus} onClick={openCreate}>New Quotation</Button>}
      />

      <Toolbar search={search} onSearchChange={setSearch} placeholder="Search by quotation number..." />

      <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No quotations yet." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Quotation" : "New Quotation"} width="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quote For">
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

          <p className="mb-2 mt-4 text-sm font-medium text-ink-800">Line Items</p>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2">
                <div className="col-span-6">
                  <Input placeholder="Description" {...register(`items.${index}.description`, { required: true })} />
                </div>
                <div className="col-span-2">
                  <Input type="number" min="1" placeholder="Qty" {...register(`items.${index}.quantity`, { required: true })} />
                </div>
                <div className="col-span-3">
                  <Input type="number" step="0.01" min="0" placeholder="Unit Price" {...register(`items.${index}.unitPrice`, { required: true })} />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <button type="button" onClick={() => fields.length > 1 && remove(index)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => append(emptyItem)}
            className="mt-2 text-xs font-medium text-teal-600 hover:text-teal-700"
          >
            + Add line item
          </button>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <Field label="Discount %">
              <Input type="number" step="0.01" {...register("discountPercent")} />
            </Field>
            <Field label="Tax %">
              <Input type="number" step="0.01" {...register("taxPercent")} />
            </Field>
            <Field label="Currency">
              <Select {...register("currency")}>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Valid Until">
              <Input type="date" {...register("validUntil")} />
            </Field>
            <Field label="Status">
              <Select {...register("status")}>
                <option value="draft">draft</option>
                <option value="sent">sent</option>
                <option value="accepted">accepted</option>
                <option value="rejected">rejected</option>
                <option value="expired">expired</option>
              </Select>
            </Field>
          </div>

          <Field label="Notes">
            <Textarea {...register("notes")} />
          </Field>

          <div className="mb-4 rounded-lg bg-slate-50 p-4 text-right font-data text-sm">
            <p>Subtotal: {totals.subTotal.toFixed(2)}</p>
            <p className="text-base font-semibold text-ink-900">Grand Total: {totals.grandTotal.toFixed(2)}</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{editing ? "Save Changes" : "Create Quotation"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.quotationNumber} width="max-w-xl">
        {viewing && (
          <div>
            <table className="mb-4 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="font-data">
                {viewing.items.map((i, idx) => (
                  <tr key={idx} className="border-b border-slate-50">
                    <td className="py-2 font-sans">{i.description}</td>
                    <td className="py-2 text-center">{i.quantity}</td>
                    <td className="py-2 text-right">{i.unitPrice.toFixed(2)}</td>
                    <td className="py-2 text-right">{i.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right font-data text-sm">
              <p>Subtotal: {viewing.subTotal.toFixed(2)}</p>
              <p>Discount: {viewing.discountPercent}%</p>
              <p>Tax: {viewing.taxPercent}%</p>
              <p className="text-base font-semibold text-ink-900">Grand Total: {viewing.grandTotal.toFixed(2)} {viewing.currency}</p>
            </div>
            {viewing.notes && <p className="mt-3 text-sm text-slate-600">{viewing.notes}</p>}
          </div>
        )}
      </Modal>

      <Modal open={!!sendTarget} onClose={() => setSendTarget(null)} title="Email this quotation" width="max-w-sm">
        <p className="mb-3 text-sm text-slate-600">
          Sends {sendTarget?.quotationNumber} to the linked contact's email. Override below if needed.
        </p>
        <Field label="Recipient email (optional override)">
          <Input type="email" value={overrideEmail} onChange={(e) => setOverrideEmail(e.target.value)} placeholder="leave blank to use contact's email" />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setSendTarget(null)}>Cancel</Button>
          <Button icon={Send} onClick={handleSend} loading={sending}>Send Email</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete quotation?"
        description={`This will permanently remove ${deleteTarget?.quotationNumber || "this quotation"}.`}
      />
    </div>
  );
};

export default QuotationsPage;
