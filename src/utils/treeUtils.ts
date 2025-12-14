

export type TreeAlgorithm = 'BST' | 'MAX_HEAP' | 'TWO_THREE';

export interface TreeNode {
    id: string;
    keys: number[]; // For BST/Heap: [val]. For 2-3: [s1] or [s1, s2] or [val] (leaf)
    children: (TreeNode | null)[];
    x: number;
    y: number;
    isLeaf?: boolean; // Helpful for 2-3 trees
    type?: 'inner' | 'leaf'; // For 2-3 trees
    highlight?: 'search' | 'match' | 'insert' | 'delete' | 'path';
}

export interface TreeStep {
    root: TreeNode | null;
    description: string;
    highlightKey?: number; // The key being processed
}

// Helper to generate unique IDs
export const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Layout Logic ---

export const TREE_NODE_RADIUS = 18;
export const TREE_LEVEL_HEIGHT = 70;
export const TREE_SIBLING_GAP = 40;

/**
 * Simple tree layout algorithm.
 * Assigns x and y coordinates to all nodes.
 */
export const layoutTree = (root: TreeNode | null, width: number): TreeNode | null => {
    if (!root) return null;

    // Reset layout
    // We'll use a simple recursive approach for standard trees (BST/Heap).
    // For 2-3 trees, nodes might be wider.

    // First, map logical positions (in-order generic layout)
    // Then scale to canvas.

    // Simplest Reingold-Tilford adaptation:
    // 1. Assign Y based on depth.
    // 2. Assign X? 
    // Let's use a simpler approach: Assign relative X, then center.
    // Actually, for a visualizer, we want fixed positions if possible, or smooth transitions.
    // Let's assume standard "width per subtree" layout.

    // const assignCoordinates = (node: TreeNode, depth: number, xStart: number, availableWidth: number): number => {
    // };

    // Basic bounds check to ensure nodes don't overlap too much?
    // The simple recursive width division works ok for balanced trees but shrinks fast.
    // Better: In-order traversal index for X? (Only for BST).
    // Layout strategy depends on tree type.

    // Let's do a tailored layout that calculates required width of subtrees.

    const getSubtreeWidth = (node: TreeNode | null): number => {
        if (!node) return TREE_NODE_RADIUS * 2 + TREE_SIBLING_GAP;
        if (node.children.length === 0) return TREE_NODE_RADIUS * 2 + TREE_SIBLING_GAP;
        let w = 0;
        node.children.forEach(c => {
            w += getSubtreeWidth(c);
        });
        return w;
    };

    // Second pass: assign X
    const assignX = (node: TreeNode, x: number): number => {
        // x is the left boundary for this node's subtree area
        let currentX = x;
        const childXs: number[] = [];

        node.children.forEach(child => {
            const w = getSubtreeWidth(child);
            if (child) {
                const childCenter = assignX(child, currentX);
                childXs.push(childCenter);
            } else {
                childXs.push(currentX + w / 2);
            }
            currentX += w;
        });

        if (childXs.length > 0) {
            node.x = (childXs[0] + childXs[childXs.length - 1]) / 2;
        } else {
            node.x = x + (TREE_NODE_RADIUS * 2 + TREE_SIBLING_GAP) / 2;
        }

        return node.x;
    };

    const assignY = (node: TreeNode, depth: number) => {
        node.y = depth * TREE_LEVEL_HEIGHT + 100;
        node.children.forEach(c => {
            if (c) assignY(c, depth + 1);
        });
    };

    const totalW = getSubtreeWidth(root);
    const startX = (width - totalW) / 2; // Center in canvas

    assignX(root, startX);
    assignY(root, 0);

    return root;
};


// --- BST Logic ---




// Revised BST Class with correct cloning workflow
export class BSTManager {
    root: TreeNode | null = null;

