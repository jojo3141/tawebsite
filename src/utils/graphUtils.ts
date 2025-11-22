
import { Graph, Node, Edge, AlgorithmStep, PriorityQueueItem, EdgeType } from '@/types/graph';

// Helper to detect negative cycles using Bellman-Ford logic
const hasNegativeCycle = (nodes: Node[], edges: Edge[]): boolean => {
    const dist: Record<string, number> = {};
    nodes.forEach(n => dist[n.id] = 0);
    
    const limit = nodes.length;
    
    // Relax edges |V| times
    for (let i = 0; i < limit; i++) {
        let updated = false;
        for (const e of edges) {
            if (dist[e.source] + e.weight < dist[e.target]) {
                dist[e.target] = dist[e.source] + e.weight;
                updated = true;
                // If we can still relax on the V-th iteration, there is a negative cycle
                if (i === limit - 1) return true;
            }
        }
        if (!updated) break;
    }
    return false;
};

// Helper to generate random graph with fixed positions
export const generateRandomGraph = (
    nodeCount: number = 9, 
    width: number, 
    height: number, 
    isDirected: boolean = true, 
    uniqueWeights: boolean = false,
    hasNegativeWeights: boolean = false,
    minEdges: number = 15, 
    maxEdges: number = 20 
): Graph => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const letters = "ABCDEFGHIJKLM";

  // Fixed Layout Templates (Normalized 0-1 coordinates)
  // Shifted up slightly and corners spread outwards
  const layout = [
    { x: 0.10, y: 0.45 }, // Node A (Start) - Middle Left
    { x: 0.20, y: 0.15 }, // Node B - Top Left (Outwards)
    { x: 0.20, y: 0.75 }, // Node C - Bottom Left (Outwards)
    { x: 0.50, y: 0.10 }, // Node D - Top Center
    { x: 0.50, y: 0.45 }, // Node E - Dead Center
    { x: 0.50, y: 0.80 }, // Node F - Bottom Center
    { x: 0.80, y: 0.15 }, // Node G - Top Right (Outwards)
    { x: 0.80, y: 0.75 }, // Node H - Bottom Right (Outwards)
    { x: 0.90, y: 0.45 }, // Node I - Middle Right
  ];

  // 1. Generate Nodes using fixed layout
  for (let i = 0; i < nodeCount; i++) {
    const pos = layout[i] || { 
        x: 0.1 + Math.random() * 0.8, 
        y: 0.1 + Math.random() * 0.8 
    };

    nodes.push({
      id: letters[i],
      label: letters[i],
      x: pos.x * width,
      y: pos.y * height,
    });
  }

  // 2. Generate Edges
  // Target total edges based on range
  const targetEdgeCount = Math.floor(Math.random() * (maxEdges - minEdges + 1)) + minEdges;

  // Helper to find valid targets for a specific node based on distance
  // VISUAL PROXIMITY FILTER: Max distance approx 260px
  const getValidTargets = (source: Node) => {
    return nodes.filter(target => {
        if (source.id === target.id) return false;
        const dist = Math.hypot(source.x - target.x, source.y - target.y);
        return dist < 260;
    });
  };

  // Pass 1: Ensure every node has at least 1 outgoing edge (or connection)
  for (const source of nodes) {
     const possible = getValidTargets(source);
     if (possible.length > 0) {
        const target = possible[Math.floor(Math.random() * possible.length)];
        
        // Ensure we don't duplicate connection if undirected
        const exists = edges.some(e => {
             if (isDirected) return e.source === source.id && e.target === target.id;
             return (e.source === source.id && e.target === target.id) || (e.source === target.id && e.target === source.id);
        });

        if (!exists) {
            edges.push({
            source: source.id,
            target: target.id,
            weight: Math.floor(Math.random() * 9) + 1
            });
        }
     }
  }

  // Pass 2: Add edges until we reach target count
  let safetyCounter = 0;
  while (edges.length < targetEdgeCount && safetyCounter < 1000) {
     safetyCounter++;
     // Pick random source
     const source = nodes[Math.floor(Math.random() * nodes.length)];
     const possible = getValidTargets(source);
     
     if (possible.length === 0) continue;

     const target = possible[Math.floor(Math.random() * possible.length)];
     
     // Check existence
     const exists = edges.some(e => {
          if (isDirected) return e.source === source.id && e.target === target.id;
          return (e.source === source.id && e.target === target.id) || (e.source === target.id && e.target === source.id);
     });

     if (!exists) {
        edges.push({
           source: source.id,
           target: target.id,
           weight: Math.floor(Math.random() * 9) + 1
        });
     }
  }

  // 3. Handle Weight Logic (Unique or Negative)
  
  // Ensure Unique Weights if requested (1 to N)
  if (uniqueWeights) {
      const count = edges.length;
      const weights = Array.from({ length: count }, (_, i) => i + 1);
      // Fisher-Yates Shuffle
      for (let i = count - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [weights[i], weights[j]] = [weights[j], weights[i]];
      }
      
      // If negative weights requested (for Boruvka), flip the sign of the first 3 weights
      if (hasNegativeWeights && count >= 3) {
          // Since weights are shuffled, we can just flip the first 3 to get 3 random negative weights
          weights[0] *= -1;
          weights[1] *= -1;
          weights[2] *= -1;
      }

      edges.forEach((edge, idx) => {
          edge.weight = weights[idx];
      });
  } 
  // Handle Negative Weights logic (Random duplicates allowed, typical for Bellman-Ford/Prim/Kruskal)
  else if (hasNegativeWeights) {
      // Try to assign negative weights without creating a negative cycle
      let valid = false;
      let attempts = 0;
      
      while (!valid && attempts < 50) {
          attempts++;
          
          // Reset all to positive (1-9)
          edges.forEach(e => e.weight = Math.floor(Math.random() * 9) + 1);

          // Pick 3 random distinct indices to be negative
          const indices = new Set<number>();
          while(indices.size < 3 && indices.size < edges.length) {
              indices.add(Math.floor(Math.random() * edges.length));
          }

          // Assign negative values (-1 to -5)
          indices.forEach(idx => {
              edges[idx].weight = -1 * (Math.floor(Math.random() * 5) + 1);
          });

          // Check for negative cycles
          if (!hasNegativeCycle(nodes, edges)) {
              valid = true;
          }
      }
      
      // Fallback: If we couldn't find a valid negative config, revert to positive
      // to prevent breaking the visualizer with an infinite loop graph.
      if (!valid) {
          console.warn("Could not generate negative weights without cycle. Reverting to positive.");
          edges.forEach(e => {
             if (e.weight < 0) e.weight = Math.abs(e.weight); 
          });
      }
  }
  
  return { nodes, edges, isDirected, hasUniqueWeights: uniqueWeights };
};

