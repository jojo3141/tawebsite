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
  id?: string;
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
  LONG_PATH = 'LONG_PATH',
  HAMILTON_PATH = 'HAMILTON_PATH',
  MINIMUM_EDGE_CUT = 'MINIMUM_EDGE_CUT',
  SMALLEST_ENCLOSING_DISK = 'SMALLEST_ENCLOSING_DISK',
  JARVIS_WRAP = 'JARVIS_WRAP',
  LOCAL_REPAIR = 'LOCAL_REPAIR',
  FINDING_DUPLICATES_HASH = 'FINDING_DUPLICATES_HASH',
  BLOOM_FILTER = 'BLOOM_FILTER',
  FINDING_DUPLICATES_FLOYD = 'FINDING_DUPLICATES_FLOYD',
  METRIC_TSP = 'METRIC_TSP',
  METRIC_TSP_15 = 'METRIC_TSP_15',
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
  lineNumber: number | number[]; // Corresponds to pseudocode line
  description: string;
  autoAdvance?: boolean;

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
  activeEdge: { source: string, target: string, id?: string } | null;
  nodeColors?: Record<string, number>; // Maps nodeId to Color Index (1, 2, 3...)

  // Ford-Fulkerson Specific
  residualEdges?: { source: string, target: string, capacity: number, flow: number, isBackward?: boolean }[]; // Edges in the residual network
  path?: string[]; // Augmenting path in residual network
  bottleneck?: number; // Bottleneck capacity of the path
  edgeFlows?: Record<string, number>; // Map "source-target" -> current flow
  totalFlow?: number; // Current total flow value
  minCutSetS?: string[]; // S set from min-cut at the end (for S-T cut visualization)

  // Long Path Specific
  longPathIteration?: number; // 1 or 2
  longPathLength?: number; // i (0 to 4)
  longPathDP?: Record<string, string[]>; // Map nodeId -> list of color sets (as strings like "{1,2}")
  longPathDPPrev?: Record<string, string[]>; // Previous iteration sets (P_{i-1})
  longPathContributingSets?: Record<string, string[]>; // Map nodeId -> list of contributing sets from previous iteration
  longPathExtendedPaths?: string[][]; // List of paths (node IDs) that were extended in this step

  // Smallest Last Coloring Specific
  // Smallest Last Coloring Specific
  minDegreeNode?: string; // Node selected as having minimum degree

  // Hamilton Path Specific
  hamiltonPathSubsetSize?: number; // s
  hamiltonPathDP?: Record<string, string[]>; // Map nodeId -> list of sets (S) e.g. "{1,2}"
  hamiltonPathDPPrev?: Record<string, string[]>; // Previous size sets
  hamiltonPathActiveSets?: Record<string, string[]>; // Sets to highlight (current S)
  hamiltonPathPrevActiveSets?: Record<string, string[]>; // Previous sets to highlight (prev S\x)

  // Smallest Enclosing Disk Specific
  sedDisk?: { x: number, y: number, r: number } | null;
  sedSampleQ?: string[];
  sedOutliers?: string[];
  pointWeights?: Record<string, number>;

  // Convex Hull Specific
  hull?: string[]; // IDs of points in hull
  currentPoint?: string; // p_now
  nextPointCandidate?: string; // q_next
  checkingPoint?: string; // p
  hullLines?: { from: string, to: string }[];
  scanLine?: { from: string, to: string }; // The line being checked (q -> p) or (q -> q_next)
  localRepairSortedPath?: { from: string, to: string }[]; // Connects sorted points P1 -> P2 -> ... -> Pn

  // Minimum Edge Cut Specific
  minCutGraphState?: { nodes: Node[], edges: Edge[] }; // Snapshot of the graph structure (for contraction)
  minCutIteration?: number; // Current iteration (1 to 3)
  minCutVal?: number; // Current min cut value found
  overallMinCutVal?: number; // Overall min cut value so far
  contractedNodeA?: string; // Node being kept (or merged into)
  contractedNodeB?: string; // Node being removed

  findingDuplicatesDataset?: string[]; // The 12 strings
  findingDuplicatesTuples?: { hash: number, originalIndex: number, originalString: string }[]; // The list of tuples
  findingDuplicatesActiveIndex?: number; // Index in the tuple list being processed/highlighted
  findingDuplicatesCompareIndices?: [number, number]; // Indices of tuples currently
  findingDuplicatesFoundPairs?: [number, number][]; // Found duplicate index pairs

  // Bloom Filter Specific
  bloomFilterBitVector?: (0 | 1)[]; // Array of 16 bits
  bloomFilterPotentialDuplicates?: string[]; // List L
  bloomFilterActiveHashes?: number[]; // [x1, x2, x3]
  bloomFilterCurrentElementIndex?: number; // Index in dataset currently being processed
  bloomFilterHashParams?: { a: number, b: number }[]; // Parameters for the 3 hash functions being compared

  // Floyd Cycle Finding Specific
  findingDuplicatesFloyd?: {
    igel: number; // Node ID (1-15)
    hase: number; // Node ID (1-15)
    i?: number;   // Node ID (1-15)
    j?: number;   // Node ID (1-15)
    array: number[]; // The underlying array A (size 15, values 1-14)
    phase: 1 | 2; // 1 = Cycle Detection, 2 = Find Start
  };

  // Metric TSP Specific
  metricTspGraphState?: { nodes: Node[], edges: Edge[], isDirected?: boolean };
}