    insert(key: number): TreeStep[] {
        const steps: TreeStep[] = [];

        // 1. Clone current state to start
        let currentTreeState = this.clone(this.root);

        if (!currentTreeState) {
            currentTreeState = {
                id: generateId(),
                keys: [key],
                children: [null, null], // Explicit Binary Structure
                x: 0,
                y: 0,
                highlight: 'insert'
            };
            this.root = currentTreeState;
            steps.push({ root: this.clone(this.root), description: `Tree was empty. Inserted root ${key}`, highlightKey: key });
            return steps;
        }

        // 2. Perform Insert on the clone, recording steps
        // Actually, we want to visualize the TRAVERSAL.
        // So we need intermediate snapshots.

        const curr = currentTreeState;
        // const snapshot = () => JSON.parse(JSON.stringify(currentTreeState)); // Deep clone simple object

        // const queue: { node: TreeNode, path: string }[] = [{ node: curr, path: 'root' }];

        // Recursive helper to allow tracking
        const insertRec = (node: TreeNode) => {
            node.highlight = 'search';
            // Snap
            steps.push({ root: this.clone(currentTreeState), description: `Comparing ${key} with ${node.keys[0]}`, highlightKey: key });

            if (key < node.keys[0]) {
                // New Step: Decision
                steps.push({ root: this.clone(currentTreeState), description: `${key} < ${node.keys[0]}, go to the left`, highlightKey: key });

                if (!node.children[0]) {
                    node.children[0] = { id: generateId(), keys: [key], children: [null, null], x: 0, y: 0, highlight: 'insert' };
                    steps.push({ root: this.clone(currentTreeState), description: `Inserted ${key} into left subtree of ${node.keys[0]}`, highlightKey: key });
                } else {
                    node.highlight = undefined; // clear previous
                    insertRec(node.children[0]!);
                }
            } else if (key > node.keys[0]) {
                // New Step: Decision
                steps.push({ root: this.clone(currentTreeState), description: `${key} > ${node.keys[0]}, go to the right`, highlightKey: key });

                if (!node.children[1]) {
                    node.children[1] = { id: generateId(), keys: [key], children: [null, null], x: 0, y: 0, highlight: 'insert' };
                    steps.push({ root: this.clone(currentTreeState), description: `Inserted ${key} into right subtree of ${node.keys[0]}`, highlightKey: key });
                } else {
                    node.highlight = undefined;
                    insertRec(node.children[1]!);
                }
            } else {
                steps.push({ root: this.clone(currentTreeState), description: `Key ${key} already exists.`, highlightKey: key });
            }
        };

        insertRec(curr);

        // Finalize
        this.clearHighlights(currentTreeState);
        this.root = currentTreeState;
        steps.push({ root: this.clone(this.root), description: `Insertion Complete`, highlightKey: key });

        return steps;
    }

