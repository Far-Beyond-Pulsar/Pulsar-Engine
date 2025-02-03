import React from 'react';

/**
 * ResizeHandle Component
 * 
 * A draggable handle component that enables resizing of adjacent panels.
 * Typically used for resizing the file explorer sidebar.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onMouseDown - Handler for mouse down event to initiate resize
 * 
 * @example
 * <ResizeHandle 
 *   onMouseDown={(e) => handleResizeStart(e)} 
 * />
 */
const ResizeHandle = ({ onMouseDown }) => (
  <div
    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50"
    onMouseDown={onMouseDown}
    role="separator"
    aria-orientation="vertical"
    aria-label="Resize panel"
    title="Drag to resize"
  />
);

export default ResizeHandle;

/**
 * Component Maintenance Notes:
 * 
 * 1. Functionality:
 *    - Provides visual handle for resizing
 *    - Initiates resize operation on mouse down
 *    - Parent component handles actual resizing logic
 * 
 * 2. Styling:
 *    - 1px width by default
 *    - Full height (top-0 bottom-0)
 *    - Semi-transparent blue hover state
 *    - Column resize cursor
 *    - Absolute positioning
 * 
 * 3. Accessibility:
 *    - Role="separator" for semantic meaning
 *    - Aria-orientation for screen readers
 *    - Aria-label for description
 *    - Title attribute for tooltip
 * 
 * 4. Usage Pattern:
 *    Typically used with:
 *    - Mouse move event listener on document
 *    - Mouse up event listener for cleanup
 *    - State management for width
 *    - Min/max width constraints
 * 
 * 5. Example Implementation:
 *    ```jsx
 *    const [width, setWidth] = useState(260);
 *    const [isResizing, setIsResizing] = useState(false);
 *    
 *    useEffect(() => {
 *      if (isResizing) {
 *        const handleMouseMove = (e) => {
 *          const newWidth = e.clientX;
 *          if (newWidth > 160 && newWidth < window.innerWidth / 2) {
 *            setWidth(newWidth);
 *          }
 *        };
 *        
 *        const handleMouseUp = () => {
 *          setIsResizing(false);
 *        };
 *        
 *        document.addEventListener('mousemove', handleMouseMove);
 *        document.addEventListener('mouseup', handleMouseUp);
 *        
 *        return () => {
 *          document.removeEventListener('mousemove', handleMouseMove);
 *          document.removeEventListener('mouseup', handleMouseUp);
 *        };
 *      }
 *    }, [isResizing]);
 *    ```
 * 
 * 6. Future Improvements:
 *    - Add keyboard control
 *    - Add double-click to reset
 *    - Add snap points
 *    - Add size indicators
 *    - Add resize transitions
 *    - Add custom cursors
 * 
 * 7. Common Issues:
 *    - Text selection during resize
 *    - Cursor jumping
 *    - Performance with frequent updates
 *    - z-index conflicts
 * 
 * 8. Solutions:
 *    - Use user-select: none during resize
 *    - Throttle/debounce resize updates
 *    - Manage z-index carefully
 *    - Use transform instead of width for performance
 * 
 * 9. Dependencies:
 *    - React
 *    - Tailwind CSS
 */

/**
 * Resize Handle Usage Example:
 * 
 * ```jsx
 * const Panel = () => {
 *   const [width, setWidth] = useState(260);
 *   const [isResizing, setIsResizing] = useState(false);
 * 
 *   const handleResizeStart = () => {
 *     setIsResizing(true);
 *   };
 * 
 *   return (
 *     <div style={{ width }} className="relative">
 *       <div className="panel-content">
 *         Content here
 *       </div>
 *       <ResizeHandle onMouseDown={handleResizeStart} />
 *     </div>
 *   );
 * };
 * ```
 */
