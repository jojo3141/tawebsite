
import { Graph, Node, AlgorithmStep } from '@/types/graph';

// Geometric primitives
interface Point {
    x: number;
    y: number;
    id: string;
}

// Helper: Cross Product (z-component)
// Returns > 0 if p2 is to the right of p0->p1 (Clockwise in screen coords)
// Returns < 0 if p2 is to the left of p0->p1
// Returns 0 if collinear
const crossProduct = (p0: Point, p1: Point, p2: Point): number => {
    return (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x);
};


export const generateJarvisWrapGraph = (width: number, height: number): Graph => {
    const nodes: Node[] = [];
    const padding = 50;
    const availW = width - 2 * padding;
    const availH = height - 2 * padding - 40; // Use full height as no special restriction mentioned

    let attempts = 0;
    const MAX_ATTEMPTS = 1000;

    while (nodes.length < 10 && attempts < MAX_ATTEMPTS) {
        attempts++;
        const x = padding + Math.random() * availW;
        const y = padding + Math.random() * availH;

        // Check collision
        let tooClose = false;
        for (const n of nodes) {
            const dx = n.x - x;
            const dy = n.y - y;
            if (dx * dx + dy * dy < 400) { // 20^2 = 400
                tooClose = true;
                break;
            }
        }

        if (!tooClose) {
            nodes.push({
                id: `${nodes.length}`, // 0, 1, 2...
                x,
                y,
                label: `${nodes.length}`
            });
        }
    }

    return { nodes, edges: [], isDirected: false };
};