    public delete(key: number): TreeStep[] {
        const steps: TreeStep[] = [];
        const currentTreeState = this.clone(this.root);

        if (!currentTreeState) {
            steps.push({ root: null, description: 'Tree is empty.' });
            return steps;
        }

        // We need to return a NEW root if it changes
        const deleteRec = (node: TreeNode | null, val: number): TreeNode | null => {
            if (!node) return null;

            node.highlight = 'search';
            steps.push({ root: this.clone(currentTreeState), description: `Searching for ${val}... Checking ${node.keys[0]}` });

            if (val < node.keys[0]) {
                steps.push({ root: this.clone(currentTreeState), description: `${val} < ${node.keys[0]}, go to the left` });
                node.highlight = undefined;
                node.children[0] = deleteRec(node.children[0], val);
            } else if (val > node.keys[0]) {
                steps.push({ root: this.clone(currentTreeState), description: `${val} > ${node.keys[0]}, go to the right` });
                node.highlight = undefined;
                node.children[1] = deleteRec(node.children[1], val);
            } else {
                // Found node to delete
                node.highlight = 'match';
                steps.push({ root: this.clone(currentTreeState), description: `Found ${val}. Deleting...` });

                // Case 1: Leaf
                if (!node.children[0] && !node.children[1]) {
                    steps.push({ root: this.clone(currentTreeState), description: `Node ${val} is a leaf. Removing.` });
                    return null;
                }

                // Case 2: One child (Right)
                if (!node.children[0]) {
                    steps.push({ root: this.clone(currentTreeState), description: `Node ${val} has only right child. Replacing with right child.` });
                    return node.children[1];
                }

                // Case 2: One child (Left)
                if (!node.children[1]) {
                    steps.push({ root: this.clone(currentTreeState), description: `Node ${val} has only left child. Replacing with left child.` });
                    return node.children[0];
                }

                // Case 3: Two children
                steps.push({ root: this.clone(currentTreeState), description: `Node ${val} has two children. Finding inorder successor (smallest in right subtree).` });

                // Find Successor (Min of Right Subtree) with visualization
                let successor = node.children[1];

                // Visual step: Go to right child
                if (successor) {
                    successor.highlight = 'search';
                    steps.push({ root: this.clone(currentTreeState), description: `Step 1: Go to the right child ${successor.keys[0]}...` });
                }

                while (successor && successor.children[0]) {
                    successor.highlight = undefined; // Clear previous
                    successor = successor.children[0];
                    successor.highlight = 'search';
                    steps.push({ root: this.clone(currentTreeState), description: `Step 2: Go left to find smallest value... Found ${successor.keys[0]}` });
                }

                if (successor) {
                    const successorVal = successor.keys[0];
                    successor.highlight = 'match';
                    steps.push({ root: this.clone(currentTreeState), description: `Found successor ${successorVal} (smallest value in right subtree).` });

                    // Replace value
                    node.keys[0] = successorVal;
                    node.highlight = 'insert';
                    successor.highlight = undefined;
                    steps.push({ root: this.clone(currentTreeState), description: `Replaced ${val} with inorder successor ${successorVal}. Now removing the duplicate successor from right subtree.` });

                    // Delete successor from right subtree
                    node.children[1] = deleteRec(node.children[1], successorVal);
                }
            }
            return node;
        };

        const newRoot = deleteRec(currentTreeState, key);
        this.clearHighlights(newRoot);
        this.root = newRoot;

        steps.push({ root: this.clone(this.root), description: `Deletion Complete.` });
        return steps;
    }

    public search(key: number): TreeStep[] {
        const steps: TreeStep[] = [];
        const rootClone = this.clone(this.root);
        if (!rootClone) return [{ root: null, description: 'Tree is empty' }];

        const searchRec = (node: TreeNode | null) => {
            if (!node) {
                steps.push({ root: this.clone(rootClone), description: `Key ${key} not found.` });
                return;
            }
            node.highlight = 'search';
            steps.push({ root: this.clone(rootClone), description: `Checking ${node.keys[0]}` });

            if (key === node.keys[0]) {
                node.highlight = 'match';
                steps.push({ root: this.clone(rootClone), description: `Found ${key}!` });
                return;
            } else if (key < node.keys[0]) {
                node.highlight = undefined; // clear
                searchRec(node.children[0]);
            } else {
                node.highlight = undefined;
                searchRec(node.children[1]);
            }
        };

        searchRec(rootClone);
        this.clearHighlights(this.root); // Don't persist highlight in real state
        return steps;
    }

    private clone(node: TreeNode | null): TreeNode | null {
        if (!node) return null;
        return {
            ...node,
            keys: [...node.keys],
            children: node.children ? node.children.map(c => this.clone(c)!) : [], // Handle nulls in logic
            highlight: node.highlight
        };
    }

    private clearHighlights(node: TreeNode | null) {
        if (!node) return;
        node.highlight = undefined;
        if (node.children) node.children.forEach(c => this.clearHighlights(c));
    }
}

// --- Max Heap Logic ---

export class MaxHeapManager {
    heap: { val: number, id: string }[] = [];

    // Convert array to TreeNode structure for visualization
    get root(): TreeNode | null {
        return this.getTreeFromHeap();
    }

