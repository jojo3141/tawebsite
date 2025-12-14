
import React, { useState, useEffect, useCallback } from 'react';
import { generateRandomGraph, calculateDijkstraSteps, calculateBFSSteps, calculateDFSSteps, calculateBellmanFordSteps, calculatePrimSteps, calculateKruskalSteps, calculateBoruvkaSteps } from '@/utils/graphUtils';
import { AnimatePresence, motion } from 'framer-motion';
import GraphCanvas from '@/components/visualizer/GraphCanvas';
import PseudocodeViewer from '@/components/visualizer/PseudocodeViewer';
import DataPanel from '@/components/visualizer/DataPanel';
import VisualizerHeader, { VisualizerMode } from '@/components/visualizer/VisualizerHeader';
import { Graph, AlgorithmStep, AlgorithmType } from '@/types/graph';
import { Play, ArrowRight, ArrowLeft, SkipForward, SkipBack } from 'lucide-react';

interface GraphModeProps {
  mode: VisualizerMode;
  setMode: (mode: VisualizerMode) => void;
  onBack?: () => void;
}

const GraphMode: React.FC<GraphModeProps> = ({ mode, setMode, onBack }) => {
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
      solutionSteps = calculateKruskalSteps(g);
    } else if (algo === AlgorithmType.BORUVKA) {
      solutionSteps = calculateBoruvkaSteps(g);
    }
    
    setSteps(solutionSteps);
    setCurrentStepIndex(0);
  }, []);

  // Memoize graph generation
  const generateNewGraph = useCallback(() => {
    setIsAutoPlaying(false);
    const width = 600;
    const height = 420; 
    
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
    generateNewGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Recalculate steps when algorithm changes, graph type changes, or direction preference changes
  useEffect(() => {
    if (graph) {
       const isBoruvka = algorithm === AlgorithmType.BORUVKA;
       const graphHasUniqueWeights = graph.hasUniqueWeights === true;
       
       const shouldBeDirected = isMstAlgo(algorithm) ? false : (algorithm === AlgorithmType.BELLMAN_FORD ? true : userPreferredDirected);
       const graphIsDirected = graph.isDirected !== false; // Default to true if undefined

       const isBellmanFord = algorithm === AlgorithmType.BELLMAN_FORD;
       
       const shouldHaveNegative = isBellmanFord || isMstAlgo(algorithm); 
       const graphHasNegative = graph.edges.some(e => e.weight < 0);

       if (isBoruvka && !graphHasUniqueWeights) {
           generateNewGraph();
       } else if (!isBoruvka && graphHasUniqueWeights) {
           generateNewGraph();
       } else if (shouldBeDirected !== graphIsDirected) {
           generateNewGraph(); 
       } else if (shouldHaveNegative && !graphHasNegative) {
           generateNewGraph();
       } else if (!shouldHaveNegative && graphHasNegative) {
           generateNewGraph();
       } else {
           solveGraph(graph, algorithm);
       }
    }
  }, [algorithm, userPreferredDirected, graph, generateNewGraph, solveGraph]);

  // Auto Play Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
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

  const handleReset = () => {
      setIsAutoPlaying(false);
      setCurrentStepIndex(0);
  };

  const currentStep = steps[currentStepIndex];

  if (!graph || !currentStep) return <div className="h-full flex items-center justify-center text-slate-400">Loading...</div>;

  const showDfsLegend = algorithm === AlgorithmType.DFS && currentStep.edgeClassifications && Object.keys(currentStep.edgeClassifications).length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <VisualizerHeader 
        mode={mode}
        setMode={setMode}
        algorithms={ALGORITHMS}
        currentAlgorithm={algorithm}
        setAlgorithm={(algo: string) => setAlgorithm(algo as AlgorithmType)}
        onGenerateNew={generateNewGraph}
        showDirectionToggle={supportsDirectionToggle(algorithm)}
        isDirected={userPreferredDirected}
        setIsDirected={setUserPreferredDirected}
        onBack={onBack}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 pt-6 flex gap-6 items-start">
        
        {/* Left Column: Graph & Controls (STICKY POSITION) */}
        <div className="flex flex-col gap-2 w-auto shrink-0 sticky top-24 z-30">
          
          {/* Unified Card for Graph & Controls */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 shadow-xl overflow-hidden w-fit flex flex-col">
            
            {/* Graph Visualization Section */}
            <div className="relative">
              <GraphCanvas 
                graph={graph} 
                currentStep={currentStep} 
                width={600} 
                height={420} 
                algorithm={algorithm}
              />
              
              {/* Current Action Toast (Positioned inside graph) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-md border border-slate-600 shadow-2xl flex items-center justify-center transition-all px-10 py-3 rounded-full gap-4 min-w-[300px]">
                 <div className="flex items-center gap-3 shrink-0">
                     <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                     <span className="text-sm font-medium text-white whitespace-nowrap">{currentStep.description}</span>
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

            {/* Playback Controls Section */}
            <div className="border-t border-slate-800 p-2 bg-slate-900/50 flex items-center justify-between">
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

              <div className="flex gap-1">
                <button
                   onClick={handleReset}
                   disabled={currentStepIndex === 0}
                   className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors border border-slate-700 text-slate-200 disabled:opacity-50"
                >
                  <SkipBack size={16} /> Reset
                </button>

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
        </div>

        {/* Right Column: Algorithm & Data */}
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
              {/* Pseudocode */}
              <div className="shrink-0 h-auto">
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
            </motion.div>
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
};

export default GraphMode;
