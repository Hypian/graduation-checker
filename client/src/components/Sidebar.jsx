const Sidebar = ({ user, activeTab, onTabSwitch, onLogout }) => {
  const isStudent = user?.role === 'student'

  const NavItem = ({ id, iconClass, label, badge }) => (
    <button
      onClick={() => onTabSwitch(id)}
      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
        activeTab === id 
        ? 'bg-white/10 text-brand-peach shadow-xl ring-1 ring-white/20' 
        : 'text-white/60 hover:text-white hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-4">
        <i className={`${iconClass} text-xl`}></i>
        <span>{label}</span>
      </div>
      {badge > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
          {badge}
        </span>
      )}
    </button>
  )

  return (
    <nav className="fixed md:static inset-y-0 left-0 w-80 bg-brand-maroon flex flex-col justify-between flex-shrink-0 text-white z-50 transform -translate-x-full md:translate-x-0 transition-transform duration-500 shadow-2xl">
      <div className="p-10">
        <div className="flex items-center gap-4 text-3xl font-black mb-16 tracking-tighter">
          <div className="w-12 h-12 rounded-2xl bg-brand-peach flex items-center justify-center shadow-lg shadow-black/20">
            <i className="ph-graduation-cap-fill text-brand-maroon text-2xl"></i>
          </div>
          <span>Degreefi</span>
        </div>

        <div className="space-y-3">
          {isStudent ? (
            <>
              <NavItem id="dashboard" iconClass="ph-house" label="Overview" />
              <NavItem id="notifications" iconClass="ph-bell" label="Notifications" badge={user?.notifications?.filter(n => !n.read).length} />
              <NavItem id="courses" iconClass="ph-books" label="My Curriculum" />
              <NavItem id="requirements" iconClass="ph-chart-pie-slice" label="Eligibility Status" />
            </>
          ) : (
            <>
              <NavItem id="students" iconClass="ph-users-three" label="Student Database" />
              <NavItem id="curriculum" iconClass="ph-chalkboard-teacher" label="Curriculum Manager" />
            </>
          )}
        </div>
      </div>

      <div className="p-10 border-t border-white/5">
        <div className="flex items-center gap-4 mb-10 group cursor-pointer">
          <div className="w-14 h-14 rounded-[1.5rem] bg-brand-peach flex items-center justify-center font-black text-brand-maroon text-xl shadow-inner ring-4 ring-white/10 group-hover:ring-white/20 transition-all">
            {user?.name?.[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="font-black truncate text-brand-peach text-sm">{user?.name}</p>
            <p className="text-[9px] uppercase font-black text-white/30 tracking-[0.2em] mt-1">{user?.role}</p>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-5 py-4 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-sm font-bold transition-all active:scale-95"
        >
          <i className="ph-sign-out-bold text-xl"></i>
          <span>Secure Sign Out</span>
        </button>
      </div>
    </nav>
  )
}

export default Sidebar
