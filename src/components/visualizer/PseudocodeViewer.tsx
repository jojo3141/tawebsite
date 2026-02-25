
import React, { useEffect, useRef } from 'react';
import { 
    PSEUDOCODE_DIJKSTRA, PSEUDOCODE_DIJKSTRA_UNDIRECTED, 
    PSEUDOCODE_BFS, PSEUDOCODE_BFS_UNDIRECTED,
    PSEUDOCODE_DFS, PSEUDOCODE_DFS_UNDIRECTED,
    PSEUDOCODE_BELLMAN_FORD, PSEUDOCODE_BELLMAN_FORD_UNDIRECTED,
    PSEUDOCODE_PRIM, PSEUDOCODE_KRUSKAL, PSEUDOCODE_BORUVKA, PSEUDOCODE_TARJAN, PSEUDOCODE_EULER,
    PSEUDOCODE_GREEDY_MATCHING, PSEUDOCODE_HOPCROFT_KARP,
    PSEUDOCODE_GREEDY_COLORING, PSEUDOCODE_SMALLEST_LAST_COLORING, PSEUDOCODE_FORD_FULKERSON, PSEUDOCODE_LONG_PATH, PSEUDOCODE_HAMILTON_PATH, PSEUDOCODE_MIN_EDGE_CUT, PSEUDOCODE_SMALLEST_ENCLOSING_DISK, PSEUDOCODE_JARVIS_WRAP, PSEUDOCODE_LOCAL_REPAIR, PSEUDOCODE_FINDING_DUPLICATES_HASH, PSEUDOCODE_BLOOM_FILTER, PSEUDOCODE_FINDING_DUPLICATES_FLOYD,
    AlgorithmType 
} from '@/types/graph';
import {
    PSEUDOCODE_BUBBLE_SORT, PSEUDOCODE_SELECTION_SORT,
    PSEUDOCODE_INSERTION_SORT, PSEUDOCODE_MERGE_SORT,
    PSEUDOCODE_QUICK_SORT, PSEUDOCODE_HEAP_SORT,
    SortingAlgorithmType
} from '@/types/sorting';
import {
    PSEUDOCODE_FIBONACCI, PSEUDOCODE_MAX_SUBARRAY,
    PSEUDOCODE_FIBONACCI_TOP_DOWN, PSEUDOCODE_MAX_SUBARRAY_TOP_DOWN,
    PSEUDOCODE_JUMP_GAME, PSEUDOCODE_LCS, PSEUDOCODE_LCS_TOP_DOWN,
    PSEUDOCODE_EDIT_DISTANCE, PSEUDOCODE_EDIT_DISTANCE_TOP_DOWN,
    PSEUDOCODE_SUBSET_SUM, PSEUDOCODE_SUBSET_SUM_TOP_DOWN,
    PSEUDOCODE_KNAPSACK, PSEUDOCODE_KNAPSACK_TOP_DOWN,
    PSEUDOCODE_LAS,
    DPAlgorithmType, DPApproach
} from '@/types/dp';
import { clsx } from 'clsx';
import { Code } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface PseudocodeViewerProps {
  activeLine: number | number[];
  algorithm: AlgorithmType | SortingAlgorithmType | DPAlgorithmType;
  isDirected?: boolean;
  dpApproach?: DPApproach;
}

