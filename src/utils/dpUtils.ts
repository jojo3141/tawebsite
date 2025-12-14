import { DPStep } from "@/types/dp";

export const calculateFibonacciBottomUp = (n: number): DPStep[] => {
    const steps: DPStep[] = [];
    let stepId = 0;
    const dpTable: (number | null)[] = Array(n + 1).fill(null);

    // Initial call
    steps.push({
        stepId: stepId++,
        lineNumber: 1,
        description: `Start Fibonacci calculation for n=${n}`,
        dpTable: [...dpTable],
        highlights: [],
        variables: { n },
        gridDimensions: { rows: 1, cols: n + 1 }
    });

    if (n <= 1) {
        steps.push({
            stepId: stepId++,
            lineNumber: 2,
            description: `n=${n} is ≤ 1, return ${n}`,
            dpTable: [...dpTable],
            highlights: [],
            variables: { n },
            gridDimensions: { rows: 1, cols: n + 1 }
        });
        return steps;
    }

    // Base Case F[0]
    dpTable[0] = 0;
    steps.push({
        stepId: stepId++,
        lineNumber: 3,
        description: "Initialize F[0] = 0",
        dpTable: [...dpTable],
        highlights: [{ indices: [0], type: 'write', target: 'dp' }],
        variables: { n },
        gridDimensions: { rows: 1, cols: n + 1 }
    });

    // Base Case F[1]
    dpTable[1] = 1;
    steps.push({
        stepId: stepId++,
        lineNumber: 4,
        description: "Initialize F[1] = 1",
        dpTable: [...dpTable],
        highlights: [{ indices: [1], type: 'write', target: 'dp' }],
        variables: { n },
        gridDimensions: { rows: 1, cols: n + 1 }
    });

    // Loop
    for (let i = 2; i <= n; i++) {
        steps.push({
            stepId: stepId++,
            lineNumber: 5,
            description: `Iterate i=${i}`,
            dpTable: [...dpTable],
            highlights: [{ indices: [i], type: 'current', target: 'dp' }],
            variables: { n, i },
            gridDimensions: { rows: 1, cols: n + 1 }
        });

        const val1 = dpTable[i - 1]!;
        const val2 = dpTable[i - 2]!;
        const res = val1 + val2;
        dpTable[i] = res;

        steps.push({
            stepId: stepId++,
            lineNumber: 6,
            description: `F[${i}] = F[${i - 1}] (${val1}) + F[${i - 2}] (${val2}) = ${res}`,
            dpTable: [...dpTable],
            highlights: [
                { indices: [i], type: 'write', target: 'dp' },
                { indices: [i - 1, i - 2], type: 'read', target: 'dp' }
            ],
            variables: { n, i, "F[i]": res },
            gridDimensions: { rows: 1, cols: n + 1 }
        });
    }

    steps.push({
        stepId: stepId++,
        lineNumber: 7,
        description: `Return F[${n}] = ${dpTable[n]}`,
        dpTable: [...dpTable],
        highlights: [{ indices: [n], type: 'read', target: 'dp' }],
        variables: { n, result: dpTable[n]! },
        gridDimensions: { rows: 1, cols: n + 1 }
    });

    return steps;
};

export const calculateFibonacciTopDown = (n: number): DPStep[] => {
    const steps: DPStep[] = [];
    let stepId = 0;
    const dpTable: number[] = Array(n + 1).fill(-1); // Init with -1 as requested
    const stack: string[] = [];

    // Outer Function Steps
    steps.push({
        stepId: stepId++,
        lineNumber: 1, // FIBONACCI(n)
        description: `Start FIBONACCI(${n})`,
        dpTable: [],
        highlights: [],
        variables: { n },
        stack: [],
        gridDimensions: { rows: 1, cols: n + 1 }
    });

    steps.push({
        stepId: stepId++,
        lineNumber: 2, // initialize F
        description: "Initialize all F entries to -1",
        dpTable: [...dpTable],
        highlights: dpTable.map((_, idx) => ({ indices: [idx], type: 'write', target: 'dp' })),
        variables: { n },
        stack: [],
        gridDimensions: { rows: 1, cols: n + 1 }
    });

    steps.push({
        stepId: stepId++,
        lineNumber: 3, // return compute(n)
        description: `Call compute(${n})`,
        dpTable: [...dpTable],
        highlights: [],
        variables: { n },
        stack: [],
        gridDimensions: { rows: 1, cols: n + 1 }
    });

    const compute = (i: number): number => {
        // 1. Call compute(i)
        stack.push(`compute(${i})`);
        steps.push({
            stepId: stepId++,
            lineNumber: 4,
            description: `Called compute(${i})`,
            dpTable: [...dpTable],
            highlights: [],
            variables: { i },
            stack: [...stack],
            gridDimensions: { rows: 1, cols: n + 1 }
        });

        // 2. Check Memo
        steps.push({
            stepId: stepId++,
            lineNumber: 5,
            description: `Check if F[${i}] != -1`,
            dpTable: [...dpTable],
            highlights: [{ indices: [i], type: 'read', target: 'dp' }],
            variables: { i },
            stack: [...stack],
            gridDimensions: { rows: 1, cols: n + 1 }
        });

        if (dpTable[i] !== -1) {
            steps.push({
                stepId: stepId++,
                lineNumber: 5, // Return line for memo
                description: `F[${i}] is ${dpTable[i]}, return it`,
                dpTable: [...dpTable],
                highlights: [{ indices: [i], type: 'read', target: 'dp' }],
                variables: { i, "F[i]": dpTable[i] },
                stack: [...stack],
                gridDimensions: { rows: 1, cols: n + 1 }
            });
            stack.pop();
            return dpTable[i];
        }

        let val: number;
        // 3. Base Case
        if (i <= 1) {
            val = i;
            dpTable[i] = val; // Direct Write
            steps.push({
                stepId: stepId++,
                lineNumber: 6,
                description: `Base case i ≤ 1. F[${i}] ← ${i}`,
                dpTable: [...dpTable],
                highlights: [{ indices: [i], type: 'write', target: 'dp' }],
                variables: { i, "F[i]": val },
                stack: [...stack],
                gridDimensions: { rows: 1, cols: n + 1 }
            });
        } else {
            // 4. Recursive Step
            steps.push({
                stepId: stepId++,
                lineNumber: 7,
                description: `Recursive step: Need compute(${i - 1}) + compute(${i - 2})`,
                dpTable: [...dpTable],
                highlights: [],
                variables: { i },
                stack: [...stack],
                gridDimensions: { rows: 1, cols: n + 1 }
            });

            const val1 = compute(i - 1);

            // After returning from val1, we are back in context of i
            steps.push({
                stepId: stepId++,
                lineNumber: 7,
                description: `compute(${i - 1}) returned ${val1}. Now calling compute(${i - 2})`,
                dpTable: [...dpTable],
                highlights: [{ indices: [i - 1], type: 'read', target: 'dp' }], // Highlight the first operand used
                variables: { i, val1 },
                stack: [...stack],
                gridDimensions: { rows: 1, cols: n + 1 }
            });

            const val2 = compute(i - 2);

            val = val1 + val2;
            dpTable[i] = val; // Direct Write

            steps.push({
                stepId: stepId++,
                lineNumber: 7,
                description: `Returned from compute(${i - 2}) = ${val2}. F[${i}] ← ${val1} + ${val2} = ${val}`,
                dpTable: [...dpTable],
                highlights: [{ indices: [i], type: 'write', target: 'dp' }],
                variables: { i, "F[i]": val },
                stack: [...stack],
                gridDimensions: { rows: 1, cols: n + 1 }
            });
        }

        // 5. Return (Line 8 now)
        stack.pop();
        steps.push({
            stepId: stepId++,
            lineNumber: 8,
            description: `Return F[${i}] (${val})`,
            dpTable: [...dpTable],
            highlights: [{ indices: [i], type: 'read', target: 'dp' }],
            variables: { i, "F[i]": val },
            stack: [...stack],
            gridDimensions: { rows: 1, cols: n + 1 }
        });

        return val;
    }

    const finalRes = compute(n);

    // Final result step
    steps.push({
        stepId: stepId++,
        lineNumber: 3,
        description: `FIBONACCI(${n}) finished. Result: ${finalRes}`,
        dpTable: [...dpTable],
        highlights: [{ indices: [n], type: 'read', target: 'dp' }],
        variables: { result: finalRes },
        stack: [],
        gridDimensions: { rows: 1, cols: n + 1 }
    });

    return steps;
};


export const calculateMaxSubarrayBottomUp = (arr: number[]): DPStep[] => {
    const steps: DPStep[] = [];
    let stepId = 0;
    const n = arr.length;
    // DP size n + 1 (1-based indices 1..n used)
    const dpTable: (number | null)[] = Array(n + 1).fill(null);
    let maxSum = -Infinity;

    // Start
    steps.push({
        stepId: stepId++,
        lineNumber: 1,
        description: "Start MSS calculation",
        dpTable: [...dpTable],
        inputArray: arr,
        highlights: [],
        variables: { n },
        gridDimensions: { rows: 1, cols: n + 1 }
    });

    // Init DP[1] = A[1]
    dpTable[1] = arr[0];
    maxSum = arr[0];
    // dpTable[0] is unused/dummy

    steps.push({
        stepId: stepId++,
        lineNumber: 2,
        description: `Initialize DP[1] = A[1] = ${arr[0]}`,
        dpTable: [...dpTable],
        inputArray: arr,
        highlights: [
            { indices: [1], type: 'write', target: 'dp' },
            { indices: [0], type: 'read', target: 'input' }
        ],
        variables: { n, "DP[1]": dpTable[1] },
        gridDimensions: { rows: 1, cols: n + 1 }
    });

    steps.push({
        stepId: stepId++,
        lineNumber: 3,
        description: `Initialize max_sum = ${maxSum}`,
        dpTable: [...dpTable],
        inputArray: arr,
        highlights: [],
        variables: { n, max_sum: maxSum },
        gridDimensions: { rows: 1, cols: n + 1 }
    });

    // Loop from 2 to n (1-based)
    for (let i = 2; i <= n; i++) {
        steps.push({
            stepId: stepId++,
            lineNumber: 4,
            description: `Iterate i=${i}`,
            dpTable: [...dpTable],
            inputArray: arr,
            highlights: [{ indices: [i - 1], type: 'current', target: 'input' }],
            variables: { n, i, max_sum: maxSum },
            gridDimensions: { rows: 1, cols: n + 1 }
        });

        // Calculate
        const prevDp = dpTable[i - 1]!;
        const currentVal = arr[i - 1]; // arr is 0-based: A[i] -> arr[i-1]
        const sumWithPrev = prevDp + currentVal;

        const decision = sumWithPrev > currentVal
            ? `Extend: ${prevDp} + ${currentVal} = ${sumWithPrev}`
            : `Restart: ${currentVal}`;

        const newVal = Math.max(currentVal, sumWithPrev);
        dpTable[i] = newVal;

        steps.push({
            stepId: stepId++,
            lineNumber: 5,
            description: `DP[${i}] = max(A[${i}], DP[${i - 1}] + A[${i}]) => ${decision}`,
            dpTable: [...dpTable],
            inputArray: arr,
            highlights: [
                { indices: [i], type: 'write', target: 'dp' },
                { indices: [i - 1], type: 'read', target: 'dp' },
                { indices: [i - 1], type: 'read', target: 'input' }
            ],
            variables: { n, i, [`DP[${i}]`]: newVal, max_sum: maxSum },
            gridDimensions: { rows: 1, cols: n + 1 }
        });

        const newMax = Math.max(maxSum, newVal);
        const maxUpdated = newMax > maxSum;
        maxSum = newMax;

        steps.push({
            stepId: stepId++,
            lineNumber: 6,
            description: maxUpdated ? `New max found! max_sum = ${maxSum}` : `max_sum remains ${maxSum}`,
            dpTable: [...dpTable],
            inputArray: arr,
            highlights: [{ indices: [i], type: 'read', target: 'dp' }],
            variables: { n, i, max_sum: maxSum },
            gridDimensions: { rows: 1, cols: n + 1 }
        });
    }

    // Find result and backtrack
    let maxIdx = -1;
    let currentMax = -Infinity;

    // Find absolute max
    for (let i = 1; i <= n; i++) {
        if (dpTable[i]! > currentMax) {
            currentMax = dpTable[i]!;
            maxIdx = i;
        }
    }

    let startIdx = maxIdx;
    if (maxIdx !== -1) {
        for (let i = maxIdx; i >= 1; i--) {
            if (dpTable[i]! === arr[i - 1]) {
                startIdx = i;
                break;
            }
        }
    }

    const solutionIndices: number[] = [];
    if (maxIdx !== -1 && currentMax >= 0) {
        for (let i = startIdx; i <= maxIdx; i++) {
            solutionIndices.push(i - 1);
        }
    }

    steps.push({
        stepId: stepId++,
        lineNumber: 7,
        description: `Return max(max_sum, 0) = ${Math.max(maxSum, 0)}.`,
        dpTable: [...dpTable],
        inputArray: arr,
        highlights: [
            { indices: solutionIndices, type: 'match', target: 'input' }
        ],
        variables: { result: Math.max(maxSum, 0) },
        gridDimensions: { rows: 1, cols: n + 1 }
    });

    return steps;
};