export const calculateJarvisWrapSteps = (graph: Graph): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    let stepId = 0;

    // Helper to resolve point by ID
    const getPoint = (id: string): Point => {
        const n = graph.nodes.find(node => node.id === id)!;
        return { x: n.x, y: n.y, id: n.id };
    };

    const pushStep = (line: number, desc: string, hull: string[], current: string | undefined, next: string | undefined, checking: string | undefined, scanLine: { from: string, to: string } | undefined) => {
        // Build hull lines for visualization
        const hullLines: { from: string, to: string }[] = [];
        for (let i = 0; i < hull.length - 1; i++) {
            hullLines.push({ from: hull[i], to: hull[i + 1] });
        }
        // If hull has >1 points, it connects segments.
        // The last point connects to current `next`? No, hull is just the fixed list.

        steps.push({
            stepId: stepId++,
            lineNumber: line,
            description: desc,
            distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [], processedSet: [], currentNodeId: null, currentNeighborId: null, activeEdge: null,
            // Jarvis specific
            hull: [...hull],
            currentPoint: current,
            nextPointCandidate: next,
            checkingPoint: checking,
            hullLines: hullLines,
            scanLine: scanLine,
            // SED cleanup (if any generic step used, ensure fields are reset? Interface handles optionals)
        });
    };

    const points = graph.nodes.map(n => getPoint(n.id));
    const hull: string[] = [];

    // Line 1: JARVIS_WRAP(P) (Implicit)
    // Line 2: h <- 0
    pushStep(2, "Initialize algorithm. h = 0.", [], undefined, undefined, undefined, undefined);

    // Line 3: Min X
    // Sort logic to find min x. Pseudocode says "Punkt mit kleinster x-Koordinate".
    // If tie, lowest y? Standard practice.
    points.sort((a, b) => a.x - b.x || a.y - b.y);
    const p_start = points[0];
    const p_now_id = p_start.id;

    pushStep(3, `Found starting point P${p_now_id} (Smallest X)`, [], p_now_id, undefined, undefined, undefined);

    const currentP = getPoint(p_now_id);
    let h = 0;

    // We add current point to hull list implicitly as we traverse?
    // Pseudocode: return (q0, q1... qh-1). 
    // And qh <- p_now.
    // So hull stores the points found.
    // Line 4: Repeat

    // We maintain `currentP` which corresponds to `p_now` at start of loop.
    // But `p_now` changes in loop.

    // Using a loop variable `curr` for `p_now`.
    let curr = currentP;
    const startId = p_start.id;

    // Infinite loop protection
    let loopCount = 0;

    while (true) {
        if (loopCount++ > 100) break; // Safety

        // Line 4: Repeat (Start of loop)
        // Line 5: q_h <- p_now.
        // "q_h" is the h-th point of the hull.
        hull.push(curr.id);
        pushStep(5, `Added P${curr.id} to hull as q_${h}`, hull, curr.id, undefined, undefined, undefined);

        // Line 6: p_now <- FIND_NEXT(q_h)
        // Call FIND_NEXT
        pushStep(6, "Calling FIND_NEXT to find the next hull point", hull, curr.id, undefined, undefined, undefined);

        // FIND_NEXT logic (inlined for step tracking)
        // Arg `q` is `curr`.
        const q = curr;

        // Line 11: FIND_NEXT(q)
        pushStep(11, `FIND_NEXT(P${q.id})`, hull, q.id, undefined, undefined, undefined);

        // Line 12: Choose p0 in P\{q} arbitrarily
        // We pick the first point that is not q. Simple.
        // Or pick random. "Arbitrarily" usually implies just pick one to init.
        // Using index 0 of points array (if not q), else index 1.
        let p0 = points[0];
        if (p0.id === q.id) {
            p0 = points[1];
            // If only 1 point? 10 pts guaranteed.
        }

        pushStep(12, `Arbitrarily picked candidate P${p0.id}`, hull, q.id, p0.id, undefined, { from: q.id, to: p0.id });

        // Line 13: q_next <- p0
        let q_next = p0;
        pushStep(13, `Initialized q_next = P${p0.id}`, hull, q.id, q_next.id, undefined, { from: q.id, to: q_next.id });

        // Line 14: for all p in P \{q, p0}
        pushStep(14, "Iterating through all other points...", hull, q.id, q_next.id, undefined, { from: q.id, to: q_next.id });

        const searchList = points.filter(p => p.id !== q.id && p.id !== p0.id);

        // Also need to check p0? Code says P\{q, p0}.
        // But what if p0 IS the best?
        // Actually, we iterate P\{q, p0} to *update* q_next.
        // q_next starts as p0.
        // So effectively we check all P\{q}.

        for (const p of searchList) {
            // Line 15: If p is right of q -> q_next
            // Create scan line specific for checking p?
            // "if p is right of q->q_next".
            // Visual: line q->q_next. Point p.
            pushStep(15, `Checking P${p.id} against current best P${q_next.id}`, hull, q.id, q_next.id, p.id, { from: q.id, to: q_next.id });

            const cp = crossProduct(q, q_next, p);

            // Check Right (> 0)
            if (cp > 0) {
                // Found a point more to the right!
                pushStep(15, `P${p.id} is to the right! Updating q_next.`, hull, q.id, q_next.id, p.id, { from: q.id, to: p.id });
                q_next = p;
            } else if (cp === 0) {
                // Collinear.
                // If collinear, usually pick the farthest one?
                // Pseudocode doesn't specify.
                // "strict right" implies ignore?
                // But strictly, if we have A->B and C is on line.
                // If C is farther than B?
                // Standard Jarvis usually takes farthest to reduce edge count.
                // But user said "The algorithm should follow the pseudocode strictly".
                // Pseudocode: "if p rechts von...".
                // Strict "Right" usually means CP > 0.
                // CP = 0 is "On line". Not Right.
                // So we don't update.
                // BUT, if q_next was p0 (arbitrary near point), and real hull point is Far collinear point.
                // If we stick with p0, we might miss the far point?
                // Wait. If collinear: q -> p0 -> p.
                // If we pick p0. Next iteration from p0 will find p?
                // If p0 is BETWEEN q and p.
                // Yes, p0 is hull vertex? No, it's on edge.
                // Convex Hull should strictly be extreme points.
                // If we include collinear points, it's valid but redundant?
                // Pseudocode is ambiguous.
                // I will assume Strict Right (CP > 0). 
                // If CP==0, ignore (unless we want to robustly handle it).
                // User said "Strictly".
            }
        }

        // Line 16: Return q_next
        pushStep(16, `Found next hull point P${q_next.id}`, hull, q.id, q_next.id, undefined, { from: q.id, to: q_next.id });

        // Back to Main
        // Line 6: p_now <- q_next
        curr = q_next;
        // Step desc in main loop for update?
        // Line 7: h <- h + 1
        h++;

        pushStep(7, `Updated p_now to P${curr.id}. Incremented h to ${h}.`, hull, q.id, curr.id, undefined, { from: q.id, to: curr.id });

        // Line 8: until p_now = q0
        // q0 is hull[0], aka startId.
        if (curr.id === startId) {
            pushStep(8, "p_now equals start point q0. Hull closed.", hull, curr.id, undefined, undefined, undefined);
            break;
        } else {
            pushStep(8, "p_now != q0. Continuing loop.", hull, curr.id, undefined, undefined, undefined);
        }
    }

    // Line 9: return (q0...qh-1)
    // We already have hull.
    // Need to close loop visually?
    // hullLines draws segments between hull points.
    // The last segment q_{h-1} -> q_0 is needed.
    // In our loop, we didn't push the LAST curr (which is q0) to hull array?
    // We break when curr === startId.
    // So hull contains q0...qh.
    // The line q_{h} -> q_0 needs to be drawn.
    // I can append startId to hull for visualization? 
    // Or handle in hullLines logic?
    // Algorithm returns q0..qh-1.
    // Visually we want the polygon.
    // I'll push startId to hull array at the end for full loop visualization step.

    hull.push(startId);
    pushStep(9, "Hull computation complete.", hull, undefined, undefined, undefined, undefined);

    return steps;
};

