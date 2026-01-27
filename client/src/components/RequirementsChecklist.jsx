import { useAuth } from '../context/AuthContext'

const RequirementsChecklist = ({ records, curriculum, gpa }) => {
  const { user } = useAuth()
  const milestones = user?.milestones || {}
  
  const gpaPass = parseFloat(gpa) >= 2.0
  const subjectsPass = records.length >= curriculum.length && curriculum.length > 0
  
  const Item = ({ label, status, subtext, iconClass, type = 'info' }) => {
    const isDone = status === 'verified' || status === true // true for gpa/subjects
    const isPending = status === 'pending'
    
    let colorClasses = 'bg-slate-50/50 border-slate-100 text-slate-500'
    let iconBgClasses = 'bg-white text-slate-300 shadow-sm border border-slate-100'
    let statusIcon = <i className={`${iconClass} text-2xl`}></i>

    if (isDone) {
      colorClasses = 'bg-green-50/50 border-green-100 text-green-800'
      iconBgClasses = 'bg-green-500 text-white'
      statusIcon = <i className="ph-check-circle-fill text-2xl"></i>
    } else if (isPending) {
      colorClasses = 'bg-amber-50/50 border-amber-100 text-amber-800'
      iconBgClasses = 'bg-amber-400 text-white'
      statusIcon = <i className="ph-clock-countdown-fill text-2xl"></i>
    }

    return (
      <div className={`p-6 rounded-3xl border-2 flex items-center justify-between transition-all ${colorClasses}`}>
        <div className="flex items-center gap-5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBgClasses}`}>
            {statusIcon}
          </div>
          <div>
              <h4 className="font-black text-sm tracking-tight">{label}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{subtext}</p>
          </div>
        </div>
        {!isDone && !isPending && type === 'critical' && <i className="ph-warning-circle-bold text-red-400 text-lg"></i>}
        {isPending && <span className="text-[9px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-lg uppercase tracking-wider">Reviewing</span>}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Item 
        label="Academic Coursework" 
        status={subjectsPass} 
        subtext={`${records.length} / ${curriculum.length} Subjects Completed`}
        iconClass="ph-books"
      />
      <Item 
        label="Grade Point Average" 
        status={gpaPass} 
        subtext={`Current GPA: ${gpa} (Req: 2.0)`}
        iconClass="ph-chart-line-up"
        type="critical"
      />
      <Item 
        label="Financial Clearance" 
        status={milestones['Financial Clearance']?.status} 
        subtext={milestones['Financial Clearance']?.status === 'verified' ? "Verified & Cleared" : milestones['Financial Clearance']?.status === 'pending' ? "Pending Registrar Review" : "Status: Missing Document"}
        iconClass="ph-bank"
      />
      <Item 
        label="Library Records" 
        status={milestones['Library Clearance']?.status} 
        subtext={milestones['Library Clearance']?.status === 'verified' ? "Verified & Cleared" : milestones['Library Clearance']?.status === 'pending' ? "Pending Library Review" : "Status: Missing Document"}
        iconClass="ph-book-bookmark"
      />
      <Item 
        label="Transcript Finalization" 
        status={milestones['Transcript']?.status} 
        subtext={milestones['Transcript']?.status === 'verified' ? "Verified & Cleared" : milestones['Transcript']?.status === 'pending' ? "Pending Review" : "Status: Missing Document"}
        iconClass="ph-file-text"
      />
      <Item 
        label="Academic Internship" 
        status={milestones['Academic Internship']?.status} 
        subtext={milestones['Academic Internship']?.status === 'verified' ? "Verified & Approved" : milestones['Academic Internship']?.status === 'pending' ? "Assessing Report" : "Status: Missing Document"}
        iconClass="ph-briefcase"
      />
      <Item 
        label="Project Defense" 
        status={milestones['Project Defense']?.status} 
        subtext={milestones['Project Defense']?.status === 'verified' ? "Defense Confirmed" : milestones['Project Defense']?.status === 'pending' ? "Pending Approval" : "Status: Missing Document"}
        iconClass="ph-presentation-chart"
      />
    </div>
  )
}

export default RequirementsChecklist
