

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
  // Shifted up slightly (approx -0.02) to move graph upwards in the box
  const layout = [
    { x: 0.10, y: 0.43 }, // Node A (Start) - Middle Left
    { x: 0.20, y: 0.13 }, // Node B - Top Left (Outwards)
    { x: 0.20, y: 0.68 }, // Node C - Bottom Left (Outwards)
    { x: 0.50, y: 0.10 }, // Node D - Top Center
    { x: 0.50, y: 0.43 }, // Node E - Dead Center
    { x: 0.50, y: 0.73 }, // Node F - Bottom Center
    { x: 0.80, y: 0.13 }, // Node G - Top Right (Outwards)
    { x: 0.80, y: 0.68 }, // Node H - Bottom Right (Outwards)
    { x: 0.90, y: 0.43 }, // Node I - Middle Right
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

      // Explicitly disallow edges between B-C and G-H
      if ((source.id === 'B' && target.id === 'C') || (source.id === 'C' && target.id === 'B')) return false;
      if ((source.id === 'G' && target.id === 'H') || (source.id === 'H' && target.id === 'G')) return false;

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
      while (indices.size < 3 && indices.size < edges.length) {
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
  const pushStep = (line: number, desc: string, u: string | null = null, v: string | null = null, edge: { source: string, target: string } | null = null) => {
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
      queue: queue.map(i => ({ ...i })).sort((a, b) => a.distance - b.distance),
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
  pushStep(1, "Initialize all v ≠ s: d[v] = ∞, p[v] = null");

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
  const pushStep = (line: number, desc: string, u: string | null = null, v: string | null = null, edge: { source: string, target: string } | null = null) => {
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
  pushStep(2, "Initialize all nodes: visited = false, dist = ∞");

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
  const pushStep = (line: number, desc: string, u: string | null = null, v: string | null = null, edge: { source: string, target: string } | null = null, classifications: Record<string, EdgeType> = {}) => {
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
        pushStep(9, `${w} is not visited`, u, w, edge);
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
  const pushStep = (line: number, desc: string, u: string | null = null, v: string | null = null, edge: { source: string, target: string } | null = null) => {
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
  pushStep(1, "Initialize all v ≠ s:");
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
    pushStep(5, `Start Iteration i = ${i} (of ${n - 1})`, null, null, null);

    // 6. Loop edges
    for (const edge of sortedEdges) {
      // Helper for relaxation
      const relax = (u: string, v: string, w: number) => {
        // Pass explicit source/target to pushStep so we know exactly which direction is being checked
        pushStep(6, `Check edge ${graph.isDirected !== false ? `(${u}, ${v})` : `{${u}, ${v}}`}`, u, v, { source: u, target: v });

        // 7. Relaxation check
        const du = distances[u];
        const dv = distances[v];

        // If d[u] is infinity, we can't relax.
        if (du === Infinity) {
          pushStep(7, `d[${u}] is ∞, cannot improve`, u, v, { source: u, target: v });
          return;
        }

        if (du + w < dv) {
          pushStep(7, `d[${u}] (${du}) + ${w} < d[${v}] (${dv === Infinity ? '∞' : dv}). True.`, u, v, { source: u, target: v });

          distances[v] = du + w;
          parents[v] = u;
          pushStep(8, `Update d[${v}] = ${du + w}`, u, v, { source: u, target: v });
          pushStep(9, `Update p[${v}] = ${u}`, u, v, { source: u, target: v });
        } else {
          pushStep(7, `d[${u}] + ${w} ≥ d[${v}]. No update.`, u, v, { source: u, target: v });
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
  const mstEdges: { source: string, target: string }[] = []; // Set F
  const S: string[] = [startNodeId]; // Set S
  const distances: Record<string, number> = {}; // Only for visual feedback on table (min weight to S)
  const parents: Record<string, string | null> = {}; // For table consistency

  // Init distances to infinity for visual consistency
  graph.nodes.forEach(n => distances[n.id] = Infinity);
  distances[startNodeId] = 0;

  let stepCounter = 0;
  const pushStep = (line: number, desc: string, u: string | null = null, v: string | null = null, edge: { source: string, target: string } | null = null) => {
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

      mstEdges.push({ source: u_sel, target: v_sel });
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

export const calculateKruskalSteps = (graph: Graph): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  const mstEdges: { source: string, target: string }[] = []; // Set F

  // Data Structures
  const rep: Record<string, string> = {};
  const members: Record<string, string[]> = {};

  let stepCounter = 0;
  const pushStep = (line: number, desc: string, u: string | null = null, v: string | null = null, edge: { source: string, target: string } | null = null) => {
    steps.push({
      stepId: stepCounter++,
      lineNumber: line,
      description: desc,
      distances: {},
      parents: { ...rep }, // Map rep to parents for visualization compatibility (though semantics differ)
      unionFindMembers: JSON.parse(JSON.stringify(members)), // Deep copy
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

  // 1. Init
  // 1. Line 1: Kruskal Function Entry
  pushStep(1, "Kruskal(G = (V, E))");

  // 2. Line 2: F <- Empty
  pushStep(2, "F ← Ø");

  // 3. Line 3: Call MAKE(V)
  pushStep(3, "MAKE(V)");

  // Execute Make(V) Logic (Helper function lines 10-13)
  pushStep(10, "Make(V):");
  graph.nodes.forEach(node => {
    rep[node.id] = node.id;
    members[node.id] = [node.id];
    pushStep(12, `rep[${node.id}] ← ${node.id}`, node.id);
    pushStep(13, `members[${node.id}] ← {${node.id}}`, node.id);
  });

  // 18. Sort Edges
  const sortedEdges = [...graph.edges].sort((a, b) => {
    if (a.weight !== b.weight) return a.weight - b.weight;
    if (a.source !== b.source) return a.source.localeCompare(b.source);
    return a.target.localeCompare(b.target);
  });
  pushStep(4, "Sort edges by weight ascending");

  // Helper: Same(u, v)
  const same = (u: string, v: string, edge: Edge) => {
    pushStep(15, `Same(${u}, ${v}): Check rep[${u}] == rep[${v}]`, u, v, edge);
    const result = rep[u] === rep[v];
    pushStep(16, `return (${rep[u]} == ${rep[v]}) -> ${result}`, u, v, edge);
    return result;
  };

  // Helper: Union(u, v)
  const union = (u: string, v: string, edge: Edge) => {
    pushStep(18, `Union(${u}, ${v})`, u, v, edge);

    let rootU = rep[u];
    let rootV = rep[v];

    // 10. Check sizes
    pushStep(19, `if |members[${rootU}]| (${members[rootU].length}) > |members[${rootV}]| (${members[rootV].length})`, u, v, edge);
    if (members[rootU].length > members[rootV].length) {
      pushStep(20, `Swap ${u}, ${v}`, u, v, edge);
      // Swap u, v effectively means we merge smaller into larger. 
      // The code says "Swap u, v". In our context, we just swap the roots we are working with.
      [u, v] = [v, u];
      [rootU, rootV] = [rootV, rootU];
    }

    // 12. Loop x in members[rep[u]]
    // Note: After swap, u is the one being merged INTO v. So we iterate members[rep[u]].
    // VISUALIZATION FIX: Sort so that rootU is processed LAST. 
    // This allows rootU to remain the "representative" (rep[rootU] == rootU) until the very end,
    // keeping the "members[rootU]" row visible in the table as it shrinks.
    const membersToMove = [...members[rootU]].sort((a, b) => {
      if (a === rootU) return 1;
      if (b === rootU) return -1;
      return a.localeCompare(b);
    });

    for (const x of membersToMove) {
      pushStep(21, `for x (${x}) in members[${rootU}]`, u, v, edge);

      // 13. rep[x] <- rep[v]
      rep[x] = rootV;
      pushStep(22, `rep[${x}] ← ${rootV}`, u, v, edge);

      // 14. members[rep[v]] <- members[rep[v]] U {x}
      // VISUALIZATION FIX: Explicitly remove from old set and add to new set step-by-step
      members[rootU] = members[rootU].filter(m => m !== x);
      members[rootV].push(x);

      // Optional: Sort members[rootV] for cleanliness if desired, but append is fine for showing history
      // members[rootV].sort(); 

      pushStep(23, `members[${rootV}] ← members[${rootV}] ∪ {${x}}`, u, v, edge);
    }

    // Cleanup old members set to avoid clutter in visualization if we iterate keys
    delete members[rootU];
  };

  // Main Loop
  for (const edge of sortedEdges) {
    const u = edge.source;
    const v = edge.target;
    pushStep(4, `Inspect edge {${u}, ${v}} (w: ${edge.weight})`, u, v, edge);

    // 19. if not Same(u, v)
    if (!same(u, v, edge)) {
      pushStep(5, `Same(${u}, ${v}) is false.`, u, v, edge);

      // 20. F <- F U {(u, v)}
      mstEdges.push({ source: u, target: v });
      pushStep(6, `F ← F ∪ {(${u}, ${v})}`, u, v, edge);

      // 21. Union(u, v)
      union(u, v, edge);
    } else {
      pushStep(5, `Same(${u}, ${v}) is true. Cycle detected. Skip.`, u, v, edge);
    }
  }

  pushStep(8, "return F (MST completed)");
  return steps;
};

// --- BORUVKA SOLVER ---
export const calculateBoruvkaSteps = (graph: Graph): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  const mstEdges: { source: string, target: string }[] = []; // Set F

  // Union Find for components
  const uf = new UnionFind(graph.nodes);

  // Used for visualizing the edges e1...ek for the current iteration
  // Map component root -> edge
  let currentMinEdges: { root: string, edge: Edge }[] = [];
  let currentComponentNodes: string[] = []; // For highlighting nodes in S_i

  let stepCounter = 0;
  const pushStep = (line: number, desc: string, u: string | null = null, v: string | null = null, edge: { source: string, target: string } | null = null) => {
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

      pushStep(4, `Inspecting Component S${i + 1} (Root: ${root})`);

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
        pushStep(5, `No outgoing edge found for S${i + 1} (Disconnected Graph?)`);
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

// --- TARJAN SOLVER (Articulation Points) ---
export const calculateTarjanSteps = (graph: Graph, startNodeId: string): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  const visited: string[] = [];
  const parents: Record<string, string | null> = {};
  const discoveryTimes: Record<string, number> = {};
  const lowLinks: Record<string, number> = {};

  const articulationPoints: Set<string> = new Set();
  const foundBridges: { source: string, target: string }[] = [];
  const edgeClassifications: Record<string, EdgeType> = {}; // Reuse EdgeType for BACK edges (optional visualization)

  let time = 0;
  let stepCounter = 0;

  // Helper to push steps
  const pushStep = (
    line: number,
    desc: string,
    u: string | null = null,
    v: string | null = null,
    edge: { source: string, target: string } | null = null
  ) => {
    steps.push({
      stepId: stepCounter++,
      lineNumber: line,
      description: desc,
      distances: {}, // Not used
      parents: { ...parents },
      discoveryTimes: { ...discoveryTimes },
      finishTimes: {}, // Not used
      edgeClassifications: { ...edgeClassifications },
      mstEdges: [],
      boruvkaMinEdges: [],
      queue: [],
      stack: [],
      processedSet: [...visited],
      currentNodeId: u,
      currentNeighborId: v,
      activeEdge: edge,
      lowLinks: { ...lowLinks },
      articulationPoints: Array.from(articulationPoints),
      bridges: [...foundBridges]
    });
  };

  // Init
  graph.nodes.forEach(n => {
    parents[n.id] = null;
    // lowLinks and discoveryTimes technically undefined initially
  });

  const dfsAP = (u: string, p: string | null) => {
    let children = 0;
    time++;
    discoveryTimes[u] = time;
    lowLinks[u] = time;
    visited.push(u);

    pushStep(2, `dfs[${u}] = low[${u}] = ${time}`, u);
    pushStep(3, `time++ (time is now ${time + 1})`, u);

    // Get neighbors sorted
    const neighbors: { id: string, edge: Edge }[] = [];
    graph.edges.forEach(e => {
      if (e.source === u) neighbors.push({ id: e.target, edge: e });
      else if (e.target === u) neighbors.push({ id: e.source, edge: e });
    });
    neighbors.sort((a, b) => a.id.localeCompare(b.id));

    pushStep(4, `Examine neighbors of ${u}`, u);
    for (const { id: v } of neighbors) {
      pushStep(4, `Check neighbor ${v}`, u, v, { source: u, target: v });

      if (v === p) {
        pushStep(5, `Neighbor ${v} is parent. Continue.`, u, v, { source: u, target: v });
        continue;
      }

      if (visited.includes(v)) {
        pushStep(6, `${v} is already visited (Back Edge)`, u, v, { source: u, target: v });

        const currentLow = lowLinks[u];
        const discV = discoveryTimes[v];

        if (discV < currentLow) {
          lowLinks[u] = discV;
          pushStep(7, `Update low[${u}] = min(${currentLow}, dfs[${v}]:${discV}) = ${discV}`, u, v, { source: u, target: v });
        } else {
          pushStep(7, `low[${u}]:${currentLow} <= dfs[${v}]:${discV}. No change.`, u, v, { source: u, target: v });
        }

        // Visualize back edge?
        edgeClassifications[`${u}-${v}`] = EdgeType.BACK;
      } else {
        pushStep(8, `${v} is not visited. Recurse.`, u, v, { source: u, target: v });
        children++;
        parents[v] = u;

        pushStep(9, `Call TARJAN(${v}, ${u})`, u, v, { source: u, target: v });
        dfsAP(v, u);
        pushStep(9, `Returned to ${u} from ${v}`, u, v, { source: u, target: v });

        // Update Low
        const currentLow = lowLinks[u];
        const childLow = lowLinks[v];

        // Silent AP/Bridge Detection for Visualization
        if (lowLinks[v] > discoveryTimes[u]) {
          foundBridges.push({ source: u, target: v });
        }
        if (p !== null && lowLinks[v] >= discoveryTimes[u]) {
          articulationPoints.add(u);
        }

        if (childLow < currentLow) {
          lowLinks[u] = childLow;
          pushStep(10, `Update low[${u}] = min(${currentLow}, low[${v}]:${childLow}) = ${childLow}`, u, v, { source: u, target: v });
        } else {
          pushStep(10, `low[${u}]:${currentLow} <= low[${v}]:${childLow}. No change.`, u, v, { source: u, target: v });
        }
      }
    }

    // Root check (Silent)
    if (p === null && children > 1) {
      articulationPoints.add(u);
    }
  };

  pushStep(1, "Start TARJAN on start node");
  // Assuming graph is connected or we just run on start component
  dfsAP(startNodeId, null);

  pushStep(1, "Algorithm Complete. Articulation Points found: " + Array.from(articulationPoints).join(", "));
  return steps;
};

// --- FIXED GRAPH GENERATOR FOR TARJAN ---
export const generateTarjanGraph = (width: number, height: number): Graph => {
  const nodes: Node[] = [];



  // Layout: 12 nodes, fixed placement.
  // Structure:
  // Ring A-B-C-D (Left)
  // connection D-E
  // Ring E-F-G-H (Middle)
  // connection H-I
  // Triangle I-J-K (Right)
  // L hanging off K

  // Refined Layout coordinates - Spaced evenly to fill canvas
  const layout = [
    // Left Group (Cluster 1)
    { id: 'A', x: 0.10, y: 0.20 },
    { id: 'B', x: 0.10, y: 0.80 },
    { id: 'C', x: 0.25, y: 0.60 },
    { id: 'D', x: 0.35, y: 0.30 }, // Bridge source

    // Middle Group (Cluster 2)
    { id: 'E', x: 0.45, y: 0.50 }, // Bridge dest from D
    { id: 'F', x: 0.50, y: 0.20 },
    { id: 'G', x: 0.50, y: 0.72 },
    { id: 'H', x: 0.60, y: 0.45 }, // Bridge source to I

    // Right Group (Cluster 3)
    { id: 'I', x: 0.70, y: 0.50 }, // Bridge dest from H
    { id: 'J', x: 0.80, y: 0.23 },
    { id: 'K', x: 0.80, y: 0.73 },
    { id: 'L', x: 0.90, y: 0.50 }  // Leaf
  ];

  layout.forEach(pos => {
    nodes.push({
      id: pos.id,
      label: pos.id,
      x: pos.x * width,
      y: pos.y * height
    });
  });

  // --- Randomized Edge Generation ---

  // Define all physically "reasonable" edges that adhere to constraints
  const allowedEdges = [
    // Cluster 1 (Left) Allowed
    ['A', 'B'], ['B', 'C'], ['C', 'D'], ['C', 'E'], ['D', 'A'], ['A', 'C'],
    // Bridge Left-Mid (Strict to keep D as AP)
    ['D', 'E'],
    // Cluster 2 (Mid) Allowed
    ['E', 'F'], ['E', 'G'], ['E', 'H'],
    ['F', 'H'], ['G', 'H'], ['F', 'J'],
    // Bridge Mid-Right (Strict to keep H-I link)
    ['H', 'I'],
    // Cluster 3 (Right) Allowed
    ['I', 'J'], ['I', 'K'],
    ['J', 'L'], ['K', 'L'],
    ['I', 'L'], ['G', 'K'], ['B', 'G']// Extra chord
  ];

  let bestEdges: Edge[] = [];
  let connected = false;
  let attempt = 0;

  // Helper BFS for connectivity
  const checkConnected = (testEdges: Edge[]) => {
    if (testEdges.length < nodes.length - 1) return false; // Optimization
    const adj: Record<string, string[]> = {};
    nodes.forEach(n => adj[n.id] = []);
    testEdges.forEach(e => {
      adj[e.source].push(e.target);
      adj[e.target].push(e.source);
    });

    const q = [nodes[0].id];
    const visited = new Set<string>([nodes[0].id]);
    let head = 0;
    while (head < q.length) {
      const u = q[head++];
      for (const v of adj[u]) {
        if (!visited.has(v)) {
          visited.add(v);
          q.push(v);
        }
      }
    }
    return visited.size === nodes.length;
  };

  while (!connected && attempt < 100) {
    attempt++;
    const currentEdges: Edge[] = [];

    // Randomly select from allowed edges
    // Use higher probability to ensure connectivity is likely
    allowedEdges.forEach(pair => {
      if (Math.random() > 0.35) { // 65% chance to keep edge
        currentEdges.push({ source: pair[0], target: pair[1], weight: 1 });
      }
    });

    if (checkConnected(currentEdges)) {
      bestEdges = currentEdges;
      connected = true;
    }
  }

  // Fallback: Use all allowed edges if random generation fails
  if (!connected) {
    bestEdges = [];
    allowedEdges.forEach(pair => {
      bestEdges.push({ source: pair[0], target: pair[1], weight: 1 });
    });
  }

  return {
    nodes,
    edges: bestEdges,
    isDirected: false,
    hasUniqueWeights: false
  };
};

// --- EULERIAN GRAPH GENERATOR ---
// --- EULERIAN GRAPH GENERATOR ---
export const generateEulerianGraph = (width: number, height: number): Graph => {
  // 1. Start with Tarjan's layout (User Request)
  const baseNodes = generateTarjanGraph(width, height).nodes;
  let validGraph: Graph | null = null;

  // Strategy:
  // 1. Create a Restricted Graph using Allowed Edges
  // 2. Goal: Exactly 2 nodes with Degree 4, rest Degree 2 (4-path construction).
  // 3. Fallback: Hamiltonian Cycle (Degree 2 for all).

  // RESTRICTED ALLOWED EDGES
  const ALLOWED_EDGES_LIST = [
    "AB", "AC", "AD", "AF", "BC", "BG", "CE", "CD", "DF", "DE", "DH",
    "EF", "EH", "EG", "EK", "FJ", "FH", "FL", "GH", "GI", "GK", "GL", "HJ", "IJ",
    "IL", "IK", "JL", "JK", "KL"
  ];

  // Helper to check if edge is allowed
  const isEdgeAllowed = (u: string, v: string) => {
    const k1 = u + v;
    const k2 = v + u;
    return ALLOWED_EDGES_LIST.includes(k1) || ALLOWED_EDGES_LIST.includes(k2);
  };

  let outerAttempts = 0;

  while (!validGraph && outerAttempts < 30) {
    outerAttempts++;
    let attempts = 0;
    let candidateGraph: Graph | null = null;

    while (!candidateGraph && attempts < 100) {
      attempts++;

      // 1. Pick two "Hub" nodes u, v
      const p1Index = Math.floor(Math.random() * baseNodes.length);
      let p2Index = Math.floor(Math.random() * baseNodes.length);
      while (p1Index === p2Index) p2Index = Math.floor(Math.random() * baseNodes.length);

      const u = baseNodes[p1Index];
      const v = baseNodes[p2Index];

      // 2. Identify remaining 10 internal nodes
      const internalNodes = baseNodes.filter(n => n.id !== u.id && n.id !== v.id);

      // Shuffle internals for randomness
      for (let i = internalNodes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [internalNodes[i], internalNodes[j]] = [internalNodes[j], internalNodes[i]];
      }

      // 3. Partition into 3 or 4 buckets depending on direct edge viability
      const canDirect = isEdgeAllowed(u.id, v.id);
      const paths: Node[][] = [];

      // Randomize Strategy: Prefer direct edge if possible to mix it up, but sometimes force 4 internal
      if (canDirect && Math.random() > 0.3) {
        // Case A: 1 Direct Path, 3 Internal Paths
        paths.push([]); // Empty bucket signifies Direct Edge

        // Split 10 nodes into 3 buckets
        // Random cuts
        const i = Math.floor(Math.random() * (internalNodes.length - 2)) + 1;
        const j = Math.floor(Math.random() * (internalNodes.length - 1 - i)) + i + 1;

        paths.push(internalNodes.slice(0, i));
        paths.push(internalNodes.slice(i, j));
        paths.push(internalNodes.slice(j));
      } else {
        // Case B: 4 Internal Paths
        const i = Math.floor(Math.random() * (internalNodes.length - 3)) + 1;
        const j = Math.floor(Math.random() * (internalNodes.length - 2 - i)) + i + 1;
        const k = Math.floor(Math.random() * (internalNodes.length - 1 - j)) + j + 1;

        paths.push(internalNodes.slice(0, i));
        paths.push(internalNodes.slice(i, j));
        paths.push(internalNodes.slice(j, k));
        paths.push(internalNodes.slice(k));
      }

      // 4. Try to form valid paths using ONLY allowed edges
      let validTopology = true;
      const tempEdges: Edge[] = [];
      const usedPairs = new Set<string>();

      const findValidPath = (start: string, end: string, nodes: Node[]): Node[] | null => {
        if (nodes.length === 0) {
          return isEdgeAllowed(start, end) ? [] : null;
        }

        // Try each node as next step
        for (let i = 0; i < nodes.length; i++) {
          const next = nodes[i];
          if (isEdgeAllowed(start, next.id)) {
            const remaining = [...nodes];
            remaining.splice(i, 1);
            const subPath = findValidPath(next.id, end, remaining);
            if (subPath) return [next, ...subPath];
          }
        }
        return null; // No path found
      };

      for (const pathNodes of paths) {
        if (pathNodes.length === 0) {
          // Direct
          const key = u.id < v.id ? `${u.id}-${v.id}` : `${v.id}-${u.id}`;
          if (usedPairs.has(key)) { validTopology = false; break; }
          tempEdges.push({ source: u.id, target: v.id, weight: 1 });
          usedPairs.add(key);
          continue;
        }

        // Find path u -> [nodes] -> v
        const validSeq = findValidPath(u.id, v.id, pathNodes);

        if (!validSeq) {
          validTopology = false;
          break;
        }

        // Add edges
        let prev = u;
        for (const curr of validSeq) {
          const key = prev.id < curr.id ? `${prev.id}-${curr.id}` : `${curr.id}-${prev.id}`;
          if (usedPairs.has(key)) { validTopology = false; break; }
          tempEdges.push({ source: prev.id, target: curr.id, weight: 1 });
          usedPairs.add(key);
          prev = curr;
        }
        // Final link to v
        const last = validSeq[validSeq.length - 1]; // Guaranteed non-empty here
        const key = last.id < v.id ? `${last.id}-${v.id}` : `${v.id}-${last.id}`;
        if (usedPairs.has(key)) { validTopology = false; break; }
        tempEdges.push({ source: last.id, target: v.id, weight: 1 });
        usedPairs.add(key);
      }

      if (validTopology) {
        candidateGraph = {
          nodes: baseNodes,
          edges: tempEdges,
          isDirected: false,
          hasUniqueWeights: false
        };
      }
    }

    // Fallback: If 4-path construction failed
    if (!candidateGraph) {
      // Try to find a simple Hamiltonian Cycle
      let fallbackAttempts = 0;
      while (!candidateGraph && fallbackAttempts < 200) {
        fallbackAttempts++;
        const nodes = [...baseNodes];
        // Shuffle
        for (let i = nodes.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
        }

        const cycleEdges: Edge[] = [];
        let isCycle = true;

        // Try to connect i -> i+1
        for (let i = 0; i < nodes.length; i++) {
          const u = nodes[i];
          const v = nodes[(i + 1) % nodes.length]; // Wrap around for cycle
          if (isEdgeAllowed(u.id, v.id)) {
            cycleEdges.push({ source: u.id, target: v.id, weight: 1 });
          } else {
            isCycle = false;
            break;
          }
        }

        if (isCycle) {
          candidateGraph = {
            nodes: baseNodes,
            edges: cycleEdges,
            isDirected: false,
            hasUniqueWeights: false
          };
        }
      }
    }

    // Check Constraint: NO DEGREE 1 NODES
    if (candidateGraph) {
      const degrees: Record<string, number> = {};
      baseNodes.forEach(n => degrees[n.id] = 0);
      candidateGraph.edges.forEach(e => {
        degrees[e.source] = (degrees[e.source] || 0) + 1;
        degrees[e.target] = (degrees[e.target] || 0) + 1;
      });

      const hasDegreeOne = Object.values(degrees).some(d => d === 1);

      // Connectivity Check (BFS)
      const adj: Record<string, string[]> = {};
      baseNodes.forEach(n => adj[n.id] = []);
      candidateGraph.edges.forEach(e => {
        adj[e.source].push(e.target);
        adj[e.target].push(e.source);
      });

      const startNode = baseNodes.find(n => (degrees[n.id] || 0) > 0);
      let connectedCount = 0;

      if (startNode) {
        const q = [startNode.id];
        const visited = new Set([startNode.id]);
        let head = 0;
        while (head < q.length) {
          const curr = q[head++];
          for (const nbr of adj[curr]) {
            if (!visited.has(nbr)) {
              visited.add(nbr);
              q.push(nbr);
            }
          }
        }
        connectedCount = visited.size;
      }

      const activeNodes = Object.values(degrees).filter(d => d > 0).length;

      if (!hasDegreeOne && connectedCount === activeNodes && activeNodes >= 3) {
        validGraph = candidateGraph;
      } else {
        validGraph = null;
      }
    }
  }

  return validGraph || generateTarjanGraph(width, height);
};

// --- EULER SOLVER ---
export const calculateEulerSteps = (graph: Graph, startNodeId: string): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];

  // Working Copy of Edges (to track removal)
  // We need to handle undirected edges. We'll store them as string keys "min-max"
  const availableEdges = new Set<string>();
  const edgeObjMap: Record<string, Edge> = {}; // To retrieve the actual edge object for highlighting

  // Track direction of traversal for arrows: "source-target" string
  const traversedDirectionalEdges = new Set<string>();

  const getEdgeKey = (u: string, v: string) => u < v ? `${u}-${v}` : `${v}-${u}`;

  graph.edges.forEach(e => {
    const key = getEdgeKey(e.source, e.target);
    availableEdges.add(key);
    edgeObjMap[key] = e;
  });

  let stepCounter = 0;
  const pushStep = (
    line: number,
    desc: string,
    tour: string[],
    subTour: string[] | null = null,
    u: string | null = null, // Current Node focused
    v: string | null = null, // Neighbor focused
    activeEdgeKey: string | null = null
  ) => {

    // Convert traversed set to classifications
    const classifications: Record<string, EdgeType> = {};
    traversedDirectionalEdges.forEach(k => {
      classifications[k] = EdgeType.TREE; // Value doesn't matter, just truthy
    });

    steps.push({
      stepId: stepCounter++,
      lineNumber: line,
      description: desc,
      distances: {},
      parents: {},
      discoveryTimes: {},
      finishTimes: {},
      edgeClassifications: classifications,
      mstEdges: [],
      boruvkaMinEdges: [],
      queue: [],
      stack: [],
      processedSet: [],
      currentNodeId: u,
      currentNeighborId: v,
      activeEdge: activeEdgeKey ? edgeObjMap[activeEdgeKey] : null,

      eulerTour: [...tour],
      eulerSubTour: subTour ? [...subTour] : undefined,
    });
  };

  // Helper to sync removed edges to step state (implicitly handled by the logic below? 
  // No, the step object is a snapshot. We need to pass the state.)
  // Actually the visualizer needs to know which edges are "removed".
  // Let's use `edgeClassifications` with a special type "BACK" (or a new type) to mean "Removed/Traversed".
  // Since we can't change enum easily without updating everything, let's use `EdgeType.TREE` for "In Tour" and `EdgeType.CROSS` for removed?
  // Use `processedSet` for something?
  // Let's stick to: The step contains the Tour. The GraphCanvas should probably render the Tour specially.
  // But wait, the GraphCanvas renders `graph.edges`. Steps usually highlight things.
  // If we want edges to "disappear", we might need a custom renderer or just highlight them as "Used".
  // Let's decide: "Used" edges will be highlighted in the Tour color. "Available" edges are neutral.

  // Actually, better: Pass `traversedEdgeKeys` in `edgeClassifications`?
  // Let's just track the tour in `eulerTour`. The Visualizer can draw the tour.
  // But we also need to know which edges are still available for traversal in the *Input Graph*.
  // `availableEdges` set tracks this in logic. We can pass `availableEdges` in a custom field? 
  // Or just rely on the fact that if an edge is in `eulerTour` or `eulerSubTour`, it is used.
  // But `eulerTour` is a list of nodes. Multigraphs issue? The graphUtils doesn't support multigraphs well.
  // Unique edges only. So `u-v` in tour means that edge is used.
  // Wait, if we traverse `u-v` then later `v-u`, is that allowed in simple graph? No, simple graph edges used once.

  // So: List of nodes in Tour implies edges.
  // We will assume that strictly sequential pairs in `eulerTour` represent the used edges.

  // Start Algorithm
  let W: string[] = [];

  // Line 1: W <- RANDOMTOUR(v_start)
  // We need to run RandomTour first time.
  pushStep(1, `Start Euler Tour from ${startNodeId}`, W, null, startNodeId);

  // Define RandomTour function capable of recording steps
  const randomTour = (uStart: string, isMain: boolean): string[] => {
    const W_temp: string[] = [uStart];
    let u = uStart;

    // Initial Step of RT
    pushStep(isMain ? 1 : 5, `Starting Random Tour from ${u}`, W, isMain ? null : W_temp, u);
    if (!isMain) pushStep(11, `W' initialized with {${u}}`, W, W_temp, u);

    while (true) {
      // Find neighbors in AVAILABLE edges
      const neighbors: string[] = [];
      graph.edges.forEach(e => {
        const key = getEdgeKey(e.source, e.target);
        if (availableEdges.has(key)) {
          if (e.source === u) neighbors.push(e.target);
          else if (e.target === u) neighbors.push(e.source);
        }
      });

      // Use consistent sorting for reproducibility (or user preference?)
      // Random as per pseudocode "beliebig", but we can just pick random.
      // Let's sort then random pick to be safe? Or just random.
      // Pseudocode says "Wähle ... beliebig".

      if (neighbors.length === 0) {
        pushStep(isMain ? 1 : 12, `Node ${u} has no unused edges. Tour stuck/done.`, isMain ? W_temp : W, isMain ? null : W_temp, u);
        break;
      }

      const v = neighbors[Math.floor(Math.random() * neighbors.length)];
      const key = getEdgeKey(u, v);

      pushStep(isMain ? 1 : 13, `Chose neighbor ${v} from ${neighbors.length} options`, isMain ? W_temp : W, isMain ? null : W_temp, u, v, key);

      availableEdges.delete(key);
      W_temp.push(v);

      pushStep(isMain ? 1 : 14, `Add ${v} to ${isMain ? "W" : "W'"}`, isMain ? W_temp : W, isMain ? null : W_temp, u, v, key);

      traversedDirectionalEdges.add(`${u}-${v}`); // Record specific direction for visualizer

      pushStep(isMain ? 1 : 15, `Remove edge {${u}, ${v}} from G`, isMain ? W_temp : W, isMain ? null : W_temp, u, v, key); // Highlight removal

      u = v;
      pushStep(isMain ? 1 : 16, `Advance to ${u}`, isMain ? W_temp : W, isMain ? null : W_temp, u);
    }

    pushStep(isMain ? 1 : 17, `Return tour of length ${W_temp.length - 1}`, isMain ? W_temp : W, isMain ? null : W_temp, u);
    return W_temp;
  };

  // Run initial Random Tour
  W = randomTour(startNodeId, true);
  pushStep(1, `Initial Tour W: ${W.join("->")}`, W);

  // Line 2: v_slow = start of W
  let vSlowIndex = 0;

  // Line 3: While v_slow not last
  while (vSlowIndex < W.length) { // Actually iterate all, but last one has no exit usually if even degree... wait.
    // In Eulerian path end might have degree 0 remaining.
    const vSlow = W[vSlowIndex];
    pushStep(2, `v_slow points to ${vSlow} (Index ${vSlowIndex})`, W, null, vSlow);
    pushStep(3, "Check if v_slow is not last node in W", W, null, vSlow);

    // More robust:
    const degreeCurrent = graph.edges.filter(e => {
      const key = getEdgeKey(e.source, e.target);
      return availableEdges.has(key) && (e.source === vSlow || e.target === vSlow);
    }).length;

    pushStep(4, `Check degree of ${vSlow} in remaining G: ${degreeCurrent}`, W, null, vSlow);

    if (degreeCurrent > 0) {
      // Line 5: W' = RandomTour(v_slow)
      pushStep(5, `Found unused edges at ${vSlow}! Starting sub-tour W'`, W, null, vSlow);
      const subTour = randomTour(vSlow, false);

      // Line 6: Merge
      // W = W[0...i] + W' (minus first char redundant? No tour is u->v->u. W' is u->...->u)
      // W' starts with vSlow. W has vSlow at vSlowIndex.
      // We replace W[vSlowIndex] with W'. 
      // W = [...pre, ...W', ...post]
      // But W' includes vSlow at start AND end.
      // W structure: A -> B -> C. vSlow=B. W'=B->D->B.
      // Result: A -> B -> D -> B -> C.
      // So we insert W'.slice(1) after vSlowIndex? Or insert W'.slice(0, -1) at vSlowIndex?
      // Let's splice.
      // Remove vSlow at vSlowIndex, insert components of W'.
      // Actually W' is [B, D, B].
      // We want A, B, D, B, C.
      // So we keep vSlowIndex as B (Start of W'), insert D, B (rest of W') after it.
      // W.splice(vSlowIndex + 1, 0, ...subTour.slice(1));

      pushStep(6, `Merge W' into W at index ${vSlowIndex}`, W, subTour, vSlow);
      W.splice(vSlowIndex + 1, 0, ...subTour.slice(1));
      pushStep(6, `New W: ${W.join("->")}`, W, null, vSlow);
    }

    // Line 7: Next node
    vSlowIndex++;
    if (vSlowIndex < W.length) {
      pushStep(7, `Advance v_slow to next node`, W, null, W[vSlowIndex]);
    }
  }

  pushStep(8, "Algorithm Complete. Eulerian Circuit Found.", W);
  return steps;
};

// =============================================================================
// GREEDY MATCHING ALGORITHM
// =============================================================================

export const generateGreedyMatchingGraph = (width: number, height: number): Graph => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Use similar layout as Tarjan for consistency
  const layout = [
    { id: 'A', x: 0.10, y: 0.20 },
    { id: 'B', x: 0.10, y: 0.80 },
    { id: 'C', x: 0.25, y: 0.60 },
    { id: 'D', x: 0.35, y: 0.30 },
    { id: 'E', x: 0.45, y: 0.50 },
    { id: 'F', x: 0.50, y: 0.20 },
    { id: 'G', x: 0.50, y: 0.72 },
    { id: 'H', x: 0.60, y: 0.45 },
    { id: 'I', x: 0.70, y: 0.50 },
    { id: 'J', x: 0.80, y: 0.23 },
    { id: 'K', x: 0.80, y: 0.73 },
    { id: 'L', x: 0.90, y: 0.50 }
  ];

  layout.forEach(pos => {
    nodes.push({
      id: pos.id,
      label: pos.id,
      x: pos.x * width,
      y: pos.y * height
    });
  });

  // Generate a reasonable set of edges for matching
  // We want enough edges to make the matching interesting
  const potentialEdges = [
    ['A', 'B'], ['A', 'C'], ['A', 'D'],
    ['B', 'C'], ['B', 'G'],
    ['C', 'D'], ['C', 'E'],
    ['D', 'E'], ['D', 'F'],
    ['E', 'F'], ['E', 'G'], ['E', 'H'],
    ['F', 'H'], ['F', 'J'],
    ['G', 'H'], ['G', 'K'],
    ['H', 'I'],
    ['I', 'J'], ['I', 'K'], ['I', 'L'],
    ['J', 'L'],
    ['K', 'L']
  ];

  // Select a random subset for variety
  const numEdges = 12 + Math.floor(Math.random() * 4); // 12-15 edges
  const shuffled = [...potentialEdges].sort(() => Math.random() - 0.5);

  shuffled.slice(0, numEdges).forEach(([source, target]) => {
    edges.push({ source, target, weight: 1 });
  });

  return {
    nodes,
    edges,
    isDirected: false,
    hasUniqueWeights: false
  };
};

export const calculateGreedyMatchingSteps = (graph: Graph): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  let stepCounter = 0;

  // Working set of remaining edges
  const remainingEdges = new Set<string>();
  const matching: Edge[] = []; // M
  const removedNodes = new Set<string>(); // Track nodes that have been matched

  // Initialize edge set
  graph.edges.forEach(e => {
    const key = e.source < e.target ? `${e.source}-${e.target}` : `${e.target}-${e.source}`;
    remainingEdges.add(key);
  });

  const edgeObjMap: Record<string, Edge> = {};
  graph.edges.forEach(e => {
    const key = e.source < e.target ? `${e.source}-${e.target}` : `${e.target}-${e.source}`;
    edgeObjMap[key] = e;
  });

  const pushStep = (
    line: number,
    desc: string,
    currentEdge: Edge | null = null,
    highlightNodes: string[] = [],

  ) => {
    // Build edge classifications to mark removed edges
    const classifications: Record<string, EdgeType> = {};

    // Mark all removed edges as "CROSS" (repurposed as "removed")
    graph.edges.forEach(e => {
      const key = e.source < e.target ? `${e.source}-${e.target}` : `${e.target}-${e.source}`;
      const revKey = `${e.target}-${e.source}`;

      if (!remainingEdges.has(key)) {
        classifications[key] = EdgeType.CROSS;
        classifications[revKey] = EdgeType.CROSS;
      }
    });

    steps.push({
      stepId: stepCounter++,
      lineNumber: line,
      description: desc,
      distances: {},
      parents: {},
      discoveryTimes: {},
      finishTimes: {},
      edgeClassifications: classifications,
      mstEdges: [...matching], // Use mstEdges to show the matching
      boruvkaMinEdges: [],
      queue: [],
      stack: [],
      processedSet: Array.from(removedNodes), // Track removed nodes
      currentNodeId: highlightNodes[0] || null,
      currentNeighborId: highlightNodes[1] || null,
      activeEdge: currentEdge,
    });
  };

  // Line 1: M ← ∅
  pushStep(1, "Initialize matching M ← ∅");

  // Line 2: while E ≠ ∅ do
  while (remainingEdges.size > 0) {
    pushStep(2, `Edge set E has ${remainingEdges.size} remaining edges`);

    // Line 3: wähle eine beliebige Kante e ∈ E
    const edgeKeys = Array.from(remainingEdges);
    const chosenKey = edgeKeys[Math.floor(Math.random() * edgeKeys.length)];
    const chosenEdge = edgeObjMap[chosenKey];

    pushStep(3, `Choose edge e = {${chosenEdge.source}, ${chosenEdge.target}}`, chosenEdge, [chosenEdge.source, chosenEdge.target]);

    // Line 4: M ← M ∪ {e}
    matching.push(chosenEdge);
    pushStep(4, `Add edge {${chosenEdge.source}, ${chosenEdge.target}} to matching M`, chosenEdge, [chosenEdge.source, chosenEdge.target]);

    // Line 5: lösche e und alle inzidenten Kanten in G
    const nodesToRemove = new Set([chosenEdge.source, chosenEdge.target]);
    const edgesToRemove: string[] = [];

    remainingEdges.forEach(key => {
      const edge = edgeObjMap[key];
      if (nodesToRemove.has(edge.source) || nodesToRemove.has(edge.target)) {
        edgesToRemove.push(key);
      }
    });

    edgesToRemove.forEach(key => remainingEdges.delete(key));

    // Mark nodes as removed
    removedNodes.add(chosenEdge.source);
    removedNodes.add(chosenEdge.target);

    pushStep(5, `Remove edge {${chosenEdge.source}, ${chosenEdge.target}} and ${edgesToRemove.length - 1} incident edges from G`, null, [chosenEdge.source, chosenEdge.target]);
  }

  // Final step - show everything
  pushStep(6, `Algorithm Complete. Greedy Matching found with ${matching.length} edges.`);

  return steps;
};

// =============================================================================
// HOPCROFT-KARP ALGORITHM (Maximum Matching in Bipartite Graphs)
// =============================================================================

export const generateHopcroftKarpGraph = (width: number, height: number): Graph => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create nodes in a 5x3 grid layout
  // 8 nodes from A (partition 1) and 7 nodes from B (partition 2)
  // Total: 15 nodes arranged in 3 rows of 5 nodes each

  const totalNodes = 15;
  const totalA = 8;
  const totalB = 7;
  const rows = 3;
  const cols = 5;

  // Calculate spacing
  const horizontalSpacing = width / (cols + 1);
  const verticalSpacing = height / (rows + 1);

  // Create alternating pattern: A, B, A, B, A, B, ...
  // Since we have 8 A's and 7 B's, we'll distribute them evenly across the grid
  const pattern: ('A' | 'B')[] = [];
  let aCount = 0;
  let bCount = 0;

  // Distribute nodes alternating as evenly as possible
  for (let i = 0; i < totalNodes; i++) {
    if (aCount < totalA && (bCount >= totalB || i % 2 === 0)) {
      pattern.push('A');
      aCount++;
    } else {
      pattern.push('B');
      bCount++;
    }
  }

  // Reset counters for actual node creation
  aCount = 0;
  bCount = 0;

  // Create nodes in grid positions
  for (let i = 0; i < totalNodes; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    const x = (col + 1) * horizontalSpacing;
    const y = (row + 1) * verticalSpacing - 50;

    if (pattern[i] === 'A') {
      const id = `A${aCount}`;
      nodes.push({ id, label: id, x, y });
      aCount++;
    } else {
      const id = `B${bCount}`;
      nodes.push({ id, label: id, x, y });
      bCount++;
    }
  }

  // Determine potential edges based on Grid Adjacency to avoid crossing nodes
  // A node at (row, col) can only connect to immediate neighbors (row-1..row+1, col-1..col+1)
  const potentialEdgesSet = new Set<string>();

  nodes.forEach((node1, idx1) => {
    // Reverse engineer grid position from index
    // Note: 'nodes' array was pushed in order of grid iteration (row-major), so idx matches loop i
    const r1 = Math.floor(idx1 / cols);
    const c1 = idx1 % cols;
    const type1 = pattern[idx1];

    if (type1 === 'A') {
      // Look for B neighbors
      nodes.forEach((node2, idx2) => {
        // Optimization: indices are sorted, so we could limit range, but N=15 is small enough.
        if (idx1 === idx2) return;

        const type2 = pattern[idx2];
        if (type2 === 'B') {
          const r2 = Math.floor(idx2 / cols);
          const c2 = idx2 % cols;

          const dr = Math.abs(r1 - r2);
          const dc = Math.abs(c1 - c2);

          // User Rule:
          // 1. If in same line (dr == 0), only allow direct neighbor (dc == 1).
          // 2. If not in same line (dr > 0), allow ANY edge.

          const isSameRow = dr === 0;
          const isAllowed = isSameRow ? (dc === 1) : true;

          if (isAllowed) {
            potentialEdgesSet.add(`${node1.id}-${node2.id}`);
          }
        }
      });
    }
  });

  const potentialEdges = Array.from(potentialEdgesSet).map(s => s.split('-') as [string, string]);

  // Select random edges from VALID candidates
  // Since we restricted connectivity heavily, we should try to include many of them to ensure good matching exists.
  // 15 nodes ~ 20-25 internal borders. 
  // Let's aim for ~14-18 edges if possible, or 70% of potential.

  const numEdges = Math.min(potentialEdges.length, 14 + Math.floor(Math.random() * 5));
  const shuffled = potentialEdges.sort(() => Math.random() - 0.5);

  shuffled.slice(0, numEdges).forEach(([source, target]) => {
    edges.push({ source, target, weight: 1 });
  });

  return {
    nodes,
    edges,
    isDirected: false,
    hasUniqueWeights: false
  };
};

export const calculateHopcroftKarpSteps = (graph: Graph): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  let stepCounter = 0;

  // Identify partitions A and B (nodes starting with A vs B)
  const partitionA = graph.nodes.filter(n => n.id.startsWith('A')).map(n => n.id);
  const partitionB = graph.nodes.filter(n => n.id.startsWith('B')).map(n => n.id);

  // Initialize matching with an arbitrary edge
  let matching: Edge[] = [];
  const matchedNodes = new Set<string>();

  const pushStep = (
    line: number,
    desc: string,
    layers: Record<number, string[]> = {},
    currentEdge: Edge | null = null,
    highlightNodes: string[] = [],
    visited: Set<string> = new Set(),
    augmentingPaths: string[][] = [],
    currentAugmentingPath: string[] | undefined = undefined
  ) => {
    steps.push({
      stepId: stepCounter++,
      lineNumber: line,
      description: desc,
      distances: {},
      parents: {},
      discoveryTimes: {},
      finishTimes: {},
      edgeClassifications: {},
      mstEdges: [...matching],
      boruvkaMinEdges: [],
      queue: [],
      stack: [],
      processedSet: Array.from(visited),
      currentNodeId: highlightNodes[0] || null,
      currentNeighborId: highlightNodes[1] || null,
      activeEdge: currentEdge,
      hopcroftLayers: JSON.parse(JSON.stringify(layers)),
      augmentingPathsSet: augmentingPaths.length > 0 ? [...augmentingPaths] : undefined,
      currentAugmentingPath: currentAugmentingPath ? [...currentAugmentingPath] : undefined
    });
  };

  // Helper: Get neighbors via matching edges
  const getMatchingNeighbors = (node: string): string[] => {
    const neighbors: string[] = [];
    for (const edge of matching) {
      if (edge.source === node) neighbors.push(edge.target);
      else if (edge.target === node) neighbors.push(edge.source);
    }
    return neighbors;
  };

  // Helper: Get neighbors via non-matching edges
  const getNonMatchingNeighbors = (node: string): string[] => {
    const neighbors: string[] = [];
    for (const edge of graph.edges) {
      const isMatching = matching.some(m =>
        (m.source === edge.source && m.target === edge.target) ||
        (m.source === edge.target && m.target === edge.source)
      );
      if (!isMatching) {
        if (edge.source === node) neighbors.push(edge.target);
        else if (edge.target === node) neighbors.push(edge.source);
      }
    }
    return neighbors;
  };

  // Helper: Find augmenting paths using BFS (returns set S of disjoint paths or null)
  const findAugmentingPaths = (): string[][] | null => {
    const visited = new Set<string>();
    const layers: Record<number, string[]> = {};
    const predecessors: Record<string, string[]> = {}; // Store ALL parents for backtracking DFS
    const nodeLevels: Record<string, number> = {};

    // Line 11: L0 := {unüberdeckte Knoten in A}
    layers[0] = partitionA.filter(node => !matchedNodes.has(node));
    pushStep(11, `L₀ := {${layers[0].join(', ')}}`, layers, null, [], new Set(layers[0]));

    // Line 12: Mark all nodes from L0 as visited
    layers[0].forEach(node => {
      visited.add(node);
      nodeLevels[node] = 0;
    });
    pushStep(12, `Markiere alle Knoten aus L₀ als besucht`, layers, null, [], visited);

    // Line 13: if L0 = ∅ then return ∅
    if (layers[0].length === 0) {
      pushStep(13, `L₀ = ∅, return ∅ (M ist maximal)`, layers, null, [], visited);
      return null;
    }

    // Line 14: for i = 1 to n do
    let foundAugmentingPath = false;
    const targetNodes: string[] = [];

    for (let i = 1; i <= graph.nodes.length && !foundAugmentingPath; i++) {
      layers[i] = [];

      pushStep(14, `Iteration i = ${i}`, layers, null, [], visited);

      // Line 15-18: Build layer i
      const isOdd = i % 2 === 1; // Odd levels (1, 3...) are E \ M edges

      const prevLayer = layers[i - 1];
      const nextLayerSet = new Set<string>(); // avoid duplicates in current layer

      if (isOdd) {
        // Line 16: Li := {unbesuchte Nachbarn von Li-1 via E \ M}
        pushStep(15, `i = ${i} ist ungerade`, layers, null, [], visited);

        for (const node of prevLayer) {
          const neighbors = getNonMatchingNeighbors(node);
          for (const neighbor of neighbors) {
            // Add if neighbor is not visited OR if it's in the current layer (multiple parents allowed)
            if (!visited.has(neighbor)) {
              if (!nextLayerSet.has(neighbor)) {
                layers[i].push(neighbor);
                nextLayerSet.add(neighbor);
                nodeLevels[neighbor] = i;
              }
              // Add predecessor if it is from the previous layer
              if (!predecessors[neighbor]) predecessors[neighbor] = [];
              predecessors[neighbor].push(node);
            } else if (nodeLevels[neighbor] === i) {
              // Already visited in THIS layer, so this is another valid parent
              if (!predecessors[neighbor]) predecessors[neighbor] = [];
              predecessors[neighbor].push(node);
            }
          }
        }
        const currentVisited = new Set([...visited, ...layers[i]]);
        pushStep(16, `L₁ := {unbesuchte Nachbarn von L₀ via E \\ M} = {${layers[i].join(', ')}}`, layers, null, [], currentVisited);
      } else {
        // Line 18: Li := {unbesuchte Nachbarn von Li-1 via M}
        pushStep(17, `i = ${i} ist gerade (else)`, layers, null, [], visited);

        for (const node of prevLayer) {
          const neighbors = getMatchingNeighbors(node);
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              if (!nextLayerSet.has(neighbor)) {
                layers[i].push(neighbor);
                nextLayerSet.add(neighbor);
                nodeLevels[neighbor] = i;
              }
              if (!predecessors[neighbor]) predecessors[neighbor] = [];
              predecessors[neighbor].push(node);
            } else if (nodeLevels[neighbor] === i) {
              if (!predecessors[neighbor]) predecessors[neighbor] = [];
              predecessors[neighbor].push(node);
            }
          }
        }
        const currentVisited = new Set([...visited, ...layers[i]]);
        pushStep(18, `L₂ := {unbesuchte Nachbarn von L₁ via M} = {${layers[i].join(', ')}}`, layers, null, [], currentVisited);
      }

      // Line 19: Mark all nodes from Li as visited (globally)
      // Note: we effectively did this via nodeLevels check, but officially update visited set now
      layers[i].forEach(n => visited.add(n));

      pushStep(19, `Markiere alle Knoten aus L₁ als besucht`, layers, null, [], visited);

      // Line 20: if Li contains uncovered nodes then
      if (isOdd) {
        for (const node of layers[i]) {
          if (partitionB.includes(node) && !matchedNodes.has(node)) {
            targetNodes.push(node);
            foundAugmentingPath = true;
          }
        }
        if (targetNodes.length > 0) {
          pushStep(20, `Lᵢ enthält ${targetNodes.length} unüberdeckte Knoten: {${targetNodes.join(', ')}}`, layers, null, targetNodes, visited);
        }
      }

      if (layers[i].length === 0) {
        pushStep(23, `Lᵢ = ∅, return ∅ (M ist bereits maximal)`, layers, null, [], visited);
        return null;
      }

      if (foundAugmentingPath) break;
    }

    if (!foundAugmentingPath || targetNodes.length === 0) {
      pushStep(28, `Kein augmentierender Pfad gefunden, return ∅`, layers, null, [], visited);
      return null;
    }

    // Line 21: S := ∅
    const pathSet: string[][] = [];
    pushStep(21, `S := ∅`, layers, null, [], visited, [...pathSet]);
    const usedNodes = new Set<string>();

    // Helper DFS for Backtracking
    const findDisjointPathDFS = (current: string, path: string[]): boolean => {
      if (usedNodes.has(current)) return false;

      // Base case: we reached L0
      if (nodeLevels[current] === 0) {
        path.unshift(current);
        return true;
      }

      const parents = predecessors[current] || [];
      for (const p of parents) {
        if (!usedNodes.has(p)) {
          // Try this parent
          if (findDisjointPathDFS(p, path)) {
            path.push(current); // Post-order add
            return true;
          }
        }
      }
      return false;
    };

    // Line 22-26: Find multiple vertex-disjoint paths
    pushStep(22, `for all unüberdeckte v ∈ Lᵢ do`, layers, null, targetNodes, visited, [...pathSet]);

    for (const targetNode of targetNodes) {
      // Line 23: Check if node not in used paths
      if (usedNodes.has(targetNode)) {
        continue;
      }

      pushStep(23, `Prüfe Knoten ${targetNode}: nicht in verwendeten Pfaden`, layers, null, [targetNode], visited, [...pathSet]);

      // Line 24: Find path P from L0 to v through backtracking (DFS)
      pushStep(24, `Finde Pfad P von L₀ nach ${targetNode} durch backtracking`, layers, null, [targetNode], visited, [...pathSet]);

      const potentialPath: string[] = [];
      const success = findDisjointPathDFS(targetNode, potentialPath);

      if (success) {
        // Correct path order is from recursive calls pushing 'current' after 'p'. 
        // L0 added at unshift. 
        // Order: L0 -> L1 -> ... -> Target.
        // wait... findDisjointPathDFS(targetNode):
        //   calls findDisjointPathDFS(parent)
        //     ...
        //       calls findDisjointPathDFS(L0_node) -> unshift(L0_node) -> return true
        //     path.push(parent) -> return true
        //   path.push(targetNode) -> return true
        // So path is [L0_node, parent, ..., targetNode].  Correct.

        // Line 25: S := S ∪ {P}
        pathSet.push(potentialPath);
        pushStep(25, `S := S ∪ {P}, Pfad: ${potentialPath.join(' → ')}`, layers, null, potentialPath, visited, [...pathSet]);

        // Line 26: Mark nodes in P as used
        potentialPath.forEach(node => usedNodes.add(node));
        pushStep(26, `Markiere Knoten in P als verwendet`, layers, null, potentialPath, visited, [...pathSet]);
      } else {
        pushStep(24, `Kein disjunkter Pfad gefunden (überschneidet sich mit bereits gefundenen Pfaden)`, layers, null, [targetNode], visited, [...pathSet]);
      }
    }

    // Line 27: return S
    pushStep(27, `return S mit |S| = ${pathSet.length} Pfaden`, layers, null, [], visited, [...pathSet]);
    return pathSet.length > 0 ? pathSet : null;
  };

  // Line 1: HOPCROFT-KARP(G = (A ⊎ B, E))
  pushStep(1, `HOPCROFT-KARP(G = (A ⊎ B, E)) mit |A| = ${partitionA.length}, |B| = ${partitionB.length}`, {});

  // Line 2: M := {e} für irgendeine Kante e ∈ E
  if (graph.edges.length > 0) {
    const firstEdge = graph.edges[0];
    matching.push(firstEdge);
    matchedNodes.add(firstEdge.source);
    matchedNodes.add(firstEdge.target);
    pushStep(2, `M := {${firstEdge.source}, ${firstEdge.target}}`, {}, firstEdge, [firstEdge.source, firstEdge.target]);
  } else {
    matching = [];
    pushStep(2, `M := ∅ (keine Kanten verfügbar)`, {});
  }

  // Main loop: while there are augmenting paths
  let iteration = 0;
  const maxIterations = 10; // Safety limit

  while (iteration < maxIterations) {
    iteration++;

    // Line 3: while es gibt noch augmentierende Pfade do
    pushStep(3, `Iteration ${iteration}: Prüfe auf augmentierende Pfade`, {});

    // Line 4: S := FIND-AUGMENTING-PATHS(G, M)
    pushStep(4, `Rufe FIND-AUGMENTING-PATHS(G, M) auf`, {});
    pushStep(10, `FIND-AUGMENTING-PATHS(G, M):`, {});

    const pathSet = findAugmentingPaths();

    // Line 5: if S = ∅ then return M
    if (!pathSet || pathSet.length === 0) {
      pushStep(5, `S = ∅, return M (Matching ist maximal)`, {});
      break;
    }

    pushStep(5, `S enthält ${pathSet.length} Pfad(e)`, {}, null, [], new Set(), pathSet);

    // Line 6-7: for all P ∈ S do: M := M ⊕ P
    pushStep(6, `for all P ∈ S do`, {}, null, [], new Set(), pathSet);

    // Augment along all paths in S
    for (let pathIdx = 0; pathIdx < pathSet.length; pathIdx++) {
      const path = pathSet[pathIdx];

      // Step 1: Show the path to be augmented
      pushStep(7, `Wähle Pfad P${pathIdx + 1}: ${path.join(' → ')}. Markiere zur Augmentierung.`,
        {}, null, path, new Set(), pathSet, path);

      const pathEdges: Edge[] = [];

      for (let i = 0; i < path.length - 1; i++) {
        const u = path[i];
        const v = path[i + 1];
        pathEdges.push({ source: u, target: v, weight: 1 });
      }

      // M ⊕ P: symmetric difference
      const newMatching: Edge[] = [];

      // Remove matching edges that are in the path
      for (const edge of matching) {
        const isInPath = pathEdges.some(pe =>
          (pe.source === edge.source && pe.target === edge.target) ||
          (pe.source === edge.target && pe.target === edge.source)
        );
        if (!isInPath) {
          newMatching.push(edge);
        }
      }

      // Add non-matching edges from the path
      for (const edge of pathEdges) {
        const isInMatching = matching.some(m =>
          (m.source === edge.source && m.target === edge.target) ||
          (m.source === edge.target && m.target === edge.source)
        );
        if (!isInMatching) {
          newMatching.push(edge);
        }
      }

      matching = newMatching;

      matchedNodes.clear();
      matching.forEach(e => {
        matchedNodes.add(e.source);
        matchedNodes.add(e.target);
      });

      // Step 2: Apply the augmentation (Show updated matching)
      pushStep(7, `Augmentiere entlang P${pathIdx + 1}: M := M ⊕ P. Neues |M| = ${matching.length}`,
        {}, null, path, new Set(), pathSet, path);
    }
  }

  // Line 8: return M
  pushStep(8, `return M (Maximales Matching mit ${matching.length} Kanten gefunden)`, {});

  return steps;
};

// =============================================================================
// GRAPH COLORING ALGORITHMS
// =============================================================================

export const generateColoringGraph = (width: number, height: number): Graph => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create nodes in a 3x5 grid layout
  // 15 nodes arranged in 3 rows of 5 nodes each
  // Labeled A through O alphabetically

  const totalNodes = 15;
  const rows = 3;
  const cols = 5;
  const ids = "ABCDEFGHIJKLMNO".split(''); // 15 nodes A-O

  // Calculate spacing
  const horizontalSpacing = width / (cols + 1);
  const verticalSpacing = height / (rows + 1);

  // Create nodes in grid positions
  for (let i = 0; i < totalNodes; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    const x = (col + 1) * horizontalSpacing;
    const y = (row + 1) * verticalSpacing - 50;

    nodes.push({
      id: ids[i],
      label: ids[i],
      x,
      y
    });
  }

  // Generate edges - use a mix of adjacent and diagonal connections
  // for interesting coloring challenges
  const potentialEdges: [string, string][] = [];

  // Add horizontal adjacencies
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols - 1; col++) {
      const idx1 = row * cols + col;
      const idx2 = row * cols + col + 1;
      potentialEdges.push([ids[idx1], ids[idx2]]);
    }
  }

  // Add vertical adjacencies
  for (let row = 0; row < rows - 1; row++) {
    for (let col = 0; col < cols; col++) {
      const idx1 = row * cols + col;
      const idx2 = (row + 1) * cols + col;
      potentialEdges.push([ids[idx1], ids[idx2]]);
    }
  }

  // Add some diagonal connections for more interesting coloring
  for (let row = 0; row < rows - 1; row++) {
    for (let col = 0; col < cols - 1; col++) {
      const idx1 = row * cols + col;
      const idx2 = (row + 1) * cols + col + 1;
      const idx3 = row * cols + col + 1;
      const idx4 = (row + 1) * cols + col;

      // Add both diagonals with some probability
      if (Math.random() > 0.3) {
        potentialEdges.push([ids[idx1], ids[idx2]]);
      }
      if (Math.random() > 0.3) {
        potentialEdges.push([ids[idx3], ids[idx4]]);
      }
    }
  }

  // Select a subset of edges (not too dense, not too sparse)
  const numEdges = 18 + Math.floor(Math.random() * 6); // 18-23 edges
  const shuffled = [...potentialEdges].sort(() => Math.random() - 0.5);

  shuffled.slice(0, numEdges).forEach(([source, target]) => {
    edges.push({ source, target, weight: 1 });
  });

  return {
    nodes,
    edges,
    isDirected: false,
    hasUniqueWeights: false
  };
};

export const calculateGreedyColoringSteps = (graph: Graph): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  let stepCounter = 0;
  const nodeColors: Record<string, number> = {};

  // Sort nodes alphabetically for "Arbitrary Order"
  const nodes = [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id));
  const nodeIds = nodes.map(n => n.id);

  const pushStep = (line: number, desc: string, u: string | null = null) => {
    steps.push({
      stepId: stepCounter++,
      lineNumber: line,
      description: desc,
      distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], boruvkaMinEdges: [], queue: [], stack: nodeIds, processedSet: [],
      currentNodeId: u, currentNeighborId: null, activeEdge: null,
      nodeColors: { ...nodeColors }
    });
  };

  // Line 1: Arbitrary Order
  pushStep(1, `Wähle Reihenfolge V = {${nodeIds.join(', ')}}`);

  // Line 2: c[v1] = 1
  const first = nodeIds[0];
  nodeColors[first] = 1;
  pushStep(2, `Setze Farbe c[${first}] ← 1`, first);

  // Line 3: Loop
  for (let i = 1; i < nodeIds.length; i++) {
    const v = nodeIds[i];
    pushStep(3, `Betrachte Knoten v_${i + 1} = ${v}`, v);

    // Line 4: Find min color
    const neighbors = graph.edges
      .filter(e => e.source === v || e.target === v)
      .map(e => e.source === v ? e.target : e.source);

    // Check colors of neighbors in {v1...vi-1}
    const usedColors = new Set<number>();
    const prevNodes = new Set(nodeIds.slice(0, i));

    for (const nbr of neighbors) {
      if (prevNodes.has(nbr) && nodeColors[nbr]) {
        usedColors.add(nodeColors[nbr]);
      }
    }

    let c = 1;
    while (usedColors.has(c)) {
      c++;
    }

    nodeColors[v] = c;
    pushStep(4, `Weise Farbe ${c} zu (Nachbarfarben: {${Array.from(usedColors).sort((a, b) => a - b).join(',')}})`, v);
  }

  return steps;
};

