import { notFound } from "next/navigation";
import { Course } from "@/data/lessons";
import LessonPageContent from "@/components/LessonPageContent";

import { lessons } from "@/data/lessons";

export function generateStaticParams() {
  const params: { semester: string; week: string }[] = [];
  
  // AD -> AuD_HS25
  lessons.AD.forEach(lesson => {
    params.push({ semester: 'AuD_HS26', week: lesson.week.toString() });
  });

  // AW -> AuW_FS26
  lessons.AW.forEach(lesson => {
    params.push({ semester: 'AuW_FS26', week: lesson.week.toString() });
  });

  return params;
}

export default async function LessonPage({ params }: { params: Promise<{ semester: string; week: string }> }) {
  const { semester, week } = await params;
  
  let course: Course | undefined;
  if (semester === 'AuD_HS26') course = 'AD';
  else if (semester === 'AuW_FS26') course = 'AW';
  
  if (!course) {
    notFound();
  }

  const weekNum = parseInt(week, 10);
  if (isNaN(weekNum)) {
      notFound();
  }

  return <LessonPageContent week={weekNum} forcedCourse={course} />;
}
