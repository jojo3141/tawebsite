
import { AlgorithmStep, Graph } from '@/types/graph';

// --- GENERATOR ---

export const generateFindingDuplicatesHashGraph = (): Graph => {
    // Not a real graph, but we satisfy the interface
    // We can store the dataset in the nodes for easy access if we wanted, 
    // but we'll primarily use the AlgorithmStep to carry the data.
    // We'll create dummy nodes just in case something tries to access them.
    return {
        nodes: [],
        edges: [],
        isDirected: false
    };
};

export const generateRandomDataset = (size: number = 10): string[] => {
    const chars = ['A', 'B', 'C', 'D'];
    const dataset: string[] = [];

    // Helper to generate random string
    const randomString = () => {
        return chars[Math.floor(Math.random() * chars.length)] +
            chars[Math.floor(Math.random() * chars.length)] +
            chars[Math.floor(Math.random() * chars.length)] +
            chars[Math.floor(Math.random() * chars.length)];
    };

    // Generate random strings
    for (let i = 0; i < size; i++) {
        dataset.push(randomString());
    }

    // Ensure at least one duplicate pair exists for demonstration
    // Pick a random index and copy it to another random index
    if (size > 1) {
        const idx1 = Math.floor(Math.random() * size);
        let idx2 = Math.floor(Math.random() * size);
        while (idx1 === idx2) idx2 = Math.floor(Math.random() * size);
        dataset[idx2] = dataset[idx1];
    }

    return dataset;
};

// --- ALGORITHM ---