const ALGORITHM_RUNTIMES: Record<string, string> = {
    // Graph Algorithms
    [AlgorithmType.DFS]: "\\mathcal{O}(n+m)",
    [AlgorithmType.BFS]: "\\mathcal{O}(n+m)",
    [AlgorithmType.DIJKSTRA]: "\\mathcal{O}((n+m) \\cdot \\log n)",
    [AlgorithmType.BELLMAN_FORD]: "\\mathcal{O}(n \\cdot m)",
    [AlgorithmType.PRIM]: "\\mathcal{O}((n+m) \\cdot \\log n)",
    [AlgorithmType.KRUSKAL]: "\\mathcal{O}(m \\log m)",
    [AlgorithmType.BORUVKA]: "\\mathcal{O}((n+m) \\cdot \\log n)",
    [AlgorithmType.TARJAN]: "\\mathcal{O}(m)",
    [AlgorithmType.EULER]: "\\mathcal{O}(m)",
    [AlgorithmType.GREEDY_MATCHING]: "\\mathcal{O}(m)",
    [AlgorithmType.HOPCROFT_KARP]: "\\mathcal{O}(m\\sqrt{n})",
    [AlgorithmType.GREEDY_COLORING]: "\\mathcal{O}(n+m)",
    [AlgorithmType.SMALLEST_LAST_COLORING]: "\\mathcal{O}(n+m)",
    [AlgorithmType.FORD_FULKERSON]: "\\mathcal{O}(n \\cdot m \\cdot \\text{maxCapacity})",
    [AlgorithmType.LONG_PATH]: "\\mathcal{O}(\\lambda(2e)^kkm)",
    [AlgorithmType.HAMILTON_PATH]: "\\mathcal{O}(n^2 \\cdot 2^n)",
    [AlgorithmType.MINIMUM_EDGE_CUT]: "\\mathcal{O}(\\lambda n^4)",
    [AlgorithmType.SMALLEST_ENCLOSING_DISK]: "\\mathcal{O}(n \\cdot \\log n)",
    [AlgorithmType.JARVIS_WRAP]: "\\mathcal{O}(n \\cdot h)",
    [AlgorithmType.LOCAL_REPAIR]: "\\mathcal{O}(n \\cdot \\log n)",
    [AlgorithmType.FINDING_DUPLICATES_HASH]: "\\mathcal{O}(n)",
    [AlgorithmType.BLOOM_FILTER]: "",
    [AlgorithmType.FINDING_DUPLICATES_FLOYD]: "\\mathcal{O}(n)",

    // Sorting Algorithms
    [SortingAlgorithmType.BUBBLE_SORT]: "\\mathcal{O}(n^2)",
    [SortingAlgorithmType.SELECTION_SORT]: "\\mathcal{O}(n^2)",
    [SortingAlgorithmType.INSERTION_SORT]: "\\mathcal{O}(n^2)",
    [SortingAlgorithmType.MERGE_SORT]: "\\mathcal{O}(n \\log n)",
    [SortingAlgorithmType.QUICK_SORT]: "\\mathcal{O}(n^2)",
    [SortingAlgorithmType.HEAP_SORT]: "\\mathcal{O}(n \\log n)",

    // DP Algorithms
    [DPAlgorithmType.FIBONACCI]: "\\mathcal{O}(n)",
    [DPAlgorithmType.MAXIMUM_SUBARRAY_SUM]: "\\mathcal{O}(n)",
    [DPAlgorithmType.JUMP_GAME]: "\\mathcal{O}(n)",
    [DPAlgorithmType.LCS]: "\\mathcal{O}(n \\cdot m)",
    [DPAlgorithmType.EDIT_DISTANCE]: "\\mathcal{O}(n \\cdot m)",
    [DPAlgorithmType.SUBSET_SUM]: "\\mathcal{O}(n \\cdot target)",
    [DPAlgorithmType.KNAPSACK]: " \\mathcal{O}(n \\cdot W)",
    [DPAlgorithmType.LAS]: "\\mathcal{O}(n^2)",
};

