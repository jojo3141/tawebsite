export interface Lesson {
  week: number;
  title: string;
  description: string;
  pdf?: string; // optional
}

export const lessons: Lesson[] = [
  {
    week: 1,
    title: "Introduction",
    description: "Start your journey with the fundamentals of algorithms and programming.",
    pdf: "/lessons/week-1.pdf",
  },
  {
    week: 2,
    title: "Sorting & Searching",
    description: "Learn essential sorting and searching algorithms with visual examples.",
    pdf: "/lessons/week-2.pdf",
  },
  {
    week: 3,
    title: "ArrayLists",
    description: "Learn how to use ArrayLists effectively in programming.",
    pdf: "/lessons/week-3.pdf",
  },
  // Add new lessons here each week
];
