
import React, { useState, useEffect, useCallback } from 'react';
import { generateRandomGraph, generateTarjanGraph, generateEulerianGraph, generateGreedyMatchingGraph, generateHopcroftKarpGraph, generateColoringGraph, generateFordFulkersonGraph, calculateDijkstraSteps, calculateBFSSteps, calculateDFSSteps, calculateBellmanFordSteps, calculatePrimSteps, calculateKruskalSteps, calculateBoruvkaSteps, calculateTarjanSteps, calculateEulerSteps, calculateGreedyMatchingSteps, calculateHopcroftKarpSteps, calculateGreedyColoringSteps, calculateSmallestLastColoringSteps, calculateFordFulkersonSteps } from '@/utils/graphUtils';
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
  initialAlgorithm?: AlgorithmType | string;
  availableAlgorithms?: AlgorithmType[]; // New prop
}

const DEFAULT_ALGORITHMS = [
    AlgorithmType.DFS,
    AlgorithmType.BFS,
    AlgorithmType.DIJKSTRA,
    AlgorithmType.BELLMAN_FORD,
    AlgorithmType.PRIM,
    AlgorithmType.KRUSKAL,
    AlgorithmType.PRIM,
    AlgorithmType.KRUSKAL,
    AlgorithmType.BORUVKA,
    AlgorithmType.EULER
];