export const calculateMaxSubarrayTopDown = (arr: number[]): DPStep[] => {
    const steps: DPStep[] = [];
    let stepId = 0;
    const n = arr.length;
    // DP size n + 1 (indices 1..n used)
    const dpTable: number[] = Array(n + 1).fill(-1);
    const stack: string[] = [];

    // Outer Function Steps
    steps.push({
        stepId: stepId++,
        lineNumber: 1, // MSS(A)
        description: "Start MSS(A)",
        dpTable: [],
        inputArray: arr,
        highlights: [],
        variables: { n },
        stack: [],
        gridDimensions: { rows: 1, cols: n + 1 }
    });

    steps.push({
        stepId: stepId++,
        lineNumber: 2, // initialize DP
        description: "Initialize DP table with -1",
        dpTable: [...dpTable],
        inputArray: arr,
        highlights: dpTable.map((_, idx) => ({ indices: [idx], type: 'write', target: 'dp' })),
        variables: { n },
        stack: [],
        gridDimensions: { rows: 1, cols: n + 1 }
    });

    steps.push({
        stepId: stepId++,
        lineNumber: 3, // compute(n)
        description: `Call compute(${n}) to fill DP table`,
        dpTable: [...dpTable],
        inputArray: arr,
        highlights: [],
        variables: { n },
        stack: [],
        gridDimensions: { rows: 1, cols: n + 1 }
    });


    // compute(i) returns the max subarray ending at i (1-based)
    const compute = (i: number): number => {
        // 1. Call
        stack.push(`compute(${i})`);
        steps.push({
            stepId: stepId++,
            lineNumber: 5,
            description: `Called compute(${i})`,
            dpTable: [...dpTable],
            inputArray: arr,
            highlights: [{ indices: [i], type: 'write', target: 'dp' }], // Highlight potential target
            variables: { i },
            stack: [...stack],
            gridDimensions: { rows: 1, cols: n + 1 }
        });

        if (i === 1) {
            stack.pop();
            // A[1] is arr[0]
            const val = arr[0];
            steps.push({
                stepId: stepId++,
                lineNumber: 6,
                description: `Base case i=1. Return A[1] = ${val}`,
                dpTable: [...dpTable],
                inputArray: arr,
                highlights: [{ indices: [0], type: 'read', target: 'input' }],
                variables: { i },
                stack: [...stack],
                gridDimensions: { rows: 1, cols: n + 1 }
            });

            dpTable[1] = val;
            steps.push({
                stepId: stepId++,
                lineNumber: 6,
                description: `Implicitly set DP[1] = ${val}`,
                dpTable: [...dpTable],
                inputArray: arr,
                highlights: [{ indices: [1], type: 'write', target: 'dp' }],
                variables: { i },
                stack: [...stack],
                gridDimensions: { rows: 1, cols: n + 1 }
            });

            stack.pop();
            return arr[0];
        }

        // 3. Check Memo
        steps.push({
            stepId: stepId++,
            lineNumber: 7,
            description: `Check if DP[${i}] != -1`,
            dpTable: [...dpTable],
            inputArray: arr,
            highlights: [{ indices: [i], type: 'read', target: 'dp' }],
            variables: { i, "DP[i]": dpTable[i] },
            stack: [...stack],
            gridDimensions: { rows: 1, cols: n + 1 }
        });

        if (dpTable[i] !== -1) {
            steps.push({
                stepId: stepId++,
                lineNumber: 7,
                description: `DP[${i}] found: ${dpTable[i]}. Return it.`,
                dpTable: [...dpTable],
                inputArray: arr,
                highlights: [{ indices: [i], type: 'read', target: 'dp' }],
                variables: { i, "DP[i]": dpTable[i] },
                stack: [...stack],
                gridDimensions: { rows: 1, cols: n + 1 }
            });
            stack.pop();
            return dpTable[i];
        }

        // 4. Recurse
        steps.push({
            stepId: stepId++,
            lineNumber: 8,
            description: `Need compute(${i - 1}) to calculate DP[${i}]`,
            dpTable: [...dpTable],
            inputArray: arr,
            highlights: [],
            variables: { i },
            stack: [...stack],
            gridDimensions: { rows: 1, cols: n + 1 }
        });

        const prev = compute(i - 1);

        // Back in context
        // arr[i-1] is the value at 1-based index i
        const currentVal = arr[i - 1];

        steps.push({
            stepId: stepId++,
            lineNumber: 8,
            description: `compute(${i - 1}) returned ${prev}. Max check: max(A[${i}], ${prev} + A[${i}])`,
            dpTable: [...dpTable],
            inputArray: arr,
            highlights: [],
            variables: { i, prev },
            stack: [...stack],
            gridDimensions: { rows: 1, cols: n + 1 }
        });

        dpTable[i] = Math.max(currentVal, prev + currentVal);

        steps.push({
            stepId: stepId++,
            lineNumber: 8,
            description: `DP[${i}] = ${dpTable[i]}`,
            dpTable: [...dpTable],
            inputArray: arr,
            highlights: [{ indices: [i], type: 'write', target: 'dp' }],
            variables: { i, "DP[i]": dpTable[i] },
            stack: [...stack],
            gridDimensions: { rows: 1, cols: n + 1 }
        });

        const finalRes = dpTable[i];

        // 5. Return
        stack.pop();
        steps.push({
            stepId: stepId++,
            lineNumber: 9,
            description: `Return ${finalRes}`,
            dpTable: [...dpTable],
            inputArray: arr,
            highlights: [{ indices: [i], type: 'read', target: 'dp' }],
            variables: { i, "DP[i]": finalRes },
            stack: [...stack],
            gridDimensions: { rows: 1, cols: n + 1 }
        });

        return finalRes;
    }

    // Call compute(n)
    steps.push({
        stepId: stepId++,
        lineNumber: 10,
        description: `Calling compute(${n})`,
        dpTable: [...dpTable],
        inputArray: arr,
        highlights: [],
        variables: { n },
        stack: [],
        gridDimensions: { rows: 1, cols: n + 1 }
    });

    compute(n);

    // Calculate max over table (indices 1..n)
    // let maxSum = -Infinity;
    // Find max element index
    let maxIdx = -1;
    let currentMax = -Infinity;

    // Scan 1..n
    for (let i = 1; i <= n; i++) {
        if (dpTable[i] > currentMax) {
            currentMax = dpTable[i];
            maxIdx = i;
        }
    }

    // Backtrack to find start
    let startIdx = maxIdx;
    if (maxIdx !== -1) {
        for (let i = maxIdx; i >= 1; i--) {
            // Check if A[i] started a new subarray: DP[i] == A[i] (approximately, beware float if any)
            // Logic: DP[i] = max(A[i], A[i] + DP[i-1]). If DP[i] == A[i], then i is start.
            // Note: arr is 0-based so A[i] is arr[i-1].
            if (dpTable[i] === arr[i - 1]) {
                startIdx = i;
                break;
            }
        }
    }

    const solutionIndices: number[] = [];
    if (maxIdx !== -1 && currentMax >= 0) {
        for (let i = startIdx; i <= maxIdx; i++) {
            solutionIndices.push(i - 1); // input is 0-based
        }
    }

    steps.push({
        stepId: stepId++,
        lineNumber: 11,
        description: `Max in DP table is ${currentMax}.`,
        dpTable: [...dpTable],
        inputArray: arr,
        highlights: [
            { indices: solutionIndices, type: 'match', target: 'input' }
        ],
        variables: { result: Math.max(currentMax, 0) },
        stack: [],
        gridDimensions: { rows: 1, cols: n + 1 }
    });

    return steps;
};

