
import { SortingStep, SortableItem } from '@/types/sorting';

// Helper to deep copy array of objects
const copyArray = (arr: SortableItem[]) => arr.map(item => ({ ...item }));

export const calculateBubbleSortSteps = (initialArray: SortableItem[]): SortingStep[] => {
    const steps: SortingStep[] = [];
    const array = copyArray(initialArray);
    const n = array.length;

    steps.push({
        stepId: 0,
        lineNumber: 0,
        description: "Start Bubble Sort",
        array: copyArray(array),
        highlights: []
    });

    for (let j = 0; j < n; j++) {
        // Line 1
        steps.push({
            stepId: steps.length,
            lineNumber: 1,
            description: `Pass j = ${j + 1}`,
            array: copyArray(array),
            highlights: [
                { indices: Array.from({ length: j }, (_, k) => n - 1 - k), color: 'invariant' }
            ]
        });

        for (let i = 0; i < n - 1; i++) {
            // Line 2
            steps.push({
                stepId: steps.length,
                lineNumber: 2,
                description: `Check i = ${i + 1}`,
                array: copyArray(array),
                highlights: [
                    { indices: [i, i + 1], color: 'compare' },
                    { indices: Array.from({ length: j }, (_, k) => n - 1 - k), color: 'invariant' }
                ]
            });

            // Line 3
            if (array[i].value > array[i + 1].value) {
                steps.push({
                    stepId: steps.length,
                    lineNumber: 3,
                    description: `${array[i].value} > ${array[i + 1].value}, need swap`,
                    array: copyArray(array),
                    highlights: [
                        { indices: [i, i + 1], color: 'swap' },
                        { indices: Array.from({ length: j }, (_, k) => n - 1 - k), color: 'invariant' }
                    ]
                });

                // Line 4: Swap
                const temp = array[i];
                array[i] = array[i + 1];
                array[i + 1] = temp;

                steps.push({
                    stepId: steps.length,
                    lineNumber: 4,
                    description: `Swapped ${array[i].value} and ${array[i + 1].value}`,
                    array: copyArray(array),
                    highlights: [
                        { indices: [i, i + 1], color: 'swap' },
                        { indices: Array.from({ length: j }, (_, k) => n - 1 - k), color: 'invariant' }
                    ]
                });
            }
        }
    }

    steps.push({
        stepId: steps.length,
        lineNumber: 0,
        description: "Sorted",
        array: copyArray(array),
        highlights: [{ indices: array.map((_, i) => i), color: 'sorted' }]
    });

    return steps;
};

export const calculateSelectionSortSteps = (initialArray: SortableItem[]): SortingStep[] => {
    const steps: SortingStep[] = [];
    const array = copyArray(initialArray);
    const n = array.length;

    steps.push({
        stepId: 0,
        lineNumber: 0,
        description: "Start Selection Sort",
        array: copyArray(array),
        highlights: []
    });

    for (let j = n - 1; j >= 0; j--) {
        // Line 1
        steps.push({
            stepId: steps.length,
            lineNumber: 1,
            description: `Pass j = ${j + 1}`,
            array: copyArray(array),
            highlights: [
                { indices: Array.from({ length: n - 1 - j }, (_, k) => j + 1 + k), color: 'invariant' }
            ]
        });

        // Line 2: Find Max in 0..j
        let maxIdx = 0;
        for (let k = 1; k <= j; k++) {
            steps.push({
                stepId: steps.length,
                lineNumber: 2,
                description: `Checking k=${k + 1}, current max at ${maxIdx + 1} (${array[maxIdx].value})`,
                array: copyArray(array),
                highlights: [
                    { indices: [k], color: 'compare' },
                    { indices: [maxIdx], color: 'pivot' },
                    { indices: Array.from({ length: n - 1 - j }, (_, k) => j + 1 + k), color: 'invariant' }
                ]
            });
            if (array[k].value > array[maxIdx].value) {
                maxIdx = k;
            }
        }

        steps.push({
            stepId: steps.length,
            lineNumber: 2,
            description: `Found max at ${maxIdx + 1} (${array[maxIdx].value})`,
            array: copyArray(array),
            highlights: [
                { indices: [maxIdx], color: 'pivot' },
                { indices: Array.from({ length: n - 1 - j }, (_, k) => j + 1 + k), color: 'invariant' }
            ]
        });

        // Line 3: Swap A[maxIdx] and A[j]
        steps.push({
            stepId: steps.length,
            lineNumber: 3,
            description: `Swap A[${maxIdx + 1}] and A[${j + 1}]`,
            array: copyArray(array),
            highlights: [
                { indices: [maxIdx, j], color: 'swap' },
                { indices: Array.from({ length: n - 1 - j }, (_, k) => j + 1 + k), color: 'invariant' }
            ]
        });

        const temp = array[maxIdx];
        array[maxIdx] = array[j];
        array[j] = temp;

        steps.push({
            stepId: steps.length,
            lineNumber: 3,
            description: `Swapped`,
            array: copyArray(array),
            highlights: [
                { indices: [maxIdx, j], color: 'swap' },
                { indices: Array.from({ length: n - 1 - j }, (_, k) => j + 1 + k), color: 'invariant' }
            ]
        });
    }

    steps.push({
        stepId: steps.length,
        lineNumber: 0,
        description: "Sorted",
        array: copyArray(array),
        highlights: [{ indices: array.map((_, i) => i), color: 'sorted' }]
    });

    return steps;
};



