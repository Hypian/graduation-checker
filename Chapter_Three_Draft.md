# CHAPTER 3: METHODOLOGY

## 3.0 Introduction

This chapter presents the research and development methodology employed in the design and implementation of the Degreefi graduation clearance system. It outlines the research design, system development methodology, data collection techniques, and system design approach used to ensure the successful delivery of a functional, secure, and user-friendly application. The methodological choices are justified in the context of the project's objectives and the nature of software development.

## 3.1 Research Design

### 3.1.1 Research Approach

This project adopts a **Design Science Research (DSR)** approach, which is particularly suitable for information systems development projects. DSR is a problem-solving paradigm that seeks to create artifacts—in this case, a web application—that address identified organizational problems. Unlike traditional research that seeks to understand phenomena, DSR focuses on building and evaluating technological solutions that improve existing practices.

The DSR framework, as articulated by Hevner et al. (2004), involves iterative cycles of building and evaluation. In this project, the artifact (Degreefi) was developed through multiple iterations, with each cycle incorporating feedback from requirements analysis and testing phases. This approach ensures that the final system is not only technically sound but also practically relevant to the needs of students and administrators.

### 3.1.2 Research Strategy

The research strategy combines elements of **Qualitative Analysis** and **Prototyping**. Qualitative analysis was used during the requirements gathering phase to understand the existing clearance workflow, identify pain points, and define user needs. This involved reviewing existing documentation, observing the current manual process, and consulting with key stakeholders including students, academic advisors, and registry staff.

Prototyping was employed as the primary development strategy, allowing for rapid visualization of system features and early user feedback. This iterative approach reduced development risk by enabling continuous validation of design decisions against user expectations.

## 3.2 System Development Methodology

### 3.2.1 Agile Methodology

The project adopted the **Agile Software Development Methodology**, specifically drawing from Scrum practices. Agile was selected for its flexibility, iterative nature, and emphasis on working software over comprehensive documentation. This methodology is particularly well-suited for projects where requirements may evolve and where early delivery of functional components is desirable.

Key Agile principles applied in this project include:

- **Iterative Development:** The system was built in sprints, with each sprint delivering a functional increment. For example, Sprint 1 focused on user authentication, Sprint 2 on the student dashboard, and subsequent sprints on administrative features.

- **Continuous Integration:** Code changes were regularly integrated and tested to identify issues early. This practice reduced the risk of integration problems during later stages of development.

- **User-Centric Design:** User stories were used to capture requirements from the perspective of students and administrators. Each feature was developed to address a specific user need.

### 3.2.2 Justification for Agile

Agile was chosen over the traditional Waterfall methodology for several reasons:

1. **Flexibility:** The clearance process involves multiple stakeholders with potentially evolving requirements. Agile allows for requirements to be refined as understanding deepens.

2. **Risk Management:** By delivering working software in short iterations, critical feedback was obtained early, allowing for course corrections before significant resources were invested.

3. **Stakeholder Engagement:** Regular demonstrations of working features kept stakeholders engaged and informed, ensuring alignment between development efforts and user expectations.

## 3.3 Data Collection Methods

### 3.3.1 Document Review

Existing documents related to the graduation clearance process were reviewed to understand the current workflow and regulatory requirements. These documents included:

- Official clearance forms and checklists used by the BBICT program
- Curriculum documents outlining course requirements and credit allocations
- University policies on graduation eligibility and clearance procedures
- Sample student transcripts and graduation records

This review provided essential domain knowledge that informed the system's business logic, particularly the eligibility algorithms and clearance verification rules.

### 3.3.2 Observation

Direct observation of the existing clearance process provided insights into operational bottlenecks and user pain points. Key observations included:

- Students frequently experienced confusion about their eligibility status due to a lack of real-time feedback
- Administrative staff spent significant time on manual GPA calculations and cross-referencing records
- Document handling was prone to delays and occasional misplacement

These observations directly informed the system's feature set, particularly the real-time dashboard and automated calculation engine.

### 3.3.3 Secondary Data Analysis

Academic literature on student information systems, technology acceptance, and web development practices was reviewed to inform design decisions. This analysis ensured that Degreefi was built on a solid theoretical foundation and incorporated industry best practices.

3.4 System Analysis and Design

3.4.1 Requirements Analysis

Requirements were categorized into functional and non-functional requirements based on the data collected:

**Functional Requirements:**

| Module                | Requirement Description                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| Authentication        | Secure user login with role-based access (student vs. administrator)      |
| Student Dashboard     | Real-time display of courses completed, GPA, and eligibility status       |
| Course Management     | Ability to add, edit, and delete course records with automatic GPA update |
| Document Upload       | Secure upload of clearance documents with status tracking                 |
| Admin Portal          | View all students, approve/reject documents, send notifications           |
| Curriculum Management | Define and update program requirements for eligibility calculation        |

**Non-Functional Requirements:**

| Category     | Requirement Description                                             |
| ------------ | ------------------------------------------------------------------- |
| Performance  | The system should load pages within 3 seconds under normal usage.   |
| Security     | All data transmissions must be encrypted; passwords must be hashed. |
| Usability    | The interface should be intuitive, requiring minimal training.      |
| Scalability  | The architecture should support growth in user numbers.             |
| Availability | The system should target 99% uptime during academic periods.        |

### 3.4.2 System Architecture

Degreefi employs a **three-tier architecture** separating concerns into the Presentation Layer, Application Layer, and Data Layer:

1. **Presentation Layer (Frontend):** Built with React.js, this layer handles the user interface and user interactions. It communicates with the backend via RESTful API calls.

