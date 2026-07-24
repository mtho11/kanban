import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { Column, Task } from "../types";
import PriorityBadge from "./PriorityBadge";

interface Props {
  task: Task;
  columnId: string;
  columns: Column[];
  onEdit: () => void;
  onDelete: () => void;
  onMoveToColumn: (targetColumnId: string) => void;
}

export default function TaskCard({ task, columnId, columns, onEdit, onDelete, onMoveToColumn }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card${isDragging ? " task-card-dragging" : ""}`}
    >
      <div className="task-card-drag-handle" {...attributes} {...listeners}>
        <div className="task-card-header">
          <PriorityBadge priority={task.priority} />
        </div>
        <h3 className="task-card-title">{task.title}</h3>
        {task.description && <p className="task-card-description">{task.description}</p>}
      </div>

      <div className="task-card-actions">
        <button
          type="button"
          className="icon-button"
          aria-label="Edit task"
          onClick={onEdit}
        >
          ✎
        </button>
        <div className="task-menu-wrapper">
          <button
            type="button"
            className="icon-button"
            aria-label="Move task"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            ⇄
          </button>
          {menuOpen && (
            <div className="task-menu" role="menu">
              <div className="task-menu-label">Move to…</div>
              {columns
                .filter((c) => c.id !== columnId)
                .map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="task-menu-item"
                    onClick={() => {
                      onMoveToColumn(c.id);
                      setMenuOpen(false);
                    }}
                  >
                    {c.title}
                  </button>
                ))}
            </div>
          )}
        </div>
        <button
          type="button"
          className="icon-button icon-button-danger"
          aria-label="Delete task"
          onClick={onDelete}
        >
          🗑
        </button>
      </div>
    </div>
  );
}
