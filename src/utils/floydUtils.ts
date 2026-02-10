
import { Graph, Node, Edge, AlgorithmStep } from '@/types/graph';

// Generate a graph for Floyd's Cycle Finding optimization
export const generateFindingDuplicatesFloydGraph = (): Graph => {
    // 1. Create array A with values 1..14, size 15.
    // One value appears twice. All others once.
    const values = Array.from({ length: 14 }, (_, i) => i + 1);
    // Pick a duplicate value
    const duplicateValue = Math.floor(Math.random() * 14) + 1;
    values.push(duplicateValue);

    // Shuffle the array to randomize positions
    for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
    }

    // Now we have an array A where A[idx] is the value at index idx.
    // However, the problem statement says A has length 15, indices 1..15.
    // Values are 1..14.
    // Graph nodes are indices 1..15.
    // Build adjacency for easy traversal
    // values array is 0-indexed, so values[i-1] is the target for node i
    const adj: number[] = new Array(16).fill(0);
    for (let i = 1; i <= 15; i++) {
        // values is 0-indexed, so values[i-1] is the value at index i (1-based)
        adj[i] = values[i - 1];
    }

    // Trace path from n=15
    const visited = new Map<number, number>(); // node -> index in path
    const path: number[] = [];
    const n = 15;
    let curr = n;

    // Trace until cycle detected
    while (!visited.has(curr)) {
        visited.set(curr, path.length);
        path.push(curr);
        curr = adj[curr];
    }

    // Cycle detected at 'curr'
    const cycleStartIndex = visited.get(curr)!;
    const tail = path.slice(0, cycleStartIndex);
    const cycle = path.slice(cycleStartIndex);

    // Identify unreachable nodes
    const unreachable: number[] = [];
    const visitedSet = new Set(path);
    for (let i = 1; i <= 15; i++) {
        if (!visitedSet.has(i)) unreachable.push(i);
    }

    const nodes: Node[] = [];

    // Layout parameters
    const cycleCenterX = 450;
    const cycleCenterY = 160;
    const cycleRadius = 72;

    // Layout Cycle
    // Position cycle[0] (entry point) at angle PI (left), ensuring tail connects smoothly
    const angleOffset = Math.PI;

    cycle.forEach((nodeId, idx) => {
        // Clockwise arrangement: angle increases
        const angle = angleOffset + (idx / cycle.length) * 2 * Math.PI;

        nodes.push({
            id: nodeId.toString(),
            x: cycleCenterX + cycleRadius * Math.cos(angle),
            y: cycleCenterY + cycleRadius * Math.sin(angle),
            label: nodeId.toString()
        });
    });

    // Layout Tail
    // Tail connects to cycle[0]. Start far left and move towards cycle.
    const tailStartX = 30;
    const tailEndX = cycleCenterX - cycleRadius - 40;
    const tailY = cycleCenterY;

    tail.forEach((nodeId, idx) => {
        let x = tailStartX;
        if (tail.length > 1) {
            x = tailStartX + (idx / (tail.length - 1)) * (tailEndX - tailStartX);
        } else {
            x = tailEndX; // Single node tail
        }

        nodes.push({
            id: nodeId.toString(),
            x: x,
            y: tailY,
            label: nodeId.toString()
        });
    });

    // Layout Unreachable Nodes
    // Use a mini force-directed simulation to cluster connected unreachable nodes
    // Bounding Box
    const boxX = 30;
    const boxY = 230;
    const boxW = 300;
    const boxH = 100;

    // 1. Initialize random positions
    const unreachNodes = unreachable.map(id => ({
        id,
        x: boxX + Math.random() * boxW,
        y: boxY + Math.random() * boxH,
        vx: 0,
        vy: 0
    }));

    // 2. Simulation Loop
    const ITERATIONS = 300;
    const K_REPULSE = 5000;
    const K_ATTRACT = 0.05;
    const DAMPING = 0.5;
    const MAX_SPEED = 10;

    for (let iter = 0; iter < ITERATIONS; iter++) {
        // Reset forces
        const fx = new Array(unreachNodes.length).fill(0);
        const fy = new Array(unreachNodes.length).fill(0);

        // Repulsion (All pairs)
        for (let i = 0; i < unreachNodes.length; i++) {
            for (let j = i + 1; j < unreachNodes.length; j++) {
                const dx = unreachNodes[i].x - unreachNodes[j].x;
                const dy = unreachNodes[i].y - unreachNodes[j].y;
                const distSq = dx * dx + dy * dy || 1; // Avoid div 0
                const dist = Math.sqrt(distSq);

                if (dist < 80) { // Only repel if close
                    const f = K_REPULSE / distSq;
                    const fX = (dx / dist) * f;
                    const fY = (dy / dist) * f;

                    fx[i] += fX;
                    fy[i] += fY;
                    fx[j] -= fX;
                    fy[j] -= fY;
                }
            }
        }

        // Attraction (Edges)
        // Since we don't have explicit edges list for unreachable easily available, check adj
        for (let i = 0; i < unreachNodes.length; i++) {
            const u = unreachNodes[i];
            const targetId = adj[u.id]; // Target node ID
            // Find target in unreachNodes
            const targetIdx = unreachNodes.findIndex(n => n.id === targetId);

            if (targetIdx !== -1) {
                const v = unreachNodes[targetIdx];
                const dx = v.x - u.x;
                const dy = v.y - u.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                // Spring force
                const f = (dist - 40) * K_ATTRACT; // Rest length 40
                const fX = (dx / dist) * f;
                const fY = (dy / dist) * f;

                fx[i] += fX;
                fy[i] += fY;
                fx[targetIdx] -= fX;
                fy[targetIdx] -= fY;
            }
        }

        // Update Position
        for (let i = 0; i < unreachNodes.length; i++) {
            unreachNodes[i].vx = (unreachNodes[i].vx + fx[i]) * DAMPING;
            unreachNodes[i].vy = (unreachNodes[i].vy + fy[i]) * DAMPING;

            // Limit speed
            const speed = Math.sqrt(unreachNodes[i].vx ** 2 + unreachNodes[i].vy ** 2);
            if (speed > MAX_SPEED) {
                unreachNodes[i].vx = (unreachNodes[i].vx / speed) * MAX_SPEED;
                unreachNodes[i].vy = (unreachNodes[i].vy / speed) * MAX_SPEED;
            }

            unreachNodes[i].x += unreachNodes[i].vx;
            unreachNodes[i].y += unreachNodes[i].vy;

            // Clamp to box
            unreachNodes[i].x = Math.max(boxX, Math.min(boxX + boxW, unreachNodes[i].x));
            unreachNodes[i].y = Math.max(boxY, Math.min(boxY + boxH, unreachNodes[i].y));
        }
    }

    unreachNodes.forEach(n => {
        nodes.push({
            id: n.id.toString(),
            x: n.x,
            y: n.y,
            label: n.id.toString()
        });
    });

    const edges: Edge[] = [];
    for (let i = 1; i <= 15; i++) {
        const target = adj[i];
        edges.push({
            source: i.toString(),
            target: target.toString(),
            weight: 1,
            id: `${i}-${target}`
        });
    }

    return {
        nodes,
        edges,
        isDirected: true
    };
};