export const calculateJumpGameBottomUp = (arr: number[]): DPStep[] => {
    const steps: DPStep[] = [];
    let stepId = 0;
    const n = arr.length;
    // DP[k] stores the max index reachable in exactly k jumps.
    // We don't know how many jumps max, but n is safe upper bound.
    // DP size n (indices 0..n-1)
    const dpTable: (number | null)[] = Array(n).fill(null);
    const jumpPath: number[] = []; // Stores the 'bestIndex' chosen at each step

    // Initial State
    steps.push({
        stepId: stepId++,
        lineNumber: 1,
        description: "Start JUMP-GAME",
        dpTable: [...dpTable],
        inputArray: arr,
        highlights: [],
        variables: { n, k: '?' },
        gridDimensions: { rows: 1, cols: n }
    });

    // DP[0] = 1 (1-based index 1)
    dpTable[0] = 1;
    let k = 0;

    if (n > 1) {
        // Init DP[1] = 1 + A[1] -> arr[0]
        const val = arr[0];
        const reach = 1 + val;
        dpTable[1] = reach;
        jumpPath.push(0); // Store 0-based for UI arrows
        k = 1;

        steps.push({
            stepId: stepId++,
            lineNumber: 2,
            description: `Initialize DP[0] = 1, DP[1] = 1 + A[1] = ${reach}`,
            dpTable: [...dpTable],
            inputArray: arr,
            highlights: [
                { indices: [0], type: 'write', target: 'dp' },
                { indices: [1], type: 'write', target: 'dp' },
                { indices: [0], type: 'read', target: 'input' }
            ],
            variables: { n, k: 0 },
            gridDimensions: { rows: 1, cols: n }
        });

        // k=1 step
        steps.push({
            stepId: stepId++,
            lineNumber: 3,
            description: "Initialize k = 1",
            dpTable: [...dpTable],
            inputArray: arr,
            highlights: [],
            variables: { n, k: 1 },
            gridDimensions: { rows: 1, cols: n }
        });
    } else {
        // Fallback for n=1
        steps.push({
            stepId: stepId++,
            lineNumber: 2,
            description: "Initialize DP[0] = 1",
            dpTable: [...dpTable],
            inputArray: arr,
            highlights: [{ indices: [0], type: 'write', target: 'dp' }],
            variables: { n, k: 0 },
            gridDimensions: { rows: 1, cols: n }
        });
    }

    // target is n (1-based)
    const target = n;

    while (k < n) {
        const currentMaxReach = dpTable[k];
        if (currentMaxReach === null) break;

        steps.push({
            stepId: stepId++,
            lineNumber: 4,
            description: `Check if DP[${k}] (${currentMaxReach}) < ${n} (Target)`,
            dpTable: [...dpTable],
            inputArray: arr,
            highlights: [{ indices: [k], type: 'read', target: 'dp' }],
            variables: { n, k, currentMaxReach },
            gridDimensions: { rows: 1, cols: n }
        });

        if (currentMaxReach >= target) {
            break;
        }

        const k_prev = k;
        const prevBound = dpTable[k_prev - 1]!;
        const currentBound = dpTable[k_prev]!;

        const startSearch = prevBound + 1;
        const endSearch = currentBound;

        if (startSearch > endSearch) {
            steps.push({
                stepId: stepId++,
                lineNumber: 7,
                description: `Cannot reach further!`,
                dpTable: [...dpTable],
                inputArray: arr,
                highlights: [],
                variables: { n, k, error: "Stuck" },
                gridDimensions: { rows: 1, cols: n }
            });
            return steps;
        }

        k++;

        steps.push({
            stepId: stepId++,
            lineNumber: 5,
            description: `Increment k = ${k}`,
            dpTable: [...dpTable],
            inputArray: arr,
            highlights: [],
            variables: { n, k },
            gridDimensions: { rows: 1, cols: n }
        });

        let maxReachInNextJump = -1;
        let bestIndex = -1;

        // Iterate range
        for (let i = startSearch; i <= endSearch; i++) {
            if (i > n) break; // Safety
            const val = arr[i - 1]; // 0-based
            const reach = i + val;
            if (reach > maxReachInNextJump) {
                maxReachInNextJump = reach;
                bestIndex = i; // 1-based
            }
        }

        // Highlight scan
        const scanIndices = Array.from({ length: endSearch - startSearch + 1 }, (_, idx) => startSearch + idx).filter(i => i <= n).map(i => i - 1);

        steps.push({
            stepId: stepId++,
            lineNumber: 6,
            description: `Scanning range [${startSearch}..${endSearch}]. Best jump from i=${bestIndex} reaches ${bestIndex}+${arr[bestIndex - 1]}=${maxReachInNextJump}`,
            dpTable: [...dpTable],
            inputArray: arr,
            highlights: [
                { indices: scanIndices, type: 'read', target: 'input' }
            ],
            variables: { n, k, bestJump: maxReachInNextJump },
            gridDimensions: { rows: 1, cols: n }
        });

        jumpPath.push(bestIndex - 1); // 0-based
        dpTable[k] = maxReachInNextJump;

        steps.push({
            stepId: stepId++,
            lineNumber: 6,
            description: `DP[${k}] = ${maxReachInNextJump}`,
            dpTable: [...dpTable],
            inputArray: arr,
            highlights: [{ indices: [k], type: 'write', target: 'dp' }],
            variables: { n, k, "DP[k]": maxReachInNextJump },
            gridDimensions: { rows: 1, cols: n }
        });
    }

    // Construct arrows
    const arrows: { from: number, to: number }[] = [];
    jumpPath.forEach((idx, i) => {
        if (i < jumpPath.length - 1) {
            arrows.push({ from: idx, to: jumpPath[i + 1] });
        }
    });

    if (jumpPath.length > 0) {
        const finalReach = dpTable[k];
        if (finalReach !== null && finalReach >= n) {
            const lastJumpStart = jumpPath[jumpPath.length - 1];
            arrows.push({ from: lastJumpStart, to: n - 1 });
        }
    }

    steps.push({
        stepId: stepId++,
        lineNumber: 7,
        description: `Target reached! Minimal jumps = ${k}.`,
        dpTable: [...dpTable],
        inputArray: arr,
        highlights: [],
        inputGridArrows: arrows,
        variables: { result: k },
        gridDimensions: { rows: 1, cols: n }
    });

    return steps;
};

export const calculateLCSBottomUp = (strA: string, strB: string): DPStep[] => {
    const steps: DPStep[] = [];
    let stepId = 0;
    const m = strA.length;
    const n = strB.length;

    const rows = m + 1;
    const cols = n + 1;
    const dpTable: (number | null)[] = Array(rows * cols).fill(0); // Init with 0

    const getIndex = (r: number, c: number) => r * cols + c;

    // 1. Initial State
    steps.push({
        stepId: stepId++,
        lineNumber: 1,
        description: `Start LCS("${strA}", "${strB}")`,
        dpTable: [...dpTable],
        highlights: [],
        variables: { m, n },
        gridDimensions: { rows, cols }
    });

    // 2. Init
    steps.push({
        stepId: stepId++,
        lineNumber: 3,
        description: "Initialize DP table with 0s",
        dpTable: [...dpTable],
        highlights: Array.from({ length: rows * cols }, (_, i) => ({ indices: [i], type: 'write', target: 'dp' })),
        variables: { m, n },
        gridDimensions: { rows, cols }
    });

    // 3. Loop
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const charA = strA[i - 1]; // 1-based index fix
            const charB = strB[j - 1];

            steps.push({
                stepId: stepId++,
                lineNumber: 6, // Check characters
                description: `Compare A[${i}]('${charA}') and B[${j}]('${charB}')`,
                dpTable: [...dpTable],
                highlights: [
                    { indices: [getIndex(i, j)], type: 'current', target: 'dp' }
                ],
                variables: { i, j, charA, charB },
                gridDimensions: { rows, cols }
            });

            if (charA === charB) {
                const prev = dpTable[getIndex(i - 1, j - 1)]!;
                const val = 1 + prev;
                dpTable[getIndex(i, j)] = val;

                steps.push({
                    stepId: stepId++,
                    lineNumber: 6, // Match
                    description: `Match! DP[${i}][${j}] = 1 + DP[${i - 1}][${j - 1}] (${prev}) = ${val}`,
                    dpTable: [...dpTable],
                    highlights: [
                        { indices: [getIndex(i, j)], type: 'write', target: 'dp' },
                        { indices: [getIndex(i - 1, j - 1)], type: 'read', target: 'dp' }
                    ],
                    variables: { i, j, val },
                    gridDimensions: { rows, cols }
                });
            } else {
                const up = dpTable[getIndex(i - 1, j)]!;
                const left = dpTable[getIndex(i, j - 1)]!;
                const val = Math.max(up, left);
                dpTable[getIndex(i, j)] = val;

                steps.push({
                    stepId: stepId++,
                    lineNumber: 7, // Mismatch
                    description: `Mismatch. DP[${i}][${j}] = max(DP[${i - 1}][${j}](${up}), DP[${i}][${j - 1}](${left})) = ${val}`,
                    dpTable: [...dpTable],
                    highlights: [
                        { indices: [getIndex(i, j)], type: 'write', target: 'dp' },
                        { indices: [getIndex(i - 1, j), getIndex(i, j - 1)], type: 'read', target: 'dp' }
                    ],
                    variables: { i, j, val },
                    gridDimensions: { rows, cols }
                });
            }
        }
    }

    steps.push({
        stepId: stepId++,
        lineNumber: 8,
        description: `Return DP[${m}][${n}] = ${dpTable[getIndex(m, n)]}`,
        dpTable: [...dpTable],
        highlights: [{ indices: [getIndex(m, n)], type: 'read', target: 'dp' }],
        variables: { result: dpTable[getIndex(m, n)]! },
        gridDimensions: { rows, cols }
    });

    // --- Backtracking Step ---
    const fullPathIndices: number[] = [];
    const matchIndices: number[] = [];

    let curI = m;
    let curJ = n;

    while (curI > 0 && curJ > 0) {
        const idx = getIndex(curI, curJ);
        fullPathIndices.push(idx);
        const currentVal = dpTable[idx]!;

        if (strA[curI - 1] === strB[curJ - 1]) {
            // It's a match!
            matchIndices.push(idx);
            curI--;
            curJ--;
        }
        else if (dpTable[getIndex(curI - 1, curJ)] === currentVal) {
            curI--;
        }
        else {
            curJ--;
        }
    }
    const startIdx = getIndex(curI, curJ);
    fullPathIndices.push(startIdx);

    const forwardPath = fullPathIndices.reverse();
    const arrows: Record<number, string> = {};

    for (let k = 0; k < forwardPath.length - 1; k++) {
        const curr = forwardPath[k];
        const next = forwardPath[k + 1];

        const currRow = Math.floor(curr / cols);
        const currCol = curr % cols;
        const nextRow = Math.floor(next / cols);
        const nextCol = next % cols;

        if (nextRow > currRow && nextCol > currCol) arrows[next] = '↘'; // Diagonal
        else if (nextRow > currRow) arrows[next] = '↓'; // Down
        else if (nextCol > currCol) arrows[next] = '→'; // Right
    }

    const startRow = Math.floor(startIdx / cols);
    const startCol = startIdx % cols;

    steps.push({
        stepId: stepId++,
        lineNumber: 8,
        description: `Backtracking from (${startRow},${startCol}) to (${m},${n}). Highlighted cells are LCS matches.`,
        dpTable: [...dpTable],
        highlights: [
            {
                indices: forwardPath.filter(idx => !matchIndices.includes(idx)),
                type: 'current',
                target: 'dp'
            },
            {
                indices: matchIndices,
                type: 'match',
                target: 'dp'
            }
        ],
        variables: { result: dpTable[getIndex(m, n)]! },
        gridDimensions: { rows, cols },
        arrows
    });

    return steps;
};

