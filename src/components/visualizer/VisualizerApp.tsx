import React, { useState } from 'react';
import GraphMode from '@/components/visualizer/GraphMode';
import SortingMode from '@/components/visualizer/SortingMode';
import DPMode from '@/components/visualizer/DPMode';
import CategorySelection, { CategoryType } from '@/components/visualizer/CategorySelection';
import TreeMode from '@/components/visualizer/TreeMode';
import { AnimatePresence, motion } from 'framer-motion';

// Extended mode type to include SELECTION and the new categories
type VisualizerMode = 'SELECTION' | CategoryType;

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
    </AnimatePresence>
  );
};

export default VisualizerApp;