export const calculateSmallestLastColoringSteps = (graph: Graph): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  let stepCounter = 0;

  // Data structs for Algorithm
  const currentDegree: Record<string, number> = {};
  const activeNodes = new Set<string>();
  graph.nodes.forEach(n => {
    activeNodes.add(n.id);
    currentDegree[n.id] = 0;
  });

  graph.edges.forEach(e => {
    currentDegree[e.source]++;
    currentDegree[e.target]++;
  });

  const ordering: string[] = []; // This will store v_n, v_{n-1}, ..., v_1 in this order
  const nodeColors: Record<string, number> = {};
  const n = graph.nodes.length;

  const pushStep = (line: number, desc: string, u: string | null = null, removedNodes: string[] = [], minNode?: string) => {
    // Display the ordering in forward order (v_1, v_2, ..., v_n) for the UI
    const displayOrder = [...ordering].reverse();
    steps.push({
      stepId: stepCounter++,
      lineNumber: line,
      description: desc,
      distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], boruvkaMinEdges: [], queue: [], stack: displayOrder,
      processedSet: removedNodes, // Use processedSet to track hidden nodes for this algo
      currentNodeId: u, currentNeighborId: null, activeEdge: null,
      nodeColors: { ...nodeColors },
      minDegreeNode: minNode // Explicitly pass the minNode
    });
  };

  // Phase 1: Determine ordering (lines 1-3)
  // We select vertices from v_n down to v_1 (in reverse order)
  for (let i = n; i >= 1; i--) {
    if (i === n) {
      pushStep(1, `Beginne Schleife: i = ${i} bis 1`, null, [...ordering]);
    }

    // Find min degree in CURRENT graph (active nodes)
    let minDeg = Infinity;
    let minNode: string | null = null;

    // Sort for deterministic tie-breaking (Alphabetic)
    const candidates = Array.from(activeNodes).sort();

    for (const node of candidates) {
      // Calculate degree in induced subgraph
      let d = 0;
      graph.edges.forEach(e => {
        if ((e.source === node && activeNodes.has(e.target)) ||
          (e.target === node && activeNodes.has(e.source))) {
          d++;
        }
      });

      if (d < minDeg) {
        minDeg = d;
        minNode = node;
      }
    }

    if (minNode) {
      pushStep(2, `v${i} ← ${minNode} (Minimalgrad ${minDeg} im Restgraphen)`, minNode, [...ordering], minNode);

      activeNodes.delete(minNode);
      ordering.push(minNode); // Store v_i (this builds v_n, v_{n-1}, ..., v_1)
      pushStep(3, `Entferne v${i} = ${minNode} und inzidente Kanten`, minNode, [...ordering]);
    }
  }

  // Phase 2: Coloring (lines 4-6)
  const coloringOrder = [...ordering].reverse(); // Now in order v_1, v_2, ..., v_n

  // Line 4: c[v_1] = 1
  const v1 = coloringOrder[0];
  nodeColors[v1] = 1;
  // Phase 2: Show all nodes (empty removedNodes list)
  pushStep(4, `Setze c[v₁] = c[${v1}] ← 1`, v1, []);

  // Lines 5-6: Greedy coloring for i = 2 to n
  for (let i = 1; i < coloringOrder.length; i++) {
    const v = coloringOrder[i];

    if (i === 1) {
      pushStep(5, `Beginne Färbung: i = 2 bis ${n}`, v, []);
    }

    const neighbors = graph.edges
      .filter(e => e.source === v || e.target === v)
      .map(e => e.source === v ? e.target : e.source);

    const usedColors = new Set<number>();

    // Check colors of previously colored neighbors (v_1, ..., v_{i-1})
    const prevNodes = new Set(coloringOrder.slice(0, i));

    for (const nbr of neighbors) {
      if (prevNodes.has(nbr) && nodeColors[nbr]) {
        usedColors.add(nodeColors[nbr]);
      }
    }

    let c = 1;
    while (usedColors.has(c)) {
      c++;
    }

    nodeColors[v] = c;
    const usedColorsStr = usedColors.size > 0 ? `{${Array.from(usedColors).sort((a, b) => a - b).join(',')}}` : '∅';
    pushStep(6, `c[v${i + 1}] = c[${v}] ← ${c} (Nachbarfarben: ${usedColorsStr})`, v, []);
  }

  return steps;
};

