import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Share2, ArrowUpDown, Trees, Layers, ArrowRight, ArrowLeft, GitGraph, Scissors, Disc, Hexagon } from 'lucide-react';
import { clsx } from 'clsx';
import { useCourse } from '@/context/CourseContext';

export type CategoryType = 'GRAPH' | 'SORTING' | 'TREES' | 'DP' | 'TARJAN' | 'EULER' |'GREEDY_MATCHING' | 'HOPCROFT_KARP' | 'GRAPH_COLORING' | 'FORD_FULKERSON' | 'LONG_PATH' | 'HAMILTON_PATH' | 'MINIMUM_EDGE_CUT' | 'SMALLEST_ENCLOSING_DISK' | 'JARVIS_WRAP';

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
    },
    {
      id: 'EULER',
      name: 'Euler Tour Algorithm',
      description: 'Find an Eulerian Circuit in a connected graph where every vertex has an even degree.',
      icon: Share2,
      color: 'text-cyan-400',
      gradient: 'from-cyan-500/20 to-blue-500/20',
    },
    {
      id: 'GREEDY_MATCHING',
      name: 'Matching Algorithms',
      description: 'Greedy and Hopcroft-Karp algorithms for finding matchings in graphs.',
      icon: Share2,
      color: 'text-violet-400',
      gradient: 'from-violet-500/20 to-purple-500/20',
    },
    {
      id: 'GRAPH_COLORING',
      name: 'Graph Coloring Algorithms',
      description: 'Greedy coloring and Smallest-Last ordering heuristics.',
      icon: Layers,
      color: 'text-orange-400',
      gradient: 'from-orange-500/20 to-red-500/20',
    },
    {
      id: 'FORD_FULKERSON',
      name: 'Max Flow Algorithm',
      description: 'Ford-Fulkerson algorithm for Maximum Flow.',
      icon: Share2,
      color: 'text-teal-400',
      gradient: 'from-teal-500/20 to-emerald-500/20',
    },
    {
      id: 'LONG_PATH',
      name: 'Long Path',
      description: 'Find a path of length k using randomized color coding.',
      icon: Layers,      color: 'text-fuchsia-400',
      gradient: 'from-fuchsia-500/20 to-pink-500/20',
    },
    {
        id: 'HAMILTON_PATH',
        name: 'Hamilton Cycle',
        description: 'Find a Hamilton Cycle using Dynamic Programming.',
        icon: GitGraph,
        color: 'text-indigo-400',
        gradient: 'from-indigo-500/20 to-violet-500/20',
    },
    {
        id: 'MINIMUM_EDGE_CUT',
        name: 'Minimum Edge Cut',
        description: 'Find the minimum edge cut of a multigraph using a randomized algorithm.',
        icon: Scissors,
        color: 'text-pink-400',
        gradient: 'from-pink-500/20 to-rose-500/20',
    },
    {
        id: 'JARVIS_WRAP',
        name: 'Convex Hull',
        description: 'Compute the convex hull of a set of points.',
        icon: Hexagon,
        color: 'text-orange-400',
        gradient: 'from-orange-500/20 to-amber-500/20',
    },
    {
        id: 'SMALLEST_ENCLOSING_DISK',
        name: 'Smallest Enclosing Disk',
        description: 'Find the smallest enclosing disk of a set of points.',
        icon: Disc,
        color: 'text-sky-400',
        gradient: 'from-sky-500/20 to-blue-500/20',
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

        <div className={clsx(
            "grid gap-6 auto-rows-fr mx-auto w-full",
            course === 'AD' 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-4xl" 
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl" // A&W: 3 cols, wider container
        )}>
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
                            "group relative flex flex-col rounded-3xl border border-slate-800 text-left transition-colors duration-300 hover:border-slate-600 hover:shadow-2xl overflow-hidden bg-slate-900/40 backdrop-blur-sm",
                            course === 'AD' ? "p-8" : "p-5" // Smaller padding for A&W
                        )}
                    >
                        <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", category.gradient)} />
                        
                        <div className="relative z-10 flex flex-col gap-4 h-full">
                            <div className={clsx(
                                "flex items-center justify-center bg-slate-800/80 group-hover:bg-slate-800/50 transition-colors border border-slate-700 group-hover:border-slate-600",
                                category.color,
                                course === 'AD' ? "w-14 h-14 rounded-2xl" : "w-10 h-10 rounded-xl" // Smaller icon box for A&W
                            )}>
                                <category.icon size={course === 'AD' ? 28 : 20} />
                            </div>
                            
                            <div className="flex flex-col gap-2 mt-auto">
                                <h3 className={clsx(
                                    "font-bold text-white flex items-center gap-2",
                                    course === 'AD' ? "text-2xl" : "text-lg" // Smaller title for A&W
                                )}>
                                    {category.name}
                                    <ArrowRight size={course === 'AD' ? 20 : 16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-slate-400" />
                                </h3>
                                <p className={clsx(
                                    "text-slate-400 font-medium leading-relaxed",
                                    course === 'AD' ? "text-sm" : "text-xs" // Smaller description for A&W
                                )}>
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
