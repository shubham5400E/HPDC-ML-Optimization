import React from 'react';

const Reports: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Engineering Reports</h1>
      <p className="text-slate-600 mb-8">Generate and download PDF reports of your optimization sessions.</p>
      <div className="p-12 border-2 border-dashed border-slate-200 rounded-lg text-slate-500">
        No reports generated yet. Complete an optimization iteration to generate a report.
      </div>
    </div>
  );
};

export default Reports;
