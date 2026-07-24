import { v4 as uuid } from "uuid";
import type { BoardState } from "../types";

export function createSeedBoard(): BoardState {
  const todoId = uuid();
  const inProgressId = uuid();
  const doneId = uuid();

  const task1Id = uuid();
  const task2Id = uuid();
  const task3Id = uuid();

  return {
    columns: [
      { id: todoId, title: "To Do", taskIds: [task1Id, task2Id] },
      { id: inProgressId, title: "In Progress", taskIds: [task3Id] },
      { id: doneId, title: "Done", taskIds: [] },
    ],
    columnOrder: [todoId, inProgressId, doneId],
    tasks: {
      [task1Id]: {
        id: task1Id,
        title: "Welcome to your kanban board",
        description: "Drag this card to another column to try it out.",
        priority: "medium",
        createdAt: Date.now(),
      },
      [task2Id]: {
        id: task2Id,
        title: "Add your own task",
        description: "Use the + button at the bottom of a column.",
        priority: "low",
        createdAt: Date.now(),
      },
      [task3Id]: {
        id: task3Id,
        title: "Set a priority",
        description: "Tasks can be low, medium, high, or urgent priority.",
        priority: "high",
        createdAt: Date.now(),
      },
    },
  };
}