export const calculateInsertionSortSteps = (initialArray: SortableItem[]): SortingStep[] => {
    const steps: SortingStep[] = [];
    const array = copyArray(initialArray);
    const n = array.length;

    steps.push({
        stepId: 0,
        lineNumber: 0,
        description: "Start Insertion Sort",
        array: copyArray(array),
        highlights: []
    });

    for (let j = 1; j < n; j++) {
        // Line 1
        steps.push({
            stepId: steps.length,
            lineNumber: 1,
            description: `Process index ${j + 1} (${array[j].value})`,
            array: copyArray(array),
            highlights: [
                { indices: [j], color: 'pivot' },
                { indices: Array.from({ length: j }, (_, k) => k), color: 'invariant' }
            ]
        });

        const valItem = array[j];
        let k = 0;
        while (k < j && array[k].value < valItem.value) {
            k++;
        }

        steps.push({
            stepId: steps.length,
            lineNumber: 2,
            description: `Found insertion point k=${k + 1}`,
            array: copyArray(array),
            highlights: [
                { indices: [k], color: 'compare' },
                { indices: [j], color: 'pivot' },
                { indices: Array.from({ length: j }, (_, x) => x), color: 'invariant' }
            ]
        });

        // Line 3: x <- A[j]
        steps.push({
            stepId: steps.length,
            lineNumber: 3,
            description: `x = ${valItem.value}`,
            array: copyArray(array),
            highlights: [
                { indices: [j], color: 'pivot' },
                { indices: Array.from({ length: j }, (_, x) => x), color: 'invariant' }
            ]
        });

        // Line 4: shift
        const currentArray = copyArray(array);
        const [removed] = currentArray.splice(j, 1);
        currentArray.splice(k, 0, removed);

        for (let i = 0; i < n; i++) array[i] = currentArray[i];

        steps.push({
            stepId: steps.length,
            lineNumber: 4,
            description: `Shifted and Inserted`,
            array: copyArray(array),
            highlights: [
                { indices: [k], color: 'swap' },
                { indices: Array.from({ length: j + 1 }, (_, x) => x), color: 'invariant' }
            ]
        });

        // Line 5: A[k] <- x
        steps.push({
            stepId: steps.length,
            lineNumber: 5,
            description: `Inserted ${valItem.value} at ${k + 1}`,
            array: copyArray(array),
            highlights: [
                { indices: [k], color: 'sorted' },
                { indices: Array.from({ length: j + 1 }, (_, x) => x), color: 'invariant' }
            ]
        });
    }

    steps.push({
        stepId: steps.length,
        lineNumber: 0,
        description: "Sorted",
        array: copyArray(array),
        highlights: [{ indices: array.map((_, i) => i), color: 'sorted' }]
    });

    return steps;
};

