// ==========================================
// APP STATE & CONFIGURATION
// ==========================================
const App = {
    currentUser: null,
    data: {
        users: [
            {
                email: "admin@degreefi.edu",
                password: "admin",
                role: "admin",
                name: "Admin User"
            }
        ]
    },

    init() {
        this.loadData();
        this.bindEvents();
        this.checkAuth();
        this.setupMobileMenu();
    },

    loadData() {
        const stored = localStorage.getItem('degreefi_data_v2');
        if (stored) {
            this.data = JSON.parse(stored);
            // Migrate: Ensure all users have notifications array and normalized emails
            this.data.users.forEach(u => {
                if (!u.notifications) u.notifications = [];
                if (u.email) u.email = u.email.toLowerCase().trim();
            });
            this.saveData();
        } else {
            // Seed initial data if new
            this.saveData();
        }
    },

    saveData() {
        localStorage.setItem('degreefi_data_v2', JSON.stringify(this.data));
    },

    checkAuth() {
        // Simple session verify
        const sessionEmail = localStorage.getItem('degreefi_session_user');
        if (sessionEmail) {
            const normalizedSessionEmail = sessionEmail.toLowerCase().trim();
            const user = this.data.users.find(u => u.email.toLowerCase().trim() === normalizedSessionEmail);
            if (user) {
                this.loginSuccess(user);
            } else {
                this.logout();
            }
        } else {
            showView('login-view');
        }
    },

    register(name, email, password, regNumber) {
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedName = name.toLowerCase().trim();
        const normalizedReg = regNumber.toUpperCase().trim();

        const duplicateUser = this.data.users.find(u =>
            u.email.toLowerCase().trim() === normalizedEmail ||
            u.name.toLowerCase().trim() === normalizedName ||
            (u.regNumber && u.regNumber.toUpperCase().trim() === normalizedReg)
        );

        if (duplicateUser) {
            if (duplicateUser.email.toLowerCase().trim() === normalizedEmail) {
                this.showModal('error', 'Email in Use', 'This email address is already linked to an account. Try logging in instead.');
            } else if (duplicateUser.name.toLowerCase().trim() === normalizedName) {
                this.showModal('warning', 'Name Taken', 'A student with this exact name is already registered. Please use your full legal name.');
            } else {
                this.showModal('error', 'Reg Number Taken', 'This registration number is already assigned to another student.');
            }
            return;
        }

        const newUser = {
            email: normalizedEmail,
            password,
            role: 'student',
            name,
            regNumber: normalizedReg,
            courses: [],
            files: [],
            requirements: {
                total: { current: 0, max: 120 },
                core: { current: 0, max: 45 },
                elective: { current: 0, max: 30 },
                gened: { current: 0, max: 45 }
            },
            notifications: []
        };

        this.data.users.push(newUser);
        this.saveData();

        this.showModal('success', 'Account Created!', 'Welcome to Degreefi. Your student portal is ready—please log in to begin tracking your progress.', () => {
            // Clear register form
            const regForm = document.getElementById('register-form');
            if (regForm) regForm.reset();

            showView('login-view');
            // Auto-fill login (UI convenience)
            document.getElementById('login-email').value = email;
            document.getElementById('login-password').value = password;
        });
    },

    login(email, password, role) {
        const normalizedEmail = email.toLowerCase().trim();
        const user = this.data.users.find(u => u.email.toLowerCase().trim() === normalizedEmail && u.password === password && u.role === role);

        if (user) {
            this.loginSuccess(user);
        } else {
            const isStudent = role === 'student';
            const title = isStudent ? 'Account Not Found' : 'Login Failed';
            const message = isStudent
                ? "We couldn't find a student account with those credentials. If you're new, please create an account to get started."
                : "The credentials you entered do not match our records or the selected role.";

            if (isStudent) {
                this.showModal('warning', title, message, () => {
                    showView('register-view');
                    // Auto-fill email for convenience
                    document.getElementById('reg-email').value = email;
                }, {
                    showCancel: true,
                    confirmText: 'Create Account'
                });
            } else {
                this.showModal('error', title, message);
            }
        }
    },

    showModal(type, title, message, onConfirm = null, config = {}) {
        const modal = document.getElementById('custom-modal');
        const card = document.getElementById('modal-card');
        const iconContainer = document.getElementById('modal-icon-container');
        const icon = document.getElementById('modal-icon');
        const titleEl = document.getElementById('modal-title');
        const messageEl = document.getElementById('modal-message');
        const confirmBtn = document.getElementById('modal-confirm-btn');
        const cancelBtn = document.getElementById('modal-cancel-btn');

        // Reset classes
        iconContainer.className = 'w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner';
        icon.className = 'text-3xl ';

        // Style based on type
        if (type === 'success') {
            iconContainer.classList.add('bg-green-50', 'text-green-600');
            icon.classList.add('ph-check-circle-fill');
        } else if (type === 'error') {
            iconContainer.classList.add('bg-red-50', 'text-red-600');
            icon.classList.add('ph-warning-octagon-fill');
        } else if (type === 'delete') {
            iconContainer.classList.add('bg-red-50', 'text-red-600');
            icon.classList.add('ph-trash-fill');
        } else {
            iconContainer.classList.add('bg-amber-50', 'text-amber-600');
            icon.classList.add('ph-warning-fill');
        }

        titleEl.textContent = title;
        messageEl.textContent = message;
        confirmBtn.textContent = config.confirmText || 'Got it';

        if (config.showCancel) {
            cancelBtn.classList.remove('hidden');
            confirmBtn.classList.add('bg-red-600', 'hover:bg-red-700');
            confirmBtn.classList.remove('bg-brand-maroon', 'hover:bg-[#631a42]');
        } else {
            cancelBtn.classList.add('hidden');
            confirmBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
            confirmBtn.classList.add('bg-brand-maroon', 'hover:bg-[#631a42]');
        }

        // Save callback
        this._modalCallback = onConfirm;

        // Show
        modal.classList.remove('opacity-0', 'pointer-events-none', 'invisible');
        modal.classList.add('opacity-100', 'pointer-events-auto');
        card.classList.remove('scale-90');
        card.classList.add('scale-100');
    },

    hideModal(confirmed = false) {
        const modal = document.getElementById('custom-modal');
        const card = document.getElementById('modal-card');

        modal.classList.remove('opacity-100', 'pointer-events-auto');
        modal.classList.add('opacity-0', 'pointer-events-none');
        card.classList.remove('scale-100');
        card.classList.add('scale-90');

        setTimeout(() => {
            modal.classList.add('invisible');
            if (confirmed && this._modalCallback) {
                this._modalCallback();
            }
            this._modalCallback = null;
        }, 300);
    },

    loginSuccess(user) {
        this.showLoader(() => {
            this.currentUser = user;
            localStorage.setItem('degreefi_session_user', user.email);

            // Update Sidebar
            const nameEl = document.getElementById('user-name');
            const roleEl = document.getElementById('user-role');
            const avatarEl = document.getElementById('user-avatar');

            if (nameEl) nameEl.textContent = user.name;
            if (roleEl) roleEl.textContent = user.role;
            if (avatarEl) avatarEl.textContent = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            const regEl = document.getElementById('user-reg');
            if (regEl) {
                if (user.role === 'student' && user.regNumber) {
                    regEl.textContent = user.regNumber;
                    regEl.classList.remove('hidden');
                } else {
                    regEl.classList.add('hidden');
                }
            }

            // Show App Shell
            document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
            const shell = document.getElementById('app-shell');
            if (shell) {
                shell.classList.remove('hidden');
                shell.classList.add('flex');
            }

            // Reset all dashboard-content views
            document.querySelectorAll('.dashboard-content').forEach(el => el.classList.add('hidden'));

            // Toggle role-specific navigation
            const studentLinks = document.querySelectorAll('.nav-student');
            if (user.role === 'student') {
                studentLinks.forEach(el => el.classList.remove('hidden'));
                StudentDashboard.switchTab('dashboard'); // Start on dashboard
                StudentDashboard.updateNotifBadge();
            } else {
                studentLinks.forEach(el => el.classList.add('hidden'));
                const adminDash = document.getElementById('admin-dashboard-view');
                if (adminDash) adminDash.classList.remove('hidden');
                AdminDashboard.render();
            }

            this.toggleMobileMenu(false);
        });
    },

    logout() {
        this.showLoader(() => {
            this.currentUser = null;
            localStorage.removeItem('degreefi_session_user');

            // Clear login form fields
            const loginForm = document.getElementById('login-form');
            if (loginForm) loginForm.reset();

            // Hide shell, show login
            const shell = document.getElementById('app-shell');
            if (shell) shell.classList.add('hidden');
            showView('login-view');
            this.toggleMobileMenu(false);
        });
    },

    showLoader(callback) {
        const loader = document.getElementById('loader');
        if (!loader) {
            callback();
            return;
        }

        // Show loader
        loader.classList.remove('opacity-0', 'pointer-events-none', 'invisible');
        loader.classList.add('opacity-100', 'pointer-events-auto');

        // Wait for animation + simulated data processing (2s as requested)
        setTimeout(() => {
            callback();

            // Wait for callback to render, then hide loader
            setTimeout(() => {
                loader.classList.remove('opacity-100', 'pointer-events-auto');
                loader.classList.add('opacity-0', 'pointer-events-none');

                // Set invisible after fade out
                setTimeout(() => {
                    loader.classList.add('invisible');
                }, 500);
            }, 100);
        }, 2000);
    },

    bindEvents() {
        // Login Form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const role = document.querySelector('input[name="role"]:checked').value;
            this.login(email, password, role);
        });

        // Register Form
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const regNumber = document.getElementById('reg-number').value;
            this.register(name, email, password, regNumber);
        });

        // Mobile Sidebar Events
        document.getElementById('mobile-menu-toggle').onclick = () => this.toggleMobileMenu(true);
        document.getElementById('mobile-menu-close').onclick = () => this.toggleMobileMenu(false);
        document.getElementById('sidebar-overlay').onclick = () => this.toggleMobileMenu(false);

        // Auto-capitalize Reg Number
        const regInput = document.getElementById('reg-number');
        if (regInput) {
            regInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
            });
        }
    },

    setupMobileMenu() {
        // Initial state
        this.toggleMobileMenu(false);
    },

    toggleMobileMenu(isOpen) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (isOpen) {
            sidebar.classList.remove('hidden-mobile');
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('opacity-0', 'pointer-events-none');
            overlay.classList.add('opacity-100', 'pointer-events-auto');
        } else {
            sidebar.classList.add('hidden-mobile');
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('opacity-0', 'pointer-events-none');
            overlay.classList.remove('opacity-100', 'pointer-events-auto');
        }
    }
};

