import React, { useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import { startOfYear, endOfYear, format } from 'date-fns';
import { Activity } from 'lucide-react';

const ActivityHeatmap = ({ logs }) => {
  const [isHovered, setIsHovered] = useState(false);

  // 1. Transform raw logs into Heatmap format
  const getHeatmapData = () => {
    const data = {};
    logs.forEach(log => {
      const dateStr = format(log.date, 'yyyy-MM-dd');
      if (!data[dateStr]) {
        data[dateStr] = 0;
      }
      data[dateStr] += log.duration;
    });
    return Object.keys(data).map(date => ({
      date: date,
      count: data[date]
    }));
  };

  const today = new Date();
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. The Trigger Button (Collapsed State) */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors group">
        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 group-hover:text-indigo-300 transition-colors">
          <Activity size={24} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Study Heatmap</h3>
          <p className="text-xs text-slate-400">Hover to view consistency</p>
        </div>
      </div>

      {/* 2. The Popover (Expanded State) */}
      {isHovered && (
        <div className="absolute top-full left-0 mt-3 z-50 w-full min-w-[650px] p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-indigo-500/10">
          <h2 className="text-lg font-bold text-slate-100 mb-4">Study Consistency (Last 12 Months)</h2>
          
          <div className="w-full overflow-x-auto custom-scrollbar pb-2">
            <CalendarHeatmap
              startDate={startOfYear(today)}
              endDate={endOfYear(today)}
              values={getHeatmapData()}
              classForValue={(value) => {
                if (!value) return 'color-empty';
                if (value.count < 30) return 'color-scale-1';
                if (value.count < 60) return 'color-scale-2';
                if (value.count < 120) return 'color-scale-3';
                return 'color-scale-4';
              }}
              tooltipDataAttrs={(value) => {
                if (!value || !value.date) return null;
                return {
                  'data-tooltip-id': 'heatmap-tooltip',
                  'data-tooltip-content': `${value.date}: ${value.count} mins studied`,
                };
              }}
              showWeekdayLabels={true}
            />
          </div>
          <Tooltip id="heatmap-tooltip" style={{ backgroundColor: "#1e293b", color: "#fff", zIndex: 60 }} />
        </div>
      )}
    </div>
  );
};

export default ActivityHeatmap;