export const calculateLCSTopDown = (strA: string, strB: string): DPStep[] => {
    const steps: DPStep[] = [];
    let stepId = 0;
    const m = strA.length;
    const n = strB.length;
    const rows = m + 1;
    const cols = n + 1;
    const dpTable: number[] = Array(rows * cols).fill(-1);
    const stack: string[] = [];

    const getIndex = (r: number, c: number) => r * cols + c;

    // 1. Initial State
    steps.push({
        stepId: stepId++,
        lineNumber: 1,
        description: `Start LCS("${strA}", "${strB}")`,
        dpTable: [],
        highlights: [],
        variables: { m, n },
        stack: [],
        gridDimensions: { rows, cols }
    });

    // 2. Initialize
    steps.push({
        stepId: stepId++,
        lineNumber: 2,
        description: "Initialize DP table with -1",
        dpTable: [...dpTable],
        highlights: Array.from({ length: rows * cols }, (_, i) => ({ indices: [i], type: 'write', target: 'dp' })),
        variables: { m, n },
        stack: [],
        gridDimensions: { rows, cols }
    });

    // 3. Call compute
    steps.push({
        stepId: stepId++,
        lineNumber: 3,
        description: `Call compute(${m}, ${n})`,
        dpTable: [...dpTable],
        highlights: [],
        variables: {},
        stack: [],
        gridDimensions: { rows, cols }
    });

    const compute = (i: number, j: number): number => {
        // 1. Enter
        stack.push(`compute(${i},${j})`);
        steps.push({
            stepId: stepId++,
            lineNumber: 4,
            description: `Called compute(${i}, ${j})`,
            dpTable: [...dpTable],
            highlights: [{ indices: [getIndex(i, j)], type: 'current', target: 'dp' }],
            variables: { i, j },
            stack: [...stack],
            gridDimensions: { rows, cols }
        });

        // 2. Base Case
        if (i === 0 || j === 0) {
            dpTable[getIndex(i, j)] = 0; // Implicitly 0 often in logic but let's set it
            steps.push({
                stepId: stepId++,
                lineNumber: 4, // "if i==0 return j" or similar line in pseudocode? No, LCS pseudocode says "if i=0 or j=0 return 0".
                description: `Base Case reached. Return 0`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, j)], type: 'write', target: 'dp' }],
                variables: { i, j, "DP[i][j]": 0 },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });
            stack.pop();
            return 0;
        }

        // 3. Memo Check
        steps.push({
            stepId: stepId++,
            lineNumber: 5,
            description: `Check Memo DP[${i}][${j}]`,
            dpTable: [...dpTable],
            highlights: [{ indices: [getIndex(i, j)], type: 'read', target: 'dp' }],
            variables: { i, j, "DP[i][j]": dpTable[getIndex(i, j)] },
            stack: [...stack],
            gridDimensions: { rows, cols }
        });

        if (dpTable[getIndex(i, j)] !== -1) {
            steps.push({
                stepId: stepId++,
                lineNumber: 5,
                description: `Memo Hit! Return DP[${i}][${j}] = ${dpTable[getIndex(i, j)]}`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, j)], type: 'read', target: 'dp' }],
                variables: { i, j, "DP[i][j]": dpTable[getIndex(i, j)] },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });
            stack.pop();
            return dpTable[getIndex(i, j)];
        }

        const charA = strA[i - 1];
        const charB = strB[j - 1];

        steps.push({
            stepId: stepId++,
            lineNumber: 6,
            description: `Compare A[${i - 1}]='${charA}' with B[${j - 1}]='${charB}'`,
            dpTable: [...dpTable],
            highlights: [],
            variables: { i, j, charA, charB },
            stack: [...stack],
            gridDimensions: { rows, cols }
        });

        if (charA === charB) {
            steps.push({
                stepId: stepId++,
                lineNumber: 7,
                description: `Match! DP[${i}][${j}] ← 1 + compute(${i - 1}, ${j - 1})`,
                dpTable: [...dpTable],
                highlights: [],
                variables: { i, j },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });

            const subRes = compute(i - 1, j - 1);
            dpTable[getIndex(i, j)] = 1 + subRes;

            steps.push({
                stepId: stepId++,
                lineNumber: 7,
                description: `Returned from compute(${i - 1}, ${j - 1}) with ${subRes}. DP[${i}][${j}] ← ${1 + subRes}`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, j)], type: 'write', target: 'dp' }],
                variables: { i, j, "DP[i][j]": 1 + subRes },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });
        } else {
            steps.push({
                stepId: stepId++,
                lineNumber: 9,
                description: `Mismatch! DP[${i}][${j}] ← max(compute(${i - 1}, ${j}), compute(${i}, ${j - 1}))`,
                dpTable: [...dpTable],
                highlights: [],
                variables: { i, j },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });

            const val1 = compute(i - 1, j);
            steps.push({
                stepId: stepId++,
                lineNumber: 9, // "compute(i-1,j), compute(i,j-1)" are on line 9?
                description: `d(${i - 1},${j}) returned ${val1}. Now call d(${i},${j - 1})`,
                dpTable: [...dpTable],
                highlights: [],
                variables: { i, j, val1 },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });

            const val2 = compute(i, j - 1);
            const maxVal = Math.max(val1, val2);
            dpTable[getIndex(i, j)] = maxVal;

            steps.push({
                stepId: stepId++,
                lineNumber: 8, // Back to Assignment line
                description: `Both returned. max(${val1}, ${val2}) = ${maxVal}. DP[${i}][${j}] ← ${maxVal}`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, j)], type: 'write', target: 'dp' }],
                variables: { i, j, "DP[i][j]": maxVal },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });
        }

        const finalRes = dpTable[getIndex(i, j)];

        steps.push({
            stepId: stepId++,
            lineNumber: 10,
            description: `Return DP[${i}][${j}] = ${finalRes}`,
            dpTable: [...dpTable],
            highlights: [{ indices: [getIndex(i, j)], type: 'read', target: 'dp' }],
            variables: { i, j, "DP[i][j]": finalRes },
            stack: [...stack],
            gridDimensions: { rows, cols }
        });

        stack.pop();
        return finalRes;
    }

    compute(m, n);

    // --- Backtracking Step (Same logic as Bottom-Up) ---
    const fullPathIndices: number[] = [];
    const matchIndices: number[] = [];

    let curI = m;
    let curJ = n;

    while (curI > 0 && curJ > 0) {
        const idx = getIndex(curI, curJ);
        fullPathIndices.push(idx);
        const currentVal = dpTable[idx]!;

        if (strA[curI - 1] === strB[curJ - 1]) {
            matchIndices.push(idx);
            curI--;
            curJ--;
        }
        else if (dpTable[getIndex(curI - 1, curJ)] !== -1 && dpTable[getIndex(curI - 1, curJ)] === currentVal) {
            curI--;
        }
        else {
            curJ--;
        }
    }
    const startIdx = getIndex(curI, curJ);
    fullPathIndices.push(startIdx);

    const forwardPath = fullPathIndices.reverse();
    const arrows: Record<number, string> = {};

    for (let k = 0; k < forwardPath.length - 1; k++) {
        const curr = forwardPath[k];
        const next = forwardPath[k + 1];

        const currRow = Math.floor(curr / cols);
        const currCol = curr % cols;
        const nextRow = Math.floor(next / cols);
        const nextCol = next % cols;

        if (nextRow > currRow && nextCol > currCol) arrows[next] = '↘';
        else if (nextRow > currRow) arrows[next] = '↓';
        else if (nextCol > currCol) arrows[next] = '→';
    }

    const startRow = Math.floor(startIdx / cols);
    const startCol = startIdx % cols;

    steps.push({
        stepId: stepId++,
        lineNumber: 11,
        description: `Backtracking from (${startRow},${startCol}) to (${m},${n}). Highlighted cells are LCS matches.`,
        dpTable: [...dpTable],
        highlights: [
            {
                indices: forwardPath.filter(idx => !matchIndices.includes(idx)),
                type: 'current',
                target: 'dp'
            },
            {
                indices: matchIndices,
                type: 'match',
                target: 'dp'
            }
        ],
        variables: { result: dpTable[getIndex(m, n)]! },
        gridDimensions: { rows, cols },
        arrows
    });

    return steps;
};

// --- EDIT DISTANCE BOTTOM UP ---

// --- EDIT DISTANCE BOTTOM UP ---
export const calculateEditDistanceBottomUp = (strA: string, strB: string): DPStep[] => {
    const steps: DPStep[] = [];
    let stepId = 0;
    const m = strA.length;
    const n = strB.length;
    const rows = m + 1;
    const cols = n + 1;
    const dpTable: number[] = Array.from({ length: rows * cols }, () => 0);
    const getIndex = (r: number, c: number) => r * cols + c;

    // 1. Initial State
    steps.push({
        stepId: stepId++,
        lineNumber: 1,
        description: `Start EDIT-DISTANCE("${strA}", "${strB}")`,
        dpTable: [...dpTable],
        highlights: [],
        variables: { m, n },
        gridDimensions: { rows, cols }
    });

    // 2. Initialize Base Cases
    // Row 0: 0, 1, 2... n
    for (let j = 0; j <= n; j++) {
        dpTable[getIndex(0, j)] = j;
    }
    // Col 0: 0, 1, 2... m
    for (let i = 0; i <= m; i++) {
        dpTable[getIndex(i, 0)] = i;
    }

    steps.push({
        stepId: stepId++,
        lineNumber: 3,
        description: "Initialize base cases: DP[i][0] = i, DP[0][j] = j",
        dpTable: [...dpTable],
        highlights: [
            ...Array.from({ length: m + 1 }, (_, i) => ({ indices: [getIndex(i, 0)], type: 'write' as const, target: 'dp' as const })),
            ...Array.from({ length: n + 1 }, (_, j) => ({ indices: [getIndex(0, j)], type: 'write' as const, target: 'dp' as const }))
        ],
        variables: { m, n },
        gridDimensions: { rows, cols }
    });

    // 3. Main Loops
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const charA = strA[i - 1]; // 1-based to 0-based
            const charB = strB[j - 1];

            steps.push({
                stepId: stepId++,
                lineNumber: 6, // if A[i] == B[j] --> check is at line 6 now
                description: `Compare A[${i}]('${charA}') with B[${j}]('${charB}')`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, j)], type: 'current', target: 'dp' }],
                variables: { i, j, charA, charB },
                gridDimensions: { rows, cols }
            });

            if (charA === charB) {
                const val = dpTable[getIndex(i - 1, j - 1)];
                dpTable[getIndex(i, j)] = val;

                steps.push({
                    stepId: stepId++,
                    lineNumber: 7,
                    description: `Match! Cost 0. DP[${i}][${j}] = DP[${i - 1}][${j - 1}] = ${val}`,
                    dpTable: [...dpTable],
                    highlights: [
                        { indices: [getIndex(i, j)], type: 'write', target: 'dp' },
                        { indices: [getIndex(i - 1, j - 1)], type: 'read', target: 'dp' }
                    ],
                    variables: { i, j, val },
                    gridDimensions: { rows, cols }
                });
            } else {
                const del = dpTable[getIndex(i - 1, j)];
                const ins = dpTable[getIndex(i, j - 1)];
                const rep = dpTable[getIndex(i - 1, j - 1)];
                const minVal = Math.min(del, ins, rep);
                const val = 1 + minVal;
                dpTable[getIndex(i, j)] = val;

                steps.push({
                    stepId: stepId++,
                    lineNumber: 9, // else ... min
                    description: `Mismatch! 1 + min(Del(${del}), Ins(${ins}), Rep(${rep})) = ${val}`,
                    dpTable: [...dpTable],
                    highlights: [
                        { indices: [getIndex(i, j)], type: 'write', target: 'dp' },
                        { indices: [getIndex(i - 1, j), getIndex(i, j - 1), getIndex(i - 1, j - 1)], type: 'read', target: 'dp' }
                    ],
                    variables: { i, j, val, min: minVal },
                    gridDimensions: { rows, cols }
                });
            }
        }
    }

    steps.push({
        stepId: stepId++,
        lineNumber: 11,
        description: `Return DP[${m}][${n}] = ${dpTable[getIndex(m, n)]}`,
        dpTable: [...dpTable],
        highlights: [{ indices: [getIndex(m, n)], type: 'read', target: 'dp' }],
        variables: { result: dpTable[getIndex(m, n)] },
        gridDimensions: { rows, cols }
    });

    // --- Backtracking ---
    const fullPathIndices: number[] = [];
    const matchIndices: number[] = [];
    let curI = m;
    let curJ = n;

    while (curI > 0 && curJ > 0) {
        const idx = getIndex(curI, curJ);
        fullPathIndices.push(idx);
        const currentVal = dpTable[idx];

        if (strA[curI - 1] === strB[curJ - 1]) {
            // Match (Diag) - No cost increase implies diagonal move
            // Strictly check if diagonal is correct source (it is for match)
            matchIndices.push(idx);
            curI--;
            curJ--;
        } else {
            // Mismatch - find who gave the min
            // Prioritize Replace > Delete > Insert? Or just find any min.
            // Check Rep first (Diag), then Del (Up), then Ins (Left)
            const rep = dpTable[getIndex(curI - 1, curJ - 1)];
            const del = dpTable[getIndex(curI - 1, curJ)];
            const ins = dpTable[getIndex(curI, curJ - 1)];

            // Check if currentVal = 1 + neighbor
            if (currentVal === 1 + rep) {
                curI--; curJ--; // Replace
            } else if (currentVal === 1 + del) {
                curI--; // Delete
            } else if (currentVal === 1 + ins) {
                curJ--; // Insert
            }
        }
    }
    // Handle remaining steps if reaching boundary but not (0,0)
    // Actually, loop naturally stops when one hits 0.
    // If curI > 0, we just go up (delete remaining).
    // If curJ > 0, we just go left (insert remaining).
    while (curI > 0) {
        fullPathIndices.push(getIndex(curI, 0));
        curI--;
    }
    while (curJ > 0) {
        fullPathIndices.push(getIndex(0, curJ));
        curJ--;
    }

    // Add (0,0)
    fullPathIndices.push(getIndex(0, 0));

    const forwardPath = fullPathIndices.reverse();
    const arrows: Record<number, string> = {};
    for (let k = 0; k < forwardPath.length - 1; k++) {
        const curr = forwardPath[k];
        const next = forwardPath[k + 1];
        const currRow = Math.floor(curr / cols);
        const currCol = curr % cols;
        const nextRow = Math.floor(next / cols);
        const nextCol = next % cols;
        if (nextRow > currRow && nextCol > currCol) arrows[next] = '↘';
        else if (nextRow > currRow) arrows[next] = '↓';
        else if (nextCol > currCol) arrows[next] = '→';
    }

    // const startRow = Math.floor(forwardPath[0] / cols);
    // const startCol = forwardPath[0] % cols; // Should be 0,0

    steps.push({
        stepId: stepId++,
        lineNumber: 11,
        description: `Backtracking complete. Path highlighted.`,
        dpTable: [...dpTable],
        highlights: [
            {
                indices: forwardPath.filter(idx => !matchIndices.includes(idx)),
                type: 'current',
                target: 'dp'
            },
            {
                indices: matchIndices,
                type: 'match',
                target: 'dp'
            }
        ],
        variables: { result: dpTable[getIndex(m, n)] },
        gridDimensions: { rows, cols },
        arrows
    });

    return steps;
};

