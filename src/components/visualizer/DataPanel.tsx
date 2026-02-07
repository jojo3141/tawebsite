
import React, { useRef, useEffect, useMemo } from 'react';
import { AlgorithmStep, AlgorithmType, Graph } from '@/types/graph';
import { motion, AnimatePresence } from 'framer-motion';
import { Infinity as InfinityIcon } from 'lucide-react';

interface DataPanelProps {
  step: AlgorithmStep;
  algorithm: AlgorithmType;
  graph: Graph;
}

// --- INTERNAL COMPONENT: SEARCH TREE VISUALIZER ---
const SearchTreeVisualizer: React.FC<{ step: AlgorithmStep; algorithm: AlgorithmType }> = ({ step, algorithm }) => {
    
    const treeData = useMemo(() => {
        const nodes: { id: string, x: number, y: number }[] = [];
        const links: { source: string, target: string }[] = [];
        const childrenMap: Record<string, string[]> = {};
        const roots: string[] = [];
        
        // Identify valid nodes for the tree
        const validNodes = new Set<string>();
        
        if (algorithm === AlgorithmType.BFS || algorithm === AlgorithmType.DIJKSTRA || algorithm === AlgorithmType.BELLMAN_FORD) {
            Object.entries(step.distances).forEach(([id, d]) => {
                if (d !== Infinity) validNodes.add(id);
            });
        } else if (algorithm === AlgorithmType.DFS) {
            Object.keys(step.discoveryTimes).forEach(id => validNodes.add(id));
        }

        // Build hierarchy
        validNodes.forEach(nodeId => {
            const parent = step.parents[nodeId];
            if (parent && validNodes.has(parent)) {
                if (!childrenMap[parent]) childrenMap[parent] = [];
                childrenMap[parent].push(nodeId);
            } else {
                // It's a root if it has no parent (or parent not in valid set yet)
                roots.push(nodeId);
            }
        });

        // Sort for deterministic layout
        roots.sort();
        Object.values(childrenMap).forEach(list => list.sort());

        // Layout Algorithm (Recursive Reingold-Tilford simplified)
        let leafCounter = 0;
        
        const traverse = (u: string, depth: number): { minX: number, maxX: number } => {
            const myChildren = childrenMap[u] || [];
            
            if (myChildren.length === 0) {
                // Leaf
                const x = leafCounter++;
                nodes.push({ id: u, x, y: depth });
                return { minX: x, maxX: x };
            }

            let minC = Infinity;
            let maxC = -Infinity;

            myChildren.forEach(v => {
                const { minX, maxX } = traverse(v, depth + 1);
                minC = Math.min(minC, minX);
                maxC = Math.max(maxC, maxX);
            });

            // Parent centered above children
            const myX = (minC + maxC) / 2;
            nodes.push({ id: u, x: myX, y: depth });
            
            // Add links (These are inherently TREE edges)
            myChildren.forEach(v => links.push({ source: u, target: v }));

            return { minX: minC, maxX: maxC };
        };

        roots.forEach(root => {
            traverse(root, 0);
            leafCounter += 0.5; 
        });

        return { nodes, links, width: leafCounter };
    }, [step.parents, step.distances, step.discoveryTimes, algorithm]);

    if (treeData.nodes.length === 0) {
        return <div className="h-full flex items-center justify-center text-slate-600 text-sm italic">Tree Empty</div>;
    }

    // Scaling
    const X_SCALE = 50;
    const Y_SCALE = 60;
    const RADIUS = 14;
    const PADDING_X = 40;
    const PADDING_Y = 40;
    
    const svgWidth = Math.max(100, treeData.width * X_SCALE + PADDING_X * 2);
    const svgHeight = Math.max(100, Math.max(...treeData.nodes.map(n => n.y)) * Y_SCALE + PADDING_Y * 2);

    return (
        <div className="overflow-auto w-full h-full">
            <svg width={svgWidth} height={svgHeight} className="block mx-auto overflow-visible">
                <g transform={`translate(${PADDING_X}, ${PADDING_Y})`}>
                    
                    {/* 1. Standard Tree Links (Parent Pointers) */}
                    {treeData.links.map(link => {
                        const src = treeData.nodes.find(n => n.id === link.source)!;
                        const tgt = treeData.nodes.find(n => n.id === link.target)!;
                        
                        // Use static grey for tree links in the search tree visualization
                        const color = '#475569';
                        const strokeWidth = 2;

                        return (
                            <motion.line
                                key={`tree-${link.source}-${link.target}`}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                x1={src.x * X_SCALE}
                                y1={src.y * Y_SCALE}
                                x2={tgt.x * X_SCALE}
                                y2={tgt.y * Y_SCALE}
                                stroke={color}
                                strokeWidth={strokeWidth}
                            />
                        );
                    })}
                    
                    {/* Nodes */}
                    {treeData.nodes.map(node => {
                        const isCurrent = node.id === step.currentNodeId;
                        const isNeighbor = node.id === step.currentNeighborId;
                        
                        return (
                            <g key={node.id} transform={`translate(${node.x * X_SCALE}, ${node.y * Y_SCALE})`}>
                                <motion.circle
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    r={RADIUS}
                                    fill={isCurrent ? '#eab308' : (isNeighbor ? '#3b82f6' : '#1e293b')}
                                    stroke={isCurrent ? '#fff' : '#64748b'}
                                    strokeWidth="2"
                                />
                                <text
                                    dy=".35em"
                                    textAnchor="middle"
                                    className="text-[10px] font-bold fill-slate-200 pointer-events-none"
                                >
                                    {node.id}
                                </text>
                            </g>
                        )
                    })}
                </g>
            </svg>
        </div>
    );
};


