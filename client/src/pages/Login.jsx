import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
        const res = await axios.post('/api/auth/login', formData)
        onLogin(res.data.user, res.data.token)
    } catch (err) {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <section className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-white">
      {/* Left Side: Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-brand-peach items-center justify-center flex-col p-12 relative overflow-hidden min-h-[400px]">
          {/* Decorative blobs */}
          <div className="absolute top-10 left-10 w-24 h-24 bg-[#FFD4B5] rounded-full blur-2xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#D4A5A5] rounded-full blur-3xl opacity-40"></div>

          {/* Floating Icons Container */}
          <div className="relative w-full h-80 flex items-center justify-center z-10">
              {/* Cap */}
              <div className="absolute animate-float-slow transition-all duration-300 hover:scale-110 floating-top-left">
                  <i className="ph-graduation-cap-fill text-8xl text-brand-maroon/80 drop-shadow-2xl"></i>
              </div>

              {/* Scroll */}
              <div className="absolute animate-float-medium transition-all duration-300 hover:scale-110 floating-bottom-right">
                  <i className="ph-scroll-fill text-7xl text-brand-maroon/60 drop-shadow-xl rotate-12"></i>
              </div>

              {/* Book 1 */}
              <div className="absolute animate-float-fast transition-all duration-300 hover:scale-110 floating-top-right">
                  <i className="ph-book-open-fill text-6xl text-brand-maroon/40 drop-shadow-lg -rotate-12"></i>
              </div>

              {/* Book 2 */}
              <div className="absolute animate-float-reverse transition-all duration-300 hover:scale-110 floating-bottom-left">
                  <i className="ph-book-bookmark-fill text-5xl text-brand-maroon/20 drop-shadow-md rotate-6"></i>
              </div>

              {/* Extra Decorative Icons */}
              <div className="absolute animate-float-slow floating-mid-right">
                  <i className="ph-star-fill text-3xl text-brand-maroon"></i>
              </div>
              <div className="absolute animate-float-medium floating-mid-left">
                  <i className="ph-sparkle-fill text-4xl text-brand-maroon"></i>
              </div>
          </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 min-h-screen relative shadow-2xl">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center flex flex-col items-center">
            <div className="text-4xl font-bold text-brand-maroon flex flex-col items-center gap-2 mb-6">
              <i className="ph-graduation-cap-fill text-5xl"></i>
              <span>Degreefi</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Login to your Account</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold animate-shake">
                {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <label className="flex-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="role" 
                  value="student" 
                  checked={formData.role === 'student'} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="peer sr-only" 
                />
                <div className="text-center py-2 text-sm font-bold text-gray-500 rounded-lg peer-checked:bg-brand-maroon peer-checked:text-white transition-all">
                  Student
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="role" 
                  value="admin" 
                  checked={formData.role === 'admin'} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="peer sr-only" 
                />
                <div className="text-center py-2 text-sm font-bold text-gray-500 rounded-lg peer-checked:bg-brand-maroon peer-checked:text-white transition-all">
                  Admin
                </div>
              </label>
            </div>

            <div className="space-y-1">
              <label className="block text-gray-700 text-xs font-bold uppercase tracking-wide ml-1">Email</label>
              <input 
                type="email" 
                required 
                placeholder="mail@abc.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-brand-maroon focus:ring-2 focus:ring-brand-maroon/20 outline-none transition-all bg-gray-50/50" 
              />
            </div>

            <div className="space-y-1">
              <label className="block text-gray-700 text-xs font-bold uppercase tracking-wide ml-1">Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-brand-maroon focus:ring-2 focus:ring-brand-maroon/20 outline-none transition-all bg-gray-50/50" 
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <label className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-brand-maroon transition-colors">
                <input type="checkbox" className="rounded text-brand-maroon focus:ring-brand-maroon border-gray-300" />
                <span>Remember Me</span>
              </label>
              <a href="#" className="text-brand-maroon hover:underline">Forgot Password?</a>
            </div>

            <button 
              type="submit" 
              className="w-full bg-brand-maroon hover:bg-[#631a42] text-white font-bold rounded-xl py-3.5 text-sm shadow-xl shadow-brand-maroon/20 transition-all active:scale-95"
            >
              Login
            </button>
          </form>

          <div className="mt-8 text-center text-xs font-bold text-gray-500">
            Not Registered Yet? <Link to="/register" className="text-brand-maroon hover:underline ml-1">Create an account</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Login
