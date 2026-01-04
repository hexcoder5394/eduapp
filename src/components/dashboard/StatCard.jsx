import React from 'react';

const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="rounded-2xl bg-slate-900 p-6 shadow-lg border border-slate-800 hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-100">{value}</h3>
        </div>
        <div className={`rounded-xl p-3 ${color} bg-opacity-10`}>
          <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;