const DataPanel: React.FC<DataPanelProps> = ({ step, algorithm, graph }) => {
  
  const listRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const activeEdgeRef = useRef<HTMLDivElement>(null);
  const activeComponentRef = useRef<HTMLDivElement>(null);
  
  // Refs for Kruskal's sorted list
  const sortedListRef = useRef<HTMLDivElement>(null);
  const activeSortedEdgeRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic:
  useEffect(() => {
    // 1. General Queue/Stack Scrolling (Left Panel)
    if (algorithm === AlgorithmType.DFS && listRef.current) {
        // Auto-scroll to top for DFS stack
        listRef.current.scrollTop = 0;
    }

    // 2. Bellman Ford Edge List Scrolling (Keep this as it highlights active item)
    if (algorithm === AlgorithmType.BELLMAN_FORD && listRef.current) {
        setTimeout(() => {
            if (activeEdgeRef.current && listRef.current) {
                const container = listRef.current;
                const element = activeEdgeRef.current;
                const topPos = element.offsetTop - 4; 
                container.scrollTo({ top: topPos, behavior: 'smooth' });
            }
        }, 50);
    }

    // 3. Kruskal Sorted Edge List Scrolling
    if (algorithm === AlgorithmType.KRUSKAL && sortedListRef.current) {
        setTimeout(() => {
            if (activeSortedEdgeRef.current && sortedListRef.current) {
                const container = sortedListRef.current;
                const element = activeSortedEdgeRef.current;
                // Scroll active edge to the very top
                const topPos = element.offsetTop; 
                container.scrollTo({ top: topPos, behavior: 'smooth' });
            }
        }, 50);
    }

    // 4. Boruvka Right Panel Scrolling (Active Component)
    if (algorithm === AlgorithmType.BORUVKA && rightPanelRef.current) {
        setTimeout(() => {
            if (activeComponentRef.current && rightPanelRef.current) {
                const container = rightPanelRef.current;
                const element = activeComponentRef.current;
                // Scroll active component to the very top
                const topPos = element.offsetTop;
                container.scrollTo({ top: topPos, behavior: 'smooth' });
            }
        }, 50);
    }

  }, [step.stepId, algorithm]); 

  // Calculate Level Sets for BFS
  const levelSets: Record<number, string[]> = {};
  if (algorithm === AlgorithmType.BFS) {
    Object.entries(step.distances).forEach(([node, dist]) => {
      const d = dist as number;
      if (d !== Infinity) {
        if (!levelSets[d]) levelSets[d] = [];
        levelSets[d].push(node);
      }
    });
  }
  
  // Calculate Components for Kruskal/Boruvka (Disjoint Sets)
  const componentSets: Record<string, string[]> = {};
  if (algorithm === AlgorithmType.KRUSKAL || algorithm === AlgorithmType.BORUVKA) {
      const findRoot = (node: string, parents: Record<string, string | null>): string => {
          let curr = node;
          let p = parents[curr];
          let hops = 0;
          while (p && p !== curr && hops < 20) {
             curr = p;
             p = parents[curr];
             hops++;
          }
          return curr;
      };

      Object.keys(step.parents).forEach(node => {
          const root = findRoot(node, step.parents);
          if (!componentSets[root]) componentSets[root] = [];
          componentSets[root].push(node);
      });
  }

  // Sort edges for Bellman-Ford display
  let bfSortedEdges: {source: string, target: string, weight: number}[] = [];
  if (algorithm === AlgorithmType.BELLMAN_FORD) {
      const baseEdges = [...graph.edges].sort((a, b) => {
        if (a.source === b.source) return a.target.localeCompare(b.target);
        return a.source.localeCompare(b.source);
      });

      if (graph.isDirected !== false) {
        bfSortedEdges = baseEdges;
      } else {
          baseEdges.forEach(edge => {
             bfSortedEdges.push({ source: edge.source, target: edge.target, weight: edge.weight });
             bfSortedEdges.push({ source: edge.target, target: edge.source, weight: edge.weight });
          });
      }
  }

  // Sort edges for Kruskal display (Must match solver sort)
  let kruskalSortedEdges: {source: string, target: string, weight: number}[] = [];
  if (algorithm === AlgorithmType.KRUSKAL) {
      kruskalSortedEdges = [...graph.edges].sort((a, b) => {
        if (a.weight !== b.weight) return a.weight - b.weight;
        if (a.source !== b.source) return a.source.localeCompare(b.source);
        return a.target.localeCompare(b.target);
    });
  }

  const getLeftPanelTitle = () => {
    if (algorithm === AlgorithmType.DFS) return 'Recursion Stack';
    if (algorithm === AlgorithmType.DIJKSTRA) return 'Priority Queue (Q)';
    if (algorithm === AlgorithmType.PRIM || algorithm === AlgorithmType.KRUSKAL || algorithm === AlgorithmType.BORUVKA) return 'MST EDGES (F)';
    if (algorithm === AlgorithmType.EULER) return 'Current Tour (W)';
    return 'Queue (Q)';
  }

  const getRightPanelTitle = () => {
      if (algorithm === AlgorithmType.BFS) return 'Level Sets';
      if (algorithm === AlgorithmType.PRIM) return 'MST NODES (S)';
      if (algorithm === AlgorithmType.KRUSKAL) return 'Connected Components';
      if (algorithm === AlgorithmType.BORUVKA) return 'Components & Min Edges';
      if (algorithm === AlgorithmType.DFS) return 'Visited';
      if (algorithm === AlgorithmType.DIJKSTRA) return 'Finalized Nodes (S)';
      return 'Visited / Processed';
  }

  const isBellman = algorithm === AlgorithmType.BELLMAN_FORD;
  const isKruskal = algorithm === AlgorithmType.KRUSKAL;
  const isEuler = algorithm === AlgorithmType.EULER;
  const isGreedyMatching = algorithm === AlgorithmType.GREEDY_MATCHING;
  const isHopcroftKarp = algorithm === AlgorithmType.HOPCROFT_KARP;
  const isGreedyColoring = algorithm === AlgorithmType.GREEDY_COLORING;
  const isSmallestLastColoring = algorithm === AlgorithmType.SMALLEST_LAST_COLORING;
  const isFordFulkerson = algorithm === AlgorithmType.FORD_FULKERSON;
  const isColoringAlgorithm = isGreedyColoring || isSmallestLastColoring;
  
  const topSectionClass = isBellman ? 'flex' : (isKruskal ? 'grid grid-cols-3 gap-4' : (isEuler || isGreedyMatching || isHopcroftKarp || isColoringAlgorithm || isFordFulkerson ? 'flex flex-col gap-4' : 'grid grid-cols-2 gap-4'));

  // --- BORUVKA SCROLL TARGET LOGIC ---
  let boruvkaScrollTargetRoot: string | null = null;
  if (algorithm === AlgorithmType.BORUVKA) {
    const roots = Object.keys(componentSets).sort();
    const activeRoots: string[] = [];

    roots.forEach(root => {
        const minEdgeEntry = step.boruvkaMinEdges?.find(entry => entry.root === root);
        const isQueueActive = step.queue.some(q => componentSets[root].includes(q.nodeId));
        const isEdgeActive = step.activeEdge && minEdgeEntry && (
            (step.activeEdge.source === minEdgeEntry.edge.source && step.activeEdge.target === minEdgeEntry.edge.target) ||
            (step.activeEdge.source === minEdgeEntry.edge.target && step.activeEdge.target === minEdgeEntry.edge.source)
        );
        if (isQueueActive || isEdgeActive) {
            activeRoots.push(root);
        }
    });

    if (activeRoots.length > 0) {
        if (step.lineNumber === 6) {
            boruvkaScrollTargetRoot = activeRoots[0];
        } 
        else {
            boruvkaScrollTargetRoot = activeRoots[activeRoots.length - 1];
        }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      
      {/* --- TOP SECTION: STRUCTURES --- */}
      <div className={`${algorithm === AlgorithmType.TARJAN ? 'hidden' : (isHopcroftKarp || isFordFulkerson ? 'h-auto' : 'h-64')} ${topSectionClass}`}>
        
        {/* GRAPH COLORING: NODE ORDER PANEL (Replaces standard Queue/Visited panels) */}
        {(algorithm === AlgorithmType.GREEDY_COLORING || algorithm === AlgorithmType.SMALLEST_LAST_COLORING) ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden w-full col-span-2">
                <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-orange-400 uppercase tracking-wider">
                   {algorithm === AlgorithmType.SMALLEST_LAST_COLORING ? 'Smallest-Last Order' : 'Greedy Coloring Order'}
                </div>
                <div className="p-3 overflow-auto flex-1 font-mono text-sm">
                   {step.stack && step.stack.length > 0 ? (
                       <div className="flex flex-wrap items-center gap-2">
                           <span className="text-slate-500 mr-2">Order:</span>
                           {step.stack.map((node, i) => {
                               const isProcessed = step.processedSet.includes(node);
                               const isCurrent = step.currentNodeId === node;
                               
                               // Determine style based on state
                               const isColored = step.nodeColors && step.nodeColors[node];
                               const fillClass = isColored ? "bg-green-700 text-green-100" : "bg-slate-700 text-slate-400";
                               const currentClass = isCurrent ? "ring-2 ring-yellow-500 font-bold" : "";
                               const styleClass = `${fillClass} ${currentClass}`;
                               
                               return (
                                   <div key={i} className="flex items-center">
                                       <span className={`px-2 py-1 rounded text-xs transition-colors ${styleClass}`}>
                                           {node}
                                       </span>
                                       {i < step.stack!.length - 1 && (
                                           <span className="text-slate-600 mx-1">→</span>
                                       )}
                                   </div>
                               );
                           })}
                       </div>
                   ) : (
                       <div className="text-slate-500 italic">Determining Order...</div>
                   )}
                   
                   {/* Legend for Colors */}
                   <div className="mt-4 pt-4 border-t border-slate-700/50 flex gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-700 rounded-sm ring-2 ring-yellow-500"></div> Current</div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-700 rounded-sm"></div> Colored</div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-700 rounded-sm"></div> Pending</div>
                   </div>
                </div>
            </div>
        ) : isFordFulkerson ? (
        /* FORD-FULKERSON SPECIFIC PANEL */
           <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden w-full h-[450px]">
               <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                   <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">Residual Network</div>
               </div>
               <div className="flex-1 relative bg-slate-900/50 flex flex-col">
               <div className="px-4 pt-2 text-[13px] text-slate-400 font-mono leading-tight">
                        For all e=(u,v) ∈ A:<br/>
                        • IF <span className="text-teal-400">c(e) &gt; f(e)</span>: add edge <span className="text-teal-400 font-bold">(u,v)</span> with residual capacity <span className="text-teal-400 font-bold">c(e) - f(e)</span><br/>
                        • IF <span className="text-amber-400">f(e) &gt; 0</span>: add reversed edge <span className="text-amber-400 font-bold">(v,u)</span> with residual capacity <span className="text-amber-400 font-bold">f(e)</span>
                    </div>

                    {/* Compact ViewBox since it's a panel */}
                    <svg width="100%" height="100%" viewBox="0 0 600 420" preserveAspectRatio="xMidYMid meet">
                         <defs>
                            <marker id="arrowhead-teal" markerWidth="6" markerHeight="4" refX="14" refY="2" orient="auto">
                                <polygon points="0 0, 6 2, 0 4" fill="#2dd4bf" />
                            </marker>
                            <marker id="arrowhead-amber" markerWidth="6" markerHeight="4" refX="14" refY="2" orient="auto">
                                <polygon points="0 0, 6 2, 0 4" fill="#f59e0b" />
                            </marker>
                            <marker id="arrowhead-green" markerWidth="6" markerHeight="4" refX="14" refY="2" orient="auto">
                                <polygon points="0 0, 6 2, 0 4" fill="#22c55e" />
                            </marker>
                        </defs>
                        
                        {/* Edges */}
                        {step.residualEdges?.map((edge, i) => {
                            const start = graph.nodes.find(n => n.id === edge.source);
                            const end = graph.nodes.find(n => n.id === edge.target);
                            if (!start || !end) return null;
                            if (edge.capacity <= 0) return null;

                            // Curve logic similar to graph canvas but simpler
                            // Just check for reverse edge in residual set
                            const hasReverse = step.residualEdges!.some(e => e.source === edge.target && e.target === edge.source && e.capacity > 0);
                            
                            let pathD = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
                            let labelX = (start.x + end.x) / 2;
                            let labelY = (start.y + end.y) / 2;
                            
                            // If has reverse, curve slightly
                            if (hasReverse) {
                                const dx = end.x - start.x;
                                const dy = end.y - start.y;
                                const len = Math.hypot(dx, dy);
                                const nx = -dy / len;
                                const ny = dx / len;
                                const offset = 20; 
                                const cpX = ((start.x + end.x) / 2) + nx * offset;
                                const cpY = ((start.y + end.y) / 2) + ny * offset;
                                pathD = `M ${start.x} ${start.y} Q ${cpX} ${cpY} ${end.x} ${end.y}`;
                                
                                // Approx label position on curve
                                labelX = ((1-0.5)*(1-0.5)*start.x + 2*(1-0.5)*0.5*cpX + 0.5*0.5*end.x);
                                labelY = ((1-0.5)*(1-0.5)*start.y + 2*(1-0.5)*0.5*cpY + 0.5*0.5*end.y);
                            }

                            // Determine Edge Color based on Backward (Reversed) status
                            const isBackward = edge.isBackward;
                            const edgeColor = isBackward ? "#f59e0b" : "#2dd4bf"; // Amber-500 vs Teal-400

                            // Highlight Logic: Is this edge part of the found path?
                            // path is node ID list
                            let isPath = false;
                            if (step.path) {
                                for(let k=0; k<step.path.length-1; k++){
                                    if(step.path[k]===edge.source && step.path[k+1]===edge.target) isPath=true;
                                }
                            }

                            return (
                                <g key={`${i}-res`}>
                                    <path 
                                        d={pathD} 
                                        stroke={isPath ? "#22c55e" : edgeColor} // Green-500 if path, else edge color
                                        strokeWidth={isPath ? 3 : 1.5}
                                        fill="none" 
                                        markerEnd={isPath ? "url(#arrowhead-green)" : (isBackward ? "url(#arrowhead-amber)" : "url(#arrowhead-teal)")}
                                        opacity={0.8}
                                    />
                                    <circle cx={labelX} cy={labelY} r="8" fill="#0f172a" />
                                    <text 
                                        x={labelX} y={labelY} dy=".3em" textAnchor="middle" 
                                        className={`text-[10px] font-mono font-bold ${isPath ? 'fill-green-500' : (isBackward ? 'fill-amber-500' : 'fill-teal-400')}`}
                                    >
                                        {edge.capacity}
                                    </text>
                                </g>
                            )
                        })}

                        {/* Nodes */}
                        {graph.nodes.map(node => (
                             <g key={`${node.id}-res`}>
                                <circle 
                                    cx={node.x} cy={node.y} r={12} 
                                    fill={
                                        step.minCutSetS 
                                        ? (step.minCutSetS.includes(node.id) ? '#22c55e' : '#ef4444') 
                                        : (node.id === 's' ? '#22c55e' : (node.id === 't' ? '#ef4444' : '#1e293b'))
                                    } 
                                    stroke="#334155" 
                                    strokeWidth="1"
                                />
                                <text 
                                    x={node.x} y={node.y} dy=".35em" textAnchor="middle" 
                                    className="text-[10px] fill-slate-300 font-bold pointer-events-none"
                                >
                                    {node.label}
                                </text>
                             </g>
                        ))}
                    </svg>
                    
                    {/* Legend */}
                     <div className="absolute bottom-4 left-4 flex gap-4 text-[10px] bg-slate-900/80 p-2 rounded backdrop-blur-sm border border-slate-700">
                          <div className="flex items-center gap-1">
                              <div className="w-3 h-0.5 bg-teal-400"></div>
                              <span className="text-teal-400">Residual Edge</span>
                          </div>
                          <div className="flex items-center gap-1">
                              <div className="w-3 h-0.5 bg-amber-400"></div>
                              <span className="text-amber-400">Backward Edge</span>
                          </div>
                          <div className="flex items-center gap-1">
                              <div className="w-3 h-1 bg-green-500"></div>
                              <span className="text-green-500">Augmenting Path</span>
                          </div>
                     </div>
               </div>
           </div>
        ) : (
        /* STANDARD PANELS FOR OTHER ALGORITHMS */
        <>
            {isBellman ? (
           <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden w-full">
             <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-indigo-300 uppercase tracking-wider">
               Edge Order
             </div>
             <div 
               ref={listRef}
               className="p-2 overflow-auto flex-1 relative"
             >
               {bfSortedEdges.map((edge, idx) => {
                 const isActive = step.activeEdge?.source === edge.source && step.activeEdge?.target === edge.target;
                 return (
                   <div 
                     key={`${edge.source}-${edge.target}-${idx}`} 
                     ref={isActive ? activeEdgeRef : null}
                     className={`flex justify-between items-center px-3 py-2 mb-1 rounded text-sm font-mono transition-colors ${
                       isActive 
                         ? 'bg-indigo-600/40 border border-indigo-500 text-white' 
                         : 'bg-slate-700/20 text-slate-500 border border-transparent'
                     }`}
                   >
                     <span>({edge.source} → {edge.target})</span>
                     <span className="text-xs">w: {edge.weight}</span>
                   </div>
                 );
               })}
             </div>
           </div>
        ) : isEuler ? (
           // EULER VIEWS
           <>
              <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden w-full">
                  <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-amber-500 uppercase tracking-wider">
                      Tour Construction (W)
                  </div>
                  <div className="p-3 overflow-auto flex-1 font-mono text-sm">
                      {step.eulerTour && step.eulerTour.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1">
                            {step.eulerTour.map((node, i) => (
                                <React.Fragment key={i}>
                                    <span className={`${node === step.currentNodeId ? 'text-yellow-400 font-bold underline' : 'text-slate-300'}`}>
                                        {node}
                                    </span>
                                    {i < step.eulerTour!.length - 1 && <span className="text-slate-600">→</span>}
                                </React.Fragment>
                            ))}
                        </div>
                      ) : <span className="text-slate-600 italic">Starting...</span>}
                  </div>
              </div>
              
              {step.eulerSubTour && (
                  <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden w-full">
                      <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                          Sub-Tour (W')
                      </div>
                      <div className="p-3 overflow-auto flex-1 font-mono text-sm">
                          <div className="flex flex-wrap items-center gap-1">
                              {step.eulerSubTour.map((node, i) => (
                                  <React.Fragment key={i}>
                                      <span className="text-cyan-200">{node}</span>
                                      {i < step.eulerSubTour!.length - 1 && <span className="text-cyan-700">→</span>}
                                  </React.Fragment>
                              ))}
                          </div>
                      </div>
                  </div>
              )}
           </>
        ) : (isGreedyMatching || isHopcroftKarp) ? (
           // MATCHING ALGORITHMS VIEWS (Greedy Matching & Hopcroft-Karp)
           <>
              <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden w-full max-h-48">
                  <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-violet-400 uppercase tracking-wider">
                      Matching Edges (M)
                  </div>
                  <div className="p-3 overflow-auto flex-1 font-mono text-sm">
                      {step.mstEdges && step.mstEdges.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {step.mstEdges.map((edge, idx) => (
                            <div 
                              key={`${edge.source}-${edge.target}-${idx}`}
                              className="flex items-center gap-2 bg-violet-900/30 border border-violet-700/50 px-3 py-1.5 rounded text-violet-200"
                            >
                              <span>{`{${edge.source}, ${edge.target}}`}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-500 italic">M = ∅</div>
                      )}
                  </div>
              </div>
               {/* Hopcroft-Karp Layers Panel - Always show for Hopcroft-Karp */}
               {isHopcroftKarp && (
                 <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden w-full">
                   <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                     BFS Layers
                   </div>
                   <div className="p-3 overflow-auto flex-1">
                     {/* Visual Layer Graph */}
                     <div className="mb-4 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                       
                         {(() => {
                           const layerNums = Object.keys(step.hopcroftLayers!)
                             .map(Number)
                             .sort((a, b) => a - b);
                           
                           const layerHeight = 130;
                           const nodeRadius = 20;
                           const startY = 40;

                           // Calculate dynamic height: start + (layers * height) + padding
                           // Ensure min-height of 400 for aesthetics
                           const contentHeight = startY + (Math.max(layerNums.length, 1) * layerHeight) + 40;
                           const viewBoxHeight = Math.max(100, contentHeight);
                           
                           // Calculate node positions
                           const nodePositions: Record<string, { x: number; y: number; layer: number }> = {};
                           
                           layerNums.forEach((layerNum) => {
                             const nodes = step.hopcroftLayers![layerNum] || [];
                             const layerY = startY + layerNum * layerHeight;
                             const totalWidth = 500;
                             const spacing = nodes.length > 1 ? totalWidth / (nodes.length - 1) : 0;
                             const offsetX = 50;
                             
                             nodes.forEach((node, idx) => {
                               nodePositions[node] = {
                                 x: offsetX + (nodes.length === 1 ? totalWidth / 2 : idx * spacing),
                                 y: layerY,
                                 layer: layerNum
                               };
                             });
                           });
                           
                           // Get edges from graph
                           const matchingEdges = new Set(
                             (step.mstEdges || []).map(e => `${e.source}-${e.target}`)
                           );
                           
                           // Draw edges between consecutive layers
                           const edges: React.JSX.Element[] = [];
                           
                           // Create set of actual graph edges
                           const graphEdges = new Set(
                             graph.edges.map(e => `${e.source}-${e.target}`)
                           );
                           
                           // Create set of augmenting path edges (for backtracking visualization)
                           const augmentingPathEdges = new Set<string>();
                           if (step.augmentingPathsSet) {
                             step.augmentingPathsSet.forEach(path => {
                               for (let i = 0; i < path.length - 1; i++) {
                                 augmentingPathEdges.add(`${path[i]}-${path[i+1]}`);
                                 augmentingPathEdges.add(`${path[i+1]}-${path[i]}`);
                               }
                             });
                           }
                           
                           layerNums.forEach((layerNum, idx) => {
                             if (idx < layerNums.length - 1) {
                               const currentLayer = step.hopcroftLayers![layerNum] || [];
                               const nextLayer = step.hopcroftLayers![layerNums[idx + 1]] || [];
                               
                               currentLayer.forEach((node1) => {
                                 nextLayer.forEach((node2) => {
                                   const pos1 = nodePositions[node1];
                                   const pos2 = nodePositions[node2];
                                   
                                   // Check if this edge exists in the graph
                                   const edgeKey1 = `${node1}-${node2}`;
                                   const edgeKey2 = `${node2}-${node1}`;
                                   const edgeExists = graphEdges.has(edgeKey1) || graphEdges.has(edgeKey2);
                                   
                                   // Only draw if edge exists in graph
                                   if (pos1 && pos2 && edgeExists) {
                                     const isMatching = matchingEdges.has(edgeKey1) || matchingEdges.has(edgeKey2);

                                     // Constraint: Edges from Odd layer (L1, L3...) to Even layer MUST be matching edges
                                     if (layerNum % 2 !== 0 && !isMatching) {
                                       return;
                                     }
                                     const isInAugmentingPath = augmentingPathEdges.has(edgeKey1) || augmentingPathEdges.has(edgeKey2);
                                     
                                     // Determine color: green for augmenting paths, purple for matching, gray for others
                                     let strokeColor = '#94a3b8'; // even brighter gray
                                     let strokeWidth = 2;
                                     let strokeOpacity = 0.7;
                                     
                                     if (isInAugmentingPath) {
                                       strokeColor = '#10b981'; // green for augmenting paths
                                       strokeWidth = 4;
                                       strokeOpacity = 0.9;
                                     } else if (isMatching) {
                                       strokeColor = '#a855f7'; // purple for matching
                                       strokeWidth = 2;
                                       strokeOpacity = 0.8;
                                     }
                                     
                                     edges.push(
                                       <line
                                         key={`${node1}-${node2}`}
                                         x1={pos1.x}
                                         y1={pos1.y}
                                         x2={pos2.x}
                                         y2={pos2.y}
                                         stroke={strokeColor}
                                         strokeWidth={strokeWidth}
                                         opacity={strokeOpacity}
                                       />
                                     );
                                   }
                                 });
                               });
                             }
                           });
                           
                           // Identify matched nodes to highlight
                           const matchedNodes = new Set<string>();
                           (step.mstEdges || []).forEach(e => {
                             matchedNodes.add(e.source);
                             matchedNodes.add(e.target);
                           });

                           // Draw nodes
                           const nodes: React.JSX.Element[] = [];
                           Object.entries(nodePositions).forEach(([node, pos]) => {
                             const isEven = pos.layer % 2 === 0;
                             const isMatched = matchedNodes.has(node);

                             const fillColor = isEven ? '#3b82f6' : '#f97316'; // blue : orange
                             // If matched, use purple border; otherwise use lighter variant of fill
                             const strokeColor = isMatched ? '#a855f7' : (isEven ? '#60a5fa' : '#fb923c');
                             const strokeWidth = isMatched ? 4 : 2;
                             
                             nodes.push(
                               <g key={node}>
                                 <circle
                                   cx={pos.x}
                                   cy={pos.y}
                                   r={nodeRadius}
                                   fill={fillColor}
                                   stroke={strokeColor}
                                   strokeWidth={strokeWidth}
                                 />
                                 <text
                                   x={pos.x}
                                   y={pos.y}
                                   textAnchor="middle"
                                   dominantBaseline="middle"
                                   fill="white"
                                   fontSize="12"
                                   fontWeight="bold"
                                 >
                                   {node}
                                 </text>
                               </g>
                             );
                           });
                           
                           // Draw layer labels
                           const layerLabels: React.JSX.Element[] = [];
                           layerNums.forEach((layerNum) => {
                             const layerY = startY + layerNum * layerHeight;
                             layerLabels.push(
                               <text
                                 key={`label-${layerNum}`}
                                 x={0}
                                 y={layerY}
                                 textAnchor="start"
                                 dominantBaseline="middle"
                                 fill= {layerNum % 2 === 0 ? '#3b82f6' : '#f97316'} // blue : orange
                                 fontSize="14"
                                 fontWeight="bold"
                                 fontFamily="monospace"
                               >
                                 L<tspan baselineShift="sub" fontSize="10">{layerNum}</tspan>:
                               </text>
                             );
                           });
                           
                           return (
                             <svg width="100%" height="auto" viewBox={`0 0 600 ${viewBoxHeight}`} style={{ minHeight: '5rem' }}>
                                {edges}
                                {nodes}
                                {layerLabels}
                              </svg>
                           );
                         })()}
                       
                       {/* Legend */}
                       <div className="flex items-center justify-center gap-4 mt-3 text-xs flex-wrap">
                         <div className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-400" />
                           <span className="text-slate-300">Even Layers</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-400" />
                           <span className="text-slate-300">Odd Layers</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded-full bg-transparent border-3 border-purple-500" />
                           <span className="text-slate-300">Node is covered by Matching</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="w-8 h-1 bg-emerald-500 rounded" />
                           <span className="text-slate-300">Augmenting Path Edges</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="w-8 h-0.5 bg-purple-500" />
                           <span className="text-slate-300">Matching Edges</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="w-8 h-0.5 bg-slate-500 opacity-30" />
                           <span className="text-slate-300">Other Edges</span>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               )}


               {/* Hopcroft-Karp Augmenting Paths Set S - Always show */}
               {isHopcroftKarp && (
                 <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden w-full max-h-64">
                   <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                     Augmenting Paths Set S
                   </div>
                   <div className="p-3 overflow-auto flex-1">
                     {step.augmentingPathsSet && step.augmentingPathsSet.length > 0 ? (
                       <div className="space-y-2">
                         {step.augmentingPathsSet.map((path, idx) => (
                           <div key={idx} className="flex items-center gap-3">
                             <span className="text-xs font-mono text-slate-500 w-8 shrink-0">
                               P{idx + 1}:
                             </span>
                             <div className="flex items-center gap-1 bg-emerald-900/20 border border-emerald-700/40 px-3 py-1.5 rounded flex-wrap">
                               {path.map((node, nodeIdx) => (
                                 <React.Fragment key={nodeIdx}>
                                   <span className="text-emerald-200 font-mono text-sm font-bold">{node}</span>
                                   {nodeIdx < path.length - 1 && (
                                     <span className="text-emerald-600 mx-1">→</span>
                                   )}
                                 </React.Fragment>
                               ))}
                             </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div className="text-slate-500 italic">S = ∅</div>
                     )}
                   </div>
                 </div>
               )}
           </>

        ) : algorithm !== AlgorithmType.TARJAN && (
          <>

            {/* PANEL 1: Queue / Stack / Set F */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
              <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-purple-400 uppercase tracking-wider">
                {getLeftPanelTitle()}
              </div>
              <div 
                ref={listRef}
                className={`p-2 overflow-auto flex-1 gap-1 flex flex-col`}
              >
                <AnimatePresence initial={false}>
                  {/* DFS Stack View */}
                  {algorithm === AlgorithmType.DFS && (
                    step.stack.length === 0 ? <div className="text-slate-600 text-center text-xs py-4 italic">Empty</div> :
                    [...step.stack].reverse().map((nodeId, idx) => (
                      <motion.div
                        key={`${nodeId}-${step.stack.length - 1 - idx}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-purple-900/30 border-l-2 border-purple-500 px-3 py-2 rounded text-sm text-purple-200 font-mono shrink-0"
                      >
                        DFS-VISIT({nodeId})
                      </motion.div>
                    ))
                  )}

                  {/* Prim / Kruskal / Boruvka MST View */}
                  {(algorithm === AlgorithmType.PRIM || algorithm === AlgorithmType.KRUSKAL || algorithm === AlgorithmType.BORUVKA) && (
                    step.mstEdges.length === 0 ? <div className="text-slate-600 text-center text-xs py-4 italic">Empty</div> :
                    step.mstEdges.map((edge, idx) => (
                      <motion.div
                        key={`${edge.source}-${edge.target}-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between bg-amber-900/30 border border-amber-700/50 px-3 py-2 rounded text-sm text-amber-200 font-mono shrink-0"
                      >
                        <span>&#123;{edge.source}, {edge.target}&#125;</span>
                      </motion.div>
                    ))
                  )}

                  {/* BFS/Dijkstra Queue View */}
                  {(algorithm === AlgorithmType.DIJKSTRA || algorithm === AlgorithmType.BFS) && (
                    step.queue.length === 0 ? <div className="text-slate-600 text-center text-xs py-4 italic">Empty</div> :
                    step.queue.map((qItem, idx) => (
                      <div 
                        key={`${qItem.nodeId}-${idx}`} 
                        className="flex justify-between items-center bg-slate-700/30 px-3 py-2 rounded text-sm text-slate-300 font-mono shrink-0"
                      >
                        <span>{qItem.nodeId}</span>
                        {algorithm === AlgorithmType.DIJKSTRA && (
                          <span className="text-xs text-slate-500">d:{qItem.distance}</span>
                        )}
                      </div>
                    ))
                  )}

                  {/* Boruvka Component Queue View */}
                  {algorithm === AlgorithmType.BORUVKA && step.queue.map((qItem, idx) => (
                      <div 
                        key={`${qItem.nodeId}-${idx}`} 
                        className="flex justify-between items-center bg-purple-900/20 px-3 py-2 rounded text-sm text-purple-200 font-mono shrink-0 border border-purple-500/30"
                      >
                        <span>Component {qItem.nodeId}</span>
                      </div>
                  ))}

                  {/* Generic Placeholder for others */}
                  {!['DFS', 'DIJKSTRA', 'PRIM', 'KRUSKAL', 'BORUVKA', 'BFS'].includes(algorithm) && (
                      <div className="text-slate-500 italic text-xs p-2">Not applicable</div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* PANEL 2: Boruvka Right Panel OR Search Tree */}
            {algorithm === AlgorithmType.BORUVKA ? (
              <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                 <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                   {getRightPanelTitle()}
                 </div>
                 <div ref={rightPanelRef} className="p-2 overflow-auto flex-1 gap-2 flex flex-col relative">
                     {Object.keys(componentSets).length > 0 ? (
                         Object.entries(componentSets).map(([root, nodes]) => {
                             const minEdgeEntry = step.boruvkaMinEdges?.find(e => e.root === root);
                             
                             // Check if this component is "Active" (in queue or being processed)
                             const isActive = step.queue.some(q => nodes.includes(q.nodeId)) || 
                                              (step.activeEdge && minEdgeEntry && (
                                                (step.activeEdge.source === minEdgeEntry.edge.source && step.activeEdge.target === minEdgeEntry.edge.target) ||
                                                (step.activeEdge.source === minEdgeEntry.edge.target && step.activeEdge.target === minEdgeEntry.edge.source)
                                              ));
                             
                             // Check if this component is the current Scroll Target
                             const isScrollTarget = root === boruvkaScrollTargetRoot;

                             return (
                                 <div 
                                    key={root} 
                                    ref={isScrollTarget ? activeComponentRef : null}
                                    className={`rounded-lg border p-3 transition-colors ${isActive ? 'bg-cyan-900/20 border-cyan-500/50' : 'bg-slate-700/20 border-slate-700/50'}`}
                                 >
                                     <div className="flex justify-between items-center mb-2">
                                         <span className={`text-xs font-bold ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                                             Comp {root}
                                         </span>
                                         <div className="flex gap-1">
                                             {nodes.map(n => (
                                                 <span key={n} className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 font-mono">
                                                     {n}
                                                 </span>
                                             ))}
                                         </div>
                                     </div>
                                     
                                     {minEdgeEntry ? (
                                         <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/50 p-1.5 rounded">
                                             <span className="text-slate-500">Min Edge:</span>
                                             <span className="font-mono text-cyan-200">
                                                 {`{${minEdgeEntry.edge.source}, ${minEdgeEntry.edge.target}}`}
                                             </span>
                                             <span className="font-mono text-amber-500 font-bold ml-auto">
                                                 {minEdgeEntry.edge.weight}
                                             </span>
                                         </div>
                                     ) : (
                                         <div className="text-[10px] text-slate-500 italic">Finding min edge...</div>
                                     )}
                                 </div>
                             );
                         })
                     ) : (
                         <div className="text-slate-500 italic text-xs p-2">Initializing...</div>
                     )}
                 </div>
              </div>
            ) : (
               /* SEARCH TREE VISUALIZATION (BFS/DFS/Dijkstra) */
               <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden hidden md:flex">
                   <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-sky-400 uppercase tracking-wider">
                       Search Tree (S)
                   </div>
                   <div className="flex-1 bg-slate-900/30 overflow-hidden relative">
                       <SearchTreeVisualizer step={step} algorithm={algorithm} />
                   </div>
               </div>
            )}
          </>
        )}
      </>
    )}
      </div>

      {/* --- BOTTOM SECTION: KRUSKAL SORTED EDGES (Conditional) --- */}
      {isKruskal && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden h-48">
          <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-pink-400 uppercase tracking-wider">
            Edges Sorted by Weight
          </div>
          <div ref={sortedListRef} className="p-2 overflow-auto grid grid-cols-2 gap-2 relative">
             {kruskalSortedEdges.map((edge, idx) => {
                 // Determine status: Processed (Added/Skipped) or Pending or Active
                 const isProcessed = step.processedSet.includes(`${edge.source}-${edge.target}`) || step.processedSet.includes(`${edge.target}-${edge.source}`);
                 
                 // How to know if added or skipped? Check mstEdges
                 const isAdded = step.mstEdges.some(e => 
                    (e.source === edge.source && e.target === edge.target) ||
                    (e.source === edge.target && e.target === edge.source)
                 );
                 
                 const isActive = step.activeEdge && 
                    ((step.activeEdge.source === edge.source && step.activeEdge.target === edge.target) ||
                     (step.activeEdge.source === edge.target && step.activeEdge.target === edge.source));

                 return (
                     <div 
                        key={idx}
                        ref={isActive ? activeSortedEdgeRef : null}
                        className={`flex justify-between items-center px-3 py-2 rounded text-xs font-mono border ${
                            isActive ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 
                            (isAdded ? 'bg-green-900/20 border-green-700/30 text-green-300 opacity-60' : 
                             (isProcessed ? 'bg-red-900/10 border-red-700/20 text-red-300/50 opacity-40' : 'bg-slate-800 border-slate-700 text-slate-400'))
                        }`}
                     >
                         <span>{`{${edge.source}, ${edge.target}}`}</span>
                         <span className={isActive ? 'text-indigo-200' : ''}>{edge.weight}</span>
                     </div>
                 );
             })}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default DataPanel;
