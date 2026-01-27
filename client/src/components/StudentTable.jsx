import { useState, useEffect } from 'react'
import axios from 'axios'
import { useModal } from '../context/ModalContext'
import StudentDetailModal from './StudentDetailModal'

const StudentTable = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { showModal } = useModal()

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/admin/students')
      setStudents(res.data)
    } catch (err) {
      console.error('Error fetching students:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id) => {
    showModal({
      title: 'Remove Student Archive?',
      message: 'This will permanently erase the student and all linked records. This action cannot be undone.',
      type: 'confirm',
      onConfirm: async () => {
        try {
            await axios.delete(`/api/admin/students/${id}`)
            fetchStudents()
            showModal({ title: 'Success', message: 'Student removed from registry.', type: 'success' })
        } catch (err) {
            showModal({ title: 'Error', message: 'Registry update failed.', type: 'error' })
        }
      }
    })
  }

  if (loading) return (
    <div className="py-24 flex flex-col items-center justify-center gap-4 text-slate-300">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-brand-maroon rounded-full animate-spin"></div>
        <p className="font-black italic text-[10px] uppercase tracking-widest">Syncing Registry Records...</p>
    </div>
  )

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.regNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-2xl shadow-slate-200/50 text-slate-900 animate-in fade-in duration-1000">
      {selectedStudentId && (
        <StudentDetailModal 
            studentId={selectedStudentId} 
            onClose={() => setSelectedStudentId(null)} 
            onRefresh={fetchStudents}
        />
      )}

      {/* Table Toolbar */}
      <div className="px-10 py-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Enrolled BBICT Candidates</h2>
        <div className="relative w-full md:w-80 group">
            <i className="ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-maroon transition-colors"></i>
            <input 
                type="text" 
                placeholder="Search by name or reg..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold focus:border-brand-maroon outline-none transition-all shadow-sm"
            />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50/80 backdrop-blur-sm border-b border-gray-100">
            <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-10">
                    <input type="checkbox" className="rounded text-brand-maroon focus:ring-brand-maroon border-slate-200" />
                </th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Information</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reg Number</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
            {filteredStudents.map(student => {
                const ms = student.milestones || {}
                const mandatoryDocs = ['Financial Clearance', 'Library Clearance', 'Transcript', 'Academic Internship', 'Project Defense']
                
                // Calculate Progress
                let docScore = 0;
                mandatoryDocs.forEach(k => { if (ms[k]?.status === 'verified') docScore++; })
                const percent = Math.round((( (student.records?.length || 0) + docScore) / (59 + 5)) * 100)
                const isEligible = percent >= 100

                return (
                <tr key={student._id} className="hover:bg-brand-peach/5 transition-colors group">
                    <td className="px-10 py-6">
                        <input type="checkbox" className="rounded text-brand-maroon focus:ring-brand-maroon border-slate-200" />
                    </td>
                    <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-[1.2rem] bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-xl relative ring-4 ring-slate-50">
                        {student.name?.[0]?.toUpperCase() || '?'}
                        {Object.values(ms).some(m => m?.status === 'pending') && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 border-2 border-white rounded-full shadow-lg"></div>
                        )}
                        </div>
                        <div>
                        <h5 className="font-black text-gray-900 text-sm tracking-tight leading-tight group-hover:text-brand-maroon transition-colors">{student.name}</h5>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{student.email}</p>
                        </div>
                    </div>
                    </td>
                    <td className="px-10 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-mono font-black uppercase tracking-tighter">
                        {student.regNumber || 'N/A'}
                    </span>
                    </td>
                    <td className="px-10 py-6">
                        <div className="flex items-center gap-4 w-40">
                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-50">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${isEligible ? 'bg-gradient-to-r from-green-400 to-emerald-600' : 'bg-gradient-to-r from-brand-maroon to-[#a32d6f]'}`}
                                    style={{ width: `${Math.min(100, percent)}%` }}
                                ></div>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 w-8">{percent}%</span>
                        </div>
                    </td>
                    <td className="px-10 py-6">
                    <div className="flex items-center -space-x-3">
                        {mandatoryDocs.map(doc => {
                            const status = ms[doc]?.status || 'missing'
                            const isCleared = status === 'verified'
                            return (
                                <div 
                                    key={doc}
                                    title={doc}
                                    className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black transition-all hover:-translate-y-1 hover:z-10 cursor-help ${
                                        isCleared ? 'bg-green-500 text-white' : status === 'pending' ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-400'
                                    }`}
                                >
                                    {doc.charAt(0)}
                                </div>
                            )
                        })}
                    </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-3 transition-all">
                        <button 
                            onClick={() => setSelectedStudentId(student._id)}
                            className="bg-brand-maroon text-white px-5 py-2.5 rounded-xl shadow-xl shadow-brand-maroon/20 hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
                        >
                            <i className="ph-pencil-simple-line-bold text-lg"></i>
                            <span>Review</span>
                        </button>
                        <button 
                            onClick={() => handleDelete(student._id)}
                            className="bg-white text-slate-300 hover:text-red-500 p-3 rounded-xl shadow-md border border-slate-100 hover:scale-105 transition-all"
                            title="Purge Record"
                        >
                            <i className="ph-trash-bold text-lg"></i>
                        </button>
                    </div>
                    </td>
                </tr>
                )
            })}
            {filteredStudents.length === 0 && (
                <tr>
                <td colSpan="6" className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                        <i className="ph-users-three text-7xl"></i>
                        <p className="font-black uppercase tracking-[0.3em] text-xs">Registry Results Exhausted</p>
                    </div>
                </td>
                </tr>
            )}
            </tbody>
        </table>
      </div>
    </div>
  )
}

export default StudentTable
