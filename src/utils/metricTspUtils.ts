import { Graph, Node, Edge, AlgorithmStep } from '../types/graph';

// Generate 8 random points in the plane for metric TSP
export const generateMetricTspGraph = (width: number, height: number): Graph => {
    const nodes: Node[] = [];
    const padding = 50;
    const minDistance = 80;
    const dist = (x1: number, y1: number, x2: number, y2: number) => Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

    for (let i = 0; i < 8; i++) {
        let x = 0, y = 0;
        let valid = false;
        let attempts = 0;

        while (!valid && attempts < 100) {
            x = padding + Math.random() * (width - 2 * padding);
            y = padding + Math.random() * (height - 2 * padding) - 30;
            valid = true;
            for (const n of nodes) {
                if (dist(x, y, n.x, n.y) < minDistance) {
                    valid = false;
                    break;
                }
            }
            attempts++;
        }

        nodes.push({
            id: `TSP-${i}`,
            label: `${i}`,
            x,
            y,
        });
    }

    return {
        nodes,
        edges: [],
        isDirected: false,
    };
};

export const calculateMetricTspSteps = (graph: Graph): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    let stepId = 0;

    const createBaseStep = (line: number, desc: string): AlgorithmStep => ({
        stepId: stepId++,
        lineNumber: line,
        description: desc,
        distances: {},
        parents: {},
        discoveryTimes: {},
        finishTimes: {},
        edgeClassifications: {},
        queue: [],
        stack: [],
        processedSet: [],
        currentNodeId: null,
        currentNeighborId: null,
        activeEdge: null,
        mstEdges: [],
        metricTspGraphState: {
            nodes: graph.nodes,
            edges: [],
            isDirected: false
        }
    });

    const nodes = graph.nodes;
    if (nodes.length === 0) return steps;

    // Calculate Euclidean distance
    const dist = (n1: Node, n2: Node) => Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2));

    // 1. Find MST (Prim's algorithm on complete graph)
    const mstEdges: Edge[] = [];
    const visitedMst = new Set<string>([nodes[0].id]);

    const stepInit = createBaseStep(1, "Start with a set of points in the metric plane. Distance is Euclidean.");
    stepInit.metricTspGraphState!.edges = [];
    steps.push(stepInit);

    while (visitedMst.size < nodes.length) {
        let minEdge = null;
        let minDist = Infinity;
        for (const uId of visitedMst) {
            const u = nodes.find(n => n.id === uId)!;
            for (const v of nodes) {
                if (!visitedMst.has(v.id)) {
                    const d = dist(u, v);
                    if (d < minDist) {
                        minDist = d;
                        minEdge = { source: uId, target: v.id, weight: Math.round(d) };
                    }
                }
            }
        }
        if (minEdge) {
            mstEdges.push({ ...minEdge, id: `mst-${mstEdges.length}` });
            visitedMst.add(minEdge.target);
        }
    }

    // Step 1: MST found
    const stepMST = createBaseStep(1, "Find Minimum Spanning Tree (MST)");
    stepMST.metricTspGraphState!.edges = [...mstEdges];
    steps.push(stepMST);

    // 2. Double MST edges
    const doubledEdges: Edge[] = [];
    mstEdges.forEach((e, i) => {
        doubledEdges.push(e);
        // Add reverse for drawing doubled effect (slightly curved later)
        doubledEdges.push({ source: e.target, target: e.source, weight: e.weight, id: `doubled-${i}` });
    });

    const stepDouble = createBaseStep(2, "Double all edges of the MST to create an Eulerian multigraph");
    stepDouble.metricTspGraphState!.edges = [...doubledEdges];
    steps.push(stepDouble);

    // 3. Find Euler Tour 
    const adj = new Map<string, Edge[]>();
    nodes.forEach(n => adj.set(n.id, []));

    // Create a copy of the doubled edges to consume during Euler Tour finding
    const edgesCopy = doubledEdges.map(e => ({ ...e }));

    edgesCopy.forEach(e => {
        adj.get(e.source)!.push(e);
    });

    const eulerTourNodes: string[] = [];

    // Hierholzer's Algorithm
    const stack = [nodes[0].id];
    while (stack.length > 0) {
        const u = stack[stack.length - 1];
        const neighbors = adj.get(u)!;
        if (neighbors.length > 0) {
            const e = neighbors.pop()!;
            stack.push(e.target);
        } else {
            eulerTourNodes.push(stack.pop()!);
        }
    }
    eulerTourNodes.reverse();

    const eulerEdges: Edge[] = [];
    for (let i = 0; i < eulerTourNodes.length - 1; i++) {
        const uId = eulerTourNodes[i];
        const vId = eulerTourNodes[i + 1];
        const u = nodes.find(n => n.id === uId)!;
        const v = nodes.find(n => n.id === vId)!;
        eulerEdges.push({ source: uId, target: vId, weight: Math.round(dist(u, v)), id: `euler-${i}` });
    }

    const stepEuler = createBaseStep(3, "Find an Euler Tour in the multigraph");
    stepEuler.metricTspGraphState!.edges = [...eulerEdges];
    stepEuler.metricTspGraphState!.isDirected = true;
    steps.push(stepEuler);

    const stepStartWalk = createBaseStep(4, "Walk along Euler tour and use shortcuts to skip visited nodes");
    stepStartWalk.metricTspGraphState!.edges = [...eulerEdges];
    stepStartWalk.metricTspGraphState!.isDirected = true;
    steps.push(stepStartWalk);

    // 4. Shortcut
    const tspPath: string[] = [];
    const visitedTsp = new Set<string>();
    const currentTspEdges: Edge[] = [];

    for (let i = 0; i < eulerTourNodes.length; i++) {
        const vId = eulerTourNodes[i];
        const nodeLabel = nodes.find(n => n.id === vId)?.label;

        const stepGetNode = createBaseStep(5, `Consider next node in Euler Tour: Node ${nodeLabel}`);
        stepGetNode.currentNodeId = vId;
        stepGetNode.metricTspGraphState!.edges = [...eulerEdges, ...currentTspEdges];
        stepGetNode.metricTspGraphState!.isDirected = true;
        stepGetNode.processedSet = Array.from(visitedTsp);
        steps.push(stepGetNode);

        const stepCheck = createBaseStep(6, `Is Node ${nodeLabel} already visited?`);
        stepCheck.currentNodeId = vId;
        stepCheck.metricTspGraphState!.edges = [...eulerEdges, ...currentTspEdges];
        stepCheck.metricTspGraphState!.isDirected = true;
        stepCheck.processedSet = Array.from(visitedTsp);
        steps.push(stepCheck);

        if (!visitedTsp.has(vId)) {
            visitedTsp.add(vId);

            if (tspPath.length > 0) {
                const uId = tspPath[tspPath.length - 1];
                const u = nodes.find(n => n.id === uId)!;
                const v = nodes.find(n => n.id === vId)!;
                currentTspEdges.push({ source: uId, target: vId, weight: Math.round(dist(u, v)), id: `tsp-${tspPath.length}` });
            }
            tspPath.push(vId);

            const stepAdd = createBaseStep(7, `Add Node ${nodeLabel} to the TSP path`);
            stepAdd.currentNodeId = vId;
            stepAdd.metricTspGraphState!.edges = [...eulerEdges, ...currentTspEdges];
            stepAdd.metricTspGraphState!.isDirected = true;
            stepAdd.processedSet = Array.from(visitedTsp);
            stepAdd.activeEdge = currentTspEdges.length > 0 ? { ...currentTspEdges[currentTspEdges.length - 1] } : null;
            steps.push(stepAdd);

            const stepMark = createBaseStep(8, `Mark Node ${nodeLabel} as visited`);
            stepMark.currentNodeId = vId;
            stepMark.processedSet = Array.from(visitedTsp);
            stepMark.metricTspGraphState!.edges = [...eulerEdges, ...currentTspEdges];
            stepMark.metricTspGraphState!.isDirected = true;
            steps.push(stepMark);
        } else {
            const stepShortcut = createBaseStep(9, `Node ${nodeLabel} is already visited. Shortcut past it.`);
            stepShortcut.currentNodeId = vId;
            stepShortcut.processedSet = Array.from(visitedTsp);
            stepShortcut.metricTspGraphState!.edges = [...eulerEdges, ...currentTspEdges];
            stepShortcut.metricTspGraphState!.isDirected = true;
            steps.push(stepShortcut);
        }
    }

    // Close the loop
    const firstNode = tspPath[0];
    const lastNode = tspPath[tspPath.length - 1];
    if (firstNode !== lastNode) {
        const u = nodes.find(n => n.id === lastNode)!;
        const v = nodes.find(n => n.id === firstNode)!;
        currentTspEdges.push({ source: lastNode, target: firstNode, weight: Math.round(dist(u, v)), id: `tsp-${tspPath.length}` });

        const stepClose = createBaseStep(0, "Return to the start node to complete the TSP tour");
        stepClose.processedSet = Array.from(visitedTsp);
        stepClose.metricTspGraphState!.edges = [...eulerEdges, ...currentTspEdges];
        stepClose.metricTspGraphState!.isDirected = true;
        stepClose.activeEdge = { ...currentTspEdges[currentTspEdges.length - 1] };
        steps.push(stepClose);
    }

    const finalStep = createBaseStep(0, "Algorithm Complete. The 2-Approximation Metric TSP tour is found.");
    finalStep.processedSet = Array.from(visitedTsp);
    finalStep.metricTspGraphState!.edges = [...currentTspEdges];
    finalStep.metricTspGraphState!.isDirected = true;
    steps.push(finalStep);

    return steps;
};