// Global Helper
function showView(viewId) {
    document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
    document.getElementById('app-shell').classList.add('hidden');

    document.getElementById(viewId).classList.remove('hidden');
}


// ==========================================
// STUDENT DASHBOARD CONTROLLER
// ==========================================
const StudentDashboard = {
    render() {
        if (!App.currentUser) return;
        this.updateStats();
        this.renderHistory();
        this.renderReqs();
        this.renderFiles();
        this.renderProfile();
    },

    renderProfile() {
        const regEl = document.getElementById('student-portal-reg');
        const initialsEl = document.getElementById('student-badge-initials');
        if (regEl) regEl.textContent = App.currentUser.regNumber || 'N/A';
        if (initialsEl) initialsEl.textContent = App.currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    },

    bindEvents() {
        const courseForm = document.getElementById('course-form');
        // Prevent double binding
        courseForm.replaceWith(courseForm.cloneNode(true));
        document.getElementById('course-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCourse();
        });

        const fileForm = document.getElementById('file-upload-form');
        fileForm.replaceWith(fileForm.cloneNode(true));
        document.getElementById('file-upload-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadFile();
        });

        const dropZone = document.getElementById('drop-zone');
        dropZone.onclick = () => document.getElementById('file-input').click();
    },

    addCourse() {
        const name = document.getElementById('course-name').value;
        const credits = parseInt(document.getElementById('course-credits').value);
        const grade = parseFloat(document.getElementById('course-grade').value);
        const type = document.getElementById('requirement-type').value;

        const course = {
            id: Date.now(),
            name,
            credits,
            grade,
            type,
            date: new Date().toLocaleDateString()
        };

        // Mutate current user
        App.currentUser.courses.push(course);
        App.currentUser.requirements[type].current += credits;
        App.currentUser.requirements.total.current += credits;

        this.syncUser();
        this.render();
        document.getElementById('course-form').reset();
    },

    uploadFile() {
        const type = document.getElementById('file-type').value;
        const fileEntry = {
            id: Date.now(),
            name: `${type} - Scanned_Doc.pdf`,
            type: type,
            date: new Date().toLocaleDateString()
        };

        App.currentUser.files.push(fileEntry);
        this.syncUser();
        this.renderFiles();
        alert("Document uploaded!");
    },

    syncUser() {
        // Save current user state back to main data array
        const idx = App.data.users.findIndex(u => u.email === App.currentUser.email);
        if (idx !== -1) {
            App.data.users[idx] = App.currentUser;
            App.saveData();
        }
    },

    updateStats() {
        const reqs = App.currentUser.requirements;

        // Progress Ring
        const percent = Math.min(100, Math.round((reqs.total.current / reqs.total.max) * 100));
        document.getElementById('total-percent').textContent = `${percent}%`;
        document.getElementById('credits-earned').textContent = reqs.total.current;
        document.getElementById('progress-ring').setAttribute('stroke-dasharray', `${percent}, 100`);

        // GPA
        const courses = App.currentUser.courses;
        const totalPoints = courses.reduce((sum, c) => sum + (c.grade * c.credits), 0);
        const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
        const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
        document.getElementById('gpa-display').textContent = gpa;

        // Badge
        const badge = document.getElementById('status-badge');
        if (percent >= 100) {
            badge.textContent = "Eligible for Graduation";
            badge.classList.remove('bg-sky-500/10', 'text-sky-400');
            badge.classList.add('bg-green-500/10', 'text-green-400');
        } else {
            badge.textContent = "In Progress";
            badge.classList.add('bg-sky-500/10', 'text-sky-400');
            badge.classList.remove('bg-green-500/10', 'text-green-400');
        }
    },

    renderReqs() {
        ['core', 'elective', 'gened'].forEach(type => {
            const req = App.currentUser.requirements[type];
            const el = document.getElementById(`req-${type}`);
            if (!el) return;

            const percent = Math.min(100, (req.current / req.max) * 100);
            el.querySelector('.progress-bar-fill').style.width = `${percent}%`;
            el.querySelector('.current').textContent = req.current;

            const statusEl = el.querySelector('.req-status');
            if (req.current >= req.max) {
                statusEl.textContent = "Completed";
                statusEl.classList.remove('bg-amber-500/10', 'text-amber-500');
                statusEl.classList.add('bg-green-500/10', 'text-green-400');
            }
        });
    },

    renderHistory() {
        const list = document.getElementById('course-list');
        list.innerHTML = '';

        if (App.currentUser.courses.length === 0) {
            list.innerHTML = '<li class="text-center text-slate-500 text-sm py-4 italic">No courses yet.</li>';
            return;
        }

        [...App.currentUser.courses].reverse().forEach(c => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700/50';
            li.innerHTML = `
                <div>
                    <div class="text-sm font-medium text-white">${c.name}</div>
                    <div class="text-xs text-slate-500">${c.credits} Credits</div>
                </div>
                <div class="text-sky-400 font-bold">${this.getGradeLetter(c.grade)}</div>
            `;
            list.appendChild(li);
        });
    },

    renderFiles() {
        const list = document.getElementById('files-list');
        list.innerHTML = '';

        App.currentUser.files.forEach(f => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-700 text-sm';
            div.innerHTML = `
                <span class="flex items-center gap-2 text-slate-300"><i class="ph-file-pdf text-red-400"></i> ${f.name}</span>
                <span class="text-xs text-slate-500">${f.date}</span>
            `;
            list.appendChild(div);
        });
    },

    getGradeLetter(points) {
        if (points >= 4.0) return 'A';
        if (points >= 3.7) return 'A-';
        if (points >= 3.3) return 'B+';
        if (points >= 3.0) return 'B';
        if (points >= 2.7) return 'B-';
        if (points >= 2.3) return 'C+';
        if (points >= 2.0) return 'C';
        if (points >= 1.0) return 'D';
        return 'F';
    },

    switchTab(tabId) {
        // Toggle Active Link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('bg-white/10', 'text-[#FFE8D6]');
            link.classList.add('text-white/70', 'hover:text-white', 'hover:bg-white/5');
        });
        document.getElementById(`nav-${tabId}`).classList.add('bg-white/10', 'text-[#FFE8D6]');
        document.getElementById(`nav-${tabId}`).classList.remove('text-white/70', 'hover:text-white', 'hover:bg-white/5');

        // Toggle Views
        document.querySelectorAll('.dashboard-content').forEach(view => view.classList.add('hidden'));
        document.getElementById(`${tabId}-view`).classList.remove('hidden');

        if (tabId === 'notifications') {
            this.renderNotifications();
        } else if (tabId === 'dashboard') {
            this.render();
        }
    },

    updateNotifBadge() {
        if (!App.currentUser.notifications) App.currentUser.notifications = [];
        const unreadCount = App.currentUser.notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notif-badge');
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    },

    renderNotifications() {
        const list = document.getElementById('notifications-list');
        list.innerHTML = '';

        const notifs = App.currentUser.notifications;

        if (notifs.length === 0) {
            list.innerHTML = `
                <div class="bg-white border border-gray-100 p-12 text-center rounded-2xl shadow-sm">
                    <div class="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="ph-bell-slash text-3xl"></i>
                    </div>
                    <h3 class="text-gray-800 font-bold text-lg mb-1">Your inbox is empty</h3>
                    <p class="text-gray-500 text-sm">Official notices from the registrar will appear here.</p>
                </div>
            `;
            return;
        }

        [...notifs].reverse().forEach((n, idx) => {
            const realIdx = notifs.length - 1 - idx;
            const div = document.createElement('div');
            div.className = `p-5 md:p-6 rounded-2xl border transition-all cursor-pointer ${n.read ? 'bg-white border-gray-100 hover:border-gray-200' : 'bg-brand-maroon/[0.02] border-brand-maroon/20 hover:border-brand-maroon/40 shadow-sm'}`;
            div.onclick = () => this.readNotification(realIdx);

            div.innerHTML = `
                <div class="flex gap-4">
                    <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${n.read ? 'bg-gray-100 text-gray-400' : 'bg-brand-maroon/10 text-brand-maroon'}">
                        <i class="${n.read ? 'ph-envelope-open' : 'ph-envelope-simple-fill'} text-xl"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start mb-1">
                            <h4 class="font-bold text-gray-800 truncate pr-4">${n.title}</h4>
                            <span class="text-[10px] text-gray-400 font-bold uppercase whitespace-nowrap">${n.date}</span>
                        </div>
                        <p class="text-sm text-gray-600 leading-relaxed ${n.read ? '' : 'font-medium'}">${n.message}</p>
                    </div>
                </div>
            `;
            list.appendChild(div);
        });
    },

    readNotification(idx) {
        App.currentUser.notifications[idx].read = true;
        this.syncUser();
        this.updateNotifBadge();
        this.renderNotifications();

        const n = App.currentUser.notifications[idx];
        App.showModal('success', n.title, n.message, null, { confirmText: 'Close' });
    }
};


