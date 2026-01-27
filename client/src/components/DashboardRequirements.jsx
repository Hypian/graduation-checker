import { useAuth } from '../context/AuthContext'

const DashboardRequirements = ({ completedSubjects, totalSubjects }) => {
  const { user } = useAuth()
  const milestones = user?.milestones || {}
  const percent = Math.round((completedSubjects / totalSubjects) * 100)

  const MilestoneItem = ({ label, mKey, iconClass }) => {
    const milestone = milestones[mKey]
    const status = milestone?.status || 'missing'
    const isDone = status === 'verified'
    const isPending = status === 'pending'
    
    let containerClasses = 'bg-slate-50/50 border-slate-100'
    let iconClasses = 'bg-white text-brand-maroon border-slate-50'
    let icon = iconClass
    let dotClass = 'bg-slate-200'
    let dotPos = 'left-1'

    if (isDone) {
      containerClasses = 'bg-green-50/50 border-green-100'
      iconClasses = 'bg-green-500 text-white border-green-600'
      icon = 'ph-check-circle-fill'
      dotClass = 'bg-green-500'
      dotPos = 'left-6'
    } else if (isPending) {
      containerClasses = 'bg-amber-50/50 border-amber-100'
      iconClasses = 'bg-amber-400 text-white border-amber-500'
      icon = 'ph-clock-countdown-fill'
      dotClass = 'bg-amber-400'
      dotPos = 'left-3.5'
    }

    return (
      <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${containerClasses}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border ${iconClasses}`}>
            <i className={`${icon} text-2xl`}></i>
          </div>
          <div>
            <h3 className={`text-sm font-black tracking-tight ${isDone ? 'text-green-800' : isPending ? 'text-amber-800' : 'text-gray-900'}`}>{label}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              {isDone ? 'Requirement Met' : isPending ? 'Under Review' : 'BBICT Core Requirement'}
            </p>
          </div>
        </div>
        <div className={`w-11 h-6 rounded-full relative transition-all ${dotClass}`}>
            <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all ${dotPos}`}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm lg:col-span-2">
      <h2 className="text-xl font-bold text-gray-900 mb-8">Requirements Checklist</h2>
      <div className="space-y-8">
        {/* Academic Subjects Progress */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
          <div className="flex-1">
            <div className="flex justify-between mb-3 items-end">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Academic Subjects</h3>
              <div className="text-xs font-bold text-slate-400">
                <span className="text-brand-maroon font-black">{completedSubjects}</span> 
                <span className="mx-1">/</span> 
                <span className="text-slate-900">{totalSubjects}</span> Subjects
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 shadow-inner overflow-hidden border border-slate-50">
              <div 
                className="bg-brand-maroon h-full rounded-full transition-all duration-1000 ease-out shadow-sm" 
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[10px] font-black px-4 py-1.5 rounded-full bg-slate-50 text-brand-maroon whitespace-nowrap self-start sm:self-center ring-1 ring-slate-100">
            {percent}% COMPLETE
          </div>
        </div>

        {/* Dynamic Milestones */}
        <div className="space-y-4">
          <MilestoneItem 
            label="Academic Internship" 
            mKey="Academic Internship" 
            iconClass="ph-briefcase" 
          />
          <MilestoneItem 
            label="Final Project Defense" 
            mKey="Project Defense" 
            iconClass="ph-presentation-chart" 
          />
        </div>
      </div>
    </div>
  )
}

export default DashboardRequirements
