import React from 'react';
import { X, AlertCircle, Check, Terminal as TerminalIcon } from 'lucide-react';

/**
 * Terminal Component
 * 
 * Displays console output with timestamps and type-based styling.
 * Supports error, success, and info messages.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isVisible - Controls terminal visibility
 * @param {Function} props.onClose - Handler for closing terminal
 * @param {Array} props.output - Array of output messages
 * @param {string} props.output[].type - Message type ('error', 'success', 'info')
 * @param {string} props.output[].message - Output message
 * @param {string} props.output[].timestamp - Message timestamp
 * 
 * @example
 * <Terminal
 *   isVisible={true}
 *   onClose={() => setVisible(false)}
 *   output={[
 *     { type: 'success', message: 'File saved', timestamp: '2023...' }
 *   ]}
 * />
 */
const Terminal = ({ isVisible, onClose, output }) => {
  if (!isVisible) return null;

  return (
    <div className="h-48 border-t border-gray-800 bg-black">
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-2 text-sm font-medium border-b border-gray-800">
        <span>TERMINAL</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-900 rounded"
          title="Close Terminal"
        >
          <X size={14} />
        </button>
      </div>

      {/* Terminal Output */}
      <div className="h-[calc(100%-2.5rem)] overflow-auto p-2 font-mono">
        {output.map((output, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 mb-1 text-sm ${
              output.type === 'error' ? 'text-red-400' :
              output.type === 'success' ? 'text-green-400' :
              'text-blue-400'
            }`}
          >
            {/* Timestamp */}
            <span className="text-gray-500 text-xs">
              {new Date(output.timestamp).toLocaleTimeString()}
            </span>

            {/* Type Icon */}
            {output.type === 'error' ? <AlertCircle size={14} /> :
              output.type === 'success' ? <Check size={14} /> :
              <TerminalIcon size={14} />}

            {/* Message */}
            <span className="flex-1 break-all">{output.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Terminal;

/**
 * Component Maintenance Notes:
 * 
 * 1. Features:
 *    - Message types (error, success, info)
 *    - Timestamps
 *    - Type-based icons
 *    - Scrollable output
 *    - Closeable panel
 * 
 * 2. Styling:
 *    - Monospace font
 *    - Color-coded messages
 *    - Fixed height
 *    - Overflow handling
 * 
 * 3. Performance:
 *    - Conditional rendering
 *    - Message keying
 *    - Time formatting
 * 
 * 4. Accessibility:
 *    - Role attributes
 *    - Close button title
 *    - Color contrast
 * 
 * 5. Future Improvements:
 *    - Add clear button
 *    - Add filter options
 *    - Add search functionality
 *    - Add copy functionality
 *    - Add command input
 *    - Add message grouping
 *    - Add message expansion
 * 
 * 6. Dependencies:
 *    - lucide-react icons
 */