export const calculateMergeSortSteps = (initialArray: SortableItem[]): SortingStep[] => {
    const steps: SortingStep[] = [];
    const array = copyArray(initialArray);
    const recursionStack: string[] = [];
    // Auxiliary array is initially undefined or empty. We will set it when needed.
    let auxiliaryArray: SortableItem[] | undefined = undefined;

    steps.push({
        stepId: 0,
        lineNumber: 0,
        description: "Start Merge Sort",
        array: copyArray(array),
        highlights: [],
        recursionStack: [],
        auxiliaryArray: []
    });

    const merge = (l: number, m: number, r: number) => {
        // Line 9: B <- new Array(r - l + 1)
        const bSize = r - l + 1;
        auxiliaryArray = Array(bSize).fill({ id: 'empty', value: 0 });

        steps.push({
            stepId: steps.length,
            lineNumber: 9,
            description: `B = new Array(${bSize})`,
            array: copyArray(array),
            highlights: [{ indices: Array.from({ length: r - l + 1 }, (_, k) => l + k), color: 'compare' }],
            pointers: [
                { index: l, label: 'l' },
                { index: m, label: 'm' },
                { index: r, label: 'r' }
            ],
            recursionStack: [...recursionStack],
            auxiliaryArray: copyArray(auxiliaryArray!)
        });

        const left = array.slice(l, m + 1);
        const right = array.slice(m + 1, r + 1);

        // Line 10: i <- l; j <- m + 1; k <- 1
        let i = 0;
        let j = 0;
        let k = 0; // k is 0-based index for B here

        steps.push({
            stepId: steps.length,
            lineNumber: 10,
            description: `i = ${l + 1}, j = ${m + 2}, k = 1`,
            array: copyArray(array),
            highlights: [{ indices: Array.from({ length: r - l + 1 }, (_, x) => l + x), color: 'compare' }],
            pointers: [
                { index: l, label: 'l' },
                { index: m, label: 'm' },
                { index: r, label: 'r' },
                { index: l + i, label: 'i' },
                { index: m + 1 + j, label: 'j' },
                { index: k, label: 'k', target: 'aux' }
            ],
            recursionStack: [...recursionStack],
            auxiliaryArray: copyArray(auxiliaryArray!)
        });

        // Line 11: while i <= m and j <= r do
        while (i < left.length && j < right.length) {
            steps.push({
                stepId: steps.length,
                lineNumber: 11,
                description: `Check while loop: i <= m and j <= r`,
                array: copyArray(array),
                highlights: [
                    { indices: [l + i, m + 1 + j], color: 'compare' },
                ],
                pointers: [
                    { index: l, label: 'l' },
                    { index: m, label: 'm' },
                    { index: r, label: 'r' },
                    { index: l + i, label: 'i' },
                    { index: m + 1 + j, label: 'j' },
                    { index: k, label: 'k', target: 'aux' }
                ],
                recursionStack: [...recursionStack],
                auxiliaryArray: copyArray(auxiliaryArray!)
            });

            // Line 12: if A[i] < A[j] then
            steps.push({
                stepId: steps.length,
                lineNumber: 12,
                description: `Compare A[i] (${left[i].value}) < A[j] (${right[j].value})`,
                array: copyArray(array),
                highlights: [
                    { indices: [l + i, m + 1 + j], color: 'compare' },
                ],
                pointers: [
                    { index: l, label: 'l' },
                    { index: m, label: 'm' },
                    { index: r, label: 'r' },
                    { index: l + i, label: 'i' },
                    { index: m + 1 + j, label: 'j' },
                    { index: k, label: 'k', target: 'aux' }
                ],
                recursionStack: [...recursionStack],
                auxiliaryArray: copyArray(auxiliaryArray!)
            });

            if (left[i].value <= right[j].value) {
                // Line 13: B[k] <- A[i]; i <- i + 1; k <- k + 1
                auxiliaryArray![k] = { ...left[i], id: `${left[i].id}-aux` };
                steps.push({
                    stepId: steps.length,
                    lineNumber: 13,
                    description: `B[${k + 1}] = A[i] (${left[i].value})`,
                    array: copyArray(array),
                    highlights: [{ indices: [l + i], color: 'swap' }],
                    pointers: [
                        { index: l, label: 'l' },
                        { index: m, label: 'm' },
                        { index: r, label: 'r' },
                        { index: l + i, label: 'i' },
                        { index: m + 1 + j, label: 'j' },
                        { index: k, label: 'k', target: 'aux' }
                    ],
                    recursionStack: [...recursionStack],
                    auxiliaryArray: copyArray(auxiliaryArray!)
                });
                i++;
            } else {
                // Line 14: else
                // Line 15: B[k] <- A[j]; j <- j + 1; k <- k + 1
                auxiliaryArray![k] = { ...right[j], id: `${right[j].id}-aux` };
                steps.push({
                    stepId: steps.length,
                    lineNumber: 15,
                    description: `B[${k + 1}] = A[j] (${right[j].value})`,
                    array: copyArray(array),
                    highlights: [{ indices: [m + 1 + j], color: 'swap' }],
                    pointers: [
                        { index: l, label: 'l' },
                        { index: m, label: 'm' },
                        { index: r, label: 'r' },
                        { index: l + i, label: 'i' },
                        { index: m + 1 + j, label: 'j' },
                        { index: k, label: 'k', target: 'aux' }
                    ],
                    recursionStack: [...recursionStack],
                    auxiliaryArray: copyArray(auxiliaryArray!)
                });
                j++;
            }
            k++;
        }

        // Line 16: übernimm Rest links bzw. rechts
        while (i < left.length) {
            auxiliaryArray![k] = { ...left[i], id: `${left[i].id}-aux` };
            steps.push({
                stepId: steps.length,
                lineNumber: 16,
                description: `Copy remaining A[i] to B[${k + 1}]`,
                array: copyArray(array),
                highlights: [{ indices: [l + i], color: 'swap' }],
                pointers: [
                    { index: l, label: 'l' },
                    { index: m, label: 'm' },
                    { index: r, label: 'r' },
                    { index: l + i, label: 'i' },
                    { index: m + 1 + j, label: 'j' },
                    { index: k, label: 'k', target: 'aux' }
                ],
                recursionStack: [...recursionStack],
                auxiliaryArray: copyArray(auxiliaryArray!)
            });
            i++;
            k++;
        }

        while (j < right.length) {
            auxiliaryArray![k] = { ...right[j], id: `${right[j].id}-aux` };
            steps.push({
                stepId: steps.length,
                lineNumber: 16,
                description: `Copy remaining A[j] to B[${k + 1}]`,
                array: copyArray(array),
                highlights: [{ indices: [m + 1 + j], color: 'swap' }],
                pointers: [
                    { index: l, label: 'l' },
                    { index: m, label: 'm' },
                    { index: r, label: 'r' },
                    { index: l + i, label: 'i' },
                    { index: m + 1 + j, label: 'j' },
                    { index: k, label: 'k', target: 'aux' }
                ],
                recursionStack: [...recursionStack],
                auxiliaryArray: copyArray(auxiliaryArray!)
            });
            j++;
            k++;
        }

        // Line 17: kopiere B nach A[l,...,r]
        // Animation Step: Show A updated with B's values AND B's IDs (with -aux suffix)
        // This tricks Framer Motion into animating the items from B's position to A's position
        const animationArray = copyArray(array);
        for (let x = 0; x < bSize; x++) {
            animationArray[l + x] = { ...auxiliaryArray![x] }; // Keep the -aux ID
        }

        steps.push({
            stepId: steps.length,
            lineNumber: 17,
            description: `Copy B back to A[${l + 1}..${r + 1}]`,
            array: animationArray, // Use the array with -aux IDs
            highlights: [{ indices: Array.from({ length: bSize }, (_, x) => l + x), color: 'sorted' }],
            pointers: [
                { index: l, label: 'l' },
                { index: m, label: 'm' },
                { index: r, label: 'r' }
            ],
            recursionStack: [...recursionStack],
            auxiliaryArray: [] // Clear B so they "leave" B and "arrive" at A
        });

        // Update the actual array state with normal IDs for subsequent steps
        for (let x = 0; x < bSize; x++) {
            const auxItem = auxiliaryArray![x];
            // We append a suffix to the ID to ensure that Framer Motion treats these as "new" items
            // in their new positions, rather than trying to animate them from their old positions
            // which causes the "swap" glitch.
            const originalId = auxItem.id.replace('-aux', '');
            array[l + x] = { ...auxItem, id: `${originalId}-merged` };
        }

        // Reset auxiliary array
        auxiliaryArray = undefined;
    };

    const mergeSort = (l: number, r: number) => {
        recursionStack.push(`MERGESORT(A, ${l + 1}, ${r + 1})`);

        // Line 2: if l < r then
        if (l < r) {
            steps.push({
                stepId: steps.length,
                lineNumber: 2,
                description: `MergeSort [${l + 1}..${r + 1}]`,
                array: copyArray(array),
                highlights: [{ indices: [l, r], color: 'default' }],
                pointers: [
                    { index: l, label: 'l' },
                    { index: r, label: 'r' }
                ],
                recursionStack: [...recursionStack],
                auxiliaryArray: auxiliaryArray ? copyArray(auxiliaryArray) : []
            });

            // Line 3: m <- floor((l + r) / 2)
            const m = Math.floor((l + r) / 2);

            steps.push({
                stepId: steps.length,
                lineNumber: 3,
                description: `m = ${m + 1}`,
                array: copyArray(array),
                highlights: [{ indices: [m], color: 'pivot' }],
                pointers: [
                    { index: l, label: 'l' },
                    { index: m, label: 'm' },
                    { index: r, label: 'r' }
                ],
                recursionStack: [...recursionStack],
                auxiliaryArray: auxiliaryArray ? copyArray(auxiliaryArray) : []
            });

            // Line 4: MergeSort(A, l, m)
            steps.push({
                stepId: steps.length,
                lineNumber: 4,
                description: `Call MergeSort(A, ${l + 1}, ${m + 1})`,
                array: copyArray(array),
                highlights: [{ indices: [l, m], color: 'default' }],
                pointers: [
                    { index: l, label: 'l' },
                    { index: m, label: 'r' }
                ],
                recursionStack: [...recursionStack],
                auxiliaryArray: auxiliaryArray ? copyArray(auxiliaryArray) : []
            });
            mergeSort(l, m);

            // Line 5: MergeSort(A, m + 1, r)
            steps.push({
                stepId: steps.length,
                lineNumber: 5,
                description: `Call MergeSort(A, ${m + 2}, ${r + 1})`,
                array: copyArray(array),
                highlights: [{ indices: [m + 1, r], color: 'default' }],
                pointers: [
                    { index: m + 1, label: 'l' },
                    { index: r, label: 'r' }
                ],
                recursionStack: [...recursionStack],
                auxiliaryArray: auxiliaryArray ? copyArray(auxiliaryArray) : []
            });
            mergeSort(m + 1, r);

            // Line 6: Merge(A, l, m, r)
            steps.push({
                stepId: steps.length,
                lineNumber: 6,
                description: `Call Merge(A, ${l + 1}, ${m + 1}, ${r + 1})`,
                array: copyArray(array),
                highlights: [{ indices: [l, r], color: 'default' }],
                pointers: [
                    { index: l, label: 'l' },
                    { index: m, label: 'm' },
                    { index: r, label: 'r' }
                ],
                recursionStack: [...recursionStack],
                auxiliaryArray: auxiliaryArray ? copyArray(auxiliaryArray) : []
            });
            merge(l, m, r);
        } else {
            steps.push({
                stepId: steps.length,
                lineNumber: 2,
                description: `Base case: [${l + 1}..${r + 1}] (size <= 1)`,
                array: copyArray(array),
                highlights: [],
                pointers: [
                    { index: l, label: 'l' },
                    { index: r, label: 'r' }
                ],
                recursionStack: [...recursionStack],
                auxiliaryArray: auxiliaryArray ? copyArray(auxiliaryArray) : []
            });
        }

        recursionStack.pop();
    };

    mergeSort(0, array.length - 1);

    steps.push({
        stepId: steps.length,
        lineNumber: 0,
        description: "Sorted",
        array: copyArray(array),
        highlights: [{ indices: array.map((_, i) => i), color: 'sorted' }],
        recursionStack: [],
        auxiliaryArray: []
    });

    return steps;
};

