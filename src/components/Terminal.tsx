import { useState } from 'react';
import { X } from 'lucide-react';

const Terminal = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([]);

  const runCommand = async (cmd: string) => {
    if (!cmd.trim()) return;
    
    setOutput(prev => [...prev, { type: 'command', message: `$ ${cmd}` }]);

    try {
      const res = await fetch(`/api/cmd?cmd=${encodeURIComponent(cmd)}`);
      const data = await res.json();
      
      if (data.error) {
        setOutput(prev => [...prev, { type: 'error', message: data.error }]);
      } else {
        setOutput(prev => [...prev, { type: 'success', message: data.output }]);
      }
    } catch (err) {
      setOutput(prev => [...prev, { 
        type: 'error', 
        message: err.message 
      }]);
    }

    setInput('');
  };

  return (
    <div className="h-48 bg-black border-t border-gray-800">
      <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-800">
        <span className="text-sm font-medium">Console</span>
        <button onClick={() => setConsoleOpen(false)}>
          <X size={16} />
        </button>
      </div>
      <div className="p-2 h-32 overflow-auto font-mono text-sm">
        {output.map((line, i) => (
          <div key={i} className={
            line.type === 'error' ? 'text-red-400' : 
            line.type === 'command' ? 'text-blue-400' : 
            'text-gray-300'
          }>
            {line.message}
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-gray-800">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && runCommand(input)}
          className="w-full bg-transparent border-none outline-none font-mono text-sm text-gray-300"
          placeholder="Enter command..."
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default Terminal;