export type Course = 'AD' | 'AW';

export interface Lesson {
  week: number;
  title: string;
  description: string;
  pdf?: string; // optional
  additionalPdf?: {
    url: string;
    label: string;
  };
}

export const lessonsAD: Lesson[] = [
  {
    week: 1,
    title: "Asymptotic Growth",
    description: "Administration basics and introduction to induction and asymptotic growth",
    pdf: "/lessons/AuD_HS25/week-1.pdf",
  },
  {
    week: 2,
    title: "O-Notation",
    description: "Some more Induction and O-Notation",
    pdf: "/lessons/AuD_HS25/week-2.pdf",
  },
  {
    week: 3,
    title: "Maximum Subarray Sum",
    description: "And Omeaga/Theta Notation and some more induction",
    pdf: "/lessons/AuD_HS25/week-3.pdf",
  },
  {
    week: 4,
    title: "Sorting Algorithms",
    description: "Bubble Sort, Selection Sort, Insertion Sort, Merge Sort",
    pdf: "/lessons/AuD_HS25/week-4.pdf",
  },
  {
    week: 5,
    title: "Sorting Algorithms II",
    description: "Quick Sort, Heap Sort and Max-Heaps in general",
    pdf: "/lessons/AuD_HS25/week-5.pdf",
  },
  {
    week: 6,
    title: "2-3-Trees and DP",
    description: "MSS, Jump Game, LGT, Edit Distance, Climbing Staris, Burglar",
    pdf: "/lessons/AuD_HS25/week-6.pdf",
  },
  {
    week: 7,
    title: "More DP",
    description: "Subset Sum, Knapsack, LAT, Summy Array, Museum Tour, Positional Sum",
    pdf: "/lessons/AuD_HS25/week-7.pdf",
  },
  {
    week: 8,
    title: "Graphs",
    description: "Graph Basics, Eulerian walks, Hamiltonian paths, General proof patterns",
    pdf: "/lessons/AuD_HS25/week-8.pdf",
  },
  {
    week: 9,
    title: "DFS",
    description: "DFS Tree, Pre/Post order, Topological Sorting, Counting connected components",
    pdf: "/lessons/AuD_HS25/week-9.pdf",
  },
  {
    week: 10,
    title: "BFS and Dijkstra",
    description: "BFS, Shortest Paths in weighted Graphs, Dijkstra",
    pdf: "/lessons/AuD_HS25/week-10.pdf",
  },
  {
    week: 11,
    title: "Bellman-Ford, MST",
    description: "Bellman-Ford, MST, Boruvka, Prim, Old Exam Exercises",
    pdf: "/lessons/AuD_HS25/week-11.pdf",
  },
  {
    week: 12,
    title: "Kruskal",
    description: "Kruskal, Tricks for Graph Problems, Learning Goals for A&D",
    pdf: "/lessons/AuD_HS25/week-12.pdf",
    additionalPdf: {
      url: "/lessons/AuD_HS25/learning-goals.pdf",
      label: "Learning Goals for A&D",
    },
  },
  {
    week: 13,
    title: "All to All Shortest Paths",
    description: "Floyd Warshall, Johnson, and some code expert",
    pdf: "/lessons/AuD_HS25/week-13.pdf",
  }
];

export const lessonsAW: Lesson[] = [
  // Add new lessons for A&W here
  {
    week: 1,
    title: "A&D Recap",
    description: "Overview and recap of some A&D topics that are relevant for A&W",
    pdf: "/lessons/AuW_FS26/week-1.pdf",
  },
  {
    week: 2,
    title: "Zusammenhang, Kreise",
    description: "Zusammenhang, Artikulationsknoten, Brücken, Tarjan Algorithmus, Euler Tour, Hamiltonkreis, Dirac",
    pdf: "/lessons/AuW_FS26/week-2.pdf",
  },
  {
    week: 3,
    title: "TSP, Matchings",
    description: "TSP, TSP Approximationen, Matchings, Augmentierende Pfade, Satz von Berge, Satz von Hall",
    pdf: "/lessons/AuW_FS26/week-3.pdf",
  },
  {
    week: 4,
    title: "Hopcroft-Karp, Färbungen",
    description: "Hopcroft-Karp, Färbungen, Greedy Färbung, Smallest Last Färbung",
    pdf: "/lessons/AuW_FS26/week-4.pdf",
  },
  {
    week: 5,
    title: "Wahrscheinlichkeit Intro",
    description: "Satz von Brooks, Planare Graphen, Wahrscheinlichkeitsraum, Laplace, Kombinatorik, Bedingte Wahrscheinlichkeit",
    pdf: "/lessons/AuW_FS26/week-5.pdf",
  }
];

export const lessons: Record<Course, Lesson[]> = {
  AD: lessonsAD,
  AW: lessonsAW
};
