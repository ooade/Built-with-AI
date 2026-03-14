import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Maximize, Minimize, AlertCircle, PenTool, Download, ChevronDown } from 'lucide-react';

interface DiagramPreviewProps {
  code: string;
}

export interface DiagramPreviewRef {
  exportSvg: () => void;
  exportPng: () => void;
}

// Initial configuration
const baseConfig = {
  startOnLoad: false,
  securityLevel: 'loose',
  fontFamily: 'Fira Code, monospace',
  altFontFamily: 'sans-serif',
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
  },
  suppressErrorRendering: true,
};

mermaid.initialize({
  ...baseConfig,
  theme: 'default',
});

// Override Mermaid's default error handling to prevent it from injecting HTML into the DOM
mermaid.parseError = (err) => {
  console.debug('Mermaid parse error:', err);
};

export const DiagramPreview = forwardRef<DiagramPreviewRef, DiagramPreviewProps>(({ code }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mermaidContainerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<string>('');
  const [isHandDrawn, setIsHandDrawn] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const handleExportSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowsketch-diagram-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };

  const handleExportPng = () => {
    if (!svgContent) return;
    // Use mermaidContainerRef to ensure we get the diagram SVG, not an icon SVG
    const svgElement = mermaidContainerRef.current?.querySelector('svg');
    if (!svgElement) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    
    // Get dimensions from SVG or container
    const width = svgElement.viewBox.baseVal.width || svgElement.width.baseVal.value || 800;
    const height = svgElement.viewBox.baseVal.height || svgElement.height.baseVal.value || 600;
    
    // Set canvas size (maybe scale up for better quality)
    const scale = 2;
    canvas.width = width * scale;
    canvas.height = height * scale;

    img.onload = () => {
      if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pngUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `flowsketch-diagram-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    setIsExportMenuOpen(false);
  };

  useImperativeHandle(ref, () => ({
    exportSvg: handleExportSvg,
    exportPng: handleExportPng
  }));

  useEffect(() => {
    // Get mermaid version if available, otherwise fallback
    setVersion(typeof mermaid.version === 'function' ? mermaid.version() : (mermaid as any).version || '');
  }, []);

  // Re-initialize mermaid when hand-drawn mode changes
  useEffect(() => {
    mermaid.initialize({
      ...baseConfig,
      theme: isHandDrawn ? 'neutral' : 'default',
      look: isHandDrawn ? 'handDrawn' : 'classic',
    });
  }, [isHandDrawn]);

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      if (!code) {
        if (isMounted) {
          setSvgContent('');
          setError(null);
        }
        return;
      }
      
      try {
        setError(null);
        // Generate a unique ID to avoid conflicts in React strict mode or re-renders
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        // mermaid.render returns an object { svg } in newer versions
        const { svg } = await mermaid.render(id, code);
        
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Mermaid Render Error", err);
          let errorMessage = "Syntax Error: The generated diagram code is invalid.";
          if (err instanceof Error) {
            errorMessage = err.message;
          } else if (typeof err === 'string') {
            errorMessage = err;
          }
          setError(errorMessage);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [code, isHandDrawn]); // Re-render when code or hand-drawn mode changes

  return (
    <div className="flex-1 h-full bg-white relative overflow-hidden flex flex-col border border-gray-200 shadow-sm">
      
      <div className="flex-1 relative w-full h-full bg-slate-50/50" ref={containerRef}>
        {/* Export Menu */}
        <div className="absolute top-4 right-4 z-20">
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download size={14} />
              <span>Export</span>
              <ChevronDown size={12} />
            </button>
            
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-30">
                <button
                  onClick={handleExportPng}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                >
                  PNG Image
                </button>
                <button
                  onClick={handleExportSvg}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                >
                  SVG Vector
                </button>
              </div>
            )}
          </div>
        </div>

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 bg-red-50/80 backdrop-blur-sm z-10">
            <div className="max-w-lg w-full bg-white p-6 rounded-xl shadow-xl border border-red-100 text-red-600">
              <div className="flex items-center gap-2 mb-3 text-red-700 font-semibold">
                <AlertCircle size={20} />
                <span>Rendering Failed</span>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-100 font-mono text-xs overflow-auto max-h-60 whitespace-pre-wrap">
                {error}
              </div>
              <p className="text-xs mt-3 text-gray-500">
                Check your syntax in the editor.
              </p>
            </div>
          </div>
        ) : svgContent ? (
          <>
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              centerOnInit
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                   <div className="absolute bottom-4 left-4 z-10 flex space-x-1 bg-white p-1 rounded-md shadow border border-gray-200">
                      <button 
                        onClick={() => setIsHandDrawn(!isHandDrawn)} 
                        className={`p-1 rounded transition-colors ${isHandDrawn ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-600'}`}
                        title={isHandDrawn ? "Switch to Classic Mode" : "Switch to Hand-Drawn Mode"}
                      >
                        <PenTool size={16} />
                      </button>
                      <div className="w-px bg-gray-200 mx-1"></div>
                      <button onClick={() => zoomIn()} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="Zoom In"><Maximize size={16} /></button>
                      <button onClick={() => zoomOut()} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="Zoom Out"><Minimize size={16} /></button>
                  </div>
                  <TransformComponent
                    wrapperStyle={{ width: '100%', height: '100%' }}
                    contentStyle={{ width: '100%', height: '100%' }}
                  >
                    <div 
                      ref={mermaidContainerRef}
                      className="w-full h-full flex items-center justify-center p-8"
                      dangerouslySetInnerHTML={{ __html: svgContent }} 
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
            
            {/* Watermark */}
            <div className="absolute bottom-3 right-3 text-[10px] text-gray-300 font-mono pointer-events-none select-none z-0">
              FlowSketch • Mermaid.js {version}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            {code ? "Generating visual..." : "Start typing to create a diagram..."}
          </div>
        )}
      </div>
    </div>
  );
});

DiagramPreview.displayName = 'DiagramPreview';