import React, { useState, useEffect, useCallback } from 'react';
import VisualizerHeader from '@/components/visualizer/VisualizerHeader';
import PseudocodeViewer from '@/components/visualizer/PseudocodeViewer';
import { DPAlgorithmType, DPStep, DPApproach } from '@/types/dp';
import { 
    calculateFibonacciBottomUp, calculateFibonacciTopDown, 
    calculateMaxSubarrayBottomUp, calculateMaxSubarrayTopDown,
    calculateJumpGameBottomUp,
    calculateLCSBottomUp,
    calculateLCSTopDown,
    calculateEditDistanceBottomUp,
    calculateEditDistanceTopDown,
    calculateSubsetSumBottomUp,
    calculateSubsetSumTopDown,
    calculateKnapsackBottomUp,
    calculateKnapsackTopDown,
    calculateLASBottomUp
} from '@/utils/dpUtils';
import { DP_EXPLANATIONS } from '@/utils/dpExplanations';
import { Play, ArrowRight, ArrowLeft, SkipForward, SkipBack, Layers, BookOpen } from 'lucide-react';
import { clsx } from "clsx";
import { motion, AnimatePresence } from 'framer-motion';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

const LatexRenderer = ({ children }: { children: string }) => {
    // Split by $ to find latex segments
    const parts = children.split('$');
    return (
        <span>
            {parts.map((part, index) => {
                if (index % 2 === 1) {
                    // Inside $...$ -> Math
                    return <InlineMath key={index} math={part} />;
                }
                // Outside -> Text
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

import { VisualizerMode } from '@/components/visualizer/VisualizerHeader';

interface DPModeProps {
  mode: VisualizerMode;
  setMode: (mode: VisualizerMode) => void;
  onBack?: () => void;
}

const DPMode: React.FC<DPModeProps> = ({ mode, setMode, onBack }) => {
  // State
  const [algorithm, setAlgorithm] = useState<DPAlgorithmType>(DPAlgorithmType.FIBONACCI);
  const [approach, setApproach] = useState<DPApproach>('BOTTOM_UP');
  
  const [fibN, setFibN] = useState(9);
  const [inputArray, setInputArray] = useState<number[]>([1, 2, 5, 8, 3]); // Default for Subset Sum / others

  // LCS Input State
  const [lcsStringA, setLcsStringA] = useState("TIGER");
  const [lcsStringB, setLcsStringB] = useState("ZIEGE");

  // Subset Sum Input State
  const [subsetTarget, setSubsetTarget] = useState(9);

  // Knapsack Input State
  const [knapsackWeights, setKnapsackWeights] = useState<number[]>([1, 3, 4, 5]);
  const [knapsackValues, setKnapsackValues] = useState<number[]>([1, 4, 5, 7]);
  const [knapsackCapacity, setKnapsackCapacity] = useState(7);
  const [rawWeightsStr, setRawWeightsStr] = useState("1, 3, 4, 5");
  const [rawValuesStr, setRawValuesStr] = useState("1, 4, 5, 7");
  const [rawCapacityStr, setRawCapacityStr] = useState("7");

  const [steps, setSteps] = useState<DPStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  
  // Raw Input States for smoother editing
  const [rawInputStr, setRawInputStr] = useState(inputArray.join(', '));
  const [rawTargetStr, setRawTargetStr] = useState(subsetTarget.toString());
  
   // Sync raw inputs when algorithm changes (restoring defaults)
   useEffect(() => {
      // Always reset to defaults for the selected algorithm
      if (algorithm === DPAlgorithmType.FIBONACCI) {
         setFibN(9); 
      } else if (algorithm === DPAlgorithmType.MAXIMUM_SUBARRAY_SUM) {
         const def = [-2, 1, -3, 4, -1, 2, 1, -5, 4].slice(0, 9);
         setInputArray(def);
         setRawInputStr(def.join(', '));
      } else if (algorithm === DPAlgorithmType.JUMP_GAME) {
         const def = [2, 1, 1, 4, 2, 5, 1, 3, 7];
         setInputArray(def);
         setRawInputStr(def.join(', '));
      } else if (algorithm === DPAlgorithmType.LAS) {
         const def = [6, 2, 5, 3, 7];
         setInputArray(def);
         setRawInputStr(def.join(', '));
      } else if (algorithm === DPAlgorithmType.SUBSET_SUM) {
          // Subset Sum default
          const def = [1, 2, 5, 8, 3];
          setInputArray(def);
          setRawInputStr(def.join(', '));
          setSubsetTarget(9);
          setRawTargetStr("9");
      } else if (algorithm === DPAlgorithmType.KNAPSACK) {
          // Knapsack default
          setKnapsackWeights([1, 3, 4, 5]);
          setKnapsackValues([1, 4, 5, 7]);
          setKnapsackCapacity(7);
          setRawWeightsStr("1, 3, 4, 5");
          setRawValuesStr("1, 4, 5, 7");
          setRawCapacityStr("7");
      }
      else {
          // Fallback reset
          const def = [1, 2, 3, 4, 5];
          setInputArray(def);
          setRawInputStr(def.join(', '));
      }

   }, [algorithm]); // removed 'approach' to avoid resetting when just toggling approach

  // const scrollRef = useRef<HTMLDivElement>(null);
  
  const ALGORITHMS = Object.values(DPAlgorithmType);

  const generateNewData = useCallback(() => {
    setIsAutoPlaying(false);
    let calculatedSteps: DPStep[] = [];

    if (algorithm === DPAlgorithmType.FIBONACCI) {
        if (approach === 'BOTTOM_UP') {
            calculatedSteps = calculateFibonacciBottomUp(fibN);
        } else {
            calculatedSteps = calculateFibonacciTopDown(fibN);
        }
    } else if (algorithm === DPAlgorithmType.MAXIMUM_SUBARRAY_SUM) {
        if (approach === 'BOTTOM_UP') {
            calculatedSteps = calculateMaxSubarrayBottomUp(inputArray);
        } else {
            calculatedSteps = calculateMaxSubarrayTopDown(inputArray);
        }
    } else if (algorithm === DPAlgorithmType.JUMP_GAME) {
        calculatedSteps = calculateJumpGameBottomUp(inputArray);
    } else if (algorithm === DPAlgorithmType.LCS) {
        if (approach === 'BOTTOM_UP') {
            calculatedSteps = calculateLCSBottomUp(lcsStringA, lcsStringB);
        } else {
            calculatedSteps = calculateLCSTopDown(lcsStringA, lcsStringB);
        }
    } else if (algorithm === DPAlgorithmType.EDIT_DISTANCE) {
        if (approach === 'BOTTOM_UP') {
            calculatedSteps = calculateEditDistanceBottomUp(lcsStringA, lcsStringB);
        } else {
            calculatedSteps = calculateEditDistanceTopDown(lcsStringA, lcsStringB);
        }
    } else if (algorithm === DPAlgorithmType.SUBSET_SUM) {
        if (approach === 'BOTTOM_UP') {
            calculatedSteps = calculateSubsetSumBottomUp(inputArray, subsetTarget);
        } else {
            calculatedSteps = calculateSubsetSumTopDown(inputArray, subsetTarget);
        }
    } else if (algorithm === DPAlgorithmType.KNAPSACK) {
        // Pad inputs to match max length for calculation robustness
        const maxLen = Math.max(knapsackWeights.length, knapsackValues.length);
        const paddedWeights = [...knapsackWeights];
        const paddedValues = [...knapsackValues];
        
        while (paddedWeights.length < maxLen) paddedWeights.push(0);
        while (paddedValues.length < maxLen) paddedValues.push(0);

        if (approach === 'BOTTOM_UP') {
            calculatedSteps = calculateKnapsackBottomUp(paddedWeights, paddedValues, knapsackCapacity);
        } else {
            calculatedSteps = calculateKnapsackTopDown(paddedWeights, paddedValues, knapsackCapacity);
        }
    } else if (algorithm === DPAlgorithmType.LAS) {
        calculatedSteps = calculateLASBottomUp(inputArray);
    }

    setSteps(calculatedSteps);
    setCurrentStepIndex(0);
  }, [algorithm, approach, lcsStringA, lcsStringB, subsetTarget, inputArray, fibN, knapsackWeights, knapsackValues, knapsackCapacity]);

  // Reset steps when approach changes or algorithm changes
  useEffect(() => {
    generateNewData();
  }, [generateNewData]);

  // Ensure we switch to Bottom-Up if Jump Game is selected
  useEffect(() => {
    if (algorithm === DPAlgorithmType.JUMP_GAME && approach === 'TOP_DOWN') {
        setApproach('BOTTOM_UP');
    }
  }, [algorithm, approach]);

  // Auto Play Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAutoPlaying && currentStepIndex < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 700); 
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

  // Auto-scroll the recursion stack
  const stackContainerRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (stackContainerRef.current) {
        stackContainerRef.current.scrollTop = 0;
    }
  }, [currentStep?.stack]); // Trigger on stack change

  // Smart Sticky Scroll Logic
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const currentTRef = React.useRef(0); 
  // const rafRef = React.useRef<number | null>(null);
  const cachedMetricsRef = React.useRef<{
      sidebarHeight: number;
      originalPageY: number;
      containerTop: number;
      viewportHeight: number;
  } | null>(null);

  React.useLayoutEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    // 1. MEASURE PHASE
    // Calculate static properties that don't change on scroll.
    // Call this rarely (mount, resize, step change).
    const measure = () => {
        const viewportHeight = window.innerHeight;
        const rect = sidebar.getBoundingClientRect();
        
        // Recover original page Y by removing current transform effect
        // If currentT is 100, and rect.top is 150, then original visual top without transform was 50.
        // Add scrollY to get absolute document position.
        const currentT = currentTRef.current;
        const scrollY = window.scrollY;
        
        // Note: We must ensure we measure when sidebar is 'relative' roughly in place
        // But since we use transform, layout flow is preserved.
        
        const originalPageY = (rect.top + scrollY) - currentT;
        const sidebarHeight = sidebar.offsetHeight;
        
        const container = sidebar.offsetParent as HTMLElement;
        const containerTop = container ? container.offsetTop : 0;
        
        cachedMetricsRef.current = {
            sidebarHeight,
            originalPageY,
            containerTop,
            viewportHeight
        };
    };

    // 2. SCROLL PHASE
    // Pure calculation, no DOM Measure.
    const onScroll = () => {
        if (!cachedMetricsRef.current) measure();
        const metrics = cachedMetricsRef.current!;
        const { sidebarHeight, originalPageY, viewportHeight } = metrics;
        
        const scrollY = window.scrollY;
        
        const topPadding = 96; 
        const bottomPadding = 24; 

        // Bounds
        // Stick to Bottom: T >= scrollY + ViewportHeight - bottomPadding - Height - OriginalPageY
        const minT = scrollY + viewportHeight - bottomPadding - sidebarHeight - originalPageY;
        
        // Stick to Top: T <= scrollY + topPadding - OriginalPageY
        const maxT = scrollY + topPadding - originalPageY;
        
        let targetT = currentTRef.current;

        if (sidebarHeight + topPadding < viewportHeight) {
             // Short: Stick to Top
             targetT = maxT;
        } else {
             // Tall: Clamp
             targetT = Math.min(Math.max(targetT, minT), maxT);
        }
        
        // Update
        if (targetT !== currentTRef.current) {
            currentTRef.current = targetT;
            // SYNC UPDATE to prevent jitter
            sidebar.style.transform = `translateY(${targetT}px)`;
        }
    };
    
    // Listeners
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure); // re-measure on resize
    
    // Initial Measure & Update
    measure();
    onScroll();

    return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', measure);
    };
  }, [currentStep, algorithm]);

  if (!currentStep) return <div className="h-full flex items-center justify-center text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <VisualizerHeader 
        mode={mode} 
        setMode={setMode}
        algorithms={ALGORITHMS}
        currentAlgorithm={algorithm}
        setAlgorithm={(algo: string) => setAlgorithm(algo as DPAlgorithmType)}
        onBack={onBack}
      />

      <main className="flex-1 p-4 pt-6 flex gap-6 items-start">
        
        {/* Left Column: Visualization */}
        <div ref={sidebarRef} className="flex flex-col gap-2 w-auto shrink-0 z-30">
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 shadow-xl overflow-hidden w-fit flex flex-col">
            
            {/* Canvas Area */}
            <div className="relative w-[600px] min-h-[420px] bg-slate-950 flex flex-col items-center justify-center p-8 gap-12">
               
                {/* 1. Input Array - Old Style (Hidden for Max Subarray & Jump Game) */}
                {currentStep.inputArray && algorithm !== DPAlgorithmType.MAXIMUM_SUBARRAY_SUM && algorithm !== DPAlgorithmType.JUMP_GAME && (
                   <div className="flex flex-col items-center gap-2 w-full">
                       <div className="text-xs font-bold text-slate-500 uppercase tracking-wider self-start pl-4">Input Array (A)</div>
                       <div className="flex gap-2 flex-wrap justify-center">
                           {currentStep.inputArray.map((val, idx) => {
                               const highlight = currentStep.highlights.find(h => h.target === 'input' && h.indices.includes(idx));
                               let borderColor = 'border-slate-700';
                               let bgColor = 'bg-slate-800';
                               let textColor = 'text-slate-400';

                               if (highlight?.type === 'current') { borderColor = 'border-purple-500'; bgColor = 'bg-purple-900/30'; textColor = 'text-purple-300'; }
                               if (highlight?.type === 'read') { borderColor = 'border-blue-500'; bgColor = 'bg-blue-900/30'; textColor = 'text-blue-300'; }

                               return (
                                   <motion.div
                                     key={`input-${idx}`}
                                     initial={{ opacity: 0, y: 10 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     className={clsx(
                                         "w-10 h-10 flex items-center justify-center rounded-lg border-2 font-mono font-bold text-sm relative",
                                         borderColor, bgColor, textColor
                                     )}
                                   >
                                       {val}
                                       <span className="absolute -bottom-5 text-[10px] text-slate-600 font-normal">{idx + 1}</span>
                                   </motion.div>
                               );
                           })}
                       </div>
                   </div>
               )}

               {/* 2. DP Table */}
               <div className="flex flex-col items-center gap-2 w-full max-w-full overflow-auto p-2">

                    
                    {currentStep.gridDimensions ? (
                        // 2D GRID VIEW
                        <div className="flex flex-col gap-4">
                            
                            {/* NEW: Input Array as Grid (For Max Subarray / Jump Game) */}
                            {(algorithm === DPAlgorithmType.MAXIMUM_SUBARRAY_SUM || algorithm === DPAlgorithmType.JUMP_GAME) && currentStep.inputArray && (
                                <div 
                                    className="grid gap-x-1 gap-y-8 relative"
                                    style={{ 
                                        gridTemplateColumns: `min-content repeat(${currentStep.inputArray.length}, min-content)`,
                                    }}
                                >
                                     {/* Header Row (Indices) */}
                                     <div className="w-10 h-10"></div> 
                                     {Array.from({ length: currentStep.inputArray.length }, (_, i) => i).map((val, i) => (
                                          <div key={`input-head-col-${i}`} className="w-10 h-10 flex items-center justify-center font-bold text-slate-500 text-xs">{val + 1}</div>
                                     ))}

                                     {/* Row Label */}
                                     <div className="w-10 h-10 flex items-center justify-center font-bold text-slate-400">A</div>

                                     {/* Data Cells */}
                                     {currentStep.inputArray.map((val, idx) => {
                                         const highlight = currentStep.highlights.find(h => h.target === 'input' && h.indices.includes(idx));
                                         let borderColor = 'border-slate-700';
                                         let bgColor = 'bg-slate-800';
                                         let textColor = 'text-slate-400';
                                         
                                         if (highlight?.type === 'current') { borderColor = 'border-purple-500'; bgColor = 'bg-purple-900/30'; textColor = 'text-purple-300'; }
                                         if (highlight?.type === 'read') { borderColor = 'border-blue-500'; bgColor = 'bg-blue-900/30'; textColor = 'text-blue-300'; }
                                         if (highlight?.type === 'match') { borderColor = 'border-yellow-500'; bgColor = 'bg-yellow-900/30'; textColor = 'text-yellow-300'; }

                                         return (
                                             <motion.div
                                                key={`input-grid-${idx}`}
                                                layout
                                                className={clsx(
                                                    "w-10 h-10 flex items-center justify-center rounded-lg border font-mono font-bold text-sm relative transition-colors duration-300",
                                                    borderColor, bgColor, textColor,
                                                    // Add pulsing glow for matched path in Jump Game
                                                    highlight?.type === 'match' && (algorithm === DPAlgorithmType.JUMP_GAME) && "ring-2 ring-pink-500 ring-offset-2 ring-offset-slate-900 z-10"
                                                )}
                                             >
                                                 {val}
                                             </motion.div>
                                         );
                                     })}

                                     {/* Arrows Overlay for Jump Game Input Grid */}
                                     {algorithm === DPAlgorithmType.JUMP_GAME && currentStep.inputGridArrows && (
                                         <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible" style={{ top: 0, left: 0 }}>
                                             <defs>
                                                 <marker id="arrowhead-jump" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                                     <polygon points="0 0, 6 3, 0 6" fill="#ec4899" />
                                                 </marker>
                                             </defs>
                                             {currentStep.inputGridArrows.map((arrow, i) => {
                                                 const startX = 64 + arrow.from * 44;
                                                 const endX = 64 + arrow.to * 44;
                                                 
                                                 // Row 1 (Header) is 40px height.
                                                 // Gap-y-8 is 32px.
                                                 // Row 2 (Data) starts at 40 + 32 = 72px.
                                                 // Arrow tips should be directly connected to the array cells (top of the cell).
                                                 // Cell top is at y = 72.
                                                 const y = 72;
                                                 
                                                 // Draw an arc
                                                 const dist = Math.abs(endX - startX);
                                                 // Adjust height based on distance, keeping it within the gap (32px).
                                                 // Increase curvature slightly for better visibility.
                                                 const height = Math.min(28, 12 + dist / 12); 
                                                 const midX = (startX + endX) / 2;
                                                 const midY = y - height; 

                                                 return (
                                                     <path 
                                                        key={`jump-arrow-${i}`} 
                                                        d={`M ${startX} ${y} Q ${midX} ${midY} ${endX} ${y}`} 
                                                        stroke="#ec4899" 
                                                        strokeWidth="2" 
                                                        fill="none"
                                                        markerEnd="url(#arrowhead-jump)" 
                                                     />
                                                 );
                                             })}
                                         </svg>
                                     )}
                                </div>
                            )}

                        <div 
                            className="grid gap-1 relative"
                            style={{ 
                                // Extra column for Row Headers (String A)
                                // For Maximum Subarray Sum: remove 1 col for hidden DP[0]
                                gridTemplateColumns: algorithm === DPAlgorithmType.MAXIMUM_SUBARRAY_SUM 
                                    ? `min-content repeat(${currentStep.gridDimensions.cols - 1}, min-content)`
                                    : `min-content repeat(${currentStep.gridDimensions.cols}, min-content)`,
                            }}
                        >
                            {/* SVG Overlay for Long Arrows */}
                            {currentStep.longArrows && (
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
                                    <defs>
                                        <marker id="arrowhead-long" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto">
                                            <polygon points="0 0, 5 2.5, 0 5" fill="#ec4899" />
                                        </marker>
                                    </defs>
                                    {currentStep.longArrows.map((arrow, i) => {
                                         const r1 = Math.floor(arrow.from / currentStep.gridDimensions!.cols);
                                         const c1 = arrow.from % currentStep.gridDimensions!.cols;
                                         const r2 = Math.floor(arrow.to / currentStep.gridDimensions!.cols);
                                         const c2 = arrow.to % currentStep.gridDimensions!.cols;
                                         
                                         // Corner to Corner Logic Modified:
                                         // Stride = 44px
                                         // Cell Top-Left = (Index + 1) * 44
                                         
                                         const x1 = (c1 + 1) * 44 + 30;
                                         const y1 = (r1 + 1) * 44 + 30;
                                         
                                         const x2 = (c2 + 1) * 44 + 10;
                                         const y2 = (r2 + 1) * 44 + 10;
                                         
                                         return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ec4899" strokeWidth="1" markerEnd="url(#arrowhead-long)" />
                                    })}
                                </svg>
                            )}

                            {/* Determine matched rows and cols for highlighting headers */
                            (() => {
                                const matchHighlights = currentStep.highlights.filter(h => h.type === 'match' && h.target === 'dp');
                                const matchedRows = new Set<number>();
                                const matchedCols = new Set<number>();
                                
                                matchHighlights.forEach(h => {
                                    h.indices.forEach(idx => {
                                        const r = Math.floor(idx / currentStep.gridDimensions!.cols);
                                        const c = idx % currentStep.gridDimensions!.cols;
                                        matchedRows.add(r);
                                        matchedCols.add(c);
                                    });
                                });

                                return (
                                    <>
                                         {/* Header Row */}
                                         {/* Only show headers if NOT Max Subarray / Jump Game (because they have headers in the Input Grid above) OR if we decide to repeat them. 
                                             User asked for "same design as DP table", implies headers on DP table too? 
                                             Usually if aligned, one header set is enough, but typically each table has its own headers or they are aligned. 
                                             Let's keep headers for DP table too for clarity, or if they are separate blocks. 
                                             The code wraps them in a flex col gap-4 now. So they are separate. Let's keep headers.
                                         */}
                                         {(algorithm === DPAlgorithmType.LCS || algorithm === DPAlgorithmType.EDIT_DISTANCE || algorithm === DPAlgorithmType.SUBSET_SUM || algorithm === DPAlgorithmType.KNAPSACK || algorithm === DPAlgorithmType.LAS || algorithm === DPAlgorithmType.FIBONACCI || algorithm === DPAlgorithmType.MAXIMUM_SUBARRAY_SUM || algorithm === DPAlgorithmType.JUMP_GAME) && (
                                            <>
                                                {/* Top-Left Corner (Empty) */}
                                                <div className="w-10 h-10"></div> 
                                                
                                                {/* Column 0 Header (Hidden for MSS) */}
                                                {algorithm !== DPAlgorithmType.MAXIMUM_SUBARRAY_SUM && (
                                                    <div className="w-10 h-10 flex items-center justify-center font-bold text-slate-500">
                                                        {(algorithm === DPAlgorithmType.LCS || algorithm === DPAlgorithmType.EDIT_DISTANCE) ? 'ε' : '0'}
                                                    </div>
                                                )}
                                                
                                                {/* Remaining Column Headers */}
                                                {(algorithm === DPAlgorithmType.SUBSET_SUM || algorithm === DPAlgorithmType.KNAPSACK || algorithm === DPAlgorithmType.LAS || algorithm === DPAlgorithmType.FIBONACCI || algorithm === DPAlgorithmType.MAXIMUM_SUBARRAY_SUM || algorithm === DPAlgorithmType.JUMP_GAME) ? (
                                                    // LAS: 0 to n. Here col 0 is 0. Cols from 1 to n correspond to lengths 1 to n.
                                                    // Dimensions: rows = n+1, cols = n+1.
                                                    // Headers should be 1 to n
                                                    // LAS: 0 to n. Here col 0 is 0. Cols from 1 to n correspond to lengths 1 to n.
                                                    // Dimensions: rows = n+1, cols = n+1.
                                                    // Headers should be 1 to n
                                                     Array.from({ length: currentStep.gridDimensions!.cols - 1 }, (_, i) => i + 1).map((val, i) => (
                                                          <div key={`head-col-${i}`} className="w-10 h-10 flex items-center justify-center font-bold text-slate-400">{val}</div>
                                                     ))
                                                ) : (
                                                    // LCS/ED: String B
                                                    lcsStringB.split('').map((char, i) => {
                                                        const colIndex = i + 1; // DP col index (0 is epsilon, 1 is char 0)
                                                        const isMatch = algorithm === DPAlgorithmType.LCS && matchedCols.has(colIndex);
                                                        return (
                                                            <div key={`head-b-${i}`} className={clsx(
                                                                "w-10 h-10 flex items-center justify-center font-bold transition-colors duration-300",
                                                                isMatch ? "text-pink-500 scale-110" : "text-slate-400"
                                                            )}>
                                                                {char}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </>
                                         )}

                                        {currentStep.dpTable.map((val, idx) => {
                                             // For Maximum Subarray Sum: hide DP[0]
                                             if (algorithm === DPAlgorithmType.MAXIMUM_SUBARRAY_SUM && idx === 0) return null;

                                             const highlight = currentStep.highlights.find(h => h.target === 'dp' && h.indices.includes(idx));
                                             let borderColor = 'border-slate-700';
                                             let bgColor = 'bg-slate-800';
                                             let textColor = 'text-slate-400';
                                             const shadow = '';
                                             
                                             if (highlight?.type === 'write') { borderColor = 'border-emerald-500'; bgColor = 'bg-emerald-900/30'; textColor = 'text-emerald-300'; }
                                             if (highlight?.type === 'read') { borderColor = 'border-blue-500'; bgColor = 'bg-blue-900/30'; textColor = 'text-blue-300'; }
                                             if (highlight?.type === 'current') { borderColor = 'border-yellow-500'; bgColor = 'bg-yellow-900/30'; textColor = 'text-yellow-300'; }
                                             if (highlight?.type === 'match') { 
                                                 borderColor = 'border-yellow-500'; 
                                                 bgColor = 'bg-yellow-900/30'; 
                                                 textColor = 'text-yellow-300';
                                             }
            
                                             const row = Math.floor(idx / currentStep.gridDimensions!.cols);
                                             const isFirstCol = idx % currentStep.gridDimensions!.cols === 0;
            
                                             const arrow = currentStep.arrows?.[idx];
                                             let arrowPositionClass = ""; 
                                             
                                             if (arrow === '↘') arrowPositionClass = "top-0 left-0 -translate-x-1/2 -translate-y-1/2"; 
                                             else if (arrow === '↓') arrowPositionClass = "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2";
                                             else if (arrow === '→') arrowPositionClass = "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2";
            
                                             return (
                                                 <React.Fragment key={`grid-${idx}`}>
                                                      {/* Row Header - Only for first column of each row 
                                                          For MSS, we hide index 0, so index 1 becomes the visual start of the row.
                                                      */}
                                                     {(
                                                        (isFirstCol && algorithm !== DPAlgorithmType.MAXIMUM_SUBARRAY_SUM) || 
                                                        (algorithm === DPAlgorithmType.MAXIMUM_SUBARRAY_SUM && idx === 1)
                                                     ) && (algorithm === DPAlgorithmType.LCS || algorithm === DPAlgorithmType.EDIT_DISTANCE || algorithm === DPAlgorithmType.SUBSET_SUM || algorithm === DPAlgorithmType.KNAPSACK || algorithm === DPAlgorithmType.LAS || algorithm === DPAlgorithmType.FIBONACCI || algorithm === DPAlgorithmType.MAXIMUM_SUBARRAY_SUM || algorithm === DPAlgorithmType.JUMP_GAME) && (
                                                          <div className={clsx(
                                                              "w-10 h-10 flex items-center justify-center font-bold transition-colors duration-300",
                                                              // Highlights: LCS Matches OR Subset Sum Included Items
                                                              ((algorithm === DPAlgorithmType.LCS || algorithm === DPAlgorithmType.SUBSET_SUM || algorithm === DPAlgorithmType.KNAPSACK || algorithm === DPAlgorithmType.LAS) && matchedRows.has(row)) ? "text-pink-500 scale-110" : "text-slate-400"
                                                          )}>
                                                              {algorithm === DPAlgorithmType.SUBSET_SUM 
                                                                ? (row === 0 ? '0' : inputArray[row - 1])
                                                                : algorithm === DPAlgorithmType.KNAPSACK
                                                                    ? (row === 0 ? '0' : knapsackWeights[row - 1])
                                                                    : algorithm === DPAlgorithmType.LAS 
                                                                        ? (row === 0 ? '0' : inputArray[row - 1])
                                                                        : algorithm === DPAlgorithmType.FIBONACCI
                                                                            ? "F"
                                                                            : algorithm === DPAlgorithmType.MAXIMUM_SUBARRAY_SUM
                                                                                ? "DP"
                                                                                : algorithm === DPAlgorithmType.JUMP_GAME
                                                                                    ? "DP"
                                                                                    : (row === 0 ? 'ε' : lcsStringA[row - 1])
                                                              }
                                                          </div>
                                                     )}
            
                                                    <motion.div
                                                    key={`dp-${idx}`}
                                                    layout
                                                    className={clsx(
                                                        "w-10 h-10 flex items-center justify-center rounded-lg border font-mono font-bold text-sm relative transition-colors duration-300",
                                                        borderColor, bgColor, textColor, shadow,
                                                        (val === null || val === -1) && "opacity-30",
                                                        "z-0"
                                                    )}
                                                    >
                                                        <span className={clsx("relative z-10", arrow && "opacity-90")}>
                                                            {val === Infinity ? '∞' : (val === -Infinity ? '-∞' : (val !== null ? val : ''))}
                                                        </span>
                                                        {arrow && (
                                                            <span className={clsx(
                                                                "absolute text-lg text-pink-500 font-black z-20 pointer-events-none select-none drop-shadow-md",
                                                                arrowPositionClass
                                                            )}>
                                                                {arrow}
                                                            </span>
                                                        )}
                                                    </motion.div>
                                                 </React.Fragment>
                                             );
                                        })}
                                    </>
                                );
                            })()}
                        </div>
                        </div>
                    ) : (
                        // 1D FLEX VIEW (Existing)
                        <div className="flex gap-2 flex-wrap justify-center">
                            {currentStep.dpTable.map((val, idx) => {
                                // For Maximum Subarray Sum, DP[0] is unused/dummy. Hide it.
                                if (algorithm === DPAlgorithmType.MAXIMUM_SUBARRAY_SUM && idx === 0) return null;

                                const highlight = currentStep.highlights.find(h => h.target === 'dp' && h.indices.includes(idx));
                                let borderColor = 'border-slate-700';
                                let bgColor = 'bg-slate-800';
                                let textColor = 'text-slate-400';
                                
                                if (highlight?.type === 'write') { borderColor = 'border-emerald-500'; bgColor = 'bg-emerald-900/30'; textColor = 'text-emerald-300'; }
                                if (highlight?.type === 'read') { borderColor = 'border-blue-500'; bgColor = 'bg-blue-900/30'; textColor = 'text-blue-300'; }
                                if (highlight?.type === 'current') { borderColor = 'border-yellow-500'; bgColor = 'bg-yellow-900/30'; textColor = 'text-yellow-300'; }

                                return (
                                    <motion.div
                                    key={`dp-${idx}`}
                                    layout
                                    className={clsx(
                                        "w-12 h-12 flex items-center justify-center rounded-xl border-2 font-mono font-bold text-lg relative transition-colors duration-300",
                                        borderColor, bgColor, textColor,
                                        (val === null || val === -1) && "opacity-50"
                                    )}
                                    >
                                        {val === Infinity ? '∞' : (val === -Infinity ? '-∞' : (val !== null ? val : ''))}
                                        <span className="absolute -bottom-5 text-[10px] text-slate-600 font-normal">{idx}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
               </div>

               {/* Toast */}
               <div className="bg-slate-800/90 backdrop-blur-md border border-slate-600 shadow-2xl flex items-center justify-center transition-all px-6 py-3 rounded-full gap-4 mt-8 max-w-lg text-center">
                 <div className="flex items-center gap-3 shrink-0">
                     <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                     <span className="text-sm font-medium text-white">{currentStep.description}</span>
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

        {/* Right Column: Pseudocode & Stack */}
        <div className="flex flex-col gap-6 flex-1 min-w-[350px]">
           <AnimatePresence mode="wait">
             <motion.div
               key={algorithm}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3 }}
               className="flex flex-col gap-6 h-full"
             >
                <div className="flex flex-col gap-4 h-full">
                    {/* Array Input (Max Subarray / Jump Game / Subset Sum / LAS) */}
                    {(algorithm === DPAlgorithmType.MAXIMUM_SUBARRAY_SUM || algorithm === DPAlgorithmType.JUMP_GAME || algorithm === DPAlgorithmType.SUBSET_SUM || algorithm === DPAlgorithmType.LAS) && (
                        <div className="flex flex-col gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700">
                             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Input Array</div>
                             <div className="flex flex-col gap-2">
                                <label className="text-xs text-slate-500">
                                    {algorithm === DPAlgorithmType.MAXIMUM_SUBARRAY_SUM 
                                        ? "Comma separated numbers (max 9)" 
                                        : (algorithm === DPAlgorithmType.JUMP_GAME || algorithm === DPAlgorithmType.SUBSET_SUM)
                                            ? "Comma separated numbers (max 9, non-negative)"
                                            : "Comma separated numbers"}
                                </label>
                                <input 
                                    type="text" 
                                    value={rawInputStr}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        
                                        // Max Subarray / Jump Game / Subset Sum: max 9 numbers. 
                                        const maxLen = (algorithm === DPAlgorithmType.MAXIMUM_SUBARRAY_SUM || algorithm === DPAlgorithmType.JUMP_GAME || algorithm === DPAlgorithmType.SUBSET_SUM) ? 9 : 15;
                                        // Parse carefully: allow typing incomplete numbers (like "-", empty)
                                        // Logic: if the number of *completed* parsed numbers exceeds maxLen, block.
                                        // Actually, "stops accepting characters" implies preventing the update if it would Result in > maxLen.
                                        
                                        const arr = val.split(/[,\s]+/).filter(s => s.trim() !== '');
                                        const numArr = arr.map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                                        
                                        // If we are over the limit, don't allow the update
                                        // However, note that "1, 2," splits into ["1", "2", ""]. filter removes empty.
                                        // If user types "1,2,3...9,10", at "10" it breaks.
                                        // Let's rely on numArr length.
                                        if (numArr.length > maxLen) return;

                                        // Jump Game / Subset Sum: Check for negative numbers
                                        if (algorithm === DPAlgorithmType.JUMP_GAME || algorithm === DPAlgorithmType.SUBSET_SUM) {
                                            if (numArr.some(n => n < 0)) return;
                                            // Also block typing the minus sign if it's the only character in a split part?
                                            // Or just check if the raw string contains '-'? 
                                            // Ideally, valid input for parse is needed. 
                                            // If user types "-2", numArr has -2. We blocked it.
                                            // If user types "-", numArr has empty. We don't want to allow entering "-" at all.
                                            if (val.includes('-')) return; 
                                        }

                                        setRawInputStr(val);
                                        
                                        if (numArr.length > 0) { 
                                            setInputArray(numArr);
                                        } else if (val.trim() === '') {
                                            setInputArray([]);
                                        }
                                    }}
                                    className="bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white font-mono"
                                />
                             </div>
                             
                             {algorithm === DPAlgorithmType.SUBSET_SUM && (
                                 <div className="flex flex-col gap-2 mt-2">
                                    <label className="text-xs text-slate-500">Target Sum</label>
                                    <input 
                                        type="text" 
                                        value={rawTargetStr}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^\d*$/.test(val)) {
                                                setRawTargetStr(val);
                                                setSubsetTarget(val === '' ? 0 : parseInt(val));
                                            }
                                        }}
                                        className="bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white font-mono"
                                    />
                                 </div>
                             )}
                        </div>
                    )}

                    {/* Knapsack Inputs */}
                     {algorithm === DPAlgorithmType.KNAPSACK && (
                        <div className="flex flex-col gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700">
                             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Knapsack Config</div>
                             <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Weights (wt)</label>
                                    <input 
                                        type="text" 
                                        value={rawWeightsStr}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            // Knapsack Validation: Max 7, No Negatives
                                            const arr = val.split(/[,\s]+/).filter(s => s.trim() !== '');
                                            const numArr = arr.map(s => parseInt(s.trim())).filter(n => !isNaN(n));

                                            if (numArr.length > 7) return; 
                                            if (numArr.some(n => n < 0)) return;
                                            if (val.includes('-')) return;

                                            setRawWeightsStr(val);
                                            
                                            // Only update state if valid
                                            // Note: empty string might produce empty array, which is fine
                                            const validNums = val.split(/[,\s]+/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                                            if (validNums.length > 0) setKnapsackWeights(validNums);
                                            else if (val.trim() === '') setKnapsackWeights([]);
                                        }}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Values (val)</label>
                                    <input 
                                        type="text" 
                                        value={rawValuesStr}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            // Knapsack Validation: Max 7, No Negatives
                                            const arr = val.split(/[,\s]+/).filter(s => s.trim() !== '');
                                            const numArr = arr.map(s => parseInt(s.trim())).filter(n => !isNaN(n));

                                            if (numArr.length > 7) return;
                                            if (numArr.some(n => n < 0)) return;
                                            if (val.includes('-')) return;

                                            setRawValuesStr(val);
                                            
                                            const validNums = val.split(/[,\s]+/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                                            if (validNums.length > 0) setKnapsackValues(validNums);
                                            else if (val.trim() === '') setKnapsackValues([]);
                                        }}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Capacity (W)</label>
                                    <input 
                                        type="text" 
                                        value={rawCapacityStr}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^\d*$/.test(val)) {
                                                setRawCapacityStr(val);
                                                setKnapsackCapacity(val === '' ? 0 : parseInt(val));
                                            }
                                        }}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                             </div>
                        </div>
                    )}

                    {/* LCS / Edit Distance Input */}
                    {(algorithm === DPAlgorithmType.LCS || algorithm === DPAlgorithmType.EDIT_DISTANCE) && (
                        <div className="flex flex-col gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700">
                             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configuration</div>
                             <div className="flex flex-col gap-2">
                                 <div>
                                     <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">String A (max 7)</label>
                                     <input 
                                        type="text" 
                                        maxLength={7}
                                        value={lcsStringA}
                                        onChange={(e) => setLcsStringA(e.target.value.toUpperCase())}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                     />
                                 </div>
                                 <div>
                                     <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">String B (max 7)</label>
                                     <input 
                                        type="text" 
                                        maxLength={7}
                                        value={lcsStringB}
                                        onChange={(e) => setLcsStringB(e.target.value.toUpperCase())}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                     />
                                 </div>
                             </div>
                        </div>
                    )}

                    {/* Switcher */}
                     {algorithm !== DPAlgorithmType.JUMP_GAME && algorithm !== DPAlgorithmType.LAS && (
                     <div className="flex p-1 bg-slate-800/50 rounded-lg border border-slate-800 w-fit">
                        <button 
                            onClick={() => setApproach('BOTTOM_UP')}
                            className={clsx(
                                "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                                approach === 'BOTTOM_UP' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            Bottom-Up
                        </button>
                        <button 
                            onClick={() => setApproach('TOP_DOWN')}
                            className={clsx(
                                "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                                approach === 'TOP_DOWN' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            Top-Down
                        </button>
                    </div>
                    )}

                    <div className="shrink-0 h-auto">
                        <PseudocodeViewer 
                            activeLine={currentStep.lineNumber} 
                            algorithm={algorithm}
                            dpApproach={approach}
                        />
                    </div>

                     {/* Recursion Stack Panel */}
                     {approach === 'TOP_DOWN' && currentStep.stack && (
                        <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden max-h-[300px]">
                             <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider shrink-0 w-full z-10">
                                 <Layers size={14} />
                                 Recursion Stack
                             </div>
                             <div ref={stackContainerRef} className="p-4 flex flex-col gap-2 overflow-auto scroll-smooth">
                                 {/* Render stack reversed so newest is at the top */}
                                 {[...currentStep.stack].reverse().map((frame, idx) => (
                                     <motion.div 
                                         key={`${currentStep.stack!.length - 1 - idx}-${frame}`}
                                         initial={{ opacity: 0, x: -10 }}
                                         animate={{ opacity: 1, x: 0 }}
                                         layout
                                         className="p-2 bg-slate-700 rounded border-l-4 border-amber-500 text-sm font-mono text-slate-200 shadow-sm shrink-0"
                                     >
                                         {frame}
                                     </motion.div>
                                 ))}
                                 {currentStep.stack.length === 0 && (
                                     <div className="text-slate-500 italic text-sm text-center py-4">Stack is empty</div>
                                 )}
                             </div>
                        </div>
                     )}
               </div>


                  </motion.div>
             </AnimatePresence>

             {/* Explanation Panel */}
             <div className="bg-slate-900/50 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col mt-4">
                 <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2 bg-slate-800/50">
                     <BookOpen size={16} className="text-purple-400" />
                     <span className="font-bold text-slate-300 text-sm">Algorithm Explanation</span>
                 </div>
                 <div className="p-5 flex flex-col gap-4 text-sm text-slate-400">
                      <div>
                          <span className="text-slate-500 uppercase text-xs font-bold tracking-wider block mb-1">Problem</span>
                          <p className="text-slate-300"><LatexRenderer>{DP_EXPLANATIONS[algorithm].problem}</LatexRenderer></p>
                      </div>
                      <div>
                          <span className="text-slate-500 uppercase text-xs font-bold tracking-wider block mb-1">Dimension</span>
                          <p className="font-mono text-xs text-slate-300"><LatexRenderer>{DP_EXPLANATIONS[algorithm].dimension}</LatexRenderer></p>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                          <div>
                              <span className="text-slate-500 uppercase text-xs font-bold tracking-wider block mb-1">Subproblem</span>
                              <p className="font-mono text-xs text-slate-300"><LatexRenderer>{DP_EXPLANATIONS[algorithm].subproblem}</LatexRenderer></p>
                          </div>
                          <div>
                             <span className="text-slate-500 uppercase text-xs font-bold tracking-wider block mb-1">Base Case</span>
                             <p className="font-mono text-xs text-slate-300"><LatexRenderer>{DP_EXPLANATIONS[algorithm].baseCase}</LatexRenderer></p>
                          </div>
                          <div>
                              <span className="text-slate-500 uppercase text-xs font-bold tracking-wider block mb-1">Recurrence</span>
                              <p className="font-mono text-xs text-slate-300"><LatexRenderer>{DP_EXPLANATIONS[algorithm].recurrence}</LatexRenderer></p>
                          </div>
                          <div>
                              <span className="text-slate-500 uppercase text-xs font-bold tracking-wider block mb-1">Justification</span>
                              <p className="text-xs text-slate-300"><LatexRenderer>{DP_EXPLANATIONS[algorithm].justification}</LatexRenderer></p>
                          </div>
                          <div>
                              <span className="text-slate-500 uppercase text-xs font-bold tracking-wider block mb-1">Order of Computation</span>
                              <p className="font-mono text-xs text-slate-300"><LatexRenderer>{DP_EXPLANATIONS[algorithm].orderOfComputation}</LatexRenderer></p>
                          </div>
                   
                          <div className="flex gap-4">
                             <div className="flex-1">
                                <span className="text-slate-500 uppercase text-xs font-bold tracking-wider block mb-1">Solution</span>
                                <p className="font-mono text-xs text-slate-300"><LatexRenderer>{DP_EXPLANATIONS[algorithm].solution}</LatexRenderer></p>
                             </div>
                             <div className="flex-1">
                                <span className="text-slate-500 uppercase text-xs font-bold tracking-wider block mb-1">Complexity</span>
                                <p className="font-mono text-xs text-slate-300 whitespace-pre-line"><LatexRenderer>{DP_EXPLANATIONS[algorithm].complexity}</LatexRenderer></p>
                             </div>
                          </div>
                      </div>
                 </div>
             </div>

        </div>
      </main>
    </div>
  );
};

export default DPMode;
