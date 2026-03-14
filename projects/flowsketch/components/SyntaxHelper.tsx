import React, { useState } from 'react';
import { HelpCircle, X, Copy, Check, ChevronRight } from 'lucide-react';

interface SyntaxExample {
  title: string;
  description: string;
  code: string;
}

const EXAMPLES: Record<string, SyntaxExample[]> = {
  'Flowchart': [
    {
      title: 'Basic Flowchart',
      description: 'A simple top-down flowchart.',
      code: `graph TD
    A[Start] --> B{Is it?}
    B -- Yes --> C[OK]
    C --> D[Rethink]
    D --> B
    B -- No ----> E[End]`
    },
    {
      title: 'Node Shapes',
      description: 'Different shapes for steps.',
      code: `graph LR
    A[Rectangle]
    B(Round)
    C((Circle))
    D{Diamond}
    E>Asymmetric]`
    }
  ],
  'Sequence': [
    {
      title: 'Basic Sequence',
      description: 'Interaction between participants.',
      code: `sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-)John: See you later!`
    },
    {
      title: 'Loops and Alt',
      description: 'Control flow.',
      code: `sequenceDiagram
    loop Every minute
        Alice->>John: Hello
    end
    alt is sick
        Bob->>Alice: Not coming
    else is well
        Bob->>Alice: Coming
    end`
    }
  ],
  'Class': [
    {
      title: 'Class Diagram',
      description: 'Classes and relationships.',
      code: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    class Animal{
        +int age
        +isMammal()
    }
    class Duck{
        +swim()
        +quack()
    }`
    }
  ],
  'State': [
    {
      title: 'State Diagram',
      description: 'Finite state machine.',
      code: `stateDiagram-v2
    [*] --> Still
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`
    }
  ],
  'ER': [
    {
      title: 'Entity Relationship',
      description: 'Database schema.',
      code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains`
    }
  ],
  'Gantt': [
    {
      title: 'Gantt Chart',
      description: 'Project schedule.',
      code: `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2014-01-01, 30d
    Another task     :after a1  , 20d`
    }
  ],
  'Pie': [
    {
      title: 'Pie Chart',
      description: 'Simple data visualization.',
      code: `pie title Pets
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`
    }
  ]
};

interface SyntaxReferencePanelProps {
  onInsert: (code: string) => void;
}

export const SyntaxReferencePanel: React.FC<SyntaxReferencePanelProps> = ({ onInsert }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Flowchart');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white border-t border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 shrink-0">
        <div className="flex items-center gap-2">
          <HelpCircle size={14} className="text-indigo-600" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Syntax Reference</span>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto border-b border-gray-100 shrink-0 no-scrollbar">
        {Object.keys(EXAMPLES).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              activeCategory === category
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50/30">
        <div className="space-y-4">
          {EXAMPLES[activeCategory].map((example, index) => (
            <div key={index} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm hover:border-indigo-200 transition-colors group">
              <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h4 className="text-xs font-semibold text-gray-900">{example.title}</h4>
                  <p className="text-[10px] text-gray-500">{example.description}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(example.code, index)}
                    className="p-1 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                    title="Copy"
                  >
                    {copiedIndex === index ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                  <button
                    onClick={() => onInsert(example.code)}
                    className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-medium rounded border border-indigo-100 hover:bg-indigo-100 transition-colors"
                  >
                    Insert
                  </button>
                </div>
              </div>
              <div className="p-2 bg-gray-900 overflow-x-auto">
                <pre className="text-[10px] font-mono text-gray-300 leading-relaxed">
                  <code>{example.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
