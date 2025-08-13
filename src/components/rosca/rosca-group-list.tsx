// src/components/rosca/rosca-group-list.tsx
'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CircleDollarSign, ArrowRight } from 'lucide-react';
import { useAppTranslation } from '@/hooks/use-app-translation';

interface RoscaGroupListProps {
  groups: any[];
  onSelectGroup: (group: any) => void;
}

export default function RoscaGroupList({ groups, onSelectGroup }: RoscaGroupListProps) {
  const { t } = useAppTranslation();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'in-progress': return 'default';
      case 'forming': return 'secondary';
      case 'finished': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-green-500/80';
      case 'forming': return 'bg-blue-500/80';
      default: return '';
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {groups.map((group) => (
        <Card key={group.id} className="brutalist-shadow flex flex-col justify-between transition-transform hover:scale-105 hover:shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{group.name}</CardTitle>
              <Badge variant={getStatusVariant(group.status)} className={getStatusClass(group.status)}>
                {t(`rosca.groupStatus.${group.status}`)}
              </Badge>
            </div>
            <CardDescription>{t('rosca.groupList.cycleDescription', { count: group.cycle })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> {t('rosca.groupList.participants')}
              </span>
              <span className="font-bold">{group.participants} / {group.cycle}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4" /> {t('rosca.groupList.potValue')}
              </span>
              <span className="font-bold">${group.potValue.toLocaleString('en-US')}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => onSelectGroup(group)}>
              {t('rosca.groupList.joinButton')} <ArrowRight className="ml-2" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