export const PSEUDOCODE_MIN_EDGE_CUT = [
  { line: 0, text: "min_cut ← ∞", indent: 0 },
  { line: 1, text: "repeat 3 times:  //repeat more often for higher probability", indent: 0 },
  { line: 2, text: "G' ← G", indent: 2 },
  { line: 3, text: "while |V| > 2 do", indent: 2 },
  { line: 4, text: "e ← uniformly random edge", indent: 4 },
  { line: 5, text: "contract e", indent: 4 },
  { line: 6, text: "cut ← count edges in G'", indent: 2 },
  { line: 7, text: "min_cut ← min(min_cut, cut)", indent: 2 },
  { line: 8, text: "return min_cut", indent: 0 },
];

export const PSEUDOCODE_SMALLEST_ENCLOSING_DISK = [
  { line: 1, text: "P' ← P", indent: 0 },
  { line: 2, text: "while true do", indent: 0 },
  { line: 3, text: "choose Q ⊆ P' with |Q| = 11 uniformly at random", indent: 2 },
  { line: 4, text: "determine C(Q)", indent: 2 },
  { line: 5, text: "if P ⊆ C(Q) then return C(Q)", indent: 2 },
  { line: 6, text: "else double all points of P' that are outside C(Q)", indent: 2 },
];

export const PSEUDOCODE_JARVIS_WRAP = [
  { line: 1, text: "JARVIS_WRAP(P):", indent: 0, bold: true },
  { line: 2, text: "h ← 0", indent: 2 },
  { line: 3, text: "p_now ← Point in P with smallest x-coordinate", indent: 2 },
  { line: 4, text: "repeat", indent: 2 },
  { line: 5, text: "q_h ← p_now", indent: 4 },
  { line: 6, text: "p_now ← FIND_NEXT(q_h)", indent: 4 },
  { line: 7, text: "h ← h + 1", indent: 4 },
  { line: 8, text: "until p_now = q_0", indent: 2 },
  { line: 9, text: "return (q_0, q_1, ..., q_{h-1})", indent: 2 },
  { line: 10, text: "", indent: 0 },
  { line: 11, text: "FIND_NEXT(q):", indent: 0, bold: true },
  { line: 12, text: "Choose p_0 ∈ P \\ {q} arbitrarily", indent: 2 },
  { line: 13, text: "q_next ← p_0", indent: 2 },
  { line: 14, text: "for all p ∈ P \\ {q, p_0} do", indent: 2 },
  { line: 15, text: "if p is right of q -> q_next then q_next ← p", indent: 4 },
  { line: 16, text: "return q_next", indent: 2 },
];

export const PSEUDOCODE_LOCAL_REPAIR = [
  { line: 1, text: "q_0 ← p_1", indent: 0 },
  { line: 2, text: "h ← 0", indent: 0 },
  { line: 3, text: "for i ← 2 to n do", indent: 0 },
  { line: 4, text: "while h > 0 and q_h left of q_{h-1}p_i do", indent: 2 },
  { line: 5, text: "h ← h - 1", indent: 4 },
  { line: 6, text: "h ← h + 1", indent: 2 },
  { line: 7, text: "q_h ← p_i", indent: 2 },
  { line: 8, text: "h' ← h", indent: 0 },
  { line: 9, text: "for i ← n - 1 downto 1 do", indent: 0 },
  { line: 10, text: "while h > h' and q_h left of q_{h-1}p_i do", indent: 2 },
  { line: 11, text: "h ← h - 1", indent: 4 },
  { line: 12, text: "h ← h + 1", indent: 2 },
  { line: 13, text: "q_h ← p_i", indent: 2 },
  { line: 14, text: "return (q_0, q_1, ..., q_{h-1})", indent: 0 }
];

export const PSEUDOCODE_HAMILTON_PATH = [
  { line: 0, text: "for all S with |S| = 2 do", indent: 0 },
  { line: 1, text: "P[S,x] = true if S = {1,x} and {1,x} ∈ E", indent: 2 },
  { line: 2, text: "for all s = 3 to n do", indent: 0 },
  { line: 3, text: "for all S ⊆ [n] with 1 ∈ S and |S| = s do", indent: 2 },
  { line: 4, text: "for all x ∈ S, x ≠ 1 do", indent: 4 },
  { line: 5, text: "P[S,x] = ∃x'∈ (S ∩ N(x)) such that x'≠ 1 and P[S\\{x}, x']", indent: 6 },
  { line: 6, text: "if P[[n],x] for some x ∈ N(1) then return true", indent: 0 },
  { line: 7, text: "else return false", indent: 0 },
];

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

