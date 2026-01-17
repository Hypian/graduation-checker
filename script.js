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
            const user = this.data.users.find(u => u.email === sessionEmail);
            if (user) {
                this.loginSuccess(user);
            } else {
                this.logout();
            }
        } else {
            showView('login-view');
        }
    },

    register(name, email, password) {
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedName = name.toLowerCase().trim();

        const duplicateUser = this.data.users.find(u =>
            u.email.toLowerCase().trim() === normalizedEmail ||
            u.name.toLowerCase().trim() === normalizedName
        );

        if (duplicateUser) {
            if (duplicateUser.email.toLowerCase().trim() === normalizedEmail) {
                this.showModal('error', 'Email in Use', 'This email address is already linked to an account. Try logging in instead.');
            } else {
                this.showModal('warning', 'Name Taken', 'A student with this exact name is already registered. Please use your full legal name.');
            }
            return;
        }

        const newUser = {
            email,
            password,
            role: 'student',
            name,
            courses: [],
            files: [],
            requirements: {
                total: { current: 0, max: 120 },
                core: { current: 0, max: 45 },
                elective: { current: 0, max: 30 },
                gened: { current: 0, max: 45 }
            }
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
        const user = this.data.users.find(u => u.email === email && u.password === password && u.role === role);

        if (user) {
            this.loginSuccess(user);
        } else {
            this.showModal('error', 'Login Failed', 'The credentials you entered do not match our records or the selected role.');
        }
    },

    showModal(type, title, message, onConfirm = null) {
        const modal = document.getElementById('custom-modal');
        const card = document.getElementById('modal-card');
        const iconContainer = document.getElementById('modal-icon-container');
        const icon = document.getElementById('modal-icon');
        const titleEl = document.getElementById('modal-title');
        const messageEl = document.getElementById('modal-message');

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
        } else {
            iconContainer.classList.add('bg-amber-50', 'text-amber-600');
            icon.classList.add('ph-warning-fill');
        }

        titleEl.textContent = title;
        messageEl.textContent = message;

        // Save callback
        this._modalCallback = onConfirm;

        // Show
        modal.classList.remove('opacity-0', 'pointer-events-none', 'invisible');
        modal.classList.add('opacity-100', 'pointer-events-auto');
        card.classList.remove('scale-90');
        card.classList.add('scale-100');
    },

    hideModal() {
        const modal = document.getElementById('custom-modal');
        const card = document.getElementById('modal-card');

        modal.classList.remove('opacity-100', 'pointer-events-auto');
        modal.classList.add('opacity-0', 'pointer-events-none');
        card.classList.remove('scale-100');
        card.classList.add('scale-90');

        setTimeout(() => {
            modal.classList.add('invisible');
            if (this._modalCallback) {
                this._modalCallback();
                this._modalCallback = null;
            }
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

            // Show App Shell
            document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
            const shell = document.getElementById('app-shell');
            if (shell) {
                shell.classList.remove('hidden');
                shell.classList.add('flex');
            }

            // Route to Dashboard
            const studentDash = document.getElementById('student-dashboard');
            const adminDash = document.getElementById('admin-dashboard');

            if (user.role === 'student') {
                if (studentDash) studentDash.classList.remove('hidden');
                if (adminDash) adminDash.classList.add('hidden');
                StudentDashboard.render();
            } else {
                if (adminDash) adminDash.classList.remove('hidden');
                if (studentDash) studentDash.classList.add('hidden');
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
            this.register(name, email, password);
        });

        // Mobile Sidebar Events
        document.getElementById('mobile-menu-toggle').onclick = () => this.toggleMobileMenu(true);
        document.getElementById('mobile-menu-close').onclick = () => this.toggleMobileMenu(false);
        document.getElementById('sidebar-overlay').onclick = () => this.toggleMobileMenu(false);
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
    }
};


// ==========================================
// ADMIN DASHBOARD CONTROLLER
// ==========================================
const AdminDashboard = {
    render() {
        const tbody = document.getElementById('student-table-body');
        tbody.innerHTML = '';

        const students = App.data.users.filter(u => u.role === 'student');

        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-slate-500 italic">No students registered yet.</td></tr>';
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
                    <div class="flex items-center gap-2">
                        <div class="w-24 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-sky-500 h-full" style="width: ${Math.min(100, percent)}%"></div>
                        </div>
                        <span class="text-xs font-medium text-slate-400">${percent}%</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-md">${student.files.length} Files</span>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded-full text-xs font-bold ${isEligible ? 'bg-green-500/10 text-green-400' : 'bg-sky-500/10 text-sky-400'}">
                        ${isEligible ? 'Eligible' : 'In Progress'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <button onclick="AdminDashboard.sendEmail('${student.email}', ${isEligible})" class="text-slate-400 hover:text-white transition-colors bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-xs font-medium">
                        Email
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    sendEmail(email, isEligible) {
        if (isEligible) {
            alert(`Email sent to ${email}:\n\n"Congratulations! You are eligible for graduation!"`);
        } else {
            alert(`Email sent to ${email}:\n\n"Reminder: You still have requirements pending."`);
        }
    }
};

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    App.init();
    StudentDashboard.bindEvents();
});