export const calculateQuickSortSteps = (initialArray: SortableItem[]): SortingStep[] => {
    const steps: SortingStep[] = [];
    const array = copyArray(initialArray);
    const recursionStack: string[] = [];

    steps.push({
        stepId: 0,
        lineNumber: 0,
        description: "Start Quick Sort",
        array: copyArray(array),
        highlights: [],
        recursionStack: []
    });

    // New Partition Logic based on Hoare-like pseudocode
    const partition = (l: number, r: number) => {
        // Line 8: i <- l
        let i = l;
        steps.push({
            stepId: steps.length,
            lineNumber: 8,
            description: `i = ${l + 1}`,
            array: copyArray(array),
            highlights: [{ indices: [l, r], color: 'default' }],
            pointers: [
                { index: l, label: 'l' },
                { index: r, label: 'r' },
                { index: i, label: 'i' }
            ],
            recursionStack: [...recursionStack]
        });

        // Line 9: j <- r - 1
        let j = r - 1;
        steps.push({
            stepId: steps.length,
            lineNumber: 9,
            description: `j = ${r}`, // r - 1 + 1 = r
            array: copyArray(array),
            highlights: [{ indices: [l, r], color: 'default' }],
            pointers: [
                { index: l, label: 'l' },
                { index: r, label: 'r' },
                { index: i, label: 'i' },
                { index: j, label: 'j' }
            ],
            recursionStack: [...recursionStack]
        });

        // Line 10: p <- A[r]
        const pivotItem = array[r];
        const p = pivotItem.value;
        steps.push({
            stepId: steps.length,
            lineNumber: 10,
            description: `p = A[${r + 1}] (${p})`,
            array: copyArray(array),
            highlights: [{ indices: [r], color: 'pivot' }, { indices: Array.from({ length: r - l }, (_, k) => l + k), color: 'default' }],
            pointers: [
                { index: l, label: 'l' },
                { index: r, label: 'r' },
                { index: i, label: 'i' },
                { index: j, label: 'j' },
                { index: r, label: 'p' }
            ],
            recursionStack: [...recursionStack]
        });

        // Line 11: repeat
        while (true) {
            // Line 12: while i < r and A[i] <= p do
            while (i < r && array[i].value <= p) {
                steps.push({
                    stepId: steps.length,
                    lineNumber: 12,
                    description: `Check Left: A[${i + 1}] = ${array[i].value} <= ${p}`,
                    array: copyArray(array),
                    highlights: [{ indices: [i], color: 'compare' }, { indices: [r], color: 'pivot' }],
                    pointers: [
                        { index: l, label: 'l' },
                        { index: r, label: 'r' },
                        { index: i, label: 'i' },
                        { index: j, label: 'j' },
                        { index: r, label: 'p' }
                    ],
                    recursionStack: [...recursionStack]
                });
                // Line 13: i <- i + 1
                i++;
                steps.push({
                    stepId: steps.length,
                    lineNumber: 13,
                    description: `i = ${i + 1}`,
                    array: copyArray(array),
                    highlights: [{ indices: [i], color: 'compare' }, { indices: [r], color: 'pivot' }],
                    pointers: [
                        { index: l, label: 'l' },
                        { index: r, label: 'r' },
                        { index: i, label: 'i' },
                        { index: j, label: 'j' },
                        { index: r, label: 'p' }
                    ],
                    recursionStack: [...recursionStack]
                });
            }
            // Show stop at i
            steps.push({
                stepId: steps.length,
                lineNumber: 12,
                description: `Left stopped at i=${i + 1} (${array[i].value} > ${p})`,
                array: copyArray(array),
                highlights: [{ indices: [i], color: 'compare' }, { indices: [r], color: 'pivot' }],
                pointers: [
                    { index: l, label: 'l' },
                    { index: r, label: 'r' },
                    { index: i, label: 'i' },
                    { index: j, label: 'j' },
                    { index: r, label: 'p' }
                ],
                recursionStack: [...recursionStack]
            });

            // Line 14: while j > l and A[j] > p do
            while (j > l && array[j].value > p) {
                steps.push({
                    stepId: steps.length,
                    lineNumber: 14,
                    description: `Check Right: A[${j + 1}] = ${array[j].value} > ${p}`,
                    array: copyArray(array),
                    highlights: [{ indices: [j], color: 'compare' }, { indices: [r], color: 'pivot' }],
                    pointers: [
                        { index: l, label: 'l' },
                        { index: r, label: 'r' },
                        { index: i, label: 'i' },
                        { index: j, label: 'j' },
                        { index: r, label: 'p' }
                    ],
                    recursionStack: [...recursionStack]
                });
                // Line 15: j <- j - 1
                j--;
                steps.push({
                    stepId: steps.length,
                    lineNumber: 15,
                    description: `j = ${j + 1}`,
                    array: copyArray(array),
                    highlights: [{ indices: [j], color: 'compare' }, { indices: [r], color: 'pivot' }],
                    pointers: [
                        { index: l, label: 'l' },
                        { index: r, label: 'r' },
                        { index: i, label: 'i' },
                        { index: j, label: 'j' },
                        { index: r, label: 'p' }
                    ],
                    recursionStack: [...recursionStack]
                });
            }
            // Show stop at j
            steps.push({
                stepId: steps.length,
                lineNumber: 14,
                description: `Right stopped at j=${j + 1} (${array[j].value} <= ${p})`,
                array: copyArray(array),
                highlights: [{ indices: [j], color: 'compare' }, { indices: [r], color: 'pivot' }],
                pointers: [
                    { index: l, label: 'l' },
                    { index: r, label: 'r' },
                    { index: i, label: 'i' },
                    { index: j, label: 'j' },
                    { index: r, label: 'p' }
                ],
                recursionStack: [...recursionStack]
            });

            // Line 16: if i < j then
            if (i < j) {
                // Line 17: Swap A[i] and A[j]
                steps.push({
                    stepId: steps.length,
                    lineNumber: 17,
                    description: `Swap A[${i + 1}] and A[${j + 1}]`,
                    array: copyArray(array),
                    highlights: [{ indices: [i, j], color: 'swap' }, { indices: [r], color: 'pivot' }],
                    pointers: [
                        { index: l, label: 'l' },
                        { index: r, label: 'r' },
                        { index: i, label: 'i' },
                        { index: j, label: 'j' },
                        { index: r, label: 'p' }
                    ],
                    recursionStack: [...recursionStack]
                });

                const temp = array[i];
                array[i] = array[j];
                array[j] = temp;

                steps.push({
                    stepId: steps.length,
                    lineNumber: 17,
                    description: `Swapped`,
                    array: copyArray(array),
                    highlights: [{ indices: [i, j], color: 'swap' }, { indices: [r], color: 'pivot' }],
                    pointers: [
                        { index: l, label: 'l' },
                        { index: r, label: 'r' },
                        { index: i, label: 'i' },
                        { index: j, label: 'j' },
                        { index: r, label: 'p' }
                    ],
                    recursionStack: [...recursionStack]
                });
            } else {
                // Line 18: until i >= j
                break;
            }
        }

        // Line 19: Swap A[i] and A[r]
        steps.push({
            stepId: steps.length,
            lineNumber: 19,
            description: `Swap Pivot A[${r + 1}] to final position A[${i + 1}]`,
            array: copyArray(array),
            highlights: [{ indices: [i, r], color: 'swap' }],
            pointers: [
                { index: l, label: 'l' },
                { index: r, label: 'r' },
                { index: i, label: 'i' },
                { index: j, label: 'j' },
                { index: r, label: 'p' }
            ],
            recursionStack: [...recursionStack]
        });

        const temp = array[i];
        array[i] = array[r];
        array[r] = temp;

        steps.push({
            stepId: steps.length,
            lineNumber: 19,
            description: `Pivot placed`,
            array: copyArray(array),
            highlights: [{ indices: [i], color: 'sorted' }],
            pointers: [
                { index: l, label: 'l' },
                { index: r, label: 'r' },
                { index: i, label: 'i' },
                { index: j, label: 'j' },
                { index: r, label: 'p' }
            ],
            recursionStack: [...recursionStack]
        });

        // Line 20: return i
        return i;
    };

    const quickSort = (l: number, r: number) => {
        recursionStack.push(`QUICKSORT(A, ${l + 1}, ${r + 1})`);

        // Line 2: if l < r then
        if (l < r) {
            steps.push({
                stepId: steps.length,
                lineNumber: 2,
                description: `QUICKSORT [${l + 1}..${r + 1}]`,
                array: copyArray(array),
                highlights: [],
                pointers: [
                    { index: l, label: 'l' },
                    { index: r, label: 'r' }
                ],
                recursionStack: [...recursionStack]
            });

            // Line 3: k <- Aufteilen(A, l, r)
            steps.push({
                stepId: steps.length,
                lineNumber: 3,
                description: `Call AUFTEILEN(A, ${l + 1}, ${r + 1})`,
                array: copyArray(array),
                highlights: [{ indices: [l, r], color: 'default' }],
                pointers: [
                    { index: l, label: 'l' },
                    { index: r, label: 'r' }
                ],
                recursionStack: [...recursionStack]
            });
            const k = partition(l, r);

            // Line 4: Quicksort(A, l, k - 1)
            steps.push({
                stepId: steps.length,
                lineNumber: 4,
                description: `Call QUICKSORT(A, ${l + 1}, ${k})`,
                array: copyArray(array),
                highlights: [{ indices: [l, k - 1], color: 'default' }],
                pointers: [
                    { index: l, label: 'l' },
                    { index: k - 1, label: 'r' }
                ],
                recursionStack: [...recursionStack]
            });
            quickSort(l, k - 1);

            // Line 5: Quicksort(A, k + 1, r)
            steps.push({
                stepId: steps.length,
                lineNumber: 5,
                description: `Call QUICKSORT(A, ${k + 2}, ${r + 1})`,
                array: copyArray(array),
                highlights: [{ indices: [k + 1, r], color: 'default' }],
                pointers: [
                    { index: k + 1, label: 'l' },
                    { index: r, label: 'r' }
                ],
                recursionStack: [...recursionStack]
            });
            quickSort(k + 1, r);
        } else {
            steps.push({
                stepId: steps.length,
                lineNumber: 2,
                description: `Base case: [${l + 1}..${r + 1}] (size <= 1)`,
                array: copyArray(array),
                highlights: [],
                pointers: [
                    { index: l, label: 'l' },
                    { index: r, label: 'r' }
                ],
                recursionStack: [...recursionStack]
            });
        }

        recursionStack.pop();
    };

    quickSort(0, array.length - 1);

    steps.push({
        stepId: steps.length,
        lineNumber: 0,
        description: "Sorted",
        array: copyArray(array),
        highlights: [{ indices: array.map((_, i) => i), color: 'sorted' }],
        recursionStack: [],
        auxiliaryArray: []
    });

    return steps;
};

