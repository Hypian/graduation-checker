import { useModal } from '../context/ModalContext'

const CustomModal = () => {
  const { modal, hideModal } = useModal()

  if (!modal.isOpen) return null

  const typeConfig = {
    success: {
      icon: 'ph-check-circle-fill',
      iconClass: 'bg-green-100 text-green-500',
      btnClass: 'bg-brand-maroon hover:bg-[#631a42]'
    },
    error: {
      icon: 'ph-warning-circle-fill',
      iconClass: 'bg-red-100 text-red-500',
      btnClass: 'bg-red-500 hover:bg-red-600'
    },
    confirm: {
      icon: 'ph-question-fill',
      iconClass: 'bg-blue-100 text-blue-500',
      btnClass: 'bg-brand-maroon hover:bg-[#631a42]'
    }
  }

  const config = typeConfig[modal.type] || typeConfig.success

  const handleConfirm = () => {
    if (modal.onConfirm) modal.onConfirm()
    hideModal()
  }

  const handleCancel = () => {
    if (modal.onCancel) modal.onCancel()
    hideModal()
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-maroon/20 backdrop-blur-md"
        onClick={hideModal}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl border border-white/50 transform animate-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-inner ${config.iconClass}`}>
            <i className={`${config.icon} text-4xl`}></i>
          </div>

          <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">{modal.title || 'Notice'}</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">{modal.message}</p>

          <div className="flex gap-4 w-full">
            {modal.type === 'confirm' && (
              <button 
                onClick={handleCancel}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-4 rounded-xl transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
            )}
            <button 
              onClick={handleConfirm}
              className={`flex-1 text-white font-black py-4 rounded-xl shadow-xl shadow-brand-maroon/10 transition-all active:scale-[0.98] ${config.btnClass}`}
            >
              {modal.type === 'confirm' ? 'Confirm' : 'Got it'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomModal
