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
  capacity?: number;
  flow?: number;
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
  TARJAN = 'TARJAN',
  EULER = 'EULER',
  GREEDY_MATCHING = 'GREEDY_MATCHING',
  HOPCROFT_KARP = 'HOPCROFT_KARP',
  GREEDY_COLORING = 'GREEDY_COLORING',
  SMALLEST_LAST_COLORING = 'SMALLEST_LAST_COLORING',
  FORD_FULKERSON = 'FORD_FULKERSON',
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

  // Tarjan Specific
  lowLinks?: Record<string, number>; // low[v]
  articulationPoints?: string[]; // List of IDs
  bridges?: { source: string, target: string }[]; // List of Bridge Edges

  // Prim Specific
  mstEdges: { source: string, target: string }[]; // Set F

  // Boruvka Specific
  // Stores the edge selected by a specific component (root)
  boruvkaMinEdges?: { root: string, edge: { source: string, target: string, weight: number } }[];

  // Kruskal Specific
  unionFindMembers?: Record<string, string[]>; // members[rep[v]]

  // Euler Specific
  eulerTour?: string[]; // The main tour W
  eulerSubTour?: string[]; // The current random tour W'

  // Hopcroft-Karp Specific
  hopcroftLayers?: Record<number, string[]>; // Layers L0, L1, L2, ... stored as {0: [...], 1: [...], ...}
  augmentingPathsSet?: string[][]; // Set S of vertex-disjoint augmenting paths
  currentAugmentingPath?: string[]; // The specific path being augmented in the current step

  // Data Structures
  queue: PriorityQueueItem[]; // Used for Dijkstra (PQ) and BFS (FIFO)
  stack: string[]; // Used for DFS (Recursion Stack)
  processedSet: string[]; // S (nodes finished/visited)

  // Highlight state
  currentNodeId: string | null; // u
  currentNeighborId: string | null; // v
  activeEdge: { source: string; target: string } | null;
  nodeColors?: Record<string, number>; // Maps nodeId to Color Index (1, 2, 3...)

  // Ford-Fulkerson Specific
  residualEdges?: { source: string, target: string, capacity: number, flow: number, isBackward?: boolean }[]; // Edges in the residual network
  path?: string[]; // Augmenting path in residual network
  bottleneck?: number; // Bottleneck capacity of the path
  edgeFlows?: Record<string, number>; // Map "source-target" -> current flow
  totalFlow?: number; // Current total flow value
  minCutSetS?: string[]; // S set from min-cut at the end (for S-T cut visualization)
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
  { line: 1, text: "Kruskal(G = (V, E)):", indent: 0 },
  { line: 2, text: "F ← Ø", indent: 2 },
  { line: 3, text: "MAKE(V)", indent: 2 },
  { line: 4, text: "for (u, v) ∈ E sorted by weight ascending do", indent: 2 },
  { line: 5, text: "if not SAME(u, v) then", indent: 4 },
  { line: 6, text: "F ← F ∪ {(u, v)}", indent: 6 },
  { line: 7, text: "UNION(u, v)", indent: 6 },
  { line: 8, text: "return F", indent: 2 },
  { line: 9, text: "", indent: 0 },
  { line: 10, text: "Make(V):", indent: 0 },
  { line: 11, text: "for v ∈ V do", indent: 2 },
  { line: 12, text: "rep[v] ← v", indent: 4 },
  { line: 13, text: "members[rep[v]] ← {v}", indent: 4 },
  { line: 14, text: "", indent: 0 },
  { line: 15, text: "Same(u, v):", indent: 0 },
  { line: 16, text: "return (rep[u] == rep[v])", indent: 2 },
  { line: 17, text: "", indent: 0 },
  { line: 18, text: "Union(u, v):", indent: 0 },
  { line: 19, text: "if |members[rep[u]]| > |members[rep[v]]| then", indent: 2 },
  { line: 20, text: "Swap u, v", indent: 4 },
  { line: 21, text: "for x in members[rep[u]] do", indent: 2 },
  { line: 22, text: "rep[x] ← rep[v]", indent: 4 },
  { line: 23, text: "members[rep[v]] ← members[rep[v]] ∪ {x}", indent: 4 },
];

