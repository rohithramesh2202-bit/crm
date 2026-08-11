import Modal from "./Modal";
import Button from "./Button";

const ConfirmDialog = ({ open, onClose, onConfirm, title = "Are you sure?", description, loading }) => (
  <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
    <p className="mb-5 text-sm text-slate-600">{description}</p>
    <div className="flex justify-end gap-2">
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="danger" onClick={onConfirm} loading={loading}>
        Delete
      </Button>
    </div>
  </Modal>
);

export default ConfirmDialog;
