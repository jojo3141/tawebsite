// Helper: Find augmenting paths using BFS (returns set S of disjoint paths or null)
const findAugmentingPaths = (): string[][] | null => {
    const visited = new Set<string>();
    const layers: Record<number, string[]> = {};
    const parent: Record<string, string | null> = {};

    // Line 11: L0 := {unüberdeckte Knoten in A}
    layers[0] = partitionA.filter(node => !matchedNodes.has(node));
    pushStep(11, `L₀ := {${layers[0].join(', ')}}`, layers, null, [], visited);

    // Line 12: Mark all nodes from L0 as visited
    layers[0].forEach(node => {
        visited.add(node);
        parent[node] = null;
    });
    pushStep(12, `Markiere alle Knoten aus L₀ als besucht`, layers, null, [], visited);

    // Line 13: if L0 = ∅ then return ∅
    if (layers[0].length === 0) {
        pushStep(13, `L₀ = ∅, return ∅ (M ist maximal)`, layers, null, [], visited);
        return null;
    }

    // Line 14: for i = 1 to n do
    let foundAugmentingPath = false;
    let targetNodes: string[] = [];

    for (let i = 1; i <= graph.nodes.length && !foundAugmentingPath; i++) {
        layers[i] = [];

        pushStep(14, `Iteration i = ${i}`, layers, null, [], visited);

        // Line 15-18: Build layer i
        const isOdd = i % 2 === 1;

        if (isOdd) {
            // Line 16: Li := {unbesuchte Nachbarn von Li-1 via E \ M}
            pushStep(15, `i = ${i} ist ungerade`, layers, null, [], visited);

            for (const node of layers[i - 1]) {
                const neighbors = getNonMatchingNeighbors(node);
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                        layers[i].push(neighbor);
                        visited.add(neighbor);
                        parent[neighbor] = node;
                    }
                }
            }
            pushStep(16, `Lᵢ := {unbesuchte Nachbarn von Lᵢ₋₁ via E \\ M} = {${layers[i].join(', ')}}`, layers, null, [], visited);
        } else {
            // Line 18: Li := {unbesuchte Nachbarn von Li-1 via M}
            pushStep(17, `i = ${i} ist gerade (else)`, layers, null, [], visited);

            for (const node of layers[i - 1]) {
                const neighbors = getMatchingNeighbors(node);
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                        layers[i].push(neighbor);
                        visited.add(neighbor);
                        parent[neighbor] = node;
                    }
                }
            }
            pushStep(18, `Lᵢ := {unbesuchte Nachbarn von Lᵢ₋₁ via M} = {${layers[i].join(', ')}}`, layers, null, [], visited);
        }

        // Line 19: Mark all nodes from Li as visited
        pushStep(19, `Markiere alle Knoten aus Lᵢ als besucht`, layers, null, [], visited);

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
            pushStep(28, `Lᵢ = ∅, return ∅ (M ist bereits maximal)`, layers, null, [], visited);
            return null;
        }

        if (foundAugmentingPath) break;
    }

    if (!foundAugmentingPath || targetNodes.length === 0) {
        pushStep(28, `Kein augmentierender Pfad gefunden, return ∅`, layers, null, [], visited);
        return null;
    }

    // Line 21: S := ∅
    pushStep(21, `S := ∅`, layers, null, [], visited);
    const pathSet: string[][] = [];
    const usedNodes = new Set<string>();

    // Line 22-26: Find multiple vertex-disjoint paths
    pushStep(22, `for all unüberdeckte v ∈ Lᵢ do`, layers, null, targetNodes, visited);

    for (const targetNode of targetNodes) {
        // Line 23: Check if node not in used paths
        if (usedNodes.has(targetNode)) {
            continue;
        }

        pushStep(23, `Prüfe Knoten ${targetNode}: nicht in verwendeten Pfaden`, layers, null, [targetNode], visited);

        // Line 24: Find path P from L0 to v through backtracking
        pushStep(24, `Finde Pfad P von L₀ nach ${targetNode} durch backtracking`, layers, null, [targetNode], visited);

        const path: string[] = [];
        let current: string | null = targetNode;
        let pathIsDisjoint = true;

        // Construct path backwards
        while (current !== null) {
            if (usedNodes.has(current)) {
                pathIsDisjoint = false;
                break;
            }
            path.unshift(current);
            current = parent[current] || null;
        }

        if (pathIsDisjoint) {
            // Line 25: S := S ∪ {P}
            pathSet.push(path);
            pushStep(25, `S := S ∪ {P}, Pfad: ${path.join(' → ')}`, layers, null, path, visited);

            // Line 26: Mark nodes in P as used
            path.forEach(node => usedNodes.add(node));
            pushStep(26, `Markiere Knoten in P als verwendet`, layers, null, path, visited);
        }
    }

    // Line 27: return S
    pushStep(27, `return S mit |S| = ${pathSet.length} Pfaden`, layers, null, [], visited);
    return pathSet.length > 0 ? pathSet : null;
};