// =============================================================================
// FORD-FULKERSON ALGORITHM
// =============================================================================

export const generateFordFulkersonGraph = (width: number, height: number): Graph => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const xStart = 50;
  const xEnd = width - 50;
  const gridXStart = 150;
  const gridXEnd = width - 150;
  const gridWidth = gridXEnd - gridXStart;
  const colSpacing = gridWidth / 2;
  const yStart = 70; // Adjusted start down
  const yEnd = height - 120; // Adjusted end up strongly to leave room for legend
  const ySpacing = (yEnd - yStart) / 2;

  nodes.push({ id: 's', label: 's', x: xStart, y: (yStart + yEnd) / 2 });
  nodes.push({ id: 't', label: 't', x: xEnd, y: (yStart + yEnd) / 2 });

  const gridLabels = [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']];

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const id = gridLabels[r][c];
      const x = gridXStart + c * colSpacing;
      const y = yStart + r * ySpacing;
      nodes.push({ id, label: id, x, y });
    }
  }

  const addEdge = (u: string, v: string, capMin: number, capMax: number) => {
    edges.push({
      source: u,
      target: v,
      weight: 1,
      capacity: Math.floor(Math.random() * (capMax - capMin + 1)) + capMin,
      flow: 0
    });
  };

  addEdge('s', 'a', 5, 15);
  addEdge('s', 'd', 5, 15);
  addEdge('s', 'g', 5, 15);

  addEdge('c', 't', 5, 15);
  addEdge('f', 't', 5, 15);
  addEdge('i', 't', 5, 15);

  addEdge('a', 'b', 3, 10); addEdge('b', 'c', 3, 10);
  addEdge('d', 'e', 3, 10); addEdge('e', 'f', 3, 10);
  addEdge('g', 'h', 3, 10); addEdge('h', 'i', 3, 10);

  addEdge('a', 'd', 2, 8); addEdge('d', 'g', 2, 8);
  addEdge('e', 'b', 2, 8); addEdge('e', 'h', 2, 8);
  addEdge('c', 'f', 2, 8); addEdge('f', 'i', 2, 8);

  // Cross edges
  addEdge('d', 'b', 2, 6);
  addEdge('e', 'c', 2, 6);
  addEdge('h', 'f', 2, 6);

  return { nodes, edges, isDirected: true, hasUniqueWeights: false };
};

export const calculateFordFulkersonSteps = (graph: Graph): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  let stepCounter = 0;

  // Working state - use explicit flow tracking
  // We recreate the edge list to track mutable flow
  interface FlowEdge { source: string, target: string, capacity: number, flow: number }
  const edges: FlowEdge[] = graph.edges.map(e => ({
    source: e.source,
    target: e.target,
    capacity: e.capacity || 0,
    flow: 0
  }));

  interface ResidualEdge { source: string, target: string, capacity: number, flow: number, isBackward: boolean }

  const calculateTotalFlow = () => {
    // Total flow is the sum of flow on edges leaving source 's' minus flow entering 's'
    // For Ford-Fulkerson simple graphs, just summing flow out of 's' is usually sufficient unless there are incoming edges to 's'
    return edges
      .filter(e => e.source === 's')
      .reduce((sum, e) => sum + e.flow, 0);
  };

  const pushStep = (line: number, desc: string, residualEdges: ResidualEdge[] = [], path: string[] = [], bottleneck: number = 0, u: string | null = null, minCutSetS?: string[]) => {
    const edgeFlows: Record<string, number> = {};
    edges.forEach(e => {
      edgeFlows[`${e.source}-${e.target}`] = e.flow;
    });

    steps.push({
      stepId: stepCounter++,
      lineNumber: line,
      description: desc,
      distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], boruvkaMinEdges: [], queue: [], stack: [], processedSet: [],
      currentNodeId: u, currentNeighborId: null, activeEdge: null,
      residualEdges: residualEdges,
      path: path.length > 0 ? path : undefined,
      bottleneck: bottleneck,
      edgeFlows: edgeFlows,
      totalFlow: calculateTotalFlow(),
      minCutSetS: minCutSetS
    });
  };

  const buildResidualGraph = () => {
    const resEdges: { source: string, target: string, capacity: number, flow: number, isBackward: boolean }[] = [];
    edges.forEach(e => {
      const remaining = e.capacity - e.flow;
      if (remaining > 0) {
        resEdges.push({ source: e.source, target: e.target, capacity: remaining, flow: 0, isBackward: false });
      }
      if (e.flow > 0) {
        resEdges.push({ source: e.target, target: e.source, capacity: e.flow, flow: 0, isBackward: true });
      }
    });
    return resEdges;
  };

  pushStep(1, "Initialize f(u, v) = 0 for all edges", buildResidualGraph());

  while (true) {
    const resEdges = buildResidualGraph();

    // BFS on Residual Graph
    const adj: Record<string, { target: string, cap: number }[]> = {};
    graph.nodes.forEach(n => adj[n.id] = []);
    resEdges.forEach(e => {
      if (adj[e.source]) adj[e.source].push({ target: e.target, cap: e.capacity });
    });

    const q = ['s'];
    const parent: Record<string, string> = { 's': 's' };
    const visited = new Set(['s']);
    let targetFound = false;
    let head = 0;

    while (head < q.length) {
      const u = q[head++];
      if (u === 't') {
        targetFound = true;
        break;
      }
      for (const edge of adj[u]) {
        if (!visited.has(edge.target)) {
          visited.add(edge.target);
          parent[edge.target] = u;
          q.push(edge.target);
        }
      }
      if (targetFound) break;
    }

    if (!targetFound) {
      // Calculate S, T cut
      // S is already the 'visited' set from our failed BFS
      const setS = Array.from(visited);
      const allNodes = graph.nodes.map(n => n.id);
      const setT = allNodes.filter(id => !visited.has(id));

      const cutCapacity = edges
        .filter(e => visited.has(e.source) && !visited.has(e.target))
        .reduce((sum, e) => sum + e.capacity, 0);

      pushStep(9, `Max flow reached. S = {${setS.join(', ')}}, T = {${setT.join(', ')}}. Cut Capacity = ${cutCapacity}. val(f) = ${cutCapacity}`, resEdges, [], 0, null, setS);
      break;
    }

    const path: string[] = [];
    let p = 't';
    while (p !== 's') {
      path.push(p);
      p = parent[p];
    }
    path.push('s');
    path.reverse();

    pushStep(2, `Found s-t path P: ${path.join(' → ')}`, resEdges, path);

    let minCap = Infinity;
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];
      const edge = resEdges.find(e => e.source === u && e.target === v);
      if (edge) minCap = Math.min(minCap, edge.capacity);
    }

    pushStep(3, `Bottleneck capacity ε = ${minCap}`, resEdges, path, minCap);

    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];

      const forwardEdge = edges.find(e => e.source === u && e.target === v);
      const backwardEdge = edges.find(e => e.source === v && e.target === u);

      if (forwardEdge) {
        forwardEdge.flow += minCap;
        pushStep(6, `Augment forward edge (${u}, ${v}) by ε=${minCap}. New Flow: ${forwardEdge.flow}/${forwardEdge.capacity}`, buildResidualGraph(), path.slice(i + 1), minCap, u);
      } else if (backwardEdge) {
        backwardEdge.flow -= minCap;
        pushStep(8, `Augment backward edge (${u}, ${v}) by reducing flow on (${v}, ${u}) by ε=${minCap}. New Flow: ${backwardEdge.flow}/${backwardEdge.capacity}`, buildResidualGraph(), path.slice(i + 1), minCap, u);
      }
    }

    // Final check for this iteration
    pushStep(2, `Updated Flow. Check for new path.`, buildResidualGraph());
  }

  return steps;
};