// --- DIJKSTRA SOLVER ---
export const calculateDijkstraSteps = (graph: Graph, startNodeId: string): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  
  const distances: Record<string, number> = {};
  const parents: Record<string, string | null> = {};
  const queue: PriorityQueueItem[] = []; // Represents Priority Queue
  const processedSet: string[] = []; 

  let stepCounter = 0;
  const pushStep = (line: number, desc: string, u: string | null = null, v: string | null = null, edge: {source: string, target: string} | null = null) => {
    steps.push({
      stepId: stepCounter++,
      lineNumber: line,
      description: desc,
      distances: { ...distances },
      parents: { ...parents },
      discoveryTimes: {},
      finishTimes: {},
      edgeClassifications: {},
      mstEdges: [],
      boruvkaMinEdges: [],
      // DEEP COPY items to prevent reference mutation issues in history
      queue: queue.map(i => ({...i})).sort((a, b) => a.distance - b.distance),
      stack: [], // Not used
      processedSet: [...processedSet],
      currentNodeId: u,
      currentNeighborId: v,
      activeEdge: edge
    });
  };

  graph.nodes.forEach(n => {
    if (n.id !== startNodeId) {
      distances[n.id] = Infinity;
      parents[n.id] = null;
    }
  });
  pushStep(1, "Initialize all nodes d[v] = ∞, p[v] = null");

  distances[startNodeId] = 0;
  parents[startNodeId] = null;
  // Use startNodeId as 'u' here so it highlights in Orange/Yellow
  pushStep(3, `Initialize start node ${startNodeId}: d[${startNodeId}] = 0`, startNodeId);

  queue.push({ nodeId: startNodeId, distance: 0 });
  pushStep(5, `Insert start node ${startNodeId} into Priority Queue`, startNodeId);

  while (queue.length > 0) {
    queue.sort((a, b) => a.distance - b.distance);
    pushStep(6, "Check if Q is not empty");

    const u = queue.shift()!;
    processedSet.push(u.nodeId);
    pushStep(7, `Extract Min: Node ${u.nodeId} (Dist: ${u.distance})`, u.nodeId);

    // --- NEIGHBOR EXTRACTION (Directed vs Undirected Logic) ---
    const neighbors: { id: string, weight: number, edge: Edge }[] = [];
    
    graph.edges.forEach(e => {
       if (e.source === u.nodeId) {
           neighbors.push({ id: e.target, weight: e.weight, edge: e });
       } else if (graph.isDirected === false && e.target === u.nodeId) {
           neighbors.push({ id: e.source, weight: e.weight, edge: e });
       }
    });

    // Sort neighbors alphabetically by ID to ensure deterministic iteration
    neighbors.sort((a, b) => a.id.localeCompare(b.id));
    
    for (const { id: vId, weight, edge } of neighbors) {
      pushStep(8, `Inspect neighbor ${vId} of ${u.nodeId} (Weight: ${weight})`, u.nodeId, vId, edge);

      const isUndiscovered = parents[vId] === null && distances[vId] === Infinity;

      if (isUndiscovered) {
         pushStep(9, `Node ${vId} has not been visited yet`, u.nodeId, vId, edge);
         
         const newDist = distances[u.nodeId] + weight;
         distances[vId] = newDist;
         pushStep(10, `Calculate distance: ${distances[u.nodeId]} + ${weight} = ${newDist}`, u.nodeId, vId, edge);

         parents[vId] = u.nodeId;
         pushStep(11, `Set parent of ${vId} to ${u.nodeId}`, u.nodeId, vId, edge);

         queue.push({ nodeId: vId, distance: newDist });
         pushStep(12, `Enqueue ${vId} with distance ${newDist}`, u.nodeId, vId, edge);

      } else {
        const currentDist = distances[vId];
        const newDist = distances[u.nodeId] + weight;
        
        pushStep(13, `Check if new path (${newDist}) < current distance (${currentDist})`, u.nodeId, vId, edge);

        if (newDist < currentDist) {
           distances[vId] = newDist;
           pushStep(14, `Found shorter path! Update d[${vId}] to ${newDist}`, u.nodeId, vId, edge);

           parents[vId] = u.nodeId;
           pushStep(15, `Update parent of ${vId} to ${u.nodeId}`, u.nodeId, vId, edge);

           const qIdx = queue.findIndex(item => item.nodeId === vId);
           if (qIdx >= 0) {
             queue[qIdx].distance = newDist;
           }
           pushStep(16, `Decrease Key for ${vId} in Q`, u.nodeId, vId, edge);
        }
      }
    }
  }
  pushStep(6, "Queue is empty. Algorithm Complete.");
  return steps;
};

