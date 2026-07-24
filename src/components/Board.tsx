import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState } from "react";
import { useBoard } from "../hooks/useBoard";
import type { Priority, Task } from "../types";
import Column from "./Column";
import TaskCard from "./TaskCard";
import TaskFormModal from "./TaskFormModal";

export default function Board() {
  const {
    board,
    addColumn,
    deleteColumn,
    renameColumn,
    reorderColumns,
    addTask,
    editTask,
    deleteTask,
    moveTask,
  } = useBoard();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [taskModal, setTaskModal] = useState<
    | { mode: "add"; columnId: string }
    | { mode: "edit"; columnId: string; task: Task }
    | null
  >(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const orderedColumns = board.columnOrder
    .map((id) => board.columns.find((c) => c.id === id))
    .filter((c): c is (typeof board.columns)[number] => Boolean(c));

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type;
    if (type === "task") {
      const task = board.tasks[active.id as string];
      setActiveTask(task ?? null);
    } else if (type === "column") {
      setActiveColumnId(active.id as string);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setActiveColumnId(null);
    if (!over) return;

    const activeType = active.data.current?.type;

    if (activeType === "column") {
      if (active.id !== over.id) {
        const oldIndex = board.columnOrder.indexOf(active.id as string);
        const newIndex = board.columnOrder.indexOf(over.id as string);
        if (oldIndex !== -1 && newIndex !== -1) {
          reorderColumns(arrayMove(board.columnOrder, oldIndex, newIndex));
        }
      }
      return;
    }

    if (activeType === "task") {
      const fromColumnId = active.data.current?.columnId as string;
      const overType = over.data.current?.type;
      let toColumnId: string;
      let toIndex: number;

      if (overType === "task") {
        toColumnId = over.data.current?.columnId as string;
        const toColumn = board.columns.find((c) => c.id === toColumnId);
        toIndex = toColumn ? toColumn.taskIds.indexOf(over.id as string) : 0;
      } else {
        toColumnId = over.id as string;
        const toColumn = board.columns.find((c) => c.id === toColumnId);
        toIndex = toColumn ? toColumn.taskIds.length : 0;
      }

      if (toColumnId) {
        moveTask(active.id as string, fromColumnId, toColumnId, toIndex);
      }
    }
  };

  const handleAddColumn = () => {
    const trimmed = newColumnTitle.trim();
    if (trimmed) {
      addColumn(trimmed);
    }
    setNewColumnTitle("");
    setAddingColumn(false);
  };

  const handleDeleteColumn = (columnId: string, title: string) => {
    const column = board.columns.find((c) => c.id === columnId);
    const taskCount = column?.taskIds.length ?? 0;
    const message =
      taskCount > 0
        ? `Delete "${title}" and its ${taskCount} task${taskCount === 1 ? "" : "s"}?`
        : `Delete "${title}"?`;
    if (window.confirm(message)) {
      deleteColumn(columnId);
    }
  };

  const handleDeleteTask = (taskId: string, title: string) => {
    if (window.confirm(`Delete task "${title}"?`)) {
      deleteTask(taskId);
    }
  };

  const handleSaveTask = (title: string, description: string, priority: Priority) => {
    if (!taskModal) return;
    if (taskModal.mode === "add") {
      addTask(taskModal.columnId, title, description, priority);
    } else {
      editTask(taskModal.task.id, { title, description, priority });
    }
    setTaskModal(null);
  };

  return (
    <div className="board-page">
      <header className="board-header">
        <h1>My Kanban Board</h1>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board">
          <SortableContext items={board.columnOrder} strategy={horizontalListSortingStrategy}>
            {orderedColumns.map((column, index) => (
              <Column
                key={column.id}
                column={column}
                tasks={column.taskIds.map((id) => board.tasks[id]).filter(Boolean)}
                allColumns={orderedColumns}
                canMoveLeft={index > 0}
                canMoveRight={index < orderedColumns.length - 1}
                onRename={(title) => renameColumn(column.id, title)}
                onDelete={() => handleDeleteColumn(column.id, column.title)}
                onMoveLeft={() => {
                  if (index > 0) {
                    reorderColumns(arrayMove(board.columnOrder, index, index - 1));
                  }
                }}
                onMoveRight={() => {
                  if (index < orderedColumns.length - 1) {
                    reorderColumns(arrayMove(board.columnOrder, index, index + 1));
                  }
                }}
                onAddTask={() => setTaskModal({ mode: "add", columnId: column.id })}
                onEditTask={(taskId) => {
                  const task = board.tasks[taskId];
                  if (task) setTaskModal({ mode: "edit", columnId: column.id, task });
                }}
                onDeleteTask={(taskId) => {
                  const task = board.tasks[taskId];
                  handleDeleteTask(taskId, task?.title ?? "this task");
                }}
                onMoveTaskToColumn={(taskId, targetColumnId) => {
                  const targetColumn = board.columns.find((c) => c.id === targetColumnId);
                  moveTask(taskId, column.id, targetColumnId, targetColumn?.taskIds.length ?? 0);
                }}
              />
            ))}
          </SortableContext>

          <div className="add-column-wrapper">
            {addingColumn ? (
              <div className="add-column-form">
                <input
                  autoFocus
                  className="add-column-input"
                  placeholder="Column name"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddColumn();
                    if (e.key === "Escape") {
                      setAddingColumn(false);
                      setNewColumnTitle("");
                    }
                  }}
                />
                <div className="add-column-actions">
                  <button type="button" className="primary-button" onClick={handleAddColumn}>
                    Add
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setAddingColumn(false);
                      setNewColumnTitle("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="add-column-button" onClick={() => setAddingColumn(true)}>
                + Add column
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              columnId=""
              columns={[]}
              onEdit={() => {}}
              onDelete={() => {}}
              onMoveToColumn={() => {}}
            />
          ) : activeColumnId ? (
            <div className="column column-overlay">
              {board.columns.find((c) => c.id === activeColumnId)?.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {taskModal && (
        <TaskFormModal
          initialTitle={taskModal.mode === "edit" ? taskModal.task.title : ""}
          initialDescription={taskModal.mode === "edit" ? taskModal.task.description : ""}
          initialPriority={taskModal.mode === "edit" ? taskModal.task.priority : "medium"}
          heading={taskModal.mode === "edit" ? "Edit task" : "Add task"}
          onSave={handleSaveTask}
          onClose={() => setTaskModal(null)}
        />
      )}
    </div>
  );
}