2. **Application Layer (Backend):** Implemented using Node.js and Express.js, this layer contains the business logic, including the eligibility calculation algorithm, authentication handlers, and document management services.

3. **Data Layer (Database):** MongoDB serves as the persistent data store, housing collections for users, courses, requirements, and documents.

This separation ensures maintainability, as changes to one layer do not necessarily impact others, and supports scalability through independent deployment of layers if needed.

### 3.4.3 Database Design

MongoDB was selected for its schema flexibility, which is advantageous for storing nested and dynamic data structures. The database schema includes the following primary collections:

**Users Collection:**

```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (unique)",
  "password": "String (hashed)",
  "role": "String (student | admin)",
  "courses": [
    {
      "courseCode": "String",
      "courseName": "String",
      "creditHours": "Number",
      "grade": "String"
    }
  ],
  "documents": ["ObjectId (references)"],
  "createdAt": "Date"
}
```

**Requirements Collection:**

```json
{
  "_id": "ObjectId",
  "program": "String",
  "minimumCredits": "Number",
  "minimumCGPA": "Number",
  "requiredCourses": ["String (course codes)"],
  "updatedAt": "Date"
}
```

### 3.4.4 Use Case Diagram

The primary actors in the system are **Students** and **Administrators**. Key use cases include:

**Student Use Cases:**

- Register and login to the system
- View personal dashboard with GPA and eligibility status
- Add, edit, or delete course records
- Upload clearance documents
- Receive notifications on document status

**Administrator Use Cases:**

- Login with administrative privileges
- View student registry with filter options
- Review and approve/reject uploaded documents
- Send messages to individual students
- Manage curriculum requirements

### 3.4.5 Data Flow Diagram (Level 1)

The system's primary data flows can be summarized as follows:

1. **Student → System:** Student submits course data and clearance documents.
2. **System → Database:** System stores and retrieves user records, courses, and documents.
3. **System → Student:** System displays calculated GPA, eligibility status, and notifications.
4. **Administrator → System:** Admin submits document approvals, rejections, and curriculum updates.
5. **System → Administrator:** System displays student registry and pending document queue.

## 3.5 Development Tools and Environment

### 3.5.1 Development Environment

The following tools and technologies were used in the development of Degreefi:

| Category         | Tool/Technology        | Purpose                                     |
| ---------------- | ---------------------- | ------------------------------------------- |
| Code Editor      | Visual Studio Code     | Primary development IDE                     |
| Version Control  | Git + GitHub           | Source code management and collaboration    |
| Package Manager  | npm                    | Dependency management for Node.js modules   |
| API Testing      | Postman                | Testing and debugging RESTful API endpoints |
| Browser DevTools | Chrome Developer Tools | Frontend debugging and performance analysis |

### 3.5.2 Technology Stack Summary

| Layer          | Technology  | Version  |
| -------------- | ----------- | -------- |
| Frontend       | React.js    | 18.x     |
| Styling        | TailwindCSS | 3.x      |
| Backend        | Node.js     | 18.x LTS |
| Web Framework  | Express.js  | 4.x      |
| Database       | MongoDB     | 6.x      |
| Authentication | JWT         | -        |
| File Upload    | Multer      | -        |

## 3.6 Testing Strategy

### 3.6.1 Testing Levels

A comprehensive testing strategy was employed to ensure system quality:

1. **Unit Testing:** Individual functions and components were tested in isolation. For example, the GPA calculation function was tested with various input scenarios to ensure accuracy.

2. **Integration Testing:** The interaction between frontend and backend components was tested. API endpoints were validated using Postman to ensure correct responses.

3. **System Testing:** The complete system was tested end-to-end to verify that all modules work together as expected.

4. **User Acceptance Testing (UAT):** The system was demonstrated to representative users to validate that it meets their needs and expectations.

### 3.6.2 Test Cases

Sample test cases for critical functionality:

| Test ID | Feature           | Test Description                       | Expected Result                        |
| ------- | ----------------- | -------------------------------------- | -------------------------------------- |
| TC-01   | User Registration | Register with valid email and password | Account created, redirect to dashboard |
| TC-02   | GPA Calculation   | Add courses with known grades          | Correct GPA displayed on dashboard     |
| TC-03   | Document Upload   | Upload PDF file under size limit       | File saved, status set to "Pending"    |
| TC-04   | Admin Approval    | Admin approves pending document        | Status changes to "Approved"           |
| TC-05   | Eligibility Check | Student meets all requirements         | Eligibility shown as "Eligible"        |

## 3.7 Ethical Considerations

### 3.7.1 Data Privacy

The system handles sensitive student information, necessitating strict adherence to data privacy principles:

- **Data Minimization:** Only data essential for system functionality is collected.
- **Secure Storage:** Passwords are hashed using bcrypt; sensitive data is stored securely in MongoDB.
- **Access Control:** Role-based authentication ensures users can only access data appropriate to their role.

### 3.7.2 Informed Consent

Users are informed about data collection and usage through the registration process. The system does not share personal data with third parties without explicit consent.

## 3.8 Chapter Summary

This chapter has outlined the methodological approach taken in the development of Degreefi. The Design Science Research paradigm provided the overarching framework, while Agile practices guided the iterative development process. Data was collected through document review, observation, and secondary analysis to inform requirements. The system was designed using a three-tier architecture with MongoDB for data persistence. A comprehensive testing strategy was implemented to ensure quality, and ethical considerations regarding data privacy were addressed. The next chapter will present the system implementation and results.
