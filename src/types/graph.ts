export interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface Edge {
  source: string;
  target: string;
  weight: number;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
  isDirected?: boolean;
  hasUniqueWeights?: boolean;
}

export enum AlgorithmType {
  DIJKSTRA = 'DIJKSTRA',
  BFS = 'BFS',
  DFS = 'DFS',
  BELLMAN_FORD = 'BELLMAN_FORD',
  PRIM = 'PRIM',
  KRUSKAL = 'KRUSKAL',
  BORUVKA = 'BORUVKA',
}

export enum EdgeType {
  TREE = 'TREE',
  BACK = 'BACK',
  FORWARD = 'FORWARD',
  CROSS = 'CROSS'
}

export interface PriorityQueueItem {
  nodeId: string;
  distance: number;
}

export interface AlgorithmStep {
  stepId: number;
  lineNumber: number; // Corresponds to pseudocode line
  description: string;
  
  // Snapshot of data
  distances: Record<string, number>; // d[v] for Dijkstra/BFS
  parents: Record<string, string | null>; // p[v]
  
  // DFS Specific
  discoveryTimes: Record<string, number>; // d[v] (Pre-order)
  finishTimes: Record<string, number>;    // f[v] (Post-order)
  edgeClassifications: Record<string, EdgeType>; // Key: "source-target"
  
  // Prim Specific
  mstEdges: {source: string, target: string}[]; // Set F

  // Boruvka Specific
  // Stores the edge selected by a specific component (root)
  boruvkaMinEdges?: { root: string, edge: {source: string, target: string, weight: number} }[]; 

  // Data Structures
  queue: PriorityQueueItem[]; // Used for Dijkstra (PQ) and BFS (FIFO)
  stack: string[]; // Used for DFS (Recursion Stack)
  processedSet: string[]; // S (nodes finished/visited)
  
  // Highlight state
  currentNodeId: string | null; // u
  currentNeighborId: string | null; // v
  activeEdge: { source: string; target: string } | null;
}

export const PSEUDOCODE_DIJKSTRA = [
  { line: 1, text: "for each v ∈ V\\{s} do", indent: 0 },
  { line: 2, text: "d[v] ← ∞; p[v] ← null", indent: 2 },
  { line: 3, text: "d[s] ← 0; p[s] ← null", indent: 0 },
  { line: 4, text: "Q ← Ø", indent: 0 },
  { line: 5, text: "INSERT(s, 0, Q)", indent: 0 },
  { line: 6, text: "while Q ≠ Ø do", indent: 0 },
  { line: 7, text: "u ← EXTRACT-MIN(Q)", indent: 2 },
  { line: 8, text: "for each (u, v) ∈ E do", indent: 2 },
  { line: 9, text: "if p[v] = null then", indent: 4 },
  { line: 10, text: "d[v] ← d[u] + w((u, v))", indent: 6 },
  { line: 11, text: "p[v] ← u", indent: 6 },
  { line: 12, text: "ENQUEUE(v, d[v], Q)", indent: 6 },
  { line: 13, text: "else if d[u] + w((u, v)) < d[v] then", indent: 4 },
  { line: 14, text: "d[v] ← d[u] + w((u, v))", indent: 6 },
  { line: 15, text: "p[v] ← u", indent: 6 },
  { line: 16, text: "DECREASE-KEY(v, d[v], Q)", indent: 6 },
];

export const PSEUDOCODE_DIJKSTRA_UNDIRECTED = [
  { line: 1, text: "for each v ∈ V\\{s} do", indent: 0 },
  { line: 2, text: "d[v] ← ∞; p[v] ← null", indent: 2 },
  { line: 3, text: "d[s] ← 0; p[s] ← null", indent: 0 },
  { line: 4, text: "Q ← Ø", indent: 0 },
  { line: 5, text: "INSERT(s, 0, Q)", indent: 0 },
  { line: 6, text: "while Q ≠ Ø do", indent: 0 },
  { line: 7, text: "u ← EXTRACT-MIN(Q)", indent: 2 },
  { line: 8, text: "for each {u, v} ∈ E do", indent: 2 },
  { line: 9, text: "if p[v] = null then", indent: 4 },
  { line: 10, text: "d[v] ← d[u] + w({u, v})", indent: 6 },
  { line: 11, text: "p[v] ← u", indent: 6 },
  { line: 12, text: "ENQUEUE(v, d[v], Q)", indent: 6 },
  { line: 13, text: "else if d[u] + w({u, v}) < d[v] then", indent: 4 },
  { line: 14, text: "d[v] ← d[u] + w({u, v})", indent: 6 },
  { line: 15, text: "p[v] ← u", indent: 6 },
  { line: 16, text: "DECREASE-KEY(v, d[v], Q)", indent: 6 },
];

export const PSEUDOCODE_BFS = [
  { line: 1, text: "for each v ∈ V do", indent: 0 },
  { line: 2, text: "visited[v] = false; dist[v] = ∞", indent: 2 },
  { line: 3, text: "Q ← Ø", indent: 0 },
  { line: 4, text: "visited[s] ← true; dist[s] ← 0", indent: 0 },
  { line: 5, text: "ENQUEUE(s, Q)", indent: 0 },
  { line: 6, text: "while Q ≠ Ø do", indent: 0 },
  { line: 7, text: "u ← DEQUEUE(Q)", indent: 2 },
  { line: 8, text: "for each (u, v) ∈ E do", indent: 2 },
  { line: 9, text: "if visited[v] == false then", indent: 4 },
  { line: 10, text: "visited[v] ← true", indent: 6 },
  { line: 11, text: "dist[v] ← dist[u] + 1", indent: 6 },
  { line: 12, text: "ENQUEUE(v, Q)", indent: 6 },
];

