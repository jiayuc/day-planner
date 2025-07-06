import React from 'react';

/**
 * DraggableList is a generic React component for rendering a list of items that can be reordered via drag-and-drop.
 *
 * Props:
 * - items: Array of items to display.
 * - onReorder: Callback called with the new item order after a drag-and-drop.
 * - renderItem: Function to render each item. Receives (item, idx, dragHandleProps).
 * - getKey: Function to get a unique key for each item.
 *
 * Usage:
 * <DraggableList
 *   items={tasks}
 *   onReorder={setTasks}
 *   getKey={item => item.id}
 *   renderItem={(item, idx, dragHandleProps) => (
 *     <div {...dragHandleProps}>{item.name}</div>
 *   )}
 * />
 */
export interface DraggableListProps<T> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  renderItem: (item: T, idx: number, dragHandleProps: any) => React.ReactNode;
  getKey: (item: T) => string | number;
}

export function DraggableList<T>({ items, onReorder, renderItem, getKey }: DraggableListProps<T>) {
  // Index of the item being dragged
  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null);
  // Index of the item currently hovered over
  const [overIdx, setOverIdx] = React.useState<number | null>(null);

  // Start dragging an item
  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  // Track which item is being hovered over
  const handleDragOver = (idx: number) => setOverIdx(idx);
  // Handle drop event to reorder items
  const handleDrop = (idx: number) => {
    if (draggedIdx === null || draggedIdx === idx) {
      setDraggedIdx(null);
      setOverIdx(null);
      return;
    }
    const newItems = [...items];
    const [removed] = newItems.splice(draggedIdx, 1);
    newItems.splice(idx, 0, removed);
    onReorder(newItems);
    setDraggedIdx(null);
    setOverIdx(null);
  };

  return (
    <ul className="flex flex-col">
      {items.map((item, idx) => (
        <li
          key={getKey(item)}
          draggable
          onDragStart={() => handleDragStart(idx)}
          onDragOver={e => { e.preventDefault(); handleDragOver(idx); }}
          onDrop={() => handleDrop(idx)}
          onDragEnd={() => { setDraggedIdx(null); setOverIdx(null); }}
          className={`transition-all duration-150 px-2 py-2 ${
            overIdx === idx && draggedIdx !== null ? 'bg-blue-50 ring-2 ring-blue-300 rounded-lg' : ''
          }`}
          style={{ cursor: 'grab', opacity: draggedIdx === idx ? 0.5 : 1 }}
        >
          {renderItem(item, idx, { draggable: true })}
        </li>
      ))}
    </ul>
  );
}
