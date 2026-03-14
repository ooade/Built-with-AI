import React, { useState } from 'react';
import { Code2, Trash2, Copy, Check } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism.css'; // Basic theme, we can customize

// Custom Mermaid grammar for Prism
Prism.languages.mermaid = {
  'comment': /%%.*/,
  'string': {
    pattern: /"[^"]*"|'[^']*'/,
    greedy: true
  },
  'keyword': /\b(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram-v2|erDiagram|gantt|pie|gitGraph|journey|mindmap|timeline|zenuml|quadrantChart|sankey-beta|xychart|block-beta)\b/,
  'direction': /\b(TD|TB|BT|RL|LR)\b/,
  'arrow': /[-=]+>|[-=]+|[-.]->|[-.]-/,
  'node-shape': /[[{(>]+.*?[\]})>]+/,
  'class-def': /\b(classDef|class|style|linkStyle)\b/,
  'variable': /\b[A-Za-z0-9_]+\b(?=\s*[:(\[{])/,
};

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  onClear?: () => void;
  onCopy?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, onClear, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-10 px-4 flex items-center justify-between border-b border-gray-200 bg-gray-50 shrink-0">
        <div className="flex items-center gap-2 text-gray-700">
          <Code2 size={16} className="text-indigo-600" />
          <span className="text-xs font-semibold uppercase tracking-wider">Code Editor</span>
        </div>
        <div className="flex items-center gap-2">
          {onCopy && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
              title="Copy Code"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
          {onClear && (
            <>
              <div className="w-px h-3 bg-gray-300 mx-1"></div>
              <button
                onClick={onClear}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                title="Clear Source"
              >
                <Trash2 size={14} />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 relative overflow-auto bg-white custom-scrollbar">
        <Editor
          value={code}
          onValueChange={onChange}
          highlight={code => Prism.highlight(code, Prism.languages.mermaid, 'mermaid')}
          padding={16}
          className="font-mono text-sm leading-relaxed min-h-full"
          style={{
            fontFamily: '"Fira Code", "Fira Mono", monospace',
            fontSize: 14,
            backgroundColor: '#ffffff',
          }}
          textareaClassName="focus:outline-none"
        />
      </div>
      <style>{`
        /* Custom scrollbar for the editor */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
        
        /* Prism overrides for cleaner look */
        code[class*="language-"],
        pre[class*="language-"] {
          text-shadow: none !important;
          background: transparent !important;
        }
        .token.comment { color: #94a3b8; font-style: italic; }
        .token.keyword { color: #7c3aed; font-weight: bold; } /* indigo-600 */
        .token.direction { color: #db2777; font-weight: bold; } /* pink-600 */
        .token.arrow { color: #64748b; } /* slate-500 */
        .token.string { color: #16a34a; } /* green-600 */
        .token.node-shape { color: #2563eb; } /* blue-600 */
        .token.class-def { color: #ea580c; } /* orange-600 */
        .token.variable { color: #0f172a; font-weight: 600; } /* slate-900 */
      `}</style>
    </div>
  );
};