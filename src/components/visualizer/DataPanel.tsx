
import React, { useRef, useEffect, useMemo } from 'react';
import { AlgorithmStep, AlgorithmType, Graph, EdgeType } from '@/types/graph';
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
    if (algorithm !== AlgorithmType.BELLMAN_FORD && listRef.current) {
        // No auto-scroll for general data panels as requested in previous prompt
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
  
  const topSectionClass = isBellman ? 'flex' : (isKruskal ? 'grid grid-cols-3 gap-4' : 'grid grid-cols-2 gap-4');

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
      <div className={`h-64 ${topSectionClass}`}>
        {/* ... (No changes to Top Section rendering) ... */}
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
        ) : (
          <>
            {/* PANEL 1: Queue / Stack / Set F */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
              <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-purple-400 uppercase tracking-wider">
                {getLeftPanelTitle()}
              </div>
              <div 
                ref={listRef}
                className={`p-2 overflow-auto flex-1 gap-1 flex ${algorithm === AlgorithmType.DFS ? 'flex-col-reverse justify-start' : 'flex-col'}`}
              >
                <AnimatePresence initial={false}>
                  {/* DFS Stack View */}
                  {algorithm === AlgorithmType.DFS && (
                    step.stack.length === 0 ? <div className="text-slate-600 text-center text-xs py-4 italic">Empty</div> :
                    step.stack.map((nodeId, idx) => (
                      <motion.div
                        key={`${nodeId}-${idx}`}
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

      {/* --- BOTTOM SECTION: TABLE --- */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden h-[26rem]">
        <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-slate-300 uppercase tracking-wider">
             {algorithm === AlgorithmType.DFS ? 'Tracking Table' : (algorithm === AlgorithmType.PRIM ? 'Node Status' : (algorithm === AlgorithmType.KRUSKAL || algorithm === AlgorithmType.BORUVKA ? 'Union-Find Structure' : 'Tracking Table'))}
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left text-slate-400">
            <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 sticky top-0 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-2">Node</th>
                <th className={`px-4 py-2 ${(algorithm === AlgorithmType.DIJKSTRA || algorithm === AlgorithmType.BELLMAN_FORD) ? 'normal-case' : ''}`}>
                  {algorithm === AlgorithmType.DFS ? 'Pre / Post' : (algorithm === AlgorithmType.BFS ? 'Distance' : (algorithm === AlgorithmType.PRIM ? 'In Set S?' : (algorithm === AlgorithmType.KRUSKAL || algorithm === AlgorithmType.BORUVKA ? 'Root ID' : 'd[v]')))}
                </th>
                {algorithm === AlgorithmType.BFS && (
                  <th className="px-4 py-2">Enter / Leave</th>
                )}
                <th className={`px-4 py-2 ${(algorithm === AlgorithmType.DIJKSTRA || algorithm === AlgorithmType.BELLMAN_FORD) ? 'normal-case' : ''}`}>
                    {algorithm === AlgorithmType.DIJKSTRA || algorithm === AlgorithmType.BELLMAN_FORD ? 'p[v]' : (algorithm === AlgorithmType.KRUSKAL || algorithm === AlgorithmType.BORUVKA ? 'Parent Pointer' : 'Parent')}
                </th>
              </tr>
            </thead>
            <tbody>
              {(algorithm === AlgorithmType.KRUSKAL || algorithm === AlgorithmType.BORUVKA ? Object.keys(step.parents).sort() : Object.keys(step.distances).sort()).map((nodeId) => {
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
                } else if (algorithm === AlgorithmType.KRUSKAL || algorithm === AlgorithmType.BORUVKA) {
                    let curr = nodeId;
                    let p = step.parents[curr];
                    let count = 0;
                    while(p && p !== curr && count < 10) { curr = p; p = step.parents[curr]; count++ }
                    valueDisplay = <span className="font-mono text-indigo-300 font-bold">{curr}</span>
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
                      {parent || <span className="text-slate-700">null</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DataPanel;