export const calculateLocalRepairSteps = (graph: Graph): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    let stepId = 0;

    const getPoint = (id: string): Point => {
        const n = graph.nodes.find(node => node.id === id)!;
        return { x: n.x, y: n.y, id: n.id };
    };

    const points = graph.nodes.map(n => getPoint(n.id));
    // Sort by X (primary) and Y (secondary)
    points.sort((a, b) => a.x - b.x || a.y - b.y);
    const n = points.length;

    // Precompute sorted path lines
    const sortedLines: { from: string, to: string }[] = [];
    for (let i = 0; i < n - 1; i++) {
        sortedLines.push({ from: points[i].id, to: points[i + 1].id });
    }

    const pushStep = (line: number, desc: string, hull: string[], current: string | undefined, checking: string | undefined, scanLine: { from: string, to: string } | undefined) => {
        const hullLines: { from: string, to: string }[] = [];
        for (let i = 0; i < hull.length - 1; i++) {
            hullLines.push({ from: hull[i], to: hull[i + 1] });
        }

        steps.push({
            stepId: stepId++,
            lineNumber: line,
            description: desc,
            distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [], processedSet: [], currentNodeId: null, currentNeighborId: null, activeEdge: null,
            hull: [...hull],
            currentPoint: current,
            checkingPoint: checking,
            hullLines: hullLines,
            scanLine: scanLine,
            localRepairSortedPath: sortedLines,
        });
    };



    // q array (stores Points directly, or we track indices/IDs). 
    // Usually q stores points.
    const q: Point[] = new Array(2 * n);
    let h = 0;
    const hullState: string[] = [];

    // Line 1: q_0 <- p_1 (points[0])
    q[0] = points[0];
    hullState.push(q[0].id);
    pushStep(1, `Initialize q_0 = P${points[0].id} (Smallest X)`, hullState, points[0].id, undefined, undefined);

    // Line 2: h <- 0
    h = 0;
    pushStep(2, `h = 0`, hullState, undefined, undefined, undefined);

    // Line 3: for i <- 2 to n (index 1 to n-1)
    for (let i = 1; i < n; i++) {
        const pi = points[i];
        pushStep(3, `Processing P${pi.id} (Lower Hull).`, hullState, pi.id, undefined, undefined);

        // Line 4: while h > 0 and q_h left of q_{h-1}p_i
        while (h > 0) {
            // Check cross product (q_{h-1}, p_i, q_h)
            // If < 0 => q_h is Left of Line(q_{h-1} -> p_i).
            // Meaning q_h creates a CONVEX angle? 
            // Wait. Lower hull uses Right Turns?
            // If we go P1 -> P2 -> P3. If P3 is "Left", it's "Concave Up".
            // Lower Hull needs to be Convex. So "Downwards".
            // So we allow Right Turns.
            // Left Turns (Concave) are removed.
            // So if isLeft, remove q_h.

            const isLeft = crossProduct(q[h - 1], pi, q[h]) < 0;

            pushStep(4, `Checking concavity at q_${h} (P${q[h].id})...`, hullState, pi.id, q[h].id, { from: q[h - 1].id, to: pi.id });

            if (!isLeft) break; // Is Right or Collinear -> Good.

            pushStep(4, `Found left turn! Removing q_${h}.`, hullState, pi.id, q[h].id, { from: q[h - 1].id, to: pi.id });

            // Line 5: h <- h - 1
            h--;
            hullState.pop();
            // Note: hullState reflects q0...qh.
            // If h decreased, hullState pop matches.
            pushStep(5, `h = ${h}. Removed point from hull.`, hullState, pi.id, undefined, undefined);
        }

        // Line 6: h <- h + 1
        h++;
        // Line 7: q_h <- p_i
        q[h] = pi;
        hullState.push(pi.id);
        pushStep(7, `Added P${pi.id} to hull. h=${h}.`, hullState, pi.id, undefined, undefined);
    }

    // Line 8: h' <- h
    // Note: hullState corresponds to q0...qh.
    const h_prime = h;
    pushStep(8, `Lower Hull Complete. h' = ${h_prime}`, hullState, undefined, undefined, undefined);

    // Line 9: for i <- n-1 downto 1. (index n-2 downto 0).
    // Note: Original P array has indices 1...n.
    // Index n-1 is Pn.
    // i goes from n-1 down to 1. Which is ALL except Pn?
    // Wait. "for i <- n-1 downto 1". Pn was processed in lower hull?
    // Yes.
    // So usually Monotone Chain processes n-2 down to 0.
    // Pseudocode range: "n-1 downto 1".
    // P indices: 1...n.
    // So P_{n-1} down to P_1.
    // My indices: 0...n-1.
    // So P[n-2] down to P[0].

    for (let i = n - 2; i >= 0; i--) {
        const pi = points[i];
        pushStep(9, `Processing P${pi.id} (Upper Hull).`, hullState, pi.id, undefined, undefined);

        // Line 10: while h > h' and q_h left of q_{h-1}p_i
        while (h > h_prime) {
            const isLeft = crossProduct(q[h - 1], pi, q[h]) < 0;

            pushStep(10, `Checking concavity at q_${h} (P${q[h].id})...`, hullState, pi.id, q[h].id, { from: q[h - 1].id, to: pi.id });

            if (!isLeft) break;

            pushStep(10, `Found left turn! Removing q_${h}.`, hullState, pi.id, q[h].id, { from: q[h - 1].id, to: pi.id });

            // Line 11: h <- h - 1
            h--;
            hullState.pop();
            pushStep(11, `h = ${h}. Removed point.`, hullState, pi.id, undefined, undefined);
        }

        // Line 12: h <- h + 1
        h++;

        // Line 13: q_h <- p_i
        q[h] = pi;
        hullState.push(pi.id);
        pushStep(13, `Added P${pi.id} to hull. h=${h}.`, hullState, pi.id, undefined, undefined);
    }

    pushStep(14, "Upper Hull Complete. Algorithm Finished.", hullState, undefined, undefined, undefined);

    return steps;
};
