import React from 'react';
import { useParams } from 'react-router-dom';
import { ScheduleGenerator } from '@/components/schedule/ScheduleGenerator';

export const ScheduleGenerationPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="p-6">
      <ScheduleGenerator 
        projectId={projectId!} 
        onScheduleGenerated={(result) => {
          console.log('Schedule generation result:', result);
          // Handle the result, maybe show a toast notification
        }}
      />
    </div>
  );
};