export const PSEUDOCODE_BFS_UNDIRECTED = [
  { line: 1, text: "for each v ∈ V do", indent: 0 },
  { line: 2, text: "visited[v] = false; dist[v] = ∞", indent: 2 },
  { line: 3, text: "Q ← Ø", indent: 0 },
  { line: 4, text: "visited[s] ← true; dist[s] ← 0", indent: 0 },
  { line: 5, text: "ENQUEUE(s, Q)", indent: 0 },
  { line: 6, text: "while Q ≠ Ø do", indent: 0 },
  { line: 7, text: "u ← DEQUEUE(Q)", indent: 2 },
  { line: 8, text: "for each {u, v} ∈ E do", indent: 2 },
  { line: 9, text: "if visited[v] == false then", indent: 4 },
  { line: 10, text: "visited[v] ← true", indent: 6 },
  { line: 11, text: "dist[v] ← dist[u] + 1", indent: 6 },
  { line: 12, text: "ENQUEUE(v, Q)", indent: 6 },
];

export const PSEUDOCODE_DFS = [
  { line: 1, text: "DFS(G):", indent: 0 },
  { line: 2, text: "for each v ∈ V do", indent: 2 },
  { line: 3, text: "if v is not visited then", indent: 4 },
  { line: 4, text: "DFS-VISIT(G, v)", indent: 6 },
  { line: 5, text: "", indent: 0 }, // Spacer
  { line: 6, text: "DFS-VISIT(G, v):", indent: 0 },
  { line: 7, text: "Mark v as visited", indent: 2 },
  { line: 8, text: "for each (v, w) ∈ E do", indent: 2 },
  { line: 9, text: "if w is not visited then", indent: 4 },
  { line: 10, text: "DFS-VISIT(G, w)", indent: 6 },
];

export const PSEUDOCODE_DFS_UNDIRECTED = [
  { line: 1, text: "DFS(G):", indent: 0 },
  { line: 2, text: "for each v ∈ V do", indent: 2 },
  { line: 3, text: "if v is not visited then", indent: 4 },
  { line: 4, text: "DFS-VISIT(G, v)", indent: 6 },
  { line: 5, text: "", indent: 0 }, // Spacer
  { line: 6, text: "DFS-VISIT(G, v):", indent: 0 },
  { line: 7, text: "Mark v as visited", indent: 2 },
  { line: 8, text: "for each {v, w} ∈ E do", indent: 2 },
  { line: 9, text: "if w is not visited then", indent: 4 },
  { line: 10, text: "DFS-VISIT(G, w)", indent: 6 },
];

export const PSEUDOCODE_BELLMAN_FORD = [
  { line: 1, text: "for each v ≠ s:", indent: 0 },
  { line: 2, text: "d[v] ← ∞", indent: 2 },
  { line: 3, text: "p[v] ← null", indent: 2 },
  { line: 4, text: "d[s] ← 0, p[s] ← null", indent: 0 },
  { line: 5, text: "for i = 1, ..., n - 1 do", indent: 0 },
  { line: 6, text: "for each (u, v) ∈ E do", indent: 2 },
  { line: 7, text: "if d[u] + w(u, v) < d[v] then", indent: 4 },
  { line: 8, text: "d[v] ← d[u] + w(u, v)", indent: 6 },
  { line: 9, text: "p[v] ← u", indent: 6 },
];

export const PSEUDOCODE_BELLMAN_FORD_UNDIRECTED = [
  { line: 1, text: "for each v ≠ s:", indent: 0 },
  { line: 2, text: "d[v] ← ∞", indent: 2 },
  { line: 3, text: "p[v] ← null", indent: 2 },
  { line: 4, text: "d[s] ← 0, p[s] ← null", indent: 0 },
  { line: 5, text: "for i = 1, ..., n - 1 do", indent: 0 },
  { line: 6, text: "for each {u, v} ∈ E do", indent: 2 },
  { line: 7, text: "if d[u] + w({u, v}) < d[v] then", indent: 4 },
  { line: 8, text: "d[v] ← d[u] + w({u, v})", indent: 6 },
  { line: 9, text: "p[v] ← u", indent: 6 },
];

export const PSEUDOCODE_PRIM = [
  { line: 1, text: "F ← Ø", indent: 0 },
  { line: 2, text: "S ← {s}", indent: 0 },
  { line: 3, text: "while F is not a spanning tree do", indent: 0 },
  { line: 4, text: "{u, v} ← min edge leaving S, u ∈ S, v ∉ S", indent: 2 },
  { line: 5, text: "F ← F ∪ {{u, v}}", indent: 2 },
  { line: 6, text: "S ← S ∪ {v}", indent: 2 },
];

export const PSEUDOCODE_KRUSKAL = [
  { line: 1, text: "F ← Ø", indent: 0 },
  { line: 2, text: "for {u, v} ∈ E sorted by weight ascending do", indent: 0 },
  { line: 3, text: "if u and v in different components of F then", indent: 2 },
  { line: 4, text: "F ← F ∪ {{u, v}}", indent: 4 },
];

export const PSEUDOCODE_BORUVKA = [
  { line: 1, text: "F ← Ø", indent: 0 },
  { line: 2, text: "while F is not a spanning tree do", indent: 0 },
  { line: 3, text: "(S1,...,Sk) ← connected components of F", indent: 2 },
  { line: 4, text: "for i = 1 to k do", indent: 2 },
  { line: 5, text: "ei ← min edge leaving Si", indent: 4 },
  { line: 6, text: "F ← F ∪ {e1,...,ek}", indent: 2 },
];