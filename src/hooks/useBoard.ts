import { useCallback, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import type { BoardState, Priority, Task } from "../types";
import { createSeedBoard } from "../data/seed";

const STORAGE_KEY = "kanban-board-state-v1";

function loadBoard(): BoardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedBoard();
    const parsed = JSON.parse(raw) as BoardState;
    if (!parsed.columns || !parsed.columnOrder || !parsed.tasks) {
      return createSeedBoard();
    }
    return parsed;
  } catch {
    return createSeedBoard();
  }
}

export function useBoard() {
  const [board, setBoard] = useState<BoardState>(loadBoard);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  }, [board]);

  const addColumn = useCallback((title: string) => {
    const id = uuid();
    setBoard((prev) => ({
      ...prev,
      columns: [...prev.columns, { id, title, taskIds: [] }],
      columnOrder: [...prev.columnOrder, id],
    }));
  }, []);

  const deleteColumn = useCallback((columnId: string) => {
    setBoard((prev) => {
      const column = prev.columns.find((c) => c.id === columnId);
      if (!column) return prev;
      const remainingTasks = { ...prev.tasks };
      for (const taskId of column.taskIds) {
        delete remainingTasks[taskId];
      }
      return {
        ...prev,
        columns: prev.columns.filter((c) => c.id !== columnId),
        columnOrder: prev.columnOrder.filter((id) => id !== columnId),
        tasks: remainingTasks,
      };
    });
  }, []);

  const renameColumn = useCallback((columnId: string, title: string) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((c) =>
        c.id === columnId ? { ...c, title } : c
      ),
    }));
  }, []);

  const reorderColumns = useCallback((newOrder: string[]) => {
    setBoard((prev) => ({ ...prev, columnOrder: newOrder }));
  }, []);

  const addTask = useCallback(
    (columnId: string, title: string, description: string, priority: Priority) => {
      const id = uuid();
      const task: Task = {
        id,
        title,
        description,
        priority,
        createdAt: Date.now(),
      };
      setBoard((prev) => ({
        ...prev,
        tasks: { ...prev.tasks, [id]: task },
        columns: prev.columns.map((c) =>
          c.id === columnId ? { ...c, taskIds: [...c.taskIds, id] } : c
        ),
      }));
    },
    []
  );

  const editTask = useCallback(
    (taskId: string, updates: Partial<Pick<Task, "title" | "description" | "priority">>) => {
      setBoard((prev) => {
        const existing = prev.tasks[taskId];
        if (!existing) return prev;
        return {
          ...prev,
          tasks: { ...prev.tasks, [taskId]: { ...existing, ...updates } },
        };
      });
    },
    []
  );

  const deleteTask = useCallback((taskId: string) => {
    setBoard((prev) => {
      const remainingTasks = { ...prev.tasks };
      delete remainingTasks[taskId];
      return {
        ...prev,
        tasks: remainingTasks,
        columns: prev.columns.map((c) => ({
          ...c,
          taskIds: c.taskIds.filter((id) => id !== taskId),
        })),
      };
    });
  }, []);

  const moveTask = useCallback(
    (taskId: string, fromColumnId: string, toColumnId: string, toIndex: number) => {
      setBoard((prev) => {
        if (fromColumnId === toColumnId) {
          const column = prev.columns.find((c) => c.id === fromColumnId);
          if (!column) return prev;
          const fromIndex = column.taskIds.indexOf(taskId);
          if (fromIndex === -1) return prev;
          const taskIds = [...column.taskIds];
          taskIds.splice(fromIndex, 1);
          const clampedIndex = Math.max(0, Math.min(toIndex, taskIds.length));
          taskIds.splice(clampedIndex, 0, taskId);
          return {
            ...prev,
            columns: prev.columns.map((c) =>
              c.id === fromColumnId ? { ...c, taskIds } : c
            ),
          };
        }
        const columns = prev.columns.map((c) => {
          if (c.id === fromColumnId) {
            return { ...c, taskIds: c.taskIds.filter((id) => id !== taskId) };
          }
          return c;
        });
        const finalColumns = columns.map((c) => {
          if (c.id === toColumnId) {
            const taskIds = [...c.taskIds];
            const clampedIndex = Math.max(0, Math.min(toIndex, taskIds.length));
            taskIds.splice(clampedIndex, 0, taskId);
            return { ...c, taskIds };
          }
          return c;
        });
        return { ...prev, columns: finalColumns };
      });
    },
    []
  );

  return {
    board,
    addColumn,
    deleteColumn,
    renameColumn,
    reorderColumns,
    addTask,
    editTask,
    deleteTask,
    moveTask,
  };
}
