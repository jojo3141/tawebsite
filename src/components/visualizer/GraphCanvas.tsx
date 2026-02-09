
import React from 'react';
import { Graph, AlgorithmStep, AlgorithmType, EdgeType } from '@/types/graph';
import { motion } from 'framer-motion';

interface GraphCanvasProps {
  graph: Graph;
  currentStep: AlgorithmStep;
  width: number;
  height: number;
  algorithm: AlgorithmType;
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({ graph: initialGraph, currentStep, width, height, algorithm }) => {
  
  // For MINIMUM_EDGE_CUT, use the step's graph state snapshot for animation
  const graph = React.useMemo(() => {
    return (algorithm === AlgorithmType.MINIMUM_EDGE_CUT && currentStep.minCutGraphState) 
      ? { ...currentStep.minCutGraphState, isDirected: false } as Graph
      : initialGraph;
  }, [algorithm, currentStep.minCutGraphState, initialGraph]);

  // SPECIAL RENDERER: FINDING DUPLICATES
  if (algorithm === AlgorithmType.FINDING_DUPLICATES_HASH) {
    const dataset = currentStep.findingDuplicatesDataset || [];
    const tuples = currentStep.findingDuplicatesTuples || [];
    const activeIndex = currentStep.findingDuplicatesActiveIndex ?? -1;
    const compareIndices = currentStep.findingDuplicatesCompareIndices;
    const duplicates = currentStep.processedSet || [];

    return (
      <div 
        className="w-full p-6 flex flex-col gap-8 overflow-y-auto"
        style={{ height }}
      >
        {/* Dataset View */}
        <div>
           <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Dataset D</h3>
           <div className="flex gap-2 overflow-x-auto pb-2 pt-2 px-2">
              {dataset.map((s, i) => {
                 const isDuplicate = duplicates.includes(i.toString());
                 const isActive = activeIndex === i;
                 // Highlight if this specific index is involved in a comparison AND we are at the string comparison step (Line 7)
                 const isBeingCompared = compareIndices && currentStep.lineNumber === 7 && (currentStep.findingDuplicatesTuples?.[compareIndices[0]]?.originalIndex === i || currentStep.findingDuplicatesTuples?.[compareIndices[1]]?.originalIndex === i);
                 
                 return (
                   <div 
                      key={i} 
                      className={`relative p-1 pt-3 rounded-md border flex flex-col items-center shadow-sm transition-all duration-300 min-w-[2.5rem] shrink-0
                        ${isDuplicate ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200' : 
                          isActive ? 'bg-indigo-500/30 border-indigo-400 text-indigo-100 scale-105' :
                          isBeingCompared ? 'bg-yellow-500/20 border-yellow-500 text-yellow-200' :
                          'bg-slate-800 border-slate-700 text-slate-300'}
                      `}
                   >
                      <span className="text-[9px] absolute top-0.5 left-1 text-slate-500 font-mono leading-none">{i}</span>
                      <span className="text-xs font-bold font-mono tracking-wider">{s}</span>
                   </div>
                 );
              })}
           </div>
        </div>

        {/* Tuples View (L) */}
        <div className="flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider flex justify-between">
                <span>List L: (Hash, Index)</span>
            </h3>
            
            {tuples.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-600 italic">
                    List L is empty
                </div>
            ) : (
                <div className="flex flex-wrap gap-1 content-start">
                    {tuples.map((t, idx) => {
                        // Check if this tuple is being compared
                        const isComparing = compareIndices && (compareIndices.includes(idx));
                        const isActive = activeIndex === t.originalIndex; // Only true during creation phase really
                        // Check if this tuple represents a found duplicate
                        const isConfirmedDuplicate = duplicates.includes(t.originalIndex.toString());

                        return (
                            <motion.div 
                                layout
                                key={`${t.originalIndex}-${t.hash}`} // Key stability important for sort animation
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`
                                    flex items-center gap-0 px-1 py-1 rounded border font-mono text-xs min-w-[40px] justify-center transition-colors duration-300
                                    ${isComparing ? 'bg-yellow-500/20 border-yellow-500 text-yellow-100 ring-1 ring-yellow-500/50' : 
                                      isConfirmedDuplicate ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200' :
                                      isActive ? 'bg-indigo-500/30 border-indigo-400 text-white' : 
                                      'bg-slate-800 border-slate-700 text-slate-300'}
                                `}
                            >
                                <span className="text-slate-400">(</span>
                                <span className="font-bold text-sky-400">{t.hash}</span>
                                <span className="text-slate-400">,</span>
                                <span className="text-slate-400 ml-0.5">{t.originalIndex}</span>
                                <span className="text-slate-400">)</span>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    );
  }

  // SPECIAL RENDERER: BLOOM FILTER
  if (algorithm === AlgorithmType.BLOOM_FILTER) {
    const dataset = currentStep.findingDuplicatesDataset || [];
    const bitVector = currentStep.bloomFilterBitVector || new Array(16).fill(0);
    const potentialDuplicates = currentStep.bloomFilterPotentialDuplicates || [];
    const activeHashes = currentStep.bloomFilterActiveHashes || [];
    const currentIndex = currentStep.bloomFilterCurrentElementIndex ?? -1;
    const confirmedDuplicates = currentStep.processedSet || []; // IDs of real duplicates
    // We need to track false positives too, but processedSet only stores confirmed ones?
    // In my logic above, confirmedDuplicates are stored as indices in processedSet.
    // That works. For false positives, we might need to infer or check description?
    // Actually, let's just use the current step description or some state to know if we are verifying.
    // Or simpler: Color them based on verification status if verification has happened.
    // If we are at the end (L7+), we can deduce status.
    // Simplified: If currentStep.lineNumber >= 7, we can check.
    
    // For visualization consistency, let's just reuse the dataset display logic partially.
    
    return (
        <div 
          className="w-full p-6 flex flex-col gap-6 overflow-y-auto"
          style={{ height }}
        >
            {/* 1. Dataset D */}
            <div>
                <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Dataset D</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 pt-2 px-2">
                    {dataset.map((s, i) => {
                        const isActive = currentIndex === i;
                        // Use confirmedDuplicates (indices) to mark real ones green? Or maybe mark them as "Processed"?
                        // Let's mark the "Verified Real Duplicates" in the end.
                        // User Request: Highlight ALL occurrences of a duplicate in green, not just the second one.
                        // logic: Get the string values that are confirmed duplicates, then check if current s is one of them.
                        const confirmedDuplicateValues = confirmedDuplicates.map(idx => dataset[parseInt(idx)]);
                        const isConfirmedReal = confirmedDuplicateValues.includes(s);
                        
                        return (
                            <div 
                                key={i} 
                                className={`relative p-1 pt-3 rounded-md border flex flex-col items-center shadow-sm transition-all duration-300 min-w-[2.5rem] shrink-0
                                    ${isActive ? 'bg-indigo-500/30 border-indigo-400 text-indigo-100 scale-105 ring-2 ring-indigo-500/50' : 
                                      isConfirmedReal ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200' :
                                      'bg-slate-800 border-slate-700 text-slate-300'}
                                `}
                            >
                                <span className="text-[9px] absolute top-0.5 left-1 text-slate-500 font-mono leading-none">{i}</span>
                                <span className="text-xs font-bold font-mono tracking-wider">{s}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 2. Bit Vector M */}
            <div>
                <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider flex justify-between">
                    <span>Bit Vector M</span>
                </h3>
                <div className="flex gap-1 overflow-x-auto pb-2 pt-2 px-2">
                    {bitVector.map((bit, i) => {
                        const isActiveHash = activeHashes.includes(i);
                        // If it is 1, is it newly set?
                        // We can't easily tell "newly set" without prev step, but activeHash + bit=1 usually implies it.
                        
                         return (
                            <div 
                                key={i}
                                className={`
                                    relative w-7 h-9 flex items-center justify-center rounded border transition-all duration-300
                                    ${isActiveHash ? 'ring-2 ring-yellow-400 z-10 scale-110' : ''}
                                    ${bit === 1 
                                        ? (isActiveHash ? 'bg-yellow-500/40 border-yellow-400 text-yellow-100' : 'bg-blue-600/30 border-blue-500 text-blue-100') 
                                        : 'bg-slate-800 border-slate-700 text-slate-500'}
                                `}
                            >
                                <span className="text-[9px] absolute top-0.5 left-1 opacity-50 font-mono leading-none">{i}</span>
                                <span className="text-sm font-bold font-mono">{bit}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. List L (Potential Duplicates) */}
             <div className="flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                    List L (Potential Duplicates)
                </h3>
                
                {potentialDuplicates.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-slate-600 italic border border-dashed border-slate-800 rounded-lg h-24">
                        List L is empty
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2 content-start">
                        {potentialDuplicates.map((s, idx) => {
                            // Determine status if in verification phase
                            // We need access to the original index of this potential duplicate to verify against processedSet.
                            // The string 's' is not unique enough if we have identical strings.
                            // We might need to store {string, originalIndex} in potentialDuplicates list too?
                            // In my hashUtils implementation, I pushed just the string `s`.
                            // Let's rely on the fact that we iterate consecutively.
                            // But for visualization, it's better to verify correctly.
                            // VISUAL TRICK: 
                            // If we are at Step 8 (verification), let's check the description?
                            // Or simpler: Just render them. The "Verified" boxes will appear in description.
                            // Actually, I can check if this specific string (at this L-index) is confirmed.
                            // But I don't have the original index mappings easily here without modifying state.
                            // Let's just render the strings simply for now.
                            
                            return (
                                <motion.div 
                                    layout
                                    key={`${idx}-${s}`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center justify-center px-3 py-1.5 rounded border border-slate-600 bg-slate-800 text-slate-200 font-mono text-xs min-w-[3rem]"
                                >
                                    {s}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
  }
  const NODE_RADIUS = (algorithm === AlgorithmType.TARJAN || algorithm === AlgorithmType.EULER || algorithm === AlgorithmType.GREEDY_MATCHING || algorithm === AlgorithmType.HOPCROFT_KARP || algorithm === AlgorithmType.FORD_FULKERSON || algorithm === AlgorithmType.HAMILTON_PATH) ? 14 : 18;
  const showArrows = graph.isDirected !== false;
  const isMstAlgo = algorithm === AlgorithmType.PRIM || algorithm === AlgorithmType.KRUSKAL || algorithm === AlgorithmType.BORUVKA;
  const isNodeHighlightDisabled = algorithm === AlgorithmType.KRUSKAL;
  const isFordFulkerson = algorithm === AlgorithmType.FORD_FULKERSON;

  const getNodeRadius = (node: { id: string, label: string }) => {
    if (algorithm === AlgorithmType.MINIMUM_EDGE_CUT && node.label) {
         const count = node.label.split(',').length;
         return 18 + 4.25 * (count - 1);
    }
    if (algorithm === AlgorithmType.SMALLEST_ENCLOSING_DISK && currentStep.pointWeights) {
         return 4;
    }
    if (algorithm === AlgorithmType.JARVIS_WRAP || algorithm === AlgorithmType.LOCAL_REPAIR) {
         return 6;
    }
    return NODE_RADIUS;
  };

  // Determine colors based on state
  const multiEdgeInfo = React.useMemo(() => {
    if (algorithm !== AlgorithmType.MINIMUM_EDGE_CUT) return null;
    const counts = new Map<string, number>();
    
    // First pass: count total edges between pairs
    graph.edges.forEach(e => {
        const key = [e.source, e.target].sort().join('-');
        counts.set(key, (counts.get(key) || 0) + 1);
    });
    
    // Second pass: assign index
    const info = new Map<number, { index: number, total: number }>();
    const currentCounts = new Map<string, number>();
    
    graph.edges.forEach((e, i) => {
        const key = [e.source, e.target].sort().join('-');
        const k = currentCounts.get(key) || 0;
        currentCounts.set(key, k + 1);
        const total = counts.get(key) || 1;
        info.set(i, { index: k, total });
    });
    
    return info;
  }, [graph, algorithm]);

  const getNodeColor = (nodeId: string) => {
    // KRUSKAL: Nodes never highlight
    if (isNodeHighlightDisabled) return '#64748b'; // Slate-500 (Default)

    // FORD-FULKERSON
    if (isFordFulkerson) {
        if (nodeId === 's') return '#22c55e'; // Green-500
        if (nodeId === 't') return '#ef4444'; // Red-500
        
        // Final Min-Cut Visualization
        if (currentStep.minCutSetS) {
            const isInS = currentStep.minCutSetS.includes(nodeId);
            return isInS ? '#22c55e' : '#ef4444'; // Green for S, Red for T
        }

        // Highlight active nodes in path?
        if (currentStep.path && currentStep.path.includes(nodeId)) return '#3b82f6'; // Blue-500
        return '#64748b';
    }

    // BORUVKA: Only highlight if in queue (S_i members), otherwise default
    if (algorithm === AlgorithmType.BORUVKA) {
        if (currentStep.queue.some(q => q.nodeId === nodeId)) return '#a855f7'; // Purple-500 (Component S_i)
        return '#64748b'; // Default
    }

    // BELLMAN_FORD Override: Highlight both endpoints of active edge in Blue
    if (algorithm === AlgorithmType.BELLMAN_FORD && currentStep.activeEdge) {
        if (nodeId === currentStep.activeEdge.source || nodeId === currentStep.activeEdge.target) {
            return '#3b82f6'; // Blue-500
        }
    }

    // TARJAN: Highlight Articulation Points in Red
    if (algorithm === AlgorithmType.TARJAN && currentStep.articulationPoints?.includes(nodeId)) {
        return '#ef4444'; // Red-500
    }

    // MATCHING ALGORITHM: GREEDY
    if (algorithm === AlgorithmType.GREEDY_MATCHING) {
        const isMatched = currentStep.processedSet?.includes(nodeId);
        return isMatched ? '#a855f7' : '#64748b'; // Purple-500 for matched, Slate-500 for unmatched
    }

    // MATCHING ALGORITHM: HOPCROFT-KARP
    if (algorithm === AlgorithmType.HOPCROFT_KARP) {
        // 1. Visited (BFS Search) -> Blue (Part A) or Orange (Part B)
        // Check if node is in processedSet OR in any of the computed layers
        const isInLayer = currentStep.hopcroftLayers && Object.values(currentStep.hopcroftLayers).some(layer => layer.includes(nodeId));
        
        if (currentStep.processedSet?.includes(nodeId) || isInLayer) {
            return nodeId.startsWith('A') ? '#3b82f6' : '#f97316'; // Blue-500 / Orange-500
        }
        
        return '#64748b'; // Default (Matched nodes will be handled via Stroke)
    }

    // GRAPH COLORING ALGORITHMS
    if (algorithm === AlgorithmType.GREEDY_COLORING || algorithm === AlgorithmType.SMALLEST_LAST_COLORING) {
        if (currentStep.nodeColors && currentStep.nodeColors[nodeId]) {
            const colorIndex = currentStep.nodeColors[nodeId];
            const colors = [
                '#ef4444', // 1: Red
                '#f97316', // 2: Orange
                '#eab308', // 3: Yellow
                '#22c55e', // 4: Green
                '#06b6d4', // 5: Cyan
                '#3b82f6', // 6: Blue
            ];
            return colors[(colorIndex - 1) % colors.length];
        }
        

        
        return '#64748b'; // Slate-500 (Uncolored)
    }

    // LONG PATH ALGORITHM
    if (algorithm === AlgorithmType.LONG_PATH) {
        if (currentStep.nodeColors && currentStep.nodeColors[nodeId]) {
            const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4']; // Red, Orange, Yellow, Green, Cyan
            return colors[currentStep.nodeColors[nodeId] - 1] || '#64748b';
        }
        return '#64748b';
    }
    
    // SMALLEST ENCLOSING DISK
    if (algorithm === AlgorithmType.SMALLEST_ENCLOSING_DISK) {
         if (currentStep.sedOutliers?.includes(nodeId)) return '#ef4444'; // Red
         if (currentStep.sedSampleQ?.includes(nodeId)) return '#06b6d4'; // Cyan
         return '#64748b';
    }

    if (algorithm === AlgorithmType.JARVIS_WRAP || algorithm === AlgorithmType.LOCAL_REPAIR) {
         if (currentStep.currentPoint === nodeId) return '#ef4444'; // Red
         if (currentStep.nextPointCandidate === nodeId) return '#a855f7'; // Purple
         if (currentStep.checkingPoint === nodeId) return '#eab308'; // Yellow
         if (currentStep.hull?.includes(nodeId)) return '#22c55e'; // Green
         return '#64748b';
    }

    // HAMILTON PATH
    if (algorithm === AlgorithmType.HAMILTON_PATH) {
        if (currentStep.currentNodeId === nodeId) return '#eab308'; // Yellow
        if (currentStep.currentNeighborId === nodeId) return '#3b82f6'; // Blue
        return '#64748b';
    }

    if (currentStep.currentNodeId === nodeId) return '#eab308'; // Yellow-500 (Current u)
    if (currentStep.currentNeighborId === nodeId) return '#3b82f6'; // Blue-500 (Neighbor v)
    if (currentStep.processedSet.includes(nodeId)) return '#22c55e'; // Green-500 (Processed / S)
    if (currentStep.queue.some(q => q.nodeId === nodeId)) return '#a855f7'; // Purple-500 (In Queue)
    
    // Visited but idle (Has distance)
    // We exclude Bellman-Ford from this brighter color shift as requested, keeping it the standard grey.
    if (currentStep.distances[nodeId] !== Infinity && currentStep.distances[nodeId] !== undefined) {
        if (algorithm !== AlgorithmType.BELLMAN_FORD && algorithm !== AlgorithmType.TARJAN) {
            return '#cbd5e1'; // Slate-300
        }
    }
    // For Tarjan, visited nodes (have discovery time) show as visited
    if (algorithm === AlgorithmType.TARJAN && currentStep.discoveryTimes[nodeId]) {
         return '#cbd5e1'; 
    }
    
    return '#64748b'; // Slate-500 (Unvisited) - BRIGHTER
  };

  const getEdgeColor = (source: string, target: string, edgeId?: string) => {
    let isActive = false;
    
    // Check ID first if available (for precise multi-edge highlighting)
    if (currentStep.activeEdge?.id) {
        // STRICT MODE: If an ID is provided, we MUST match it.
        // If edgeId is missing from the prop, it fails (correct).
        // If edgeId differs, it fails (correct).
        isActive = (!!edgeId && currentStep.activeEdge.id === edgeId);
    } else {
        // Fallback to source/target matching (Legacy / No ID provided)
        isActive = currentStep.activeEdge?.source === source && currentStep.activeEdge?.target === target;
        
        // Bidirectional check for Undirected graphs
        if (!isActive && graph.isDirected === false) {
            isActive = currentStep.activeEdge?.source === target && currentStep.activeEdge?.target === source;
        }
    }

    if (isActive && algorithm !== AlgorithmType.TARJAN && algorithm !== AlgorithmType.EULER && algorithm !== AlgorithmType.GREEDY_MATCHING && algorithm !== AlgorithmType.HOPCROFT_KARP && algorithm !== AlgorithmType.FORD_FULKERSON) {
        if (algorithm === AlgorithmType.BELLMAN_FORD) return '#3b82f6'; // Blue-500 for BF
        return '#ef4444'; // Red-500 for others
    }

     // FORD-FULKERSON PATH HIGHLIGHT
    if (isFordFulkerson) {
         // Final Min-Cut Highlight: S->T edges in purple
         if (currentStep.minCutSetS) {
             const sourceInS = currentStep.minCutSetS.includes(source);
             const targetInS = currentStep.minCutSetS.includes(target); // If not in S, it's in T
             
             if (sourceInS && !targetInS) return '#a855f7'; // Purple-500 (Cut Edge S->T)
         }

         if (currentStep.path) {
             // Check if edge is in path
             for (let i = 0; i < currentStep.path.length - 1; i++) {
                 if (currentStep.path[i] === source && currentStep.path[i+1] === target) return '#22c55e'; // Green path (Augmenting)
             }
         }
         return '#94a3b8';
    }

    // LONG PATH HIGHLIGHT
    if (algorithm === AlgorithmType.LONG_PATH) {
        if (currentStep.path) {
            for (let i = 0; i < currentStep.path.length - 1; i++) {
                 // Undirected check
                 if ((currentStep.path[i] === source && currentStep.path[i+1] === target) ||
                     (currentStep.path[i] === target && currentStep.path[i+1] === source)) {
                     return '#a855f7'; // Purple Path
                 }
            }
        }
        // Extended paths highlight during calculation
        if (currentStep.longPathExtendedPaths) {
             for (const path of currentStep.longPathExtendedPaths) {
                 for (let i = 0; i < path.length - 1; i++) {
                     if ((path[i] === source && path[i+1] === target) ||
                         (path[i] === target && path[i+1] === source)) {
                         return '#a855f7'; // Purple Path (during extension)
                     }
                 }
             }
        }
    }

    // HAMILTON PATH HIGHLIGHT
    if (algorithm === AlgorithmType.HAMILTON_PATH && currentStep.path) {
         for (let i = 0; i < currentStep.path.length - 1; i++) {
             // Directed graph usually for Hamilton Path but check isDirected
             if (currentStep.path[i] === source && currentStep.path[i+1] === target) return '#a855f7'; // Purple
             if (graph.isDirected === false && currentStep.path[i] === target && currentStep.path[i+1] === source) return '#a855f7';
         }
    }

    // TARJAN BRIDGE HIGHLIGHT (Persistent)
    if (algorithm === AlgorithmType.TARJAN) {
       const isBridge = currentStep.bridges?.some(b => 
          (b.source === source && b.target === target) ||
          (b.source === target && b.target === source)
       );
       if (isBridge) return '#ef4444'; // Red for Bridges
    }
    
    // DFS / Tarjan Edge Classification (Final Step)
    const classification = currentStep.edgeClassifications?.[`${source}-${target}`];
    // For Undirected Tarjan, we might index edges as u-v or v-u. Check both.
    const reverseKey = `${target}-${source}`;
    const classificationRev = currentStep.edgeClassifications?.[reverseKey];
    
    const finalClass = classification || classificationRev;

    if (finalClass && algorithm !== AlgorithmType.GREEDY_MATCHING && algorithm !== AlgorithmType.HOPCROFT_KARP) {
        // TARJAN OVERRIDE: Tree is green, all others (Back) are Grey
        if (algorithm === AlgorithmType.TARJAN) {
            if (finalClass === EdgeType.TREE) return '#22c55e'; // Green
            return '#94a3b8'; // Grey for Back edges
        }

        switch (finalClass) {
            case EdgeType.TREE: return '#22c55e'; // Green (Tree Edges remain solid green)
            case EdgeType.BACK: return '#ec489980'; // Pink-500 with 50% opacity
            case EdgeType.FORWARD: return '#38bdf880'; // Light Blue (Sky-400) with 50% opacity
            case EdgeType.CROSS: return '#a855f780'; // Purple-500 with 50% opacity
        }
    }

    // Prim/Kruskal/Boruvka MST Edges (Set F)
    if (isMstAlgo) {
       const isInF = currentStep.mstEdges?.some(e => {
          // If undirected, check both directions or if source/target match regardless of order
          if (graph.isDirected === false) {
              return (e.source === source && e.target === target) || (e.source === target && e.target === source);
          }
          return e.source === source && e.target === target
       });
       if (isInF) return '#f59e0b'; // Amber-500 (Gold) for MST
    }

    // Parent edges (Dijkstra/BFS/DFS/BF Tree) - EXCLUDE MST ALGOS
    // Disable green parent edge coloring for MST algorithms to prevent incorrect edge highlighting
    // For UNDIRECTED graphs, we must check both directions: parent[target] == source OR parent[source] == target
    const isParent = !isMstAlgo && algorithm !== AlgorithmType.EULER && (
        currentStep.parents[target] === source || 
        (graph.isDirected === false && currentStep.parents[source] === target)
    );

    if (isParent) return '#22c55e'; // Green for active path tree

    // EULER TOUR
    if (algorithm === AlgorithmType.EULER) {
        // Check Sub-Tour First (Active construction)
        if (currentStep.eulerSubTour) {
            for (let i = 0; i < currentStep.eulerSubTour.length - 1; i++) {
                const u = currentStep.eulerSubTour[i];
                const v = currentStep.eulerSubTour[i+1];
                if ((u === source && v === target) || (u === target && v === source)) {
                    return '#06b6d4'; // Cyan-500 for W'
                }
            }
        }
        
        // Check Main Tour
        if (currentStep.eulerTour) {
             for (let i = 0; i < currentStep.eulerTour.length - 1; i++) {
                const u = currentStep.eulerTour[i];
                const v = currentStep.eulerTour[i+1];
                if ((u === source && v === target) || (u === target && v === source)) {
                    return '#f97316'; // Orange-500 for W
                }
            }
        }
    }

    // MATCHING ALGORITHMS
    if (algorithm === AlgorithmType.GREEDY_MATCHING || algorithm === AlgorithmType.HOPCROFT_KARP) {
        // Check if edge is in the matching (show in purple)
        const isInMatching = currentStep.mstEdges?.some(e => {
            if ((e.source === source && e.target === target) || (e.source === target && e.target === source)) {
                return true;
            }
            return false;
        });
        
        if (isInMatching) {
            return '#a855f7'; // Purple-500 for matching edges
        }
    }

    // MINIMUM_EDGE_CUT
    if (algorithm === AlgorithmType.MINIMUM_EDGE_CUT) {
        if (currentStep.activeEdge) {
            // Use ID match if available (for precise multi-edge highlighting)
            if (currentStep.activeEdge.id) {
                if (edgeId && currentStep.activeEdge.id === edgeId) {
                    return '#ef4444'; // Red for the specific active edge
                }
            } else {
                // Fallback to source/target match if no ID
                if ((currentStep.activeEdge.source === source && currentStep.activeEdge.target === target) ||
                    (currentStep.activeEdge.source === target && currentStep.activeEdge.target === source)) {
                    return '#ef4444'; // Red for active edge
                }
            }
        }
        // If graph is contracted to 2 nodes, all remaining edges are cut edges
        if (graph.nodes.length <= 2) {
            return '#a855f7'; // Purple for cut edges
        }
    }

    return '#94a3b8'; // Slate-400 (Default edge) - BRIGHTER
  };

  const getEdgeStrokeWidth = (source: string, target: string) => {
    // For MINIMUM_EDGE_CUT, always keep default stroke width
    if (algorithm === AlgorithmType.MINIMUM_EDGE_CUT) return 1.5;

    let isActive = currentStep.activeEdge?.source === source && currentStep.activeEdge?.target === target;
    // Bidirectional check for stroke width
    if (!isActive && graph.isDirected === false) {
        isActive = currentStep.activeEdge?.source === target && currentStep.activeEdge?.target === source;
    }
    
    // Only consider parents for stroke width if NOT MST algo
    // Same bidirectional check for undirected graphs
    const isParent = !isMstAlgo && !isFordFulkerson && (
        currentStep.parents[target] === source || 
        (graph.isDirected === false && currentStep.parents[source] === target)
    );
    
    const isInF = isMstAlgo && currentStep.mstEdges?.some(e => {
        if (graph.isDirected === false) {
             return (e.source === source && e.target === target) || (e.source === target && e.target === source);
        }
        return e.source === source && e.target === target;
    });
    
    // Also bold if classified in DFS
    const isClassified = !!currentStep.edgeClassifications?.[`${source}-${target}`] || !!currentStep.edgeClassifications?.[`${target}-${source}`];
    
    // Euler Bold Logic
    let isEuler = false;
    if (algorithm === AlgorithmType.EULER && (currentStep.eulerTour || currentStep.eulerSubTour)) {
         // Check if edge is in either tour
         const checkTour = (tour: string[] | undefined) => {
             if (!tour) return false;
             for (let i = 0; i < tour.length - 1; i++) {
                const u = tour[i];
                const v = tour[i+1];
                if ((u === source && v === target) || (u === target && v === source)) return true;
             }
             return false;
         };
         isEuler = checkTour(currentStep.eulerTour) || checkTour(currentStep.eulerSubTour);
    }

    // Matching Algorithms Bold Logic
    let isInMatching = false;
    if (algorithm === AlgorithmType.GREEDY_MATCHING || algorithm === AlgorithmType.HOPCROFT_KARP) {
        isInMatching = currentStep.mstEdges?.some(e => {
            return (e.source === source && e.target === target) || (e.source === target && e.target === source);
        }) || false;
    }

    // Ford-Fulkerson Path Bold Logic
    let isFFPath = false;
    let isFFCutEdge = false;
    if (isFordFulkerson) {
        if (currentStep.path) {
             for (let i = 0; i < currentStep.path.length - 1; i++) {
                 if (currentStep.path[i] === source && currentStep.path[i+1] === target) isFFPath = true;
             }
        }
        if (currentStep.minCutSetS) {
             const sourceInS = currentStep.minCutSetS.includes(source);
             const targetInS = currentStep.minCutSetS.includes(target);
             if (sourceInS && !targetInS) isFFCutEdge = true;
        }
    }

    // Long Path Bold Logic
    let isLongPathEdge = false;
    if (algorithm === AlgorithmType.LONG_PATH) {
        if (currentStep.path) {
            for (let i = 0; i < currentStep.path.length - 1; i++) {
                 // Undirected check
                 if ((currentStep.path[i] === source && currentStep.path[i+1] === target) ||
                     (currentStep.path[i] === target && currentStep.path[i+1] === source)) {
                     isLongPathEdge = true;
                 }
            }
        }
        if (currentStep.longPathExtendedPaths) {
             for (const path of currentStep.longPathExtendedPaths) {
                 for (let i = 0; i < path.length - 1; i++) {
                     if ((path[i] === source && path[i+1] === target) ||
                         (path[i] === target && path[i+1] === source)) {
                         isLongPathEdge = true;
                     }
                 }
             }
        }
    }

    // Hamilton Path Bold Logic
    let isHamiltonPathEdge = false;
    if (algorithm === AlgorithmType.HAMILTON_PATH && currentStep.path) {
        for (let i = 0; i < currentStep.path.length - 1; i++) {
            if (currentStep.path[i] === source && currentStep.path[i+1] === target) isHamiltonPathEdge = true;
            if (graph.isDirected === false && currentStep.path[i] === target && currentStep.path[i+1] === source) isHamiltonPathEdge = true;
        }
    }


    return isActive || isParent || isInF || isClassified || isEuler || isInMatching || isFFPath || isFFCutEdge || isLongPathEdge || isHamiltonPathEdge ? 3 : 1.5;
  };

  const showWeights = algorithm === AlgorithmType.DIJKSTRA || algorithm === AlgorithmType.BELLMAN_FORD || isMstAlgo || isFordFulkerson;

  return (
    <div className="relative w-full h-full">
      <svg width={width} height={height} className="overflow-visible block">
        {/* Augmenting Path Highlight (Hopcroft-Karp) - Drawn BELOW edges */}
        {currentStep.currentAugmentingPath && currentStep.currentAugmentingPath.length > 1 && (
            <g>
                {currentStep.currentAugmentingPath.map((nodeId, i) => {
                    if (i === currentStep.currentAugmentingPath!.length - 1) return null;
                    const nextId = currentStep.currentAugmentingPath![i + 1];
                    const start = graph.nodes.find(n => n.id === nodeId);
                    const end = graph.nodes.find(n => n.id === nextId);
                    
                    if (!start || !end) return null;

                    return (
                        <motion.line
                            key={`augment-path-${i}`}
                            x1={start.x}
                            y1={start.y}
                            x2={end.x}
                            y2={end.y}
                            stroke="#22c55e" // Green-500
                            strokeWidth={12}
                            strokeOpacity={0.6}
                            fill="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.6 }}
                            transition={{ duration: 0.4 }}
                        />
                    );
                })}
            </g>
        )}

        {/* Smallest Enclosing Disk - The Disk */}
        {algorithm === AlgorithmType.SMALLEST_ENCLOSING_DISK && currentStep.sedDisk && (
            <motion.circle
                cx={currentStep.sedDisk.x}
                cy={currentStep.sedDisk.y}
                r={currentStep.sedDisk.r}
                fill="rgba(14, 165, 233, 0.1)" // Sky-500 optimized opacity
                stroke="#0ea5e9" // Sky-500
                strokeWidth={2}
                initial={{ opacity: 0 }}
                animate={{ 
                    cx: currentStep.sedDisk.x, 
                    cy: currentStep.sedDisk.y, 
                    r: currentStep.sedDisk.r, 
                    opacity: 1 
                }}
                transition={{ duration: 0.5 }}
            />
        )}

        {/* Jarvis Wrap Lines - Drawn before nodes */}
        {(algorithm === AlgorithmType.JARVIS_WRAP || algorithm === AlgorithmType.LOCAL_REPAIR) && (
            <g>
                {/* Local Repair: Sorted Path Lines (Background) */}
                {algorithm === AlgorithmType.LOCAL_REPAIR && currentStep.localRepairSortedPath?.map((line, i) => {
                     const start = graph.nodes.find(n => n.id === line.from);
                     const end = graph.nodes.find(n => n.id === line.to);
                     if (!start || !end) return null;
                     return (
                         <motion.line
                             key={`sorted-line-${i}`}
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 0.5 }}
                             x1={start.x} y1={start.y}
                             x2={end.x} y2={end.y}
                             stroke="#94a3b8" // Slate-400
                             strokeWidth={2}
                             strokeDasharray="6,4"
                         />
                     );
                })}

                {/* Hull Lines */}
                {currentStep.hullLines?.map((line, i) => {
                     const start = graph.nodes.find(n => n.id === line.from);
                     const end = graph.nodes.find(n => n.id === line.to);
                     if (!start || !end) return null;
                     return (
                         <motion.line
                             key={`hull-line-${i}`}
                             x1={start.x} y1={start.y}
                             x2={end.x} y2={end.y}
                             stroke="#22c55e" strokeWidth={3}
                             initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                         />
                     );
                })}
                {/* Scan Line (Current -> Candidate or Current -> Checking) */}
                {currentStep.scanLine && (
                     (() => {
                         const start = graph.nodes.find(n => n.id === currentStep.scanLine!.from);
                         const end = graph.nodes.find(n => n.id === currentStep.scanLine!.to);
                         if (!start || !end) return null;
                         return (
                             <motion.line
                                 x1={start.x} y1={start.y}
                                 x2={end.x} y2={end.y}
                                 stroke="#eab308" strokeWidth={2} strokeDasharray="5,5" // Dashed Yellow
                                 animate={{ x2: end.x, y2: end.y }}
                             />
                         );
                     })()
                )}
            </g>
        )}


        {/* Edges as Quadratic Bezier Curves */}
        <g>
          {graph.edges.map((edge, i) => {
            const start = graph.nodes.find(n => n.id === edge.source)!;
            const end = graph.nodes.find(n => n.id === edge.target)!;
            const color = getEdgeColor(edge.source, edge.target, edge.id);
            const strokeWidth = getEdgeStrokeWidth(edge.source, edge.target);
            
            // Check for reverse edge to increase curve curvature (only relevant for directed)
            const hasReverse = graph.isDirected !== false && graph.edges.some(e => e.source === edge.target && e.target === edge.source);
            
            // Bezier Control Point Logic
            // Midpoint
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            
            // Perpendicular Vector (dy, -dx)
            const deltaX = end.x - start.x;
            const deltaY = end.y - start.y;
            const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            // Offset amount
            let offset = 0;
            if (graph.isDirected !== false && hasReverse) offset = 20; // Separates two directions

            // Curved Edges (Random 50/50 but stable)
            if (algorithm === AlgorithmType.TARJAN || algorithm === AlgorithmType.GREEDY_MATCHING || algorithm === AlgorithmType.LONG_PATH || algorithm === AlgorithmType.EULER || algorithm === AlgorithmType.DFS || algorithm === AlgorithmType.BFS || algorithm === AlgorithmType.DIJKSTRA || algorithm === AlgorithmType.BELLMAN_FORD || algorithm === AlgorithmType.BORUVKA || algorithm === AlgorithmType.KRUSKAL || algorithm === AlgorithmType.PRIM) {
                // Deterministic random based on edge IDs to strictly avoid jitter on re-render
                // Simple hash of source + target
                const sum = (edge.source + edge.target).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                offset = (sum % 2 === 0) ? 25 : -25;
            }
            
            // MIN EDGE CUT MULTI-EDGE HANDLING
            if (algorithm === AlgorithmType.MINIMUM_EDGE_CUT && multiEdgeInfo) {
                const info = multiEdgeInfo.get(i);
                if (info && info.total > 1) {
                    // Spread curves
                    // If 2 edges: -20, +20
                    // If 3 edges: -30, 0, +30
                    const spacing = 40;
                    offset = (info.index - (info.total - 1) / 2) * spacing;

                    if (edge.source > edge.target) {
                        offset = -offset;
                    }
                }
            }

            const perpX = -deltaY / (dist || 1); // Normalize
            const perpY = deltaX / (dist || 1);
            
            const cx = midX + perpX * offset;
            const cy = midY + perpY * offset;
            
            const pathD = `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;
            
            // Label Position (t=0.5 for Q Bezier)
            // B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
            const labelX = 0.25 * start.x + 0.5 * cx + 0.25 * end.x;
            const labelY = 0.25 * start.y + 0.5 * cy + 0.25 * end.y;
            
            // For arrows: calculate angle at end? 
            // Derivative B'(t) = 2(1-t)(P1-P0) + 2t(P2-P1)
            // At t=1: 2(P2-P1). Vector from Control to End.
            const arrowVectorX = end.x - cx;
            const arrowVectorY = end.y - cy;
            let arrowAngle = Math.atan2(arrowVectorY, arrowVectorX) * 180 / Math.PI;
            
            // Adjust arrow position slightly back from node radius
            // Node radius ~ 18.
            const arrDist = Math.sqrt(arrowVectorX * arrowVectorX + arrowVectorY * arrowVectorY);
            // Move back by node radius
            
            // We want arrow tip at node surface.
            // B(t) closest to node surface? 
            // Simple approx: standard arrow placement logic usually works if straight line.
            // For bezier, we might need accurate t. 
            // For now, simple vector subtract from end point is decent.
            let arrowX = end.x - (end.x - cx) / (arrDist || 1) * NODE_RADIUS;
            let arrowY = end.y - (end.y - cy) / (arrDist || 1) * NODE_RADIUS;
            
            // Middle Arrow Logic for Directed Algorithms
            const isMidArrowAlgo = [AlgorithmType.DFS, AlgorithmType.BFS, AlgorithmType.DIJKSTRA, AlgorithmType.BELLMAN_FORD, AlgorithmType.TARJAN, AlgorithmType.EULER, AlgorithmType.FORD_FULKERSON].includes(algorithm);
            if (isMidArrowAlgo) {
                 const hasLabel = showWeights || isFordFulkerson; 
                 // If label exists (weights/flow), move to t=0.65 to avoid overlap. Else t=0.5 (perfect middle).
                 const t = hasLabel ? 0.65 : 0.5;

                 const oneMinusT = 1 - t;
                 const tSq = t * t;

                 // Bezier Point B(t)
                 arrowX = oneMinusT * oneMinusT * start.x + 2 * oneMinusT * t * cx + tSq * end.x;
                 arrowY = oneMinusT * oneMinusT * start.y + 2 * oneMinusT * t * cy + tSq * end.y;

                 // Tangent B'(t)
                 const tx = 2 * oneMinusT * (cx - start.x) + 2 * t * (end.x - cx);
                 const ty = 2 * oneMinusT * (cy - start.y) + 2 * t * (end.y - cy);

                 arrowAngle = Math.atan2(ty, tx) * 180 / Math.PI;
            }
            
            // TARJAN LOGIC
            let showTarjanArrow = false;
            let tarjanReverse = false;
            let tNormalClass, tRevClass, tNormalParent, tRevParent;

            if (algorithm === AlgorithmType.TARJAN) {
                tNormalClass = currentStep.edgeClassifications?.[`${edge.source}-${edge.target}`];
                tRevClass = currentStep.edgeClassifications?.[`${edge.target}-${edge.source}`];
                tNormalParent = currentStep.parents[edge.target] === edge.source;
                tRevParent = currentStep.parents[edge.source] === edge.target;
            } else if (algorithm === AlgorithmType.EULER) {
                // Euler check logic similar...
                tNormalClass = isInLoop(currentStep.eulerTour, edge.source, edge.target) || isInLoop(currentStep.eulerSubTour, edge.source, edge.target);
                tRevClass = isInLoop(currentStep.eulerTour, edge.target, edge.source) || isInLoop(currentStep.eulerSubTour, edge.target, edge.source);
            }

            function isInLoop(tour: string[] | undefined, u: string, v: string) {
                if (!tour) return false;
                for(let k=0; k<tour.length-1; k++) {
                    if(tour[k] === u && tour[k+1] === v) return true;
                }
                return false;
            }

            // EULER DIRECTION LOGIC
            let showEulerArrow = false;
            let eulerReverse = false;

            if (algorithm === AlgorithmType.TARJAN) {
                // ... (Tarjan logic omitted for brevity, same as before) ...
                 const isTreeNormal = (tNormalClass === EdgeType.TREE) || tNormalParent;
                 const isTreeRev = (tRevClass === EdgeType.TREE) || tRevParent;
                 if (isTreeNormal) { showTarjanArrow = true; tarjanReverse = false; }
                 else if (isTreeRev) { showTarjanArrow = true; tarjanReverse = true; }
                 else {
                     const dSource = currentStep.discoveryTimes[edge.source];
                     const dTarget = currentStep.discoveryTimes[edge.target];
                     if (dSource !== undefined && dTarget !== undefined) {
                         showTarjanArrow = true;
                         if (dSource > dTarget) tarjanReverse = false;
                         else tarjanReverse = true;
                     }
                 }
            } else if (algorithm === AlgorithmType.EULER) {
                 if (tNormalClass) { showEulerArrow = true; eulerReverse = false; }
                 else if (tRevClass) { showEulerArrow = true; eulerReverse = true; }
            }
            
            // VISIBILITY LOGIC
            let opacity = 1;
            if (algorithm === AlgorithmType.EULER) {
                 const isEulerVisited = tNormalClass || tRevClass;
                 const isFinal = currentStep.description.startsWith("Algorithm Complete") || currentStep.description.startsWith("Eulerian Circuit found") || currentStep.description.startsWith("Graph has");
                 if (isEulerVisited && !isFinal) opacity = 0;
            }

            if (algorithm === AlgorithmType.GREEDY_MATCHING) {
                const isRemoved = currentStep.edgeClassifications?.[`${edge.source}-${edge.target}`] === EdgeType.CROSS || 
                                 currentStep.edgeClassifications?.[`${edge.target}-${edge.source}`] === EdgeType.CROSS;
                const isFinal = currentStep.description.startsWith("Algorithm Complete");
                if (isRemoved && !isFinal) opacity = 0;
            }

            if (algorithm === AlgorithmType.SMALLEST_LAST_COLORING) {
                const isSourceRemoved = currentStep.processedSet.includes(edge.source);
                const isTargetRemoved = currentStep.processedSet.includes(edge.target);
                if (isSourceRemoved || isTargetRemoved) opacity = 0;
            }

            return (
              <g key={edge.id || `${edge.source}-${edge.target}-${i}`}>
                {/* The Edge Line */}
                <motion.path
                  initial={false}
                  animate={{ d: pathD, stroke: color, strokeWidth: strokeWidth, opacity: opacity }}
                  transition={{ duration: 0.5 }}
                  fill="none"
                  strokeLinecap="round"
                />

                {(showArrows || showTarjanArrow || showEulerArrow) && opacity > 0 && (
                  <motion.path
                    d="M -4 -5 L 4 0 L -4 5 z" 
                    initial={false}
                    animate={{ 
                      fill: color, 
                      transform: `translate(${arrowX}px, ${arrowY}px) rotate(${arrowAngle + (tarjanReverse || eulerReverse ? 180 : 0)}deg) scale(${strokeWidth > 2 ? 1.4 : 1.2})` 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Edge Weight Label */}
                {showWeights && (
                  <>
                    <circle cx={labelX} cy={labelY} r={isFordFulkerson ? 14 : 8} fill="#1e293b" />
                    <text
                      x={labelX}
                      y={labelY}
                      dy=".3em"
                      textAnchor="middle"
                      className="text-[10px] fill-slate-300 font-mono select-none pointer-events-none font-bold"
                    >
                      {isFordFulkerson ? (
                        <>
                          <tspan fill="#3b82f6">{currentStep.edgeFlows?.[`${edge.source}-${edge.target}`] ?? 0}</tspan>
                          <tspan fill="#cbd5e1">/{edge.capacity}</tspan>
                        </>
                      ) : (
                        edge.weight
                      )}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {graph.nodes.map((node) => {
            const dist = currentStep.distances[node.id];
            const distLabel = (dist === undefined || dist === Infinity) ? '∞' : dist;
            const bgColor = getNodeColor(node.id);

            let badgeText = distLabel.toString();
            let showBadge = true;
            
            if (algorithm === AlgorithmType.SMALLEST_ENCLOSING_DISK) {
                const w = currentStep.pointWeights?.[node.id] || 1;
                badgeText = w.toString();
                showBadge = w > 1;
            } else if (algorithm === AlgorithmType.DFS) {
               // ... DFS logic
               const d = currentStep.discoveryTimes[node.id];
               const f = currentStep.finishTimes[node.id];
               if (d) badgeText = `${d}/${f || '?'}`; else showBadge = false;
            } else if (algorithm === AlgorithmType.TARJAN) {
               // ... Tarjan logic
               const d = currentStep.discoveryTimes[node.id];
               const low = currentStep.lowLinks?.[node.id];
               if (d) badgeText = `${d}/${low !== undefined ? low : '?'}`; else showBadge = false;
            } else if (algorithm === AlgorithmType.JARVIS_WRAP || algorithm === AlgorithmType.LOCAL_REPAIR) {
                 showBadge = false;
            } else if (isMstAlgo || algorithm === AlgorithmType.EULER || algorithm === AlgorithmType.GREEDY_MATCHING || algorithm === AlgorithmType.HOPCROFT_KARP || algorithm === AlgorithmType.GREEDY_COLORING || algorithm === AlgorithmType.SMALLEST_LAST_COLORING || isFordFulkerson || algorithm === AlgorithmType.LONG_PATH || algorithm === AlgorithmType.HAMILTON_PATH || algorithm === AlgorithmType.MINIMUM_EDGE_CUT) {
                showBadge = false;
            }

            let nodeOpacity = 1;
            // ... (Matching & Coloring visibility logic) ...
            if (algorithm === AlgorithmType.GREEDY_MATCHING) {
                const isNodeRemoved = currentStep.processedSet?.includes(node.id);
                const isFinal = currentStep.description.startsWith("Algorithm Complete");
                if (isNodeRemoved && !isFinal) nodeOpacity = 0;
            }
            if (algorithm === AlgorithmType.SMALLEST_LAST_COLORING) {
                if (currentStep.processedSet?.includes(node.id)) nodeOpacity = 0;
            }

            return (
              <g key={node.id} className="transition-all duration-300" style={{ opacity: nodeOpacity }}>
                <motion.circle
                  initial={false}
                  animate={{ 
                    cx: node.x,
                    cy: node.y,
                    fill: bgColor, 
                    stroke: (() => {
                      if (isNodeHighlightDisabled) return 'none';
                      if (algorithm === AlgorithmType.BELLMAN_FORD) return 'none';
                      if ((algorithm === AlgorithmType.GREEDY_MATCHING || algorithm === AlgorithmType.HOPCROFT_KARP) && currentStep.activeEdge) {
                        const isEndpoint = node.id === currentStep.activeEdge.source || node.id === currentStep.activeEdge.target;
                        return isEndpoint ? '#fff' : 'none';
                      }
                      // Long Path Extended Nodes
                      if (algorithm === AlgorithmType.LONG_PATH && currentStep.longPathExtendedPaths) {
                          const isInExtendedPath = currentStep.longPathExtendedPaths.some(p => p.includes(node.id));
                          if (isInExtendedPath) return '#a855f7'; // Purple border
                      }
                      
                      if (algorithm === AlgorithmType.HOPCROFT_KARP) {
                          const isMatched = currentStep.mstEdges?.some(e => e.source === node.id || e.target === node.id);
                          if (isMatched) return '#a855f7'; 
                      }
                      
                      if (algorithm === AlgorithmType.SMALLEST_LAST_COLORING && currentStep.minDegreeNode === node.id) {
                          return '#eab308'; // Yellow-500 border
                      }
                      
                      // Hamilton Path Stroke
                      if (algorithm === AlgorithmType.HAMILTON_PATH && currentStep.path?.includes(node.id)) {
                          // Exclude current node and neighbor which have their own fills/strokes usually?
                          // But here we want the "purple border" for the path.
                          // Current node is yellow fill, Neighbor is blue fill.
                          // If we add purple stroke, it helps.
                          return '#a855f7'; 
                      }

                      return 'none';
                    })(),
                    strokeWidth: (() => {
                      if (algorithm === AlgorithmType.LONG_PATH && currentStep.longPathExtendedPaths) {
                          const isInExtendedPath = currentStep.longPathExtendedPaths.some(p => p.includes(node.id));
                          if (isInExtendedPath) return 3;
                      }
                      if (algorithm === AlgorithmType.HOPCROFT_KARP) {
                          const isMatched = currentStep.mstEdges?.some(e => e.source === node.id || e.target === node.id);
                          const isActiveEndpoint = currentStep.activeEdge && (node.id === currentStep.activeEdge.source || node.id === currentStep.activeEdge.target);
                          if (isMatched && !isActiveEndpoint) return 4;
                      }
                      if (algorithm === AlgorithmType.SMALLEST_LAST_COLORING && currentStep.minDegreeNode === node.id) {
                          return 4; // Bolder border for min degree node
                      }
                      
                      if (algorithm === AlgorithmType.HAMILTON_PATH && currentStep.path?.includes(node.id)) {
                          return 3;
                      }
                      
                      return 2;
                    })()
                  }}
                  r={getNodeRadius(node)}
                  transition={{ duration: 0.5 }}
                />
                
                {algorithm !== AlgorithmType.SMALLEST_ENCLOSING_DISK && (
                <motion.text
                  initial={false}
                  animate={{ x: node.x, y: node.y }}
                  transition={{ duration: 0.5 }}
                  dy=".35em"
                  textAnchor="middle"
                  className="text-xs font-bold fill-white pointer-events-none select-none"
                  style={{ fontSize: (algorithm === AlgorithmType.TARJAN || algorithm === AlgorithmType.EULER || algorithm === AlgorithmType.GREEDY_MATCHING || algorithm === AlgorithmType.HOPCROFT_KARP || isFordFulkerson) ? '10px' : '12px' }}
                >
                  {node.label}
                </motion.text>
                )}
                
                {showBadge && (
                  <motion.g 
                    initial={false}
                    animate={{ x: node.x + (algorithm === AlgorithmType.SMALLEST_ENCLOSING_DISK ? 6 : (algorithm === AlgorithmType.TARJAN ? 8 : 12)), y: node.y - (algorithm === AlgorithmType.SMALLEST_ENCLOSING_DISK ? 8 : (algorithm === AlgorithmType.TARJAN ? 10 : 12)) }}
                  >
                    <rect x="0" y="-10" width={algorithm === AlgorithmType.DFS || algorithm === AlgorithmType.TARJAN ? 34 : 24} height="14" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                    <text x={algorithm === AlgorithmType.DFS || algorithm === AlgorithmType.TARJAN ? 17 : 12} y="-1" textAnchor="middle" className="text-[9px] fill-white font-mono">
                      {badgeText}
                    </text>
                  </motion.g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      
      {/* Legend for Ford-Fulkerson */}
      {isFordFulkerson && (
        <div className="absolute top-2 left-2 bg-slate-800/80 backdrop-blur-sm p-2 rounded-lg border border-slate-700 pointer-events-none">
            <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-blue-500 font-bold">flow value</span>
                <span className="text-slate-400">/</span>
                <span className="text-slate-300">capacity</span>
            </div>
        </div>
      )}

      {/* Total Flow Display for Ford-Fulkerson */}
      {isFordFulkerson && currentStep.totalFlow !== undefined && (
        <div className="absolute top-2 right-2 bg-slate-800/80 backdrop-blur-sm p-2 rounded-lg border border-slate-700 pointer-events-none">
            <div className="text-xs font-mono font-bold text-white">
                val(f) = <span className="text-blue-500">{currentStep.totalFlow}</span>
            </div>
        </div>
      )}
    </div>
  );
};

export default GraphCanvas;
