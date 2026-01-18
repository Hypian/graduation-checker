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
        this.setupStorageSync();
    },

    setupStorageSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'degreefi_data_v2') {
                this.loadData();
                if (this.currentUser) {
                    // Refresh current view if logged in
                    if (this.currentUser.role === 'admin') {
                        AdminDashboard.render();
                        if (AdminDashboard.currentReviewUser) {
                            const updated = this.data.users.find(u => u.email === AdminDashboard.currentReviewUser.email);
                            if (updated) {
                                AdminDashboard.currentReviewUser = updated;
                                AdminDashboard.updateReviewStats();
                                AdminDashboard.renderReviewSubjects();
                                AdminDashboard.renderReviewClearance();
                            }
                        }
                    } else {
                        StudentDashboard.render();
                    }
                }
            }
        });
    },

    loadData() {
        const stored = localStorage.getItem('degreefi_data_v2');
        if (stored) {
            this.data = JSON.parse(stored);
            this.data.users.forEach(u => {
                if (u.role === 'admin') return;

                if (!u.notifications) u.notifications = [];
                if (u.email) u.email = u.email.toLowerCase().trim();
                if (!u.courses) u.courses = [];
                if (!u.files) u.files = [];

                // Reset/Verify requirements for BBICT compatibility
                if (!u.requirements || u.requirements.total || !u.requirements.manualClearance) {
                    const existingManual = (u.requirements && u.requirements.manualClearance) ? u.requirements.manualClearance : {};
                    u.requirements = {
                        subjects: { current: u.courses.length, max: 61 },
                        manualClearance: existingManual
                    };
                }

                // Ensure current subject count is in sync
                u.requirements.subjects.current = u.courses.length;
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
                subjects: { current: 0, max: 61 },
                // Milestones & Clearance Documents are tracked via their existence in 'files' or manual admin flags
                manualClearance: {} // e.g., { "Financial Clearance": true }
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
        const fileInput = document.getElementById('file-input');

        dropZone.onclick = () => fileInput.click();

        // Feedback when file is selected
        fileInput.addEventListener('change', () => {
            if (fileInput.files && fileInput.files.length > 0) {
                const fileName = fileInput.files[0].name;
                const uploadText = dropZone.querySelector('p:first-of-type');
                if (uploadText) {
                    uploadText.textContent = `Selected: ${fileName}`;
                    uploadText.classList.remove('text-gray-500');
                    uploadText.classList.add('text-brand-maroon', 'font-bold');
                }
            }
        });
    },

    addCourse() {
        const name = document.getElementById('course-name').value;
        const grade = parseFloat(document.getElementById('course-grade').value);

        if (App.currentUser.requirements.subjects.current >= 61) {
            App.showModal('warning', 'Limit Reached', 'You have already added 61 subjects. Please remove one if you need to replace it.');
            return;
        }

        const course = {
            id: Date.now(),
            name,
            grade,
            date: new Date().toLocaleDateString()
        };

        // Mutate current user
        App.currentUser.courses.push(course);
        App.currentUser.requirements.subjects.current += 1;

        this.syncUser();
        this.render();
        document.getElementById('course-form').reset();
    },

    toggleMilestone(type) {
        // Milestone logic is now handled via manualClearance if not doc-based
        App.currentUser.requirements.manualClearance[type] = !App.currentUser.requirements.manualClearance[type];
        this.syncUser();
        this.render();
    },

    uploadFile() {
        const fileInput = document.getElementById('file-input');
        const type = document.getElementById('file-type').value;

        if (!fileInput.files || fileInput.files.length === 0) {
            App.showModal('warning', 'No File Selected', 'Please click the upload zone to select a document before clicking upload.');
            return;
        }

        const file = fileInput.files[0];

        // 1. Enforce 1 doc per category limit
        const existingOfThisType = App.currentUser.files.filter(f => f.category === type);
        if (existingOfThisType.length >= 1) {
            App.showModal('error', 'Limit Reached', `You have already uploaded a document for "${type}". You must remove the existing one before uploading a new version or contact support.`);
            return;
        }

        // 2. Duplicate detection (same name in same category)
        const isDuplicate = existingOfThisType.some(f => f.realName === file.name);
        if (isDuplicate) {
            App.showModal('warning', 'Duplicate File', 'This exact file has already been uploaded to this category.');
            return;
        }

        // Show Progress UI
        const dropZone = document.getElementById('drop-zone');
        const uploadIcon = dropZone.querySelector('i');
        const uploadTexts = dropZone.querySelectorAll('p');
        const progressContainer = document.getElementById('upload-progress-container');
        const progressBar = document.getElementById('upload-progress-bar');

        if (uploadIcon) uploadIcon.classList.add('hidden');
        uploadTexts.forEach(t => t.classList.add('hidden'));
        progressContainer.classList.remove('hidden');

        // Animate Bar (2 seconds)
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            progressBar.style.width = `${progress}%`;

            if (progress >= 100) {
                clearInterval(interval);

                // Finalize Upload After a brief "success" pause
                setTimeout(() => {
                    this.finalizeUpload(file, type);

                    // Reset UI
                    if (uploadIcon) uploadIcon.classList.remove('hidden');
                    uploadTexts.forEach(t => t.classList.remove('hidden'));
                    progressContainer.classList.add('hidden');
                    progressBar.style.width = '0%';
                }, 300);
            }
        }, 100);
    },

    finalizeUpload(file, type) {
        const fileEntry = {
            id: Date.now(),
            name: `${type} - ${file.name}`,
            realName: file.name,
            category: type,
            extension: file.name.split('.').pop().toLowerCase(),
            size: (file.size / 1024).toFixed(1) + ' KB',
            date: new Date().toLocaleDateString()
        };

        App.currentUser.files.push(fileEntry);
        this.syncUser();
        this.renderFiles();

        // Reset input and feedback text
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';

        const uploadText = document.getElementById('drop-zone').querySelector('p:first-of-type');
        if (uploadText) {
            uploadText.textContent = 'Tap to upload document';
            uploadText.classList.add('text-gray-500');
            uploadText.classList.remove('text-brand-maroon', 'font-bold');
        }

        App.showModal('success', 'Upload Successful', `Your "${type}" document has been received and listed in your clearance history.`);
    },

    confirmDeleteFile(fileId, fileName) {
        App.showModal('delete', 'Remove Document?', `Are you sure you want to delete "${fileName}"? This action cannot be undone.`, () => {
            this.deleteFile(fileId);
        }, {
            showCancel: true,
            confirmText: 'Remove'
        });
    },

    deleteFile(fileId) {
        const idx = App.currentUser.files.findIndex(f => f.id === fileId);
        if (idx !== -1) {
            App.currentUser.files.splice(idx, 1);
            this.syncUser();
            this.render(); // Full re-render to update stats if necessary
            App.showModal('success', 'File Removed', 'The document has been successfully deleted from your history.');
        }
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
        const files = App.currentUser.files || [];

        // BBICT Progress: 61 subjects + 5 mandatory docs = 66 Total Units
        const completedSubjects = Math.min(61, reqs.subjects.current);

        const mandatoryDocs = [
            "Financial Clearance",
            "Library Clearance",
            "Transcript",
            "Academic Internship",
            "Project Defense"
        ];

        let docScore = 0;
        mandatoryDocs.forEach(doc => {
            const hasFile = files.some(f => f.category === doc);
            const isManuallyCleared = reqs.manualClearance && reqs.manualClearance[doc];
            if (hasFile || isManuallyCleared) docScore++;
        });

        const totalCompleted = completedSubjects + docScore;
        const totalPossible = 66;

        const percent = Math.min(100, Math.round((totalCompleted / totalPossible) * 100));

        document.getElementById('total-percent').textContent = `${percent}%`;
        document.getElementById('credits-earned').textContent = completedSubjects;
        document.getElementById('progress-ring').setAttribute('stroke-dasharray', `${percent}, 100`);

        // GPA
        const courses = App.currentUser.courses;
        const totalPoints = courses.reduce((sum, c) => sum + (c.grade), 0);
        const count = courses.length;
        const gpa = count > 0 ? (totalPoints / count).toFixed(2) : "0.00";
        document.getElementById('gpa-display').textContent = gpa;

        // Badge
        const badge = document.getElementById('status-badge');
        if (percent >= 100) {
            badge.textContent = "Eligible for Graduation";
            badge.className = "px-3 py-1 rounded-full text-[10px] md:text-xs font-bold bg-green-500/10 text-green-400";
        } else {
            badge.textContent = "In Progress";
            badge.className = "px-3 py-1 rounded-full text-[10px] md:text-xs font-bold bg-sky-500/10 text-sky-400";
        }
    },

    renderReqs() {
        const reqs = App.currentUser.requirements;
        const files = App.currentUser.files || [];

        // Academic Subjects
        const subReq = reqs.subjects;
        const subEl = document.getElementById('req-subjects');
        if (subEl) {
            const percent = Math.min(100, (subReq.current / subReq.max) * 100);
            subEl.querySelector('.progress-bar-fill').style.width = `${percent}%`;
            subEl.querySelector('.current').textContent = subReq.current;
            subEl.querySelector('.req-status').textContent = `${Math.round(percent)}%`;
        }

        // Milestone & Clearance Docs
        const milestoneList = document.getElementById('milestone-docs-list');
        if (milestoneList) {
            milestoneList.innerHTML = '';
            const mandatoryDocs = [
                { id: 'Financial Clearance', label: 'Financial', icon: 'ph-bank' },
                { id: 'Library Clearance', label: 'Library', icon: 'ph-books' },
                { id: 'Transcript', label: 'Transcript', icon: 'ph-article' },
                { id: 'Academic Internship', label: 'Internship', icon: 'ph-briefcase' },
                { id: 'Project Defense', label: 'Defense', icon: 'ph-presentation-chart' }
            ];

            mandatoryDocs.forEach(doc => {
                const hasFile = files.some(f => f.category === doc.id);
                const isManuallyCleared = reqs.manualClearance && reqs.manualClearance[doc.id];
                const isDone = hasFile || isManuallyCleared;

                const div = document.createElement('div');
                div.className = `flex items-center gap-3 p-3 rounded-xl border transition-all ${isDone ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`;
                div.innerHTML = `
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center ${isDone ? 'bg-green-500 text-white' : 'bg-white text-gray-400 shadow-sm'}">
                        <i class="${doc.icon} text-lg"></i>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold ${isDone ? 'text-green-700' : 'text-gray-500'} uppercase truncate">${doc.label}</p>
                        <div class="flex items-center gap-1.5">
                            <i class="${isDone ? 'ph-check-circle-fill text-green-500' : 'ph-clock-fill text-amber-500'} text-[10px]"></i>
                            <span class="text-[8px] font-bold uppercase ${isDone ? 'text-green-600' : 'text-amber-600'}">${isDone ? 'Cleared' : 'Pending'}</span>
                        </div>
                    </div>
                `;
                milestoneList.appendChild(div);
            });
        }
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
            li.className = 'flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 text-sm hover:border-brand-maroon/20 transition-all';
            li.innerHTML = `
                <div>
                    <div class="text-sm font-medium text-gray-800">${c.name}</div>
                    <div class="text-[10px] text-gray-500">Subject ${App.currentUser.courses.indexOf(c) + 1}</div>
                </div>
                <div class="text-brand-maroon font-bold">${this.getGradeLetter(c.grade)}</div>
            `;
            list.appendChild(li);
        });
    },

    renderFiles() {
        const list = document.getElementById('files-list');
        list.innerHTML = '';

        if (!App.currentUser.files || App.currentUser.files.length === 0) {
            list.innerHTML = '<p class="text-center text-gray-400 text-[10px] md:text-sm py-4 italic">No documents uploaded yet.</p>';
            return;
        }

        App.currentUser.files.forEach(f => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm hover:border-brand-maroon/20 transition-all';

            let iconClass = 'ph-file-pdf text-red-500'; // Default
            if (['jpg', 'jpeg', 'png'].includes(f.extension)) iconClass = 'ph-image text-blue-500';
            if (['doc', 'docx'].includes(f.extension)) iconClass = 'ph-file-doc text-indigo-500';

            div.innerHTML = `
                <div class="flex items-center gap-3 overflow-hidden">
                    <i class="${iconClass} text-xl flex-shrink-0"></i>
                    <div class="truncate">
                        <p class="font-medium text-gray-800 truncate">${f.name}</p>
                        <p class="text-[10px] text-gray-500">${f.size ? f.size : 'N/A'}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4 flex-shrink-0 ml-4">
                    <span class="text-[10px] text-gray-400 font-bold hidden sm:block">${f.date}</span>
                    <button onclick="StudentDashboard.confirmDeleteFile(${f.id}, '${f.name.replace(/'/g, "\\'")}')" 
                        class="text-gray-400 hover:text-red-500 transition-colors p-1" title="Remove File">
                        <i class="ph-trash text-lg"></i>
                    </button>
                </div>
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
    },

    markAllNotificationsRead() {
        if (!App.currentUser.notifications.length) return;
        App.currentUser.notifications.forEach(n => n.read = true);
        this.syncUser();
        this.updateNotifBadge();
        this.renderNotifications();
        App.showModal('success', 'Inbox Updated', 'All notifications have been marked as read.');
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
            const reqs = student.requirements;
            const files = student.files || [];

            // 61 subjects + 5 mandatory docs = 66
            const completedSubjects = Math.min(61, reqs.subjects.current);
            const mandatoryDocs = ["Financial Clearance", "Library Clearance", "Transcript", "Academic Internship", "Project Defense"];

            let docScore = 0;
            mandatoryDocs.forEach(doc => {
                if (files.some(f => f.category === doc) || (reqs.manualClearance && reqs.manualClearance[doc])) docScore++;
            });

            const percent = Math.round(((completedSubjects + docScore) / 66) * 100);
            const isEligible = percent >= 100;

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-800/[0.02] transition-colors student-row';
            tr.innerHTML = `
                <td class="px-6 py-4">
                    <input type="checkbox" value="${student.email}" onchange="AdminDashboard.updateBulkActions()"
                        class="student-checkbox rounded text-brand-maroon focus:ring-brand-maroon border-gray-300 cursor-pointer">
                </td>
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
                <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="AdminDashboard.openReview('${student.email}')" 
                            class="p-2 text-brand-maroon hover:bg-brand-maroon hover:text-white rounded-lg transition-all border border-brand-maroon/20 bg-white shadow-sm"
                            title="Review & Edit Profile">
                            <i class="ph-eye-fill text-lg"></i>
                        </button>
                        <button onclick="AdminDashboard.sendEmail('${student.email}', ${isEligible})" 
                            class="p-2 text-gray-500 hover:bg-gray-800 hover:text-white rounded-lg transition-all border border-gray-200 bg-white shadow-sm"
                            title="Send Quick Status">
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

        const requiredFiles = ["Financial Clearance", "Library Clearance", "Transcript", "Academic Internship", "Project Defense"];
        const uploadedTypes = student.files.map(f => f.category);
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

    dispatchNotification(student, title, message, showFeedback = true) {
        if (!student.notifications) student.notifications = [];
        student.notifications.push({
            id: Date.now(),
            title,
            message,
            date: new Date().toLocaleDateString(),
            read: false
        });
        App.saveData();
        if (showFeedback) {
            App.showModal('success', 'Dispatched!', `The message has been sent to ${student.name}'s account on Degreefi.`);
        }
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
            this.updateBulkActions();
            App.showModal('success', 'Student Removed', 'The student record has been permanently deleted from the database.');
        }
    },

    // --- Bulk Actions ---

    toggleAll(checked) {
        const checkboxes = document.querySelectorAll('.student-checkbox');
        checkboxes.forEach(cb => cb.checked = checked);
        this.updateBulkActions();
    },

    updateBulkActions() {
        const checkboxes = document.querySelectorAll('.student-checkbox');
        const checked = Array.from(checkboxes).filter(cb => cb.checked);
        const bulkDiv = document.getElementById('bulk-actions');
        const countEl = document.getElementById('selection-count');
        const masterCb = document.getElementById('select-all-students');

        if (checked.length > 0) {
            bulkDiv.classList.remove('hidden');
            countEl.textContent = `${checked.length} Selected`;
        } else {
            bulkDiv.classList.add('hidden');
        }

        // Keep master checkbox in sync
        if (masterCb) {
            masterCb.checked = checked.length === checkboxes.length && checkboxes.length > 0;
            masterCb.indeterminate = checked.length > 0 && checked.length < checkboxes.length;
        }
    },

    bulkEmail() {
        const emails = Array.from(document.querySelectorAll('.student-checkbox:checked')).map(cb => cb.value);
        if (emails.length === 0) return;

        App.showModal('warning', 'Bulk Notification', `You are about to send status updates to ${emails.length} selected students. This will check each student's specific eligibility and send the appropriate message.`, () => {
            emails.forEach(email => {
                const student = App.data.users.find(u => u.email === email);
                if (student) {
                    const reqs = student.requirements;
                    const files = student.files || [];

                    // Calculate BBICT Progress
                    const completedSubjects = Math.min(61, reqs.subjects.current);
                    const mandatoryDocs = ["Financial Clearance", "Library Clearance", "Transcript", "Academic Internship", "Project Defense"];

                    let docScore = 0;
                    mandatoryDocs.forEach(doc => {
                        if (files.some(f => f.category === doc) || (reqs.manualClearance && reqs.manualClearance[doc])) docScore++;
                    });

                    const percent = Math.round(((completedSubjects + docScore) / 66) * 100);
                    const isEligible = percent >= 100;
                    const missingFiles = mandatoryDocs.filter(doc => !files.some(f => f.category === doc) && !(reqs.manualClearance && reqs.manualClearance[doc]));

                    let title, message;
                    if (missingFiles.length > 0) {
                        title = 'Action Required: Missing Documents';
                        message = `Attention: We've identified that your profile is missing required document(s): ${missingFiles.join(", ")}. Please log in and upload these immediately.`;
                    } else if (!isEligible) {
                        title = 'Progress Update: Requirements Pending';
                        message = `Notification Sent: Your documents are in order, but you still have pending credit requirements (${completedSubjects}/61 subjects completed). Keep up the good work!`;
                    } else {
                        title = 'Graduation Discovery: Officially Cleared';
                        message = `Congratulations! All your documents are verified and you have met all credit requirements. You are officially cleared for graduation!`;
                    }

                    this.dispatchNotification(student, title, message, false);
                }
            });
            App.showModal('success', 'Bulk Dispatch Complete', `Successfully sent notifications to ${emails.length} students.`);
            this.toggleAll(false);
            if (document.getElementById('select-all-students')) document.getElementById('select-all-students').checked = false;
        }, {
            showCancel: true,
            confirmText: 'Send to All'
        });
    },

    confirmBulkDelete() {
        const emails = Array.from(document.querySelectorAll('.student-checkbox:checked')).map(cb => cb.value);
        if (emails.length === 0) return;

        App.showModal('delete', 'Bulk Delete Students?', `Are you sure you want to remove ${emails.length} selected students? This action is permanent and cannot be undone.`, () => {
            emails.forEach(email => {
                const idx = App.data.users.findIndex(u => u.email === email);
                if (idx !== -1) App.data.users.splice(idx, 1);
            });
            App.saveData();
            this.render();
            this.updateBulkActions();
            if (document.getElementById('select-all-students')) document.getElementById('select-all-students').checked = false;
            App.showModal('success', 'Action Complete', `${emails.length} student records have been deleted.`);
        }, {
            showCancel: true,
            confirmText: 'Delete Selected'
        });
    },

    // --- Student Detail Review & Edit ---

    currentReviewUser: null,

    openReview(email) {
        const student = App.data.users.find(u => u.email === email);
        if (!student) return;

        this.currentReviewUser = student;
        const modal = document.getElementById('admin-review-modal');

        // Header
        document.getElementById('review-avatar').textContent = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        document.getElementById('review-name').textContent = student.name;
        document.getElementById('review-reg').textContent = student.regNumber || 'N/A';

        this.updateReviewStats();
        this.renderReviewSubjects();
        this.renderReviewClearance();
        this.switchReviewTab('courses');

        modal.classList.remove('hidden');
    },

    closeReview() {
        document.getElementById('admin-review-modal').classList.add('hidden');
        this.currentReviewUser = null;
        this.render(); // Refresh main table
    },

    switchReviewTab(tab) {
        document.querySelectorAll('.review-tab').forEach(t => t.classList.remove('active', 'bg-brand-maroon', 'text-white'));
        document.querySelectorAll('.review-tab').forEach(t => t.classList.add('bg-white', 'text-gray-500'));

        const activeTab = document.getElementById(`tab-${tab}`);
        activeTab.classList.add('active', 'bg-brand-maroon', 'text-white');
        activeTab.classList.remove('bg-white', 'text-gray-500');

        document.querySelectorAll('.review-section').forEach(s => s.classList.add('hidden'));
        document.getElementById(`review-section-${tab}`).classList.remove('hidden');
    },

    updateReviewStats() {
        const student = this.currentReviewUser;
        const reqs = student.requirements;
        const files = student.files || [];

        const completedSubjects = Math.min(61, reqs.subjects.current);
        const mandatoryDocs = ["Financial Clearance", "Library Clearance", "Transcript", "Academic Internship", "Project Defense"];

        let docScore = 0;
        mandatoryDocs.forEach(doc => {
            if (files.some(f => f.category === doc) || (reqs.manualClearance && reqs.manualClearance[doc])) docScore++;
        });

        const percent = Math.round(((completedSubjects + docScore) / 66) * 100);
        document.getElementById('review-percent').textContent = `${percent}%`;
        document.getElementById('review-progress-ring').setAttribute('stroke-dasharray', `${percent}, 100`);
        document.getElementById('review-subject-count').textContent = `${completedSubjects} / 61`;
    },

    renderReviewSubjects() {
        const list = document.getElementById('review-subjects-list');
        list.innerHTML = '';
        const student = this.currentReviewUser;

        if (student.courses.length === 0) {
            list.innerHTML = '<p class="text-center py-8 text-gray-400 italic">No subjects added by student.</p>';
            return;
        }

        student.courses.forEach((c, idx) => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md';
            div.innerHTML = `
                <div class="flex-1 min-w-0 pr-4">
                    <p class="text-xs font-bold text-gray-800 truncate">${c.name}</p>
                    <p class="text-[10px] text-gray-400">Recorded: ${c.date}</p>
                </div>
                <div class="flex items-center gap-4">
                    <select onchange="AdminDashboard.updateReviewGrade(${idx}, this.value)" class="bg-white border-0 text-sm font-bold text-brand-maroon outline-none cursor-pointer p-1 rounded">
                        <option value="4.0" ${c.grade === 4.0 ? 'selected' : ''}>A</option>
                        <option value="3.7" ${c.grade === 3.7 ? 'selected' : ''}>A-</option>
                        <option value="3.3" ${c.grade === 3.3 ? 'selected' : ''}>B+</option>
                        <option value="3.0" ${c.grade === 3.0 ? 'selected' : ''}>B</option>
                        <option value="2.7" ${c.grade === 2.7 ? 'selected' : ''}>B-</option>
                        <option value="2.3" ${c.grade === 2.3 ? 'selected' : ''}>C+</option>
                        <option value="2.0" ${c.grade === 2.0 ? 'selected' : ''}>C</option>
                        <option value="1.0" ${c.grade === 1.0 ? 'selected' : ''}>D</option>
                        <option value="0.0" ${c.grade === 0.0 ? 'selected' : ''}>F</option>
                    </select>
                    <button onclick="AdminDashboard.removeReviewSubject(${idx})" class="text-gray-300 hover:text-red-500 transition-colors">
                        <i class="ph-trash text-lg"></i>
                    </button>
                </div>
            `;
            list.appendChild(div);
        });
    },

    updateReviewGrade(idx, grade) {
        const course = this.currentReviewUser.courses[idx];
        const oldGrade = course.grade;
        course.grade = parseFloat(grade);

        const gradeMap = { "4": "A", "4.0": "A", "3.7": "A-", "3.3": "B+", "3": "B", "3.0": "B", "2.7": "B-", "2.3": "C+", "2": "C", "2.0": "C", "1": "D", "1.0": "D", "0": "F", "0.0": "F" };
        const oldLetter = gradeMap[oldGrade.toString()] || oldGrade;
        const newLetter = gradeMap[parseFloat(grade).toString()] || grade;

        if (oldGrade !== parseFloat(grade)) {
            const message = `Academic Update: Your grade for "${course.name}" has been updated from ${oldLetter} to ${newLetter} by the registrar.`;
            this.dispatchNotification(this.currentReviewUser, 'Subject Grade Updated', message, false);
        }

        App.saveData();
        this.updateReviewStats();
    },

    removeReviewSubject(idx) {
        this.currentReviewUser.courses.splice(idx, 1);
        this.currentReviewUser.requirements.subjects.current = this.currentReviewUser.courses.length;
        App.saveData();
        this.renderReviewSubjects();
        this.updateReviewStats();
    },

    renderReviewClearance() {
        const list = document.getElementById('review-clearance-list');
        list.innerHTML = '';
        const student = this.currentReviewUser;
        const mandatoryDocs = [
            { id: 'Financial Clearance', label: 'Financial' },
            { id: 'Library Clearance', label: 'Library' },
            { id: 'Transcript', label: 'Transcript' },
            { id: 'Academic Internship', label: 'Academic Internship' },
            { id: 'Project Defense', label: 'Project Defense' }
        ];

        mandatoryDocs.forEach((doc, idx) => {
            const uploadedFile = student.files.find(f => f.category === doc.id);
            const hasFile = !!uploadedFile;
            const isManuallyCleared = student.requirements.manualClearance && student.requirements.manualClearance[doc.id];

            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100';
            div.innerHTML = `
                <div class="flex-1">
                    <h4 class="text-sm font-bold text-gray-800">${doc.label}</h4>
                    <p class="text-[10px] ${hasFile ? 'text-green-600' : 'text-gray-400'} font-medium">
                        ${hasFile ? 'File Uploaded • Ready for Review' : 'No File Uploaded'}
                    </p>
                </div>
                <div class="flex items-center gap-4">
                    ${hasFile ? `
                        <button onclick="AdminDashboard.viewStudentFile('${doc.id}')" class="px-3 py-1.5 bg-brand-maroon/10 text-brand-maroon text-[10px] font-bold rounded-lg hover:bg-brand-maroon hover:text-white transition-all">
                            <i class="ph-eye"></i> View
                        </button>
                    ` : ''}
                    <div class="flex items-center gap-2">
                        <span class="text-[8px] font-bold uppercase tracking-widest text-gray-400">Manual Clear</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" ${isManuallyCleared ? 'checked' : ''} onchange="AdminDashboard.toggleReviewManualClear('${doc.id}', this.checked)" class="sr-only peer">
                            <div class="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>
                </div>
            `;
            list.appendChild(div);
        });
    },

    viewStudentFile(category) {
        const student = this.currentReviewUser;
        if (!student) return;
        const file = student.files.find(f => f.category === category);
        if (!file) return;

        const win = window.open('', '_blank');
        if (!win) {
            App.showModal('error', 'Popup Blocked', 'Please allow popups to view student documents.');
            return;
        }

        const isImage = file.data.startsWith('data:image/');

        let content = '';
        if (isImage) {
            content = `<img src="${file.data}" style="max-width:95%; max-height:95%; object-fit: contain; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); border-radius: 12px;">`;
        } else {
            content = `<iframe src="${file.data}" frameborder="0" style="border:0; width:100%; height:100%;" allowfullscreen></iframe>`;
        }

        win.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Review: ${category} - ${student.name}</title>
                    <style>
                        body { margin:0; background: #0f172a; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; font-family: sans-serif; }
                        .close-tip { position: absolute; top: 20px; right: 20px; color: rgba(255,255,255,0.4); font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; pointer-events: none; }
                    </style>
                </head>
                <body>
                    <div class="close-tip">Press Esc to close window</div>
                    ${content}
                    <script>
                        window.addEventListener('keydown', (e) => { if(e.key === 'Escape') window.close(); });
                    </script>
                </body>
            </html>
        `);
        win.document.close();
    },

    toggleReviewManualClear(docId, state) {
        if (!this.currentReviewUser.requirements.manualClearance) this.currentReviewUser.requirements.manualClearance = {};

        const alreadyCleared = !!this.currentReviewUser.requirements.manualClearance[docId];
        this.currentReviewUser.requirements.manualClearance[docId] = state;

        if (state && !alreadyCleared) {
            const message = `Clearance Update: Your "${docId}" has been officially cleared by the registrar.`;
            this.dispatchNotification(this.currentReviewUser, 'Document Cleared', message, false);
        }

        App.saveData();
        this.updateReviewStats();
    },

    sendCustomMessage() {
        const titleEl = document.querySelector('#review-msg-title');
        const bodyEl = document.querySelector('#review-msg-body');

        const title = titleEl ? titleEl.value.trim() : '';
        const message = bodyEl ? bodyEl.value.trim() : '';

        if (!title || !message) {
            App.showModal('warning', 'Empty Fields', 'Please provide both a title and a message body.');
            return;
        }

        if (!this.currentReviewUser) {
            App.showModal('error', 'Error', 'No student selected for review.');
            return;
        }

        // Dispatch notification with feedback enabled
        AdminDashboard.dispatchNotification(this.currentReviewUser, title, message, true);

        // Clear fields
        if (titleEl) titleEl.value = '';
        if (bodyEl) bodyEl.value = '';
    },

    _dummy() { }
};

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    App.init();
    StudentDashboard.bindEvents();
});












