import { useState, useEffect, useRef, useCallback } from 'react';

interface UseKeyboardNavigationOptions {
  itemCount: number;
  onSelect: (index: number) => void;
}

interface UseKeyboardNavigationReturn {
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
}

export function useKeyboardNavigation({
  itemCount,
  onSelect,
}: UseKeyboardNavigationOptions): UseKeyboardNavigationReturn {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const focusedIndexRef = useRef(focusedIndex);
  const onSelectRef = useRef(onSelect);

  // Keep refs in sync with latest values
  useEffect(() => {
    focusedIndexRef.current = focusedIndex;
  }, [focusedIndex]);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (itemCount === 0) return;

      switch (e.key) {
        case 'ArrowUp': {
          e.preventDefault();
          const prevIndex =
            (focusedIndexRef.current - 1 + itemCount) % itemCount;
          setFocusedIndex(prevIndex);
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          const nextIndex = (focusedIndexRef.current + 1) % itemCount;
          setFocusedIndex(nextIndex);
          break;
        }
        case 'Enter': {
          e.preventDefault();
          onSelectRef.current(focusedIndexRef.current);
          break;
        }
      }
    },
    [itemCount]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { focusedIndex, setFocusedIndex };
}