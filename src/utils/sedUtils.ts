
import { Graph, Node, AlgorithmStep } from '@/types/graph';

interface Point {
    x: number;
    y: number;
}
interface Circle {
    x: number;
    y: number;
    r: number;
}

// Distance Helper
const dist = (p1: Point, p2: Point) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
const isInside = (p: Point, c: Circle) => dist(p, c) <= c.r + 1e-4;

// Welzl Helpers
const getTrivialCircle = (R: Point[]): Circle => {
    if (R.length === 0) return { x: 0, y: 0, r: 0 };
    if (R.length === 1) return { x: R[0].x, y: R[0].y, r: 0 };
    if (R.length === 2) {
        const p1 = R[0];
        const p2 = R[1];
        const x = (p1.x + p2.x) / 2;
        const y = (p1.y + p2.y) / 2;
        return { x, y, r: dist(p1, { x, y }) };
    }
    // R.length === 3
    const p1 = R[0];
    const p2 = R[1];
    const p3 = R[2];

    // Circumcircle of triangle logic
    const D = 2 * (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y));

    if (Math.abs(D) < 1e-9) {
        // Collinear -> Max dist pair defines circle
        const d12 = dist(p1, p2);
        const d13 = dist(p1, p3);
        const d23 = dist(p2, p3);
        if (d12 >= d13 && d12 >= d23) return getTrivialCircle([p1, p2]);
        if (d13 >= d12 && d13 >= d23) return getTrivialCircle([p1, p3]);
        return getTrivialCircle([p2, p3]);
    }

    const ux = ((p1.x ** 2 + p1.y ** 2) * (p2.y - p3.y) + (p2.x ** 2 + p2.y ** 2) * (p3.y - p1.y) + (p3.x ** 2 + p3.y ** 2) * (p1.y - p2.y)) / D;
    const uy = ((p1.x ** 2 + p1.y ** 2) * (p3.x - p2.x) + (p2.x ** 2 + p2.y ** 2) * (p1.x - p3.x) + (p3.x ** 2 + p3.y ** 2) * (p2.x - p1.x)) / D;
    return { x: ux, y: uy, r: dist({ x: ux, y: uy }, p1) };
};

const welzl = (P: Point[], R: Point[]): Circle => {
    if (P.length === 0 || R.length === 3) return getTrivialCircle(R);

    const idx = Math.floor(Math.random() * P.length);
    const p = P[idx];
    const P_sub = [...P.slice(0, idx), ...P.slice(idx + 1)]; // Remove p

    const D = welzl(P_sub, R);

    if (isInside(p, D)) return D;

    return welzl(P_sub, [...R, p]);
};

export const generateSmallestEnclosingDiskGraph = (width: number, height: number): Graph => {
    const nodes: Node[] = [];
    const padding = 50;
    const availW = width - 2 * padding;
    const availH = height - 2 * padding - 50;

    for (let i = 0; i < 40; i++) {
        nodes.push({
            id: `${i}`,
            x: padding + Math.random() * availW,
            y: padding + Math.random() * availH,
            label: `${i}`
        });
    }
    return { nodes, edges: [], isDirected: false };
};

export const calculateSmallestEnclosingDiskSteps = (graph: Graph): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    let stepId = 0;

    const pushStep = (line: number, desc: string, disk: Circle | null, Q: string[], outliers: string[], weights: Record<string, number>) => {
        steps.push({
            stepId: stepId++,
            lineNumber: line,
            description: desc,
            distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [], processedSet: [], currentNodeId: null, currentNeighborId: null, activeEdge: null,
            sedDisk: disk,
            sedSampleQ: Q,
            sedOutliers: outliers,
            pointWeights: { ...weights }
        });
    };

    // Initial Weights
    const weights: Record<string, number> = {};
    graph.nodes.forEach(n => weights[n.id] = 1);

    pushStep(1, "Initialize P' with weights = 1", null, [], [], weights);

    let iterations = 0;
    const MAX_ITERATIONS = 100;

    while (iterations < MAX_ITERATIONS) {
        iterations++;

        // Sample Q (|Q|=11) based on weights
        const Q_ids: string[] = [];
        const tempWeights = { ...weights };

        // Weighted Sampling Without Replacement
        for (let k = 0; k < 11; k++) {
            const totalWeight = Object.values(tempWeights).reduce((a, b) => a + b, 0);
            if (totalWeight <= 0) break;

            let r = Math.random() * totalWeight;
            let selectedId = '';

            for (const [id, w] of Object.entries(tempWeights)) {
                r -= w;
                if (r <= 0) {
                    selectedId = id;
                    break;
                }
            }

            // Float precision fallback
            if (!selectedId && Object.keys(tempWeights).length > 0) {
                selectedId = Object.keys(tempWeights)[0];
            }

            if (selectedId) {
                Q_ids.push(selectedId);
                delete tempWeights[selectedId];
            }
        }

        pushStep(3, `Sampled Q (|Q|=${Q_ids.length}) based on weights`, null, Q_ids, [], weights);

        // Compute C(Q)
        const pointsQ = Q_ids.map(id => {
            const n = graph.nodes.find(node => node.id === id)!;
            return { x: n.x, y: n.y };
        });

        // Welzl on Q
        const disk = welzl(pointsQ, []);

        pushStep(4, "Determined Minimal Enclosing Disk C(Q)", disk, Q_ids, [], weights);

        // Check P inside C(Q)
        const outliers: string[] = [];
        graph.nodes.forEach(n => {
            if (!isInside({ x: n.x, y: n.y }, disk)) {
                outliers.push(n.id);
            }
        });

        if (outliers.length === 0) {
            pushStep(5, "All points inside C(Q). Done!", disk, Q_ids, [], weights);
            break;
        } else {
            pushStep(6, `Found ${outliers.length} outliers outside C(Q). Doubling their weights.`, disk, Q_ids, outliers, weights);

            // Double weights
            outliers.forEach(id => {
                weights[id] *= 2;
            });

            pushStep(2, "Weights updated. Repeating...", disk, Q_ids, outliers, weights);
        }
    }

    if (iterations >= MAX_ITERATIONS) {
        pushStep(2, "Max iterations reached (Safety Stop).", null, [], [], weights);
    }

    return steps;
};
