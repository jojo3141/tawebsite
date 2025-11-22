
import React, { useState, useEffect, useCallback } from 'react';
import { generateRandomGraph, calculateDijkstraSteps, calculateBFSSteps, calculateDFSSteps, calculateBellmanFordSteps, calculatePrimSteps, calculateKruskalSteps, calculateBoruvkaSteps } from '@/utils/graphUtils';
import GraphCanvas from '@/components/visualizer/GraphCanvas';
import PseudocodeViewer from '@/components/visualizer/PseudocodeViewer';
import DataPanel from '@/components/visualizer/DataPanel';
import { Graph, AlgorithmStep, AlgorithmType } from '@/types/graph';
import { Play, RotateCcw, ArrowRight, ArrowLeft, SkipForward } from 'lucide-react';
import { clsx } from 'clsx';

const VisualizerApp: React.FC = () => {
  // State
  const [graph, setGraph] = useState<Graph | null>(null);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>(AlgorithmType.DFS);
  
  // User preference for graph direction (only applies to non-MST algorithms)
  const [userPreferredDirected, setUserPreferredDirected] = useState<boolean>(true);

  // Helper: These algorithms MUST be undirected
  const isMstAlgo = (algo: AlgorithmType) => algo === AlgorithmType.PRIM || algo === AlgorithmType.KRUSKAL || algo === AlgorithmType.BORUVKA;
  
  // Helper: These algorithms support the toggle (Exclude MST and Bellman-Ford)
  const supportsDirectionToggle = (algo: AlgorithmType) => !isMstAlgo(algo) && algo !== AlgorithmType.BELLMAN_FORD;

  // Navigation Order
  const ALGORITHMS = [
    AlgorithmType.DFS,
    AlgorithmType.BFS,
    AlgorithmType.DIJKSTRA,
    AlgorithmType.BELLMAN_FORD,
    AlgorithmType.PRIM,
    AlgorithmType.KRUSKAL,
    AlgorithmType.BORUVKA
  ];

  // Memoized solver to be stable for useEffect deps
  const solveGraph = useCallback((g: Graph, algo: AlgorithmType) => {
    setIsAutoPlaying(false);
    const startNode = g.nodes[0].id;
    
    let solutionSteps: AlgorithmStep[] = [];
    if (algo === AlgorithmType.DIJKSTRA) {
      solutionSteps = calculateDijkstraSteps(g, startNode);
    } else if (algo === AlgorithmType.BFS) {
      solutionSteps = calculateBFSSteps(g, startNode);
    } else if (algo === AlgorithmType.DFS) {
      solutionSteps = calculateDFSSteps(g, startNode);
    } else if (algo === AlgorithmType.BELLMAN_FORD) {
      solutionSteps = calculateBellmanFordSteps(g, startNode);
    } else if (algo === AlgorithmType.PRIM) {
      solutionSteps = calculatePrimSteps(g, startNode);
    } else if (algo === AlgorithmType.KRUSKAL) {
      solutionSteps = calculateKruskalSteps(g, startNode);
    } else if (algo === AlgorithmType.BORUVKA) {
      solutionSteps = calculateBoruvkaSteps(g, startNode);
    }
    
    setSteps(solutionSteps);
    setCurrentStepIndex(0);
  }, []);

  // Memoize graph generation
  const generateNewGraph = useCallback(() => {
    setIsAutoPlaying(false);
    const width = 600;
    const height = 450; 
    
    // Determine settings based on current state
    const uniqueWeights = algorithm === AlgorithmType.BORUVKA;
    
    // If it's an MST algo, force Undirected. 
    // If it's Bellman-Ford, force Directed.
    // Else use user preference.
    const isDirected = isMstAlgo(algorithm) ? false : (algorithm === AlgorithmType.BELLMAN_FORD ? true : userPreferredDirected);
    
    // Use negative weights for Bellman-Ford AND MST Algorithms
    const hasNegativeWeights = algorithm === AlgorithmType.BELLMAN_FORD || isMstAlgo(algorithm);

    // Reduce edge count for Undirected DFS/BFS to avoid clutter
    const isUndirectedPathfinding = !isDirected && (algorithm === AlgorithmType.DFS || algorithm === AlgorithmType.BFS);
    const minEdges = isUndirectedPathfinding ? 11 : 15;
    const maxEdges = isUndirectedPathfinding ? 14 : 20;

    const newGraph = generateRandomGraph(9, width, height, isDirected, uniqueWeights, hasNegativeWeights, minEdges, maxEdges);
    setGraph(newGraph);
    solveGraph(newGraph, algorithm);
  }, [algorithm, userPreferredDirected, solveGraph]);

  // Init
  useEffect(() => {
    // Only generate if no graph exists to prevent double-init effects, though state setters are stable
    // Using a check here to be safe, or rely on the dependency array being empty initially if we want strict "Mount" logic.
    // However, generateNewGraph depends on 'algorithm' which changes. 
    // Ideally we just call it once.
    generateNewGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Recalculate steps when algorithm changes, graph type changes, or direction preference changes
  useEffect(() => {
    if (graph) {
       const isBoruvka = algorithm === AlgorithmType.BORUVKA;
       const graphHasUniqueWeights = graph.hasUniqueWeights === true;
       
       // Determine what the direction SHOULD be based on algorithm and user preference
       // MST -> Undirected
       // Bellman-Ford -> Directed
       // Others -> User Preference
       const shouldBeDirected = isMstAlgo(algorithm) ? false : (algorithm === AlgorithmType.BELLMAN_FORD ? true : userPreferredDirected);
       const graphIsDirected = graph.isDirected !== false; // Default to true if undefined

       const isBellmanFord = algorithm === AlgorithmType.BELLMAN_FORD;
       
       // Allow negative weights for Bellman-Ford AND MST Algorithms
       const shouldHaveNegative = isBellmanFord || isMstAlgo(algorithm); 
       const graphHasNegative = graph.edges.some(e => e.weight < 0);

       if (isBoruvka && !graphHasUniqueWeights) {
           // Force generation for Boruvka to ensure unique weights
           generateNewGraph();
       } else if (!isBoruvka && graphHasUniqueWeights) {
           // Force generation if switching FROM Boruvka (Unique) TO something else
           generateNewGraph();
       } else if (shouldBeDirected !== graphIsDirected) {
           // Force generation if direction mismatch (e.g. switching DFS Directed -> DFS Undirected)
           generateNewGraph(); 
       } else if (shouldHaveNegative && !graphHasNegative) {
           // Switch TO algorithm needing negative weights (Bellman-Ford or MST)
           generateNewGraph();
       } else if (!shouldHaveNegative && graphHasNegative) {
           // Switch FROM algorithm with negative weights to one without (e.g. Dijkstra)
           generateNewGraph();
       } else {
           // Graph is compatible, just re-solve
           solveGraph(graph, algorithm);
       }
    }
  }, [algorithm, userPreferredDirected, graph, generateNewGraph, solveGraph]);

  // Auto Play Logic
  useEffect(() => {
    let interval: any;
    if (isAutoPlaying && currentStepIndex < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 1000);
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

  const currentStep = steps[currentStepIndex];

  if (!graph || !currentStep) return <div className="h-full flex items-center justify-center text-slate-400">Loading...</div>;

  const showDfsLegend = algorithm === AlgorithmType.DFS && currentStep.edgeClassifications && Object.keys(currentStep.edgeClassifications).length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Grid Layout for Stability */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center sticky top-0 z-40 shadow-md gap-4">
        
        {/* Left: Spacer/Logo Placeholder */}
        <div className="flex items-center space-x-3 justify-self-start">
           {/* Can add back tool logo if desired */}
        </div>
        
        {/* Center: Algorithm Switcher (Fixed Position) */}
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 justify-self-center overflow-x-auto max-w-full">
          {ALGORITHMS.map((algo) => (
            <button
              key={algo}
              onClick={() => setAlgorithm(algo)}
              className={clsx(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                algorithm === algo 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              )}
            >
              {algo === AlgorithmType.BELLMAN_FORD ? 'BELLMAN-FORD' : algo}
            </button>
          ))}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 justify-self-end">
             {/* Directed/Undirected Segmented Control - Only for supported algos */}
             <div className={clsx("transition-opacity duration-300", supportsDirectionToggle(algorithm) ? "opacity-100" : "opacity-0 pointer-events-none")}>
                 <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 mr-2">
                     <button
                        onClick={() => setUserPreferredDirected(true)}
                        className={clsx(
                            "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                            userPreferredDirected 
                                ? "bg-slate-600 text-white shadow-sm" 
                                : "text-slate-500 hover:text-slate-300"
                        )}
                     >
                        Directed
                     </button>
                     <button
                        onClick={() => setUserPreferredDirected(false)}
                        className={clsx(
                            "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                            !userPreferredDirected 
                                ? "bg-slate-600 text-white shadow-sm" 
                                : "text-slate-500 hover:text-slate-300"
                        )}
                     >
                        Undirected
                     </button>
                 </div>
             </div>

             <button 
                onClick={generateNewGraph}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700 whitespace-nowrap"
             >
               <RotateCcw size={16} /> New Graph
             </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex gap-6 items-start">
        
        {/* Left Column: Graph & Controls */}
        <div className="flex flex-col gap-6 w-auto shrink-0 sticky top-24">
          
          {/* Graph Visualization */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 flex justify-center items-center relative shadow-xl w-fit">
            <GraphCanvas 
              graph={graph} 
              currentStep={currentStep} 
              width={600} 
              height={450} 
              algorithm={algorithm}
            />
            
            {/* Current Action Toast */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-md border border-slate-600 shadow-2xl flex items-center justify-center transition-all px-10 py-3 rounded-full gap-4 min-w-[300px]">
               <div className="flex items-center gap-3 shrink-0">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                   <span className="text-sm font-medium text-white">{currentStep.description}</span>
               </div>
               
               {showDfsLegend && (
                   <>
                       <div className="w-px h-4 bg-slate-600 shrink-0"></div>
                       <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-1 bg-green-500 rounded-full"></div>
                                <span className="text-[10px] text-green-200">Tree</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-1 rounded-full" style={{backgroundColor: '#ec489980'}}></div>
                                <span className="text-[10px] text-pink-200">Back</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-1 rounded-full" style={{backgroundColor: '#38bdf880'}}></div>
                                <span className="text-[10px] text-sky-200">Forward</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-1 rounded-full" style={{backgroundColor: '#a855f780'}}></div>
                                <span className="text-[10px] text-purple-200">Cross</span>
                            </div>
                       </div>
                   </>
               )}
            </div>
          </div>

          {/* Playback Controls */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button 
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 disabled:opacity-30 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="text-sm font-mono text-slate-400 w-32 text-center">
                Step {currentStep.stepId} / {steps.length - 1}
              </div>

              <button 
                onClick={handleNext}
                disabled={currentStepIndex === steps.length - 1}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 disabled:opacity-30 transition-colors"
              >
                <ArrowRight size={20} />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                 onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isAutoPlaying ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}
              >
                {isAutoPlaying ? 'Pause' : <><Play size={16} fill="currentColor" /> Auto Play</>}
              </button>

              <button 
                onClick={handleJumpToEnd}
                disabled={currentStepIndex === steps.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors border border-slate-700 text-slate-200 disabled:opacity-50"
              >
                <SkipForward size={16} /> Jump to End
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Algorithm & Data */}
        <div className="flex flex-col gap-6 flex-1 min-w-[400px]">
          {/* Pseudocode */}
          <div className="shrink-0 h-[350px]">
             <PseudocodeViewer 
               activeLine={currentStep.lineNumber} 
               algorithm={algorithm} 
               isDirected={graph.isDirected !== false}
             />
          </div>
          
          {/* Data Visualizers */}
          <div className="shrink-0 pb-4">
             <DataPanel step={currentStep} algorithm={algorithm} graph={graph!} />
          </div>
        </div>

      </main>
    </div>
  );
};

export default VisualizerApp;
