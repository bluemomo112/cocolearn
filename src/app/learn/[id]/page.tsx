'use client';

import { useParams } from 'next/navigation';
import SelfStudyWorkbench from '@/app/teacher/self-study/components/SelfStudyWorkbench';

export default function LearnPage() {
  const params = useParams();
  const spaceId = params.id as string;

  return (
    <div className="h-screen w-screen overflow-hidden">
      <SelfStudyWorkbench
        spaceId={spaceId}
        mode="student"
        onBack={() => window.history.back()}
      />
    </div>
  );
}
