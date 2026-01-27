const StatsCard = ({ completedSubjects, totalSubjects, gpa, isEligible }) => {
  const percent = Math.min(100, Math.round(((completedSubjects + 0) / (totalSubjects + 5)) * 100)) // 5 is mandatory docs

  return (
    <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm lg:col-span-2">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-gray-900">Overall Progress</h2>
        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
          isEligible ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
        }`}>
          {isEligible ? 'Gradiated' : 'In Progress'}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-12">
        {/* Circular Progress */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 drop-shadow-sm">
            <path className="text-slate-100" strokeWidth="2.5" stroke="currentColor" fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path
              className="text-brand-maroon transition-all duration-1000 ease-out"
              strokeDasharray={`${percent}, 100`} strokeWidth="3" stroke="currentColor"
              strokeLinecap="round" fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-brand-maroon leading-none">{percent}%</span>
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-2">Complete</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-8 w-full">
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <div className="text-3xl font-black text-gray-900 leading-none">{completedSubjects}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">Subjects</div>
          </div>
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <div className="text-3xl font-black text-gray-900 leading-none">{totalSubjects}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">Total Req</div>
          </div>
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <div className={`text-3xl font-black leading-none ${parseFloat(gpa) >= 2 ? 'text-green-600' : 'text-red-500'}`}>{gpa}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">GPA</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsCard
