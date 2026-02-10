import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Share2, ArrowUpDown, Trees, Layers, ArrowRight, ArrowLeft, GitGraph, Scissors, Disc, Hexagon, Waypoints, Users, Waves, VectorSquare, RefreshCw, Palette, Copy } from 'lucide-react';
import { clsx } from 'clsx';
import { useCourse } from '@/context/CourseContext';

export type CategoryType = 'GRAPH' | 'SORTING' | 'TREES' | 'DP' | 'TARJAN' | 'EULER' |'GREEDY_MATCHING' | 'HOPCROFT_KARP' | 'GRAPH_COLORING' | 'FORD_FULKERSON' | 'LONG_PATH' | 'HAMILTON_PATH' | 'MINIMUM_EDGE_CUT' | 'SMALLEST_ENCLOSING_DISK' | 'JARVIS_WRAP' | 'FINDING_DUPLICATES_HASH' | 'BLOOM_FILTER';

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
    description?: string;
    icon: React.ElementType; 
    color: string;
    gradient: string;
  }[] = [
    {
      id: 'TARJAN',
      name: 'Tarjan',
      icon: GitGraph,
      color: 'text-pink-400',
      gradient: 'from-pink-500/20 to-red-500/20',
    },
    {
      id: 'EULER',
      name: 'Euler Tour',
      icon: RefreshCw,
      color: 'text-cyan-400',
      gradient: 'from-cyan-500/20 to-blue-500/20',
    },
    {
        id: 'HAMILTON_PATH',
        name: 'Hamilton Cycle',
        icon: VectorSquare,
        color: 'text-indigo-400',
        gradient: 'from-indigo-500/20 to-violet-500/20',
    },
    {
      id: 'GREEDY_MATCHING',
      name: 'Matchings',
      icon: Users,
      color: 'text-yellow-400',
      gradient: 'from-yellow-500/20 to-orange-500/20',
    },
    {
      id: 'GRAPH_COLORING',
      name: 'Colorings',
      icon: Palette,
      color: 'text-orange-400',
      gradient: 'from-orange-500/20 via-red-500/20 to-yellow-500/20',
    },
    {
        id: 'FINDING_DUPLICATES_HASH',
        name: 'Duplicates',
        icon: Copy,
        color: 'text-indigo-400',
        gradient: 'from-indigo-500/20 to-violet-500/20',
    },
    {
      id: 'LONG_PATH',
      name: 'Long Path',
      icon: Waypoints,      color: 'text-fuchsia-400',
      gradient: 'from-fuchsia-500/20 to-pink-500/20',
    },
    {
      id: 'FORD_FULKERSON',
      name: 'Max Flow',
      icon: Waves,
      color: 'text-blue-400',
      gradient: 'from-blue-500/20 to-emerald-500/20',
    },
    {
        id: 'MINIMUM_EDGE_CUT',
        name: 'Minimum Edge Cut',
        icon: Scissors,
        color: 'text-pink-400',
        gradient: 'from-pink-500/20 to-rose-500/20',
    },
    {
        id: 'SMALLEST_ENCLOSING_DISK',
        name: 'Smallest Enclosing Disk',
        icon: Disc,
        color: 'text-sky-400',
        gradient: 'from-sky-500/20 to-blue-500/20',
    },
    {
        id: 'JARVIS_WRAP',
        name: 'Convex Hull',
        icon: Hexagon,
        color: 'text-orange-400',
        gradient: 'from-orange-500/20 to-amber-500/20',
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
                className="text-4xl md:text-6xl pb-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
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

        <div className={clsx(
            "grid gap-6 auto-rows-fr mx-auto w-full",
            course === 'AD' 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-4xl" 
                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl" // A&W: 4 cols for compactness
        )}>
            {categories.map((category, index) => {
                const initialPos = { opacity: 0, scale: 0.9, y: 20 };

                if (course === 'AD') {
                    // Original Design for AD Selection
                    return (
                        <motion.button
                            key={category.id}
                            initial={initialPos}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ 
                                duration: 0.4, 
                                delay: index * 0.05, 
                                type: "spring", 
                                stiffness: 260, 
                                damping: 20 
                            }}
                            onClick={() => onSelect(category.id)}
                            className="group relative flex flex-col rounded-3xl border border-slate-800 text-left transition-colors duration-300 hover:border-slate-600 hover:shadow-2xl overflow-hidden bg-slate-900/40 backdrop-blur-sm p-8"
                        >
                            <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", category.gradient)} />
                            
                            <div className="relative z-10 flex flex-col gap-4 h-full">
                                <div className={clsx(
                                    "flex items-center justify-center bg-slate-800/80 group-hover:bg-slate-800/50 transition-colors border border-slate-700 group-hover:border-slate-600 w-14 h-14 rounded-2xl",
                                    category.color
                                )}>
                                    <category.icon size={28} />
                                </div>
                                
                                <div className="flex flex-col gap-2 mt-auto">
                                    <h3 className="font-bold text-white flex items-center gap-2 text-2xl">
                                        {category.name}
                                        <ArrowRight size={20} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-slate-400" />
                                    </h3>
                                    <p className="text-slate-400 font-medium leading-relaxed text-sm">
                                        {category.description}
                                    </p>
                                </div>
                            </div>
                        </motion.button>
                    );
                } else {
                    // Modern Compact Design for A&W Selection
                    return (
                        <motion.button
                            key={category.id}
                            initial={initialPos}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ 
                                duration: 0.4, 
                                delay: index * 0.05, 
                                type: "spring", 
                                stiffness: 260, 
                                damping: 20 
                            }}
                            onClick={() => onSelect(category.id)}
                            className="group relative flex flex-col items-center justify-center rounded-2xl border border-slate-800/50 text-center transition-all duration-300 hover:border-slate-600 hover:shadow-lg hover:-translate-y-1 overflow-hidden bg-slate-900/30 backdrop-blur-sm p-6 gap-4"
                        >
                            <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", category.gradient)} />
                            
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className={clsx(
                                    "flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                                    "w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700 group-hover:border-slate-600 shadow-sm",
                                    category.color
                                )}>
                                    <category.icon size={24} />
                                </div>
                                
                                <h3 className="font-bold text-slate-200 group-hover:text-white text-base transition-colors">
                                    {category.name}
                                </h3>
                            </div>
                        </motion.button>
                    );
                }
            })}
        </div>

      </div>
    </div>
  );
};

export default CategorySelection;