    // Convert array to TreeNode structure for visualization
    private getTreeFromHeap(highlightIdx?: number, highlightType: TreeNode['highlight'] = 'search'): TreeNode | null {
        if (this.heap.length === 0) return null;

        const nodes: TreeNode[] = this.heap.map((item, i) => ({
            id: item.id, // Use persistent ID
            keys: [item.val],
            children: [],
            x: 0,
            y: 0,
            highlight: i === highlightIdx ? highlightType : undefined
        }));

        // Link children
        nodes.forEach((node, i) => {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < nodes.length) node.children[0] = nodes[left];
            if (right < nodes.length) node.children[1] = nodes[right];
        });

        return nodes[0];
    }

    public insert(key: number): TreeStep[] {
        const steps: TreeStep[] = [];

        // 1. Add to end
        this.heap.push({ val: key, id: generateId() });
        let curr = this.heap.length - 1;
        steps.push({
            root: this.getTreeFromHeap(curr, 'insert'),
            description: `Inserted ${key} at the end (index ${curr + 1}).`,
            highlightKey: key
        });

        // 2. Sift Up
        while (curr > 0) {
            const parent = Math.floor((curr - 1) / 2);

            steps.push({
                root: this.getTreeFromHeap(curr, 'search'),
                description: `Compare element ${this.heap[curr].val} with parent ${this.heap[parent].val}.`,
                highlightKey: key
            });

            if (this.heap[curr].val > this.heap[parent].val) {
                // Swap
                [this.heap[curr], this.heap[parent]] = [this.heap[parent], this.heap[curr]];
                steps.push({
                    root: this.getTreeFromHeap(parent, 'match'),
                    description: `Child is larger. Swap!`,
                    highlightKey: key
                });
                curr = parent;
            } else {
                steps.push({
                    root: this.getTreeFromHeap(curr, 'match'),
                    description: `Parent is larger (or equal). Position correct.`,
                    highlightKey: key
                });
                break;
            }
        }

        steps.push({ root: this.getTreeFromHeap(), description: 'Insertion Complete.' });
        return steps;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public delete(_key: number): TreeStep[] {
        // key is unused
        return this.extractMax();
    }

    public extractMax(): TreeStep[] {
        const steps: TreeStep[] = [];
        if (this.heap.length === 0) return [{ root: null, description: 'Heap is empty.' }];

        const max = this.heap[0].val;
        const last = this.heap[this.heap.length - 1];

        steps.push({ root: this.getTreeFromHeap(0, 'delete'), description: `Max element is ${max}.` });

        if (this.heap.length === 1) {
            this.heap.pop();
            steps.push({ root: null, description: 'Removed last element.' });
            return steps;
        }

        // Swap first and last
        // Actually for standard Heap deletion we often overwrite and drop. 
        // But to animate we should probably Swap then Pop?
        // Standard algo: Replace root with last, then remove last.
        // For animation: Swap them, then remove the one at end (old root).

        // Swap root and last
        [this.heap[0], this.heap[this.heap.length - 1]] = [this.heap[this.heap.length - 1], this.heap[0]];

        steps.push({
            root: this.getTreeFromHeap(this.heap.length - 1, 'delete'),
            description: `Swapped root with last element.`
        });

        // Pop last
        // const popped = this.heap.pop(); // The old root
        this.heap.pop();

        steps.push({
            root: this.getTreeFromHeap(0, 'insert'),
            description: `Removed max ${max}. New root is ${last.val}. Sifting down...`
        });

        // Sift Down
        let curr = 0;
        const n = this.heap.length;

        while (true) {
            let largest = curr;
            const left = 2 * curr + 1;
            const right = 2 * curr + 2;

            // Highlight current comparison
            steps.push({
                root: this.getTreeFromHeap(curr, 'search'),
                description: `Checking node ${this.heap[curr].val} against children.`
            });

            if (left < n && this.heap[left].val > this.heap[largest].val) {
                largest = left;
            }
            if (right < n && this.heap[right].val > this.heap[largest].val) {
                largest = right;
            }

            if (largest !== curr) {
                // Swap
                [this.heap[curr], this.heap[largest]] = [this.heap[largest], this.heap[curr]];

                steps.push({
                    root: this.getTreeFromHeap(largest, 'match'),
                    description: `Child ${this.heap[largest].val} is larger. Swapped.`
                });

                curr = largest;
            } else {
                steps.push({ root: this.getTreeFromHeap(), description: 'Heap property satisfied.' });
                break;
            }
        }

        return steps;
    }

    public search(key: number): TreeStep[] {
        // Linear search for visualization to show it's inefficient
        const steps: TreeStep[] = [];
        for (let i = 0; i < this.heap.length; i++) {
            steps.push({ root: this.getTreeFromHeap(i, 'search'), description: `Checking index ${i}: ${this.heap[i].val}` });
            if (this.heap[i].val === key) {
                steps.push({ root: this.getTreeFromHeap(i, 'match'), description: `Found ${key}!` });
                return steps;
            }
        }
        steps.push({ root: this.getTreeFromHeap(), description: `${key} not found.` });
        return steps;

    }
}