// --- BFS SOLVER ---
export const calculateBFSSteps = (graph: Graph, startNodeId: string): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  const distances: Record<string, number> = {};
  const parents: Record<string, string | null> = {};
  const queue: PriorityQueueItem[] = []; // Simple FIFO queue, weight used for visualization consistency
  const visited: string[] = []; // "processedSet"
  
  // BFS Time Tracking (Enter/Leave)
  let time = 0;
  const discoveryTimes: Record<string, number> = {}; // Enter Q
  const finishTimes: Record<string, number> = {}; // Leave Q

  let stepCounter = 0;
  const pushStep = (line: number, desc: string, u: string | null = null, v: string | null = null, edge: {source: string, target: string} | null = null) => {
    steps.push({
      stepId: stepCounter++,
      lineNumber: line,
      description: desc,
      distances: { ...distances },
      parents: { ...parents },
      discoveryTimes: { ...discoveryTimes },
      finishTimes: { ...finishTimes },
      edgeClassifications: {},
      mstEdges: [],
      boruvkaMinEdges: [],
      queue: [...queue], // Snapshop
      stack: [],
      processedSet: [...visited],
      currentNodeId: u,
      currentNeighborId: v,
      activeEdge: edge
    });
  };

  // 1. Init
  graph.nodes.forEach(n => {
    distances[n.id] = Infinity;
    parents[n.id] = null;
  });
  pushStep(1, "Initialize all nodes: visited = false, dist = ∞");
  pushStep(2, "Set distances to infinity");

  // 3. Q Init
  pushStep(3, "Initialize empty queue Q");

  // 4. Start Node
  time++;
  discoveryTimes[startNodeId] = time; // Enter Time
  visited.push(startNodeId);
  distances[startNodeId] = 0;
  pushStep(4, `Mark start node ${startNodeId} as visited, dist = 0`, startNodeId);

  // 5. Enqueue
  queue.push({ nodeId: startNodeId, distance: 0 });
  pushStep(5, `Enqueue ${startNodeId} into Q`, startNodeId);

  // 6. Loop
  while (queue.length > 0) {
    pushStep(6, "Check if Q is not empty");

    const uItem = queue.shift()!;
    const u = uItem.nodeId;
    
    time++;
    finishTimes[u] = time; // Leave Time
    
    pushStep(7, `Dequeue node ${u}`, u);

    // --- NEIGHBOR EXTRACTION & SORTING ---
    const neighbors: { id: string, edge: Edge }[] = [];
    graph.edges.forEach(e => {
        if (e.source === u) neighbors.push({ id: e.target, edge: e });
        else if (graph.isDirected === false && e.target === u) neighbors.push({ id: e.source, edge: e });
    });
    
    // Sort alphabetically by NEIGHBOR ID
    neighbors.sort((a, b) => a.id.localeCompare(b.id));

    for (const { id: v, edge } of neighbors) {
       pushStep(8, `Inspect neighbor ${v} of ${u}`, u, v, edge);
       
       // 9. check visited
       if (!visited.includes(v)) {
         pushStep(9, `Node ${v} is not visited`, u, v, edge);
         
         // 10. mark visited
         time++;
         discoveryTimes[v] = time; // Enter Time
         visited.push(v);
         pushStep(10, `Mark ${v} as visited`, u, v, edge);

         // 11. update dist
         distances[v] = distances[u] + 1;
         parents[v] = u;
         pushStep(11, `Set dist[${v}] = ${distances[v]}`, u, v, edge);

         // 12. enqueue
         queue.push({ nodeId: v, distance: distances[v] });
         pushStep(12, `Enqueue ${v} into Q`, u, v, edge);
       } else {
         pushStep(9, `Node ${v} already visited, skip`, u, v, edge);
       }
    }
  }
  
  pushStep(6, "Queue is empty. Algorithm Complete.");
  return steps;
};

