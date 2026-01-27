import { useState, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useModal } from '../context/ModalContext'

const ClearanceUploads = () => {
  const { refreshUser } = useAuth()
  const { showModal } = useModal()
  const [file, setFile] = useState(null)
  const [type, setType] = useState('Financial Clearance')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return showModal({
      title: 'Selection Required',
      message: 'Please choose a file to upload first.',
      type: 'error'
    })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    setLoading(true)
    try {
      await axios.post('/api/student/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      await refreshUser()
      showModal({
        title: 'Document Transmitted',
        message: `Your ${type} has been uploaded and is waiting for registrar verification.`,
        type: 'success'
      })
      setFile(null)
    } catch (err) {
      console.error('Upload error:', err)
      showModal({
        title: 'Upload Failed',
        message: err.response?.data?.message || 'Server error occurred during transmission.',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm space-y-8">
      <h2 className="text-xl font-bold text-gray-900">Clearance Docs</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Category</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 text-gray-900 rounded-xl p-4 focus:border-brand-maroon outline-none text-sm font-bold cursor-pointer appearance-none"
          >
            <option>Financial Clearance</option>
            <option>Library Clearance</option>
            <option>Transcript</option>
            <option>Academic Internship</option>
            <option>Project Defense</option>
          </select>
        </div>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all group ${
            file ? 'border-green-400 bg-green-50/20' : 'border-slate-100 hover:border-brand-maroon/50 hover:bg-brand-peach/5'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            hidden 
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <i className={`ph-cloud-arrow-up text-4xl mb-4 block transition-colors ${
            file ? 'text-green-500' : 'text-slate-300 group-hover:text-brand-maroon'
          }`}></i>
          {file ? (
             <div>
                <p className="text-xs font-black text-green-600 truncate px-4">{file.name}</p>
                <p className="text-[9px] text-green-400 mt-1 font-bold">File Selected - Ready to Upload</p>
             </div>
          ) : (
             <>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">Tap to upload document</p>
                <p className="text-[9px] text-slate-300 mt-2 font-bold italic">PDF, Word, or Images</p>
             </>
          )}
        </div>

        <button 
          type="submit"
          disabled={loading || !file}
          className="w-full bg-slate-900 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/5 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Transmit Document'}
        </button>
      </form>
    </div>
  )
}

export default ClearanceUploads