// --- 2-3 Tree Logic (Leaf Oriented) ---

export class TwoThreeManager {
    root: TreeNode | null = null;

    // Check if node is a leaf (contains data, no children)
    private isLeaf(node: TreeNode | null): boolean {
        if (!node) return false;
        return node.children.length === 0;
    }

    // Update separator keys for a node based on its children
    private updateSeparators(node: TreeNode) {
        if (!node || this.isLeaf(node)) return;

        // Leaf-oriented: Separator i is usually the MAX key of child i.
        // Rule: 
        // 2 children (L, R): s1. L <= s1, R > s1.
        // We can pick s1 = max(L).
        // 3 children (L, M, R): s1, s2. L <= s1, M > s1 & <= s2, R > s2.
        // s1 = max(L), s2 = max(M).

        const getMax = (n: TreeNode): number => {
            if (this.isLeaf(n)) return n.keys[0];
            // If internal, max is max of its last child (since ordered)
            return getMax(n.children[n.children.length - 1]!);
        };

        node.keys = [];
        if (node.children.length >= 1) {
            // s1 = max(child 0)
            node.keys.push(getMax(node.children[0]!));
        }
        if (node.children.length >= 2 && node.children.length === 3) {
            // s2 = max(child 1)
            node.keys.push(getMax(node.children[1]!));
        }
        // If 2 children, we have 1 separator (keys[0]). Keys has length 1.
        // If 3 children, we have 2 separators (keys[0], keys[1]). Keys has length 2.
    }

    private clone(node: TreeNode | null): TreeNode | null {
        if (!node) return null;
        return {
            ...node,
            keys: [...node.keys],
            children: node.children ? node.children.map(c => this.clone(c)!) : [],
            highlight: node.highlight
        };
    }