// --- LONG PATH (COLOR CODING) ---
export const generateLongPathGraph = (width: number, height: number): Graph => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const letters = "ABCDEFGHIJKL"; // 12 nodes

  // 3x4 Grid Layout with noise
  const cols = 4;
  const rows = 3;
  const cellW = width / cols;
  const cellH = height / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      // Center in cell + random jitter
      const cx = (c + 0.5) * cellW;
      const cy = (r + 0.5) * (cellH - 20);

      nodes.push({
        id: letters[idx],
        label: letters[idx],
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 40
      });
    }
  }

  // Generate Edges (Grid Adjacency + Diagonals that don't cross)
  // Horizontal
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      if (Math.random() > 0.4) {
        const u = letters[r * cols + c];
        const v = letters[r * cols + c + 1];
        edges.push({ source: u, target: v, weight: 1 });
      }
    }
  }
  // Vertical
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > 0.4) {
        const u = letters[r * cols + c];
        const v = letters[(r + 1) * cols + c];
        edges.push({ source: u, target: v, weight: 1 });
      }
    }
  }

  // A few specific non-crossing diagonals for variety
  // (0,0)-(1,1) if valid
  if (Math.random() > 0.5) edges.push({ source: letters[0], target: letters[5], weight: 1 });
  if (Math.random() > 0.5) edges.push({ source: letters[2], target: letters[7], weight: 1 });

  return { nodes, edges, isDirected: false, hasUniqueWeights: false };
};

