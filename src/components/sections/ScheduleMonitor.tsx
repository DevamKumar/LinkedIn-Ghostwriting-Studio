import React, { useState, useEffect } from 'react';

export const ScheduleMonitor = () => {
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => {
    const updateSchedules = async () => {
       try {
         const res = await fetch('/api/schedules');
         const data = await res.json();
         if (data.schedules) {
           setSchedules(data.schedules);
         }
       } catch (err) {
         console.error('Failed to fetch schedules', err);
       }
    };
    
    updateSchedules();
    const interval = setInterval(updateSchedules, 2000);
    return () => clearInterval(interval);
  }, []);

  if (schedules.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-24">
      <div className="bg-paper border border-grid/20 p-6 sm:p-8 relative">
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-forest"></div>
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-forest"></div>
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-forest"></div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-forest"></div>
          
          <h2 className="font-display text-2xl tracking-tight text-forest uppercase mb-6 border-b border-grid/20 pb-4">
            Today's Automated Pipeline Schedule
          </h2>
          
          <div className="space-y-4">
             {schedules.map((s, idx) => {
               const date = new Date(s.scheduledTime);
               const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
               const dateString = date.toLocaleDateString();
               return (
                 <div key={idx} className="flex flex-col lg:flex-row lg:items-center justify-between border border-grid/10 p-4 bg-white">
                   <div className="flex-1 mb-4 lg:mb-0 pr-4">
                     <p className="font-mono text-[10px] uppercase tracking-widest text-forest/50 mb-1">Queue {idx + 1}</p>
                     <p className="font-sans font-medium text-forest text-sm sm:text-base leading-snug">{s.topic}</p>
                   </div>
                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-end min-w-[200px] gap-2 lg:gap-1">
                     <p className="font-mono text-sm text-forest">{dateString} - {timeString}</p>
                     {s.processed ? (
                        <span className="inline-block px-3 py-1 bg-forest text-white text-[10px] font-mono uppercase tracking-widest">
                          Executed & Published
                        </span>
                     ) : (
                        <span className="inline-block px-3 py-1 bg-mint/20 text-forest text-[10px] font-mono uppercase tracking-widest border border-mint/50">
                          Awaiting Execution
                        </span>
                     )}
                   </div>
                 </div>
               );
             })}
          </div>
      </div>
    </div>
  );
};
