
export enum DPAlgorithmType {
    FIBONACCI = 'FIBONACCI',
    MAXIMUM_SUBARRAY_SUM = 'MAXIMUM_SUBARRAY_SUM',
    JUMP_GAME = 'JUMP_GAME',
    LCS = 'LCS',
    EDIT_DISTANCE = 'EDIT_DISTANCE',
    SUBSET_SUM = 'SUBSET_SUM',
    KNAPSACK = 'KNAPSACK',
    LAS = 'LAS',
}

// ... existing types ...

// --- SUBSET SUM ---
export const PSEUDOCODE_SUBSET_SUM = [
    { line: 1, text: "SUBSET-SUM(A, target)", indent: 0 },
    { line: 2, text: "initialize DP[0...n][0...target]", indent: 2 },
    { line: 3, text: "DP[0...n][0] = 1", indent: 2 },
    { line: 4, text: "DP[0][1...target] = 0", indent: 2 },
    { line: 5, text: "for i ← 1,...,n do", indent: 2 },
    { line: 6, text: "for s ← 1,...,target do", indent: 4 },
    { line: 7, text: "DP[i][s] ← DP[i-1][s]", indent: 6 },
    { line: 8, text: "if A[i] ≤ s", indent: 6 },
    { line: 9, text: "DP[i][s] ← DP[i][s] or DP[i-1][s - A[i]]", indent: 8 },
    { line: 10, text: "return DP[n][target]", indent: 2 },
];

export const PSEUDOCODE_SUBSET_SUM_TOP_DOWN = [
    { line: 1, text: "SUBSET-SUM(A, target)", indent: 0 },
    { line: 2, text: "initialize DP table with -1", indent: 2 },
    { line: 3, text: "return compute(n, target)", indent: 2 },
    { line: 4, text: "compute(i, s)", indent: 0 },
    { line: 5, text: "if s == 0 return 1", indent: 2 },
    { line: 6, text: "if i == 0 return 0", indent: 2 },
    { line: 7, text: "if DP[i][s] ≠ -1 return DP[i][s]", indent: 2 },
    { line: 8, text: "DP[i][s] ← compute(i-1, s)", indent: 2 },
    { line: 9, text: "if A[i] ≤ s", indent: 2 },
    { line: 10, text: "DP[i][s] ← DP[i][s] or compute(i-1, s - A[i])", indent: 4 },
    { line: 11, text: "return DP[i][s]", indent: 2 },
];

export const PSEUDOCODE_KNAPSACK = [
    { line: 1, text: "KNAPSACK(W, wt, val, n)", indent: 0 },
    { line: 2, text: "initialize DP[0...n][0...W]", indent: 2 },
    { line: 3, text: "for i ← 0,...,n do", indent: 2 },
    { line: 4, text: "for w ← 0,...,W do", indent: 4 },
    { line: 5, text: "if i == 0 or w == 0", indent: 6 },
    { line: 6, text: "DP[i][w] ← 0", indent: 8 },
    { line: 7, text: "else if wt[i] ≤ w", indent: 6 },
    { line: 8, text: "DP[i][w] ← max(val[i] + DP[i-1][w-wt[i]],", indent: 8 },
    { line: 8, text: "               DP[i-1][w])", indent: 22 },
    { line: 10, text: "else", indent: 6 },
    { line: 11, text: "DP[i][w] ← DP[i-1][w]", indent: 8 },
    { line: 12, text: "return DP[n][W]", indent: 2 },
];

export const PSEUDOCODE_KNAPSACK_TOP_DOWN = [
    { line: 1, text: "KNAPSACK(W, wt, val, n)", indent: 0 },
    { line: 2, text: "initialize DP[0...n][0...W] with -1", indent: 2 },
    { line: 3, text: "return compute(n, W)", indent: 2 },
    { line: 4, text: "compute(i, w)", indent: 0 },
    { line: 5, text: "if i == 0 or w == 0 return 0", indent: 2 },
    { line: 6, text: "if DP[i][w] ≠ -1 return DP[i][w]", indent: 2 },
    { line: 7, text: "if wt[i] ≤ w", indent: 2 },
    { line: 8, text: "DP[i][w] ← max(val[i] + compute(i-1, w-wt[i]),", indent: 4 },
    { line: 8, text: "               compute(i-1, w))", indent: 14 },
    { line: 10, text: "else DP[i][w] ← compute(i-1, w)", indent: 2 },
    { line: 11, text: "return DP[i][w]", indent: 2 },
];