// ==========================================
// ADMIN DASHBOARD CONTROLLER
// ==========================================
const AdminDashboard = {
    render() {
        const tbody = document.getElementById('student-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        const students = App.data.users.filter(u => u.role === 'student');

        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-500 italic">No students registered yet.</td></tr>';
            return;
        }

        students.forEach(student => {
            const percent = Math.round((student.requirements.total.current / student.requirements.total.max) * 100);
            const isEligible = percent >= 100;

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-800/30 transition-colors';
            tr.innerHTML = `
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                            ${student.name.charAt(0)}
                        </div>
                        <div>
                            <div class="font-medium text-white">${student.name}</div>
                            <div class="text-xs text-slate-500">${student.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="text-sm font-mono font-bold text-slate-300 bg-slate-700/50 px-2 py-1 rounded">
                        ${student.regNumber || 'N/A'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner">
                            <div class="h-full rounded-full transition-all duration-700 ${isEligible ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-sky-400 to-indigo-500'}" style="width: ${Math.min(100, percent)}%"></div>
                        </div>
                        <span class="text-xs font-bold text-gray-500 w-8 text-right">${percent}%</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide border border-gray-200">
                        <i class="ph-files-fill mr-1 opacity-50"></i> ${student.files.length} Docs
                    </span>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isEligible ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm shadow-green-100' : 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm shadow-amber-100'}">
                        <span class="w-1.5 h-1.5 rounded-full mr-2 ${isEligible ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}"></span>
                        ${isEligible ? 'Graduated' : 'Pending'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        <button onclick="AdminDashboard.sendEmail('${student.email}', ${isEligible})" 
                            class="p-2 text-brand-maroon hover:bg-brand-maroon hover:text-white rounded-lg transition-all border border-brand-maroon/20 bg-white shadow-sm"
                            title="Send Notification">
                            <i class="ph-paper-plane-tilt-fill text-lg"></i>
                        </button>
                        <button onclick="AdminDashboard.confirmDelete('${student.email}')" 
                            class="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-red-200 bg-white shadow-sm"
                            title="Delete Student">
                            <i class="ph-trash-fill text-lg"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    sendEmail(email, isEligible) {
        const student = App.data.users.find(u => u.email === email);
        if (!student) return;

        const requiredFiles = ["Financial Clearance", "Library Clearance", "Transcript"];
        const uploadedTypes = student.files.map(f => f.type);
        const missingFiles = requiredFiles.filter(req => !uploadedTypes.includes(req));

        if (missingFiles.length > 0) {
            const filesList = missingFiles.join(", ");
            const message = `Attention: We've identified that your profile is missing the following required documents: ${filesList}. Please log in and upload these immediately to ensure you do not miss out on the upcoming graduation.`;

            App.showModal('warning', 'Confirm Dispatch', `Send following warning to ${student.name}?\n\n"${message}"`, () => {
                this.dispatchNotification(student, 'Action Required: Missing Documents', message);
            }, {
                showCancel: true,
                confirmText: 'Send to Inbox & Email'
            });
        } else if (!isEligible) {
            const message = `Notification Sent: Your documents are in order, but you still have pending credit requirements. Keep up the good work and finish your remaining courses to qualify for graduation!`;

            App.showModal('warning', 'Confirm Dispatch', `Send progress update to ${student.name}?`, () => {
                this.dispatchNotification(student, 'Progress Update: Requirements Pending', message);
            }, {
                showCancel: true,
                confirmText: 'Send to Inbox & Email'
            });
        } else {
            const message = `Congratulations! All your documents are verified and you have met all credit requirements. You are officially cleared for graduation!`;

            App.showModal('warning', 'Confirm Dispatch', `Send graduation clearance to ${student.name}?`, () => {
                this.dispatchNotification(student, 'Graduation Discovery: Officially Cleared', message);
            }, {
                showCancel: true,
                confirmText: 'Send to Inbox & Email'
            });
        }
    },

    dispatchNotification(student, title, message) {
        if (!student.notifications) student.notifications = [];
        student.notifications.push({
            id: Date.now(),
            title,
            message,
            date: new Date().toLocaleDateString(),
            read: false
        });
        App.saveData();
        App.showModal('success', 'Dispatched!', `The message has been sent to ${student.name}'s account on Degreefi and an email has been sent to ${student.email}.`);
    },

    confirmDelete(email) {
        App.showModal('delete', 'Delete Student?', `Are you sure you want to remove ${email} from the system? This action cannot be undone.`, () => {
            this.deleteStudent(email);
        }, {
            showCancel: true,
            confirmText: 'Delete Now'
        });
    },

    deleteStudent(email) {
        const idx = App.data.users.findIndex(u => u.email === email);
        if (idx !== -1) {
            App.data.users.splice(idx, 1);
            App.saveData();
            this.render();
            App.showModal('success', 'Student Removed', 'The student record has been permanently deleted from the database.');
        }
    }
};

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    App.init();
    StudentDashboard.bindEvents();
});