// --- DFS SOLVER ---
export const calculateDFSSteps = (graph: Graph, startNodeId: string): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  const visited: string[] = [];
  const stack: string[] = []; // For visualization of recursion
  const parents: Record<string, string | null> = {};
  const distances: Record<string, number> = {}; // Used for 'visited' color logic in Canvas
  
  // Time Tracking for Pre/Post order
  let time = 0;
  const discoveryTimes: Record<string, number> = {};
  const finishTimes: Record<string, number> = {};
  
  let stepCounter = 0;
  const pushStep = (line: number, desc: string, u: string | null = null, v: string | null = null, edge: {source: string, target: string} | null = null, classifications: Record<string, EdgeType> = {}) => {
    steps.push({
      stepId: stepCounter++,
      lineNumber: line,
      description: desc,
      distances: { ...distances },
      parents: { ...parents },
      discoveryTimes: { ...discoveryTimes },
      finishTimes: { ...finishTimes },
      edgeClassifications: classifications,
      mstEdges: [],
      boruvkaMinEdges: [],
      queue: [],
      stack: [...stack],
      processedSet: [...visited],
      currentNodeId: u,
      currentNeighborId: v,
      activeEdge: edge
    });
  };

  graph.nodes.forEach(n => {
    distances[n.id] = Infinity;
    parents[n.id] = null;
  });
  
  // Helper for DFS-Visit
  const dfsVisit = (u: string) => {
    // Pre-order
    time++;
    discoveryTimes[u] = time;
    
    stack.push(u); 
    visited.push(u);
    distances[u] = 0; // Mark as visited for canvas
    
    pushStep(7, `DFS-VISIT(${u}): Mark ${u} as visited. Start Time: ${time}`, u);

    // Line 8: Iterate neighbors - SORTED ALPHABETICALLY
    const neighbors: { id: string, edge: Edge }[] = [];
    graph.edges.forEach(e => {
        if (e.source === u) neighbors.push({ id: e.target, edge: e });
        else if (graph.isDirected === false && e.target === u) neighbors.push({ id: e.source, edge: e });
    });
    
    neighbors.sort((a, b) => a.id.localeCompare(b.id));

    for (const { id: w, edge } of neighbors) {
      pushStep(8, `Check edge ${graph.isDirected !== false ? `(${u}, ${w})` : `{${u}, ${w}}`}`, u, w, edge);
      
      // Line 9: If not visited
      if (!visited.includes(w)) {
        pushStep(9, `${w} is not visited, recurse`, u, w, edge);
        parents[w] = u;
        
        // Line 10: Recurse
        pushStep(10, `Call DFS-VISIT(${w})`, u, w, edge);
        dfsVisit(w);
        
        // Return from recursion
        pushStep(10, `Returned from DFS-VISIT(${w}), back to ${u}`, u);
      } else {
         pushStep(9, `${w} already visited`, u, w, edge);
      }
    }
    
    // Post-order
    time++;
    finishTimes[u] = time;
    pushStep(6, `Finished processing ${u}. End Time: ${time}`, u);

    stack.pop(); 
  };

  // Main Loop
  pushStep(1, "Start DFS(G)");
  
  const sortedNodes = [
      graph.nodes.find(n => n.id === startNodeId)!, 
      ...graph.nodes.filter(n => n.id !== startNodeId).sort((a, b) => a.id.localeCompare(b.id))
  ];

  for (const node of sortedNodes) {
     pushStep(2, `Check main loop node ${node.id}`, node.id);
     if (!visited.includes(node.id)) {
        pushStep(3, `Node ${node.id} not visited. Call DFS-VISIT`, node.id);
        pushStep(4, `Calling DFS-VISIT(${node.id})`, node.id);
        dfsVisit(node.id);
     }
  }

  pushStep(1, "DFS Complete");

  // Edge Classification Step - Only for DIRECTED graphs
  if (graph.isDirected !== false) {
      const edgeClassifications: Record<string, EdgeType> = {};
      
      for (const edge of graph.edges) {
          const u = edge.source;
          const v = edge.target;
          const key = `${u}-${v}`;
          
          let type: EdgeType | null = null;

          // DIRECTED LOGIC
          // Tree Edge: u is parent of v
          if (parents[v] === u) {
              type = EdgeType.TREE;
          } else {
               // Classify non-tree edges based on times
               const d_u = discoveryTimes[u];
               const f_u = finishTimes[u];
               const d_v = discoveryTimes[v];
               const f_v = finishTimes[v];
               
               // Back Edge: v is ancestor of u (v discovered before u, finished after u)
               if (d_v < d_u && f_u < f_v) type = EdgeType.BACK;
               // Forward Edge: v is descendant of u (u discovered before v, finished after v)
               else if (d_u < d_v && f_v < f_u) type = EdgeType.FORWARD;
               // Cross Edge: All other cases
               else type = EdgeType.CROSS;
          }
          
          if (type) edgeClassifications[key] = type;
      }

      pushStep(1, "Classify Edges", null, null, null, edgeClassifications);
  }

  return steps;
};