// Randomized Hash Function Logic
// We use a universal hash function family: h(x) = ((ax + b) mod p) mod m
// Where x is the numerical value of the string, p is a large prime, m is the table size (31).
export const calculateFindingDuplicatesHashSteps = (): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    let stepCounter = 0;
    const dataset = generateRandomDataset(10);

    // 1. Pick a random hash function from the universal family
    // x = s[0]*128^3 + s[1]*128^2 + s[2]*128^1 + s[3]*128^0
    // We treat strings as base-128 numbers.
    // p = 10007 (large prime)
    // m = 31 (range [0, 30])
    const p = 10007;
    const m = 31;
    const a = Math.floor(Math.random() * (p - 1)) + 1; // Random a in [1, p-1]
    const b = Math.floor(Math.random() * p);           // Random b in [0, p-1]

    const computeHash = (s: string): number => {
        let val = 0;
        for (let i = 0; i < s.length; i++) {
            val = (val * 128 + s.charCodeAt(i)) % p;
        }
        return Number((BigInt(a) * BigInt(val) + BigInt(b)) % BigInt(p)) % m;
    };

    // Initial Step
    steps.push({
        stepId: stepCounter++,
        lineNumber: 0,
        description: `Chosen random hash function: h(s) = ((${a}·s + ${b}) mod ${p}) mod ${m}.`,
        distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [], processedSet: [],
        currentNodeId: null, currentNeighborId: null, activeEdge: null,
        findingDuplicatesDataset: dataset,
        findingDuplicatesTuples: [],
        findingDuplicatesActiveIndex: -1 // None
    });

    const tuples: { hash: number, originalIndex: number, originalString: string }[] = [];

    // 1. Compute Hashes
    // We can do this one by one or all at once. User said "For every element s...".
    // Let's do it one by one for visualization clarity.
    for (let i = 0; i < dataset.length; i++) {
        const s = dataset[i];
        const h = computeHash(s);
        tuples.push({ hash: h, originalIndex: i, originalString: s });

        steps.push({
            stepId: stepCounter++,
            lineNumber: [1, 2, 3], // "for each s", "compute h", "add to L"
            description: `Compute hash for "${s}": ${h}. Add (${h}, ${i}) to list.`,
            distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [], processedSet: [],
            currentNodeId: null, currentNeighborId: null, activeEdge: null,
            findingDuplicatesDataset: dataset,
            findingDuplicatesTuples: [...tuples], // Copy current state
            findingDuplicatesActiveIndex: i
        });
    }

    // 2. Sort
    steps.push({
        stepId: stepCounter++,
        lineNumber: 4,
        description: "Sort L by hash value.",
        distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [], processedSet: [],
        currentNodeId: null, currentNeighborId: null, activeEdge: null,
        findingDuplicatesDataset: dataset,
        findingDuplicatesTuples: [...tuples],
        findingDuplicatesActiveIndex: -1
    });

    tuples.sort((a, b) => a.hash - b.hash);

    steps.push({
        stepId: stepCounter++,
        lineNumber: 4,
        description: "List L sorted by hash value.",
        distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [], processedSet: [],
        currentNodeId: null, currentNeighborId: null, activeEdge: null,
        findingDuplicatesDataset: dataset,
        findingDuplicatesTuples: [...tuples],
        findingDuplicatesActiveIndex: -1
    });

    // 3. Scan for Duplicates
    const duplicates = new Set<number>(); // Store original indices of duplicates

    for (let k = 0; k < tuples.length - 1; k++) {
        const t1 = tuples[k];
        const t2 = tuples[k + 1];

        // Highlight the two we are comparing
        steps.push({
            stepId: stepCounter++,
            lineNumber: [5, 6],
            description: `Check consecutive tuples at indices ${k} and ${k + 1}. Hashes: ${t1.hash} vs ${t2.hash}.`,
            distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [],
            processedSet: Array.from(duplicates).map(String),
            currentNodeId: null, currentNeighborId: null, activeEdge: null,
            findingDuplicatesDataset: dataset,
            findingDuplicatesTuples: [...tuples],
            findingDuplicatesCompareIndices: [k, k + 1],

        });

        if (t1.hash === t2.hash) {
            // Collision
            steps.push({
                stepId: stepCounter++,
                lineNumber: 6,
                description: `Hash collision found (${t1.hash}). Proceeding to verify string content.`,
                distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [], processedSet: Array.from(duplicates).map(String),
                currentNodeId: null, currentNeighborId: null, activeEdge: null,
                findingDuplicatesDataset: dataset,
                findingDuplicatesTuples: [...tuples],
                findingDuplicatesCompareIndices: [k, k + 1]
            });

            // Explicit step for Line 7 (String Comparison)
            steps.push({
                stepId: stepCounter++,
                lineNumber: 7,
                description: `Comparing strings for indices ${t1.originalIndex} and ${t2.originalIndex}: "${t1.originalString}" vs "${t2.originalString}".`,
                distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [], processedSet: Array.from(duplicates).map(String),
                currentNodeId: null, currentNeighborId: null, activeEdge: null,
                findingDuplicatesDataset: dataset,
                findingDuplicatesTuples: [...tuples],
                findingDuplicatesCompareIndices: [k, k + 1]
            });

            if (t1.originalString === t2.originalString) {
                duplicates.add(t1.originalIndex);
                duplicates.add(t2.originalIndex);

                steps.push({
                    stepId: stepCounter++,
                    lineNumber: 8,
                    description: `Duplicate found! "${t1.originalString}" at indices ${t1.originalIndex} and ${t2.originalIndex}.`,
                    distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [],
                    processedSet: Array.from(duplicates).map(String),
                    currentNodeId: null, currentNeighborId: null, activeEdge: null,
                    findingDuplicatesDataset: dataset,
                    findingDuplicatesTuples: [...tuples],
                    findingDuplicatesCompareIndices: [k, k + 1]
                });
            } else {
                steps.push({
                    stepId: stepCounter++,
                    lineNumber: 7, // Stay on 7 to show result of check
                    description: `Strings do not match ("${t1.originalString}" != "${t2.originalString}"). False positive collision.`,
                    distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [],
                    processedSet: Array.from(duplicates).map(String),
                    currentNodeId: null, currentNeighborId: null, activeEdge: null,
                    findingDuplicatesDataset: dataset,
                    findingDuplicatesTuples: [...tuples],
                    findingDuplicatesCompareIndices: [k, k + 1]
                });
            }
        }
    }

    // Final Step
    steps.push({
        stepId: stepCounter++,
        lineNumber: 0,
        description: `Algorithm finished. Found ${duplicates.size} duplicate entries (total unique strings: ${dataset.length - (duplicates.size > 0 ? duplicates.size / 2 : 0) /* rough estimate logic, actually we just count unique strings */}).`,
        distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [],
        processedSet: Array.from(duplicates).map(String),
        currentNodeId: null, currentNeighborId: null, activeEdge: null,
        findingDuplicatesDataset: dataset,
        findingDuplicatesTuples: [...tuples],
        findingDuplicatesCompareIndices: undefined
    });

    return steps;
};


