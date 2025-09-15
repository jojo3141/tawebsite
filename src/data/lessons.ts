export interface Lesson {
  week: number;
  title: string;
  description: string;
  pdf?: string; // optional
}

// & "C:\Program Files\PuTTY\pscp.exe" -r "out\*" jheger@slab1.ethz.ch:homepage/

// update this file here and copy a new page.tsx for the new lesson
// then run npm run build
// then use WinSCP to copy the out folder to slab1.ethz.ch:homepage
// finally, go to n.ethz.ch/~jheger to see the result

// running it locally, you can go to http://localhost:3000/~jheger

export const lessons: Lesson[] = [
  {
    week: 2,
    title: "Introduction",
    description: "Administration basics and introduction to induction and O-notation",
    pdf: "/~jheger/lessons/week-2.pdf",
  }, 
  {
    week: 3,
    title: "O Notation",
    description: "Exercises on O-Notation and basic algorithm analysis",
    pdf: "/~jheger/lessons/week-2.pdf",
  }
  // Add new lessons here each week
];