// --- EDIT DISTANCE TOP DOWN ---
export const calculateEditDistanceTopDown = (strA: string, strB: string): DPStep[] => {
    const steps: DPStep[] = [];
    let stepId = 0;
    const m = strA.length;
    const n = strB.length;
    const rows = m + 1;
    const cols = n + 1;
    const dpTable: number[] = Array.from({ length: rows * cols }, () => -1);
    const stack: string[] = [];
    const getIndex = (r: number, c: number) => r * cols + c;

    steps.push({
        stepId: stepId++,
        lineNumber: 1,
        description: `Start EDIT-DISTANCE("${strA}", "${strB}")`,
        dpTable: [],
        highlights: [],
        variables: { m, n },
        stack: [],
        gridDimensions: { rows, cols }
    });

    steps.push({
        stepId: stepId++,
        lineNumber: 2,
        description: "Initialize DP table with -1",
        dpTable: [...dpTable],
        highlights: Array.from({ length: rows * cols }, (_, i) => ({ indices: [i], type: 'write' as const, target: 'dp' as const })),
        variables: { m, n },
        stack: [],
        gridDimensions: { rows, cols }
    });

    // 3. Call compute
    steps.push({
        stepId: stepId++,
        lineNumber: 3, // return compute(m, n)
        description: `Call compute(${m}, ${n})`,
        dpTable: [...dpTable],
        highlights: [],
        variables: {},
        stack: [],
        gridDimensions: { rows, cols }
    });

    const compute = (i: number, j: number): number => {
        // 1. Enter
        stack.push(`compute(${i},${j})`);
        steps.push({
            stepId: stepId++,
            lineNumber: 4, // compute(i, j)
            description: `Called compute(${i}, ${j})`,
            dpTable: [...dpTable],
            highlights: [{ indices: [getIndex(i, j)], type: 'current', target: 'dp' }],
            variables: { i, j },
            stack: [...stack],
            gridDimensions: { rows, cols }
        });

        // 2. Base Cases
        if (i === 0 || j === 0) {
            const res = (i === 0) ? j : i;
            dpTable[getIndex(i, j)] = res;
            steps.push({
                stepId: stepId++,
                lineNumber: 5, // if i==0 return j...
                description: `Base Case: i=${i}, j=${j}. Return ${res}`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, j)], type: 'write', target: 'dp' }],
                variables: { i, j, "DP[i][j]": res },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });
            stack.pop();
            return res;
        }

        // 3. Memo Check
        steps.push({
            stepId: stepId++,
            lineNumber: 6, // if DP[i][j] != -1...
            description: `Check Memo DP[${i}][${j}]`,
            dpTable: [...dpTable],
            highlights: [{ indices: [getIndex(i, j)], type: 'read', target: 'dp' }],
            variables: { i, j, "DP[i][j]": dpTable[getIndex(i, j)] },
            stack: [...stack],
            gridDimensions: { rows, cols }
        });

        if (dpTable[getIndex(i, j)] !== -1) {
            steps.push({
                stepId: stepId++,
                lineNumber: 6, // Memo hit
                description: `Memo Hit! Return DP[${i}][${j}] = ${dpTable[getIndex(i, j)]}`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, j)], type: 'read', target: 'dp' }],
                variables: { i, j, "DP[i][j]": dpTable[getIndex(i, j)] },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });
            stack.pop();
            return dpTable[getIndex(i, j)];
        }

        const charA = strA[i - 1];
        const charB = strB[j - 1];

        steps.push({
            stepId: stepId++,
            lineNumber: 7, // if A[i-1] == B[j-1]
            description: `Compare A[${i - 1}]='${charA}' with B[${j - 1}]='${charB}'`,
            dpTable: [...dpTable],
            highlights: [],
            variables: { i, j, charA, charB },
            stack: [...stack],
            gridDimensions: { rows, cols }
        });

        if (charA === charB) {
            steps.push({
                stepId: stepId++,
                lineNumber: 8, // DP[i][j] <- compute(i-1, j-1)
                description: `Match! DP[${i}][${j}] ← compute(${i - 1}, ${j - 1})`,
                dpTable: [...dpTable],
                highlights: [],
                variables: { i, j },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });

            const matchVal = compute(i - 1, j - 1);
            dpTable[getIndex(i, j)] = matchVal;

            steps.push({
                stepId: stepId++,
                lineNumber: 8,
                description: `Match result: DP[${i}][${j}] = ${matchVal}`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, j)], type: 'write', target: 'dp' }],
                variables: { i, j, "DP[i][j]": matchVal },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });
        } else {
            steps.push({
                stepId: stepId++,
                lineNumber: 9, // else ... min
                description: `Mismatch! Recurse on (i-1,j), (i,j-1), (i-1,j-1)`,
                dpTable: [...dpTable],
                highlights: [],
                variables: { i, j },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });

            const del = compute(i - 1, j);
            const ins = compute(i, j - 1);
            const rep = compute(i - 1, j - 1);
            const minVal = Math.min(del, ins, rep);
            const maxVal = 1 + minVal;

            dpTable[getIndex(i, j)] = maxVal;

            steps.push({
                stepId: stepId++,
                lineNumber: 9,
                description: `Mismatch result: 1 + min(${del}, ${ins}, ${rep}) = ${maxVal}`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, j)], type: 'write', target: 'dp' }],
                variables: { i, j, "DP[i][j]": maxVal },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });
        }

        const finalRes = dpTable[getIndex(i, j)];

        steps.push({
            stepId: stepId++,
            lineNumber: 11, // return DP[i][j]
            description: `Return DP[${i}][${j}] = ${finalRes}`,
            dpTable: [...dpTable],
            highlights: [{ indices: [getIndex(i, j)], type: 'read', target: 'dp' }],
            variables: { i, j, "DP[i][j]": finalRes },
            stack: [...stack],
            gridDimensions: { rows, cols }
        });

        stack.pop();
        return finalRes;
    };

    compute(m, n);

    // --- Backtracking ---
    const fullPathIndices: number[] = [];
    const matchIndices: number[] = [];
    let curI = m;
    let curJ = n;

    while (curI > 0 && curJ > 0) {
        const idx = getIndex(curI, curJ);
        fullPathIndices.push(idx);
        const currentVal = dpTable[idx];

        if (strA[curI - 1] === strB[curJ - 1]) {
            matchIndices.push(idx);
            curI--;
            curJ--;
        } else {
            // Check neighbors for min source
            // Note: Top Down fills grid.
            const rep = dpTable[getIndex(curI - 1, curJ - 1)];
            const del = dpTable[getIndex(curI - 1, curJ)];
            const ins = dpTable[getIndex(curI, curJ - 1)];

            // Top down table might have -1 if not visited?
            // Only if unreachable. On optimal path it should be visited.
            // But careful with indices.
            // Assume they are valid.

            if (rep !== undefined && currentVal === 1 + rep) {
                curI--; curJ--;
            } else if (del !== undefined && currentVal === 1 + del) {
                curI--;
            } else if (ins !== undefined && currentVal === 1 + ins) {
                curJ--;
            }
        }
    }
    while (curI > 0) {
        fullPathIndices.push(getIndex(curI, 0));
        curI--;
    }
    while (curJ > 0) {
        fullPathIndices.push(getIndex(0, curJ));
        curJ--;
    }
    fullPathIndices.push(getIndex(0, 0));

    const forwardPath = fullPathIndices.reverse();
    const arrows: Record<number, string> = {};
    for (let k = 0; k < forwardPath.length - 1; k++) {
        const curr = forwardPath[k];
        const next = forwardPath[k + 1];
        const currRow = Math.floor(curr / cols);
        const currCol = curr % cols;
        const nextRow = Math.floor(next / cols);
        const nextCol = next % cols;
        if (nextRow > currRow && nextCol > currCol) arrows[next] = '↘';
        else if (nextRow > currRow) arrows[next] = '↓';
        else if (nextCol > currCol) arrows[next] = '→';
    }

    steps.push({
        stepId: stepId++,
        lineNumber: 10,
        description: `Backtracking complete. Path cost: ${dpTable[getIndex(m, n)]}.`,
        dpTable: [...dpTable],
        highlights: [
            {
                indices: forwardPath.filter(idx => !matchIndices.includes(idx)),
                type: 'current',
                target: 'dp'
            },
            {
                indices: matchIndices,
                type: 'match',
                target: 'dp'
            }
        ],
        variables: { result: dpTable[getIndex(m, n)] },
        gridDimensions: { rows, cols },
        arrows,
        stack: []
    });

    return steps;
};