export const calculateLongPathSteps = (graph: Graph): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  let stepCounter = 0;

  // Helper to serialize color set for display
  const setToString = (s: Set<number>) => `{${Array.from(s).sort((a, b) => a - b).join(',')}}`;

  // Helper for subscripts
  const toSubscript = (num: number) => {
    const subs = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
    return num.toString().split('').map(d => subs[parseInt(d)] || d).join('');
  };

  const pushStep = (
    line: number | number[],
    desc: string,
    iter: number,
    len: number,
    prevDPState: Record<string, { colors: Set<number>, path: string[] }[]> | null,
    currDPState: Record<string, { colors: Set<number>, path: string[] }[]>,
    colors: Record<string, number>,
    highlightNode?: string,
    foundPath?: string[],
    contributingInfo?: Record<string, string[]>, // Map nodeId -> list of contributing sets (as strings)
    highlightNeighbor?: string,
    extendedPaths?: string[][] // New: List of paths being visualized
  ) => {
    // Convert complex DP state to simple string arrays for display in Step object
    const displayDP: Record<string, string[]> = {};
    Object.keys(currDPState).forEach(nodeId => {
      displayDP[nodeId] = currDPState[nodeId].map(item => setToString(item.colors));
    });

    // Previous DP (P_{i-1})
    const displayDPPrev: Record<string, string[]> = {};
    if (prevDPState) {
      Object.keys(prevDPState).forEach(nodeId => {
        displayDPPrev[nodeId] = prevDPState[nodeId].map(item => setToString(item.colors));
      });
    }

    steps.push({
      stepId: stepCounter++,
      lineNumber: line,
      description: desc,
      distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {},
      edgeClassifications: {}, mstEdges: [], boruvkaMinEdges: [], queue: [], stack: [], processedSet: [],
      currentNodeId: highlightNode || null, currentNeighborId: highlightNeighbor || null, activeEdge: null,

      longPathIteration: iter,
      longPathLength: len,
      longPathDP: displayDP,
      longPathDPPrev: displayDPPrev,
      longPathContributingSets: contributingInfo,
      longPathExtendedPaths: extendedPaths,
      nodeColors: { ...colors },
      path: foundPath
    });
  };

  // Run 2 Iterations
  for (let iter = 1; iter <= 2; iter++) {
    // 1. Random Coloring
    const nodeColors: Record<string, number> = {};
    graph.nodes.forEach(n => {
      nodeColors[n.id] = Math.floor(Math.random() * 5) + 1; // 1-5
    });

    // 2. Initialize P_0
    // Internal DP State: nodeId -> List of { colors: Set, path: string[] }
    let currentDP: Record<string, { colors: Set<number>, path: string[] }[]> = {};

    graph.nodes.forEach(n => {
      currentDP[n.id] = [{
        colors: new Set([nodeColors[n.id]]),
        path: [n.id]
      }];
    });

    pushStep(1, `Iteration ${iter}: Start.`, iter, 0, null, {}, {});
    pushStep(2, `Randomly colored graph with 5 colors.`, iter, 0, null, {}, nodeColors);
    pushStep(3, `Initialize P₀(v) = {{γ(v)}} for all v`, iter, 0, null, currentDP, nodeColors);

    // 3. Loop Length i = 1 to 4
    for (let i = 1; i <= 4; i++) {
      // At start of i, currentDP is P_{i-1}. We initialize nextDP for P_i.
      pushStep(4, `Start calculating paths of length ${i} (i.e. ${i + 1} nodes)`, iter, i, currentDP, {}, nodeColors);

      const nextDP: Record<string, { colors: Set<number>, path: string[] }[]> = {};
      graph.nodes.forEach(n => nextDP[n.id] = []);

      // Compute P_i(v)
      for (const node of graph.nodes) {
        const v = node.id;
        const myColor = nodeColors[v];

        // Look at neighbors
        // For undirected graph, find all connected nodes
        const neighbors = graph.edges
          .filter(e => e.source === v || e.target === v)
          .map(e => e.source === v ? e.target : e.source);

        // Initialize empty if no neighbors
        if (neighbors.length === 0) {
          pushStep([7], `P${toSubscript(i)}(${v}) ← ∅ (No neighbors)`, iter, i, currentDP, nextDP, nodeColors, v);
        }


        const contributingSets: Record<string, string[]> = {};

        for (const x of neighbors) {
          // Check P_{i-1}(x)
          if (!currentDP[x]) continue;

          // Temporary tracker for THIS neighbor's specific contributions in this step
          const currentNeighborContributingSets: string[] = [];
          const currentNeighborExtendedPaths: string[][] = []; // Store paths

          for (const item of currentDP[x]) {
            // Check if myColor is already in the set
            if (!item.colors.has(myColor)) {

              const setStr = setToString(item.colors);

              // Mark globally for the accumulated step
              if (!contributingSets[x]) contributingSets[x] = [];
              contributingSets[x].push(setStr);

              // Mark locally for this specific step
              currentNeighborContributingSets.push(setStr);

              // Create new valid set
              const newColors = new Set(item.colors);
              newColors.add(myColor);

              const newPath = [...item.path, v]; // Extend path

              // New: Track path for visualization
              // We need to capture the *resulting* path so we can highlight it on the graph
              // item.path is the path in P_{i-1}(x). 
              // We just extended it to 'v'. So 'newPath' is the full path.
              if (currentNeighborContributingSets.includes(setStr)) {
                currentNeighborExtendedPaths.push(newPath);
              }

              // Avoid duplicates in nextDP
              const existing = nextDP[v].find(existing => {
                if (existing.colors.size !== newColors.size) return false;
                for (const c of newColors) if (!existing.colors.has(c)) return false;
                return true;
              });

              if (!existing) {
                nextDP[v].push({ colors: newColors, path: newPath });
              }
            }
          }

          // Push step for THIS neighbor
          // Highlight lines 7 (loop x), 8 (loop R), 9 (Update)
          if (currentNeighborContributingSets.length > 0) {
            // Pass ONLY this neighbor's contributions for highlighting specific arrows
            const stepContributing: Record<string, string[]> = { [x]: currentNeighborContributingSets };
            pushStep([7, 8, 9], `Checking neighbor ${x}: Found ${currentNeighborContributingSets.length} extendable sets.`, iter, i, currentDP, nextDP, nodeColors, v, undefined, stepContributing, x, currentNeighborExtendedPaths);
          } else {
            // Determine reason for failure
            const neighborSets = currentDP[x] || [];
            if (neighborSets.length === 0) {
              pushStep([7, 8], `Checking neighbor ${x}: No sets to extend (P${toSubscript(i - 1)}(${x}) is empty).`, iter, i, currentDP, nextDP, nodeColors, v, undefined, undefined, x);
            } else {
              pushStep([7, 8], `Checking neighbor ${x}: No extendable sets (all contain color {{color:${myColor}}}).`, iter, i, currentDP, nextDP, nodeColors, v, undefined, undefined, x);
            }
          }
        }

      }

      const prevDP = currentDP; // Keep reference to P_{i-1}
      currentDP = nextDP;
      pushStep(9, `Completed P${toSubscript(i)} for all nodes.`, iter, i, prevDP, currentDP, nodeColors);

      // Check for solution?
      if (i === 4) {
        for (const v in currentDP) {
          if (currentDP[v].length > 0) {
            const solution = currentDP[v][0]; // Take first solution
            pushStep(10, `Found path of length 4! ${solution.path.join('->')}`, iter, i, prevDP, currentDP, nodeColors, v, solution.path);
            return steps;
          }
        }
      }
    }
  }

  pushStep(1, "No path of length 4 found after 2 iterations.", 2, 4, {}, {}, {});
  return steps;
};