export const PSEUDOCODE_BORUVKA = [
  { line: 1, text: "F ← Ø", indent: 0 },
  { line: 2, text: "while F is not a spanning tree do", indent: 0 },
  { line: 3, text: "(S1,...,Sk) ← connected components of F", indent: 2 },
  { line: 4, text: "for i = 1 to k do", indent: 2 },
  { line: 5, text: "ei ← min edge leaving Si", indent: 4 },
  { line: 6, text: "F ← F ∪ {e1,...,ek}", indent: 2 },
];

export const PSEUDOCODE_TARJAN = [
  { line: 1, text: "TARJAN(u, parent):", indent: 0 },
  { line: 2, text: "dfs[u] ← time; low[u] ← time", indent: 2 },
  { line: 3, text: "time++", indent: 2 },
  { line: 4, text: "for each (u, v) ∈ E do", indent: 2 },
  { line: 5, text: "if v == parent then continue", indent: 4 },
  { line: 6, text: "if v is visited then", indent: 4 },
  { line: 7, text: "low[u] ← min(low[u], dfs[v])", indent: 6 },
  { line: 8, text: "else", indent: 4 },
  { line: 9, text: "TARJAN(v, u)", indent: 6 },
  { line: 10, text: "low[u] ← min(low[u], low[v])", indent: 6 },
];

export const PSEUDOCODE_EULER = [
  { line: 1, text: "W ← RANDOMTOUR(v_start)", indent: 0 },
  { line: 2, text: "v_slow ← start node of W", indent: 0 },
  { line: 3, text: "while v_slow is not last node in W do", indent: 0 },
  { line: 4, text: "if Degree(v_slow) > 0 then", indent: 2 },
  { line: 5, text: "W' ← RANDOMTOUR(v_slow)", indent: 4 },
  { line: 6, text: "W ← Merge W and W' at v_slow", indent: 4 },
  { line: 7, text: "v_slow ← next node in W", indent: 2 },
  { line: 8, text: "return W", indent: 0 },
  { line: 9, text: "", indent: 0 },
  { line: 10, text: "RANDOMTOUR(u):", indent: 0 },
  { line: 11, text: "W_temp ← <u>", indent: 2 },
  { line: 12, text: "while u has neighbors do", indent: 2 },
  { line: 13, text: "Pick v in Neighbors(u)", indent: 4 },
  { line: 14, text: "Add v to W_temp", indent: 4 },
  { line: 15, text: "Remove edge {u, v}", indent: 4 },
  { line: 16, text: "u ← v", indent: 4 },
  { line: 17, text: "return W_temp", indent: 2 },
];

export const PSEUDOCODE_GREEDY_MATCHING = [
  { line: 1, text: "M ← ∅", indent: 0 },
  { line: 2, text: "while E ≠ ∅ do", indent: 0 },
  { line: 3, text: "wähle eine beliebige Kante e ∈ E", indent: 2 },
  { line: 4, text: "M ← M ∪ {e}", indent: 2 },
  { line: 5, text: "lösche e und alle inzidenten Kanten in G", indent: 2 },
];

