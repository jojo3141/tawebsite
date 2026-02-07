
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

const GraphCanvas: React.FC<GraphCanvasProps> = ({ graph, currentStep, width, height, algorithm }) => {
  
  // Constants for styling
  const NODE_RADIUS = (algorithm === AlgorithmType.TARJAN || algorithm === AlgorithmType.EULER || algorithm === AlgorithmType.GREEDY_MATCHING || algorithm === AlgorithmType.HOPCROFT_KARP || algorithm === AlgorithmType.FORD_FULKERSON) ? 14 : 18;
  const showArrows = graph.isDirected !== false;
  const isMstAlgo = algorithm === AlgorithmType.PRIM || algorithm === AlgorithmType.KRUSKAL || algorithm === AlgorithmType.BORUVKA;
  const isNodeHighlightDisabled = algorithm === AlgorithmType.KRUSKAL;
  const isFordFulkerson = algorithm === AlgorithmType.FORD_FULKERSON;

  // Helper for Bezier Math
  const getPointOnBezier = (t: number, p0: number, p1: number, p2: number) => {
    return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  };

  // Determine colors based on state
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
        
        // Highlight active node (being colored) in Yellow
        if (currentStep.currentNodeId === nodeId) return '#eab308'; // Yellow-500
        
        return '#64748b'; // Slate-500 (Uncolored)
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

  const getEdgeColor = (source: string, target: string) => {
    let isActive = currentStep.activeEdge?.source === source && currentStep.activeEdge?.target === target;
    
    // Bidirectional check for Undirected graphs
    if (!isActive && graph.isDirected === false) {
        isActive = currentStep.activeEdge?.source === target && currentStep.activeEdge?.target === source;
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

    return '#94a3b8'; // Slate-400 (Default edge) - BRIGHTER
  };

  const getEdgeStrokeWidth = (source: string, target: string) => {
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

    return isActive || isParent || isInF || isClassified || isEuler || isInMatching || isFFPath || isFFCutEdge ? 3 : 1.5;
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

        {/* Edges as Quadratic Bezier Curves */}
        <g>
          {graph.edges.map((edge, i) => {
            const start = graph.nodes.find(n => n.id === edge.source)!;
            const end = graph.nodes.find(n => n.id === edge.target)!;
            const color = getEdgeColor(edge.source, edge.target);
            const strokeWidth = getEdgeStrokeWidth(edge.source, edge.target);
            
            // Check for reverse edge to increase curve curvature (only relevant for directed)
            const hasReverse = graph.isDirected !== false && graph.edges.some(e => e.source === edge.target && e.target === edge.source);
            
            // Calculate control point for quadratic bezier (start -> control -> end)
            // Midpoint
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            
            // Vector from start to end
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const len = Math.hypot(dx, dy);
            
            // Normal vector (rotated 90 degrees)
            const nx = -dy / len;
            const ny = dx / len;
            
            // Offset amount
            let baseOffset = hasReverse ? 70 : 50;
            if (algorithm === AlgorithmType.HOPCROFT_KARP || algorithm === AlgorithmType.GREEDY_COLORING || algorithm === AlgorithmType.SMALLEST_LAST_COLORING || algorithm === AlgorithmType.FORD_FULKERSON) {
              baseOffset = 0; // Straight lines
            }
            const offset = Math.min(baseOffset, len * 0.25);
            
            // Control point coordinates
            const cpX = midX + nx * offset;
            const cpY = midY + ny * offset;

            // Path definition
            const pathD = `M ${start.x} ${start.y} Q ${cpX} ${cpY} ${end.x} ${end.y}`;

            // Calculate Label Position (Shifted to t=0.7 to avoid arrow overlap)
            const labelT = 0.7;
            const labelX = getPointOnBezier(labelT, start.x, cpX, end.x);
            const labelY = getPointOnBezier(labelT, start.y, cpY, end.y);

            // Arrow Placement
            const arrowT = 0.5;
            const arrowX = getPointOnBezier(arrowT, start.x, cpX, end.x);
            const arrowY = getPointOnBezier(arrowT, start.y, cpY, end.y);
            
            const arrowAngle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);

            // TARJAN DIRECTION LOGIC
            const tNormalClass = currentStep.edgeClassifications?.[`${edge.source}-${edge.target}`];
            const tRevClass = currentStep.edgeClassifications?.[`${edge.target}-${edge.source}`];
            const tNormalParent = currentStep.parents[edge.target] === edge.source; 
            const tRevParent = currentStep.parents[edge.source] === edge.target;

            let showTarjanArrow = false;
            let tarjanReverse = false;

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
              <g key={`${edge.source}-${edge.target}-${i}`}>
                {/* The Edge Line */}
                <motion.path
                  initial={false}
                  d={pathD}
                  animate={{ stroke: color, strokeWidth: strokeWidth, opacity: opacity }}
                  transition={{ duration: 0.3 }}
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
            
            if (algorithm === AlgorithmType.DFS) {
               // ... DFS logic
               const d = currentStep.discoveryTimes[node.id];
               const f = currentStep.finishTimes[node.id];
               if (d) badgeText = `${d}/${f || '?'}`; else showBadge = false;
            } else if (algorithm === AlgorithmType.TARJAN) {
               // ... Tarjan logic
               const d = currentStep.discoveryTimes[node.id];
               const low = currentStep.lowLinks?.[node.id];
               if (d) badgeText = `${d}/${low !== undefined ? low : '?'}`; else showBadge = false;
            } else if (isMstAlgo || algorithm === AlgorithmType.EULER || algorithm === AlgorithmType.GREEDY_MATCHING || algorithm === AlgorithmType.HOPCROFT_KARP || algorithm === AlgorithmType.GREEDY_COLORING || algorithm === AlgorithmType.SMALLEST_LAST_COLORING || isFordFulkerson) {
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
                    fill: bgColor, 
                    stroke: (() => {
                      if (isNodeHighlightDisabled) return 'none';
                      if (algorithm === AlgorithmType.BELLMAN_FORD) return 'none';
                      if ((algorithm === AlgorithmType.GREEDY_MATCHING || algorithm === AlgorithmType.HOPCROFT_KARP) && currentStep.activeEdge) {
                        const isEndpoint = node.id === currentStep.activeEdge.source || node.id === currentStep.activeEdge.target;
                        return isEndpoint ? '#fff' : 'none';
                      }
                      if (algorithm === AlgorithmType.HOPCROFT_KARP) {
                          const isMatched = currentStep.mstEdges?.some(e => e.source === node.id || e.target === node.id);
                          if (isMatched) return '#a855f7'; 
                      }
                      return 'none';
                    })(),
                    strokeWidth: (() => {
                      if (algorithm === AlgorithmType.HOPCROFT_KARP) {
                          const isMatched = currentStep.mstEdges?.some(e => e.source === node.id || e.target === node.id);
                          const isActiveEndpoint = currentStep.activeEdge && (node.id === currentStep.activeEdge.source || node.id === currentStep.activeEdge.target);
                          if (isMatched && !isActiveEndpoint) return 4;
                      }
                      return 2;
                    })()
                  }}
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  className="transition-all duration-300"
                />
                <text
                  x={node.x}
                  y={node.y}
                  dy=".35em"
                  textAnchor="middle"
                  className="text-xs font-bold fill-white pointer-events-none select-none"
                  style={{ fontSize: (algorithm === AlgorithmType.TARJAN || algorithm === AlgorithmType.EULER || algorithm === AlgorithmType.GREEDY_MATCHING || algorithm === AlgorithmType.HOPCROFT_KARP || isFordFulkerson) ? '10px' : '12px' }}
                >
                  {node.label}
                </text>
                
                {showBadge && (
                  <g transform={`translate(${node.x + (algorithm === AlgorithmType.TARJAN ? 8 : 12)}, ${node.y - (algorithm === AlgorithmType.TARJAN ? 10 : 12)})`}>
                    <rect x="0" y="-10" width={algorithm === AlgorithmType.DFS || algorithm === AlgorithmType.TARJAN ? 34 : 24} height="14" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                    <text x={algorithm === AlgorithmType.DFS || algorithm === AlgorithmType.TARJAN ? 17 : 12} y="-1" textAnchor="middle" className="text-[9px] fill-white font-mono">
                      {badgeText}
                    </text>
                  </g>
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
