import { useState } from "react";
import type { Priority } from "../types";

interface Props {
  heading: string;
  initialTitle: string;
  initialDescription: string;
  initialPriority: Priority;
  onSave: (title: string, description: string, priority: Priority) => void;
  onClose: () => void;
}

const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

export default function TaskFormModal({
  heading,
  initialTitle,
  initialDescription,
  initialPriority,
  onSave,
  onClose,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [priority, setPriority] = useState<Priority>(initialPriority);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave(trimmed, description.trim(), priority);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-heading">{heading}</h2>
        <form onSubmit={handleSubmit}>
          <label className="modal-label" htmlFor="task-title">
            Title
          </label>
          <input
            id="task-title"
            className="modal-input"
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label className="modal-label" htmlFor="task-description">
            Description
          </label>
          <textarea
            id="task-description"
            className="modal-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <label className="modal-label" htmlFor="task-priority">
            Priority
          </label>
          <select
            id="task-priority"
            className="modal-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>

          <div className="modal-actions">
            <button type="submit" className="primary-button">
              Save
            </button>
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
