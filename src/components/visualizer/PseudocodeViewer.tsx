
import React, { useEffect, useRef } from 'react';
import { 
    PSEUDOCODE_DIJKSTRA, PSEUDOCODE_DIJKSTRA_UNDIRECTED, 
    PSEUDOCODE_BFS, PSEUDOCODE_BFS_UNDIRECTED,
    PSEUDOCODE_DFS, PSEUDOCODE_DFS_UNDIRECTED,
    PSEUDOCODE_BELLMAN_FORD, PSEUDOCODE_BELLMAN_FORD_UNDIRECTED,
    PSEUDOCODE_PRIM, PSEUDOCODE_KRUSKAL, PSEUDOCODE_BORUVKA, 
    AlgorithmType 
} from '@/types/graph';
import {
    PSEUDOCODE_BUBBLE_SORT, PSEUDOCODE_SELECTION_SORT,
    PSEUDOCODE_INSERTION_SORT, PSEUDOCODE_MERGE_SORT,
    PSEUDOCODE_QUICK_SORT, PSEUDOCODE_HEAP_SORT,
    SortingAlgorithmType
} from '@/types/sorting';
import { clsx } from 'clsx';
import { Code } from 'lucide-react';

interface PseudocodeViewerProps {
  activeLine: number;
  algorithm: AlgorithmType | SortingAlgorithmType;
  isDirected?: boolean;
}

const PseudocodeViewer: React.FC<PseudocodeViewerProps> = ({ activeLine, algorithm, isDirected = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
        const container = containerRef.current;
        const activeElement = activeRef.current;

        const containerRect = container.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();

        // Check if active element is out of view relative to container
        const isAbove = activeRect.top < containerRect.top;
        const isBelow = activeRect.bottom > containerRect.bottom;

        if (isAbove) {
            // Scroll up just enough to show the element
            container.scrollTop -= (containerRect.top - activeRect.top);
        } else if (isBelow) {
            // Scroll down just enough to show the element
            container.scrollTop += (activeRect.bottom - containerRect.bottom);
        }
    }
  }, [activeLine, algorithm]);

  let lines: { line: number, text: string, indent: number }[] = [];
  
  // Graph Algorithms
  if (algorithm === AlgorithmType.DIJKSTRA) {
      lines = isDirected ? PSEUDOCODE_DIJKSTRA : PSEUDOCODE_DIJKSTRA_UNDIRECTED;
  } else if (algorithm === AlgorithmType.BFS) {
      lines = isDirected ? PSEUDOCODE_BFS : PSEUDOCODE_BFS_UNDIRECTED;
  } else if (algorithm === AlgorithmType.DFS) {
      lines = isDirected ? PSEUDOCODE_DFS : PSEUDOCODE_DFS_UNDIRECTED;
  } else if (algorithm === AlgorithmType.BELLMAN_FORD) {
      lines = isDirected ? PSEUDOCODE_BELLMAN_FORD : PSEUDOCODE_BELLMAN_FORD_UNDIRECTED;
  } else if (algorithm === AlgorithmType.PRIM) lines = PSEUDOCODE_PRIM;
  else if (algorithm === AlgorithmType.KRUSKAL) lines = PSEUDOCODE_KRUSKAL;
  else if (algorithm === AlgorithmType.BORUVKA) lines = PSEUDOCODE_BORUVKA;
  
  // Sorting Algorithms
  else if (algorithm === SortingAlgorithmType.BUBBLE_SORT) lines = PSEUDOCODE_BUBBLE_SORT;
  else if (algorithm === SortingAlgorithmType.SELECTION_SORT) lines = PSEUDOCODE_SELECTION_SORT;
  else if (algorithm === SortingAlgorithmType.INSERTION_SORT) lines = PSEUDOCODE_INSERTION_SORT;
  else if (algorithm === SortingAlgorithmType.MERGE_SORT) lines = PSEUDOCODE_MERGE_SORT;
  else if (algorithm === SortingAlgorithmType.QUICK_SORT) lines = PSEUDOCODE_QUICK_SORT;
  else if (algorithm === SortingAlgorithmType.HEAP_SORT) lines = PSEUDOCODE_HEAP_SORT;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-full">
      <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Code size={14} />
          <span>{algorithm.replace(/_/g, ' ')}</span>
        </div>
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
