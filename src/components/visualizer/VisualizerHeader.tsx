
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export type VisualizerMode = 'GRAPH' | 'SORTING' | 'DP' | 'TREES' | 'TARJAN' | 'EULER' | 'GREEDY_MATCHING' | 'HOPCROFT_KARP' | 'GRAPH_COLORING' | 'FORD_FULKERSON' | 'LONG_PATH' | 'HAMILTON_PATH' | 'MINIMUM_EDGE_CUT' | 'SMALLEST_ENCLOSING_DISK' | 'JARVIS_WRAP';

interface VisualizerHeaderProps {
  mode: VisualizerMode;
  setMode: (mode: VisualizerMode) => void;
  algorithms: string[];
  currentAlgorithm: string;
  setAlgorithm: (algo: string) => void;
  onGenerateNew?: () => void;
  onBack?: () => void;
  // Graph specific controls
  showDirectionToggle?: boolean;
  isDirected?: boolean;
  setIsDirected?: (val: boolean) => void;
}

const VisualizerHeader: React.FC<VisualizerHeaderProps> = ({
  mode,
  // setMode, // Unused
  algorithms,
  currentAlgorithm,
  setAlgorithm,
  onGenerateNew,
  onBack,
  showDirectionToggle = false,
  isDirected = true,
  setIsDirected
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 py-2 grid grid-cols-[auto_1fr_auto] items-center sticky top-0 z-40 shadow-md gap-4">
      
      {/* 1. Back Button */}
      <div className="flex items-center">
         {onBack ? (
            <button 
                onClick={onBack}
                className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
                <ArrowLeft size={18} />
                <span className="font-medium text-sm">Back</span>
            </button>
         ) : (
             <Link href="/" className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <ArrowLeft size={18} />
                <span className="font-medium text-sm">Back</span>
             </Link>
         )}
      </div>
      
      {/* 3. Algorithm Switcher */}
      <div className="flex-1 overflow-hidden relative group flex justify-center">
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 overflow-x-auto max-w-full w-fit no-scrollbar">
            {algorithms.map((algo) => {
              const isActive = currentAlgorithm === algo;
              return (
                <button
                    key={algo}
                    onClick={() => setAlgorithm(algo)}
                    className={clsx(
                    "relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap z-10",
                    isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    )}
                >
                    {isActive && (
                      <motion.div
                        layoutId="activeAlgorithm"
                        className="absolute inset-0 bg-indigo-600 rounded-md -z-10 shadow-sm"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {algo === 'EULER' ? 'EULER TOUR' : algo === 'GREEDY_MATCHING' ? 'GREEDY MATCHING' : algo === 'HOPCROFT_KARP' ? 'HOPCROFT-KARP' : algo === 'HAMILTON_PATH' ? 'HAMILTON CYCLE' : algo.replace(/_/g, ' ')}
                </button>
              );
            })}
        </div>
      </div>

      {/* 4. Controls */}
      <div className="flex items-center gap-2 justify-self-end">
           {/* Directed/Undirected Segmented Control */}
           <div className={clsx("transition-all duration-300 overflow-hidden", showDirectionToggle ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0 pointer-events-none")}>
               <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 mr-2">
                   <button
                      onClick={() => setIsDirected && setIsDirected(true)}
                      className={clsx(
                          "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                          isDirected 
                              ? "bg-slate-600 text-white shadow-sm" 
                              : "text-slate-500 hover:text-slate-300"
                      )}
                   >
                      Directed
                   </button>
                   <button
                      onClick={() => setIsDirected && setIsDirected(false)}
                      className={clsx(
                          "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                          !isDirected 
                              ? "bg-slate-600 text-white shadow-sm" 
                              : "text-slate-500 hover:text-slate-300"
                      )}
                   >
                      Undirected
                   </button>
               </div>
           </div>

           {onGenerateNew && (
               <button 
                  onClick={onGenerateNew}
                  className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700 whitespace-nowrap"
               >
                 <RotateCcw size={16} /> 
                  {['GRAPH', 'TARJAN', 'EULER', 'GREEDY_MATCHING', 'HOPCROFT_KARP', 'GRAPH_COLORING', 'FORD_FULKERSON', 'LONG_PATH', 'HAMILTON_PATH', 'MINIMUM_EDGE_CUT'].includes(mode) ? 'New Graph' : 'New Data'}
               </button>
           )}
      </div>
    </header>
  );
};

export default VisualizerHeader;