// --- BELLMAN-FORD SOLVER ---
export const calculateBellmanFordSteps = (graph: Graph, startNodeId: string): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  const distances: Record<string, number> = {};
  const parents: Record<string, string | null> = {};
  // queue unused

  let stepCounter = 0;
  const pushStep = (line: number, desc: string, u: string | null = null, v: string | null = null, edge: {source: string, target: string} | null = null) => {
    steps.push({
      stepId: stepCounter++,
      lineNumber: line,
      description: desc,
      distances: { ...distances },
      parents: { ...parents },
      discoveryTimes: {},
      finishTimes: {},
      edgeClassifications: {},
      mstEdges: [],
      boruvkaMinEdges: [],
      queue: [],
      stack: [],
      processedSet: [], // BF re-visits nodes, 'processed' isn't a strict set like Dijkstra
      currentNodeId: u,
      currentNeighborId: v,
      activeEdge: edge
    });
  };

  // 1. Initialization
  graph.nodes.forEach(n => {
      if (n.id !== startNodeId) {
          distances[n.id] = Infinity;
          parents[n.id] = null;
      }
  });
  pushStep(1, "Initialize v ≠ s: d[v] = ∞");
  pushStep(2, "d[v] ← ∞");
  pushStep(3, "p[v] ← null");

  distances[startNodeId] = 0;
  parents[startNodeId] = null;
  pushStep(4, `Initialize start node ${startNodeId}: d=0`, startNodeId);

  const n = graph.nodes.length;
  const edges = graph.edges;
  // Sorting edges allows for a predictable order during visualization
  const sortedEdges = [...edges].sort((a, b) => {
      if (a.source === b.source) return a.target.localeCompare(b.target);
      return a.source.localeCompare(b.source);
  });

  // 5. Loop i = 1 to n-1
  for (let i = 1; i < n; i++) {
      pushStep(5, `Start Iteration i = ${i} (of ${n-1})`, null, null, null);
      
      // 6. Loop edges
      for (const edge of sortedEdges) {
          // Helper for relaxation
          const relax = (u: string, v: string, w: number) => {
             // Pass explicit source/target to pushStep so we know exactly which direction is being checked
             pushStep(6, `Check edge ${graph.isDirected !== false ? `(${u}, ${v})` : `{${u}, ${v}}`}`, u, v, {source: u, target: v});

              // 7. Relaxation check
              const du = distances[u];
              const dv = distances[v];

              // If d[u] is infinity, we can't relax.
              if (du === Infinity) {
                 pushStep(7, `d[${u}] is ∞, cannot relax`, u, v, {source: u, target: v});
                 return;
              }

              if (du + w < dv) {
                  pushStep(7, `d[${u}] (${du}) + ${w} < d[${v}] (${dv === Infinity ? '∞' : dv}). True.`, u, v, {source: u, target: v});
                  
                  distances[v] = du + w;
                  parents[v] = u;
                  pushStep(8, `Update d[${v}] = ${du + w}`, u, v, {source: u, target: v});
                  pushStep(9, `Update p[${v}] = ${u}`, u, v, {source: u, target: v});
              } else {
                  pushStep(7, `d[${u}] + ${w} ≥ d[${v}]. No update.`, u, v, {source: u, target: v});
              }
          };

          // Forward Direction
          relax(edge.source, edge.target, edge.weight);

          // If Undirected, we must also relax the other way within the same loop iteration for this edge
          if (graph.isDirected === false) {
               relax(edge.target, edge.source, edge.weight);
          }
      }
  }

  // Create final step with populated processedSet for visualization of Shortest Path Tree
  const finalizedNodes = Object.keys(distances).filter(id => distances[id] !== Infinity);
  
  steps.push({
      stepId: stepCounter++,
      lineNumber: 5,
      description: "Algorithm Complete (Shortest Path Tree Finalized).",
      distances: { ...distances },
      parents: { ...parents },
      discoveryTimes: {},
      finishTimes: {},
      edgeClassifications: {},
      mstEdges: [],
      boruvkaMinEdges: [],
      queue: [],
      stack: [],
      processedSet: finalizedNodes, // This triggers the green highlight
      currentNodeId: null,
      currentNeighborId: null,
      activeEdge: null
  });

  return steps;
}

