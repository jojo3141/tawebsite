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
    week: 1,
    title: "Asymptotic Growth",
    description: "Administration basics and introduction to induction and asymptotic growth",
    pdf: "/~jheger/lessons/week-1.pdf",
  }, 
  {
    week: 2,
    title: "O-Notation",
    description: "Some more Induction and O-Notation",
    pdf: "/~jheger/lessons/week-2.pdf",
  },
  {
    week: 3,
    title: "Maximum Subarray Sum",
    description: "And Omeaga/Theta Notation and some more induction",
    pdf: "/~jheger/lessons/week-3.pdf",
  },
  {
    week: 4,
    title: "Sorting Algorithms",
    description: "Bubble Sort, Selection Sort, Insertion Sort, Merge Sort",
    pdf: "/~jheger/lessons/week-4.pdf",
  }
  // Add new lessons here each week
];
