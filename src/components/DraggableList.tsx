import React from 'react';

export interface DraggableListProps<T> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  renderItem: (item: T, idx: number, dragHandleProps: any) => React.ReactNode;
  getKey: (item: T) => string | number;
}

export function DraggableList<T>({ items, onReorder, renderItem, getKey }: DraggableListProps<T>) {
  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null);
  const [overIdx, setOverIdx] = React.useState<number | null>(null);

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };
  const handleDragOver = (idx: number) => {
    setOverIdx(idx);
  };
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
    <ul className="flex flex-col gap-3">
      {items.map((item, idx) => (
        <li
          key={getKey(item)}
          draggable
          onDragStart={() => handleDragStart(idx)}
          onDragOver={e => { e.preventDefault(); handleDragOver(idx); }}
          onDrop={() => handleDrop(idx)}
          onDragEnd={() => { setDraggedIdx(null); setOverIdx(null); }}
          className={`transition-all duration-150 bg-white rounded-xl shadow border border-gray-200 px-2 ${
            overIdx === idx && draggedIdx !== null ? 'ring-2 ring-blue-300' : ''
          }`}
          style={{ cursor: 'grab', opacity: draggedIdx === idx ? 0.5 : 1 }}
        >
          {renderItem(item, idx, { draggable: true })}
        </li>
      ))}
    </ul>
  );
}
