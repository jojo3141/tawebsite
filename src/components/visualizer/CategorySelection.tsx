import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Share2, ArrowUpDown, Trees, Layers, ArrowRight, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { useCourse } from '@/context/CourseContext';

export type CategoryType = 'GRAPH' | 'SORTING' | 'TREES' | 'DP' | 'TARJAN';

interface CategorySelectionProps {
  onSelect: (category: CategoryType) => void;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({ onSelect }) => {
  const { course, setCourse } = useCourse();

  const categoriesAD: { 
    id: CategoryType; 
    name: string; 
    description: string;
    icon: React.ElementType; 
    color: string;
    gradient: string;
  }[] = [
    {
      id: 'GRAPH',
      name: 'Graph Algorithms',
      description: 'DFS, BFS, Dijkstra, MST, ect.',
      icon: Share2,
      color: 'text-indigo-400',
      gradient: 'from-indigo-500/20 to-purple-500/20',
    },
    {
      id: 'SORTING',
      name: 'Sorting Algorithms',
      description: 'Bubble, Merge, Quick, Heap, ect.',
      icon: ArrowUpDown,
      color: 'text-emerald-400',
      gradient: 'from-emerald-500/20 to-teal-500/20',
    },
    {
      id: 'TREES',
      name: 'Tree Algorithms',
      description: '2-3 Trees, Binary Search Trees, Max-Heaps.',
      icon: Trees,
      color: 'text-amber-400',
      gradient: 'from-amber-500/20 to-orange-500/20',
    },
    {
      id: 'DP',
      name: 'Dynamic Programming',
      description: 'Fibonacci, Max Subarray Sum, etc.',
      icon: Layers,
      color: 'text-rose-400',
      gradient: 'from-rose-500/20 to-pink-500/20',
    }
  ];

  const categoriesAW: { 
    id: CategoryType; 
    name: string; 
    description: string;
    icon: React.ElementType; 
    color: string;
    gradient: string;
  }[] = [
    {
      id: 'TARJAN',
      name: 'Tarjan Algorithm',
      description: 'Find articulation points and critical connections in a network.',
      icon: Share2,
      color: 'text-pink-400',
      gradient: 'from-pink-500/20 to-red-500/20',
    }
  ];

  const categories = course === 'AD' ? categoriesAD : categoriesAW;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Back to Home Button */}
      <div className="absolute top-8 left-8 z-20">
          <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 hover:border-slate-700 transition-all backdrop-blur-sm group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Home</span>
          </Link>
      </div>

      <div className="max-w-6xl w-full z-10 flex flex-col gap-12">
        <div className="flex flex-col gap-8 items-center text-center">
             <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400"
             >
                Algorithm Lab
             </motion.h1>
             
             {/* Course Switcher */}
             <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900 p-1 rounded-xl flex items-center gap-1 border border-slate-800"
             >
                {(['AD', 'AW'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCourse(c)}
                    className={clsx(
                      "relative px-4 py-2 text-sm font-bold rounded-lg transition-colors z-0 min-w-[80px]",
                      course === c ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {course === c && (
                      <motion.div
                        layoutId="visualizerCourseHighlight"
                        className="absolute inset-0 bg-slate-800 shadow-sm rounded-lg border border-slate-700"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{c === "AD" ? "A&D" : "A&W"}</span>
                  </button>
                ))}
            </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 auto-rows-fr max-w-4xl mx-auto w-full">
            {categories.map((category, index) => {
                let initialPos = {};
                if (course === 'AD') {
                    switch(index) {
                        case 0: initialPos = { x: -400, y: -400, opacity: 0 }; break;
                        case 1: initialPos = { x: 400, y: -400, opacity: 0 }; break;
                        case 2: initialPos = { x: -400, y: 400, opacity: 0 }; break;
                        case 3: initialPos = { x: 400, y: 400, opacity: 0 }; break;
                        default: initialPos = { opacity: 0 };
                    }
                } else {
                     initialPos = { y: 50, opacity: 0 };
                }

                return (
                    <motion.button
                        key={category.id}
                        initial={initialPos}
                        animate={{ x: 0, y: 0, opacity: 1 }}
                        transition={{ 
                            duration: course === 'AD' ? 1.4 : 0.5,
                            ease: "easeOut",
                            type: "spring"
                        }}
                        onClick={() => onSelect(category.id)}
                        className={clsx(
                            "group relative flex flex-col p-8 rounded-3xl border border-slate-800 text-left transition-colors duration-300 hover:border-slate-600 hover:shadow-2xl overflow-hidden bg-slate-900/40 backdrop-blur-sm",
                            // Center single item if needed, but grid handles it reasonably well usually. 
                            course === 'AW' && "col-span-full md:col-span-2 lg:col-span-2 max-w-lg mx-auto w-full" 
                        )}
                    >
                        <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", category.gradient)} />
                        
                        <div className="relative z-10 flex flex-col gap-4 h-full">
                            <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-800/80 group-hover:bg-slate-800/50 transition-colors border border-slate-700 group-hover:border-slate-600", category.color)}>
                                <category.icon size={28} />
                            </div>
                            
                            <div className="flex flex-col gap-2 mt-auto">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                    {category.name}
                                    <ArrowRight size={20} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-slate-400" />
                                </h3>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    {category.description}
                                </p>
                            </div>
                        </div>
                    </motion.button>
                );
            })}
        </div>

      </div>
    </div>
  );
};

export default CategorySelection;
