import "./ItemRow.css";

export type Item = { id: string; name: string; qty: string; done: boolean };

type Props = {
  item: Item;
  edit: boolean;
  isOwner: boolean;
  onToggle: (id: string) => void;
  onChange: (id: string, patch: Partial<Item>) => void;
  onRemove: (id: string) => void;
};

export default function ItemRow({
  item,
  edit,
  isOwner,
  onToggle,
  onChange,
  onRemove,
}: Props) {
  const { id, name, qty, done } = item;

  const handleRowClick = () => {
    if (!edit) onToggle(id);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggle(id);
  };

  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // ⬅️ důležité: neodpálí toggle řádku
    onRemove(id);
  };

  return (
    <div className={`row ${done ? "done" : ""}`} onClick={handleRowClick}>
      <label className="check" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={done} onChange={handleCheckboxChange} />
        <span />
      </label>

      {edit ? (
        <>
          <input
            className="name"
            value={name}
            onChange={(e) => onChange(id, { name: e.target.value })}
          />
          <input
            className="qty"
            value={qty}
            onChange={(e) => onChange(id, { qty: e.target.value })}
          />
        </>
      ) : (
        <>
          <div className="name">{name}</div>
          <div className="pill amount">{qty}</div>
        </>
      )}

      {isOwner && (
        <button
          type="button"
          className="row-remove"
          onClick={handleRemoveClick}
          title="Remove"
          aria-label="Remove item"
        >
          ×
        </button>
      )}
    </div>
  );
}