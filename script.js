// ==========================================
// APP STATE & CONFIGURATION
// ==========================================
const App = {
    // Default BBICT Course List (used only on first run)
    DEFAULT_COURSES: [
        "BUCU 001 Communication Skills",
        "BPY 1101 Basic Electricity and Optics",
        "BIT 1106 Introduction to Computer Application packages",
        "BIT 1101 Computer Architecture",
        "BMA 1106 Foundation Mathematics",
        "BAF 1101 Financial Accounting I",
        "BBM 1101 Introduction To Business Studies",
        "ABCU 001 Research methodology",
        "BEG 2112 Digital Electronics and Logics",
        "BIT 2102 Fundamentals of Internet",
        "BMA 1202 Discrete Mathematics",
        "BBM 1201 Principles of Management",
        "BAF 1201 Financial Accounting II",
        "BAF 2105 Business Law",
        "BBM 2103 Organizational Behaviour",
        "BAF 1203 Accounting Information Systems",
        "BIT 1201 Database Systems",
        "BIT 4204 E-commerce",
        "BIT 2202 Business Information System Analysis and Design",
        "BIT 1202 Introduction To Web Design",
        "BAF 2102 Cost Accounting",
        "BBM 1202 Principles of Marketing",
        "BIT 3233 Internet of Things",
        "BIT 2201 Computer Programming Methodology",
        "BIT 2203 Data Structure and Algorithms",
        "BIT 2204 Data Communication And Computer Networks",
        "BAF 2202 Management Accounting I",
        "BAF 2104 Financial Management I",
        "BAF 3108 Risk Management",
        "BMA 1104 Probability & Statistics I",
        "BMA 3201 Operations Research I",
        "BIT 3101 Software Engineering",
        "BIT 3204 Network Management",
        "BIT 3201 Object Oriented Analysis and Design",
        "BIT 3102 Event Driven Programming",
        "BIT 3130 Signals and systems",
        "BIT 3104 Analogue and Digital Communications",
        "BMA 2102 Probability and statistics 2",
        "BBM 3107 Human Resource Management",
        "BIT 3106 Object Oriented Programming",
        "BIT 4202 Artificial Intelligence",
        "BIT 3205 Business Systems Simulation and Modeling",
        "BIT 3105 Management Information Systems",
        "BIT 3206 ICT project management",
        "BIT 3222 Structured cabling",
        "BIT 3234 Data Analytics in Python",
        "BIT 4102 Computer Graphics",
        "BIT 4103 Human Computer Interaction",
        "BIT 4104 Security and Cryptography",
        "BIT 4108 Information Systems Audit",
        "BIT 3228 Machine Learning",
        "BBM 4214 Total Quality Management",
        "BIT 4203 Distributed Multimedia Systems",
        "BIT 4201 Mobile Communications",
        "BIT 4206 ICT In Business and Society",
        "BIT 4107 Mobile Applications Development",
        "BIT 4122 Telecommunications Switching and Transmission Systems",
        "BIT 4119 Spectrum Management",
        "BIT 4140 Data Visualization"
    ],

    get AVAILABLE_COURSES() {
        return this.data.config.availableCourses;
    },

    currentUser: null,
    data: {
        users: [
            {
                email: "admin@degreefi.edu",
                password: "admin",
                role: "admin",
                name: "Admin User"
            }
        ],
        config: {
            availableCourses: []
        }
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
            
            // Migrate old data if config/courses missing
            if (!this.data.config) this.data.config = { availableCourses: this.DEFAULT_COURSES };
            if (!this.data.config.availableCourses || this.data.config.availableCourses.length === 0) {
                this.data.config.availableCourses = this.DEFAULT_COURSES;
            }

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
                        subjects: { current: u.courses.length, max: App.AVAILABLE_COURSES.length },
                        manualClearance: existingManual
                    };
                }

                // Ensure current subject count is in sync (excluding Fails)
                u.requirements.subjects.current = u.courses.filter(c => c.grade > 0).length;
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
        const sessionEmail = localStorage.getItem('degreefi_session_user');
        if (sessionEmail) {
            const user = this.data.users.find(u => u.email === sessionEmail);
            if (user) {
                this.loginSuccess(user);
                return;
            }
        }

        // If no session or invalid user, show login
        showView('login-view');
    },

    register(name, email, password, regNumber, phone) {
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

        // Validate Phone Number
        if (!phone || !/^07\d{8}$/.test(phone)) {
             this.showModal('warning', 'Invalid Phone Number', 'Phone number must be exactly 10 digits and start with "07" (e.g., 0712345678).');
             return;
        }

        const newUser = {
            email: normalizedEmail,
            password,
            role: 'student',
            name,
            regNumber: normalizedReg,
            phone: phone, 
            courses: [],
            files: [],
            requirements: {
                subjects: { current: 0, max: App.AVAILABLE_COURSES.length },
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
            const phone = document.getElementById('reg-phone').value;
            this.register(name, email, password, regNumber, phone);
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

        // Ensure subject counts are always derived from the courses list to prevent desync
        App.currentUser.requirements.subjects.current = App.currentUser.courses.filter(c => c.grade > 0).length;

        this.updateStats();
        this.renderHistory();
        this.renderReqs();
        this.renderFiles();
        this.renderProfile();
        
        // Also update sub-views to ensure data matches across all tabs immediately
        this.renderRequirements();
        this.renderCourses(); 
    },

    renderProfile() {
        const regEl = document.getElementById('student-portal-reg');
        const initialsEl = document.getElementById('student-badge-initials');
        if (regEl) regEl.textContent = App.currentUser.regNumber || 'N/A';
        if (initialsEl) initialsEl.textContent = App.currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        const sidePhoneEl = document.getElementById('user-phone');
        if (sidePhoneEl) {
             if (App.currentUser.phone) {
                 sidePhoneEl.textContent = App.currentUser.phone;
                 sidePhoneEl.classList.remove('hidden');
             } else {
                 sidePhoneEl.classList.add('hidden');
             }
        }
    },

    switchTab(tabName) {
        // Hide all dashboard contents
        document.querySelectorAll('.dashboard-content').forEach(el => el.classList.add('hidden'));
        
        // Reset Nav Links
        document.querySelectorAll('.nav-link').forEach(el => {
            el.classList.remove('bg-white/10', 'text-[#FFE8D6]');
            el.classList.add('text-white/70', 'hover:text-white', 'hover:bg-white/5');
        });

        // Activate Selected
        const targetView = document.getElementById(`${tabName}-view`);
        if (targetView) targetView.classList.remove('hidden');

        const safeTabName = tabName === 'courses' ? 'courses' : tabName; // Handle edge cases if needed
        const activeNav = document.getElementById(`nav-${safeTabName}`) || document.getElementById('nav-dashboard'); // Default fallback
        
        if (activeNav) {
            activeNav.classList.remove('text-white/70', 'hover:text-white', 'hover:bg-white/5');
            activeNav.classList.add('bg-white/10', 'text-[#FFE8D6]');
        }

        // Specific Render Logics
        if (tabName === 'courses') {
            this.renderCourses();
        } else if (tabName === 'requirements') {
            this.renderRequirements();
        } else if (tabName === 'dashboard') {
            this.render();
        }
    },

    renderRequirements() {
        if (!App.currentUser) return;
        
        const reqs = App.currentUser.requirements;
        const files = App.currentUser.files || [];
        const courses = App.currentUser.courses;

        // 1. Graduation Status Card
        const subMax = App.AVAILABLE_COURSES.length;
        const completedSubjects = Math.min(subMax, reqs.subjects.current);
        const mandatoryDocs = [
            "Financial Clearance",
            "Library Clearance",
            "Transcript",
            "Academic Internship",
            "Project Defense"
        ];

        let docScore = 0;
        mandatoryDocs.forEach(doc => {
            if (files.some(f => f.category === doc && f.status === 'cleared') || (reqs.manualClearance && reqs.manualClearance[doc])) docScore++;
        });

        // GPA Check
        const totalPoints = courses.reduce((sum, c) => sum + (c.grade), 0);
        const gpa = courses.length > 0 ? (totalPoints / courses.length) : 0;
        const gpaPass = gpa >= 2.0;
        
        const totalCompleted = completedSubjects + docScore;
        const totalPossible = subMax + 5; // Subjects + 5 Docs
        const percent = Math.round((totalCompleted / totalPossible) * 100);
        const isEligible = percent >= 100 && gpaPass;

        // UI Update: Status Badge
        const statusIcon = document.getElementById('grad-status-icon');
        const statusText = document.getElementById('grad-status-text');
        const statusContainer = document.getElementById('graduation-status-badge');

        if (isEligible) {
            statusIcon.className = 'w-10 h-10 rounded-full flex items-center justify-center bg-green-500 text-white shadow-lg shadow-green-200';
            statusIcon.innerHTML = '<i class="ph-seal-check-fill text-xl"></i>';
            statusText.textContent = 'Eligible';
            statusText.className = 'text-sm font-bold text-green-600 uppercase';
        } else {
            statusIcon.className = 'w-10 h-10 rounded-full flex items-center justify-center bg-brand-maroon text-white';
            statusIcon.innerHTML = '<i class="ph-lock-fill text-xl"></i>';
            statusText.textContent = 'Not Eligible';
            statusText.className = 'text-sm font-bold text-gray-800 uppercase';
        }

        // 2. Academic Stats
        document.getElementById('req-sub-count').textContent = completedSubjects;
        const subMaxEl = document.getElementById('req-sub-max');
        if (subMaxEl) subMaxEl.textContent = subMax;
        
        document.getElementById('req-sub-percent').textContent = `${Math.round((completedSubjects / subMax) * 100)}%`;
        document.getElementById('req-sub-bar').style.width = `${(completedSubjects / subMax) * 100}%`;
        document.getElementById('req-gpa').textContent = gpa.toFixed(2);
        document.getElementById('req-gpa').className = `text-2xl font-bold ${gpaPass ? 'text-green-600' : 'text-red-500'}`;

        // 3. Detailed Checklist
        const checklist = document.getElementById('detailed-checklist');
        if (checklist) {
            checklist.innerHTML = '';
            const docItems = [
                { id: 'Financial Clearance', label: 'Financial Clearance', desc: 'Tuition and fees balance check' },
                { id: 'Library Clearance', label: 'Library Clearance', desc: 'Returned books and overdue fines' },
                { id: 'Transcript', label: 'Submission of Transcript', desc: 'Verified academic records' },
                { id: 'Academic Internship', label: 'Internship Completion', desc: 'Work placement certificate' },
                { id: 'Project Defense', label: 'Final Project Defense', desc: 'Research presentation approval' }
            ];

            docItems.forEach(item => {
                const file = files.find(f => f.category === item.id);
                const isCleared = (file && file.status === 'cleared') || (reqs.manualClearance && reqs.manualClearance[item.id]);
                const isInReview = file && file.status === 'in-review';

                let statusLabel, statusColor, bgColor, icon;
                if (isCleared) {
                    statusLabel = 'Verified';
                    statusColor = 'text-green-600';
                    bgColor = 'bg-green-50/50 border-green-100';
                    icon = 'ph-check-circle-fill';
                } else if (isInReview) {
                    statusLabel = 'Pending Review';
                    statusColor = 'text-amber-600';
                    bgColor = 'bg-amber-50/50 border-amber-100';
                    icon = 'ph-hourglass-medium-fill';
                } else {
                    statusLabel = 'Action Required';
                    statusColor = 'text-gray-400';
                    bgColor = 'bg-white border-gray-100';
                    icon = 'ph-circle';
                }

                const div = document.createElement('div');
                div.className = `flex items-center justify-between p-4 rounded-2xl border transition-all ${bgColor}`;
                div.innerHTML = `
                    <div class="flex items-center gap-4">
                        <i class="${icon} text-2xl ${statusColor}"></i>
                        <div>
                            <h4 class="text-sm font-bold text-gray-800">${item.label}</h4>
                            <p class="text-[10px] text-gray-500 font-medium">${item.desc}</p>
                        </div>
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-widest ${statusColor}">${statusLabel}</span>
                `;
                checklist.appendChild(div);
            });
        }
    },

    getSmartRemark(grade) {
        if (grade >= 4.0) return { 
            text: "Excellent! This grade maximizes your GPA potential.", 
            color: "text-green-600", bg: "bg-green-50", icon: "ph-trend-up-bold" 
        };
        if (grade >= 3.5) return { 
            text: "Great job. Strong contribution to academic standing.", 
            color: "text-emerald-600", bg: "bg-emerald-50", icon: "ph-check-circle-bold" 
        };
        if (grade >= 3.0) return { 
            text: "Solid performance. Keeps you on track for graduation.", 
            color: "text-blue-600", bg: "bg-blue-50", icon: "ph-minus-circle-bold" 
        };
        if (grade >= 2.0) return { 
            text: "Passing grade. Consider reviewing core concepts for future courses.", 
            color: "text-amber-600", bg: "bg-amber-50", icon: "ph-warning-bold" 
        };
        if (grade >= 1.0) return { 
            text: "Barely passing. This negatively impacts your GPA significantly.", 
            color: "text-orange-600", bg: "bg-orange-50", icon: "ph-warning-octagon-bold" 
        };
        return { 
            text: "Critical: This grade requires retaking the course to graduate.", 
            color: "text-red-600", bg: "bg-red-50", icon: "ph-x-circle-bold" 
        };
    },

    renderCourses() {
        if (!App.currentUser) return;

        // Force refresh from main data to Ensure sync
        const freshUser = App.data.users.find(u => u.email === App.currentUser.email);
        if (freshUser) App.currentUser = freshUser;

        const gpaEl = document.getElementById('courses-view-gpa');
        const courses = App.currentUser.courses || [];
        
        // Calculate GPA
        const totalPoints = courses.reduce((sum, c) => sum + (c.grade), 0);
        const gpa = courses.length > 0 ? (totalPoints / courses.length).toFixed(2) : "0.00";
        if (gpaEl) gpaEl.textContent = gpa;

        // Render Full Curriculum List
        this.renderCurriculum();
        
        // Refresh dropdown to ensure it includes admin-added subjects
        this.populateCourseDropdown();
    },

    renderCurriculum() {
        const currList = document.getElementById('curriculum-list');
        if (!currList) return;

        try {
            // Check for necessary data
            if (!App.AVAILABLE_COURSES || !Array.isArray(App.AVAILABLE_COURSES)) {
                throw new Error("Curriculum data (AVAILABLE_COURSES) is missing or invalid.");
            }

            const userCourses = (App.currentUser && App.currentUser.courses) ? App.currentUser.courses : [];
            let html = '';

            for (let i = 0; i < App.AVAILABLE_COURSES.length; i++) {
                const courseName = App.AVAILABLE_COURSES[i];
                const normalizedName = courseName.toUpperCase();
                
                // Optimized check
                const userHas = userCourses.some(c => c.name && c.name.toUpperCase() === normalizedName);
                
                const statusIcon = userHas 
                    ? '<i class="ph-check-circle-fill text-green-500 text-xl"></i>' 
                    : '<div class="w-2 h-2 rounded-full bg-gray-200"></div>';
                
                const cardBg = userHas 
                    ? 'bg-green-50/50 border-green-100 ring-1 ring-green-200' 
                    : 'bg-white border-gray-100 hover:border-gray-200';

                html += `
                    <div class="${cardBg} p-4 rounded-xl border flex items-center justify-between gap-3 transition-all">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-brand-maroon/5 text-brand-maroon flex items-center justify-center font-bold text-xs shrink-0">
                                ${i + 1}
                            </div>
                            <span class="text-sm font-medium text-gray-700 line-clamp-2 leading-tight">${courseName}</span>
                        </div>
                        ${statusIcon}
                    </div>
                `;
            }

            currList.innerHTML = html || '<p class="col-span-full text-center py-8 text-gray-400">No courses available in curriculum.</p>';
            
        } catch (err) {
            console.error("Critical Error in renderCurriculum:", err);
            currList.innerHTML = `
                <div class="col-span-full p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
                    <p class="text-red-600 font-bold mb-2">Display Error</p>
                    <p class="text-red-500 text-xs">${err.message}</p>
                </div>
            `;
        }
    },

    bindEvents() {
        const courseForm = document.getElementById('course-form');
        // Prevent double binding
        courseForm.replaceWith(courseForm.cloneNode(true));
        document.getElementById('course-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCourse();
        });

        this.populateCourseDropdown();

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

    populateCourseDropdown() {
        const select = document.getElementById('course-name');
        if (!select) return;

        // Clear existing options except the placeholder
        while (select.options.length > 1) {
            select.remove(1);
        }

        App.AVAILABLE_COURSES.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            select.appendChild(option);
        });
    },

    addCourse() {
        const name = document.getElementById('course-name').value.trim();
        const grade = parseFloat(document.getElementById('course-grade').value);

        if (!name) {
            App.showModal('warning', 'Missing Information', 'Please enter a course name.');
            return;
        }

        if (App.currentUser.requirements.subjects.current >= App.AVAILABLE_COURSES.length) {
            App.showModal('warning', 'Limit Reached', `You have already added ${App.AVAILABLE_COURSES.length} subjects. Please remove one if you need to replace it.`);
            return;
        }

        // Check for duplicate course names (case-insensitive)
        const normalizedName = name.toUpperCase();
        const duplicate = App.currentUser.courses.find(c => c.name.toUpperCase() === normalizedName);
        if (duplicate) {
            App.showModal('warning', 'Duplicate Course', `You have already added "${duplicate.name}". Please use a different course name or remove the existing one first.`);
            return;
        }

        const course = {
            id: Date.now(),
            name: normalizedName, // Store in uppercase
            grade,
            date: new Date().toLocaleDateString()
        };

        // Mutate current user
        App.currentUser.courses.push(course);
        
        // Only increment if passing grade (> 0.0)
        if (course.grade > 0) {
            App.currentUser.requirements.subjects.current += 1;
        }

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
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileObj = {
                id: Date.now(),
                category: type,
                name: file.name,
                data: e.target.result,
                uploadDate: new Date().toLocaleDateString(),
                status: 'in-review' // New: pending registrar approval
            };

            // Remove old file of same category if exists
            const existingIdx = App.currentUser.files.findIndex(f => f.category === type);
            if (existingIdx !== -1) {
                App.currentUser.files.splice(existingIdx, 1);
            }

            App.currentUser.files.push(fileObj);
            this.syncUser();
            this.updateStats();
            this.renderReqs();
            this.renderFiles();

            // Reset input
            const fileInput = document.getElementById('file-input');
            if (fileInput) fileInput.value = '';

            const uploadText = document.getElementById('drop-zone').querySelector('p:first-of-type');
            if (uploadText) {
                uploadText.textContent = 'Tap to upload document';
                uploadText.classList.add('text-gray-500');
                uploadText.classList.remove('text-brand-maroon', 'font-bold');
            }

            App.showModal('success', 'Upload Complete', `Your ${type} document has been uploaded and is now awaiting registrar review.`);
        };
        reader.readAsDataURL(file);
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

        // Graduation Progress Calculation
        const subMax = App.AVAILABLE_COURSES.length;
        const completedSubjects = Math.min(subMax, reqs.subjects.current);

        const mandatoryDocs = [
            "Financial Clearance",
            "Library Clearance",
            "Transcript",
            "Academic Internship",
            "Project Defense"
        ];

        let docScore = 0;
        mandatoryDocs.forEach(doc => {
            const file = files.find(f => f.category === doc);
            const isCleared = (file && file.status === 'cleared') || (reqs.manualClearance && reqs.manualClearance[doc]);
            if (isCleared) docScore++;
        });

        const totalCompleted = completedSubjects + docScore;
        const totalPossible = subMax + 5; // Subjects + 5 Docs

        const percent = Math.min(100, Math.round((totalCompleted / totalPossible) * 100));

        document.getElementById('total-percent').textContent = `${percent}%`;
        document.getElementById('credits-earned').textContent = completedSubjects;
        
        const dashMaxEl = document.getElementById('dash-sub-max');
        if (dashMaxEl) dashMaxEl.textContent = subMax;
        
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
                const file = files.find(f => f.category === doc.id);
                const isManuallyCleared = reqs.manualClearance && reqs.manualClearance[doc.id];

                // Three states: pending, in-review, cleared
                let status, statusLabel, statusColor, bgColor, borderColor, iconColor, icon;

                if (isManuallyCleared || (file && file.status === 'cleared')) {
                    status = 'cleared';
                    statusLabel = 'Cleared';
                    statusColor = 'text-green-600';
                    bgColor = 'bg-green-50';
                    borderColor = 'border-green-100';
                    iconColor = 'bg-green-500 text-white';
                    icon = 'ph-check-circle-fill text-green-500';
                } else if (file && file.status === 'in-review') {
                    status = 'in-review';
                    statusLabel = 'In Review';
                    statusColor = 'text-amber-600';
                    bgColor = 'bg-amber-50';
                    borderColor = 'border-amber-100';
                    iconColor = 'bg-amber-500 text-white';
                    icon = 'ph-hourglass-medium-fill text-amber-500';
                } else {
                    status = 'pending';
                    statusLabel = 'Pending';
                    statusColor = 'text-gray-500';
                    bgColor = 'bg-gray-50';
                    borderColor = 'border-gray-100';
                    iconColor = 'bg-white text-gray-400 shadow-sm';
                    icon = 'ph-clock-fill text-gray-400';
                }

                const div = document.createElement('div');
                div.className = `flex items-center gap-3 p-3 rounded-xl border transition-all ${bgColor} ${borderColor}`;
                div.innerHTML = `
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}">
                        <i class="${doc.icon} text-lg"></i>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold ${statusColor} uppercase truncate">${doc.label}</p>
                        <div class="flex items-center gap-1.5">
                            <i class="${icon} text-[10px]"></i>
                            <span class="text-[8px] font-bold uppercase ${statusColor}">${statusLabel}</span>
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
            li.className = 'flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 text-sm hover:border-brand-maroon/20 transition-all group';

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all';
            deleteBtn.title = 'Delete course';
            deleteBtn.innerHTML = '<i class="ph-trash text-sm"></i>';
            deleteBtn.onclick = () => this.confirmDeleteCourse(c.id);

            const gradeDiv = document.createElement('div');
            gradeDiv.className = 'text-brand-maroon font-bold';
            gradeDiv.textContent = this.getGradeLetter(c.grade);

            const rightDiv = document.createElement('div');
            rightDiv.className = 'flex items-center gap-2';
            rightDiv.appendChild(gradeDiv);
            rightDiv.appendChild(deleteBtn);

            li.innerHTML = `
                <div class="flex-1">
                    <div class="text-sm font-medium text-gray-800">${c.name}</div>
                    <div class="text-[10px] text-gray-500">Subject ${App.currentUser.courses.indexOf(c) + 1}</div>
                </div>
            `;
            li.appendChild(rightDiv);
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
        if (points >= 3.0) return 'B';
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
    },

    confirmDeleteCourse(courseId) {
        const course = App.currentUser.courses.find(c => c.id === courseId);
        if (!course) return;

        App.showModal('delete', 'Remove Course?', `Are you sure you want to delete "${course.name}"? This will decrease your subject count.`, () => {
            this.deleteCourse(courseId);
        }, {
            showCancel: true,
            confirmText: 'Remove'
        });
    },

    deleteCourse(courseId) {
        const idx = App.currentUser.courses.findIndex(c => c.id === courseId);
        if (idx !== -1) {
            const course = App.currentUser.courses[idx];
            App.currentUser.courses.splice(idx, 1);
            
            // Only decrement if it was a passing grade
            if (course.grade > 0) {
                App.currentUser.requirements.subjects.current = Math.max(0, App.currentUser.requirements.subjects.current - 1);
            }
            // Recalculate to be safe (robustness)
            App.currentUser.requirements.subjects.current = App.currentUser.courses.filter(c => c.grade > 0).length;

            this.syncUser();
            this.updateStats();
            this.renderReqs();
            this.renderHistory();
            App.showModal('success', 'Course Removed', 'The course has been deleted from your record.');
        }
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
        } else {
            students.forEach(student => {
                const reqs = student.requirements;
                const files = student.files || [];

                // Progress Calculation
                const subMax = App.AVAILABLE_COURSES.length;
                const completedSubjects = Math.min(subMax, reqs.subjects.current);
                const mandatoryDocs = ["Financial Clearance", "Library Clearance", "Transcript", "Academic Internship", "Project Defense"];

                let docScore = 0;
                mandatoryDocs.forEach(doc => {
                    const file = files.find(f => f.category === doc);
                    const isCleared = (file && file.status === 'cleared') || (reqs.manualClearance && reqs.manualClearance[doc]);
                    if (isCleared) docScore++;
                });

                const percent = Math.round(((completedSubjects + docScore) / (subMax + 5)) * 100);
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
                                <div class="text-[10px] text-slate-500 flex flex-col">
                                    <span>${student.email}</span>
                                    <span class="text-slate-400 font-mono">${student.phone || 'No phone'}</span>
                                </div>
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
                        <div class="flex items-center -space-x-2">
                            ${mandatoryDocs.map(doc => {
                                const file = files.find(f => f.category === doc);
                                const isCleared = (file && file.status === 'cleared') || (reqs.manualClearance && reqs.manualClearance[doc]);
                                return `<div title="${doc}" class="w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold ${isCleared ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'}">${doc.charAt(0)}</div>`;
                            }).join('')}
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isEligible ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-400'}">
                            ${isEligible ? 'GRADUATED' : 'STUDYING'}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="AdminDashboard.openReview('${student.email}')" 
                            class="text-brand-maroon hover:text-white hover:bg-brand-maroon px-3 py-1 rounded-lg text-xs font-bold transition-all border border-brand-maroon">
                            REVIEW
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        
        this.renderCurriculumManager();
    },

    renderCurriculumManager() {
        const list = document.getElementById('admin-curriculum-list');
        if (!list) return;
        list.innerHTML = '';

        App.AVAILABLE_COURSES.forEach((course, index) => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm hover:border-brand-maroon/20';
            div.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="text-[10px] font-bold text-gray-400 w-4">${index + 1}</span>
                    <span class="font-medium text-gray-800">${course}</span>
                </div>
                <button onclick="AdminDashboard.confirmDeleteSubject('${course}')" class="text-gray-400 hover:text-red-500 p-1">
                    <i class="ph-trash text-lg"></i>
                </button>
            `;
            list.appendChild(div);
        });
    },

    addSubject() {
        const code = document.getElementById('new-subject-code').value.trim().toUpperCase();
        const name = document.getElementById('new-subject-name').value.trim();

        if (!code || !name) {
            App.showModal('warning', 'Incomplete Data', 'Please provide both a subject code and a subject name.');
            return;
        }

        const fullSubject = `${code} ${name}`;
        if (App.data.config.availableCourses.includes(fullSubject)) {
            App.showModal('error', 'Duplicate Subject', 'This subject already exists in the curriculum.');
            return;
        }

        App.data.config.availableCourses.push(fullSubject);
        App.saveData();
        
        // Broadcast notification to all BBICT students
        const students = App.data.users.filter(u => u.role === 'student');
        students.forEach(student => {
            this.dispatchNotification(
                student, 
                'New Course Added', 
                `Administrator has added "${fullSubject}" to the BBICT curriculum. You can now add this course to your records.`,
                false // Don't show success modal for every student
            );
        });

        // Reset form
        document.getElementById('new-subject-code').value = '';
        document.getElementById('new-subject-name').value = '';

        this.renderCurriculumManager();
        App.showModal('success', 'Subject Added & Broadcast', `"${fullSubject}" has been added and ${students.length} students have been notified.`);
    },

    confirmDeleteSubject(subject) {
        App.showModal('delete', 'Delete Subject?', `Are you sure you want to remove "${subject}" from the curriculum? Students who have already added this course will keep it, but it will no longer be available for others.`, () => {
            const index = App.data.config.availableCourses.indexOf(subject);
            if (index !== -1) {
                App.data.config.availableCourses.splice(index, 1);
                App.saveData();
                this.renderCurriculumManager();
            }
        }, { confirmText: 'Delete', showCancel: true });
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

        if (masterCb) {
            masterCb.checked = checked.length === checkboxes.length && checkboxes.length > 0;
            masterCb.indeterminate = checked.length > 0 && checked.length < checkboxes.length;
        }
    },

    bulkEmail() {
        const emails = Array.from(document.querySelectorAll('.student-checkbox:checked')).map(cb => cb.value);
        if (emails.length === 0) return;

        App.showModal('warning', 'Bulk Notification', `You are about to send status updates to ${emails.length} selected students.`, () => {
            emails.forEach(email => {
                const student = App.data.users.find(u => u.email === email);
                if (student) {
                    const subMax = App.AVAILABLE_COURSES.length;
                    const completedSubjects = Math.min(subMax, student.requirements.subjects.current);
                    const mandatoryDocs = ["Financial Clearance", "Library Clearance", "Transcript", "Academic Internship", "Project Defense"];
                    let docScore = 0;
                    mandatoryDocs.forEach(doc => {
                        const file = student.files.find(f => f.category === doc);
                        if ((file && file.status === 'cleared') || (student.requirements.manualClearance && student.requirements.manualClearance[doc])) docScore++;
                    });
                    const percent = Math.round(((completedSubjects + docScore) / (subMax + 5)) * 100);
                    const isEligible = percent >= 100;

                    this.dispatchNotification(student, 'Status Report', `Your current graduation progress is at ${percent}%. Keep it up!`, false);
                }
            });
            App.showModal('success', 'Bulk Dispatch Complete', `Successfully sent notifications to ${emails.length} students.`);
            this.toggleAll(false);
        }, { showCancel: true, confirmText: 'Send to All' });
    },

    confirmBulkDelete() {
        const emails = Array.from(document.querySelectorAll('.student-checkbox:checked')).map(cb => cb.value);
        if (emails.length === 0) return;

        App.showModal('delete', 'Bulk Delete Students?', 'Are you sure? This action is permanent.', () => {
            emails.forEach(email => {
                const idx = App.data.users.findIndex(u => u.email === email);
                if (idx !== -1) App.data.users.splice(idx, 1);
            });
            App.saveData();
            this.render();
            this.updateBulkActions();
        }, { showCancel: true, confirmText: 'Delete Selected' });
    },

    // --- Student Detail Review & Edit ---

    currentReviewUser: null,

    openReview(email) {
        const student = App.data.users.find(u => u.email === email);
        if (!student) return;
        this.currentReviewUser = student;
        const modal = document.getElementById('admin-review-modal');
        document.getElementById('review-avatar').textContent = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        document.getElementById('review-name').textContent = student.name;
        document.getElementById('review-reg').textContent = student.regNumber || 'N/A';
        const phoneEl = document.getElementById('review-phone');
        if (phoneEl) phoneEl.innerHTML = `<i class="ph-phone-fill"></i> ${student.phone || 'N/A'}`;
        this.updateReviewStats();
        this.renderReviewSubjects();
        this.renderReviewClearance();
        this.switchReviewTab('courses');
        modal.classList.remove('hidden');
    },

    closeReview() {
        document.getElementById('admin-review-modal').classList.add('hidden');
        this.currentReviewUser = null;
        this.render();
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
        const subMax = App.AVAILABLE_COURSES.length;
        const completedSubjects = Math.min(subMax, reqs.subjects.current);
        const mandatoryDocs = ["Financial Clearance", "Library Clearance", "Transcript", "Academic Internship", "Project Defense"];
        let docScore = 0;
        mandatoryDocs.forEach(doc => {
            if (files.some(f => f.category === doc && f.status === 'cleared') || (reqs.manualClearance && reqs.manualClearance[doc])) docScore++;
        });
        const percent = Math.round(((completedSubjects + docScore) / (subMax + 5)) * 100);
        document.getElementById('review-percent').textContent = `${percent}%`;
        document.getElementById('review-progress-ring').setAttribute('stroke-dasharray', `${percent}, 100`);
    },

    renderReviewSubjects() {
        const list = document.getElementById('review-subjects-list');
        if (!list) return;
        list.innerHTML = '';
        this.currentReviewUser.courses.forEach(c => {
            const div = document.createElement('div');
            div.className = 'p-3 bg-white border border-gray-100 rounded-xl flex justify-between items-center';
            div.innerHTML = `<div><p class="font-bold text-gray-800 text-sm">${c.name}</p><p class="text-[10px] text-gray-400 uppercase">${c.date}</p></div><div class="text-brand-maroon font-black">${this.getGradeLetter(c.grade)}</div>`;
            list.appendChild(div);
        });
    },

    renderReviewClearance() {
        const list = document.getElementById('review-clearance-list');
        if (!list) return;
        list.innerHTML = '';
        const mandatoryDocs = [
            { id: 'Financial Clearance', label: 'Financial Clearance' },
            { id: 'Library Clearance', label: 'Library Clearance' },
            { id: 'Transcript', label: 'Verified Transcript' },
            { id: 'Academic Internship', label: 'Industrial Attachment' },
            { id: 'Project Defense', label: 'Final Project Defense' }
        ];
        mandatoryDocs.forEach(doc => {
            const student = this.currentReviewUser;
            const uploadedFile = student.files.find(f => f.category === doc.id);
            const isManuallyCleared = student.requirements.manualClearance && student.requirements.manualClearance[doc.id];
            let status, statusLabel, statusColor, statusBg;
            if (isManuallyCleared || (uploadedFile && uploadedFile.status === 'cleared')) {
                status = 'cleared'; statusLabel = 'Cleared'; statusColor = 'text-green-700'; statusBg = 'bg-green-100 border-green-200';
            } else if (uploadedFile && uploadedFile.status === 'in-review') {
                status = 'in-review'; statusLabel = 'In Review'; statusColor = 'text-amber-700'; statusBg = 'bg-amber-100 border-amber-200';
            } else {
                status = 'pending'; statusLabel = 'Pending'; statusColor = 'text-gray-500'; statusBg = 'bg-gray-100 border-gray-200';
            }
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100';
            div.innerHTML = `<div class="flex-1"><h4 class="text-sm font-bold text-gray-800">${doc.label}</h4><div class="mt-1"><span class="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${statusBg} ${statusColor}">${statusLabel}</span></div></div><div class="flex items-center gap-2">${uploadedFile ? `<button onclick="AdminDashboard.viewStudentFile('${doc.id}')" class="px-3 py-1.5 bg-brand-maroon/10 text-brand-maroon text-[10px] font-bold rounded-lg hover:bg-brand-maroon hover:text-white transition-all"><i class="ph-eye"></i> View</button>` : ''}${status === 'in-review' ? `<button onclick="AdminDashboard.approveDocument('${doc.id}')" class="px-3 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg hover:bg-green-600 transition-all"><i class="ph-check-circle"></i> Approve</button>` : ''}<div class="flex items-center gap-2"><span class="text-[8px] font-bold uppercase tracking-widest text-gray-400">Manual</span><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" ${isManuallyCleared ? 'checked' : ''} onchange="AdminDashboard.toggleReviewManualClear('${doc.id}', this.checked)" class="sr-only peer"><div class="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div></label></div></div>`;
            list.appendChild(div);
        });
    },

    getGradeLetter(points) {
        if (points >= 4.0) return 'A';
        if (points >= 3.0) return 'B';
        if (points >= 2.0) return 'C';
        if (points >= 1.0) return 'D';
        return 'F';
    },

    viewStudentFile(category) {
        const student = this.currentReviewUser;
        if (!student) return;
        const file = student.files.find(f => f.category === category);
        if (!file) return;
        const win = window.open('', '_blank');
        if (!win) { App.showModal('error', 'Popup Blocked', 'Please allow popups to view student documents.'); return; }
        const isImage = file.data.startsWith('data:image/');
        let content = isImage ? `<img src="${file.data}" style="max-width:90%; border-radius:12px;">` : `<iframe src="${file.data}" style="width:100%; height:100%;" frameborder="0"></iframe>`;
        win.document.write(`<html><body style="margin:0; background:#0f172a; display:flex; align-items:center; justify-content:center; height:100vh;">${content}</body></html>`);
        win.document.close();
    },

    toggleReviewManualClear(docId, state) {
        if (!this.currentReviewUser.requirements.manualClearance) this.currentReviewUser.requirements.manualClearance = {};
        this.currentReviewUser.requirements.manualClearance[docId] = state;
        App.saveData();
        this.updateReviewStats();
        this.renderReviewClearance();
    },

    approveDocument(category) {
        const file = this.currentReviewUser.files.find(f => f.category === category);
        if (!file) return;
        file.status = 'cleared';
        App.saveData();
        this.updateReviewStats();
        this.renderReviewClearance();
        App.showModal('success', 'Approved', `${category} is now cleared.`);
    },

    sendCustomMessage() {
        const title = document.querySelector('#review-msg-title').value.trim();
        const body = document.querySelector('#review-msg-body').value.trim();
        if (!title || !body) return;
        AdminDashboard.dispatchNotification(this.currentReviewUser, title, body, true);
        document.querySelector('#review-msg-title').value = '';
        document.querySelector('#review-msg-body').value = '';
    }
};

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    // Expose to global scope for HTML inline events
    window.App = App;
    window.StudentDashboard = StudentDashboard;
    window.AdminDashboard = AdminDashboard;

    App.init();
    StudentDashboard.bindEvents();
});












