
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useAlgorithmsTheme } from '@/context/AlgorithmsThemeContext';
import ThemeToggle from '@/components/visualizer/ThemeToggle';

export type VisualizerMode = 'GRAPH' | 'SORTING' | 'DP' | 'TREES' | 'TARJAN' | 'EULER' | 'GREEDY_MATCHING' | 'HOPCROFT_KARP' | 'GRAPH_COLORING' | 'FORD_FULKERSON' | 'LONG_PATH' | 'HAMILTON_PATH' | 'MINIMUM_EDGE_CUT' | 'SMALLEST_ENCLOSING_DISK' | 'JARVIS_WRAP' | 'FINDING_DUPLICATES_HASH' | 'METRIC_TSP';

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
  const { theme } = useAlgorithmsTheme();
  const isLight = theme === 'light';

  return (
    <header className={clsx(
      "border-b px-4 py-2 grid grid-cols-[auto_1fr_auto] items-center sticky top-0 z-40 shadow-md gap-4 transition-colors duration-200",
      isLight ? "bg-white/95 backdrop-blur-md border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800"
    )}>
      
      {/* 1. Back Button */}
      <div className="flex items-center">
         {onBack ? (
            <button 
                onClick={onBack}
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors",
                  isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
            >
                <ArrowLeft size={18} />
                <span className="font-medium text-sm">Back</span>
            </button>
         ) : (
             <Link href="/" className={clsx(
               "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors",
               isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-slate-400 hover:text-white hover:bg-slate-800"
             )}>
                <ArrowLeft size={18} />
                <span className="font-medium text-sm">Back</span>
             </Link>
         )}
      </div>
      
      {/* 3. Algorithm Switcher */}
      <div className="flex-1 overflow-hidden relative group flex justify-center">
        <div className={clsx(
          "flex p-1 rounded-lg border overflow-x-auto max-w-full w-fit no-scrollbar transition-colors",
          isLight ? "bg-slate-100 border-slate-200" : "bg-slate-800 border-slate-700"
        )}>
            {algorithms.map((algo) => {
              const isActive = currentAlgorithm === algo;
              return (
                <button
                    key={algo}
                    onClick={() => setAlgorithm(algo)}
                    className={clsx(
                    "relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap z-10",
                    isActive 
                      ? "text-white" 
                      : (isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60" : "text-slate-400 hover:text-white hover:bg-slate-700/50")
                    )}
                >
                    {isActive && (
                      <motion.div
                        layoutId="activeAlgorithm"
                        className="absolute inset-0 bg-indigo-600 rounded-md -z-10 shadow-sm"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {algo === 'EULER' ? 'EULER TOUR' : algo === 'GREEDY_MATCHING' ? 'GREEDY MATCHING' : algo === 'HOPCROFT_KARP' ? 'HOPCROFT-KARP' : algo === 'HAMILTON_PATH' ? 'HAMILTON CYCLE' : algo === 'METRIC_TSP' ? 'METRIC TSP 2-APPROX' : algo === 'METRIC_TSP_15' ? 'METRIC TSP 1.5-APPROX' : algo.replace(/_/g, ' ')}
                </button>
              );
            })}
        </div>
      </div>

      {/* 4. Controls */}
      <div className="flex items-center gap-2 justify-self-end">
           {/* Directed/Undirected Segmented Control */}
           <div className={clsx("transition-all duration-300 overflow-hidden", showDirectionToggle ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0 pointer-events-none")}>
               <div className={clsx(
                 "flex p-1 rounded-lg border mr-2 transition-colors",
                 isLight ? "bg-slate-100 border-slate-200" : "bg-slate-800 border-slate-700"
               )}>
                   <button
                      onClick={() => setIsDirected && setIsDirected(true)}
                      className={clsx(
                          "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                          isDirected 
                              ? (isLight ? "bg-white text-slate-900 shadow-sm" : "bg-slate-600 text-white shadow-sm") 
                              : (isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-500 hover:text-slate-300")
                      )}
                   >
                      Directed
                   </button>
                   <button
                      onClick={() => setIsDirected && setIsDirected(false)}
                      className={clsx(
                          "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                          !isDirected 
                              ? (isLight ? "bg-white text-slate-900 shadow-sm" : "bg-slate-600 text-white shadow-sm") 
                              : (isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-500 hover:text-slate-300")
                      )}
                   >
                      Undirected
                   </button>
               </div>
           </div>

           {onGenerateNew && (
               <button 
                  onClick={onGenerateNew}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors border whitespace-nowrap",
                    isLight 
                      ? "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm" 
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
                  )}
               >
                 <RotateCcw size={16} /> 
                  {['GRAPH', 'TARJAN', 'EULER', 'GREEDY_MATCHING', 'HOPCROFT_KARP', 'GRAPH_COLORING', 'FORD_FULKERSON', 'LONG_PATH', 'HAMILTON_PATH', 'MINIMUM_EDGE_CUT', 'METRIC_TSP'].includes(mode) ? 'New Graph' : 'New Data'}
               </button>
           )}

           {/* Theme Toggle Button (Top Right Corner) */}
           <ThemeToggle size="sm" />
      </div>
    </header>
  );
};

export default VisualizerHeader;
