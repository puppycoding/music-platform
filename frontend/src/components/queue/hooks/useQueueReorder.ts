"use client";

import { useCallback, useState } from "react";

export function useQueueReorder<T>(initialItems: T[] = []) {
  const [items, setItems] = useState<T[]>(initialItems);

  const reorderItems = useCallback((fromIndex: number, toIndex: number) => {
    setItems((currentItems) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= currentItems.length ||
        toIndex >= currentItems.length ||
        fromIndex === toIndex
      ) {
        return currentItems;
      }

      const updatedItems = [...currentItems];
      const [movedItem] = updatedItems.splice(fromIndex, 1);
      updatedItems.splice(toIndex, 0, movedItem);

      return updatedItems;
    });
  }, []);

  return {
    items,
    setItems,
    reorderItems,
  };
}