// --- SUBSET SUM BOTTOM UP ---
export const calculateSubsetSumBottomUp = (arr: number[], target: number): DPStep[] => {
    const steps: DPStep[] = [];
    let stepId = 0;
    const n = arr.length;
    const rows = n + 1;
    const cols = target + 1;
    const dpTable: number[] = Array.from({ length: rows * cols }, () => 0);
    const getIndex = (r: number, c: number) => r * cols + c;

    steps.push({
        stepId: stepId++,
        lineNumber: 1,
        description: `Start SUBSET-SUM(A=[${arr.join(', ')}], target=${target})`,
        dpTable: [...dpTable],
        highlights: [],
        variables: { n, target },
        gridDimensions: { rows, cols }
    });

    // Init Base Cases
    // DP[i][0] = 1
    for (let i = 0; i <= n; i++) dpTable[getIndex(i, 0)] = 1;

    steps.push({
        stepId: stepId++,
        lineNumber: 3,
        description: "Init DP[i][0] = 1 (Sum 0 always possible)",
        dpTable: [...dpTable],
        highlights: Array.from({ length: n + 1 }, (_, i) => ({ indices: [getIndex(i, 0)], type: 'write' as const, target: 'dp' as const })),
        variables: { n, target },
        gridDimensions: { rows, cols }
    });

    // Loop
    for (let i = 1; i <= n; i++) {
        const val = arr[i - 1];
        for (let s = 1; s <= target; s++) {
            // Check exclude: DP[i-1][s]
            const exclude = dpTable[getIndex(i - 1, s)];
            let result = exclude;
            let include = 0;

            steps.push({
                stepId: stepId++,
                lineNumber: 7,
                description: `Check exclude A[${i}]=${val}: DP[${i - 1}][${s}] is ${exclude}`,
                dpTable: [...dpTable],
                highlights: [
                    { indices: [getIndex(i, s)], type: 'current', target: 'dp' },
                    { indices: [getIndex(i - 1, s)], type: 'read', target: 'dp' }
                ],
                variables: { i, s, val, exclude },
                gridDimensions: { rows, cols }
            });

            if (s - val >= 0 && s - val <= target) {
                include = dpTable[getIndex(i - 1, s - val)];
                result = exclude || include;
                steps.push({
                    stepId: stepId++,
                    lineNumber: 9,
                    description: `Check include A[${i}]=${val}: DP[${i - 1}][${s}-${val}] is ${include}. OR result: ${result}`,
                    dpTable: [...dpTable],
                    highlights: [
                        { indices: [getIndex(i, s)], type: 'current', target: 'dp' },
                        { indices: [getIndex(i - 1, s - val)], type: 'read', target: 'dp' }
                    ],
                    variables: { i, s, val, include, result },
                    gridDimensions: { rows, cols }
                });
            }

            dpTable[getIndex(i, s)] = result;
            steps.push({
                stepId: stepId++,
                lineNumber: 9,
                description: `DP[${i}][${s}] = ${result}`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, s)], type: 'write', target: 'dp' }],
                variables: { i, s, result },
                gridDimensions: { rows, cols }
            });
        }
    }

    steps.push({
        stepId: stepId++,
        lineNumber: 10,
        description: `Return DP[${n}][${target}] = ${dpTable[getIndex(n, target)]}`,
        dpTable: [...dpTable],
        highlights: [{ indices: [getIndex(n, target)], type: 'read', target: 'dp' }],
        variables: { result: dpTable[getIndex(n, target)] },
        gridDimensions: { rows, cols }
    });

    // Backtracking
    const fullPathIndices: number[] = [];
    const matchIndices: number[] = [];
    let curI = n;
    let curS = target;

    if (dpTable[getIndex(n, target)] === 1) {
        while (curI > 0 && curS >= 0) {
            const idx = getIndex(curI, curS);
            fullPathIndices.push(idx);

            const exclude = dpTable[getIndex(curI - 1, curS)];
            if (exclude === 1) {
                curI--;
                // Arrow will be added in loop
            } else {
                matchIndices.push(idx);
                const val = arr[curI - 1];
                curS -= val;
                curI--;
            }
        }
        fullPathIndices.push(getIndex(curI, curS));
    }

    const forwardPath = fullPathIndices.reverse();
    const arrows: Record<number, string> = {};
    const longArrows: { from: number, to: number }[] = [];

    for (let k = 0; k < forwardPath.length - 1; k++) {
        const curr = forwardPath[k];
        const next = forwardPath[k + 1];
        const currRow = Math.floor(curr / cols);
        const currCol = curr % cols;
        const nextRow = Math.floor(next / cols);
        const nextCol = next % cols;

        if (nextRow > currRow && nextCol === currCol) {
            arrows[next] = '↓';
        } else {
            // Jump (Include) - Use Long Arrow
            longArrows.push({ from: curr, to: next });
        }
    }

    steps.push({
        stepId: stepId++,
        lineNumber: 10,
        description: `Backtracking complete.`,
        dpTable: [...dpTable],
        highlights: [
            {
                indices: forwardPath.filter(idx => !matchIndices.includes(idx)),
                type: 'current',
                target: 'dp'
            },
            {
                indices: matchIndices,
                type: 'match',
                target: 'dp'
            }
        ],
        variables: { result: dpTable[getIndex(n, target)] },
        gridDimensions: { rows, cols },
        arrows,
        longArrows,
        stack: []
    });

    return steps;
};

// --- SUBSET SUM TOP DOWN ---
export const calculateSubsetSumTopDown = (arr: number[], target: number): DPStep[] => {
    const steps: DPStep[] = [];
    let stepId = 0;
    const n = arr.length;
    const rows = n + 1;
    const cols = target + 1;
    const dpTable: number[] = Array.from({ length: rows * cols }, () => -1);
    const stack: string[] = [];
    const getIndex = (r: number, c: number) => r * cols + c;

    steps.push({
        stepId: stepId++,
        lineNumber: 1,
        description: `Start SUBSET-SUM(A, target)`,
        dpTable: [],
        highlights: [],
        variables: { n, target },
        stack: [],
        gridDimensions: { rows, cols }
    });

    steps.push({
        stepId: stepId++,
        lineNumber: 2,
        description: "Initialize DP table with -1",
        dpTable: [...dpTable],
        highlights: Array.from({ length: rows * cols }, (_, i) => ({ indices: [i], type: 'write' as const, target: 'dp' as const })),
        variables: { n, target },
        stack: [],
        gridDimensions: { rows, cols }
    });

    // 3. Call compute
    steps.push({
        stepId: stepId++,
        lineNumber: 3, // return compute(n, target)
        description: `Call compute(${n}, ${target})`,
        dpTable: [...dpTable],
        highlights: [],
        variables: {},
        stack: [],
        gridDimensions: { rows, cols }
    });

    const compute = (i: number, s: number): number => {
        stack.push(`compute(${i},${s})`);
        steps.push({
            stepId: stepId++,
            lineNumber: 4, // compute(i, s)
            description: `Called compute(${i}, ${s})`,
            dpTable: [...dpTable],
            highlights: [{ indices: [getIndex(i, s)], type: 'current', target: 'dp' }],
            variables: { i, s },
            stack: [...stack],
            gridDimensions: { rows, cols }
        });

        if (s === 0) {
            dpTable[getIndex(i, s)] = 1;
            steps.push({
                stepId: stepId++,
                lineNumber: 5,
                description: `Base case s=0. Return 1`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, s)], type: 'write', target: 'dp' }],
                variables: { i, s, "DP[i][s]": 1 },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });
            stack.pop();
            return 1;
        }
        if (i === 0) {
            dpTable[getIndex(i, s)] = 0;
            steps.push({
                stepId: stepId++,
                lineNumber: 6,
                description: `Base case i=0. Return 0`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, s)], type: 'write', target: 'dp' }],
                variables: { i, s, "DP[i][s]": 0 },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });
            stack.pop();
            return 0;
        }

        // Memo Check
        steps.push({
            stepId: stepId++,
            lineNumber: 7,
            description: `Check Memo DP[${i}][${s}]`,
            dpTable: [...dpTable],
            highlights: [{ indices: [getIndex(i, s)], type: 'read', target: 'dp' }],
            variables: { i, s, "DP[i][s]": dpTable[getIndex(i, s)] },
            stack: [...stack],
            gridDimensions: { rows, cols }
        });

        if (dpTable[getIndex(i, s)] !== -1) {
            steps.push({
                stepId: stepId++,
                lineNumber: 7,
                description: `Memo Hit! Return DP[${i}][${s}]`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, s)], type: 'read', target: 'dp' }],
                variables: { i, s, "DP[i][s]": dpTable[getIndex(i, s)] },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });
            stack.pop();
            return dpTable[getIndex(i, s)];
        }

        // Exclude
        steps.push({
            stepId: stepId++,
            lineNumber: 8,
            description: `Skip A[${i}](${arr[i - 1]}). Call compute(${i - 1}, ${s})`,
            dpTable: [...dpTable],
            highlights: [],
            variables: { i, s },
            stack: [...stack],
            gridDimensions: { rows, cols }
        });

        const exclude = compute(i - 1, s);
        dpTable[getIndex(i, s)] = exclude; // Temporary set

        if (exclude === 1) {
            steps.push({
                stepId: stepId++,
                lineNumber: 8,
                description: `Found subset by skipping A[${i}]. DP[${i}][${s}] = 1`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, s)], type: 'write', target: 'dp' }],
                variables: { i, s, "DP[i][s]": 1 },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });
            stack.pop();
            return 1;
        }

        const currentVal = arr[i - 1]; // 0-based
        steps.push({
            stepId: stepId++,
            lineNumber: 9, // Check if A[i] <= s (or general check for negative)
            description: `Check if valid to use A[${i}](${currentVal})? (s - A[i] <= target)`,
            dpTable: [...dpTable],
            highlights: [],
            variables: { i, s, "A[i]": currentVal },
            stack: [...stack],
            gridDimensions: { rows, cols }
        });

        const prevTarget = s - currentVal;

        if (prevTarget >= 0 && prevTarget <= target) { // Bounds check
            steps.push({
                stepId: stepId++,
                lineNumber: 10,
                description: `Use A[${i}]. Call compute(${i - 1}, ${s} - ${currentVal} = ${prevTarget})`,
                dpTable: [...dpTable],
                highlights: [],
                variables: { i, s },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });

            const include = compute(i - 1, prevTarget);
            const res = exclude || include;
            dpTable[getIndex(i, s)] = res;

            steps.push({
                stepId: stepId++,
                lineNumber: 10,
                description: `Result: ${res ? 'True' : 'False'} (Skip=${exclude}, Use=${include})`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, s)], type: 'write', target: 'dp' }],
                variables: { i, s, "DP[i][s]": res },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });
            stack.pop();
            return res;
        } else {
            steps.push({
                stepId: stepId++,
                lineNumber: 9,
                description: `Cannot use. (s - A[i] = ${prevTarget}) is out of bounds [0, ${target}].`,
                dpTable: [...dpTable],
                highlights: [],
                variables: { i, s },
                stack: [...stack],
                gridDimensions: { rows, cols }
            });
            stack.pop();
            return exclude;
        }

        const finalRes = dpTable[getIndex(i, s)];

        steps.push({
            stepId: stepId++,
            lineNumber: 10,
            description: `Return DP[${i}][${s}] = ${finalRes}`,
            dpTable: [...dpTable],
            highlights: [{ indices: [getIndex(i, s)], type: 'read', target: 'dp' }],
            variables: { i, s, "DP[i][s]": finalRes },
            stack: [...stack],
            gridDimensions: { rows, cols }
        });

        stack.pop();
        return finalRes;
    };

    compute(n, target);

    // Backtracking
    const fullPathIndices: number[] = [];
    const matchIndices: number[] = [];
    let curI = n;
    let curS = target;

    if (dpTable[getIndex(n, target)] === 1) {
        while (curI > 0 && curS >= 0) {
            const idx = getIndex(curI, curS);
            fullPathIndices.push(idx);

            const exclude = dpTable[getIndex(curI - 1, curS)];
            const val = arr[curI - 1];
            // Check Include Validity
            const includeIdx = getIndex(curI - 1, curS - val);
            const include = (curS - val >= 0) ? dpTable[includeIdx] : 0;

            if (exclude === 1) {
                curI--;
            } else if (include === 1) {
                matchIndices.push(idx);
                curS -= val;
                curI--;
            } else {
                break; // Stop if no valid path backward
            }
        }
        // Only push the base case (row 0) if we successfully reached it
        if (curI === 0) {
            fullPathIndices.push(getIndex(curI, curS));
        }
    }

    const forwardPath = fullPathIndices.reverse();
    const arrows: Record<number, string> = {};
    const longArrows: { from: number, to: number }[] = [];

    for (let k = 0; k < forwardPath.length - 1; k++) {
        const curr = forwardPath[k];
        const next = forwardPath[k + 1];
        const currRow = Math.floor(curr / cols);
        const currCol = curr % cols;
        const nextRow = Math.floor(next / cols);
        const nextCol = next % cols;

        if (nextRow > currRow && nextCol === currCol) {
            arrows[next] = '↓';
        } else {
            // Jump (Include) - Use Long Arrow
            longArrows.push({ from: curr, to: next });
        }
    }

    steps.push({
        stepId: stepId++,
        lineNumber: 10,
        description: `Backtracking complete.`,
        dpTable: [...dpTable],
        highlights: [
            {
                indices: forwardPath.filter(idx => !matchIndices.includes(idx)),
                type: 'current',
                target: 'dp'
            },
            {
                indices: matchIndices,
                type: 'match',
                target: 'dp'
            }
        ],
        variables: { result: dpTable[getIndex(n, target)] },
        gridDimensions: { rows, cols },
        arrows,
        longArrows,
        stack: []
    });

    return steps;
};

