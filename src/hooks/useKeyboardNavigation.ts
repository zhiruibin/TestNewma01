import { useState, useEffect, useRef, useCallback } from 'react';

/*** useKeyboardNavigation - 封装键盘导航焦点索引 + 键盘事件监听逻辑
 ** @param itemCount  菜单项总数
 * @param onSelect   选中回调，接收当前聚焦的 index
 * @returns focusedIndex - 当前聚焦的菜单项索引
 */
export function useKeyboardNavigation(
  itemCount: number,
  onSelect: (index: number) => void,
  containerRef: React.RefObject<HTMLElement | null>,
): UseKeyboardNavigationReturn {
  const [focusedIndex, setFocusedIndex] = useState(0);

  // 使用 ref 避免 useEffect 闭包陈旧问题
  const onSelectRef = useRef(onSelect);
  const focusedIndexRef = useRef(focusedIndex);

  // 保持 ref 与最新值同步
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    focusedIndexRef.current = focusedIndex;
  }, [focusedIndex]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (itemCount === 0) return;

      let nextIndex = focusedIndexRef.current;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          nextIndex = (focusedIndexRef.current - 1 + itemCount) % itemCount;
          setFocusedIndex(nextIndex);
          break;
        case 'ArrowDown':
          event.preventDefault();
          nextIndex = (focusedIndexRef.current + 1) % itemCount;
          setFocusedIndex(nextIndex);
          break;
        case 'Enter':
          event.preventDefault();
          onSelectRef.current(focusedIndexRef.current);
          break;
        default:
          break;
      }
    },
    [itemCount],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { focusedIndex };
}