
import React, { useState, useEffect, useCallback } from 'react';
import VisualizerHeader from '@/components/visualizer/VisualizerHeader';
import PseudocodeViewer from '@/components/visualizer/PseudocodeViewer';
import { SortingAlgorithmType, SortingStep, SortableItem } from '@/types/sorting';
import { 
    calculateBubbleSortSteps, calculateSelectionSortSteps,
    calculateInsertionSortSteps, calculateMergeSortSteps,
    calculateQuickSortSteps, calculateHeapSortSteps
} from '@/utils/sortingUtils';
import { Play, ArrowRight, ArrowLeft, SkipForward, SkipBack } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface SortingModeProps {
  mode: 'GRAPH' | 'SORTING';
  setMode: (mode: 'GRAPH' | 'SORTING') => void;
}

const RecursionStackPanel: React.FC<{ stack: string[] }> = ({ stack }) => {
    const stackRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll to top when stack changes
    React.useEffect(() => {
        if (stackRef.current) {
            stackRef.current.scrollTop = 0;
        }
    }, [stack]);

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden mt-4">
            <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-purple-400 uppercase tracking-wider">
                Recursion Stack
            </div>
            <div 
            ref={stackRef}
            className="p-2 overflow-auto max-h-60 flex flex-col gap-1"
            >
                <AnimatePresence initial={false}>
                    {stack.length === 0 ? (
                        <div className="text-slate-600 text-center text-xs py-4 italic">Empty</div>
                    ) : (
                        [...stack].reverse().map((call, idx) => (
                            <motion.div
                                key={`${call}-${stack.length - 1 - idx}`}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-purple-900/30 border-l-2 border-purple-500 px-3 py-2 rounded text-sm text-purple-200 font-mono shrink-0"
                            >
                                {call}
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const SortingMode: React.FC<SortingModeProps> = ({ mode, setMode }) => {
  // State
  const [algorithm, setAlgorithm] = useState<SortingAlgorithmType>(SortingAlgorithmType.BUBBLE_SORT);
  const [steps, setSteps] = useState<SortingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const ALGORITHMS = Object.values(SortingAlgorithmType);

  const generateNewData = useCallback(() => {
    setIsAutoPlaying(false);
    const size = 12;
    // Generate items with unique IDs
    const newArray: SortableItem[] = Array.from({ length: size }, (_, i) => ({
        id: `item-${Date.now()}-${i}`,
        value: Math.floor(Math.random() * 20) + 1
    }));
    
    let calculatedSteps: SortingStep[] = [];
    if (algorithm === SortingAlgorithmType.BUBBLE_SORT) {
        calculatedSteps = calculateBubbleSortSteps(newArray);
    } else if (algorithm === SortingAlgorithmType.SELECTION_SORT) {
        calculatedSteps = calculateSelectionSortSteps(newArray);
    } else if (algorithm === SortingAlgorithmType.INSERTION_SORT) {
        calculatedSteps = calculateInsertionSortSteps(newArray);
    } else if (algorithm === SortingAlgorithmType.MERGE_SORT) {
        calculatedSteps = calculateMergeSortSteps(newArray);
    } else if (algorithm === SortingAlgorithmType.QUICK_SORT) {
        calculatedSteps = calculateQuickSortSteps(newArray);
    } else if (algorithm === SortingAlgorithmType.HEAP_SORT) {
        calculatedSteps = calculateHeapSortSteps(newArray);
    }

    setSteps(calculatedSteps);
    setCurrentStepIndex(0);
  }, [algorithm]);

  useEffect(() => {
    generateNewData();
  }, [generateNewData]);

  // Auto Play Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAutoPlaying && currentStepIndex < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 500);
    } else {
      setIsAutoPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentStepIndex, steps.length]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleJumpToEnd = () => {
      setCurrentStepIndex(steps.length - 1);
  };

  const handleReset = () => {
      setIsAutoPlaying(false);
      setCurrentStepIndex(0);
  };

  const currentStep = steps[currentStepIndex];

  if (!currentStep) return <div className="h-full flex items-center justify-center text-slate-400">Loading...</div>;

  // Render Heap Tree for Heapsort
  const renderHeap = () => {
      if (algorithm !== SortingAlgorithmType.HEAP_SORT) return null;
      
      const arr = currentStep.array;
      // Heapsort sorts in place, usually the heap shrinks.
      // We can infer heap size from the step description or just assume the unsorted part is the heap?
      // Actually, in our implementation, we track heapSize implicitly or explicitly.
      // But for visualization, let's just draw the tree structure for the first N elements.
      // Or better, draw the whole array as a tree, but dim the sorted parts.
      
      // Let's try to infer heap size.
      // If we are in the "Extract Max" phase, the heap size is decreasing.
      // The sorted elements are at the end.
      // We can check the 'invariant' highlights which mark the sorted suffix.
      const invariantHighlight = currentStep.highlights.find(h => h.color === 'invariant');
      const sortedStartIndex = invariantHighlight && invariantHighlight.indices.length > 0 
          ? Math.min(...invariantHighlight.indices) 
          : arr.length;
      
      const heapSize = currentStep.description === "Sorted" ? 0 : sortedStartIndex;


      const nodes = arr.slice(0, heapSize).map((item, idx) => {
          const level = Math.floor(Math.log2(idx + 1));
          const levelWidth = Math.pow(2, level);
          const positionInLevel = idx + 1 - levelWidth;
          
          const x = (positionInLevel + 0.5) * (100 / levelWidth); // Percent based
          const y = level * 60 + 40;

          const highlight = currentStep.highlights.find(h => h.indices.includes(idx));
          let bgColor = "bg-slate-700";
          let borderColor = "border-slate-600";
          
          if (highlight?.color === 'compare') { bgColor = "bg-yellow-500"; borderColor = "border-yellow-600"; }
          else if (highlight?.color === 'swap') { bgColor = "bg-orange-500"; borderColor = "border-orange-600"; } // Changed red to orange
          else if (highlight?.color === 'pivot') { bgColor = "bg-purple-500"; borderColor = "border-purple-600"; }
          
          return { ...item, x, y, idx, bgColor, borderColor };
      });

      return (
          <div className="relative w-full h-[300px] border border-slate-800 rounded-xl bg-slate-900/30 mt-4 overflow-hidden">
              <div className="absolute top-2 left-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Max Heap Visualization</div>
              <svg className="absolute inset-0 w-full h-full">
                  {nodes.map(node => {
                      const leftChildIdx = 2 * node.idx + 1;
                      const rightChildIdx = 2 * node.idx + 2;
                      const lines = [];
                      if (leftChildIdx < nodes.length) {
                          const child = nodes[leftChildIdx];
                          lines.push(<line key={`l-${node.id}`} x1={`${node.x}%`} y1={node.y} x2={`${child.x}%`} y2={child.y} stroke="#475569" strokeWidth="2" />);
                      }
                      if (rightChildIdx < nodes.length) {
                          const child = nodes[rightChildIdx];
                          lines.push(<line key={`r-${node.id}`} x1={`${node.x}%`} y1={node.y} x2={`${child.x}%`} y2={child.y} stroke="#475569" strokeWidth="2" />);
                      }
                      return lines;
                  })}
              </svg>
              {nodes.map(node => (
                  <motion.div 
                    layoutId={`heap-${node.id}`}
                    key={node.id}
                    className={clsx(
                        "absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 shadow-lg",
                        node.bgColor, node.borderColor
                    )}
                    style={{ left: `${node.x}%`, top: node.y }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                      {node.value}
                      <span className="absolute -top-5 text-[10px] text-slate-400 font-mono font-normal">
                          {node.idx + 1}
                      </span>
                  </motion.div>
              ))}
          </div>
      );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <VisualizerHeader 
        mode={mode}
        setMode={setMode}
        algorithms={ALGORITHMS}
        currentAlgorithm={algorithm}
        setAlgorithm={(algo: string) => setAlgorithm(algo as SortingAlgorithmType)}
        onGenerateNew={generateNewData}
      />

      <main className="flex-1 p-4 pt-6 flex gap-6 items-start">
        
        {/* Left Column: Visualization */}
        <div className="flex flex-col gap-2 w-auto shrink-0 sticky top-24 z-30">
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 shadow-xl overflow-hidden w-fit flex flex-col">
            
            {/* Canvas Area */}
            <div className="relative w-[600px] min-h-[420px] bg-slate-950 flex flex-col items-center justify-start p-8 gap-8">
               
               {/* Array Visualization (Boxes) */}
               <div className="flex gap-2 justify-center items-center w-full h-20 mt-10">
                   <AnimatePresence mode='popLayout'>
                   {currentStep.array.map((item, idx) => {
                       const highlight = currentStep.highlights.find(h => h.indices.includes(idx));
                       let bgColor = "bg-slate-800";
                       let borderColor = "border-slate-700";
                       let textColor = "text-slate-300";

                       if (highlight?.color === 'compare') { bgColor = "bg-yellow-500/20"; borderColor = "border-yellow-500"; textColor = "text-yellow-200"; }
                       else if (highlight?.color === 'swap') { bgColor = "bg-orange-500/20"; borderColor = "border-orange-500"; textColor = "text-orange-200"; }
                       else if (highlight?.color === 'sorted') { bgColor = "bg-green-500/20"; borderColor = "border-green-500"; textColor = "text-green-200"; }
                       else if (highlight?.color === 'pivot') { bgColor = "bg-purple-500/20"; borderColor = "border-purple-500"; textColor = "text-purple-200"; }
                       else if (highlight?.color === 'invariant') { bgColor = "bg-emerald-900/40"; borderColor = "border-emerald-700"; textColor = "text-emerald-400"; }
                       else if (highlight?.color === 'default') { bgColor = "bg-slate-700"; borderColor = "border-slate-600"; }

                       // Pointers (default target is 'main' or undefined)
                       const activePointers = currentStep.pointers?.filter(p => (p.target === 'main' || !p.target) && p.index === idx) || [];

                       return (
                           <motion.div 
                               layout
                               layoutId={item.id}
                               key={item.id}
                               initial={{ opacity: 0, scale: 0.8 }}
                               animate={{ opacity: 1, scale: 1 }}
                               exit={{ opacity: 0, scale: 0.8 }}
                               transition={{ type: "spring", stiffness: 300, damping: 25 }}
                               className={clsx("w-10 h-10 flex items-center justify-center rounded-lg font-bold border-2 shadow-sm relative z-10", bgColor, borderColor, textColor)}
                           >
                               {/* Pointers Rendering */}
                               {activePointers.length > 0 && (
                                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                                       <span className="text-xs font-bold text-indigo-400 whitespace-nowrap bg-slate-900/80 px-1.5 py-0.5 rounded border border-indigo-500/30">
                                           {activePointers.map(p => p.label).join(',')}
                                       </span>
                                       <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-indigo-400"></div>
                                   </div>
                               )}

                               {item.value}
                               {/* Index label */}
                               <span className="absolute -bottom-6 text-[10px] text-slate-600 font-mono">{idx + 1}</span>
                           </motion.div>
                       );
                   })}
                   </AnimatePresence>
               </div>

           {/* Auxiliary Array Visualization */}
           {currentStep.auxiliaryArray && currentStep.auxiliaryArray.length > 0 && (
               <div className="flex flex-col items-center gap-2 mt-8">
                   <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Auxiliary Array B</div>
                   <div className="flex gap-2 justify-center items-center">
                       {currentStep.auxiliaryArray.map((item, idx) => {
                           // Auxiliary Pointers
                           const activeAuxPointers = currentStep.pointers?.filter(p => p.target === 'aux' && p.index === idx) || [];

                           return (
                            <motion.div 
                                layout
                                layoutId={item.id !== 'empty' ? item.id : undefined}
                                key={item.id === 'empty' ? `empty-${idx}` : item.id}
                                className={clsx(
                                    "w-10 h-10 flex items-center justify-center rounded-lg font-bold border-2 shadow-sm relative transition-all duration-300",
                                    item.id === 'empty' ? "bg-slate-900/50 border-slate-800 text-transparent" : "bg-slate-800 border-slate-700 text-slate-300"
                                )}
                            >
                                {/* Auxiliary Pointers Rendering */}
                                {activeAuxPointers.length > 0 && (
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                                        <span className="text-xs font-bold text-indigo-400 whitespace-nowrap bg-slate-900/80 px-1.5 py-0.5 rounded border border-indigo-500/30">
                                            {activeAuxPointers.map(p => p.label).join(',')}
                                        </span>
                                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-indigo-400"></div>
                                    </div>
                                )}

                                {item.id !== 'empty' && item.value}
                                <span className="absolute -bottom-6 text-[10px] text-slate-600 font-mono">{idx + 1}</span>
                            </motion.div>
                        )})}
                   </div>
               </div>
           )}

               {/* Toast */}
               <div className="mt-auto bg-slate-800/90 backdrop-blur-md border border-slate-600 shadow-2xl flex items-center justify-center transition-all px-10 py-3 rounded-full gap-4 min-w-[300px] z-20">
                 <div className="flex items-center gap-3 shrink-0">
                     <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                     <span className="text-sm font-medium text-white whitespace-nowrap">{currentStep.description}</span>
                 </div>
               </div>
            </div>

            {/* Controls */}
            <div className="border-t border-slate-800 p-2 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button onClick={handlePrev} disabled={currentStepIndex === 0} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 disabled:opacity-30 transition-colors"><ArrowLeft size={20} /></button>
                <div className="text-sm font-mono text-slate-400 w-32 text-center">Step {currentStep.stepId} / {steps.length - 1}</div>
                <button onClick={handleNext} disabled={currentStepIndex === steps.length - 1} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 disabled:opacity-30 transition-colors"><ArrowRight size={20} /></button>
              </div>
              <div className="flex gap-1">
                <button onClick={handleReset} disabled={currentStepIndex === 0} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors border border-slate-700 text-slate-200 disabled:opacity-50"><SkipBack size={16} /> Reset</button>
                <button onClick={() => setIsAutoPlaying(!isAutoPlaying)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isAutoPlaying ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}>{isAutoPlaying ? 'Pause' : <><Play size={16} fill="currentColor" /> Auto Play</>}</button>
                <button onClick={handleJumpToEnd} disabled={currentStepIndex === steps.length - 1} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors border border-slate-700 text-slate-200 disabled:opacity-50"><SkipForward size={16} /> Jump to End</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pseudocode */}
        <div className="flex flex-col gap-6 flex-1 min-w-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={algorithm}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div className="shrink-0 h-auto">
                 <PseudocodeViewer 
                   activeLine={currentStep.lineNumber} 
                   algorithm={algorithm} 
                 />
              </div>
              
              {/* Heapsort Tree Visualization Panel */}
              {algorithm === SortingAlgorithmType.HEAP_SORT && renderHeap()}

              {/* Recursion Stack Panel */}
              {(algorithm === SortingAlgorithmType.QUICK_SORT || algorithm === SortingAlgorithmType.MERGE_SORT) && (
                  <RecursionStackPanel stack={currentStep.recursionStack || []} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
};

export default SortingMode;
