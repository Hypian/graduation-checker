import { useState, useEffect } from 'react'
import axios from 'axios'
import { useModal } from '../context/ModalContext'

const StudentDetailModal = ({ studentId, onClose, onRefresh }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('courses')
  const [message, setMessage] = useState({ title: '', body: '' })
  const [sendingMessage, setSendingMessage] = useState(false)
  const { showModal } = useModal()

  useEffect(() => {
    fetchDetails()
  }, [studentId])

  const fetchDetails = async () => {
    try {
      const res = await axios.get(`/api/admin/students/${studentId}`)
      setData(res.data)
    } catch (err) {
      console.error('Error fetching student details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (key) => {
    try {
      await axios.post('/api/admin/verify-milestone', {
        studentId,
        milestoneKey: key,
        status: 'verified'
      })
      fetchDetails()
      if (onRefresh) onRefresh()
      showModal({ title: 'Approved', message: `${key} has been verified.`, type: 'success' })
    } catch (err) {
      showModal({ title: 'Error', message: 'Failed to verify document.', type: 'error' })
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.title || !message.body) return
    
    setSendingMessage(true)
    try {
      await axios.post('/api/admin/send-notification', {
        studentId,
        title: message.title,
        message: message.body
      })
      setMessage({ title: '', body: '' })
      showModal({ title: 'Dispatched', message: 'The notification has been sent to the student inbox.', type: 'success' })
    } catch (err) {
      showModal({ title: 'Transmission Error', message: 'Could not send notification.', type: 'error' })
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-brand-maroon/10 backdrop-blur-sm">
        <div className="w-10 h-10 border-4 border-white border-t-brand-maroon rounded-full animate-spin"></div>
    </div>
  )

  if (!data) return null

  const { student, records } = data
  const ms = student.milestones || {}
  
  // Calculate Progress
  const mandatoryDocs = ['Financial Clearance', 'Library Clearance', 'Transcript', 'Academic Internship', 'Project Defense'];
  let docScore = 0;
  mandatoryDocs.forEach(key => {
    if (ms[key]?.status === 'verified') docScore++;
  });
  
  const totalSubjects = 59; // Program default
  const completedSubjects = records.length;
  const percent = Math.round(((completedSubjects + docScore) / (totalSubjects + 5)) * 100);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-brand-maroon/30 backdrop-blur-lg" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-5xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in duration-300">
        
        {/* Sidebar: Student Info */}
        <div className="w-full md:w-80 bg-gray-50 p-10 flex flex-col items-center text-center border-r border-gray-100 flex-shrink-0 overflow-y-auto">
            <div className="w-24 h-24 rounded-[2rem] bg-brand-maroon text-white flex items-center justify-center text-3xl font-black mb-6 shadow-2xl shadow-brand-maroon/30 ring-4 ring-white/50">
                {student.name?.[0].toUpperCase()}
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{student.name}</h2>
            <p className="text-xs font-mono font-bold text-brand-maroon bg-brand-maroon/10 px-4 py-1.5 rounded-full mb-4 ring-1 ring-brand-maroon/20">
                {student.regNumber || 'N/A'}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
                <i className="ph-phone-fill text-brand-maroon"></i> {student.phone || 'NO CONTACT'}
            </p>

            <div className="w-full space-y-6 mb-10">
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 relative group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Degree Completion</p>
                    <div className="flex items-center justify-between">
                        <span className="text-4xl font-black text-brand-maroon">{percent}%</span>
                        <div className="w-12 h-12 relative">
                            <svg viewBox="0 0 36 36" className="transform -rotate-90">
                                <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="text-brand-maroon transition-all duration-1000" strokeDasharray={`${percent}, 100`} strokeWidth="4" stroke="currentColor" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <button 
                onClick={onClose}
                className="w-full bg-white hover:bg-slate-100 text-slate-400 font-bold py-4 rounded-2xl transition-all border border-slate-200 shadow-sm mt-auto"
            >
                Close Inspector
            </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-100 p-3 gap-2 bg-white flex-shrink-0">
                {[
                    { id: 'courses', label: 'Subjects History', icon: 'ph-books' },
                    { id: 'clearance', label: 'Clearance Desk', icon: 'ph-shield-check' },
                    { id: 'message', label: 'Messaging Center', icon: 'ph-paper-plane-tilt' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === tab.id 
                            ? 'bg-brand-maroon text-white shadow-xl shadow-brand-maroon/20' 
                            : 'bg-white text-slate-400 hover:bg-slate-50'
                        }`}
                    >
                        <i className={`${tab.icon} text-lg`}></i>
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-10">
                {activeTab === 'courses' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Academic Transcripts</h3>
                            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-lg uppercase tracking-widest">
                                {records.length} Recorded Units
                            </span>
                        </div>
                        <div className="space-y-3">
                            {records.map(record => (
                                <div key={record._id} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-brand-maroon/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-maroon font-black text-xs shadow-sm">
                                            {record.courseCode?.substring(0, 3)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm leading-tight">{record.courseName}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{record.courseCode}</p>
                                        </div>
                                    </div>
                                    <div className={`text-xl font-black ${record.grade >= 2.0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {record.grade.toFixed(1)}
                                    </div>
                                </div>
                            ))}
                            {records.length === 0 && (
                                <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                                    <i className="ph-folder-open text-6xl"></i>
                                    <p className="font-bold uppercase tracking-widest text-xs">No Results Found</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'clearance' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Regulatory Mandates</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {mandatoryDocs.map(key => {
                                const status = ms[key]?.status || 'missing';
                                const filename = ms[key]?.filename;
                                return (
                                    <div key={key} className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between ${
                                        status === 'verified' ? 'bg-green-50/20 border-green-100' : 
                                        status === 'pending' ? 'bg-amber-50/20 border-amber-100' : 
                                        'bg-white border-slate-100 opacity-60'
                                    }`}>
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                                                status === 'verified' ? 'bg-green-500 text-white' : 
                                                status === 'pending' ? 'bg-amber-400 text-white animate-pulse' : 
                                                'bg-slate-100 text-slate-400'
                                            }`}>
                                                <i className={status === 'verified' ? 'ph-seal-check-fill' : 'ph-file-text'}></i>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 text-sm">{key}</h4>
                                                <p className={`text-[10px] font-black uppercase tracking-widest mt-1.5 ${
                                                    status === 'verified' ? 'text-green-600' : 
                                                    status === 'pending' ? 'text-amber-600' : 
                                                    'text-slate-300'
                                                }`}>
                                                    {status === 'pending' ? 'Awaiting Review' : status}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            {filename && (
                                                <a 
                                                    href={`/uploads/${filename}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="bg-white text-slate-400 hover:text-brand-maroon w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200/50 border border-slate-100 transition-all hover:scale-105"
                                                    title="View Document Attachment"
                                                >
                                                    <i className="ph-eye-bold text-xl"></i>
                                                </a>
                                            )}
                                            {status === 'pending' && (
                                                <button 
                                                    onClick={() => handleVerify(key)}
                                                    className="bg-brand-maroon hover:bg-[#611b42] text-white px-8 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-maroon/20 transition-all hover:scale-105 active:scale-95"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {status === 'verified' && (
                                                <div className="bg-green-100 text-green-700 px-6 h-12 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-200">
                                                    Verified
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'message' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-10">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Direct Notifications</h3>
                            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Communicate clearance issues with student</p>
                        </div>
                        <form onSubmit={handleSendMessage} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Subject</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="Topic: e.g. Missing Financial Receipt"
                                    value={message.title}
                                    onChange={(e) => setMessage({...message, title: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-brand-maroon outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
                                <textarea 
                                    required
                                    rows="6"
                                    placeholder="Write your instructions or status update here..."
                                    value={message.body}
                                    onChange={(e) => setMessage({...message, body: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-brand-maroon outline-none resize-none"
                                ></textarea>
                            </div>
                            <button 
                                type="submit"
                                disabled={sendingMessage}
                                className="w-full bg-brand-maroon hover:bg-[#611b42] text-white font-black py-5 rounded-2xl shadow-2xl shadow-brand-maroon/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <i className="ph-paper-plane-tilt-bold text-xl"></i>
                                {sendingMessage ? 'DISPATCHING...' : 'SEND TO INBOX'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDetailModal
