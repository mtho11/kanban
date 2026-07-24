import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import type { Column as ColumnType, Task } from "../types";
import TaskCard from "./TaskCard";

interface Props {
  column: ColumnType;
  tasks: Task[];
  allColumns: ColumnType[];
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onRename: (title: string) => void;
  onDelete: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onAddTask: () => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTaskToColumn: (taskId: string, targetColumnId: string) => void;
}

export default function Column({
  column,
  tasks,
  allColumns,
  canMoveLeft,
  canMoveRight,
  onRename,
  onDelete,
  onMoveLeft,
  onMoveRight,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTaskToColumn,
}: Props) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(column.title);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: "column" } });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: column.id,
    data: { type: "column" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed) onRename(trimmed);
    else setTitleDraft(column.title);
    setEditingTitle(false);
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`column${isDragging ? " column-dragging" : ""}`}
    >
      <div className="column-header" {...attributes} {...listeners}>
        <button
          type="button"
          className="column-move-button"
          aria-label="Move column left"
          disabled={!canMoveLeft}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onMoveLeft}
        >
          ‹
        </button>

        {editingTitle ? (
          <input
            className="column-title-input"
            value={titleDraft}
            autoFocus
            onPointerDown={(e) => e.stopPropagation()}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") {
                setTitleDraft(column.title);
                setEditingTitle(false);
              }
            }}
          />
        ) : (
          <button
            type="button"
            className="column-title"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setEditingTitle(true)}
          >
            {column.title}
            <span className="column-count">{tasks.length}</span>
          </button>
        )}

        <button
          type="button"
          className="column-move-button"
          aria-label="Move column right"
          disabled={!canMoveRight}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onMoveRight}
        >
          ›
        </button>

        <button
          type="button"
          className="icon-button icon-button-danger"
          aria-label="Delete column"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onDelete}
        >
          ✕
        </button>
      </div>

      <div ref={setDroppableRef} className="column-body">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columnId={column.id}
              columns={allColumns}
              onEdit={() => onEditTask(task.id)}
              onDelete={() => onDeleteTask(task.id)}
              onMoveToColumn={(targetColumnId) => onMoveTaskToColumn(task.id, targetColumnId)}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && <div className="column-empty">No tasks</div>}
      </div>

      <button type="button" className="add-task-button" onClick={onAddTask}>
        + Add task
      </button>
    </div>
  );
}
