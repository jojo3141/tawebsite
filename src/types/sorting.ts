
export enum SortingAlgorithmType {
    BUBBLE_SORT = 'BUBBLE_SORT',
    SELECTION_SORT = 'SELECTION_SORT',
    INSERTION_SORT = 'INSERTION_SORT',
    MERGE_SORT = 'MERGE_SORT',
    QUICK_SORT = 'QUICK_SORT',
    HEAP_SORT = 'HEAP_SORT',
}

export type AlgorithmMode = 'GRAPH' | 'SORTING';

export interface SortableItem {
    id: string;
    value: number;
}

export interface SortingStep {
    stepId: number;
    lineNumber: number;
    description: string;
    array: SortableItem[];
    highlights: {
        indices: number[];
        color: 'compare' | 'swap' | 'sorted' | 'pivot' | 'invariant' | 'default';
    }[];
    variables?: Record<string, number | string>;
    pointers?: { index: number, label: string, target?: 'main' | 'aux' }[];
    recursionStack?: string[];
    auxiliaryArray?: SortableItem[];
}

export const PSEUDOCODE_BUBBLE_SORT = [
    { line: 1, text: "for j ← 1,2,...,n do", indent: 0 },
    { line: 2, text: "for i ← 1,2,...,n - 1 do", indent: 2 },
    { line: 3, text: "if A[i] > A[i + 1] then", indent: 4 },
    { line: 4, text: "tausche A[i] und A[i + 1]", indent: 6 },
];

export const PSEUDOCODE_SELECTION_SORT = [
    { line: 1, text: "for j ← n,n - 1,...,1 do", indent: 0 },
    { line: 2, text: "k ← Index des Maximums in A[1,...,j]", indent: 2 },
    { line: 3, text: "tausche A[k] und A[j]", indent: 2 },
];

export const PSEUDOCODE_INSERTION_SORT = [
    { line: 1, text: "for j ← 2,3,...,n do", indent: 0 },
    { line: 2, text: "k ← kleinster Index in {1,...,j - 1} mit A[j] ≤ A[k]", indent: 2 },
    { line: 3, text: "x ← A[j]", indent: 2 },
    { line: 4, text: "verschiebe A[k,...,j - 1] nach A[k + 1,...,j]", indent: 2 },
    { line: 5, text: "A[k] ← x", indent: 2 },
];

export const PSEUDOCODE_MERGE_SORT = [
    { line: 1, text: "MERGESORT(A[1..n], l, r)", indent: 0 },
    { line: 2, text: "if l < r then", indent: 2 },
    { line: 3, text: "m ← ⌊(l + r)/2⌋", indent: 4 },
    { line: 4, text: "MERGESORT(A, l, m)", indent: 4 },
    { line: 5, text: "MERGESORT(A, m + 1, r)", indent: 4 },
    { line: 6, text: "MERGE(A, l, m, r)", indent: 4 },
    { line: 7, text: "", indent: 0 },
    { line: 8, text: "MERGE(A[1..n], l, m, r)", indent: 0 },
    { line: 9, text: "B ← neues Array mit r - l + 1 Zellen", indent: 2 },
    { line: 10, text: "i ← l; j ← m + 1; k ← 1", indent: 2 },
    { line: 11, text: "while i ≤ m and j ≤ r do", indent: 2 },
    { line: 12, text: "if A[i] < A[j] then", indent: 4 },
    { line: 13, text: "B[k] ← A[i]; i ← i + 1; k ← k + 1", indent: 6 },
    { line: 14, text: "else", indent: 4 },
    { line: 15, text: "B[k] ← A[j]; j ← j + 1; k ← k + 1", indent: 6 },
    { line: 16, text: "übernimm Rest links bzw. rechts", indent: 2 },
    { line: 17, text: "kopiere B nach A[l,...,r]", indent: 2 },
];

export const PSEUDOCODE_QUICK_SORT = [
    { line: 1, text: "QUICKSORT(A[1..n], l, r)", indent: 0 },
    { line: 2, text: "if l < r then", indent: 2 },
    { line: 3, text: "k ← AUFTEILEN(A, l, r)", indent: 4 },
    { line: 4, text: "QUICKSORT(A, l, k - 1)", indent: 4 },
    { line: 5, text: "QUICKSORT(A, k + 1, r)", indent: 4 },
    { line: 6, text: "", indent: 0 },
    { line: 7, text: "AUFTEILEN(A[1..n], l, r)", indent: 0 },
    { line: 8, text: "i ← l", indent: 2 },
    { line: 9, text: "j ← r - 1", indent: 2 },
    { line: 10, text: "p ← A[r]", indent: 2 },
    { line: 11, text: "repeat", indent: 2 },
    { line: 12, text: "while i < r and A[i] ≤ p do", indent: 4 },
    { line: 13, text: "i ← i + 1", indent: 6 },
    { line: 14, text: "while j > l and A[j] > p do", indent: 4 },
    { line: 15, text: "j ← j - 1", indent: 6 },
    { line: 16, text: "if i < j then", indent: 4 },
    { line: 17, text: "Vertausche A[i] und A[j]", indent: 6 },
    { line: 18, text: "until i ≥ j", indent: 2 },
    { line: 19, text: "Vertausche A[i] und A[r]", indent: 2 },
    { line: 20, text: "return i", indent: 2 },
];

export const PSEUDOCODE_HEAP_SORT = [
    { line: 1, text: "H ← Heapify(A)", indent: 0 },
    { line: 2, text: "for i ← n,n - 1,...,1 do", indent: 0 },
    { line: 3, text: "A[i] ← ExtractMax(H)", indent: 2 },
];