export const calculateFindingDuplicatesFloydSteps = (graph: Graph): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const pushStep = (step: Partial<AlgorithmStep>) => {
        steps.push({
            stepId: steps.length,
            description: '',
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
            ...step
        } as AlgorithmStep);
    };

    // Reconstruct array A from graph
    // Node i has edge to target. target is A[i].
    // Nodes are "1" to "15".
    const a = new Array(16).fill(0); // 1-based index
    graph.edges.forEach(e => {
        const u = parseInt(e.source);
        const v = parseInt(e.target);
        a[u] = v;
    });

    const n = 15;

    // Initial State
    pushStep({
        lineNumber: 0, // Before start
        description: "Initialize variables. Start from n = 15.",
        findingDuplicatesFloyd: {
            igel: 0,
            hase: 0,
            array: a.slice(1), // Store 1..15 for display
            phase: 1
        }
    });

    // Phase 1: Cycle Detection
    // Line 1: igel = a[n]; hase = a[a[n]]; i := 1
    let igel = a[n];
    let hase = a[a[n]];
    let i = 1;

    pushStep({
        lineNumber: 1,
        description: `Set igel = a[${n}] = ${igel}, hase = a[a[${n}]] = ${hase}, i = 1`,
        currentNodeId: igel.toString(),
        currentNeighborId: hase.toString(),
        findingDuplicatesFloyd: {
            igel, hase, i, array: a.slice(1), phase: 1
        }
    });

    // Loop
    while (igel !== hase) {
        // Condition check
        pushStep({
            lineNumber: 2,
            description: `Check igel (${igel}) ≠ hase (${hase}). True.`,
            currentNodeId: igel.toString(),
            currentNeighborId: hase.toString(),
            findingDuplicatesFloyd: {
                igel, hase, i, array: a.slice(1), phase: 1
            }
        });

        // Update: igel = a[igel]; hase = a[a[hase]]; i := i + 1
        const oldIgel = igel;
        const oldHase = hase;
        igel = a[igel];
        hase = a[a[hase]];
        i = i + 1;

        pushStep({
            lineNumber: 3,
            description: `Move igel to a[${oldIgel}] = ${igel}. Move hase to a[a[${oldHase}]] = ${hase}. Increment i to ${i}.`,
            currentNodeId: igel.toString(),
            currentNeighborId: hase.toString(),
            findingDuplicatesFloyd: {
                igel, hase, i, array: a.slice(1), phase: 1
            }
        });

        // Safety break
        if (steps.length > 100) break;
    }

    // Loop breakdown
    pushStep({
        lineNumber: 2,
        description: `Check igel (${igel}) ≠ hase (${hase}). False (Collision found!).`,
        currentNodeId: igel.toString(),
        currentNeighborId: hase.toString(),
        findingDuplicatesFloyd: {
            igel, hase, i, array: a.slice(1), phase: 1
        }
    });

    // Phase 2: Find Start
    // Line 4: hase = n
    hase = n;

    pushStep({
        lineNumber: 4,
        description: `Reset hase to n = ${n}. igel stays at ${igel}.`,
        currentNodeId: igel.toString(),
        currentNeighborId: hase.toString(),
        findingDuplicatesFloyd: {
            igel, hase, i, array: a.slice(1), phase: 2
        }
    });

    // Loop
    // Line 5: while (igel != hase)
    let ii = 0; // Temp var for i
    let jj = 0; // Temp var for j

    // Keep detecting
    while (igel !== hase) {
        pushStep({
            lineNumber: 5,
            description: `Check igel (${igel}) ≠ hase (${hase}). True.`,
            currentNodeId: igel.toString(),
            currentNeighborId: hase.toString(),
            findingDuplicatesFloyd: {
                igel, hase, i: ii, j: jj, array: a.slice(1), phase: 2
            }
        });

        // Line 6: i := igel; j := hase;
        ii = igel;
        jj = hase;

        pushStep({
            lineNumber: 6,
            description: `Set i = igel (${ii}), j = hase (${jj}).`,
            currentNodeId: igel.toString(),
            currentNeighborId: hase.toString(),
            findingDuplicatesFloyd: {
                igel, hase, i: ii, j: jj, array: a.slice(1), phase: 2
            }
        });

        // Line 7: igel = a[igel]; hase := a[hase];
        igel = a[igel];
        hase = a[hase];

        pushStep({
            lineNumber: 7,
            description: `Move igel to a[${ii}] = ${igel}. Move hase to a[${jj}] = ${hase}.`,
            currentNodeId: igel.toString(),
            currentNeighborId: hase.toString(),
            findingDuplicatesFloyd: {
                igel, hase, i: ii, j: jj, array: a.slice(1), phase: 2
            }
        });

        if (steps.length > 200) break;
    }

    // Loop finishes
    pushStep({
        lineNumber: 5,
        description: `Check igel (${igel}) ≠ hase (${hase}). False (Start of cycle found!).`,
        currentNodeId: igel.toString(),
        currentNeighborId: hase.toString(),
        findingDuplicatesFloyd: {
            igel, hase, i: ii, j: jj, array: a.slice(1), phase: 2
        }
    });

    // Line 8: return i, j
    // At this point, ii and jj are the nodes that point to the same node (igel/hase).
    // Wait, the pseudocode returns i, j.
    // In my logic above, i and j are updated inside the loop.
    // If the loop doesn't run even once (e.g. n is part of cycle? impossible given problem constraints), i and j are 0?
    // Given n=15 and values 1..14, n is never target, so n is not in cycle. Loop always runs at least once.

    pushStep({
        lineNumber: 8,
        description: `Return i=${ii}, j=${jj}. These are the two indices with duplicate value ${igel}.`,
        currentNodeId: null,
        currentNeighborId: null,
        findingDuplicatesFloyd: {
            igel, hase, i: ii, j: jj, array: a.slice(1), phase: 2
        }
    });

    return steps;
};