// --- HAMILTON PATH ---
export const generateHamiltonPathGraph = (width: number, height: number): Graph => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  // 3x3 Grid Layout
  const cols = 3;
  const rows = 3;
  const gridW = width * 0.7;
  const gridH = height * 0.5;
  const startX = (width - gridW) / 2;
  const startY = (height - gridH) / 2;
  const cellW = gridW / (cols - 1);
  const cellH = gridH / (rows - 1);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      nodes.push({
        id: labels[idx],
        label: labels[idx],
        x: startX + c * cellW,
        y: startY + r * cellH
      });
    }
  }

  // Define Maximal Planar Template (No crossings)
  // 1. Horizontal & Vertical Grid Edges
  // 2. Unidirectional Diagonals (Top-Left to Bottom-Right)
  const allowedNeighbors: Record<number, number[]> = {};
  for (let i = 0; i < 9; i++) allowedNeighbors[i] = [];

  const addAllowed = (u: number, v: number) => {
    if (!allowedNeighbors[u].includes(v)) {
      allowedNeighbors[u].push(v);
      allowedNeighbors[v].push(u);
    }
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u = r * cols + c;

      // Right Neighbor
      if (c < cols - 1) addAllowed(u, u + 1);
      // Bottom Neighbor
      if (r < rows - 1) addAllowed(u, u + cols);
      // Bottom-Right Diagonal (Planar if consistent)
      if (r < rows - 1 && c < cols - 1) addAllowed(u, u + cols + 1);
    }
  }

  // Randomized DFS to find a Random Hamilton Path
  // Try multiple times if stuck (though on this small graph it's instant)
  let path: number[] = [];
  let found = false;

  // Helper: Shuffle array
  const shuffle = <T>(arr: T[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const findPath = (curr: number, visited: Set<number>, currentPath: number[]) => {
    if (found) return;

    visited.add(curr);
    currentPath.push(curr);

    if (currentPath.length === 9) {
      path = [...currentPath];
      found = true;
      return;
    }

    // Get neighbors and shuffle for randomness
    const candidates = [...allowedNeighbors[curr]];
    shuffle(candidates);

    for (const next of candidates) {
      if (!visited.has(next)) {
        findPath(next, visited, currentPath);
        if (found) return;
      }
    }

    // Backtrack
    visited.delete(curr);
    currentPath.pop();
  };

  let attempts = 0;
  while (!found && attempts < 100) {
    attempts++;
    const startNode = Math.floor(Math.random() * 9);
    findPath(startNode, new Set(), []);
  }

  // Fallback if DFS fails (unlikely on 3x3) -> distinct nodes in sequence
  if (!found) path = [0, 1, 2, 5, 4, 3, 6, 7, 8];

  // Convert Path to Edges
  const addedKeys = new Set<string>();
  const addEdgeToGraph = (uIdx: number, vIdx: number) => {
    const u = labels[uIdx];
    const v = labels[vIdx];
    const key = u < v ? `${u}-${v}` : `${v}-${u}`;
    if (!addedKeys.has(key)) {
      edges.push({ source: u, target: v, weight: 1 });
      addedKeys.add(key);
    }
  };

  for (let i = 0; i < path.length - 1; i++) {
    addEdgeToGraph(path[i], path[i + 1]);
  }

  // Add Random Noise Edges (Planar Only)
  // We want "fewer edges", so maybe ~12 total edges (Path is 8). Add 4 random.
  const targetExtra = 4;
  let extraCount = 0;
  attempts = 0;

  // Collect all possible allowed edges that are not in path
  const potentialExtras: [number, number][] = [];
  for (let u = 0; u < 9; u++) {
    for (const v of allowedNeighbors[u]) {
      if (u < v) { // Avoid duplicates
        const uId = labels[u];
        const vId = labels[v];
        const key = uId < vId ? `${uId}-${vId}` : `${vId}-${uId}`;
        if (!addedKeys.has(key)) {
          potentialExtras.push([u, v]);
        }
      }
    }
  }

  shuffle(potentialExtras);

  for (const [u, v] of potentialExtras) {
    if (extraCount >= targetExtra) break;
    addEdgeToGraph(u, v);
    extraCount++;
  }

  return { nodes, edges, isDirected: false, hasUniqueWeights: false };
};

export const calculateHamiltonPathSteps = (graph: Graph): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  let stepCounter = 0;

  const n = graph.nodes.length;
  // Sort nodeIds for deterministic order
  const nodeIds = graph.nodes.map(n => n.id).sort((a, b) => a.localeCompare(b));
  const idMap: Record<string, number> = {};
  nodeIds.forEach((id, i) => idMap[id] = i);

  const adj: Record<string, string[]> = {};
  nodeIds.forEach(id => adj[id] = []);
  graph.edges.forEach(e => {
    adj[e.source].push(e.target);
    adj[e.target].push(e.source);
  });
  // Sort adjacency lists
  Object.keys(adj).forEach(k => adj[k].sort((a, b) => a.localeCompare(b)));

  let dpPrev: Record<string, string[]> = {};
  let dpCurr: Record<string, string[]> = {};

  // Internal DP state: dp[mask][endNode] = boolean
  const dp: boolean[][] = Array(1 << n).fill(false).map(() => Array(n).fill(false));
  // Parent pointer for path reconstruction: parent[mask][endNode] = prevNodeIdx
  const parent: number[][] = Array(1 << n).fill(0).map(() => Array(n).fill(-1));

  const formatSet = (mask: number): string => {
    const subset: string[] = [];
    for (let i = 0; i < n; i++) {
      if ((mask >> i) & 1) subset.push(nodeIds[i]);
    }
    return `{${subset.join(',')}}`;
  };

  const reconstructPath = (endNodeIdx: number, mask: number): string[] => {
    const path: string[] = [];
    let curr = endNodeIdx;
    let currMask = mask;
    // Safety break to prevent infinite loops if logic errs
    let safe = 0;
    while (curr !== -1 && safe < n + 1) {
      path.push(nodeIds[curr]);
      const prev = parent[currMask][curr];
      if (prev === -1) break;

      currMask = currMask & ~(1 << curr);
      curr = prev;
      safe++;
    }
    return path.reverse();
  };

  const pushStep = (
    line: number,
    desc: string,
    s: number,
    currentDP: Record<string, string[]>,
    prevDP: Record<string, string[]>,
    highlightNode?: string,
    highlightNeighbor?: string,
    activeSets?: Record<string, string[]>,
    prevActiveSets?: Record<string, string[]>,
    currentPath?: string[]
  ) => {
    steps.push({
      stepId: stepCounter++,
      lineNumber: line,
      description: desc,
      distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], boruvkaMinEdges: [], queue: [], stack: [], processedSet: [],
      currentNodeId: highlightNode || null, currentNeighborId: highlightNeighbor || null, activeEdge: null,
      hamiltonPathSubsetSize: s,
      hamiltonPathDP: JSON.parse(JSON.stringify(currentDP)),
      hamiltonPathDPPrev: JSON.parse(JSON.stringify(prevDP)),
      hamiltonPathActiveSets: activeSets,
      hamiltonPathPrevActiveSets: prevActiveSets,
      path: currentPath
    });
  };

  // Init
  nodeIds.forEach(id => {
    dpPrev[id] = [];
    dpCurr[id] = [];
  });

  const getSubsets = (size: number): number[] => {
    const masks: number[] = [];
    const combinations = (k: number, start: number, mask: number) => {
      if (k === 0) {
        masks.push(mask | 1);
        return;
      }
      for (let i = start; i < n; i++) {
        combinations(k - 1, i + 1, mask | (1 << i));
      }
    };
    combinations(size - 1, 1, 0);
    return masks;
  };

  // --- BASE CASE (s=2) ---
  const s2 = 2;
  pushStep(0, "for all S with |S| = 2", s2, dpPrev, dpPrev);

  const subsets2 = getSubsets(2);
  const dp2: Record<string, string[]> = {};
  nodeIds.forEach(id => dp2[id] = []);
  let foundBase = 0;

  for (const mask of subsets2) {
    let xIdx = -1;
    for (let i = 1; i < n; i++) {
      if ((mask >> i) & 1) {
        xIdx = i;
        break;
      }
    }
    if (xIdx !== -1) {
      const u = nodeIds[0]; // "1"
      const v = nodeIds[xIdx];
      if (adj[u].includes(v)) {
        dp[mask][xIdx] = true;
        // Predecessor of xIdx is node 0 ("1") in the mask {1, x}
        // When we backtrack: curr=x, mask={1,x} -> prev=0.
        // Then curr=0, mask={1}. parent[1][0] is -1. Stops.
        parent[mask][xIdx] = 0;

        dp2[v].push(formatSet(mask));
        foundBase++;
      }
    }
  }
  dpPrev = dp2;
  pushStep(1, `Computed P[S,x] for |S|=2. Found ${foundBase} base paths.`, s2, dpPrev, {});

  // --- MAIN LOOP (s=3 to n) ---
  for (let s = 3; s <= n; s++) {
    pushStep(2, `Iteration s = ${s}`, s, {}, dpPrev);
    dpCurr = {};
    nodeIds.forEach(id => dpCurr[id] = []);

    const subsets = getSubsets(s);

    // Loop through NODES first (as per user request "if we are at node x")
    // Skip node 0 (start node) as destination
    for (let xIdx = 1; xIdx < n; xIdx++) {
      const xId = nodeIds[xIdx];

      // Find all subsets of size s that contain xId
      const relevantMasks = subsets.filter(m => (m >> xIdx) & 1);

      const validExtensions: {
        mask: number,
        prevMask: number,
        neighbor: string,
        neighborIdx: number
      }[] = [];

      // Check for ANY valid extension first
      for (const mask of relevantMasks) {
        const prevMask = mask & ~(1 << xIdx);

        // Iterate Neighbors
        const neighbors = adj[xId];
        for (const nbrId of neighbors) {
          const nbrIdx = idMap[nbrId];
          if (nbrIdx === 0) continue; // x' != 1

          // Check if neighbor is in S\{x}
          if ((prevMask >> nbrIdx) & 1) {
            // Check if P[S\{x}, neighbors] is true
            if (dp[prevMask][nbrIdx]) {
              validExtensions.push({
                mask,
                prevMask,
                neighbor: nbrId,
                neighborIdx: nbrIdx
              });
              // Just finding one valid path for this Mask is enough to make P[S,x] true
              // But we might want to capture "reason" for all masks?
              // Usually one witness is enough per S.
              break;
            }
          }
        }
      }

      if (validExtensions.length === 0) {
        // Failure Step: No sets found for this node
        pushStep(5, `Node ${xId}: No subsets S (size ${s}) found where P[S, ${xId}] is true.`, s, dpCurr, dpPrev, xId);
      } else {
        // Success Steps: Show each one
        for (const item of validExtensions) {
          const setStr = formatSet(item.mask);
          const prevSetStr = formatSet(item.prevMask);
          const neighbor = item.neighbor;

          // Update DP and Parent
          dp[item.mask][xIdx] = true;
          parent[item.mask][xIdx] = item.neighborIdx;

          dpCurr[xId].push(setStr);

          // Reconstruct Path for visualization
          const reconstructedPath = reconstructPath(xIdx, item.mask);

          pushStep(
            5,
            `Node ${xId}: Found P[${setStr}, ${xId}] via neighbor ${neighbor} (from P[${prevSetStr}, ${neighbor}]).`,
            s,
            dpCurr,
            dpPrev,
            xId,
            neighbor,
            { [xId]: [setStr] }, // Current Set Purple
            { [neighbor]: [prevSetStr] }, // Prev Set Purple (row of neighbor)
            reconstructedPath
          );
        }
      }
    }

    dpPrev = JSON.parse(JSON.stringify(dpCurr));
  }

  // --- FINAL CHECK ---
  const sFinal = n;
  pushStep(6, `Final Check: s=${n}`, sFinal, dpPrev, {});

  const fullMask = (1 << n) - 1;
  const neighborsOf1 = adj[nodeIds[0]];

  for (const nbrId of neighborsOf1) {
    const nbrIdx = idMap[nbrId];
    if (dp[fullMask][nbrIdx]) {
      const fullPath = reconstructPath(nbrIdx, fullMask);
      // The path found ends at nbrId. But it is a Hamiltonian Cycle if connected to 1.
      // So the full cycle is fullPath + "1".
      // But step.path usually visualizes the path.
      // We can append start node to show the cycle.
      const cyclePath = [...fullPath, nodeIds[0]];

      pushStep(6, `P[[n], ${nbrId}] is True AND ${nbrId} ∈ N(1). Hamiltonian Cycle Found!`, sFinal, dpPrev, {}, nbrId, undefined, undefined, undefined, cyclePath);
      return steps;
    }
  }

  pushStep(7, "No Hamiltonian Cycle found.", sFinal, dpPrev, {});
  return steps;
};

