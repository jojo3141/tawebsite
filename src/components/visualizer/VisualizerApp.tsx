import React, { useState } from 'react';
import GraphMode from '@/components/visualizer/GraphMode';
import SortingMode from '@/components/visualizer/SortingMode';
import DPMode from '@/components/visualizer/DPMode';
import CategorySelection, { CategoryType } from '@/components/visualizer/CategorySelection';
import TreeMode from '@/components/visualizer/TreeMode';
import { AnimatePresence, motion } from 'framer-motion';
import { AlgorithmType } from '@/types/graph';

// Extended mode type to include SELECTION and the new categories
type VisualizerMode = 'SELECTION' | CategoryType;

// Helper constant for A&D Graph Algorithms
const AD_GRAPH_ALGORITHMS = [
  AlgorithmType.DFS,
  AlgorithmType.BFS,
  AlgorithmType.DIJKSTRA,
  AlgorithmType.BELLMAN_FORD,
  AlgorithmType.PRIM,
  AlgorithmType.KRUSKAL,
  AlgorithmType.BORUVKA,
];

const VisualizerApp: React.FC = () => {
  const [mode, setMode] = useState<VisualizerMode>('SELECTION');

  const handleBack = () => {
    setMode('SELECTION');
  };

  return (
    <AnimatePresence mode="wait">
      {mode === 'SELECTION' && (
        <motion.div 
          key="selection"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6 }}
        >
          <CategorySelection onSelect={(category) => setMode(category)} />
        </motion.div>
      )}

      {mode === 'GRAPH' && (
        <motion.div 
          key="graph"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GraphMode 
             mode={mode} 
             setMode={(m) => setMode(m)} 
             onBack={handleBack}
             availableAlgorithms={AD_GRAPH_ALGORITHMS}
          />
        </motion.div>
      )}

      {mode === 'SORTING' && (
        <motion.div 
          key="sorting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SortingMode 
             mode={mode} 
             setMode={(m) => setMode(m)} 
             onBack={handleBack} 
          />
        </motion.div>
      )}

      {mode === 'TREES' && (
        <motion.div 
            key="trees"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
        >
            <TreeMode 
                mode={mode}
                setMode={(m) => setMode(m)}
                onBack={handleBack}
            />
        </motion.div>
      )}

      {mode === 'DP' && (
        <motion.div 
            key="dp"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
        >
            <DPMode 
                mode={mode}
                setMode={(m) => setMode(m)}
                onBack={handleBack}
            />
        </motion.div>
      )}

      {mode === 'TARJAN' && (
        <motion.div 
          key="tarjan"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GraphMode 
             mode={mode} 
             setMode={(m) => setMode(m)} 
             onBack={handleBack}
             initialAlgorithm={AlgorithmType.TARJAN}
             availableAlgorithms={[AlgorithmType.TARJAN]}
          />
        </motion.div>
      )}
      
      {mode === 'EULER' && (
        <motion.div 
          key="euler"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GraphMode 
             mode={mode} 
             setMode={(m) => setMode(m)} 
             onBack={handleBack}
             initialAlgorithm={AlgorithmType.EULER}
             availableAlgorithms={[AlgorithmType.EULER]}
          />
        </motion.div>
      )}
      
      {mode === 'GREEDY_MATCHING' && (
        <motion.div 
          key="greedy_matching"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GraphMode 
             mode={mode} 
             setMode={(m) => setMode(m)} 
             onBack={handleBack}
             initialAlgorithm={AlgorithmType.HOPCROFT_KARP}
             availableAlgorithms={[AlgorithmType.HOPCROFT_KARP, AlgorithmType.GREEDY_MATCHING]}
          />
        </motion.div>
      )}

      {mode === 'GRAPH_COLORING' && (
        <motion.div 
          key="graph_coloring"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GraphMode 
             mode={mode} 
             setMode={(m) => setMode(m)} 
             onBack={handleBack}
             initialAlgorithm={AlgorithmType.SMALLEST_LAST_COLORING}
             availableAlgorithms={[AlgorithmType.SMALLEST_LAST_COLORING, AlgorithmType.GREEDY_COLORING]}
          />
        </motion.div>
      )}

      {mode === 'FORD_FULKERSON' && (
        <motion.div 
          key="ford_fulkerson"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GraphMode 
             mode={mode} 
             setMode={(m) => setMode(m)} 
             onBack={handleBack}
             initialAlgorithm={AlgorithmType.FORD_FULKERSON}
             availableAlgorithms={[AlgorithmType.FORD_FULKERSON]}
          />
        </motion.div>
      )}

      {mode === 'LONG_PATH' && (
        <motion.div 
          key="long_path"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GraphMode 
             mode={mode} 
             setMode={(m) => setMode(m)} 
             onBack={handleBack}
             initialAlgorithm={AlgorithmType.LONG_PATH}
             availableAlgorithms={[AlgorithmType.LONG_PATH]}
          />
        </motion.div>
      )}
      
      {mode === 'HAMILTON_PATH' && (
        <motion.div 
          key="hamilton_path"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GraphMode 
             mode={mode} 
             setMode={(m) => setMode(m)} 
             onBack={handleBack}
             initialAlgorithm={AlgorithmType.HAMILTON_PATH}
             availableAlgorithms={[AlgorithmType.HAMILTON_PATH]}
          />
        </motion.div>
      )}

      {mode === 'MINIMUM_EDGE_CUT' && (
        <motion.div 
          key="minimum_edge_cut"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GraphMode 
             mode={mode} 
             setMode={(m) => setMode(m)} 
             onBack={handleBack}
             initialAlgorithm={AlgorithmType.MINIMUM_EDGE_CUT}
             availableAlgorithms={[AlgorithmType.MINIMUM_EDGE_CUT]}
          />
        </motion.div>
      )}
      {mode === 'SMALLEST_ENCLOSING_DISK' && (
        <motion.div 
          key="smallest_enclosing_disk"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GraphMode 
             mode={mode} 
             setMode={(m) => setMode(m)} 
             onBack={handleBack}
             initialAlgorithm={AlgorithmType.SMALLEST_ENCLOSING_DISK}
             availableAlgorithms={[AlgorithmType.SMALLEST_ENCLOSING_DISK]}
          />
        </motion.div>
      )}
      {mode === 'JARVIS_WRAP' && (
        <motion.div 
          key="jarvis_wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GraphMode 
             mode={mode} 
             setMode={(m) => setMode(m)} 
             onBack={handleBack}
             initialAlgorithm={AlgorithmType.JARVIS_WRAP}
             availableAlgorithms={[AlgorithmType.JARVIS_WRAP, AlgorithmType.LOCAL_REPAIR]}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VisualizerApp;