    public insert(key: number): TreeStep[] {
        const steps: TreeStep[] = [];
        // const startState = this.clone(this.root);

        // 1. Empty Tree
        if (!this.root) {
            this.root = { id: generateId(), keys: [key], children: [], x: 0, y: 0, highlight: 'insert', isLeaf: true };
            steps.push({ root: this.clone(this.root), description: `Tree empty. Inserted leaf ${key}.`, highlightKey: key });
            return steps;
        }

        // 2. Root is Leaf (1 node)
        if (this.isLeaf(this.root)) {
            const oldKey = this.root.keys[0];
            if (key === oldKey) {
                steps.push({ root: this.clone(this.root), description: `${key} already exists.` });
                return steps;
            }

            // Create new internal root
            const newLeaf: TreeNode = { id: generateId(), keys: [key], children: [], x: 0, y: 0, highlight: 'insert', isLeaf: true };
            const oldLeaf = this.clone(this.root)!;

            // Sort
            const first = key < oldKey ? newLeaf : oldLeaf;
            const second = key < oldKey ? oldLeaf : newLeaf;

            // Create internal root
            const newRoot: TreeNode = {
                id: generateId(),
                keys: [],
                children: [first, second],
                x: 0, y: 0,
                type: 'inner' as const
            };
            this.updateSeparators(newRoot);

            this.root = newRoot;
            steps.push({ root: this.clone(this.root), description: `Root split. Created internal node with children ${first.keys[0]}, ${second.keys[0]}.` });
            return steps;
        }

        // 3. Normal Insert (Recursive)
        // We need to return a "split result" if a child splits.
        // SplitResult: { newNode: TreeNode, promotedKey?: number }?
        // Actually for 2-3 tree, a split results in a new sibling node to the right.

        // We will execute logic on the main tree 'this.root' but perform pure functional-ish steps or just mutate and snapshot.
        // Mutation + Snapshot is easier.

        // Returns the extra node if a split occurred
        const insertRec = (node: TreeNode): TreeNode | null => {
            node.highlight = 'search';
            steps.push({ root: this.clone(this.root), description: `At internal node. Separators: ${node.keys.join(', ')}` });

            // Find child index
            let childIdx = 0;
            // 2 children: keys=[s1]. ch[0] if k<=s1, ch[1] if k>s1.
            // 3 children: keys=[s1, s2]. ch[0] <=s1, ch[1] <=s2, ch[2] >s2.

            if (key <= node.keys[0]) {
                childIdx = 0;
            } else if (node.keys.length === 1 || key <= node.keys[1]) {
                childIdx = 1;
            } else {
                childIdx = 2; // only if we have 3 children
            }



            // const childDescription = `Going to child ${childIdx + 1}.`;
            // steps.push({ root: this.clone(this.root), description: childDescription });

            const child = node.children[childIdx];
            if (!child) throw new Error("2-3 Tree should be dense");

            if (this.isLeaf(child)) {
                // We are at parent of leaf. Check if leaf exists.
                if (child.keys[0] === key) {
                    steps.push({ root: this.clone(this.root), description: `Key ${key} already exists.` });
                    return null; // No split
                }

                // Insert new leaf here into children array
                const newLeaf: TreeNode = { id: generateId(), keys: [key], children: [], x: 0, y: 0, highlight: 'insert', isLeaf: true };

                // Insert into children array at correct position
                // Logic: 
                // We have `node` (internal).
                // We need to insert `newLeaf` into `node.children` and sort.
                // We simply push and sort?

                // Insert and Sort children by their max key (or just single key since they are leaves)
                node.children.push(newLeaf);
                node.children.sort((a, b) => {
                    if (!a || !b) return 0;
                    const kA = a.keys[0];
                    const kB = b.keys[0];
                    return kA - kB;
                });

                steps.push({ root: this.clone(this.root), description: `Inserted leaf ${key} into parent.` });

                // Check for overflow
                if (node.children.length <= 3) {
                    this.updateSeparators(node);
                    steps.push({ root: this.clone(this.root), description: `Updated separators. Parent has ${node.children.length} children. OK.` });
                    return null; // OK
                } else {
                    // Overflow: 4 children. Split into 2 nodes of 2 children.
                    return split(node);
                }
            } else {
                // Internal node recursion
                const splitNode = insertRec(child!);

                if (splitNode) {
                    // Child split. We must adopt the new sibling.
                    // splitNode is the NEW RIGHT SIBLING of our child `child`.
                    // Insert splitNode into our children array right after `child`.

                    const idx = node.children.indexOf(child);
                    node.children.splice(idx + 1, 0, splitNode);

                    this.updateSeparators(node); // Update separators after structure change

                    steps.push({ root: this.clone(this.root), description: `Child split. Adopted new sibling. Parent now has ${node.children.length} children.` });

                    if (node.children.length > 3) {
                        return split(node); // We overflowed too
                    }
                } else {
                    // Child didn't split, but might have updated separators
                    this.updateSeparators(node);
                }
                return null;
            }
        };

        const split = (node: TreeNode): TreeNode => {
            // Node has 4 children. Split into Left (2) and Right (2).
            // Current node becomes Left. Return Right.

            const children = node.children.filter((c): c is TreeNode => c !== null); // Ensure dense
            const leftChildren = children.slice(0, 2);
            const rightChildren = children.slice(2, 4);

            // Reuse node for Left
            node.children = leftChildren;
            this.updateSeparators(node);

            // Create Right
            const rightNode: TreeNode = {
                id: generateId(),
                keys: [],
                children: rightChildren,
                x: 0,
                y: 0,
                type: 'inner'
            };
            this.updateSeparators(rightNode);

            return rightNode;
        };

        // Start Recursion
        const rootSplit = insertRec(this.root);

        if (rootSplit) {
            // Root split. Create new super-root.
            const oldRoot = this.root;
            const newRoot: TreeNode = {
                id: generateId(),
                keys: [],
                children: [oldRoot!, rootSplit],
                x: 0, y: 0,
                type: 'inner'
            };
            this.updateSeparators(newRoot);
            this.root = newRoot;
            steps.push({ root: this.clone(this.root), description: `Root split. Tree height increased.` });
        }

        // Final clean
        this.clearHighlights(this.root);
        steps.push({ root: this.clone(this.root), description: 'Insertion Complete.' });
        return steps;
    }

