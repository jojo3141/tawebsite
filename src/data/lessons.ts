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
    description: "Course organization and introduction to induction and asymptotic growth",
    pdf: "/lessons/AuD_HS26/week-1.pdf",
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
  },
  {
    week: 6,
    title: "Zufallsvariablen",
    description: "Totale Wahrscheinlichkeit, Bayes, Unabhängigkeit, Zufallsvariablen",
    pdf: "/lessons/AuW_FS26/week-6.pdf",
    additionalPdf: {
      url: "/lessons/AuW_FS26/week-6-zusatz.pdf",
      label: "Zusatzaufgaben",
    },
  },
  {
    week: 7,
    title: "Verteilungen",
    description: "Erwartungswert, Varianz, Verteilungen, Unabhängige und bedingte Zufallsvariablen, DP",
    pdf: "/lessons/AuW_FS26/week-7.pdf",
    additionalPdf: {
      url: "/lessons/AuW_FS26/week-7-zusatz.pdf",
      label: "Zusatzaufgaben",
    },
  },
  {
    week: 8,
    title: "Wahrscheinlichkeits-Ungleichungen",
    description: "Faltung, Waldsche Identität, Markov, Chebyshev, Chernoff, DP",
    pdf: "/lessons/AuW_FS26/week-8.pdf",
    additionalPdf: {
      url: "/lessons/AuW_FS26/week-8-zusatz.pdf",
      label: "Zusatzaufgaben",
    },
  },
  {
    week: 9,
    title: "Monte-Carlo und Las-Vegas",
    description: "Targetshooting, Monte-Carlo und Las-Vegas Algorithmen, Fehlerreduktion, Primzahltests",
    pdf: "/lessons/AuW_FS26/week-9.pdf",
    additionalPdf: {
      url: "/lessons/AuW_FS26/week-9-zusatz.pdf",
      label: "Zusatzaufgaben",
    },
  },
  {
    week: 10,
    title: "QuickSort, Duplikate",
    description: "QuickSort, Duplikate finden mit direktem Sortieren, mit Hashing, mit Hase-Igel Algorithmus",
    pdf: "/lessons/AuW_FS26/week-10.pdf",
    additionalPdf: {
      url: "/lessons/AuW_FS26/week-10-zusatz.pdf",
      label: "Zusatzaufgaben",
    },
  },
  {
    week: 11,
    title: "Long Path, Flows",
    description: "Long Path Algorithmus, Flows, Maxflow Mincut, Ford-Fulkerson",
    pdf: "/lessons/AuW_FS26/week-11.pdf",
    additionalPdf: {
      url: "/lessons/AuW_FS26/week-11-zusatz.pdf",
      label: "Zusatzaufgaben",
    },
  },
  {
    week: 13,
    title: "Min-Cut, Smallest Enclosing Disk",
    description: "Min-Cut, Bootstrapping-Algorithmus, Smallest Enclosing Disk, Flow Aufgaben",
    pdf: "/lessons/AuW_FS26/week-13.pdf",
    additionalPdf: {
      url: "/lessons/AuW_FS26/week-13-zusatz.pdf",
      label: "Zusatzaufgaben",
    },
  },
  {
    week: 14,
    title: "Konvexe Hülle",
    description: "Konvexe Hülle, Jarvis-Wrap, Local-Repair, Flow und DP Aufgaben",
    pdf: "/lessons/AuW_FS26/week-14.pdf",
    additionalPdf: {
      url: "/lessons/AuW_FS26/AW-Lernziele.pdf",
      label: "A&W Lernziele",
    },
  }
];

export const lessons: Record<Course, Lesson[]> = {
  AD: lessonsAD,
  AW: lessonsAW
};
