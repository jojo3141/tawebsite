

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
    for (const { id: v, edge } of neighbors) {
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
  const edges: Edge[] = [];
  const ids = "ABCDEFGHIJKL".split(''); // 12 Nodes

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

  const addEdge = (u: string, v: string) => {
    // Prevent potential duplicates if randomization selects same edge
    if (!edges.some(e => (e.source === u && e.target === v) || (e.source === v && e.target === u))) {
      edges.push({ source: u, target: v, weight: 1 });
    }
  };

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