    // ... search/delete placeholders ...
    public search(key: number): TreeStep[] {
        const steps: TreeStep[] = [];
        const rootClone = this.clone(this.root);
        if (!rootClone) {
            steps.push({ root: null, description: 'Tree is empty.' });
            return steps;
        }

        let curr = rootClone;
        while (curr) {
            curr.highlight = 'search';
            steps.push({ root: this.clone(rootClone), description: `Checking node` });

            if (this.isLeaf(curr)) {
                if (curr.keys[0] === key) {
                    curr.highlight = 'match';
                    steps.push({ root: this.clone(rootClone), description: `Found ${key} in leaf.` });
                } else {
                    curr.highlight = 'delete';
                    steps.push({ root: this.clone(rootClone), description: `${key} not found.` });
                }
                this.clearHighlights(rootClone);
                steps.push({ root: this.clone(rootClone), description: 'Search Complete.' });
                return steps;
            }

            // Internal
            let childIdx = 0;
            if (key <= curr.keys[0]) {
                childIdx = 0;
            } else if (curr.keys.length === 1 || key <= curr.keys[1]) {
                childIdx = 1;
            } else {
                childIdx = 2;
            }

            curr.highlight = undefined;
            curr = curr.children[childIdx]!;
        }

        // Key not found in loop (should have hit leaf check)
        this.clearHighlights(rootClone);
        steps.push({ root: this.clone(rootClone), description: 'Search Complete.' });
        return steps;
    }