export const PSEUDOCODE_HOPCROFT_KARP = [
  { line: 1, text: "HOPCROFT-KARP(G = (A ⊎ B, E)):", indent: 0 },
  { line: 2, text: "M := {e} für irgendeine Kante e ∈ E", indent: 2 },
  { line: 3, text: "while es gibt noch augmentierende Pfade do", indent: 2 },
  { line: 4, text: "S := FIND-AUGMENTING-PATHS(G, M)", indent: 4 },
  { line: 5, text: "if S = ∅ then return M", indent: 4 },
  { line: 6, text: "for all P ∈ S do", indent: 4 },
  { line: 7, text: "M := M ⊕ P  // augmentiere entlang P", indent: 6 },
  { line: 8, text: "return M", indent: 2 },
  { line: 9, text: "", indent: 0 },
  { line: 10, text: "FIND-AUGMENTING-PATHS(G, M):", indent: 0 },
  { line: 11, text: "L₀ := {unüberdeckte Knoten in A}", indent: 2 },
  { line: 12, text: "Markiere alle Knoten aus L₀ als besucht", indent: 2 },
  { line: 13, text: "if L₀ = ∅ then return ∅", indent: 2 },
  { line: 14, text: "for i = 1 to n do", indent: 2 },
  { line: 15, text: "if i ungerade then", indent: 4 },
  { line: 16, text: "Lᵢ := {unbesuchte Nachbarn von Lᵢ₋₁ via E\\M}", indent: 6 },
  { line: 17, text: "else", indent: 4 },
  { line: 18, text: "Lᵢ := {unbesuchte Nachbarn von Lᵢ₋₁ via M}", indent: 6 },
  { line: 19, text: "Markiere alle Knoten aus Lᵢ als besucht", indent: 4 },
  { line: 20, text: "if Lᵢ enthält unüberdeckte Knoten then", indent: 4 },
  { line: 21, text: "S := ∅", indent: 6 },
  { line: 22, text: "for all unüberdeckte v ∈ Lᵢ do", indent: 6 },
  { line: 23, text: "if v nicht in verwendeten Pfaden then", indent: 8 },
  { line: 24, text: "P := Pfad von L₀ nach v durch backtracking", indent: 10 },
  { line: 25, text: "S := S ∪ {P}", indent: 10 },
  { line: 26, text: "Markiere Knoten in P als verwendet", indent: 10 },
  { line: 27, text: "return S", indent: 6 },
  { line: 28, text: "return ∅  // M ist bereits maximal", indent: 2 },
];

export const PSEUDOCODE_GREEDY_COLORING = [
  { line: 1, text: "wähle eine beliebige Reihenfolge der Knoten: V = {v₁, ..., vₙ}", indent: 0 },
  { line: 2, text: "c[v₁] ← 1", indent: 0 },
  { line: 3, text: "for i = 2 to n do", indent: 0 },
  { line: 4, text: "c[vᵢ] ← min{k ∈ ℕ | k ≠ c(u) ∀u ∈ N(vᵢ) ∩ {v₁, ..., vᵢ₋₁}}", indent: 2 },
];

export const PSEUDOCODE_SMALLEST_LAST_COLORING = [
  { line: 1, text: "for i = n down to 1 do", indent: 0 },
  { line: 2, text: "vᵢ ← vertex with minimum degree in current G", indent: 2 },
  { line: 3, text: "Remove vᵢ and incident edges from G", indent: 2 },
  { line: 4, text: "c[v₁] ← 1", indent: 0 },
  { line: 5, text: "for i = 2 to n do", indent: 0 },
  { line: 6, text: "c[vᵢ] ← min{k ∈ ℕ | k ≠ c(u) ∀u ∈ N(vᵢ) ∩ {v₁, ..., vᵢ₋₁}}", indent: 2 },
];

export const PSEUDOCODE_FORD_FULKERSON = [
  { line: 1, text: "for each edge (u, v) ∈ A do f(u, v) ← 0", indent: 0 },
  { line: 2, text: "while there exists an s-t path P in residual network do", indent: 0 },
  { line: 3, text: "ε ← min{res_cap(u, v) | (u, v) ∈ P}", indent: 2 },
  { line: 4, text: "for each edge (u, v) ∈ P do", indent: 2 },
  { line: 5, text: "if (u, v) ∈ A then", indent: 4 },
  { line: 6, text: "f(u, v) ← f(u, v) + ε", indent: 6 },
  { line: 7, text: "else", indent: 4 },
  { line: 8, text: "f(u, v) ← f(u, v) - ε", indent: 6 },
  { line: 9, text: "S ← {v ∈ V | exists s-v path in residual network}; T ← V \\ S", indent: 0 },
];