const GraphMode: React.FC<GraphModeProps> = ({ mode, setMode, onBack, initialAlgorithm, availableAlgorithms }) => {
  // Navigation Order
  const activeAlgorithms = availableAlgorithms || DEFAULT_ALGORITHMS;

  // State
  const [graph, setGraph] = useState<Graph | null>(null);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  
  // Ensure we start with a valid algorithm from the active list
  const getInitialAlgo = () => {
      if (initialAlgorithm && activeAlgorithms.includes(initialAlgorithm as AlgorithmType)) {
          return initialAlgorithm as AlgorithmType;
      }
      return activeAlgorithms[0];
  };

  const [algorithm, setAlgorithm] = useState<AlgorithmType>(getInitialAlgo());
  
  // User preference for graph direction (only applies to non-MST algorithms)
  const [userPreferredDirected, setUserPreferredDirected] = useState<boolean>(true);

  // Helper: These algorithms must be undirected
  const isMstAlgo = (algo: AlgorithmType) => algo === AlgorithmType.PRIM || algo === AlgorithmType.KRUSKAL || algo === AlgorithmType.BORUVKA;
  const isTarjan = (algo: AlgorithmType) => algo === AlgorithmType.TARJAN;
  
  // Helper: These algorithms support the toggle (Exclude MST, Bellman-Ford, Tarjan, Euler, Matching, and Coloring algorithms)
  const supportsDirectionToggle = (algo: AlgorithmType) => !isMstAlgo(algo) && !isTarjan(algo) && algo !== AlgorithmType.BELLMAN_FORD && algo !== AlgorithmType.EULER && algo !== AlgorithmType.GREEDY_MATCHING && algo !== AlgorithmType.HOPCROFT_KARP && algo !== AlgorithmType.GREEDY_COLORING && algo !== AlgorithmType.SMALLEST_LAST_COLORING && algo !== AlgorithmType.FORD_FULKERSON;

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
    } else if (algo === AlgorithmType.TARJAN) {
      solutionSteps = calculateTarjanSteps(g, startNode);
    } else if (algo === AlgorithmType.EULER) {
      solutionSteps = calculateEulerSteps(g, startNode);
    } else if (algo === AlgorithmType.GREEDY_MATCHING) {
      solutionSteps = calculateGreedyMatchingSteps(g);
    } else if (algo === AlgorithmType.HOPCROFT_KARP) {
      solutionSteps = calculateHopcroftKarpSteps(g);
    } else if (algo === AlgorithmType.GREEDY_COLORING) {
      solutionSteps = calculateGreedyColoringSteps(g);
    } else if (algo === AlgorithmType.SMALLEST_LAST_COLORING) {
      solutionSteps = calculateSmallestLastColoringSteps(g);
    } else if (algo === AlgorithmType.FORD_FULKERSON) {
      solutionSteps = calculateFordFulkersonSteps(g);
    }
    
    setSteps(solutionSteps);
    setCurrentStepIndex(0);
  }, []);

  // Memoize graph generation
  const generateNewGraph = useCallback(() => {
    setIsAutoPlaying(false);
    const width = 600;
    const height = 420; 
    
    // TARJAN Specific Fixed Graph
    if (algorithm === AlgorithmType.TARJAN) {
        const newGraph = generateTarjanGraph(width, height);
        setGraph(newGraph);
        solveGraph(newGraph, algorithm);
        return;
    }

    // EULER Specific Graph (Even Degrees)
    if (algorithm === AlgorithmType.EULER) {
        const newGraph = generateEulerianGraph(width, height);
        setGraph(newGraph);
        solveGraph(newGraph, algorithm);
        return;
    }

    // GREEDY_MATCHING Specific Graph (similar to Tarjan structure)
    if (algorithm === AlgorithmType.GREEDY_MATCHING) {
        const newGraph = generateGreedyMatchingGraph(width, height);
        setGraph(newGraph);
        solveGraph(newGraph, algorithm);
        return;
    }

    // HOPCROFT_KARP Specific Graph (bipartite graph with 8+7 nodes)
    if (algorithm === AlgorithmType.HOPCROFT_KARP) {
        const newGraph = generateHopcroftKarpGraph(width, height);
        setGraph(newGraph);
        solveGraph(newGraph, algorithm);
        return;
    }

    // COLORING Specific Graph (similar to Matching)
    if (algorithm === AlgorithmType.GREEDY_COLORING || algorithm === AlgorithmType.SMALLEST_LAST_COLORING) {
        const newGraph = generateColoringGraph(width, height);
        setGraph(newGraph);
        solveGraph(newGraph, algorithm);
        return;
    }

    // FORD_FULKERSON Specific Graph
    if (algorithm === AlgorithmType.FORD_FULKERSON) {
        const newGraph = generateFordFulkersonGraph(width, height);
        setGraph(newGraph);
        solveGraph(newGraph, algorithm);
        return;
    }

    // Determine settings based on current state
    const uniqueWeights = algorithm === AlgorithmType.BORUVKA;
    
    // If it's an MST algo, force Undirected. 
    // If it's Bellman-Ford or Ford-Fulkerson, force Directed.
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
       const isTarjan = algorithm === AlgorithmType.TARJAN;
       const isEuler = algorithm === AlgorithmType.EULER;
       const isGreedyMatching = algorithm === AlgorithmType.GREEDY_MATCHING;
       const isHopcroftKarp = algorithm === AlgorithmType.HOPCROFT_KARP;
       const graphHasUniqueWeights = graph.hasUniqueWeights === true;
       
       const shouldBeDirected = (isMstAlgo(algorithm) || isTarjan || isEuler || isGreedyMatching || isHopcroftKarp || algorithm === AlgorithmType.GREEDY_COLORING || algorithm === AlgorithmType.SMALLEST_LAST_COLORING) ? false : (algorithm === AlgorithmType.BELLMAN_FORD || algorithm === AlgorithmType.FORD_FULKERSON ? true : userPreferredDirected);
       const graphIsDirected = graph.isDirected !== false; // Default to true if undefined

       const isBellmanFord = algorithm === AlgorithmType.BELLMAN_FORD;
       
       const shouldHaveNegative = isBellmanFord || isMstAlgo(algorithm); 
       const graphHasNegative = graph.edges.some(e => e.weight < 0);

       // Expected node count: 15 for Hopcroft-Karp (8+7), 12 for Tarjan/Euler/Greedy/Coloring; 9 for others
       const isColoring = algorithm === AlgorithmType.GREEDY_COLORING || algorithm === AlgorithmType.SMALLEST_LAST_COLORING;
       const isFlow = algorithm === AlgorithmType.FORD_FULKERSON;
       const expectedNodeCount = (isHopcroftKarp || isColoring) ? 15 : (isTarjan || isEuler || isGreedyMatching) ? 12 : (isFlow ? 11 : 9); // FF uses 11 nodes

       if (isBoruvka && !graphHasUniqueWeights) {
           generateNewGraph();
       } else if (!isBoruvka && graphHasUniqueWeights) {
           generateNewGraph();
       } else if (graph.nodes.length !== expectedNodeCount) {
           generateNewGraph();
       } else if (shouldBeDirected !== graphIsDirected) {
           // Only regen if direction mismatch AND it's not a fixed graph type that forces it (already covered by shouldBeDirected logic)
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

  const showDfsLegend = (algorithm === AlgorithmType.DFS) && currentStep.edgeClassifications && Object.keys(currentStep.edgeClassifications).length > 0;
  const showColoringLegend = (algorithm === AlgorithmType.GREEDY_COLORING || algorithm === AlgorithmType.SMALLEST_LAST_COLORING);

  return (
    <div className="min-h-screen flex flex-col">
      <VisualizerHeader 
        mode={mode}
        setMode={setMode}
        algorithms={activeAlgorithms}
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
              
              {/* Color Legend for Graph Coloring (Positioned above toast) */}
              {showColoringLegend && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Colors:</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#ef4444'}}></div>
                    <span className="text-[10px] text-slate-300">1</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#f97316'}}></div>
                    <span className="text-[10px] text-slate-300">2</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#eab308'}}></div>
                    <span className="text-[10px] text-slate-300">3</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#22c55e'}}></div>
                    <span className="text-[10px] text-slate-300">4</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#06b6d4'}}></div>
                    <span className="text-[10px] text-slate-300">5</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#3b82f6'}}></div>
                    <span className="text-[10px] text-slate-300">6</span>
                  </div>
                </div>
              )}
              
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
