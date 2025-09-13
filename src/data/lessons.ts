export interface Lesson {
  week: number;
  title: string;
  description: string;
  pdf?: string; // optional
}

// & "C:\Program Files\PuTTY\pscp.exe" -r "out\*" jheger@slab1.ethz.ch:homepage/

export const lessons: Lesson[] = [
  {
    week: 2,
    title: "Introduction",
    description: "Administration basics and introduction to induction and O-notation",
    pdf: "/lessons/week-1.pdf",
  }, 
  {
    week: 3,
    title: "O Notation",
    description: "Exercises on O-Notation and basic algorithm analysis",
    pdf: "/lessons/week-3.pdf",
  }
  // Add new lessons here each week
];
