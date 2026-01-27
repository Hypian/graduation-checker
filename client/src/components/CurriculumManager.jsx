import { useState, useEffect } from 'react'
import axios from 'axios'
import { useModal } from '../context/ModalContext'

const CurriculumManager = () => {
  const { showModal } = useModal()
  const [courses, setCourses] = useState([])
  const [formData, setFormData] = useState({ code: '', name: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/curriculum')
      setCourses(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
        await axios.post('/api/curriculum', formData)
        fetchCourses()
        setFormData({ code: '', name: '' })
        showModal({ title: 'Subject Deployed', message: 'The new course has been successfully added to the curriculum.', type: 'success' })
    } catch (err) {
        showModal({ title: 'Error', message: 'Failed to add subject. Please check if the code already exists.', type: 'error' })
    }
  }

  const handleDelete = (id) => {
    showModal({
      title: 'Remove Subject?',
      message: 'This will eliminate the subject from the official BBICT curriculum. This cannot be undone.',
      type: 'confirm',
      onConfirm: async () => {
        try {
            await axios.delete(`/api/curriculum/${id}`)
            fetchCourses()
            showModal({ title: 'Removed', message: 'Subject deleted from curriculum.', type: 'success' })
        } catch (err) {
            showModal({ title: 'Deletion Failed', message: 'Could not remove subject.', type: 'error' })
        }
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Add Form */}
      <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm self-start">
        <h3 className="text-lg font-bold text-gray-900 mb-8">Add New Subject</h3>
        <form onSubmit={handleAdd} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Code</label>
            <input 
              type="text" 
              placeholder="e.g., BIT 1201" 
              required
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-sm font-bold focus:border-brand-maroon outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Name</label>
            <input 
              type="text" 
              placeholder="e.g., Database Systems" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-sm font-bold focus:border-brand-maroon outline-none"
            />
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl">
            <i className="ph-plus-bold text-xl"></i> Deploy Subject
          </button>
        </form>
      </div>

      {/* Course List */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
            <i className="ph-books-bold text-brand-maroon text-2xl"></i>
            Active BBICT Curriculum ({courses.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course, idx) => (
            <div key={course._id} className="flex items-center justify-between p-5 bg-white border border-slate-50 rounded-2xl hover:border-brand-maroon/20 hover:shadow-lg hover:shadow-brand-maroon/5 transition-all group">
               <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-300 w-4">{idx + 1}</span>
                  <div>
                    <p className="text-xs font-black text-brand-maroon leading-none mb-1">{course.code}</p>
                    <p className="text-sm font-bold text-gray-800">{course.name}</p>
                  </div>
               </div>
               <button 
                onClick={() => handleDelete(course._id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
               >
                 <i className="ph-trash text-lg"></i>
               </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CurriculumManager