    public delete(key: number): TreeStep[] {
        const steps: TreeStep[] = [];
        if (!this.root) {
            steps.push({ root: null, description: 'Tree is empty.' });
            return steps;
        }

        const snapshot = (desc: string) => {
            steps.push({ root: this.clone(this.root), description: desc });
        };

        // --- Helpers ---
        const fixUnderflow = (parent: TreeNode, idx: number) => {
            const node = parent.children[idx]!;
            // Try Left Sibling
            if (idx > 0) {
                const leftSib = parent.children[idx - 1]!;
                if (leftSib.children.length > 2) { // 3 children -> Rich
                    snapshot(`Borrowing from left sibling (sibling has 3 children).`);
                    const childToMove = leftSib.children.pop()!;
                    node.children.unshift(childToMove);
                    this.updateSeparators(leftSib);
                    this.updateSeparators(node);
                    return;
                }
            }

            // Try Right Sibling
            if (idx < parent.children.length - 1) {
                const rightSib = parent.children[idx + 1]!;
                if (rightSib.children.length > 2) { // 3 children -> Rich
                    snapshot(`Borrowing from right sibling (sibling has 3 children).`);
                    const childToMove = rightSib.children.shift()!;
                    node.children.push(childToMove);
                    this.updateSeparators(rightSib);
                    this.updateSeparators(node);
                    return;
                }
            }

            // Merge
            if (idx > 0) {
                // Merge with Left
                const leftSib = parent.children[idx - 1]!;
                snapshot(`Merging with left sibling.`);
                leftSib.children.push(...node.children);
                parent.children.splice(idx, 1); // Remove node
                this.updateSeparators(leftSib);
                return;
            }

            if (idx < parent.children.length - 1) {
                // Merge with Right
                const rightSib = parent.children[idx + 1]!;
                snapshot(`Merging with right sibling.`);
                rightSib.children.unshift(...node.children);
                parent.children.splice(idx, 1); // Remove node
                this.updateSeparators(rightSib);
                return;
            }
        };

        let found = false;

        // Returns TRUE if 'n' underflows
        const deleteRec = (n: TreeNode): boolean => {
            n.highlight = 'search';
            snapshot(`Visiting node...`);

            if (this.isLeaf(n)) {
                // Reached leaf via internal link? Usually we inspect children of internal node.
                // This handles root case if root is leaf.
                if (n.keys[0] === key) {
                    found = true;
                    return true; // Remove me
                }
                n.highlight = undefined;
                return false;
            }

            // Internal: Find child
            let idx = 0;
            if (key <= n.keys[0]) idx = 0;
            else if (n.keys.length === 1 || key <= n.keys[1]) idx = 1;
            else idx = 2;

            const child = n.children[idx]!;

            if (this.isLeaf(child)) {
                // Check if child is target
                if (child.keys[0] === key) {
                    child.highlight = 'match';
                    snapshot(`Found leaf ${key}. Removing.`);
                    found = true;

                    n.children.splice(idx, 1);
                    this.updateSeparators(n);
                    snapshot("Removed leaf. Checking bounds.");

                    if (n.children.length < 2) return true; // Underflow
                    return false;
                } else {
                    child.highlight = 'search';
                    snapshot(`Leaf ${child.keys[0]} is not ${key}.`);
                    child.highlight = undefined;
                    return false;
                }
            }

            // Recurse
            const childUnderflow = deleteRec(child);
            n.highlight = undefined;

            if (childUnderflow) {
                snapshot(`Underflow detected at child level.`);
                fixUnderflow(n, idx);
                this.updateSeparators(n);
                snapshot(`Underflow processed.`);
                if (n.children.length < 2) return true; // Propagate underflow
            } else {
                this.updateSeparators(n);
            }

            return false;
        };

        // Execution
        if (this.isLeaf(this.root)) {
            if (this.root.keys[0] === key) {
                snapshot(`Found ${key} at root. Removing.`);
                this.root = null;
                snapshot(`Tree empty.`);
            } else {
                snapshot(`${key} not found.`);
            }
            this.clearHighlights(this.root);
            return steps;
        }

        const rootUnderflow = deleteRec(this.root);

        if (found && rootUnderflow) {
            snapshot(`Root underflow.`);
            if (this.root && this.root.children.length === 1) {
                this.root = this.root.children[0]!;
                snapshot(`Tree height reduced. New root hoisted.`);
            }
        } else if (found) {
            snapshot(`Deletion Complete.`);
        } else {
            snapshot(`${key} not found.`);
        }

        this.clearHighlights(this.root);
        return steps;
    }

    private clearHighlights(node: TreeNode | null) {
        if (!node) return;
        node.highlight = undefined;
        if (node.children) node.children.forEach(c => this.clearHighlights(c));
    }
}

// --- Helper to get Tree Bounds ---
export const getTreeBounds = (root: TreeNode | null): { minX: number, maxX: number, minY: number, maxY: number } => {
    if (!root) return { minX: 0, maxX: 800, minY: 0, maxY: 600 };

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    const traverse = (node: TreeNode) => {
        if (node.x < minX) minX = node.x;
        if (node.x > maxX) maxX = node.x;
        if (node.y < minY) minY = node.y;
        if (node.y > maxY) maxY = node.y;

        node.children.forEach(c => {
            if (c) traverse(c);
        });
    };

    traverse(root);

    // Add padding
    const PADDING = 40;
    return {
        minX: minX - PADDING,
        maxX: maxX + PADDING,
        minY: minY - PADDING,
        maxY: maxY + PADDING
    };
};

