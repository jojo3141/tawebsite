
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
  
  // Helper for Long Path Colored Dots
  // Input: "{1,3,4}" -> Renders dots
  const renderColorSet = (setStr: string, isContributing: boolean = false) => {
      // remove { and }
      const clean = setStr.replace(/[{}]/g, '');
      if (!clean) return null;
      const nums = clean.split(',').map(s => parseInt(s.trim()));
      
      return (
          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded border ${isContributing ? 'bg-fuchsia-900/40 border-fuchsia-500 shadow-[0_0_8px_rgba(232,121,249,0.3)]' : 'bg-slate-800 border-slate-600'}`}>
             <span className={`text-[10px] mr-1 ${isContributing ? 'text-fuchsia-300' : 'text-slate-500'}`}>&#123;</span>
              {nums.map((n, i) => {
                  const colorHex = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'][n-1] || '#94a3b8';
                  return (
                      <div key={i} className="w-2 h-2 rounded-full" style={{backgroundColor: colorHex}} title={`Color ${n}`} />
                  );
              })}
             <span className={`text-[10px] ml-1 ${isContributing ? 'text-fuchsia-300' : 'text-slate-500'}`}>&#125;</span>
          </div>
      );
  };


  const isBellman = algorithm === AlgorithmType.BELLMAN_FORD;
  const isKruskal = algorithm === AlgorithmType.KRUSKAL;
  const isEuler = algorithm === AlgorithmType.EULER;
  const isGreedyMatching = algorithm === AlgorithmType.GREEDY_MATCHING;
  const isHopcroftKarp = algorithm === AlgorithmType.HOPCROFT_KARP;
  const isGreedyColoring = algorithm === AlgorithmType.GREEDY_COLORING;
  const isSmallestLastColoring = algorithm === AlgorithmType.SMALLEST_LAST_COLORING;
  const isFordFulkerson = algorithm === AlgorithmType.FORD_FULKERSON;
  const isLongPath = algorithm === AlgorithmType.LONG_PATH;
  const isHamiltonPath = algorithm === AlgorithmType.HAMILTON_PATH;
  const isMinEdgeCut = algorithm === AlgorithmType.MINIMUM_EDGE_CUT;
  const isFindingDuplicatesHash = algorithm === AlgorithmType.FINDING_DUPLICATES_HASH;
  const isBloomFilter = algorithm === AlgorithmType.BLOOM_FILTER;
  const isColoringAlgorithm = isGreedyColoring || isSmallestLastColoring;
  
  const topSectionClass = isBellman ? 'flex' : (isKruskal ? 'grid grid-cols-3 gap-4' : (isEuler || isGreedyMatching || isHopcroftKarp || isColoringAlgorithm || isFordFulkerson || isLongPath || isHamiltonPath || isMinEdgeCut ? 'flex flex-col gap-4' : 'grid grid-cols-2 gap-4'));

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
      <div className={`${algorithm === AlgorithmType.TARJAN ? 'hidden' : (isHopcroftKarp || isFordFulkerson || isLongPath || isHamiltonPath || isMinEdgeCut ? 'h-auto' : 'h-64')} ${topSectionClass}`}>
        
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
       ) : algorithm === AlgorithmType.MINIMUM_EDGE_CUT ? (
           <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden w-full min-h-[200px]">
               <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                   <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                       Statistics
                   </div>
               </div>
               <div className="p-4 flex flex-col gap-6">
                   {/* Current Cut Value */}
                   <div className="flex flex-col gap-1">
                       <span className="text-xs text-slate-400 uppercase tracking-wider">Current Cut Value</span>
                       <span className={`text-2xl font-mono font-bold ${step.minCutVal !== undefined ? 'text-white' : 'text-slate-600'}`}>
                           {step.minCutVal !== undefined ? step.minCutVal : '-'}
                       </span>
                   </div>

                   {/* Overall Min Cut */}
                   <div className="flex flex-col gap-1">
                       <span className="text-xs text-slate-400 uppercase tracking-wider text-purple-400">Overall Minimum</span>
                       <span className="text-3xl font-mono font-bold text-purple-400">
                           {step.overallMinCutVal !== undefined ? (step.overallMinCutVal === Infinity ? '∞' : step.overallMinCutVal) : '∞'}
                       </span>
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
                            <marker id="arrowhead-teal" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                                <polygon points="0 0, 6 2, 0 4" fill="#2dd4bf" />
                            </marker>
                            <marker id="arrowhead-amber" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                                <polygon points="0 0, 6 2, 0 4" fill="#f59e0b" />
                            </marker>
                            <marker id="arrowhead-green" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                                <polygon points="0 0, 6 2, 0 4" fill="#22c55e" />
                            </marker>
                        </defs>
                        
                        {/* Edges */}
                        {step.residualEdges?.map((edge, i) => {
                            const start = graph.nodes.find(n => n.id === edge.source);
                            const end = graph.nodes.find(n => n.id === edge.target);
                            if (!start || !end) return null;
                            if (edge.capacity <= 0) return null;

                            // Shorten path by node radius (12)
                            const r = 12;
                            
                            const hasReverse = step.residualEdges!.some(e => e.source === edge.target && e.target === edge.source && e.capacity > 0);
                            
                            let labelX = (start.x + end.x) / 2;
                            let labelY = (start.y + end.y) / 2;
                            let pathD = "";

                            if (hasReverse) {
                                const dx = end.x - start.x;
                                const dy = end.y - start.y;
                                const len = Math.hypot(dx, dy);
                                const nx = -dy / len;
                                const ny = dx / len;
                                const offset = 20; 
                                const cpX = ((start.x + end.x) / 2) + nx * offset;
                                const cpY = ((start.y + end.y) / 2) + ny * offset;

                                // Shorten end towards cp
                                const cdx = end.x - cpX;
                                const cdy = end.y - cpY;
                                const clen = Math.hypot(cdx, cdy);
                                const ex = end.x - (cdx/clen) * r;
                                const ey = end.y - (cdy/clen) * r;
                                
                                pathD = `M ${start.x} ${start.y} Q ${cpX} ${cpY} ${ex} ${ey}`;
                                
                                // Approx label position on curve
                                labelX = ((1-0.5)*(1-0.5)*start.x + 2*(1-0.5)*0.5*cpX + 0.5*0.5*end.x);
                                labelY = ((1-0.5)*(1-0.5)*start.y + 2*(1-0.5)*0.5*cpY + 0.5*0.5*end.y);
                            } else {
                                // Straight: Shorten line
                                const dx = end.x - start.x;
                                const dy = end.y - start.y;
                                const len = Math.hypot(dx, dy);
                                const ex = end.x - (dx/len) * r;
                                const ey = end.y - (dy/len) * r;
                                pathD = `M ${start.x} ${start.y} L ${ex} ${ey}`;
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
        ) : isLongPath ? (
           <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden w-full min-h-[530px]">
               <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                   <div className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider">
                       Iteration {step.longPathIteration} / 2 — Finding Paths of Length {step.longPathLength}
                   </div>
               </div>
               <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
                    {/* DP Table */}
                    <div className="bg-slate-900/30 rounded-lg border border-slate-700/50 overflow-hidden">
                        <div className={`grid ${step.longPathLength === 0 ? 'grid-cols-[auto_1fr]' : 'grid-cols-[auto_1fr_1fr]'} gap-x-px gap-y-0 text-sm bg-slate-800`}>
                            {/* Headers */}
                            <div className="font-bold text-slate-400 bg-slate-900/80 px-4 py-2 text-xs uppercase tracking-wider">Node</div>
                            {step.longPathLength && step.longPathLength > 0 ? (
                                <div className="font-bold text-slate-400 bg-slate-900/80 px-4 py-2 text-xs uppercase tracking-wider border-l border-slate-800">
                                    Previous (Len {step.longPathLength - 1})
                                </div>
                            ) : null}
                            <div className="font-bold text-slate-400 bg-slate-900/80 px-4 py-2 text-xs uppercase tracking-wider border-l border-slate-800">
                                Current (Len {step.longPathLength})
                            </div>
                            
                            {graph.nodes.sort((a,b) => a.id.localeCompare(b.id)).map((node, i) => {
                                const color = step.nodeColors?.[node.id] || 0;
                                const colorHex = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'][color-1] || '#334155';
                                const setsPrev = step.longPathDPPrev?.[node.id] || [];
                                const setsCurr = step.longPathDP?.[node.id] || [];
                                const isCurrentNode = step.currentNodeId === node.id;
                                const isCurrentNeighbor = step.currentNeighborId === node.id;
                                
                                // Base row background (striped)
                                const rowBg = i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-900/50';
                                
                                return (
                                    <React.Fragment key={node.id}>
                                        {/* Node Label & Color */}
                                        <div className={`flex items-center gap-3 px-4 py-2 ${rowBg} ${isCurrentNode ? 'bg-indigo-900/40 border-l-4 border-indigo-500' : ''}`}>
                                            <span className={`font-bold w-4 ${isCurrentNode ? 'text-yellow-400' : 'text-white'}`}>{node.id}</span>
                                            <div className="w-4 h-4 rounded-full border border-slate-600 shadow-sm" style={{backgroundColor: colorHex}}></div>
                                        </div>

                                        {/* Previous Sets - Only show if Length > 0 */}
                                        {step.longPathLength && step.longPathLength > 0 ? (
                                            <div className={`px-4 py-2 flex flex-wrap gap-1.5 items-center border-l border-slate-800 relative ${isCurrentNeighbor ? 'bg-fuchsia-900/20 shadow-[inset_0_0_15px_rgba(162,28,175,0.2)]' : rowBg}`}>
                                                {setsPrev.length > 0 ? setsPrev.map((s, idx) => {
                                                    // Determine if this set is contributing to the current node
                                                    // Only relevant if this row is NOT the current node, but a neighbor of the current node
                                                    // Check if 'node.id' is a neighbor of 'step.currentNodeId'
                                                    
                                                    let isContributing = false;
                                                    if (step.currentNodeId && step.longPathContributingSets && step.longPathContributingSets[node.id]) {
                                                        if (step.longPathContributingSets[node.id].includes(s)) {
                                                            isContributing = true;
                                                        }
                                                    }

                                                    return (
                                                        <div key={idx} className="relative flex items-center">
                                                            {renderColorSet(s, isContributing)}
                                                        </div>
                                                    );
                                                }) : <span className="text-slate-600 italic text-xs">∅</span>}
                                            </div>
                                        ) : null}

                                        {/* Current Sets */}
                                        <div className={`px-4 py-2 flex flex-wrap gap-1.5 items-center border-l border-slate-800 ${isCurrentNode ? 'bg-indigo-900/20 shadow-[inset_0_0_15px_rgba(99,102,241,0.2)]' : rowBg}`}>
                                            {setsCurr.length > 0 ? setsCurr.map((s, idx) => {
                                                 // Check if this set 's' is one of the newly created sets from the contributing neighbor
                                                 // A set is new if it's based on a contributing set + current node color.
                                                 // However, we don't have direct linkage here.
                                                 // But we know that 'step.longPathContributingSets' contains the SOURCE sets.
                                                 
                                                 let isNewlyAdded = false;
                                                 if (isCurrentNode && step.longPathContributingSets) {
                                                     // Iterate through all contributing sets from all neighbors (though usually only 1 neighbor active per step)
                                                     Object.values(step.longPathContributingSets).forEach(sourceSets => {
                                                         sourceSets.forEach(sourceSetStr => {
                                                             // Reconstruct logic: sourceSet + myColor should equal s
                                                             // Parse source set
                                                             const cleanSource = sourceSetStr.replace(/[{}]/g, '');
                                                             const sourceNums = cleanSource ? cleanSource.split(',').map(n => parseInt(n.trim())) : [];
                                                             
                                                             const myColor = step.nodeColors?.[step.currentNodeId!] || 0;
                                                             if (myColor) {
                                                                 const expectedNums = [...sourceNums, myColor].sort((a,b) => a-b);
                                                                 // Parse current set 's'
                                                                 const cleanCurr = s.replace(/[{}]/g, '');
                                                                 const currNums = cleanCurr ? cleanCurr.split(',').map(n => parseInt(n.trim())) : [];
                                                                 
                                                                 // Compare
                                                                 if (expectedNums.length === currNums.length && expectedNums.every((val, index) => val === currNums[index])) {
                                                                     isNewlyAdded = true;
                                                                 }
                                                             }
                                                         });
                                                     });
                                                 }

                                                 return (
                                                    <React.Fragment key={idx}>
                                                        {renderColorSet(s, isNewlyAdded)}
                                                    </React.Fragment>
                                                 );
                                            }) : <span className="text-slate-600 italic text-xs">∅</span>}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
               </div>
           </div>
        ) : algorithm === AlgorithmType.HAMILTON_PATH ? (
              <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden w-full min-h-[450px]">
                <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                         DP Table
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
                     <div className="text-xs text-slate-400 italic">
                        Store all sets S of size s such that P[S,x] is true.
                     </div>
                     <div className="bg-slate-900/30 rounded-lg border border-slate-700/50 overflow-hidden">
                         <div className={`grid ${((step.hamiltonPathSubsetSize || 2) > 2) ? 'grid-cols-[auto_1fr_1fr]' : 'grid-cols-[auto_1fr]'} gap-x-px gap-y-0 text-sm bg-slate-800`}>
                             {/* Headers */}
                             <div className="font-bold text-slate-400 bg-slate-900/80 px-4 py-2 text-xs uppercase tracking-wider">Node</div>
                             
                             {((step.hamiltonPathSubsetSize || 2) > 2) && (
                                 <div className="font-bold text-slate-400 bg-slate-900/80 px-4 py-2 text-xs uppercase tracking-wider border-l border-slate-800">
                                     Previous (Size {Math.max(2, (step.hamiltonPathSubsetSize || 2) - 1)})
                                 </div>
                             )}

                             <div className="font-bold text-slate-400 bg-slate-900/80 px-4 py-2 text-xs uppercase tracking-wider border-l border-slate-800">
                                 Current (Size {step.hamiltonPathSubsetSize || 2})
                             </div>
                             
                             {/* Nodes Sorted Safely */}
                             {[...graph.nodes].sort((a, b) => {
                                 const aVal = parseInt(a.id) || 0;
                                 const bVal = parseInt(b.id) || 0;
                                 return aVal - bVal;
                             }).map((node, i) => {
                                 const setsPrev = step.hamiltonPathDPPrev?.[node.id] || [];
                                 const setsCurr = step.hamiltonPathDP?.[node.id] || [];
                                 const isCurrentNode = step.currentNodeId === node.id;
                                 const showPrevious = (step.hamiltonPathSubsetSize || 2) > 2;
                                 
                                 // Base row background (striped)
                                 const rowBg = i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-900/50';
                                 
                                 return (
                                     <React.Fragment key={node.id}>
                                         <div className={`flex items-center gap-3 px-4 py-2 ${rowBg} ${isCurrentNode ? 'bg-indigo-900/40 border-l-4 border-indigo-500' : ''}`}>
                                             <span className={`font-bold w-4 text-white`}>{node.id}</span>
                                         </div>

                                         {showPrevious && (
                                             <div className={`px-4 py-2 flex flex-wrap gap-1.5 items-center border-l border-slate-800 ${rowBg}`}>
                                                 {setsPrev.length > 0 ? setsPrev.map((s, idx) => {
                                                     const isPurple = step.hamiltonPathPrevActiveSets?.[node.id]?.includes(s);
                                                     const style = isPurple 
                                                        ? "bg-fuchsia-900/40 text-fuchsia-300 border border-fuchsia-500 shadow-[0_0_8px_rgba(232,121,249,0.3)]" 
                                                        : "bg-slate-700 text-slate-200 border border-transparent";
                                                     return <span key={idx} className={`${style} px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors`}>{s}</span>;
                                                 }) : <span className="text-slate-600 italic text-xs">-</span>}
                                             </div>
                                         )}

                                         <div className={`px-4 py-2 flex flex-wrap gap-1.5 items-center border-l border-slate-800 ${isCurrentNode ? 'bg-indigo-900/20 shadow-[inset_0_0_15px_rgba(99,102,241,0.2)]' : rowBg}`}>
                                             {setsCurr.length > 0 ? setsCurr.map((s, idx) => {
                                                 const isPurple = step.hamiltonPathActiveSets?.[node.id]?.includes(s);
                                                 // Current sets are usually indigo unless highlighted
                                                 const style = isPurple
                                                    ? "bg-fuchsia-900/40 text-fuchsia-300 border border-fuchsia-500 shadow-[0_0_8px_rgba(232,121,249,0.3)] font-medium"
                                                    : "bg-indigo-900 text-indigo-200 border border-indigo-700 font-medium";
                                                 return <span key={idx} className={`${style} px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors`}>{s}</span>;
                                             }) : <span className="text-slate-600 italic text-xs">-</span>}
                                         </div>
                                     </React.Fragment>
                                 );
                             })}
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
                          Sub-Tour (W&apos;)
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

         ) : (algorithm !== AlgorithmType.TARJAN && algorithm !== AlgorithmType.SMALLEST_ENCLOSING_DISK && algorithm !== AlgorithmType.JARVIS_WRAP && algorithm !== AlgorithmType.LOCAL_REPAIR && algorithm !== AlgorithmType.FINDING_DUPLICATES_HASH && algorithm !== AlgorithmType.BLOOM_FILTER) && (
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
                     step.queue.map((item, idx) => (
                       <motion.div
                         key={`${item.nodeId}-${item.distance}-${idx}`} 
                         layout
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.8 }}
                         className="flex justify-between items-center bg-slate-700/50 px-3 py-2 rounded text-sm shrink-0"
                       >
                         <span className="font-bold text-slate-200">{item.nodeId}</span>
                         <span className="bg-slate-900 text-slate-400 px-2 py-0.5 rounded text-xs font-mono">
                             {item.distance === Infinity ? '∞' : item.distance}
                         </span>
                       </motion.div>
                     ))
                   )}
                 </AnimatePresence>
               </div>
             </div>
             
             {/* PANEL 2 (New for Kruskal): Sorted Edges */}
             {isKruskal && (
                 <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                     <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-blue-400 uppercase tracking-wider">
                         Sorted Edges
                     </div>
                     <div ref={sortedListRef} className="p-2 overflow-auto flex-1 relative">
                         {kruskalSortedEdges.map((edge, idx) => {
                             const isActive = step.activeEdge?.source === edge.source && step.activeEdge?.target === edge.target;
                             
                             const isInMST = step.mstEdges.some(e => 
                                 (e.source === edge.source && e.target === edge.target) || 
                                 (e.source === edge.target && e.target === edge.source)
                             );

                             return (
                                 <div 
                                     key={`${edge.source}-${edge.target}-${idx}`} 
                                     ref={isActive ? activeSortedEdgeRef : null}
                                     className={`flex justify-between items-center px-3 py-2 mb-1 rounded text-xs font-mono transition-colors border ${
                                         isActive 
                                             ? 'bg-blue-600/30 border-blue-500 text-white' 
                                             : (isInMST 
                                                 ? 'bg-amber-900/20 border-amber-700/40 text-amber-300' 
                                                 : 'bg-slate-700/20 border-transparent text-slate-500')
                                     }`}
                                 >
                                     <span>&#123;{edge.source}, {edge.target}&#125;</span>
                                     <span className="font-bold">{edge.weight}</span>
                                 </div>
                             );
                         })}
                     </div>
                 </div>
             )}

             {/* PANEL 3: Processed/Visited / Level Sets / Set S / Components */}
             <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
               <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-green-500 uppercase tracking-wider">
                 {getRightPanelTitle()}
               </div>
               <div ref={rightPanelRef} className="p-2 overflow-auto flex-1 relative">
                 {/* ... (Existing logic for BFS/Boruvka/Kruskal/Standard panels) ... */}
                 {algorithm === AlgorithmType.BFS ? (
                   <div className="space-y-2">
                     {Object.keys(levelSets).sort((a,b) => Number(a)-Number(b)).map((distStr) => {
                       const dist = Number(distStr);
                       return (
                         <div key={dist} className="flex items-center gap-2">
                           <span className="text-xs font-mono text-slate-500 w-12">Dist {dist}:</span>
                           <div className="flex gap-1">
                             {levelSets[dist].sort().map(node => (
                               <span key={node} className="flex items-center justify-center w-6 h-6 bg-green-900/30 border border-green-700 text-green-300 rounded text-xs font-bold">
                                 {node}
                               </span>
                             ))}
                           </div>
                         </div>
                       )
                     })}
                   </div>
                 ) : algorithm === AlgorithmType.BORUVKA ? (
                     // BORUVKA
                     <div className="space-y-3">
                         {Object.keys(componentSets).sort().map((root, i) => {
                             const minEdgeEntry = step.boruvkaMinEdges?.find(entry => entry.root === root);
                             const isQueueActive = step.queue.some(q => componentSets[root].includes(q.nodeId));
                             const isEdgeActive = step.activeEdge && minEdgeEntry && (
                                 (step.activeEdge.source === minEdgeEntry.edge.source && step.activeEdge.target === minEdgeEntry.edge.target) ||
                                 (step.activeEdge.source === minEdgeEntry.edge.target && step.activeEdge.target === minEdgeEntry.edge.source)
                             );

                             const isActive = isQueueActive || isEdgeActive;
                             const borderColor = isEdgeActive 
                                 ? 'border-amber-500 bg-amber-900/10' 
                                 : (isQueueActive ? 'border-purple-500 bg-purple-900/10' : 'border-slate-700/50');
                             const labelColor = isEdgeActive
                                 ? 'text-amber-400'
                                 : (isQueueActive ? 'text-purple-400' : 'text-indigo-400');

                             return (
                                 <div 
                                     key={root} 
                                     ref={root === boruvkaScrollTargetRoot ? activeComponentRef : null}
                                     className={`bg-slate-700/20 border rounded p-2 transition-colors ${borderColor}`}
                                 >
                                     <div className="flex justify-between items-start mb-2">
                                         <div className="flex items-center gap-2">
                                             <span className={`text-xs font-bold uppercase ${labelColor}`}>S{i+1}</span>
                                             <span className="text-[10px] text-slate-500 font-mono">(Root: {root})</span>
                                         </div>
                                         {minEdgeEntry && (
                                             <div className={`flex items-center gap-1 border px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                                                 isEdgeActive 
                                                 ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-1 ring-amber-500/50' 
                                                 : 'bg-blue-900/30 border-blue-700/30 text-blue-200'
                                             }`}>
                                                 <span className="text-slate-400 text-[9px] mr-1">Min:</span>
                                                 &#123;{minEdgeEntry.edge.source}, {minEdgeEntry.edge.target}&#125; 
                                                 <span className="text-slate-500 ml-1">w:{minEdgeEntry.edge.weight}</span>
                                             </div>
                                         )}
                                     </div>
                                     <div className="flex flex-wrap gap-1">
                                         {componentSets[root].sort().map(node => (
                                             <span key={node} className={`flex items-center justify-center w-5 h-5 border rounded text-[10px] font-bold ${isActive ? 'bg-purple-900/40 border-purple-500/50 text-purple-300' : 'bg-indigo-900/40 border-indigo-500/50 text-indigo-300'}`}>
                                                 {node}
                                             </span>
                                         ))}
                                     </div>
                                 </div>
                             );
                         })}
                     </div>
                 ) : algorithm === AlgorithmType.KRUSKAL ? (
                     // KRUSKAL
                     <div className="space-y-2">
                         {Object.values(componentSets).map((set, i) => (
                             <div key={i} className="flex items-center gap-2 flex-wrap bg-slate-700/30 p-1.5 rounded border border-slate-700/50">
                                 <span className="text-xs text-slate-500 mr-1">{`Set ${i+1}:`}</span>
                                 {set.sort().map(node => (
                                     <span key={node} className="flex items-center justify-center w-6 h-6 bg-indigo-900/40 border border-indigo-500/50 text-indigo-300 rounded text-xs font-bold">
                                         {node}
                                     </span>
                                 ))}
                             </div>
                         ))}
                     </div>
                 ) : (
                   // Standard Visited Set View
                   <div className="flex flex-wrap content-start gap-2">
                       {step.processedSet.map((id) => (
                         <span key={id} className="flex items-center justify-center w-8 h-8 bg-green-900/30 border border-green-700 text-green-300 rounded-full text-sm font-bold">
                             {id}
                         </span>
                       ))}
                   </div>
                 )}
               </div>
             </div>
           </>
         )}
      </>
    )}
      </div>

      {/* --- MIDDLE SECTION: SEARCH TREE (DFS/BFS/DIJKSTRA/BELLMAN-FORD Only) --- */}
      {(algorithm === AlgorithmType.DFS || algorithm === AlgorithmType.BFS || algorithm === AlgorithmType.DIJKSTRA || algorithm === AlgorithmType.BELLMAN_FORD) && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden h-auto min-h-[300px]">
              <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-sky-400 uppercase tracking-wider">
                  {algorithm === AlgorithmType.DIJKSTRA || algorithm === AlgorithmType.BELLMAN_FORD ? 'Shortest Path Tree' : 'Search Tree'}
              </div>
              <div className="flex-1 relative bg-slate-900/30">
                  <SearchTreeVisualizer step={step} algorithm={algorithm} />
              </div>
          </div>
      )}

      {/* --- BOTTOM SECTION: TABLE (Hidden for Boruvka and select A&W algorithms) --- */}
      {algorithm !== AlgorithmType.BORUVKA && algorithm !== AlgorithmType.EULER && algorithm !== AlgorithmType.GREEDY_MATCHING && algorithm !== AlgorithmType.HOPCROFT_KARP && algorithm !== AlgorithmType.GREEDY_COLORING && algorithm !== AlgorithmType.SMALLEST_LAST_COLORING && algorithm !== AlgorithmType.FORD_FULKERSON && algorithm !== AlgorithmType.LONG_PATH && algorithm !== AlgorithmType.HAMILTON_PATH && algorithm !== AlgorithmType.TARJAN && algorithm !== AlgorithmType.SMALLEST_ENCLOSING_DISK && algorithm !== AlgorithmType.JARVIS_WRAP && algorithm !== AlgorithmType.LOCAL_REPAIR && algorithm !== AlgorithmType.MINIMUM_EDGE_CUT && algorithm !== AlgorithmType.FINDING_DUPLICATES_HASH && algorithm !== AlgorithmType.BLOOM_FILTER && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden h-[26rem]">
          <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-slate-300 uppercase tracking-wider">
              {algorithm === AlgorithmType.DFS ? 'Tracking Table' : (algorithm === AlgorithmType.PRIM ? 'Node Status' : (algorithm === AlgorithmType.KRUSKAL ? 'Union-Find Structure' : 'Tracking Table'))}
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 sticky top-0 backdrop-blur-sm">
                <tr>
                  <th className="px-4 py-2">Node</th>
                  <th className={`px-4 py-2 ${(algorithm === AlgorithmType.DIJKSTRA || algorithm === AlgorithmType.BELLMAN_FORD) ? 'normal-case' : ''}`}>
                    {algorithm === AlgorithmType.DFS ? 'Pre / Post' : (algorithm === AlgorithmType.BFS ? 'Distance' : (algorithm === AlgorithmType.PRIM ? 'In Set S?' : (algorithm === AlgorithmType.KRUSKAL ? 'rep[v]' : 'd[v]')))}
                  </th>
                  {algorithm === AlgorithmType.BFS && (
                    <th className="px-4 py-2">Enter / Leave</th>
                  )}
                  <th className={`px-4 py-2 ${(algorithm === AlgorithmType.DIJKSTRA || algorithm === AlgorithmType.BELLMAN_FORD) ? 'normal-case' : ''}`}>
                      {algorithm === AlgorithmType.DIJKSTRA || algorithm === AlgorithmType.BELLMAN_FORD ? 'p[v]' : (algorithm === AlgorithmType.KRUSKAL ? 'members[rep[v]]' : 'Parent')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(algorithm === AlgorithmType.KRUSKAL ? Object.keys(step.parents).sort() : Object.keys(step.distances).sort()).map((nodeId) => {
                  const dist = step.distances[nodeId];
                  const parent = step.parents[nodeId];
                  const isUpdated = nodeId === step.currentNeighborId || nodeId === step.currentNodeId;
                  
                  let valueDisplay: React.ReactNode = dist === Infinity ? <InfinityIcon size={14} /> : dist;
                  if (algorithm === AlgorithmType.DFS) {
                    const d = step.discoveryTimes[nodeId];
                    const f = step.finishTimes[nodeId];
                    valueDisplay = (
                      <span className="font-mono">
                        {d || '-'} / {f || '-'}
                      </span>
                    );
                  } else if (algorithm === AlgorithmType.PRIM) {
                      const inS = step.processedSet.includes(nodeId);
                      valueDisplay = inS 
                          ? <span className="text-green-400 font-bold">YES</span> 
                          : <span className="text-slate-600">NO</span>;
                  } else if (algorithm === AlgorithmType.KRUSKAL) {
                      valueDisplay = <span className="font-mono text-indigo-300 font-bold">{step.parents[nodeId]}</span>;
                  }
                  return (
                    <tr key={nodeId} className={isUpdated ? "bg-blue-900/20 transition-colors" : "border-b border-slate-700/50"}>
                      <td className="px-4 py-2 font-bold text-slate-200">{nodeId}</td>
                      <td className="px-4 py-2 font-mono">
                        {valueDisplay}
                      </td>
                      {algorithm === AlgorithmType.BFS && (
                        <td className="px-4 py-2 font-mono">
                           {step.discoveryTimes[nodeId] || '-'}/{step.finishTimes[nodeId] || '-'}
                        </td>
                      )}
                      <td className="px-4 py-2 font-mono text-slate-500">
                        {algorithm === AlgorithmType.KRUSKAL ? (
                          step.parents[nodeId] === nodeId && step.unionFindMembers && step.unionFindMembers[nodeId] ? (
                            <span>&#123;{step.unionFindMembers[nodeId].join(', ')}&#125;</span>
                          ) : '-'
                        ) : (
                          parent || <span className="text-slate-700">null</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default DataPanel;
