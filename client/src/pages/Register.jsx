import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useModal } from '../context/ModalContext'

const Register = () => {
  const navigate = useNavigate()
  const { showModal } = useModal()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    regNumber: '',
    password: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
        await axios.post('/api/auth/register', formData)
        showModal({
          title: 'Account Created',
          message: 'Your Registrar profile has been established. You may now sign in.',
          type: 'success',
          onConfirm: () => navigate('/login')
        })
    } catch (err) {
        setError(err.response?.data?.message || 'Registration failed.')
    }
  }

  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center bg-brand-peach p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-xl border border-white/50 p-8 md:p-10 rounded-3xl w-full max-w-md shadow-2xl relative my-auto">
        
        {/* Back Button */}
        <Link 
          to="/login"
          className="absolute top-8 left-8 text-gray-400 hover:text-brand-maroon transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
        >
          <i className="ph-arrow-left-bold"></i> Back
        </Link>

        <div className="text-center mb-10 mt-4">
          <h2 className="text-3xl font-extrabold text-brand-maroon mb-2">Create Account</h2>
          <p className="text-gray-500 text-sm font-medium">Join Degreefi today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wide ml-1">Full Name</label>
            <input 
              type="text" 
              required 
              placeholder="John Doe" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-brand-maroon outline-none bg-gray-50/50 transition-all font-medium" 
            />
          </div>

          <div className="space-y-1">
            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wide ml-1">Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="john@university.edu" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-brand-maroon outline-none bg-gray-50/50 transition-all font-medium" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-gray-700 text-xs font-bold uppercase tracking-wide ml-1">Phone</label>
              <input 
                type="tel" 
                required 
                placeholder="077..." 
                maxLength="10"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-brand-maroon outline-none bg-gray-50/50 transition-all font-medium" 
              />
            </div>
            <div className="space-y-1">
              <label className="block text-gray-700 text-xs font-bold uppercase tracking-wide ml-1">Reg Number</label>
              <input 
                type="text" 
                required 
                placeholder="REG/..." 
                value={formData.regNumber}
                onChange={(e) => setFormData({...formData, regNumber: e.target.value.toUpperCase()})}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-brand-maroon outline-none bg-gray-50/50 transition-all font-medium uppercase" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wide ml-1">Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-brand-maroon outline-none bg-gray-50/50 transition-all font-medium" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-brand-maroon hover:bg-[#631a42] text-white font-bold rounded-xl py-4 text-sm font-bold shadow-xl shadow-brand-maroon/20 transition-all active:scale-95 mt-4"
          >
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center text-xs font-bold text-gray-500">
          Already have an account? <Link to="/login" className="text-brand-maroon hover:underline ml-1">Sign in</Link>
        </div>
      </div>
    </section>
  )
}

export default Register
