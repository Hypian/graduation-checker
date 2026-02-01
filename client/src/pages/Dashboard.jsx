import { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import StatsCard from '../components/StatsCard'
import AddCourseForm from '../components/AddCourseForm'
import CourseList from '../components/CourseList'
import StudentTable from '../components/StudentTable'
import CurriculumManager from '../components/CurriculumManager'
import DashboardRequirements from '../components/DashboardRequirements'
import ClearanceUploads from '../components/ClearanceUploads'
import NotificationList from '../components/NotificationList'
import RequirementsChecklist from '../components/RequirementsChecklist'

const Dashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState(user?.role === 'admin' ? 'students' : 'dashboard')
  const [curriculum, setCurriculum] = useState([])
  const [records, setRecords] = useState([])
  const [notifications, setNotifications] = useState(user?.notifications || [])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [currRes, recRes, notifRes] = await Promise.all([
        axios.get('/api/curriculum'),
        axios.get('/api/student/records'),
        user?.role === 'student' ? axios.get('/api/student/notifications') : Promise.resolve({ data: [] })
      ])
      setCurriculum(currRes.data)
      setRecords(recRes.data)
      if (user?.role === 'student') setNotifications(notifRes.data)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'student') {
        fetchData()
    }
  }, [user])

  const handleLogout = () => {
    window.location.href = '/login'
  }

  // Derived Stats
  const gpa = records.length > 0 
    ? (records.reduce((sum, r) => sum + r.grade, 0) / records.length).toFixed(2) 
    : "0.00"
    
  const allMilestonesDone = user?.milestones 
    ? Object.values(user.milestones).every(m => m === 'verified')
    : false

  const isEligible = records.length >= curriculum.length && curriculum.length > 0 && parseFloat(gpa) >= 2.0 && allMilestonesDone

  return (
    <div className="flex h-screen w-full overflow-hidden bg-brand-peach">
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        onTabSwitch={setActiveTab} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-white md:m-4 md:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <header className="p-8 flex items-center justify-between border-b border-gray-50 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight capitalize">
                {activeTab.replace('-', ' ')}
            </h1>
            <p className="text-xs font-bold text-gray-400 mt-1">
                {user?.role === 'student' ? 'Graduation Status Tracking System' : 'University Registrar Management Console'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:block text-right">
                <p className="text-sm font-black text-gray-900 leading-none">{user?.name}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{user?.regNumber || 'System Administrator'}</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center">
                <i className="ph-user-circle-gear text-2xl text-slate-400"></i>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10">
           <div className="max-w-6xl mx-auto space-y-10">
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <StatsCard 
                        completedSubjects={records.length} 
                        totalSubjects={curriculum.length} 
                        gpa={gpa} 
                        isEligible={isEligible}
                    />
                    <AddCourseForm 
                        availableCourses={curriculum} 
                        onCourseAdded={fetchData} 
                    />
                    
                    {/* Requirements Checklist Card */}
                    <DashboardRequirements 
                        completedSubjects={records.length}
                        totalSubjects={curriculum.length}
                    />

                    {/* Uploads Column */}
                    <div className="space-y-10">
                        <ClearanceUploads />
                    </div>

                    <div className="lg:col-span-3 pt-10 border-t border-slate-50">
                         <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-maroon/5 text-brand-maroon flex items-center justify-center">
                                <i className="ph-book-open-bold text-xl"></i>
                            </div>
                            Academic Results History
                         </h3>
                         <CourseList 
                            userRecords={records} 
                            availableCourses={curriculum} 
                         />
                    </div>
                </div>
              )}

              {activeTab === 'students' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Registered BBICT Candidates</h3>
                        <div className="px-5 py-2.5 bg-brand-maroon text-white rounded-xl text-xs font-black shadow-lg shadow-brand-maroon/20 flex items-center gap-2">
                            <i className="ph-export-bold"></i> Export Database
                        </div>
                    </div>
                    <StudentTable />
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="max-w-4xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-4 mb-10">
                        <i className="ph-bell-ringing-bold text-3xl text-brand-maroon"></i>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">University Notifications</h3>
                    </div>
                    <NotificationList notifications={notifications} />
                </div>
              )}

              {activeTab === 'requirements' && (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
                        <div>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-3">Eligibility Roadmap</h2>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Comprehensive breakdown of your graduation status</p>
                        </div>
                        <div className={`px-8 py-4 rounded-[2rem] flex items-center gap-5 shadow-2xl transition-all ${
                            isEligible ? 'bg-green-500 text-white' : 'bg-white border border-slate-100'
                        }`}>
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                               isEligible ? 'bg-white/20' : 'bg-slate-100'
                           }`}>
                            <i className={`ph-${isEligible ? 'seal-check-fill' : 'lock-keyhole-bold'} text-2xl`}></i>
                           </div>
                           <div>
                             <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isEligible ? 'text-white/60' : 'text-slate-400'}`}>Graduation Status</p>
                             <p className={`text-sm font-black uppercase font-mono ${isEligible ? 'text-white' : 'text-slate-900'}`}>{isEligible ? 'Eligible for Graduation' : 'Not Yet Eligible'}</p>
                           </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Academic Standing Card */}
                        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50 space-y-10">
                             <h3 className="text-xl font-black text-gray-900 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-maroon text-white flex items-center justify-center">
                                    <i className="ph-student-bold text-2xl"></i>
                                </div>
                                Academic Performance
                             </h3>
                             
                             <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Course Credits Progress</p>
                                <div className="flex items-baseline gap-3 mb-4">
                                    <span className="text-6xl font-black text-brand-maroon">{records.length}</span>
                                    <span className="text-xl font-black text-slate-300">/ {curriculum.length} Subjects</span>
                                </div>
                                <div className="w-full bg-white h-4 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                                    <div 
                                        className="h-full bg-brand-maroon rounded-full shadow-lg shadow-brand-maroon/20 transition-all duration-1000" 
                                        style={{ width: `${(records.length / curriculum.length) * 100}%` }}
                                    ></div>
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-6">
                                <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current GPA</p>
                                    <p className="text-3xl font-black text-slate-900">{gpa}</p>
                                </div>
                                <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Minimum Req</p>
                                    <p className="text-3xl font-black text-slate-900">2.00</p>
                                </div>
                             </div>
                        </div>

                        {/* Mandatory Clearances */}
                        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50 space-y-8">
                             <h3 className="text-xl font-black text-gray-900 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center">
                                    <i className="ph-file-check-fill text-2xl"></i>
                                </div>
                                Mandatory Clearances
                             </h3>
                             <RequirementsChecklist records={records} curriculum={curriculum} gpa={gpa} />
                        </div>
                    </div>
                </div>
              )}

              {activeTab === 'courses' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="mb-10">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Comprehensive Curriculum</h3>
                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">BBICT Full Course Breakdown</p>
                    </div>
                    <CourseList userRecords={records} availableCourses={curriculum} />
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <CurriculumManager />
                </div>
              )}
           </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