export const PSEUDOCODE_LAS = [
    { line: 1, text: "LAS(A)", indent: 0 },
    { line: 2, text: "initialize DP[0...n][0...n] with ∞", indent: 2 },
    { line: 3, text: "DP[0...n][0] ← -∞, DP[0][1...n] ← ∞", indent: 2 },
    { line: 4, text: "for i ← 1,...,n do", indent: 2 },
    { line: 5, text: "for l ← 1,...,n do", indent: 4 },
    { line: 6, text: "exclude ← DP[i-1][l]", indent: 6 },
    { line: 7, text: "include ← ∞", indent: 6 },
    { line: 8, text: "if DP[i-1][l-1] < A[i]", indent: 6 },
    { line: 9, text: "include ← A[i]", indent: 8 },
    { line: 10, text: "DP[i][l] ← min(exclude, include)", indent: 6 },
    { line: 11, text: "return max l where DP[n][l] < ∞", indent: 2 },
];


// ... existing types ...

// --- EDIT DISTANCE ---
export const PSEUDOCODE_EDIT_DISTANCE = [
    { line: 1, text: "EDIT-DISTANCE(A, B)", indent: 0 },
    { line: 2, text: "m ← len(A), n ← len(B)", indent: 2 },
    { line: 3, text: "initialize DP[0...m][0...n], fill base cases", indent: 2 },
    { line: 4, text: "for i ← 1,...,m do", indent: 2 },
    { line: 5, text: "for j ← 1,...,n do", indent: 4 },
    { line: 6, text: "if A[i] == B[j]", indent: 6 },
    { line: 7, text: "DP[i][j] ← DP[i-1][j-1]", indent: 8 },
    { line: 8, text: "else", indent: 6 },
    { line: 9, text: "DP[i][j] ← 1 + min(", indent: 8 },
    { line: 9, text: "DP[i-1][j], DP[i][j-1], DP[i-1][j-1])", indent: 10 },
    { line: 11, text: "return DP[m][n]", indent: 2 },
];

export const PSEUDOCODE_EDIT_DISTANCE_TOP_DOWN = [
    { line: 1, text: "EDIT-DISTANCE(A, B)", indent: 0 },
    { line: 2, text: "initialize DP table with -1", indent: 2 },
    { line: 3, text: "return compute(m, n)", indent: 2 },
    { line: 4, text: "compute(i, j)", indent: 0 },
    { line: 5, text: "if i==0 return j, if j==0 return i", indent: 2 },
    { line: 6, text: "if DP[i][j] ≠ -1 return DP[i][j]", indent: 2 },
    { line: 7, text: "if A[i] == B[j]", indent: 2 },
    { line: 8, text: "DP[i][j] ← compute(i-1, j-1)", indent: 4 },
    { line: 9, text: "else DP[i][j] ← 1 + min(", indent: 2 },
    { line: 9, text: "compute(i-1,j), compute(i,j-1), compute(i-1,j-1))", indent: 4 },
    { line: 11, text: "return DP[i][j]", indent: 2 },
];

export type DPApproach = 'BOTTOM_UP' | 'TOP_DOWN';

export interface DPStep {
    stepId: number;
    lineNumber: number;
    description: string;
    dpTable: (number | null)[];  // The main DP table state
    inputArray?: number[];       // For problems like Max Subarray
    highlights: {
        indices: number[];       // Indices in the dpTable
        type: 'read' | 'write' | 'current' | 'input' | 'match'; // Added 'match' for LCS
        target: 'dp' | 'input';  // Which array highlights apply to
    }[];
    variables: Record<string, number | string>;
    stack?: string[]; // Recursion stack for Top-Down visualization
    gridDimensions?: { rows: number, cols: number }; // For 2D DP tables like LCS
    arrows?: Record<number, string>; // cell index -> arrow character (e.g. '↘', '↓', '→')
    longArrows?: { from: number, to: number }[]; // For long distance arrows in backtracking
    inputGridArrows?: { from: number, to: number }[]; // For Jump Game / MSS input grid arrows
}

// --- BOTTOM UP ---
export const PSEUDOCODE_FIBONACCI = [
    { line: 1, text: "FIBONACCI(n)", indent: 0 },
    { line: 2, text: "if n ≤ 1 return n", indent: 2 },
    { line: 3, text: "F[0] ← 0", indent: 2 },
    { line: 4, text: "F[1] ← 1", indent: 2 },
    { line: 5, text: "for i ← 2,...,n do", indent: 2 },
    { line: 6, text: "F[i] ← F[i-1] + F[i-2]", indent: 4 },
    { line: 7, text: "return F[n]", indent: 2 },
];

