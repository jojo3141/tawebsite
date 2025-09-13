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
    description: "Administration basics and introduction to induction and O-notation",
    pdf: "/lessons/week-1.pdf",
  }
  // Add new lessons here each week
];
