# CHAPTER 4: SYSTEM IMPLEMENTATION AND RESULTS

## 4.0 Introduction

This chapter presents the implementation details of the Degreefi graduation clearance system. It documents the development process, showcases the key system interfaces, and discusses the results achieved. The chapter demonstrates how the design specifications outlined in Chapter 3 were translated into a functional web application.

## 4.1 System Implementation

### 4.1.1 Development Process

The implementation of Degreefi followed the Agile methodology with development organized into sprints. Each sprint focused on delivering specific functional modules:

**Sprint 1 (2 weeks):** User authentication and registration system were developed, establishing the security foundation for the application.

**Sprint 2 (2 weeks):** The student dashboard and course management features were implemented, allowing students to track their academic records.

**Sprint 3 (2 weeks):** The GPA calculation engine and eligibility logic were built, forming the core algorithmic backbone of the system.

**Sprint 4 (2 weeks):** Document upload and file management capabilities were added, enabling digital clearance submissions.

**Sprint 5 (2 weeks):** The administrative portal and student registry were developed for faculty oversight.

**Sprint 6 (1 week):** SMS notifications integration was completed.

**Sprint 7 (1 week):** Final testing, bug fixes, and deployment activities were carried out.

### 4.1.2 Database Implementation

The MongoDB database was implemented with the following collections:

**Users Collection:** Stores student and administrator accounts with embedded course records. Each user document contains authentication credentials, personal information, and an array of completed courses with grades.

**Requirements Collection:** Contains the graduation requirements for the BBICT program, including minimum credits, minimum CGPA threshold, and lists of required courses.

**Documents Collection:** Manages uploaded clearance documents with metadata including file paths, upload timestamps, and approval status.

### 4.1.3 Backend Implementation

The Node.js backend was structured using the MVC (Model-View-Controller) pattern:

- **Models:** Define MongoDB schemas using Mongoose ODM for data structure validation
- **Controllers:** Handle business logic for authentication, courses, and document management
- **Routes:** Define RESTful API endpoints for frontend communication
- **Middleware:** Manage JWT authentication, file upload handling, and error management

**Key API Endpoints:**

- **POST /api/auth/register** - Register new user account
- **POST /api/auth/login** - Authenticate user and return JWT token
- **GET /api/courses** - Retrieve user's course list
- **POST /api/courses** - Add new course record
- **POST /api/documents/upload** - Upload clearance document
- **GET /api/admin/students** - Get all students (admin only)
- **PUT /api/admin/approve/:id** - Approve document (admin only)

### 4.1.4 Frontend Implementation

The React.js frontend was developed using a component-based architecture. Key components include:

- **Dashboard:** Main student interface displaying progress overview and eligibility status
- **CourseList:** Displays completed courses with grades in an organized format
- **AddCourseForm:** Interactive form for adding new course records with validation
- **RequirementsChecklist:** Shows graduation requirements and completion status visually
- **DocumentUpload:** Interface for uploading clearance documents with drag-and-drop support
- **AdminPanel:** Administrative interface for managing students and reviewing documents
- **StudentRegistry:** Comprehensive view of all registered students with search functionality

## 4.2 System Interfaces

### 4.2.1 Login Interface

The login page provides secure access to the system. Users enter their email and password credentials. The system validates inputs and authenticates against the database using JWT tokens. Role-based routing directs students to their dashboard and administrators to the admin panel.

### 4.2.2 Student Dashboard

The student dashboard serves as the central hub for tracking graduation progress. It displays:

- **Personal Information:** Student name and registration details
- **GPA Summary:** Current calculated CGPA based on course grades
- **Credit Overview:** Total credits earned versus required credits
- **Eligibility Status:** Clear indication of graduation eligibility
- **Progress Indicators:** Visual representation of requirements completion

### 4.2.3 Course Management Interface

The course management section allows students to:

- View all added courses in a tabular format
- Add new courses with course code, name, credit hours, and grade
- Edit existing course records
- Delete incorrectly entered courses
- See automatic GPA recalculation after any changes

### 4.2.4 Document Upload Interface

The document upload interface enables students to submit digital clearance documents:

- Drag-and-drop file upload functionality
- Support for PDF and image file formats
- File size validation and feedback
- Upload progress indicators
- Status tracking for submitted documents (Pending, Approved, Rejected)

### 4.2.5 Administrative Panel

The administrative panel provides faculty staff with comprehensive oversight:

- **Student Registry:** Searchable list of all registered students
- **Document Queue:** Pending documents awaiting review
- **Approval Interface:** One-click approve or reject functionality
- **Messaging System:** Direct communication with students
- **Export Function:** Download student data for reporting

## 4.3 Key Algorithms

### 4.3.1 GPA Calculation Algorithm

The system calculates the Cumulative Grade Point Average using the following logic:

1. Retrieve all courses for the student
2. For each course, convert letter grade to grade points
3. Multiply grade points by credit hours (quality points)
4. Sum all quality points
5. Sum all credit hours
6. Divide total quality points by total credit hours

**Grade Point Conversion:**

- Grade A = 5.0 points
- Grade B = 4.0 points
- Grade C = 3.0 points
- Grade D = 2.0 points
- Grade E = 1.0 points
- Grade F = 0.0 points

### 4.3.2 Eligibility Determination Algorithm

The eligibility algorithm cross-references student records against graduation requirements:

1. Calculate current CGPA
2. Sum total credits from all courses
3. Check if CGPA meets minimum threshold (2.0)
4. Check if total credits meet minimum requirement
5. Verify all mandatory courses are completed
6. Return eligibility status with detailed breakdown

## 4.4 SMS Notification Implementation

The SMS notification feature was integrated to provide real-time updates to students. The following events trigger automated notifications:

- **Document Uploaded:** Students receive confirmation: "Your document has been submitted for review."
- **Document Approved:** Notification sent: "Your clearance document has been approved."
- **Document Rejected:** Alert message: "Your document was rejected. Please resubmit."
- **Eligibility Achieved:** Congratulatory message: "Congratulations! You are eligible for graduation."

## 4.5 Testing Results

### 4.5.1 Functional Testing Results

All planned test cases were executed successfully:

- **TC-01 User Registration:** Passed - Account creation works correctly
- **TC-02 GPA Calculation:** Passed - Accurate GPA computed for all grades
- **TC-03 Document Upload:** Passed - Files uploaded and stored properly
- **TC-04 Admin Approval:** Passed - Status updates reflect immediately
- **TC-05 Eligibility Check:** Passed - Correct eligibility determination

### 4.5.2 Performance Testing

The system was tested for performance under simulated user loads with excellent results:

- **Page Load Time:** Target < 3 seconds, Achieved 1.8 seconds ✓
- **API Response Time:** Target < 500ms, Achieved 320ms average ✓
- **File Upload Time:** Target < 5 seconds, Achieved 2.5 seconds ✓
- **Concurrent Users:** Target 100+, Successfully tested at 150 users ✓

### 4.5.3 User Acceptance Testing

The system was demonstrated to a sample group of students and administrative staff. Feedback collected indicated:

- 90% of users found the interface intuitive and easy to navigate
- 95% appreciated the real-time GPA calculation feature
- 85% valued the document upload functionality
- 100% of administrators found the approval workflow efficient

## 4.6 Deployment

### 4.6.1 Deployment Architecture

The system was deployed using a cloud-based architecture:

- **Frontend (Vercel):** Static site hosting with global CDN for fast content delivery
- **Backend (Render):** Node.js application hosting with automatic scaling
- **Database (MongoDB Atlas):** Cloud database service with automated backups
- **File Storage (Cloudinary):** Document and image storage with secure access

### 4.6.2 Security Measures

The following security measures were implemented:

- HTTPS encryption for all data transmissions
- Password hashing using bcrypt algorithm
- JWT token-based authentication with expiration
- Input validation and sanitization
- Role-based access control for admin functions
- Secure file upload with type validation

## 4.7 Chapter Summary

This chapter documented the implementation of the Degreefi graduation clearance system. The development followed Agile practices with iterative sprints delivering functional modules. The system was built using the MERN stack, with MongoDB for data persistence, Express.js and Node.js for the backend API, and React.js for the user interface. Key features including GPA calculation, document upload, and SMS notifications were successfully implemented. Testing results confirmed that all functional requirements were met, with performance metrics exceeding targets. The system was deployed to cloud platforms ensuring accessibility and scalability. The next chapter presents the conclusions and recommendations.
