// src/app/rosca/page.tsx
'use client';
import { useState } from 'react';
import RoscaDashboard from '@/components/rosca/rosca-dashboard';
import RoscaGroupList from '@/components/rosca/rosca-group-list';
import { useAppTranslation } from '@/hooks/use-app-translation';

// Mock data for multiple groups
const MOCK_GROUPS = Array.from({ length: 8 }, (_, i) => ({
  id: `group-${i + 1}`,
  name: `Grupo Alpha ${i + 1}`,
  participants: Math.floor(Math.random() * 5) + 8, // 8 to 12 participants
  status: i < 3 ? 'in-progress' : i < 6 ? 'forming' : 'finished',
  potValue: (Math.floor(Math.random() * 5) + 8) * 500,
  cycle: 12,
  currentMonth: i < 3 ? Math.floor(Math.random() * 11) + 1 : 0,
}));

export default function RoscaPage() {
  const { t } = useAppTranslation();
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const handleSelectGroup = (group: any) => {
    setSelectedGroup(group);
  };

  const handleBackToList = () => {
    setSelectedGroup(null);
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">{t('rosca.title')}</h1>
        <p className="text-lg text-muted-foreground">
          {selectedGroup ? t('rosca.dashboard.description') : t('rosca.description')}
        </p>
      </div>

      {selectedGroup ? (
        <RoscaDashboard group={selectedGroup} onBack={handleBackToList} />
      ) : (
        <RoscaGroupList groups={MOCK_GROUPS} onSelectGroup={handleSelectGroup} />
      )}
    </div>
  );
}