// --- PRIM SOLVER ---
export const calculatePrimSteps = (graph: Graph, startNodeId: string): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  const mstEdges: {source: string, target: string}[] = []; // Set F
  const S: string[] = [startNodeId]; // Set S
  const distances: Record<string, number> = {}; // Only for visual feedback on table (min weight to S)
  const parents: Record<string, string | null> = {}; // For table consistency
  
  // Init distances to infinity for visual consistency
  graph.nodes.forEach(n => distances[n.id] = Infinity);
  distances[startNodeId] = 0;

  let stepCounter = 0;
  const pushStep = (line: number, desc: string, u: string | null = null, v: string | null = null, edge: {source: string, target: string} | null = null) => {
    steps.push({
      stepId: stepCounter++,
      lineNumber: line,
      description: desc,
      distances: { ...distances },
      parents: { ...parents },
      discoveryTimes: {},
      finishTimes: {},
      edgeClassifications: {},
      mstEdges: [...mstEdges],
      boruvkaMinEdges: [],
      queue: [],
      stack: [],
      processedSet: [...S],
      currentNodeId: u,
      currentNeighborId: v,
      activeEdge: edge
    });
  };

  pushStep(1, "F ← Ø");
  pushStep(2, `S ← {${startNodeId}}`);

  // Need to connect (N-1) nodes to the tree
  while (S.length < graph.nodes.length) {
     pushStep(3, `F has ${mstEdges.length} edges (needs ${graph.nodes.length - 1}). S has ${S.length} nodes.`);
     
     let minEdge: Edge | null = null;
     let minWeight = Infinity;
     let u_sel: string = "";
     let v_sel: string = "";
     
     // Iterate all edges in the graph
     for (const edge of graph.edges) {
        const u = edge.source;
        const v = edge.target;
        
        let candidate = false;
        let u_curr = u, v_curr = v;

        // Case 1: u in S, v not in S
        if (S.includes(u) && !S.includes(v)) {
             candidate = true;
        } 
        // Case 2: Undirected, v in S, u not in S
        else if (graph.isDirected === false && S.includes(v) && !S.includes(u)) {
             candidate = true;
             u_curr = v; v_curr = u; // Logic from S outwards
        }

        if (candidate) {
           if (edge.weight < minWeight) {
               minWeight = edge.weight;
               minEdge = edge;
               u_sel = u_curr;
               v_sel = v_curr;
           } else if (edge.weight === minWeight) {
              // Tie breaking: Alphabetical on target
              if (v_curr.localeCompare(v_sel) < 0) {
                  minEdge = edge;
                  u_sel = u_curr;
                  v_sel = v_curr;
              }
           }
        }
     }

     // Highlight the scan process implicitly or just select
     if (minEdge) {
        pushStep(4, `Found min edge {${u_sel}, ${v_sel}} with weight ${minWeight}`, u_sel, v_sel, minEdge);
        
        mstEdges.push({source: u_sel, target: v_sel});
        pushStep(5, `F ← F ∪ {{${u_sel}, ${v_sel}}}`, u_sel, v_sel, minEdge);

        S.push(v_sel);
        distances[v_sel] = minWeight; // Just for display
        parents[v_sel] = u_sel;
        pushStep(6, `S ← S ∪ {${v_sel}}`, u_sel, v_sel, minEdge);

     } else {
        pushStep(3, "No more reachable edges to unvisited nodes.", null, null);
        break; // Graph might be disconnected
     }
  }
  
  pushStep(3, "F is a spanning tree (or max reachable). Done.");
  return steps;
};