export const PSEUDOCODE_BLOOM_FILTER = [
  { line: 0, text: "M ← bit array (all zeros); h₁, h₂, h₃ ← random hash functions", indent: 0 },
  { line: 1, text: "L ← empty list", indent: 0 },
  { line: 2, text: "for each s in Dataset do", indent: 0 },
  { line: 3, text: "x₁ ← h₁(s), x₂ ← h₂(s), x₃ ← h₃(s)", indent: 2 },
  { line: 4, text: "if M[x₁]==1 and M[x₂]==1 and M[x₃]==1 then", indent: 2 },
  { line: 5, text: "add s to L", indent: 4 },
  { line: 6, text: "M[x₁] ← 1; M[x₂] ← 1; M[x₃] ← 1", indent: 2 },
  { line: 7, text: "for each s in L do", indent: 0 },
  { line: 8, text: "verify if s is a real duplicate", indent: 2 },
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

export const PSEUDOCODE_LONG_PATH = [
  { line: 1, text: "for iteration = 1 to 2 do  //repeat more often for higher probability", indent: 0 },
  { line: 2, text: "Color graph randomly with k=5 colors", indent: 2 },
  { line: 3, text: "for all v ∈ V do P₀(v) ← {{γ(v)}}", indent: 2 },
  { line: 4, text: "for i = 1 to k-1 do", indent: 2 },
  { line: 5, text: "for all v ∈ V do", indent: 4 },
  { line: 6, text: "Pᵢ(v) ← ∅", indent: 6 },
  { line: 7, text: "for all x ∈ N(v) do", indent: 6 },
  { line: 8, text: "for all R ∈ Pᵢ₋₁(x) mit γ(v) ∉ R do", indent: 8 },
  { line: 9, text: "Pᵢ(v) ← Pᵢ(v) ∪ {R ∪ {γ(v)}}", indent: 10 },
  { line: 10, text: "if ∃v, P₄(v) ≠ ∅ return Path", indent: 2 },
];

export const PSEUDOCODE_FINDING_DUPLICATES_HASH = [
  { line: 0, text: "L ← empty list; h ← random hash function", indent: 0 },
  { line: 1, text: "for each s in Dataset do", indent: 0 },
  { line: 2, text: "h ← hash(s)", indent: 2 },
  { line: 3, text: "add (h, index(s)) to L", indent: 2 },
  { line: 4, text: "Sort L by hash value", indent: 0 },
  { line: 5, text: "for k = 0 to |L|-2 do", indent: 0 },
  { line: 6, text: "for j = k+1 to |L|-1 do", indent: 2 },
  { line: 7, text: "while L[k].hash == L[j].hash do", indent: 4 },
  { line: 8, text: "if Dataset[L[k].index] == Dataset[L[j].index] then", indent: 6 },
  { line: 9, text: "mark s as duplicate", indent: 8 },
];

export const PSEUDOCODE_FINDING_DUPLICATES_FLOYD = [
  { line: 1, text: "igel = a[n]; hase = a[a[n]]; i := 1", indent: 0 },
  { line: 2, text: "while (igel ≠ hase)", indent: 0 },
  { line: 3, text: "igel = a[igel]; hase = a[a[hase]]; i := i + 1", indent: 2 },
  { line: 4, text: "hase = n;", indent: 0 },
  { line: 5, text: "while (igel ≠ hase)", indent: 0 },
  { line: 6, text: "i := igel; j := hase;", indent: 2 },
  { line: 7, text: "igel = a[igel]; hase := a[hase];", indent: 2 },
  { line: 8, text: "return i, j", indent: 0 },
];

export const PSEUDOCODE_METRIC_TSP = [
  { line: 1, text: "find MST", indent: 0 },
  { line: 2, text: "double MST edges", indent: 0 },
  { line: 3, text: "find Euler Tour", indent: 0 },
  { line: 4, text: "Walk along Euler tour with shortcuts:", indent: 0 },
  { line: 5, text: "v ← next node in Euler tour", indent: 2 },
  { line: 6, text: "if v is not visited then", indent: 2 },
  { line: 7, text: "add v to TSP path", indent: 4 },
  { line: 8, text: "mark v as visited", indent: 4 },
  { line: 9, text: "else shortcut past v", indent: 2 },
];

export const PSEUDOCODE_METRIC_TSP_15 = [
  { line: 1, text: "find MST", indent: 0 },
  { line: 2, text: "add a minimum weight perfect matching of all vertices of odd degree", indent: 0 },
  { line: 3, text: "find Euler Tour", indent: 0 },
  { line: 4, text: "Walk along Euler tour with shortcuts:", indent: 0 },
  { line: 5, text: "v ← next node in Euler tour", indent: 2 },
  { line: 6, text: "if v is not visited then", indent: 2 },
  { line: 7, text: "add v to TSP path", indent: 4 },
  { line: 8, text: "mark v as visited", indent: 4 },
  { line: 9, text: "else shortcut past v", indent: 2 },
];