const PseudocodeViewer: React.FC<PseudocodeViewerProps> = ({ activeLine, algorithm, isDirected = true, dpApproach = 'BOTTOM_UP' }) => {
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
    // Deep compare or simple length check for array dependency might be needed, 
    // but usually reference change is enough if new array created key-step
  }, [activeLine, algorithm, dpApproach]);

  let lines: { line: number, text: string, indent: number }[] = [];
  
  // Graph Algorithms
  if (Object.values(AlgorithmType).includes(algorithm as AlgorithmType)) {
      const graphAlgo = algorithm as AlgorithmType;
      if (graphAlgo === AlgorithmType.DIJKSTRA) {
          lines = isDirected ? PSEUDOCODE_DIJKSTRA : PSEUDOCODE_DIJKSTRA_UNDIRECTED;
      } else if (graphAlgo === AlgorithmType.BFS) {
          lines = isDirected ? PSEUDOCODE_BFS : PSEUDOCODE_BFS_UNDIRECTED;
      } else if (graphAlgo === AlgorithmType.DFS) {
          lines = isDirected ? PSEUDOCODE_DFS : PSEUDOCODE_DFS_UNDIRECTED;
      } else if (graphAlgo === AlgorithmType.BELLMAN_FORD) {
          lines = isDirected ? PSEUDOCODE_BELLMAN_FORD : PSEUDOCODE_BELLMAN_FORD_UNDIRECTED;
      } else if (graphAlgo === AlgorithmType.PRIM) lines = PSEUDOCODE_PRIM;
      else if (graphAlgo === AlgorithmType.KRUSKAL) lines = PSEUDOCODE_KRUSKAL;
      else if (graphAlgo === AlgorithmType.BORUVKA) lines = PSEUDOCODE_BORUVKA;
      else if (graphAlgo === AlgorithmType.TARJAN) lines = PSEUDOCODE_TARJAN;
      else if (graphAlgo === AlgorithmType.EULER) lines = PSEUDOCODE_EULER;
      else if (graphAlgo === AlgorithmType.GREEDY_MATCHING) lines = PSEUDOCODE_GREEDY_MATCHING;
      else if (graphAlgo === AlgorithmType.HOPCROFT_KARP) lines = PSEUDOCODE_HOPCROFT_KARP;
      else if (graphAlgo === AlgorithmType.GREEDY_COLORING) lines = PSEUDOCODE_GREEDY_COLORING;
      else if (graphAlgo === AlgorithmType.SMALLEST_LAST_COLORING) lines = PSEUDOCODE_SMALLEST_LAST_COLORING;
      else if (graphAlgo === AlgorithmType.FORD_FULKERSON) lines = PSEUDOCODE_FORD_FULKERSON;
      else if (graphAlgo === AlgorithmType.LONG_PATH) lines = PSEUDOCODE_LONG_PATH;
      else if (graphAlgo === AlgorithmType.HAMILTON_PATH) lines = PSEUDOCODE_HAMILTON_PATH;
      else if (graphAlgo === AlgorithmType.MINIMUM_EDGE_CUT) lines = PSEUDOCODE_MIN_EDGE_CUT;
      else if (graphAlgo === AlgorithmType.SMALLEST_ENCLOSING_DISK) lines = PSEUDOCODE_SMALLEST_ENCLOSING_DISK;
      else if (graphAlgo === AlgorithmType.JARVIS_WRAP) lines = PSEUDOCODE_JARVIS_WRAP;
      else if (graphAlgo === AlgorithmType.LOCAL_REPAIR) lines = PSEUDOCODE_LOCAL_REPAIR;
      else if (algorithm === AlgorithmType.FINDING_DUPLICATES_HASH) {
          lines = PSEUDOCODE_FINDING_DUPLICATES_HASH;
      }
      else if (algorithm === AlgorithmType.BLOOM_FILTER) {
          lines = PSEUDOCODE_BLOOM_FILTER;
      }
      else if (algorithm === AlgorithmType.FINDING_DUPLICATES_FLOYD) {
          lines = PSEUDOCODE_FINDING_DUPLICATES_FLOYD;
      }
  }
  // Sorting Algorithms
  else if (Object.values(SortingAlgorithmType).includes(algorithm as SortingAlgorithmType)) {
      const sortAlgo = algorithm as SortingAlgorithmType;
      if (sortAlgo === SortingAlgorithmType.BUBBLE_SORT) lines = PSEUDOCODE_BUBBLE_SORT;
      else if (sortAlgo === SortingAlgorithmType.SELECTION_SORT) lines = PSEUDOCODE_SELECTION_SORT;
      else if (sortAlgo === SortingAlgorithmType.INSERTION_SORT) lines = PSEUDOCODE_INSERTION_SORT;
      else if (sortAlgo === SortingAlgorithmType.MERGE_SORT) lines = PSEUDOCODE_MERGE_SORT;
      else if (sortAlgo === SortingAlgorithmType.QUICK_SORT) lines = PSEUDOCODE_QUICK_SORT;
      else if (sortAlgo === SortingAlgorithmType.HEAP_SORT) lines = PSEUDOCODE_HEAP_SORT;
  }
  // DP Algorithms
  else if (Object.values(DPAlgorithmType).includes(algorithm as DPAlgorithmType)) {
      const dpAlgo = algorithm as DPAlgorithmType;
      if (dpAlgo === DPAlgorithmType.FIBONACCI) {
          lines = dpApproach === 'TOP_DOWN' ? PSEUDOCODE_FIBONACCI_TOP_DOWN : PSEUDOCODE_FIBONACCI;
      }
      else if (dpAlgo === DPAlgorithmType.MAXIMUM_SUBARRAY_SUM) {
          lines = dpApproach === 'TOP_DOWN' ? PSEUDOCODE_MAX_SUBARRAY_TOP_DOWN : PSEUDOCODE_MAX_SUBARRAY;
      }
      else if (dpAlgo === DPAlgorithmType.JUMP_GAME) {
          lines = PSEUDOCODE_JUMP_GAME;
      }
      else if (dpAlgo === DPAlgorithmType.LCS) {
          lines = dpApproach === 'TOP_DOWN' ? PSEUDOCODE_LCS_TOP_DOWN : PSEUDOCODE_LCS;
      }
      else if (dpAlgo === DPAlgorithmType.EDIT_DISTANCE) {
          lines = dpApproach === 'TOP_DOWN' ? PSEUDOCODE_EDIT_DISTANCE_TOP_DOWN : PSEUDOCODE_EDIT_DISTANCE;
      }
      else if (dpAlgo === DPAlgorithmType.SUBSET_SUM) {
          lines = dpApproach === 'TOP_DOWN' ? PSEUDOCODE_SUBSET_SUM_TOP_DOWN : PSEUDOCODE_SUBSET_SUM;
      }
      else if (dpAlgo === DPAlgorithmType.KNAPSACK) {
          lines = dpApproach === 'TOP_DOWN' ? PSEUDOCODE_KNAPSACK_TOP_DOWN : PSEUDOCODE_KNAPSACK;
      }
      else if (dpAlgo === DPAlgorithmType.LAS) {
          lines = PSEUDOCODE_LAS;
      }
  }

  const runtime = ALGORITHM_RUNTIMES[algorithm];

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-full">
      <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Code size={14} />
          <span>{algorithm === 'EULER' ? 'EULER TOUR' : algorithm === 'GREEDY_MATCHING' ? 'GREEDY MATCHING' : algorithm === 'HOPCROFT_KARP' ? 'HOPCROFT-KARP' : algorithm === 'HAMILTON_PATH' ? 'HAMILTON CYCLE' : algorithm.replace(/_/g, ' ')}</span>
        </div>
        {runtime && (
             <span className="text-xs text-blue-300">
                <InlineMath math={runtime} />
             </span>
        )}
      </div>
      <div className="p-4 overflow-auto flex-1" ref={containerRef}>
        <div className="font-mono text-sm space-y-0.5">
          {lines.map((item, index) => {
            const isActive = Array.isArray(activeLine) ? activeLine.includes(item.line) : item.line === activeLine;
            // Ref for the first active line to handle scrolling
            const isFirstActive = Array.isArray(activeLine) ? activeLine[0] === item.line : item.line === activeLine;
            // For empty lines (spacers)
            if (!item.text) return <div key={index} className="h-4" />;
            
            return (
              <div
                key={index}
                ref={isFirstActive ? activeRef : null}
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

          {/* Tarjan Explanation Box */}
          {algorithm === AlgorithmType.TARJAN && (
             <div className="mt-6 p-3 bg-slate-700/30 border border-slate-600/50 rounded-lg text-xs text-slate-300">
                <div className="font-bold mb-2 text-indigo-300 uppercase tracking-wider text-[10px]">Conditions</div>
                <div className="space-y-3">
                   <div className="flex items-start gap-2">
                       <div className="mt-0.5">
                         <span className="font-semibold text-slate-200 block mb-0.5">Articulation Point</span> 
                         <ul className="list-disc pl-3 space-y-1 text-slate-400 marker:text-slate-600">
                            <li>For non-root <InlineMath math="u"/>: if child <InlineMath math="v"/> has <InlineMath math="low[v] \ge dfs[u]"/></li>
                            <li>For root <InlineMath math="u"/>: if it has <InlineMath math="> 1"/> child in DFS tree</li>
                         </ul>
                      </div>
                   </div>
                   <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                         <span className="font-semibold text-slate-200 block mb-0.5">Bridge</span> 
                         <span className="text-slate-400">If edge <InlineMath math="(u, v)"/> satisfies <InlineMath math="low[v] > dfs[u]"/></span>
                      </div>
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PseudocodeViewer;
