const NotificationList = ({ notifications }) => {
  return (
    <div className="space-y-4">
      {notifications.map((notif, idx) => (
        <div 
            key={notif._id || idx} 
            className={`p-6 rounded-[2rem] border transition-all ${
                notif.read ? 'bg-white border-slate-100 opacity-60' : 'bg-white border-brand-maroon/10 shadow-lg shadow-brand-maroon/5 ring-1 ring-brand-maroon/5'
            }`}
        >
          <div className="flex justify-between items-start mb-3">
             <h4 className="font-black text-gray-900 tracking-tight">{notif.title}</h4>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{notif.date}</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed font-medium">{notif.message}</p>
        </div>
      ))}
      {notifications.length === 0 && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
            <i className="ph-bell-slash text-4xl"></i>
            <p className="font-bold italic text-sm">Your inbox is clear.</p>
        </div>
      )}
    </div>
  )
}

export default NotificationList
