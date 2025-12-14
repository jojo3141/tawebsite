import React from 'react';
import { ArrowLeft, HardHat } from 'lucide-react';

interface PlaceholderModeProps {
  onBack: () => void;
  title: string;
}

const PlaceholderMode: React.FC<PlaceholderModeProps> = ({ onBack, title }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-8 flex flex-col items-center gap-6 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center ring-4 ring-amber-500/10">
            <HardHat size={32} />
        </div>
        
        <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-slate-400">This visualizer is currently under construction. Check back later!</p>
        </div>

        <button 
           onClick={onBack}
           className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all font-medium border border-slate-700 hover:border-slate-600 w-full justify-center"
        >
            <ArrowLeft size={18} />
            Back to Categories
        </button>
      </div>
    </div>
  );
};

export default PlaceholderMode;
