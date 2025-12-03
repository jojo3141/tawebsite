import React, { useState } from 'react';
import GraphMode from '@/components/visualizer/GraphMode';
import SortingMode from '@/components/visualizer/SortingMode';
import { AnimatePresence, motion } from 'framer-motion';

const VisualizerApp: React.FC = () => {
  const [mode, setMode] = useState<'GRAPH' | 'SORTING'>('GRAPH');

  return (
    <AnimatePresence mode="wait">
      {mode === 'GRAPH' ? (
        <motion.div 
          key="graph"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GraphMode mode={mode} setMode={setMode} />
        </motion.div>
      ) : (
        <motion.div 
          key="sorting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SortingMode mode={mode} setMode={setMode} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VisualizerApp;
