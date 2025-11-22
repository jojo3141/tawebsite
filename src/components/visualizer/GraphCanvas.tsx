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
  const NODE_RADIUS = 18;
  const showArrows = graph.isDirected !== false;
  const isMstAlgo = algorithm === AlgorithmType.PRIM || algorithm === AlgorithmType.KRUSKAL || algorithm === AlgorithmType.BORUVKA;
  const isNodeHighlightDisabled = algorithm === AlgorithmType.KRUSKAL;

  // Helper for Bezier Math
  const getPointOnBezier = (t: number, p0: number, p1: number, p2: number) => {
    return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  };

  // Determine colors based on state
  const getNodeColor = (nodeId: string) => {
    // KRUSKAL: Nodes never highlight
    if (isNodeHighlightDisabled) return '#64748b'; // Slate-500 (Default)

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

    if (currentStep.currentNodeId === nodeId) return '#eab308'; // Yellow-500 (Current u)
    if (currentStep.currentNeighborId === nodeId) return '#3b82f6'; // Blue-500 (Neighbor v)
    if (currentStep.processedSet.includes(nodeId)) return '#22c55e'; // Green-500 (Processed / S)
    if (currentStep.queue.some(q => q.nodeId === nodeId)) return '#a855f7'; // Purple-500 (In Queue)
    
    // Visited but idle (Has distance)
    // We exclude Bellman-Ford from this brighter color shift as requested, keeping it the standard grey.
    if (currentStep.distances[nodeId] !== Infinity && currentStep.distances[nodeId] !== undefined) {
        if (algorithm !== AlgorithmType.BELLMAN_FORD) {
            return '#cbd5e1'; // Slate-300 (Visited but idle) - BRIGHTER
        }
    }
    
    return '#64748b'; // Slate-500 (Unvisited) - BRIGHTER
  };

  const getEdgeColor = (source: string, target: string) => {
    let isActive = currentStep.activeEdge?.source === source && currentStep.activeEdge?.target === target;
    
    // Bidirectional check for Undirected graphs
    if (!isActive && graph.isDirected === false) {
        isActive = currentStep.activeEdge?.source === target && currentStep.activeEdge?.target === source;
    }

    if (isActive) {
        if (algorithm === AlgorithmType.BELLMAN_FORD) return '#3b82f6'; // Blue-500 for BF
        return '#ef4444'; // Red-500 for others
    }
    
    // DFS Edge Classification (Final Step)
    const classification = currentStep.edgeClassifications?.[`${source}-${target}`];
    if (classification) {
        switch (classification) {
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
    const isParent = !isMstAlgo && (
        currentStep.parents[target] === source || 
        (graph.isDirected === false && currentStep.parents[source] === target)
    );

    if (isParent) return '#22c55e'; // Green for active path tree

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
    const isParent = !isMstAlgo && (
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
    const isClassified = !!currentStep.edgeClassifications?.[`${source}-${target}`];
    
    return isActive || isParent || isInF || isClassified ? 3 : 1.5;
  };

  const showWeights = algorithm === AlgorithmType.DIJKSTRA || algorithm === AlgorithmType.BELLMAN_FORD || isMstAlgo;

  return (
    <div className="relative w-full h-full">
      <svg width={width} height={height} className="bg-slate-900 border border-slate-700 rounded-xl shadow-inner overflow-visible">
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
            
            // Offset amount: 
            // Adaptive: If hasReverse, curve more (70). Default 50.
            // Constraint: Do not exceed 25% of edge length to prevent extremely sharp loops on short edges.
            const baseOffset = hasReverse ? 70 : 50;
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

            // Arrow Placement:
            // Position: t=0.5 (Exact midpoint/peak of the curve)
            // Angle: Parallel to the chord (Start -> End) because at t=0.5 of a symmetric quadratic bezier, 
            // the tangent is strictly parallel to the line connecting P0 and P2.
            const arrowT = 0.5;
            const arrowX = getPointOnBezier(arrowT, start.x, cpX, end.x);
            const arrowY = getPointOnBezier(arrowT, start.y, cpY, end.y);
            
            // Calculate Exact Angle (Start -> End vector)
            // This avoids jitter from derivative calculations on short curves
            const arrowAngle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);

            return (
              <g key={`${edge.source}-${edge.target}-${i}`}>
                {/* The Edge Line */}
                <motion.path
                  initial={false}
                  d={pathD}
                  animate={{ stroke: color, strokeWidth: strokeWidth }}
                  transition={{ duration: 0.3 }}
                  fill="none"
                  strokeLinecap="round"
                />

                {/* The Arrow Head (Manually positioned on curve) - ONLY IF DIRECTED */}
                {showArrows && (
                  <motion.path
                    d="M -4 -5 L 4 0 L -4 5 z" 
                    // Centered Arrow Geometry:
                    // Tip at x=4 (Forward), Base at x=-4 (Back)
                    initial={false}
                    animate={{ 
                      fill: color, 
                      transform: `translate(${arrowX}px, ${arrowY}px) rotate(${arrowAngle}deg) scale(${strokeWidth > 2 ? 1.4 : 1.2})` 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Edge Weight Label - Only for Dijkstra & Bellman-Ford & Prim & Kruskal & Boruvka */}
                {showWeights && (
                  <>
                    <circle cx={labelX} cy={labelY} r="8" fill="#1e293b" />
                    <text
                      x={labelX}
                      y={labelY}
                      dy=".3em"
                      textAnchor="middle"
                      className="text-[10px] fill-slate-300 font-mono select-none pointer-events-none font-bold"
                    >
                      {edge.weight}
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
            // Safely handle undefined distance (can happen in init steps)
            const distLabel = (dist === undefined || dist === Infinity) ? '∞' : dist;
            const bgColor = getNodeColor(node.id);

            // Logic for the info badge
            let badgeText = distLabel.toString();
            let showBadge = true;
            
            if (algorithm === AlgorithmType.DFS) {
              const d = currentStep.discoveryTimes[node.id];
              const f = currentStep.finishTimes[node.id];
              if (d) {
                  badgeText = `${d}/${f || '?'}`;
              } else {
                  showBadge = false;
              }
            } else if (isMstAlgo) {
                // For Prim/Kruskal/Boruvka, distance label isn't primary focus
                // We hide badges for all MST algorithms (including Prim)
                showBadge = false;
            }

            return (
              <g key={node.id} className="transition-all duration-300">
                {/* Main Node Circle */}
                <motion.circle
                  initial={false}
                  animate={{ 
                    fill: bgColor, 
                    // Disable white highlight stroke for Bellman-Ford to remove "white circle" around active nodes
                    stroke: (!isNodeHighlightDisabled && currentStep.currentNodeId === node.id && algorithm !== AlgorithmType.BELLMAN_FORD) ? '#fff' : 'none' 
                  }}
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  className="transition-all duration-300"
                  strokeWidth={2}
                />
                <text
                  x={node.x}
                  y={node.y}
                  dy=".35em"
                  textAnchor="middle"
                  className="text-xs font-bold fill-white pointer-events-none select-none"
                >
                  {node.label}
                </text>
                
                {/* Distance / Info Label Badge */}
                {showBadge && (
                  <g transform={`translate(${node.x + 12}, ${node.y - 12})`}>
                    <rect x="0" y="-10" width={algorithm === AlgorithmType.DFS ? 34 : 24} height="14" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                    <text x={algorithm === AlgorithmType.DFS ? 17 : 12} y="-1" textAnchor="middle" className="text-[9px] fill-white font-mono">
                      {badgeText}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default GraphCanvas;