export const calculateMetricTsp15Steps = (graph: Graph): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    let stepId = 0;

    const createBaseStep = (line: number, desc: string): AlgorithmStep => ({
        stepId: stepId++,
        lineNumber: line,
        description: desc,
        distances: {},
        parents: {},
        discoveryTimes: {},
        finishTimes: {},
        edgeClassifications: {},
        queue: [],
        stack: [],
        processedSet: [],
        currentNodeId: null,
        currentNeighborId: null,
        activeEdge: null,
        mstEdges: [],
        metricTspGraphState: {
            nodes: graph.nodes,
            edges: [],
            isDirected: false
        }
    });

    const nodes = graph.nodes;
    if (nodes.length === 0) return steps;

    const dist = (n1: Node, n2: Node) => Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2));

    const mstEdges: Edge[] = [];
    const visitedMst = new Set<string>([nodes[0].id]);

    const stepInit = createBaseStep(1, "Start with a set of points in the metric plane. Distance is Euclidean.");
    stepInit.metricTspGraphState!.edges = [];
    steps.push(stepInit);

    while (visitedMst.size < nodes.length) {
        let minEdge = null;
        let minDist = Infinity;
        for (const uId of visitedMst) {
            const u = nodes.find(n => n.id === uId)!;
            for (const v of nodes) {
                if (!visitedMst.has(v.id)) {
                    const d = dist(u, v);
                    if (d < minDist) {
                        minDist = d;
                        minEdge = { source: uId, target: v.id, weight: Math.round(d) };
                    }
                }
            }
        }
        if (minEdge) {
            mstEdges.push({ ...minEdge, id: `mst-${mstEdges.length}` });
            visitedMst.add(minEdge.target);
        }
    }

    const stepMST = createBaseStep(1, "Find Minimum Spanning Tree (MST)");
    stepMST.metricTspGraphState!.edges = [...mstEdges];
    steps.push(stepMST);

    // Find odd degree vertices
    const degrees = new Map<string, number>();
    mstEdges.forEach(e => {
        degrees.set(e.source, (degrees.get(e.source) || 0) + 1);
        degrees.set(e.target, (degrees.get(e.target) || 0) + 1);
    });

    const oddNodes = nodes.filter(n => (degrees.get(n.id) || 0) % 2 !== 0);

    // Find minimum weight perfect matching on oddNodes
    let bestMatching: Edge[] = [];
    let minMatchingWeight = Infinity;

    const findMatchings = (unmatched: Node[], currentMatching: Edge[], currentWeight: number) => {
        if (unmatched.length === 0) {
            if (currentWeight < minMatchingWeight) {
                minMatchingWeight = currentWeight;
                bestMatching = [...currentMatching];
            }
            return;
        }

        const u = unmatched[0];
        for (let i = 1; i < unmatched.length; i++) {
            const v = unmatched[i];
            const d = dist(u, v);
            const nextUnmatched = unmatched.filter((_, idx) => idx !== 0 && idx !== i);
            currentMatching.push({ source: u.id, target: v.id, weight: Math.round(d), id: `match-${u.id}-${v.id}` });
            findMatchings(nextUnmatched, currentMatching, currentWeight + d);
            currentMatching.pop();
        }
    };

    findMatchings(oddNodes, [], 0);

    const matchEdges = bestMatching.map((e, idx) => {
        const hasForwardMst = mstEdges.some(m => m.source === e.source && m.target === e.target);
        if (hasForwardMst) {
            return { ...e, source: e.target, target: e.source, id: `matching-${idx}` };
        }
        return { ...e, id: `matching-${idx}` };
    });
    const eulerianGraphEdges = [...mstEdges, ...matchEdges];

    const stepDouble = createBaseStep(2, "Add a minimum weight perfect matching of all vertices of odd degree");
    stepDouble.metricTspGraphState!.edges = [...eulerianGraphEdges];
    steps.push(stepDouble);

    // 3. Find Euler Tour 
    const adj = new Map<string, Edge[]>();
    nodes.forEach(n => adj.set(n.id, []));

    const edgesCopy = eulerianGraphEdges.map(e => ({ ...e }));

    // For Euler tour finding in undirected multigraph, populate adjacency list for both directions initially
    // Since we need to trace a path and remove edges as we use them
    const adjUnused = new Map<string, { target: string, edge: Edge }[]>();
    nodes.forEach(n => adjUnused.set(n.id, []));

    edgesCopy.forEach(e => {
        adjUnused.get(e.source)!.push({ target: e.target, edge: e });
        adjUnused.get(e.target)!.push({ target: e.source, edge: e });
    });

    const eulerTourNodes: string[] = [];
    const stack = [nodes[0].id];

    // Track used edge IDs to avoid using the same undirected edge twice
    const usedEdges = new Set<string>();

    while (stack.length > 0) {
        const u = stack[stack.length - 1];
        const neighbors = adjUnused.get(u)!;

        let foundUnused = false;
        while (neighbors.length > 0) {
            const { target, edge } = neighbors.pop()!;
            if (!usedEdges.has(edge.id!)) {
                usedEdges.add(edge.id!);
                stack.push(target);
                foundUnused = true;
                break;
            }
        }

        if (!foundUnused) {
            eulerTourNodes.push(stack.pop()!);
        }
    }
    eulerTourNodes.reverse();

    const eulerEdges: Edge[] = [];
    for (let i = 0; i < eulerTourNodes.length - 1; i++) {
        const uId = eulerTourNodes[i];
        const vId = eulerTourNodes[i + 1];
        const u = nodes.find(n => n.id === uId)!;
        const v = nodes.find(n => n.id === vId)!;
        eulerEdges.push({ source: uId, target: vId, weight: Math.round(dist(u, v)), id: `euler-${i}` });
    }

    const stepEuler = createBaseStep(3, "Find an Euler Tour in the multigraph");
    stepEuler.metricTspGraphState!.edges = [...eulerEdges];
    stepEuler.metricTspGraphState!.isDirected = true;
    steps.push(stepEuler);

    const stepStartWalk = createBaseStep(4, "Walk along Euler tour and use shortcuts to skip visited nodes");
    stepStartWalk.metricTspGraphState!.edges = [...eulerEdges];
    stepStartWalk.metricTspGraphState!.isDirected = true;
    steps.push(stepStartWalk);

    const tspPath: string[] = [];
    const visitedTsp = new Set<string>();
    const currentTspEdges: Edge[] = [];

    for (let i = 0; i < eulerTourNodes.length; i++) {
        const vId = eulerTourNodes[i];
        const nodeLabel = nodes.find(n => n.id === vId)?.label;

        const stepGetNode = createBaseStep(5, `Consider next node in Euler Tour: Node ${nodeLabel}`);
        stepGetNode.currentNodeId = vId;
        stepGetNode.metricTspGraphState!.edges = [...eulerEdges, ...currentTspEdges];
        stepGetNode.metricTspGraphState!.isDirected = true;
        stepGetNode.processedSet = Array.from(visitedTsp);
        steps.push(stepGetNode);

        const stepCheck = createBaseStep(6, `Is Node ${nodeLabel} already visited?`);
        stepCheck.currentNodeId = vId;
        stepCheck.metricTspGraphState!.edges = [...eulerEdges, ...currentTspEdges];
        stepCheck.metricTspGraphState!.isDirected = true;
        stepCheck.processedSet = Array.from(visitedTsp);
        steps.push(stepCheck);

        if (!visitedTsp.has(vId)) {
            visitedTsp.add(vId);

            if (tspPath.length > 0) {
                const uId = tspPath[tspPath.length - 1];
                const u = nodes.find(n => n.id === uId)!;
                const v = nodes.find(n => n.id === vId)!;
                currentTspEdges.push({ source: uId, target: vId, weight: Math.round(dist(u, v)), id: `tsp-${tspPath.length}` });
            }
            tspPath.push(vId);

            const stepAdd = createBaseStep(7, `Add Node ${nodeLabel} to the TSP path`);
            stepAdd.currentNodeId = vId;
            stepAdd.metricTspGraphState!.edges = [...eulerEdges, ...currentTspEdges];
            stepAdd.metricTspGraphState!.isDirected = true;
            stepAdd.processedSet = Array.from(visitedTsp);
            stepAdd.activeEdge = currentTspEdges.length > 0 ? { ...currentTspEdges[currentTspEdges.length - 1] } : null;
            steps.push(stepAdd);

            const stepMark = createBaseStep(8, `Mark Node ${nodeLabel} as visited`);
            stepMark.currentNodeId = vId;
            stepMark.processedSet = Array.from(visitedTsp);
            stepMark.metricTspGraphState!.edges = [...eulerEdges, ...currentTspEdges];
            stepMark.metricTspGraphState!.isDirected = true;
            steps.push(stepMark);
        } else {
            const stepShortcut = createBaseStep(9, `Node ${nodeLabel} is already visited. Shortcut past it.`);
            stepShortcut.currentNodeId = vId;
            stepShortcut.processedSet = Array.from(visitedTsp);
            stepShortcut.metricTspGraphState!.edges = [...eulerEdges, ...currentTspEdges];
            stepShortcut.metricTspGraphState!.isDirected = true;
            steps.push(stepShortcut);
        }
    }

    const firstNode = tspPath[0];
    const lastNode = tspPath[tspPath.length - 1];
    if (firstNode !== lastNode) {
        const u = nodes.find(n => n.id === lastNode)!;
        const v = nodes.find(n => n.id === firstNode)!;
        currentTspEdges.push({ source: lastNode, target: firstNode, weight: Math.round(dist(u, v)), id: `tsp-${tspPath.length}` });

        const stepClose = createBaseStep(0, "Return to the start node to complete the TSP tour");
        stepClose.processedSet = Array.from(visitedTsp);
        stepClose.metricTspGraphState!.edges = [...eulerEdges, ...currentTspEdges];
        stepClose.metricTspGraphState!.isDirected = true;
        stepClose.activeEdge = { ...currentTspEdges[currentTspEdges.length - 1] };
        steps.push(stepClose);
    }

    const finalStep = createBaseStep(0, "Algorithm Complete. The 1.5-Approximation Metric TSP tour is found.");
    finalStep.processedSet = Array.from(visitedTsp);
    finalStep.metricTspGraphState!.edges = [...currentTspEdges];
    finalStep.metricTspGraphState!.isDirected = true;
    steps.push(finalStep);

    return steps;
};
