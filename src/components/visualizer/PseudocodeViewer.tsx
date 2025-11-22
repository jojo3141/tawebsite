import React, { useEffect, useRef } from 'react';
import { 
    PSEUDOCODE_DIJKSTRA, PSEUDOCODE_DIJKSTRA_UNDIRECTED, 
    PSEUDOCODE_BFS, PSEUDOCODE_BFS_UNDIRECTED,
    PSEUDOCODE_DFS, PSEUDOCODE_DFS_UNDIRECTED,
    PSEUDOCODE_BELLMAN_FORD, PSEUDOCODE_BELLMAN_FORD_UNDIRECTED,
    PSEUDOCODE_PRIM, PSEUDOCODE_KRUSKAL, PSEUDOCODE_BORUVKA, 
    AlgorithmType 
} from '@/types/graph';
import { clsx } from 'clsx';

interface PseudocodeViewerProps {
  activeLine: number;
  algorithm: AlgorithmType;
  isDirected?: boolean;
}

const PseudocodeViewer: React.FC<PseudocodeViewerProps> = ({ activeLine, algorithm, isDirected = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
        activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeLine, algorithm]);

  let lines = PSEUDOCODE_DIJKSTRA;
  
  if (algorithm === AlgorithmType.DIJKSTRA) {
      lines = isDirected ? PSEUDOCODE_DIJKSTRA : PSEUDOCODE_DIJKSTRA_UNDIRECTED;
  }
  if (algorithm === AlgorithmType.BFS) {
      lines = isDirected ? PSEUDOCODE_BFS : PSEUDOCODE_BFS_UNDIRECTED;
  }
  if (algorithm === AlgorithmType.DFS) {
      lines = isDirected ? PSEUDOCODE_DFS : PSEUDOCODE_DFS_UNDIRECTED;
  }
  if (algorithm === AlgorithmType.BELLMAN_FORD) {
      lines = isDirected ? PSEUDOCODE_BELLMAN_FORD : PSEUDOCODE_BELLMAN_FORD_UNDIRECTED;
  }
  if (algorithm === AlgorithmType.PRIM) lines = PSEUDOCODE_PRIM;
  if (algorithm === AlgorithmType.KRUSKAL) lines = PSEUDOCODE_KRUSKAL;
  if (algorithm === AlgorithmType.BORUVKA) lines = PSEUDOCODE_BORUVKA;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-700 font-semibold text-slate-300 flex justify-between items-center">
        <span>Pseudocode ({algorithm.replace('_', ' ')})</span>
        <span className="text-xs text-slate-500">CLRS Style</span>
      </div>
      <div className="p-4 overflow-auto flex-1" ref={containerRef}>
        <div className="font-mono text-sm space-y-0.5">
          {lines.map((item, index) => {
            const isActive = item.line === activeLine;
            // For empty lines (spacers)
            if (!item.text) return <div key={index} className="h-4" />;
            
            return (
              <div
                key={index}
                ref={isActive ? activeRef : null}
                className={clsx(
                  "px-2 py-1 rounded transition-colors duration-200",
                  isActive ? "bg-yellow-900/60 text-yellow-200 border-l-2 border-yellow-500" : "text-slate-400 hover:bg-slate-700/30",
                  
                )}
                style={{ paddingLeft: `${item.indent * 12 + 8}px` }}
              >
                <span className="inline-block w-6 text-slate-600 select-none text-[10px] mr-2">{item.line}</span>
                {item.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PseudocodeViewer;