import { useState } from 'react';
import { PerformanceCharts, KPICards, ReviewHistoryTable } from '../components/Performance/PerformanceMetrics';
import ScheduleReviewModal from '../components/Performance/ScheduleReviewModal';

export default function PerformancePage() {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const handleScheduleReview = (data) => {
    console.log('New review scheduled:', data);
    // In a real app, we would update state or call an API here
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">Performance Tracking</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mt-1">
            Corporate KPI monitoring & talent evaluation matrix
          </p>
        </div>
      </div>
      
      <KPICards />
      <PerformanceCharts />
      <ReviewHistoryTable onScheduleReview={() => setIsScheduleOpen(true)} />

      <ScheduleReviewModal 
        isOpen={isScheduleOpen} 
        onClose={() => setIsScheduleOpen(false)} 
        onSchedule={handleScheduleReview}
      />
    </div>
  );
}
