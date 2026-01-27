import { useState } from 'react'
import axios from 'axios'
import { useModal } from '../context/ModalContext'

const AddCourseForm = ({ availableCourses, onCourseAdded }) => {
  const { showModal } = useModal()
  const [formData, setFormData] = useState({
    courseCode: '',
    grade: '4.0'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.courseCode) return
    
    setLoading(true)
    try {
      await axios.post('/api/student/records', formData)
      onCourseAdded()
      setFormData({ ...formData, courseCode: '' })
      showModal({ title: 'Record Saved', message: 'The subject result has been added to your academic history.', type: 'success' })
    } catch (err) {
      console.error('Error adding course:', err)
      showModal({ title: 'Storage Error', message: 'Failed to record the subject result. Please try again.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-8">Record Result</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest ml-1">Select Course</label>
          <select 
            required
            spellCheck="false"
            value={formData.courseCode}
            onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
            className="w-full bg-slate-50 border border-slate-100 text-gray-900 rounded-xl p-3.5 focus:border-brand-maroon outline-none text-sm font-bold appearance-none cursor-pointer"
          >
            <option value="">Choose from Curriculum...</option>
            {availableCourses.map(course => (
              <option key={course._id} value={course.code}>{course.code} - {course.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest ml-1">Grade Earned</label>
          <select 
            value={formData.grade}
            onChange={(e) => setFormData({...formData, grade: e.target.value})}
            className="w-full bg-slate-50 border border-slate-100 text-gray-900 rounded-xl p-3.5 focus:border-brand-maroon outline-none text-sm font-bold cursor-pointer"
          >
            <option value="4.0">Grade A (4.0)</option>
            <option value="3.0">Grade B (3.0)</option>
            <option value="2.0">Grade C (2.0)</option>
            <option value="1.0">Grade D (1.0)</option>
            <option value="0.0">Grade F (0.0)</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-brand-maroon hover:bg-[#631a42] text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand-maroon/20 disabled:opacity-50"
        >
          {loading ? 'Processing...' : (
            <><i className="ph-plus-bold"></i> Save Record</>
          )}
        </button>
      </form>
    </div>
  )
}

export default AddCourseForm