// --- KRUSKAL SOLVER ---
class UnionFind {
    parent: Record<string, string> = {};
    constructor(nodes: Node[]) {
        nodes.forEach(n => this.parent[n.id] = n.id);
    }
    find(i: string): string {
        if (this.parent[i] === i) return i;
        return this.find(this.parent[i]);
    }
    union(i: string, j: string) {
        const rootI = this.find(i);
        const rootJ = this.find(j);
        if (rootI !== rootJ) {
            // Simple union by setting parent (can optimize with rank, but not needed for small N)
            // Deterministic: set smaller char as parent
            if (rootI < rootJ) this.parent[rootJ] = rootI;
            else this.parent[rootI] = rootJ;
        }
    }
}

export const calculateKruskalSteps = (graph: Graph, _startNodeId: string): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const mstEdges: {source: string, target: string}[] = []; // Set F
    
    // We use 'parents' to visualize the disjoint sets in the table
    // We initiate UF helper
    const uf = new UnionFind(graph.nodes);
    
    let stepCounter = 0;
    const pushStep = (line: number, desc: string, u: string | null = null, v: string | null = null, edge: {source: string, target: string} | null = null) => {
      steps.push({
        stepId: stepCounter++,
        lineNumber: line,
        description: desc,
        distances: {},
        parents: { ...uf.parent }, // Snapshot of UF parents
        discoveryTimes: {},
        finishTimes: {},
        edgeClassifications: {},
        mstEdges: [...mstEdges],
        boruvkaMinEdges: [],
        queue: [],
        stack: [],
        processedSet: [],
        currentNodeId: u,
        currentNeighborId: v,
        activeEdge: edge
      });
    };

    pushStep(1, "F ← Ø (Initialize Empty MST)");

    // Sort Edges by Weight (Ascending)
    const sortedEdges = [...graph.edges].sort((a, b) => {
        if (a.weight !== b.weight) return a.weight - b.weight;
        // Tie-break: source, then target
        if (a.source !== b.source) return a.source.localeCompare(b.source);
        return a.target.localeCompare(b.target);
    });

    pushStep(2, "Sort edges by weight ascending");

    // Loop
    for (const edge of sortedEdges) {
        const u = edge.source;
        const v = edge.target;
        const weight = edge.weight;

        pushStep(2, `Inspect edge {${u}, ${v}} with weight ${weight}`, u, v, edge);

        const rootU = uf.find(u);
        const rootV = uf.find(v);

        pushStep(3, `Check components: Find(${u})=${rootU}, Find(${v})=${rootV}`, u, v, edge);

        if (rootU !== rootV) {
            pushStep(3, `Roots differ (${rootU} ≠ ${rootV}). Nodes are in different components.`, u, v, edge);
            
            mstEdges.push({ source: u, target: v });
            uf.union(u, v); // Update UF structure
            
            pushStep(4, `Add {${u}, ${v}} to F. Union sets.`, u, v, edge);
        } else {
            pushStep(3, `Roots are same (${rootU}). Edge forms a cycle. Skip.`, u, v, edge);
        }
    }

    pushStep(6, "Algorithm Complete. F is MST.");

    return steps;
};

