import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Share2, ArrowUpDown, Trees, Layers, ArrowRight, ArrowLeft, GitGraph, Scissors, Disc, Hexagon, Waypoints, Users, Waves, VectorSquare, RefreshCw, Palette, Copy, Route } from 'lucide-react';
import { clsx } from 'clsx';
import { useCourse } from '@/context/CourseContext';
import { useAlgorithmsTheme } from '@/context/AlgorithmsThemeContext';
import ThemeToggle from '@/components/visualizer/ThemeToggle';

export type CategoryType = 'GRAPH' | 'SORTING' | 'TREES' | 'DP' | 'TARJAN' | 'EULER' |'GREEDY_MATCHING' | 'HOPCROFT_KARP' | 'GRAPH_COLORING' | 'FORD_FULKERSON' | 'LONG_PATH' | 'HAMILTON_PATH' | 'MINIMUM_EDGE_CUT' | 'SMALLEST_ENCLOSING_DISK' | 'JARVIS_WRAP' | 'FINDING_DUPLICATES_HASH' | 'BLOOM_FILTER' | 'METRIC_TSP';

interface CategorySelectionProps {
  onSelect: (category: CategoryType) => void;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({ onSelect }) => {
  const { course, setCourse } = useCourse();
  const { theme } = useAlgorithmsTheme();
  const isLight = theme === 'light';

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
      gradient: 'from-indigo-500/20 to-fuchsia-500/20',
    },
    {
      id: 'SORTING',
      name: 'Sorting Algorithms',
      description: 'Bubble, Merge, Quick, Heap, ect.',
      icon: ArrowUpDown,
      color: 'text-emerald-400',
      gradient: 'from-emerald-500/20 to-cyan-500/20',
    },
    {
      id: 'TREES',
      name: 'Tree Algorithms',
      description: '2-3 Trees, Binary Search Trees, Max-Heaps.',
      icon: Trees,
      color: 'text-amber-400',
      gradient: 'from-amber-500/20 to-red-500/20',
    },
    {
      id: 'DP',
      name: 'Dynamic Programming',
      description: 'Fibonacci, Max Subarray Sum, etc.',
      icon: Layers,
      color: 'text-rose-400',
      gradient: 'from-rose-500/20 to-violet-500/20',
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
      gradient: 'from-pink-500/20 to-rose-600/20',
    },
    {
      id: 'EULER',
      name: 'Euler Tour',
      icon: RefreshCw,
      color: 'text-green-400',
      gradient: 'from-green-500/20 to-indigo-500/20',
    },
    {
        id: 'HAMILTON_PATH',
        name: 'Hamilton Cycle',
        icon: VectorSquare,
        color: 'text-indigo-400',
        gradient: 'from-indigo-500/20 to-pink-500/20',
    },
    {
        id: 'METRIC_TSP',
        name: 'Metric TSP',
        icon: Route,
        color: 'text-purple-400',
        gradient: 'from-purple-500/20 to-indigo-500/20',
    },
    {
      id: 'GREEDY_MATCHING',
      name: 'Matchings',
      icon: Users,
      color: 'text-yellow-400',
      gradient: 'from-yellow-500/20 to-red-500/20',
    },
    {
      id: 'GRAPH_COLORING',
      name: 'Colorings',
      icon: Palette,
      color: 'text-orange-400',
      gradient: 'from-orange-500/20 via-red-500/20 to-purple-600/20',
    },
    {
        id: 'FINDING_DUPLICATES_HASH',
        name: 'Duplicates',
        icon: Copy,
        color: 'text-indigo-400',
        gradient: 'from-indigo-500/20 to-fuchsia-500/20',
    },
    {
      id: 'LONG_PATH',
      name: 'Long Path',
      icon: Waypoints,      color: 'text-fuchsia-400',
      gradient: 'from-fuchsia-500/20 to-indigo-600/20',
    },
    {
      id: 'FORD_FULKERSON',
      name: 'Max Flow',
      icon: Waves,
      color: 'text-blue-400',
      gradient: 'from-blue-500/20 to-teal-400/20',
    },
    {
        id: 'MINIMUM_EDGE_CUT',
        name: 'Minimum Edge Cut',
        icon: Scissors,
        color: 'text-pink-400',
        gradient: 'from-pink-500/20 to-indigo-500/20',
    },
    {
        id: 'SMALLEST_ENCLOSING_DISK',
        name: 'Smallest Enclosing Disk',
        icon: Disc,
        color: 'text-sky-400',
        gradient: 'from-sky-500/20 to-indigo-500/20',
    },
    {
        id: 'JARVIS_WRAP',
        name: 'Convex Hull',
        icon: Hexagon,
        color: 'text-orange-400',
        gradient: 'from-orange-500/20 to-yellow-600/20',
    }
  ];

  const categories = course === 'AD' ? categoriesAD : categoriesAW;

  return (
    <div className={clsx(
      "min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden transition-colors duration-300",
      isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-200"
    )}>
      {/* Background Gradients */}
      <div className={clsx(
        "absolute top-0 left-0 w-full h-[500px] pointer-events-none transition-all duration-300",
        isLight ? "bg-gradient-to-b from-purple-100/60 to-transparent" : "bg-gradient-to-b from-indigo-900/20 to-transparent"
      )} />
      <div className={clsx(
        "absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none transition-colors duration-300",
        isLight ? "bg-purple-200/30" : "bg-purple-900/10"
      )} />
      
      {/* Back to Home Button */}
      <div className="absolute top-8 left-8 z-20">
          <Link href="/" className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all backdrop-blur-sm group shadow-sm",
            isLight 
              ? "bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300"
              : "bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700"
          )}>
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Home</span>
          </Link>
      </div>

      {/* Theme Toggle Button (Top Right Corner) */}
      <div className="absolute top-8 right-8 z-20">
          <ThemeToggle size="md" />
      </div>

      <div className="max-w-6xl w-full z-10 flex flex-col gap-12">
        <div className="flex flex-col gap-8 items-center text-center">
             <motion.h1 
                initial={{ opacity: 0, y: -20, backgroundPosition: '0% 50%' }}
                animate={{ 
                    opacity: 1, 
                    y: 0, 
                    backgroundPosition: ['100% 50%', '0% 50%'] 
                }}
                transition={{
                    opacity: { duration: 0.5 },
                    y: { duration: 0.5 },
                    backgroundPosition: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                    }
                }}
                style={{
                    backgroundImage: isLight
                      ? 'linear-gradient(90deg, #6366f1, #9333ea, #ec4899, #6366f1, #9333ea, #ec4899, #6366f1)'
                      : 'linear-gradient(90deg, #7244ffff, #c084fc, #f472b6, #7244ffff, #c084fc, #f472b6, #7244ffff)',
                    backgroundSize: '200% auto',
                }}
                className="text-4xl md:text-6xl pb-2 font-bold text-transparent bg-clip-text"
             >
                Algorithm Lab
             </motion.h1>
             
             {/* Course Switcher */}
             <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={clsx(
                  "p-1 rounded-xl flex items-center gap-1 border transition-colors",
                  isLight ? "bg-slate-200/80 border-slate-300" : "bg-slate-900 border-slate-800"
                )}
             >
                {(['AD', 'AW'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCourse(c)}
                    className={clsx(
                      "relative px-4 py-2 text-sm font-bold rounded-lg transition-colors z-0 min-w-[80px]",
                      course === c 
                        ? (isLight ? "text-purple-700" : "text-indigo-400") 
                        : (isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-500 hover:text-slate-300")
                    )}
                  >
                    {course === c && (
                      <motion.div
                        layoutId="visualizerCourseHighlight"
                        className={clsx(
                          "absolute inset-0 shadow-sm rounded-lg border",
                          isLight ? "bg-white border-slate-200" : "bg-slate-800 border-slate-700"
                        )}
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
                            className={clsx(
                              "group relative flex flex-col rounded-3xl border text-left transition-all duration-300 hover:shadow-2xl overflow-hidden backdrop-blur-sm p-8",
                              isLight 
                                ? "bg-white/90 border-slate-200 hover:border-slate-300 shadow-md hover:-translate-y-0.5" 
                                : "bg-slate-900/40 border-slate-800 hover:border-slate-600"
                            )}
                        >
                            <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", category.gradient)} />
                            
                            <div className="relative z-10 flex flex-col gap-4 h-full">
                                <div className={clsx(
                                    "flex items-center justify-center transition-colors border w-14 h-14 rounded-2xl",
                                    isLight 
                                      ? "bg-slate-100 group-hover:bg-slate-50 border-slate-200" 
                                      : "bg-slate-800/80 group-hover:bg-slate-800/50 border-slate-700 group-hover:border-slate-600",
                                    category.color
                                )}>
                                    <category.icon size={28} />
                                </div>
                                
                                <div className="flex flex-col gap-2 mt-auto">
                                    <h3 className={clsx("font-bold flex items-center gap-2 text-2xl transition-colors", isLight ? "text-slate-900" : "text-white")}>
                                        {category.name}
                                        <ArrowRight size={20} className={clsx("opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300", isLight ? "text-slate-500" : "text-slate-400")} />
                                    </h3>
                                    <p className={clsx("font-medium leading-relaxed text-sm transition-colors", isLight ? "text-slate-600" : "text-slate-400")}>
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
                            className={clsx(
                              "group relative flex flex-col items-center justify-center rounded-2xl border text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden backdrop-blur-sm p-6 gap-4",
                              isLight 
                                ? "bg-white/90 border-slate-200 hover:border-slate-300 shadow-sm" 
                                : "bg-slate-900/30 border-slate-600/50 hover:border-slate-600"
                            )}
                        >
                            <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", category.gradient)} />
                            
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className={clsx(
                                    "flex items-center justify-center transition-all duration-300 group-hover:scale-110 w-12 h-12 rounded-xl shadow-sm border",
                                    isLight 
                                      ? "bg-slate-100 border-slate-200" 
                                      : "bg-slate-800/50 border-slate-700 group-hover:border-slate-600",
                                    category.color
                                )}>
                                    <category.icon size={24} />
                                </div>
                                
                                <h3 className={clsx("font-bold text-[19px] transition-colors", isLight ? "text-slate-800 group-hover:text-slate-950" : "text-slate-200 group-hover:text-white")}>
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