export const PSEUDOCODE_MAX_SUBARRAY = [
    { line: 1, text: "MSS(A)", indent: 0 },
    { line: 2, text: "DP[1] ← A[1]", indent: 2 },
    { line: 3, text: "max_sum ← DP[1]", indent: 2 },
    { line: 4, text: "for i ← 2,...,n do", indent: 2 },
    { line: 5, text: "DP[i] ← max(A[i], DP[i-1] + A[i])", indent: 4 },
    { line: 6, text: "max_sum ← max(max_sum, DP[i])", indent: 4 },
    { line: 7, text: "return max(max_sum, 0)", indent: 2 },
];

// --- TOP DOWN (Memoized) ---
export const PSEUDOCODE_FIBONACCI_TOP_DOWN = [
    { line: 1, text: "FIBONACCI(n)", indent: 0 },
    { line: 2, text: "initialize F[0...n] with -1", indent: 2 },
    { line: 3, text: "return compute(n)", indent: 2 },
    { line: 4, text: "compute(i)", indent: 0 },
    { line: 5, text: "if F[i] ≠ -1 return F[i]", indent: 2 },
    { line: 6, text: "if i ≤ 1 F[i] ← i", indent: 2 },
    { line: 7, text: "else F[i] ← compute(i-1) + compute(i-2)", indent: 2 },
    { line: 8, text: "return F[i]", indent: 2 },
];

export const PSEUDOCODE_MAX_SUBARRAY_TOP_DOWN = [
    { line: 1, text: "MSS(A)", indent: 0 },
    { line: 2, text: "initialize DP[1...n] with -1", indent: 2 },
    { line: 3, text: "compute(n)", indent: 2 },
    { line: 4, text: "return max(max(DP), 0)", indent: 2 },
    { line: 5, text: "compute(i)", indent: 0 },
    { line: 6, text: "if i == 1 return A[1]", indent: 2 },
    { line: 7, text: "if DP[i] ≠ -1 return DP[i]", indent: 2 },
    { line: 8, text: "DP[i] ← max(A[i], compute(i-1) + A[i])", indent: 2 },
    { line: 9, text: "return DP[i]", indent: 2 },
];

export const PSEUDOCODE_JUMP_GAME = [
    { line: 1, text: "JUMP-GAME(A)", indent: 0 },
    { line: 2, text: "DP[0] ← 1, DP[1] ← A[1] + 1", indent: 2 },
    { line: 3, text: "k ← 1", indent: 2 },
    { line: 4, text: "while DP[k] < n do", indent: 2 },
    { line: 5, text: "k ← k + 1", indent: 4 },
    { line: 6, text: "DP[k] ← max { i + A[i] | DP[k-2] < i ≤ DP[k-1] }", indent: 4 },
    { line: 7, text: "return k", indent: 2 },
];

export const PSEUDOCODE_LCS = [
    { line: 1, text: "LCS(A, B)", indent: 0 },
    { line: 2, text: "m ← len(A), n ← len(B)", indent: 2 },
    { line: 3, text: "initialize DP[0...m][0...n] with 0", indent: 2 },
    { line: 4, text: "for i ← 1,...,m do", indent: 2 },
    { line: 5, text: "for j ← 1,...,n do", indent: 4 },
    { line: 6, text: "if A[i] == B[j] then DP[i][j] ← 1 + DP[i-1][j-1]", indent: 6 },
    { line: 7, text: "else DP[i][j] ← max(DP[i-1][j], DP[i][j-1])", indent: 6 },
    { line: 8, text: "return DP[m][n]", indent: 2 },
];

export const PSEUDOCODE_LCS_TOP_DOWN = [
    { line: 1, text: "LCS(A, B)", indent: 0 },
    { line: 2, text: "initialize DP[0...m][0...n] with -1", indent: 2 },
    { line: 3, text: "return compute(m, n)", indent: 2 },
    { line: 4, text: "compute(i, j)", indent: 0 },
    { line: 5, text: "if i == 0 or j == 0 return 0", indent: 2 },
    { line: 6, text: "if DP[i][j] ≠ -1 return DP[i][j]", indent: 2 },
    { line: 7, text: "if A[i] == B[j]", indent: 2 },
    { line: 8, text: "DP[i][j] ← 1 + compute(i-1, j-1)", indent: 4 },
    { line: 9, text: "else DP[i][j] ← max(compute(i-1, j), compute(i, j-1))", indent: 2 },
    { line: 10, text: "return DP[i][j]", indent: 2 },
];
