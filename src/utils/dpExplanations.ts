import { DPAlgorithmType } from '@/types/dp';

export interface DPExplanation {
    problem: string;
    subproblem: string;
    baseCase: string;
    recurrence: string;
    justification: string;
    orderOfComputation: string;
    solution: string;
    complexity: string; // Time and Space
    dimension: string;
}

export const DP_EXPLANATIONS: Record<DPAlgorithmType, DPExplanation> = {
    [DPAlgorithmType.FIBONACCI]: {
        problem: "Calculate the $n$-th Fibonacci number, where each number is the sum of the two preceding ones.",
        subproblem: "$F[i] =$ the $i$-th Fibonacci number.",
        baseCase: "$F[0] = 0, \\quad F[1] = 1$.",
        recurrence: "$F[i] = F[i-1] + F[i-2] \\quad \\text{for } i \\ge 2$.",
        justification: "By definition, the current Fibonacci number is the sum of the previous two numbers in the sequence.",
        orderOfComputation: "for i ← 2,...,n",
        solution: "$F[n]$ is the answer.",
        complexity: "Time: $O(n)$\nSpace: $O(n)$ (or $O(1)$ optimized).",
        dimension: "$F[0...n]$"
    },
    [DPAlgorithmType.MAXIMUM_SUBARRAY_SUM]: {
        problem: "Find the contiguous subarray within a one-dimensional array of numbers which has the largest sum.",
        subproblem: "$DP[i] =$ maximum sum of a contiguous subarray ending at index $i$ (1-based).",
        baseCase: "$DP[1] = A[1]$.",
        recurrence: "$DP[i] = \\max(A[i],\\ A[i] + DP[i-1])\\quad \\text{for } i \\ge 2$.",
        justification: "At each index $i$, we want to find the maximum sum of a contiguous subarray ending at $i$. We have two choices: either extend the subarray ending at $i-1$ by adding $A[i]$ to it, or start a fresh subarray at $A[i]$ if the previous sum was negative. The global maximum subarray sum is then the largest value found in the entire DP table, or 0 if all sums are negative.",
        orderOfComputation: "for i ← 2,...,n",
        solution: "$\\displaystyle\\max \\left\\{0,\\ \\max_{1 \\le i \\le n} DP[i]\\right\\}$.",
        complexity: "Time: $O(n)$\nSpace: $O(n)$ (or $O(1)$ optimized).",
        dimension: "$DP[1...n]$"
    },
    [DPAlgorithmType.JUMP_GAME]: {
        problem: "Given an array where each element represents the max jump length from that position, determine the minimum number of jumps to reach the last index.",
        subproblem: "$DP[k] =$ maximum index reachable with exactly $k$ jumps.",
        baseCase: "$DP[0] = 1, \\quad DP[1] = A[1] + 1$.",
        recurrence: "$DP[k] = \\max \\{ i + A[i] \\mid DP[k-2] < i \\le DP[k-1] \\}\\quad \\text{for } k \\ge 2$.",
        justification: "We define $DP[k]$ as the farthest index reachable with exactly $k$ jumps. To compute this for step $k$, we examine the range of indices that were newly reachable with $k-1$ jumps. For every index $i$ in this range, we calculate $i + A[i]$ to see the maximum reach from that position. $DP[k]$ is then the maximum of all these possible landing spots.",
        orderOfComputation: "for k ← 2,...,n",
        solution: "Minimal $k$ such that $DP[k] \\ge n$.",
        complexity: "Time: $O(n)$\nSpace: $O(n)$.",
        dimension: "$DP[0...n-1]$"
    },
    [DPAlgorithmType.LCS]: {
        problem: "Find the longest subsequence present in both sequences $A$ and $B$.",
        subproblem: "$DP[i][j] =$ length of LCS of prefixes $A[1..i]$ and $B[1..j]$.",
        baseCase: "$DP[i][0] = 0, \\quad DP[0][j] = 0$.",
        recurrence: "$DP[i][j] = \\begin{cases} 1 + DP[i-1][j-1] & \\text{if } A[i] = B[j] \\\\ \\max(DP[i-1][j], DP[i][j-1]) & \\text{if } A[i] \\neq B[j] \\end{cases}$",
        justification: "When considering characters $A[i]$ and $B[j]$, there are two cases. If they match, they contribute to the LCS, so we take the result from the prefixes excluding these characters ($DP[i-1][j-1]$) and add 1. If they strictly do not match, at least one of them is not part of the optimal solution's end. Thus, we discard either $A[i]$ or $B[j]$ and inherit the maximum length found so far from either $DP[i-1][j]$ or $DP[i][j-1]$.",
        orderOfComputation: "for i ← 1,...,m\n    for j ← 1,...,n",
        solution: "$DP[m][n]$, where $m=|A|, n=|B|$.",
        complexity: "Time: $O(mn)$\nSpace: $O(mn)$.",
        dimension: "$DP[0...m][0...n]$"
    },
    [DPAlgorithmType.EDIT_DISTANCE]: {
        problem: "Find the minimum number of operations (insert, delete, replace) to convert string $A$ to string $B$.",
        subproblem: "$DP[i][j] =$ minimum edit distance between $A[1..i]$ and $B[1..j]$.",
        baseCase: "$DP[i][0] = i, \\quad DP[0][j] = j$.",
        recurrence: "$DP[i][j] = \\begin{cases} DP[i-1][j-1] & \\text{if } A[i] = B[j] \\\\ 1 + \\min(DP[i-1][j], DP[i][j-1], DP[i-1][j-1]) & \\text{if } A[i] \\neq B[j] \\end{cases}$",
        justification: "To convert prefix $A[1..i]$ to $B[1..j]$, we check the last characters. If $A[i] == B[j]$, no new operation is needed, so cost is unchanged from $DP[i-1][j-1]$. If they differ, we must perform an operation: Insert $B[j]$ (moves to $DP[i][j-1]$), Delete $A[i]$ (moves to $DP[i-1][j]$), or Replace $A[i]$ with $B[j]$ (moves to $DP[i-1][j-1]$). We pick the minimum of these previous costs and add 1.",
        orderOfComputation: "for i ← 1,...,m\n    for j ← 1,...,n",
        solution: "$DP[m][n]$.",
        complexity: "Time: $O(mn)$\nSpace: $O(mn)$ (or $O(\\min(m, n))$ optimized).",
        dimension: "$DP[0...m][0...n]$"
    },
    [DPAlgorithmType.SUBSET_SUM]: {
        problem: "Determine if any subset of the given array sums up to a specific target.",
        subproblem: "$DP[i][s] = \\begin{cases} 1 & \\text{if a subset of the first } i \\text{ elements has sum } s \\\\ 0 & \\text{otherwise} \\end{cases}$ ",
        baseCase: "$DP[i][0] = 1 \\text{ for } 0\\le i\\le n, \\quad DP[0][s] = 0 \\text{ for } s > 0$.",
        recurrence: "$DP[i][s] = \\begin{cases} DP[i-1][s] & \\text{if } A[i] > s \\\\ DP[i-1][s] \\lor DP[i-1][s-A[i]] & \\text{if } A[i] \\le s \\end{cases}$",
        justification: "For each element $A[i]$ and target sum $s$, we have two choices: exclude or include $A[i]$. If we exclude it, we check if the sum $s$ was already possible with the first $i-1$ elements ($DP[i-1][s]$). If we include it, we check if the remaining sum $s - A[i]$ was possible ($DP[i-1][s-A[i]]$). If either choice returns true, then sum $s$ is possible.",
        orderOfComputation: "for i ← 1,...,n\n    for s ← 1,...,target",
        solution: "$DP[n][\\text{target}]$.",
        complexity: "Time: $O(n \\cdot \\text{target})$\nSpace: $O(n \\cdot \\text{target})$.",
        dimension: "$DP[0...n][0...\\text{Target}]$"
    },
    [DPAlgorithmType.KNAPSACK]: {
        problem: "Determine the maximum value of items that fit into a knapsack of capacity $W$.",
        subproblem: "$DP[i][w] =$ max value using subset of first $i$ items with capacity limit $w$.",
        baseCase: "$DP[0][w] = 0, \\quad DP[i][0] = 0$.",
        recurrence: "$DP[i][w] = \\begin{cases} DP[i-1][w] & \\text{if } wt[i] > w \\\\ \\max(DP[i-1][w], val[i] + DP[i-1][w-wt[i]]) & \\text{if } wt[i] \\le w \\end{cases}$",
        justification: "We decide whether to include item $i$ in the knapsack. If we skip it, the max value is simply what we could get with the first $i-1$ items ($DP[i-1][w]$). If we include it, we gain $val[i]$ but use up $wt[i]$ capacity, so we add it to the best result for the remaining capacity ($val[i] + DP[i-1][w-wt[i]]$). We take the maximum of these two options.",
        orderOfComputation: "for i ← 1,...,n\n    for w ← 0,...,W",
        solution: "$DP[n][W]$.",
        complexity: "Time: $O(nW)$\nSpace: $O(nW)$.",
        dimension: "$DP[0...n][0...W]$"
    },
    [DPAlgorithmType.LAS]: {
        problem: "Find the length of the longest ascending subsequence.",
        subproblem: "$DP[i][l] =$ smallest ending value of an increasing subseq. of length $l$ using first $i$ elements.",
        baseCase: "$DP[0][0] = -\\infty, \\text{ others } \\infty$.",
        recurrence: "$DP[i][l] = \\begin{cases} \\min(DP[i-1][l], A[i]) & \\text{if } A[i] > DP[i-1][l-1] \\\\ DP[i-1][l] & \\text{otherwise} \\end{cases}$",
        justification: "We want to extend an increasing subsequence of length $l-1$ using $A[i]$. To make it as easy as possible to extend further later, we want the ending element of our subsequence to be as small as possible. If $A[i]$ is greater than the smallest ending value for length $l-1$ ($DP[i-1][l-1]$), we can form a sequence of length $l$ ending in $A[i]$. We update $DP[i][l]$ to be the minimum of the previous ending value and $A[i]$.",
        orderOfComputation: "for i ← 1,...,n\n    for l ← 1,...,n",
        solution: "Max $l$ such that $DP[n][l] < \\infty$.",
        complexity: "Time: $O(n^2)$ (or $O(n \\log n)$ optimized)\nSpace: $O(n^2)$ (or $O(n)$ optimized).",
        dimension: "$DP[0...n][0...n]$"
    }
};