// --- MINIMUM EDGE CUT (Karger's Algorithm) ---

export const generateMinEdgeCutGraph = (width: number, height: number): Graph => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const rows = 3;
  const cols = 4;
  // Use slightly smaller grid to leave margin
  const marginX = 80;
  const marginY = 80;
  const availWidth = width - 2 * marginX;
  const availHeight = height - 2 * marginY;
  const xSpacing = availWidth / (cols - 1);
  const ySpacing = availHeight / (rows - 1) - 30;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `${r * cols + c}`;
      nodes.push({
        id,
        x: marginX + xSpacing * c,
        y: marginY + ySpacing * r,
        label: id
      });
    }
  }

  // Grid Edges
  const baseEdges: Edge[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u = `${r * cols + c}`;
      // Right
      if (c < cols - 1) {
        const v = `${r * cols + c + 1}`;
        baseEdges.push({ source: u, target: v, weight: 1, id: `e-${u}-${v}-0` });
      }
      // Down
      if (r < rows - 1) {
        const v = `${(r + 1) * cols + c}`;
        baseEdges.push({ source: u, target: v, weight: 1, id: `e-${u}-${v}-0` });
      }
    }
  }

  // Add Multi-edges
  // Use up to 3 edges between same two nodes (so add 0, 1, or 2 duplicates)
  baseEdges.forEach(e => {
    edges.push(e);
    // Randomly decide to add duplicates
    // Bias towards adding some to make it interesting, but planar. 
    // Duplicating edges keeps planarity.
    const duplicates = Math.random() < 0.6 ? (Math.random() < 0.5 ? 1 : 2) : 0;
    for (let k = 0; k < duplicates; k++) {
      edges.push({ ...e, id: `e-${e.source}-${e.target}-${k + 1}` });
    }
  });

  return { nodes, edges, isDirected: false };
};

export const calculateMinEdgeCutSteps = (originalGraph: Graph): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  let stepCounter = 0;
  let overallMinCut = Infinity;

  const pushStep = (
    line: number,
    desc: string,
    currentGraph: { nodes: Node[], edges: Edge[] },
    minCutIter: number,
    currentCutVal: number | undefined,
    activeEdge?: { source: string, target: string, id?: string },
    contractedA?: string,
    contractedB?: string,
    autoAdvance?: boolean
  ) => {
    steps.push({
      stepId: stepCounter++,
      lineNumber: line,
      description: desc,
      distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [],
      queue: [], stack: [], processedSet: [],
      currentNodeId: contractedA || null, currentNeighborId: contractedB || null, activeEdge: activeEdge || null,
      autoAdvance: autoAdvance || false,
      minCutGraphState: JSON.parse(JSON.stringify(currentGraph)),
      minCutIteration: minCutIter,
      minCutVal: currentCutVal,
      overallMinCutVal: overallMinCut === Infinity ? undefined : overallMinCut,
      contractedNodeA: contractedA,
      contractedNodeB: contractedB
    });
  };


  pushStep(0, "Initialize min_cut = ∞", originalGraph, 0, undefined);

  // 3 Iterations
  for (let iter = 1; iter <= 3; iter++) {
    pushStep(1, `Iteration ${iter}: Start with original graph`, originalGraph, iter, undefined);

    // Correct Reset: Always start fresh from original graph
    // But we need a mutable working copy
    // Note: Node objects (x,y) will be modified during contraction animation.
    // So we must deep clone the original for the working set
    let currentNodes = originalGraph.nodes.map(n => ({ ...n }));
    let currentEdges = originalGraph.edges.map(e => ({ ...e }));

    pushStep(2, "G' ← G", { nodes: currentNodes, edges: currentEdges }, iter, undefined);

    while (currentNodes.length > 2) {
      // Pick random edge
      const edgeIdx = Math.floor(Math.random() * currentEdges.length);
      const edgeToContract = currentEdges[edgeIdx];
      const uId = edgeToContract.source;
      const vId = edgeToContract.target;

      // Highlight Edge
      // We need to pass the *current state*
      pushStep(
        4,
        `Pick random edge (${uId}, ${vId})`,
        { nodes: currentNodes, edges: currentEdges },
        iter,
        undefined,
        { source: uId, target: vId, id: edgeToContract.id }
      );

      // Phase 1: Animate Merge - Move BOTH nodes to midpoint
      // Edges will visually move with them. The edge (u,v) will shrink to a point (hiding self-loop).
      const uNode = currentNodes.find(n => n.id === uId)!;
      const vNode = currentNodes.find(n => n.id === vId)!;

      const midX = (uNode.x + vNode.x) / 2;
      const midY = (uNode.y + vNode.y) / 2;

      // Create a temporary state where nodes are moved but not yet merged structure-wise
      const moveStateNodes = currentNodes.map(n => {
        if (n.id === uId || n.id === vId) {
          return { ...n, x: midX, y: midY };
        }
        return n;
      });

      // We use the SAME edges for this visual step. 
      // Edges connected to u/v will automatically draw to the new node positions.
      pushStep(
        5,
        `Contracting (${uId}, ${vId})...`,
        { nodes: moveStateNodes, edges: currentEdges },
        iter,
        undefined,
        { source: uId, target: vId, id: edgeToContract.id }, // Keep active edge highlighted red as it shrinks
        uId, vId,
        true // Auto Advance to next step (The Merge)
      );

      // Phase 2: Logical Contraction (The Merge)
      // 1. Remove v
      // 2. Update u's label and position (explicitly set to mid)
      // 3. Remove self-loops

      const newNodes = currentNodes
        .filter(n => n.id !== vId)
        .map(n => {
          if (n.id === uId) {
            return { ...n, x: midX, y: midY, label: `${n.label},${vNode.label}` };
          }
          return n;
        });

      let newEdges = currentEdges.map(e => {
        let s = e.source;
        let t = e.target;
        if (s === vId) s = uId;
        if (t === vId) t = uId;
        return { ...e, source: s, target: t };
      });

      newEdges = newEdges.filter(e => e.source !== e.target);

      currentNodes = newNodes;
      currentEdges = newEdges;

      pushStep(
        5,
        `Contracted ${vId} into ${uId}.`,
        { nodes: currentNodes, edges: currentEdges },
        iter,
        undefined,
        undefined,
        uId // Only u stays highlighted
      );
    }

    // Count cut
    const cutSize = currentEdges.length;
    pushStep(6, `Only 2 nodes left. Cut size: ${cutSize}`, { nodes: currentNodes, edges: currentEdges }, iter, cutSize);

    if (cutSize < overallMinCut) {
      overallMinCut = cutSize;
      pushStep(7, `New Minimum Cut Found: ${overallMinCut}`, { nodes: currentNodes, edges: currentEdges }, iter, cutSize);
    } else {
      pushStep(7, `Min Cut remains ${overallMinCut}`, { nodes: currentNodes, edges: currentEdges }, iter, cutSize);
    }
  }

  pushStep(8, `Algorithm Finished. Overall Minimum Cut: ${overallMinCut}`, originalGraph, 3, overallMinCut);

  return steps;
};