// --- BORUVKA SOLVER ---
export const calculateBoruvkaSteps = (graph: Graph, _startNodeId: string): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const mstEdges: {source: string, target: string}[] = []; // Set F
    
    // Union Find for components
    const uf = new UnionFind(graph.nodes);
    
    // Used for visualizing the edges e1...ek for the current iteration
    // Map component root -> edge
    let currentMinEdges: { root: string, edge: Edge }[] = [];
    let currentComponentNodes: string[] = []; // For highlighting nodes in S_i

    let stepCounter = 0;
    const pushStep = (line: number, desc: string, u: string | null = null, v: string | null = null, edge: {source: string, target: string} | null = null) => {
      steps.push({
        stepId: stepCounter++,
        lineNumber: line,
        description: desc,
        distances: {},
        parents: { ...uf.parent }, // Snapshot of UF parents for visualization
        discoveryTimes: {},
        finishTimes: {},
        edgeClassifications: {},
        mstEdges: [...mstEdges],
        boruvkaMinEdges: [...currentMinEdges],
        queue: currentComponentNodes.map(id => ({ nodeId: id, distance: 0 })), // Reuse queue for S_i highlighting
        stack: [],
        processedSet: [],
        currentNodeId: u,
        currentNeighborId: v,
        activeEdge: edge
      });
    };

    pushStep(1, "F ← Ø");
    
    let numComponents = graph.nodes.length;
    
    while (numComponents > 1) {
        // Clear the visualizer min edges for start of new iteration
        currentMinEdges = [];
        
        pushStep(2, `Checking connectivity. ${numComponents} components remaining.`);
        
        // Identify connected components
        pushStep(3, "Identify Connected Components (S1...Sk)");

        // 1. Build Component Map: Root -> Node[]
        const components: Record<string, string[]> = {};
        graph.nodes.forEach(n => {
            const root = uf.find(n.id);
            if (!components[root]) components[root] = [];
            components[root].push(n.id);
        });

        // Sort roots for deterministic iteration order
        const sortedRoots = Object.keys(components).sort();

        if (sortedRoots.length <= 1) {
            pushStep(2, "Only 1 component left (Spanning Tree formed).");
            break; 
        }

        // Edges to be added after the loop
        const edgesToAdd: Edge[] = [];
        const addedEdgeKeys = new Set<string>();
        const getEdgeKey = (e: Edge) => e.source < e.target ? `${e.source}-${e.target}` : `${e.target}-${e.source}`;

        // 2. Iterate components (S_i) - Pseudocode loop 1 to k
        for (let i = 0; i < sortedRoots.length; i++) {
            const root = sortedRoots[i];
            const nodesInS = components[root];
            currentComponentNodes = nodesInS; // Highlight S_i

            pushStep(4, `Inspecting Component S${i+1} (Root: ${root})`);

            // Find min outgoing edge for S_i
            let minEdge: Edge | null = null;
            let minWeight = Infinity;

            for (const edge of graph.edges) {
                const u = edge.source;
                const v = edge.target;
                
                const rootU = uf.find(u);
                const rootV = uf.find(v);
                
                // Check if edge connects S_i to outside
                let isOutgoing = false;
                if (rootU === root && rootV !== root) isOutgoing = true;
                else if (rootV === root && rootU !== root) isOutgoing = true;

                if (isOutgoing) {
                    if (edge.weight < minWeight) {
                        minWeight = edge.weight;
                        minEdge = edge;
                    }
                }
            }

            if (minEdge) {
                // Add to visual list for this iteration
                currentMinEdges.push({ root, edge: minEdge });
                
                pushStep(5, `Found min outgoing edge {${minEdge.source}, ${minEdge.target}} (w:${minEdge.weight})`, null, null, minEdge);
                
                // Add to merge list
                const key = getEdgeKey(minEdge);
                if (!addedEdgeKeys.has(key)) {
                    edgesToAdd.push(minEdge);
                    addedEdgeKeys.add(key);
                }
            } else {
                pushStep(5, `No outgoing edge found for S${i+1} (Disconnected Graph?)`);
            }
        }
        
        currentComponentNodes = []; // Clear highlight
        
        if (edgesToAdd.length === 0) {
            pushStep(2, "No edges connect remaining components. Graph disconnected.", null, null);
            break;
        }

        // 3. Merge
        for (const edge of edgesToAdd) {
            const u = edge.source;
            const v = edge.target;
            
            const rootU = uf.find(u);
            const rootV = uf.find(v);

            if (rootU !== rootV) {
                mstEdges.push({ source: u, target: v });
                // Push Step BEFORE union to show components separate and edge active
                pushStep(6, `Add min edge {${u}, ${v}} to F. Merge sets.`, u, v, edge);
                uf.union(u, v);
                numComponents--;
            }
        }
    }
    
    currentMinEdges = []; // Clean up
    pushStep(6, "F is a spanning tree (or max reachable). Done.");

    return steps;
};
