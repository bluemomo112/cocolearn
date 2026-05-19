'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadFromStorage, SpaceConfig, SelfStudyWorkbench } from '@cross/self-learn';

export default function StudentWorkbenchPage() {
  const router = useRouter();
  const [config, setConfig] = useState<SpaceConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = loadFromStorage<SpaceConfig | null>('self-study:currentSpace', null);
    if (saved) {
      setConfig(saved);
    } else {
      router.replace('/student');
    }
    setLoading(false);
  }, [router]);

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      <SelfStudyWorkbench
        config={config}
        mode="student"
        onBack={() => router.back()}
      />
    </div>
  );
}