export const calculateBloomFilterSteps = (): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    let stepCounter = 0;
    const dataset = generateRandomDataset(10);

    // Initialize M
    const M: (0 | 1)[] = new Array(16).fill(0);
    const L: string[] = []; // Potential duplicates (storing indices or strings? storing indices is better for referencing)
    const potentialDuplicateIndices: number[] = [];

    // Helper: Randomized Hash Function Generator (mod 16)
    // h(s) = ((a*s + b) mod p) mod 16
    const p = 10007;
    const m = 16;
    const hashParams: { a: number, b: number }[] = [];
    for (let i = 0; i < 3; i++) {
        hashParams.push({
            a: Math.floor(Math.random() * (p - 1)) + 1,
            b: Math.floor(Math.random() * p)
        });
    }

    const computeHashes = (s: string): number[] => {
        // String to number
        let val = 0;
        for (let i = 0; i < s.length; i++) {
            val = (val * 128 + s.charCodeAt(i)) % p;
        }

        return hashParams.map(param => {
            return Number((BigInt(param.a) * BigInt(val) + BigInt(param.b)) % BigInt(p)) % m;
        });
    };

    // Initial Step
    steps.push({
        stepId: stepCounter++,
        lineNumber: 0, // "M <- bit array..."
        description: `Initialize Bit Array M (size 16) to 0. Generate 3 random hash functions. L is empty.`,
        distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [], processedSet: [],
        currentNodeId: null, currentNeighborId: null, activeEdge: null,
        findingDuplicatesDataset: dataset,
        bloomFilterBitVector: [...M],
        bloomFilterPotentialDuplicates: [],
        bloomFilterHashParams: hashParams,
        bloomFilterActiveHashes: [],
        bloomFilterCurrentElementIndex: -1
    });

    // 1. Process Dataset
    for (let i = 0; i < dataset.length; i++) {
        const s = dataset[i];
        const hashes = computeHashes(s); // [x1, x2, x3]

        // 1. Compute Hashes Step
        steps.push({
            stepId: stepCounter++,
            lineNumber: 3, // "x1 <- h1(s)..."
            description: `Processing "${s}" (index ${i}). Computed hashes: [${hashes.join(', ')}].`,
            distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [], processedSet: [],
            currentNodeId: null, currentNeighborId: null, activeEdge: null,
            findingDuplicatesDataset: dataset,
            bloomFilterBitVector: [...M],
            bloomFilterPotentialDuplicates: [...L],
            bloomFilterHashParams: hashParams,
            bloomFilterActiveHashes: hashes,
            bloomFilterCurrentElementIndex: i
        });

        // 2. Check M
        const isPotentialDuplicate = hashes.every(h => M[h] === 1);

        steps.push({
            stepId: stepCounter++,
            lineNumber: 4, // "if M[x1]=1 ..."
            description: `Check M at indices [${hashes.join(', ')}]: [${hashes.map(h => M[h]).join(', ')}]. ${isPotentialDuplicate ? 'All are 1 -> Potential Duplicate.' : 'Not all are 1 -> New element.'}`,
            distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [], processedSet: [],
            currentNodeId: null, currentNeighborId: null, activeEdge: null,
            findingDuplicatesDataset: dataset,
            bloomFilterBitVector: [...M],
            bloomFilterPotentialDuplicates: [...L],
            bloomFilterHashParams: hashParams,
            bloomFilterActiveHashes: hashes,
            bloomFilterCurrentElementIndex: i
        });

        if (isPotentialDuplicate) {
            potentialDuplicateIndices.push(i);
            L.push(s); // Storing string for display

            steps.push({
                stepId: stepCounter++,
                lineNumber: 5, // "add s to L"
                description: `Added "${s}" to list L of potential duplicates.`,
                distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [], processedSet: [],
                currentNodeId: null, currentNeighborId: null, activeEdge: null,
                findingDuplicatesDataset: dataset,
                bloomFilterBitVector: [...M],
                bloomFilterPotentialDuplicates: [...L],
                bloomFilterHashParams: hashParams,
                bloomFilterActiveHashes: hashes,
                bloomFilterCurrentElementIndex: i
            });
        }

        // 3. Update M
        let changed = false;
        hashes.forEach(h => {
            if (M[h] === 0) changed = true;
            M[h] = 1;
        });

        steps.push({
            stepId: stepCounter++,
            lineNumber: 6, // "M[x1] <- 1..."
            description: changed ? `Updated M at indices [${hashes.join(', ')}] to 1.` : `M already 1 at indices [${hashes.join(', ')}]. No change.`,
            distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [], processedSet: [],
            currentNodeId: null, currentNeighborId: null, activeEdge: null,
            findingDuplicatesDataset: dataset,
            bloomFilterBitVector: [...M],
            bloomFilterPotentialDuplicates: [...L],
            bloomFilterHashParams: hashParams,
            bloomFilterActiveHashes: hashes, // Keep highlighting active
            bloomFilterCurrentElementIndex: i
        });
    }

    // 4. Verify Phase
    const confirmedDuplicates = new Set<number>();
    const falsePositives = new Set<number>();

    steps.push({
        stepId: stepCounter++,
        lineNumber: 7, // "for each s in L..."
        description: `Processing completed. L contains ${L.length} potential duplicates. Verifying...`,
        distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [], processedSet: [],
        currentNodeId: null, currentNeighborId: null, activeEdge: null,
        findingDuplicatesDataset: dataset,
        bloomFilterBitVector: [...M],
        bloomFilterPotentialDuplicates: [...L],
        bloomFilterHashParams: hashParams,
        bloomFilterActiveHashes: [],
        bloomFilterCurrentElementIndex: -1
    });

    // Naively verify against full dataset
    // We check if the element at 'potIdx' actually appeared BEFORE in the dataset.
    // Wait, the prompt says "iterate over L and verify if the duplicates are real".
    // A duplicate is real if count(s) > 1.
    // If we define "potential duplicate" as "we saw 1s in the bloom filter when inserting",
    // then "Real duplicate" means "Used hash slots were occupied by THIS element or other elements, AND this element actually appeared before".
    // Strictly speaking, if we just want to know if it IS a duplicate in the set:
    // We should check if the string appeared at any index < current index.

    for (let k = 0; k < potentialDuplicateIndices.length; k++) {
        const originalIndex = potentialDuplicateIndices[k];
        const s = dataset[originalIndex];

        // Check if string s appeared before originalIndex
        let foundBefore = false;
        for (let j = 0; j < originalIndex; j++) {
            if (dataset[j] === s) {
                foundBefore = true;
                break;
            }
        }

        if (foundBefore) {
            confirmedDuplicates.add(originalIndex);
            steps.push({
                stepId: stepCounter++,
                lineNumber: 8, // "check if s is real duplicate"
                description: `Verifying "${s}" (from index ${originalIndex}). Found previous occurrence! It is a REAL duplicate.`,
                distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [],
                processedSet: Array.from(confirmedDuplicates).map(String), // Use processedSet for highlighting in the final list if needed
                currentNodeId: null, currentNeighborId: null, activeEdge: null,
                findingDuplicatesDataset: dataset,
                bloomFilterBitVector: [...M],
                bloomFilterPotentialDuplicates: [...L],
                bloomFilterHashParams: hashParams,
                bloomFilterActiveHashes: [],
                bloomFilterCurrentElementIndex: originalIndex // Highlight the element being verified
            });
        } else {
            falsePositives.add(originalIndex);
            steps.push({
                stepId: stepCounter++,
                lineNumber: 8,
                description: `Verifying "${s}" (from index ${originalIndex}). No previous occurrence found. It is a FALSE POSITIVE.`,
                distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [],
                processedSet: Array.from(confirmedDuplicates).map(String),
                currentNodeId: null, currentNeighborId: null, activeEdge: null,
                findingDuplicatesDataset: dataset,
                bloomFilterBitVector: [...M],
                bloomFilterPotentialDuplicates: [...L],
                bloomFilterHashParams: hashParams,
                bloomFilterActiveHashes: [],
                bloomFilterCurrentElementIndex: originalIndex
            });
        }
    }

    // Done
    steps.push({
        stepId: stepCounter++,
        lineNumber: 0,
        description: `Done. Found ${confirmedDuplicates.size} real duplicates and ${falsePositives.size} false positives.`,
        distances: {}, parents: {}, discoveryTimes: {}, finishTimes: {}, edgeClassifications: {}, mstEdges: [], queue: [], stack: [],
        processedSet: Array.from(confirmedDuplicates).map(String),
        currentNodeId: null, currentNeighborId: null, activeEdge: null,
        findingDuplicatesDataset: dataset,
        bloomFilterBitVector: [...M],
        bloomFilterPotentialDuplicates: [...L],
        bloomFilterHashParams: hashParams,
        bloomFilterActiveHashes: [],
        bloomFilterCurrentElementIndex: -1
    });

    return steps;
};