export const calculateKnapsackBottomUp = (weights: number[], values: number[], W: number): DPStep[] => {
    const steps: DPStep[] = [];
    let stepId = 0;
    const n = weights.length;

    // DP Table is (n+1) x (W+1)
    const rows = n + 1;
    const cols = W + 1;

    // dpTable stores max values
    const dpTable: (number | null)[] = Array(rows * cols).fill(0);
    const getIndex = (r: number, c: number) => r * cols + c;

    // 1. Initial State
    steps.push({
        stepId: stepId++,
        lineNumber: 1,
        description: `Start KNAPSACK (n=${n}, W=${W})`,
        dpTable: [...dpTable],
        highlights: [],
        variables: { n, W },
        gridDimensions: { rows, cols }
    });

    // 2. Base Case: already 0 by fill, but let's highlight
    steps.push({
        stepId: stepId++,
        lineNumber: 2,
        description: "Initialize DP table with 0s",
        dpTable: [...dpTable],
        highlights: Array.from({ length: rows * cols }, (_, i) => ({ indices: [i], type: 'write', target: 'dp' })),
        variables: { n, W },
        gridDimensions: { rows, cols }
    });

    // 3. Loop
    for (let i = 1; i <= n; i++) {
        const wt = weights[i - 1];
        const val = values[i - 1];

        for (let w = 0; w <= W; w++) {

            // Check
            steps.push({
                stepId: stepId++,
                lineNumber: 7,
                description: `For i=${i} (wt=${wt}, val=${val}) and capacity w=${w}`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, w)], type: 'current', target: 'dp' }],
                variables: { i, w, wt, val },
                gridDimensions: { rows, cols }
            });

            if (wt <= w) {
                const exclude = dpTable[getIndex(i - 1, w)]!;
                const includeIdx = getIndex(i - 1, w - wt);
                const include = val + dpTable[includeIdx]!;

                const newVal = Math.max(exclude, include);
                dpTable[getIndex(i, w)] = newVal;

                steps.push({
                    stepId: stepId++,
                    lineNumber: 8,
                    description: `Can include! Max(Exclude: ${exclude}, Include: ${val} + ${dpTable[includeIdx]}) = ${newVal}`,
                    dpTable: [...dpTable],
                    highlights: [
                        { indices: [getIndex(i, w)], type: 'write', target: 'dp' },
                        { indices: [getIndex(i - 1, w), includeIdx], type: 'read', target: 'dp' }
                    ],
                    variables: { i, w, newVal, includeVal: include, excludeVal: exclude },
                    gridDimensions: { rows, cols }
                });
            } else {
                const exclude = dpTable[getIndex(i - 1, w)]!;
                dpTable[getIndex(i, w)] = exclude;

                steps.push({
                    stepId: stepId++,
                    lineNumber: 10, // else
                    description: `Cannot include (wt ${wt} > ${w}). Inherit ${exclude}`,
                    dpTable: [...dpTable],
                    highlights: [
                        { indices: [getIndex(i, w)], type: 'write', target: 'dp' },
                        { indices: [getIndex(i - 1, w)], type: 'read', target: 'dp' }
                    ],
                    variables: { i, w, newVal: exclude },
                    gridDimensions: { rows, cols }
                });
            }
        }
    }

    // 4. Return
    steps.push({
        stepId: stepId++,
        lineNumber: 12,
        description: `DP Table Filled. Result is ${dpTable[getIndex(n, W)]}`,
        dpTable: [...dpTable],
        highlights: [{ indices: [getIndex(n, W)], type: 'read', target: 'dp' }],
        variables: { result: dpTable[getIndex(n, W)]! },
        gridDimensions: { rows, cols }
    });

    // 5. Backtracking Path
    const fullPathIndices: number[] = [];
    const matchIndices: number[] = [];
    let curI = n;
    let curW = W;

    while (curI > 0 && curW >= 0) {
        const idx = getIndex(curI, curW);
        fullPathIndices.push(idx);

        const currentVal = dpTable[getIndex(curI, curW)]!;
        const prevVal = dpTable[getIndex(curI - 1, curW)]!;

        if (currentVal === prevVal) {
            // Excluded
            curI--;
        } else {
            // Included
            matchIndices.push(idx);
            const wVal = weights[curI - 1];
            curW -= wVal;
            curI--;
        }
    }
    // Add 0,0 or final state if needed. Usually (0,0) is reached.
    if (curI === 0) fullPathIndices.push(getIndex(curI, curW));

    const forwardPath = fullPathIndices.reverse();
    const arrows: Record<number, string> = {};
    const longArrows: { from: number, to: number }[] = [];

    for (let k = 0; k < forwardPath.length - 1; k++) {
        const curr = forwardPath[k];
        const next = forwardPath[k + 1];
        const currCol = curr % cols;
        const nextCol = next % cols;

        if (currCol === nextCol) {
            arrows[next] = '↓';
        } else {
            longArrows.push({ from: curr, to: next });
        }
    }

    steps.push({
        stepId: stepId++,
        lineNumber: 12,
        description: `Backtracking complete.`,
        dpTable: [...dpTable],
        highlights: [
            {
                indices: forwardPath.filter(idx => !matchIndices.includes(idx)),
                type: 'current',
                target: 'dp'
            },
            {
                indices: matchIndices,
                type: 'match',
                target: 'dp'
            }
        ],
        variables: { result: dpTable[getIndex(n, W)]! },
        gridDimensions: { rows, cols },
        arrows,
        longArrows
    });

    return steps;
};

export const calculateKnapsackTopDown = (weights: number[], values: number[], W: number): DPStep[] => {
    const steps: DPStep[] = [];
    let stepId = 0;
    const n = weights.length;
    const rows = n + 1;
    const cols = W + 1;

    // dpTable with -1
    const dpTable: (number | null)[] = Array(rows * cols).fill(-1);
    const getIndex = (r: number, c: number) => r * cols + c;
    const stack: string[] = [];

    // Outer Steps
    steps.push({
        stepId: stepId++,
        lineNumber: 1,
        description: `Start KNAPSACK TOP-DOWN (n=${n}, W=${W})`,
        dpTable: [...dpTable],
        highlights: [],
        variables: { n, W },
        gridDimensions: { rows, cols },
        stack: []
    });

    steps.push({
        stepId: stepId++,
        lineNumber: 2,
        description: "Initialize DP table with -1",
        dpTable: [...dpTable],
        highlights: Array.from({ length: rows * cols }, (_, i) => ({ indices: [i], type: 'write', target: 'dp' })),
        variables: { n, W },
        gridDimensions: { rows, cols },
        stack: []
    });

    steps.push({
        stepId: stepId++,
        lineNumber: 3,
        description: `Return compute(n=${n}, w=${W})`,
        dpTable: [...dpTable],
        highlights: [],
        variables: { n, W },
        gridDimensions: { rows, cols },
        stack: []
    });

    const compute = (i: number, w: number): number => {
        // 1. Call
        stack.push(`compute(${i}, ${w})`);
        steps.push({
            stepId: stepId++,
            lineNumber: 4, // compute(i, w)
            description: `Called compute(i=${i}, w=${w})`,
            dpTable: [...dpTable],
            highlights: [{ indices: [getIndex(i, w)], type: 'current', target: 'dp' }],
            variables: { i, w },
            gridDimensions: { rows, cols },
            stack: [...stack]
        });

        // 2. Base Case
        if (i === 0 || w === 0) {
            stack.pop();
            // Optional: Set DP val to 0 for viz if not set
            if (dpTable[getIndex(i, w)] === -1) {
                dpTable[getIndex(i, w)] = 0;
                steps.push({
                    stepId: stepId++,
                    lineNumber: 5,
                    description: `Base case (i=0 or w=0). Return 0`,
                    dpTable: [...dpTable],
                    highlights: [{ indices: [getIndex(i, w)], type: 'write', target: 'dp' }],
                    variables: { i, w },
                    gridDimensions: { rows, cols },
                    stack: [...stack]
                });
            } else {
                // Even if set (by init?), highlight match
                steps.push({
                    stepId: stepId++,
                    lineNumber: 5,
                    description: `Base case (i=0 or w=0). Return 0`,
                    dpTable: [...dpTable],
                    highlights: [{ indices: [getIndex(i, w)], type: 'read', target: 'dp' }],
                    variables: { i, w },
                    gridDimensions: { rows, cols },
                    stack: [...stack]
                });
            }
            return 0;
        }

        // 3. Memo Check
        steps.push({
            stepId: stepId++,
            lineNumber: 6,
            description: `Check Memo DP[${i}][${w}]`,
            dpTable: [...dpTable],
            highlights: [{ indices: [getIndex(i, w)], type: 'read', target: 'dp' }],
            variables: { i, w, "DP[i][w]": dpTable[getIndex(i, w)] ?? -1 },
            gridDimensions: { rows, cols },
            stack: [...stack]
        });

        if (dpTable[getIndex(i, w)] !== -1) {
            steps.push({
                stepId: stepId++,
                lineNumber: 6,
                description: `Memo Hit! Return DP[${i}][${w}]`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, w)], type: 'read', target: 'dp' }],
                variables: { i, w },
                gridDimensions: { rows, cols },
                stack: [...stack]
            });
            stack.pop();
            return dpTable[getIndex(i, w)]!;
        }

        const wt = weights[i - 1];
        const val = values[i - 1];

        // 4. Recursive
        steps.push({
            stepId: stepId++,
            lineNumber: 7, // if wt <= w
            description: `Check if wt[${i}] (${wt}) <= w (${w})`,
            dpTable: [...dpTable],
            highlights: [],
            variables: { i, w, wt },
            gridDimensions: { rows, cols },
            stack: [...stack]
        });

        if (wt <= w) {
            steps.push({
                stepId: stepId++,
                lineNumber: 8,
                description: `Can Include. Need max(val + compute(i-1, w-wt), compute(i-1, w))`,
                dpTable: [...dpTable],
                highlights: [],
                variables: { i, w, wt },
                gridDimensions: { rows, cols },
                stack: [...stack]
            });

            const include = val + compute(i - 1, w - wt);

            steps.push({
                stepId: stepId++,
                lineNumber: 8,
                description: `Include path done (${include}). Now Exclude path...`,
                dpTable: [...dpTable],
                highlights: [],
                variables: { i, w, include },
                gridDimensions: { rows, cols },
                stack: [...stack]
            });

            const exclude = compute(i - 1, w);

            const newVal = Math.max(include, exclude);
            dpTable[getIndex(i, w)] = newVal;

            steps.push({
                stepId: stepId++,
                lineNumber: 8,
                description: `Max(${include}, ${exclude}) = ${newVal}. DP[${i}][${w}] ← ${newVal}`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, w)], type: 'write', target: 'dp' }],
                variables: { i, w, "DP[i][w]": newVal },
                gridDimensions: { rows, cols },
                stack: [...stack]
            });
        } else {
            steps.push({
                stepId: stepId++,
                lineNumber: 10, // else
                description: `Exclude only (wt > w). DP[${i}][${w}] ← compute(i-1, w)`,
                dpTable: [...dpTable],
                highlights: [],
                variables: { i, w, wt },
                gridDimensions: { rows, cols },
                stack: [...stack]
            });

            const newVal = compute(i - 1, w);
            dpTable[getIndex(i, w)] = newVal;

            steps.push({
                stepId: stepId++,
                lineNumber: 10,
                description: `Values returned. DP[${i}][${w}] ← ${newVal}`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, w)], type: 'write', target: 'dp' }],
                variables: { i, w, "DP[i][w]": newVal },
                gridDimensions: { rows, cols },
                stack: [...stack]
            });
        }

        const finalRes = dpTable[getIndex(i, w)]!;

        steps.push({
            stepId: stepId++,
            lineNumber: 11,
            description: `Return DP[${i}][${w}] = ${finalRes}`,
            dpTable: [...dpTable],
            highlights: [{ indices: [getIndex(i, w)], type: 'read', target: 'dp' }],
            variables: { i, w, "DP[i][w]": finalRes },
            gridDimensions: { rows, cols },
            stack: [...stack]
        });

        stack.pop();
        return finalRes;
    }

    compute(n, W);

    // 5. Backtracking Path
    const fullPathIndices: number[] = [];
    const matchIndices: number[] = [];
    let curI = n;
    let curW = W;

    while (curI > 0 && curW >= 0) {
        const idx = getIndex(curI, curW);

        const valAtIndex = dpTable[idx] ?? -1;
        if (valAtIndex === -1) break;

        fullPathIndices.push(idx);

        if (valAtIndex === 0) break;

        const currentVal = valAtIndex;
        // In Top-Down, unvisited cells might be -1. Safe access:
        const prevVal = dpTable[getIndex(curI - 1, curW)] ?? -1;
        const prevValSafe = prevVal === -1 ? 0 : prevVal;

        // Logic: if val == prevVal (and valid exclusion), then exclude.
        // Actually for Knapsack, if val == prevVal, we could always have excluded.
        if (currentVal === prevValSafe) {
            curI--;
        } else {
            matchIndices.push(idx);
            const wVal = weights[curI - 1];
            curW -= wVal;
            curI--;
        }
    }
    if (curI === 0) fullPathIndices.push(getIndex(curI, curW));

    const forwardPath = fullPathIndices.reverse();
    const arrows: Record<number, string> = {};
    const longArrows: { from: number, to: number }[] = [];

    for (let k = 0; k < forwardPath.length - 1; k++) {
        const curr = forwardPath[k];
        const next = forwardPath[k + 1];
        const currCol = curr % cols;
        const nextCol = next % cols;

        if (currCol === nextCol) {
            arrows[next] = '↓';
        } else {
            longArrows.push({ from: curr, to: next });
        }
    }

    steps.push({
        stepId: stepId++,
        lineNumber: 11,
        description: `Backtracking complete.`,
        dpTable: [...dpTable],
        highlights: [
            {
                indices: forwardPath.filter(idx => !matchIndices.includes(idx)),
                type: 'current',
                target: 'dp'
            },
            {
                indices: matchIndices,
                type: 'match',
                target: 'dp'
            }
        ],
        variables: { result: dpTable[getIndex(n, W)]! },
        gridDimensions: { rows, cols },
        arrows,
        longArrows,
        stack: []
    });



    return steps;
};