export const calculateHeapSortSteps = (initialArray: SortableItem[]): SortingStep[] => {
    const steps: SortingStep[] = [];
    const array = copyArray(initialArray);
    let heapSize = array.length;

    steps.push({
        stepId: 0,
        lineNumber: 0,
        description: "Start Heap Sort",
        array: copyArray(array),
        highlights: []
    });


    const left = (i: number) => 2 * i + 1;
    const right = (i: number) => 2 * i + 2;

    const maxHeapify = (i: number, lineNumber: number = 1) => {
        const l = left(i);
        const r = right(i);
        let largest = i;

        steps.push({
            stepId: steps.length,
            lineNumber: lineNumber,
            description: `MaxHeapify at index ${i + 1}`,
            array: copyArray(array),
            highlights: [{ indices: [i], color: 'pivot' }, { indices: Array.from({ length: array.length - heapSize }, (_, k) => heapSize + k), color: 'invariant' }]
        });

        if (l < heapSize && array[l].value > array[largest].value) {
            largest = l;
        }
        if (r < heapSize && array[r].value > array[largest].value) {
            largest = r;
        }

        if (largest !== i) {
            steps.push({
                stepId: steps.length,
                lineNumber: lineNumber,
                description: `Swap ${array[i].value} with largest child ${array[largest].value}`,
                array: copyArray(array),
                highlights: [{ indices: [i, largest], color: 'swap' }, { indices: Array.from({ length: array.length - heapSize }, (_, k) => heapSize + k), color: 'invariant' }]
            });

            const temp = array[i];
            array[i] = array[largest];
            array[largest] = temp;

            maxHeapify(largest, lineNumber);
        }
    };

    // Line 1: H <- Heapify(A)
    const buildMaxHeap = () => {
        steps.push({
            stepId: steps.length,
            lineNumber: 1,
            description: "Build Max Heap",
            array: copyArray(array),
            highlights: []
        });
        for (let i = Math.floor(array.length / 2) - 1; i >= 0; i--) {
            maxHeapify(i);
        }
    };

    buildMaxHeap();

    // Line 2: for i <- n, ..., 1
    for (let i = array.length - 1; i > 0; i--) {
        steps.push({
            stepId: steps.length,
            lineNumber: 2,
            description: `Loop i = ${i + 1}`,
            array: copyArray(array),
            highlights: [{ indices: [i], color: 'pivot' }, { indices: Array.from({ length: array.length - 1 - i }, (_, k) => i + 1 + k), color: 'invariant' }]
        });

        // Line 3: A[i] <- ExtractMax(H)

        steps.push({
            stepId: steps.length,
            lineNumber: 3,
            description: `Extract Max: Swap ${array[0].value} and ${array[i].value}`,
            array: copyArray(array),
            highlights: [{ indices: [0, i], color: 'swap' }, { indices: Array.from({ length: array.length - 1 - i }, (_, k) => i + 1 + k), color: 'invariant' }]
        });

        const temp = array[0];
        array[0] = array[i];
        array[i] = temp;

        heapSize--;

        steps.push({
            stepId: steps.length,
            lineNumber: 3,
            description: `Heap Size reduced to ${heapSize}`,
            array: copyArray(array),
            highlights: [{ indices: [i], color: 'sorted' }, { indices: Array.from({ length: array.length - i }, (_, k) => i + k), color: 'invariant' }]
        });

        maxHeapify(0, 3);
    }

    steps.push({
        stepId: steps.length,
        lineNumber: 0,
        description: "Sorted",
        array: copyArray(array),
        highlights: [{ indices: array.map((_, i) => i), color: 'sorted' }]
    });

    return steps;
};
