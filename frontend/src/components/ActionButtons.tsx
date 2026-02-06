type Props = {
  edit: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onDone: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onLeave?: () => void;
  isOwner: boolean;
  isMember: boolean;
};

export default function ActionButtons({
  edit,
  onEdit,
  onCancel,
  onDone,
  onArchive,
  onDelete,
  onLeave,
  isOwner,
  isMember,
}: Props) {
  if (edit) {
    return (
      <div className="footer-actions">
        <button className="edit" onClick={onDone}>
          Done
        </button>
        <button className="archive" onClick={onCancel}>
          Cancel
        </button>
      </div>
    );
  }

  if (isOwner) {
    return (
      <div className="footer-actions">
        <button className="edit" onClick={onEdit}>
          Edit
        </button>
        <button className="archive" onClick={onArchive}>
          Archive
        </button>
        <button className="delete" onClick={onDelete}>
          Delete
        </button>
      </div>
    );
  }

  if (isMember) {
    return (
      <div className="footer-actions">
        <button className="edit" onClick={onEdit}>
          Edit
        </button>
        <button className="delete" onClick={onLeave}>
          Leave list
        </button>
      </div>
    );
  }
  return null;
}