export const calculateLASBottomUp = (A: number[]): DPStep[] => {
    const steps: DPStep[] = [];
    let stepId = 0;
    const n = A.length;

    // DP Table is (n+1) x (n+1)
    // Rows 0..n (index i), Cols 0..n (length l)
    const rows = n + 1;
    const cols = n + 1;

    // Initialization: Fill with appropriate infinities
    // We want to detect "empty" or "invalid" states.
    // Standard LAS: M[0][0] = -Infinity, M[0][l] = Infinity
    const INF = Infinity;
    const NEG_INF = -Infinity;

    const dpTable: number[] = Array.from({ length: rows * cols }, () => INF);
    const getIndex = (r: number, c: number) => r * cols + c;

    // 1. Initial State
    steps.push({
        stepId: stepId++,
        lineNumber: 1,
        description: `Start LAS(A). n=${n}`,
        dpTable: [...dpTable],
        highlights: [],
        variables: { n },
        gridDimensions: { rows, cols }
    });

    // Initialize row 0 and col 0 base cases safely.
    // M[0][0] = -∞
    // M[i][0] = -∞ for all i (length 0 ends with -∞ virtual element)
    // M[0][l] = ∞ for l > 0

    for (let c = 0; c <= n; c++) dpTable[getIndex(0, c)] = c === 0 ? NEG_INF : INF;
    for (let r = 1; r <= n; r++) dpTable[getIndex(r, 0)] = NEG_INF; // Pre-fill col 0

    steps.push({
        stepId: stepId++,
        lineNumber: 3,
        description: `Init DP[0...n][0]=${NEG_INF}, DP[0][1..n]=${INF}`,
        dpTable: [...dpTable],
        highlights: [
            ...Array.from({ length: cols }, (_, c) => ({ indices: [getIndex(0, c)], type: 'write' as const, target: 'dp' as const })),
            ...Array.from({ length: rows - 1 }, (_, r) => ({ indices: [getIndex(r + 1, 0)], type: 'write' as const, target: 'dp' as const }))
        ],
        variables: { n },
        gridDimensions: { rows, cols }
    });

    // 2. Loop
    for (let i = 1; i <= n; i++) {
        const val = A[i - 1];

        for (let l = 1; l <= n; l++) {
            // Pseudocode:
            // 6: exclude <- DP[i-1][l]
            // 7: include <- INF
            // 8: if DP[i-1][l-1] < A[i]
            // 9: include <- A[i]
            // 10: DP[i][l] <- min(exclude, include)

            const exclude = dpTable[getIndex(i - 1, l)]; // Should be valid number or infinity
            let include = INF;
            const prev = dpTable[getIndex(i - 1, l - 1)];

            // Step for checking extension (Line 8)
            // We can implicitly show exclude/include setup or just focus on the check.
            steps.push({
                stepId: stepId++,
                lineNumber: 8,
                description: `For i=${i} (val=${val}), l=${l}. Check: DP[${i - 1}][${l - 1}] (${prev}) < ${val}?`,
                dpTable: [...dpTable],
                highlights: [
                    { indices: [getIndex(i, l)], type: 'current', target: 'dp' },
                    { indices: [getIndex(i - 1, l), getIndex(i - 1, l - 1)], type: 'read', target: 'dp' }
                ],
                variables: { i, l, val, prev, exclude },
                gridDimensions: { rows, cols }
            });

            if (prev !== undefined && prev < val) {
                include = val;
                steps.push({
                    stepId: stepId++,
                    lineNumber: 9,
                    description: `Yes. Extend! include = ${val}`,
                    dpTable: [...dpTable],
                    highlights: [],
                    variables: { i, l, include },
                    gridDimensions: { rows, cols }
                });
            } else {
                // If not extending, include remains INF.
                steps.push({
                    stepId: stepId++,
                    lineNumber: 8, // Stay on check line? or maybe 9 (skipped)? Stay on 8 implies check failed.
                    description: `No. Cannot extend. include = ∞`,
                    dpTable: [...dpTable],
                    highlights: [],
                    variables: { i, l, include },
                    gridDimensions: { rows, cols }
                });
            }

            const newVal = Math.min(exclude!, include);
            dpTable[getIndex(i, l)] = newVal;

            steps.push({
                stepId: stepId++,
                lineNumber: 10,
                description: `DP[${i}][${l}] = min(${exclude}, ${include}) = ${newVal}`,
                dpTable: [...dpTable],
                highlights: [{ indices: [getIndex(i, l)], type: 'write', target: 'dp' }],
                variables: { i, l, newVal },
                gridDimensions: { rows, cols }
            });
        }
    }

    // 3. Find Result
    let maxL = 0;
    for (let l = n; l >= 0; l--) {
        if (dpTable[getIndex(n, l)]! < INF) {
            maxL = l;
            break;
        }
    }

    steps.push({
        stepId: stepId++,
        lineNumber: 11,
        description: `Max length is ${maxL} (largest l where DP[n][l] < ∞)`,
        dpTable: [...dpTable],
        highlights: [{ indices: [getIndex(n, maxL)], type: 'read', target: 'dp' }],
        variables: { result: maxL },
        gridDimensions: { rows, cols }
    });

    // 4. Backtracking
    const pathIndices: number[] = [];
    const solutionIndices: number[] = []; // Indices of A that are part of the solution
    const solutionDPIndices: number[] = []; // Indices in DP table for highlighting
    let curI = n;
    let curL = maxL;

    while (curI > 0 && curL > 0) {
        const currentIdx = getIndex(curI, curL);
        pathIndices.push(currentIdx);

        const currentVal = dpTable[currentIdx]!;
        const prevVal = dpTable[getIndex(curI - 1, curL)]!;

        if (currentVal === prevVal) {
            // Came from Top (Exclude A[i])
            curI--;
        } else {
            // Must have come from Diagonal (Include A[i])
            solutionIndices.push(curI - 1);
            solutionDPIndices.push(currentIdx);
            curI--;
            curL--;
        }
    }
    // Add the start point
    pathIndices.push(getIndex(curI, curL));

    const forwardPath = pathIndices.reverse();
    const arrows: Record<number, string> = {};

    for (let k = 0; k < forwardPath.length - 1; k++) {
        const curr = forwardPath[k];
        const next = forwardPath[k + 1];

        const currRow = Math.floor(curr / cols);
        // const currCol = curr % cols;
        const nextRow = Math.floor(next / cols);
        const nextCol = next % cols;
        const currCol = curr % cols;

        if (nextRow > currRow && nextCol > currCol) {
            arrows[next] = '↘';
        } else if (nextRow > currRow) {
            arrows[next] = '↓';
        }
    }

    steps.push({
        stepId: stepId++,
        lineNumber: 11,
        description: `Backtracking completed. Subsequence elements: ${solutionIndices.reverse().map(i => A[i]).join(', ')}`,
        dpTable: [...dpTable],
        highlights: [
            { indices: pathIndices, type: 'current', target: 'dp' },
            { indices: solutionDPIndices, type: 'match', target: 'dp' }
        ],
        arrows,
        variables: { result: maxL },
        gridDimensions: { rows, cols }
    });

    return steps;
};



