import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VisualizerHeader from './VisualizerHeader';
import { BSTManager, MaxHeapManager, TwoThreeManager, TreeNode, layoutTree, TreeStep, getTreeBounds } from '@/utils/treeUtils';
import { RotateCcw, Search, Plus, Trash2 } from 'lucide-react';
// import { clsx } from 'clsx';

interface TreeModeProps {
  mode: 'TREES';
  setMode: (mode: 'TREES') => void;
  onBack: () => void;
}

const TreeMode: React.FC<TreeModeProps> = ({ onBack }) => {
  const [algorithm, setAlgorithm] = useState<string>('BINARY SEARCH TREE');
  const [inputValue, setInputValue] = useState<string>('');
  // const [treeRoot, setTreeRoot] = useState<TreeNode | null>(null);
  const [steps, setSteps] = useState<TreeStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState("Enter a number to insert.");

  // Logic Managers (persisted)
  const bstManager = useRef(new BSTManager());
  const heapManager = useRef(new MaxHeapManager());
  const twoThreeManager = useRef(new TwoThreeManager());
  
  const getManager = () => {
      switch(algorithm) {
          case 'BINARY SEARCH TREE': return bstManager.current;
          case 'MAX_HEAP': return heapManager.current;
          case '2-3_TREE': return twoThreeManager.current;
          default: return bstManager.current;
      }
  };

  // --- Animation Controls ---
  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isPlaying && currentStepIndex < steps.length - 1) {
          interval = setInterval(() => {
              setCurrentStepIndex(prev => prev + 1);
          }, 1200);
      } else {
          setIsPlaying(false);
      }
      return () => clearInterval(interval);
  }, [isPlaying, currentStepIndex, steps]);

  // --- Actions ---
  const handleInsert = () => {
      const val = parseInt(inputValue);
      if (isNaN(val)) return;
      
      const mgr = getManager();
      const newSteps = mgr.insert(val);
      
      // Update UI
      setSteps(newSteps);
      setCurrentStepIndex(0);
      setIsPlaying(true);
      setInputValue('');
  };

  const handleSearch = () => {
      const val = parseInt(inputValue);
      if (isNaN(val)) return;
      const mgr = getManager();
      const newSteps = mgr.search(val);
      setSteps(newSteps);
      setCurrentStepIndex(0);
      setIsPlaying(true);
      setInputValue('');
  };

  const handleDelete = () => {
      const val = parseInt(inputValue);
      if (isNaN(val)) return;
      const mgr = getManager();
      const newSteps = mgr.delete(val);
      setSteps(newSteps);
      setCurrentStepIndex(0);
      setIsPlaying(true);
      setInputValue('');
  };

  const handleExtractMax = () => {
      if (algorithm !== 'MAX_HEAP') return;
      const mgr = heapManager.current; // Explicitly cast/use specific manager ref to avoid type issues if needed, or just getManager()
      const newSteps = mgr.extractMax();
      setSteps(newSteps);
      setCurrentStepIndex(0);
      setIsPlaying(true);
  };
  
  const handleReset = useCallback(() => {
      // Reset manager state
      if (algorithm === 'BINARY SEARCH TREE') bstManager.current = new BSTManager();
      if (algorithm === 'MAX_HEAP') heapManager.current = new MaxHeapManager();
      if (algorithm === '2-3_TREE') twoThreeManager.current = new TwoThreeManager();
      
      // setTreeRoot(null);
      setSteps([]);
      setCurrentStepIndex(0);
      setMessage("Tree cleared.");
  }, [algorithm]);

  // Reset when algorithm changes
  useEffect(() => {
      handleReset();
  }, [algorithm, handleReset]);

  // --- Rendering Helpers ---
  // Apply Layout to current step's root
  const currentRoot = steps.length > 0 ? steps[currentStepIndex].root : (getManager().root);
  const layoutRoot = layoutTree(currentRoot ? JSON.parse(JSON.stringify(currentRoot)) : null, 800);
  

  const { minX, maxX, minY, maxY } = getTreeBounds(currentRoot ? layoutRoot : null);
  // const treeWidth = maxX - minX;
  // const treeHeight = maxY - minY;
  
  // Base 800x600.
  // If tree is smaller, center it? No, layoutTree centers it already.
  // We just need to ensure the viewBox covers the tree.
  
  // Simply adopt the bounding box as the view box with some logic.
  // If tree is smaller than 800x600, use 800x600 centered on 400,300?
  // Actually layoutTree puts root at x=400, y=100.
  
  // Let's use a simple approach: 
  // ViewBox X = min(0, minX)
  // ViewBox Y = min(0, minY)
  // ViewBox W = max(800, maxX - min(0, minX))
  // ViewBox H = max(600, maxY - min(0, minY))

  // Better: Center on tree center?
  // Let's just ensure the whole tree is visible.
  
  const vbX = Math.min(0, minX);
  const vbY = Math.min(0, minY);
  const vbW = Math.max(800, maxX) - vbX;
  const vbH = Math.max(600, maxY) - vbY;

  // Status Message update
  useEffect(() => {
     if(steps.length > 0 && steps[currentStepIndex]) {
         setMessage(steps[currentStepIndex].description);
     }
  }, [currentStepIndex, steps]);
  
  // --- Flatten Tree for Rendering ---
  const edges: React.ReactNode[] = [];
  const nodes: React.ReactNode[] = [];

  const traverseAndCollect = (node: TreeNode | null) => {
      if (!node) return;

      // Collect Edges
      node.children.forEach((child) => {
          if (child) {
              // Calculate edge start point based on parent type
              let startX = node.x;
              let startY = node.y;

              if (node.type === 'inner') {
                   // 2-3 Tree Internal Node: Distribute edges
                   // Visual Width calculation matches the rect width: node.keys.length * 28 + 20
                   // Rect starts at x-24. Center is roughly x + (width/2) - 24? 
                   // Accessing the exact rendered offset is tricky, let's approximate.
                   // The Rect is drawn from x - 24. Width is W. Center of node is technically node.x.
                   // But visual center of rect might be offset.
                   // We used rect x={-24}. So left edge is at node.x - 24.
                   // Width is node.keys.length * 28 + 20.
                   
                   const width = node.keys.length * 28 + 20;
                   const rectLeft = -24; // relative to node.x
                   const rectCenter = rectLeft + width / 2; // relative to node.x

                   // Adjust startX to be the visual center of the block
                   startX = node.x + rectCenter;
                   startY = node.y + 16; // Bottom of rect (height 32, centered at 0 means -16 to 16)
              }

              edges.push(
                  <motion.line 
                    key={`edge-${node.id}-${child.id}`}
                    initial={false}
                    animate={{ x1: startX, y1: startY, x2: child.x, y2: child.y }}
                    transition={{ duration: 0.3 }}
                    stroke="#475569"
                    strokeWidth="2"
                  />
              );
              traverseAndCollect(child);
          }
      });

      // Collect Node
      nodes.push(
          <motion.g 
            key={node.id}
            initial={false}
            animate={{ x: node.x, y: node.y }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 20 }}
            className="absolute"
            // We use standard motion.g with direct x/y or transform. 
            // SVG transform is better for performance usually, but Framer Motion handles layout animations well.
            // Let's use simple x/y mapping for g if supported, generally transform is safer for SVG groups.
          >
             {/* We need to reset the inner transform if we are animating the group's position */}
             {/* Actually, it's easier to just translate the group */}
             
             {node.type === 'inner' ? (
                 <g>
                     <rect 
                        x={-24} y={-16} 
                        width={node.keys.length * 28 + 20} 
                        height={32} 
                        rx="6"
                        fill={node.highlight === 'insert' ? '#3b82f6' : '#1e293b'}
                        stroke={node.highlight === 'search' ? '#d97706' : '#334155'}
                        strokeWidth="2"
                     />
                     {node.keys.map((key, i) => (
                         <text 
                            key={i}
                            x={-24 + 10 + (i * 28) + 14} 
                            y="1" 
                            dy=".3em" 
                            textAnchor="middle" 
                            className="fill-white font-bold text-xs select-none"
                         >
                            {key}
                         </text>
                     ))}
                     {node.keys.length > 1 && (
                         <line x1={-24 + 10 + 28} y1={-12} x2={-24 + 10 + 28} y2={12} stroke="#334155" strokeWidth="1" />
                     )}
                 </g>
             ) : (
                 <g>
                    <circle 
                        r="18" 
                        fill={
                            node.highlight === 'match' ? '#10b981' : 
                            node.highlight === 'search' ? '#f59e0b' : 
                            node.highlight === 'insert' ? '#3b82f6' : 
                            node.highlight === 'delete' ? '#ef4444' :
                            '#1e293b'
                        }
                        stroke={
                            node.highlight === 'match' ? '#059669' : 
                            node.highlight === 'search' ? '#d97706' : 
                            node.highlight === 'insert' ? '#2563eb' : 
                            node.highlight === 'delete' ? '#b91c1c' :
                            '#334155'
                        }
                        strokeWidth="2"
                    />
                     <text 
                        dy=".3em" 
                        textAnchor="middle" 
                        className="fill-white font-bold text-xs select-none"
                     >
                        {node.keys.join(',')}
                     </text>
                 </g>
             )}
          </motion.g>
      );
  };

  if (currentRoot && layoutRoot) {
      traverseAndCollect(layoutRoot);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <VisualizerHeader 
        mode="TREES" 
        setMode={() => {}} 
        algorithms={['BINARY SEARCH TREE', 'MAX_HEAP', '2-3_TREE']}
        currentAlgorithm={algorithm}
        setAlgorithm={setAlgorithm}
        onBack={onBack}
      />

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Visualization Canvas */}
        <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
             {/* Message Toast */}
            <AnimatePresence mode="wait">
                {steps.length > 0 && currentStepIndex < steps.length - 1 && (
                    <motion.div 
                    key="message-box"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-6 py-3 bg-slate-800/90 backdrop-blur text-slate-200 rounded-full border border-slate-700 shadow-lg text-sm font-medium"
                    >
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>

            <svg width="100%" height="100%" viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`} preserveAspectRatio="xMidYMin meet">
                <AnimatePresence>
                    {edges}
                    {nodes}
                </AnimatePresence>

                {!currentRoot && (
                    <text x="400" y="300" textAnchor="middle" fill="#475569" fontSize="16">
                        Tree is empty. Start by inserting a value.
                    </text>
                )}
            </svg>
        </div>

        {/* Right: Control Panel */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col gap-8 shadow-2xl z-20">
            <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Controls</h3>
                <div className="flex flex-col gap-3">
                     <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Value"
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 transition-colors text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
                        />
                     </div>
                     
                     <button 
                        onClick={handleInsert}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-medium transition-colors"
                     >
                        <Plus size={16} /> Insert
                     </button>
                     
                     <div className="grid grid-cols-2 gap-2">
                         {algorithm === 'MAX_HEAP' ? (
                             <button 
                                onClick={handleExtractMax}
                                className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg text-white text-sm font-medium transition-colors"
                             >
                                <Trash2 size={16} /> Extract Max
                             </button>
                         ) : (
                             <>
                                <button 
                                    onClick={handleSearch}
                                    className="flex items-center justify-center gap-2 py-2.5 bg-sky-600 hover:bg-sky-500 rounded-lg text-white text-sm font-medium transition-colors"
                                >
                                    <Search size={16} /> Search
                                </button>

                                <button 
                                    onClick={handleDelete}
                                    className="flex items-center justify-center gap-2 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-500 border border-red-600/30 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                             </>
                         )}
                     </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800">
                    <button 
                       onClick={handleReset}
                       className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700 hover:border-slate-600"
                    >
                       <RotateCcw size={16} /> Restart / Clear Tree
                    </button>

                    <div className="mt-8">
                         <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">DEFINITION</h3>
                         <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800">
                            <ul className="list-disc pl-4 space-y-2 text-xs text-slate-300 leading-relaxed marker:text-slate-500">
                                {algorithm === 'BINARY SEARCH TREE' && (
                                    <>
                                        <li><strong>Binary Tree:</strong> Every node <em className="font-serif">v</em> has at most 2 children.</li>
                                        <li><strong>Search Property:</strong> For any node <em className="font-serif">x</em>, if <em className="font-serif">y</em> is in the left subtree of <em className="font-serif">x</em>, then <em className="font-serif">y.key &lt; x.key</em>. If <em className="font-serif">y</em> is in the right subtree, <em className="font-serif">y.key &gt; x.key</em>.</li>
                                    </>
                                )}
                                {algorithm === 'MAX_HEAP' && (
                                    <>
                                        <li><strong>Shape Property:</strong> A complete binary tree (all levels filled except possibly the last, which is filled left-to-right).</li>
                                        <li><strong>Heap Property:</strong> For every node <em className="font-serif">v</em> (other than root), <em className="font-serif">v.key &le; v.parent.key</em>.</li>
                                    </>
                                )}
                                {algorithm === '2-3_TREE' && (
                                    <>
                                        <li><strong>2-3 Condition:</strong> Every internal node has either 2 or 3 children.</li>
                                        <li><strong>Balance:</strong> All leaves are at the same depth.</li>
                                        <li><strong>Leaves:</strong> Keys are stored in leaves. Each leaf contains exactly 1 key.</li>
                                        <li><strong>2-Node (1 Separator <em className="font-serif">s1</em>):</strong>
                                            <ul className="list-[circle] ml-4 mt-1 space-y-1 text-slate-400">
                                                <li>Left subtree keys &le; <em className="font-serif">s1</em></li>
                                                <li>Right subtree keys &gt; <em className="font-serif">s1</em></li>
                                            </ul>
                                        </li>
                                        <li><strong>3-Node (2 Separators <em className="font-serif">s1 &lt; s2</em>):</strong>
                                            <ul className="list-[circle] ml-4 mt-1 space-y-1 text-slate-400">
                                                <li>Left subtree keys &le; <em className="font-serif">s1</em></li>
                                                <li>Middle subtree keys &gt; <em className="font-serif">s1</em> and &le; <em className="font-serif">s2</em></li>
                                                <li>Right subtree keys &gt; <em className="font-serif">s2</em></li>
                                            </ul>
                                        </li>
                                    </>
                                )}
                            </ul>
                         </div>
                    </div>
                </div>
            </div>




        </div>
      </div>
    </div>
  );
};

export default TreeMode;
