# CHAPTER 1: INTRODUCTION

## 1.0 Introduction to the System

The transition from a student's final academic year to graduation is a momentous occasion, representing the culmination of years of rigorous study, financial investment, and intellectual growth. In many higher education institutions, however, this milestone is often overshadowed by the "last mile" hurdle: the graduation clearance process. This procedure is a multi-stakeholder audit designed to ensure that the candidate has satisfied every academic credit requirement, fulfilled all financial obligations to the bursary, and returned all institutional assets such as library books or sports equipment. While the achievement itself is significant, the bureaucratic complexity of verifying these prerequisites can become a major source of stress for both students and university staff.

Historically, this clearance process has relied on physical signatures, rubber stamps, and manual file navigation. Students are often required to ferry a "Clearance Form" across various departments, a method that is notoriously prone to document loss, transcription errors, and significant time delays. These manual systems lack transparency, leaving students in the dark about their actual eligibility status until the final hour. In larger institutions where student cohorts number in the hundreds or thousands, the administrative burden of manually auditing transcript records against moving curriculum standards becomes a logistical bottleneck that can result in errors and frustration.

"Degreefi" is an innovative, web-based Graduation Eligibility and Clearance Tracker designed specifically to solve these challenges through automation and digital transparency. Built on the modern MERN stack (MongoDB, Express.js, React.js, Node.js), the system transforms the graduation journey from a manual paper-chase into a streamlined, digital experience. By centralizing academic records and administrative milestones into a single, secure platform, Degreefi eliminates the need for physical forms and provides a real-time, algorithmic audit of a student's progress. It bridges the gap between disparate university departments, ensuring that data flows seamlessly from the library and bursary to the registrar's office.

For the student, Degreefi provides a comprehensive "Progress Dashboard" that serves as the central hub for their academic standing. This interface offers real-time visualization of graduation eligibility, displaying a detailed breakdown of completed versus outstanding courses. The system automatically fetches course records and calculates the Cumulative Grade Point Average (CGPA) on the fly, allowing students to monitor their performance without waiting for end-of-semester transcripts. Beyond academic tracking, the dashboard allows students to digitally upload clearance documents, such as financial receipts or library clearance certificates, and receive instant feedback on their approval status via in-app notifications.

For administrators and faculty staff, the system provides a robust "Administrative Command Center" that offers a bird's-eye view of the entire graduating cohort. Registrars can use the Student Registry to filter and identify students who are at risk of not graduating, allowing for early intervention. The portal includes a built-in document viewer where administrators can efficiently review, approve, or reject clearance submissions with a single click. Furthermore, the system features a dynamic Curriculum Manager, enabling the faculty to update course requirements and credit weights in real-time, which the system then automatically applies to the relevant student cohorts for eligibility auditing.

Ultimately, the goal of Degreefi is to enhance the integrity and efficiency of the graduation cycle by replacing subjective manual checks with objective, code-driven verification. By digitizing the clearance workflow, the system not only reduces the turnaround time for graduation approval from weeks to days but also creates a secure digital audit trail of all transactions. This modernization effort empowers students with agency over their own academic data while significantly reducing the overhead for university staff, ensuring that the focus remains on celebrating student success rather than navigating bureaucratic mazes.

## 1.1 Background of the Study

The global higher education landscape is currently experiencing a profound digital transformation, often termed "Education 4.0." Modern universities are increasingly adopting integrated Student Information Systems (SIS) and Enterprise Resource Planning (ERP) tools to manage enrollment, grading, and scheduling. However, the specific niche of graduation clearance frequently remains a manual outlier, disconnected from these digital ecosystems. In the Faculty of Computing and Information Management, the Bachelor of Business Information and Communication Technology (BBICT) program faces unique operational challenges due to its dynamic curriculum and growing student population.

As enrollment numbers for the BBICT program have surged, the traditional method of using spreadsheets and physical folders for clearance has become unsustainable. Staff members often spend hundreds of man-hours manually calculating GPAs and verifying credit loads, a process that is prone to human error and computational inconsistencies. "Degreefi" was conceived to automate this "last mile" of the student journey, providing a dedicated, intelligent interface that ensures academic data is processed with precision and speed.

## 1.2 Statement of the Problem

The current manual framework for graduation clearance at the institution is characterized by several critical inefficiencies:

1.  **Information Asymmetry:** Students are often unaware of their official graduation standing until long after final exams, leading to "Graduation Anxiety."
2.  **Administrative Latency:** The manual audit of a single student's file is time-consuming, creating significant delays when multiplied across a large cohort.
3.  **Data Fragmentation:** Verification data is stored in silos across the Library, Bursary, and Registrar's office, making cross-departmental coordination difficult.
4.  **Inefficiency and Error Risk:** Manual calculations of GPA and credit loads are susceptible to errors that can affect a student's graduation prospects or honors classification.

**Research Question:** _How can a web-based information system be architected to automate graduation eligibility logic while providing a unified, secure, and transparent platform for multi-departmental clearance?_

## 1.3 Objectives of the Study

### 1.3.1 General Objective

The primary objective of this project is to design, develop, and implement "Degreefi," a robust and user-centric web application that digitizes the graduation clearance workflow for the BBICT program.

### 1.3.2 Specific Objectives

- **To Design a User-Friendly Interface:** Develop an intuitive web interface for tracking graduation progress.
- **To Implement a Centralized Database:** Create a MongoDB database for storing student and clearance records.
- **To Integrate SMS Notifications:** Enable automated SMS alerts for clearance status updates.
- **To Develop a Document Upload System:** Build a secure module for digital document submission.

## 1.4 Scope and Limitations

### 1.4.1 Project Scope

The project covers the full Software Development Life Cycle (SDLC) of the Degreefi system. This includes the design of a NoSQL database schema in MongoDB, the development of a RESTful API using Node.js and Express, and the creation of a responsive frontend using React.js and TailwindCSS. The system focuses on student progress tracking, GPA calculation, document management, and administrative oversight.

### 1.4.2 Project Limitations

- **Legacy ERP Integration:** Due to institutional security protocols, the system does not directly interface with the university's main legacy database but functions as a specialized overlay.
- **Program Specificity:** While the logic can be adapted, the current implementation is optimized for the BBICT program's specific credit rules and requirements.

## 1.5 Significance of the Study

The implementation of Degreefi holds significant value for several stakeholders:

- **For Students:** It provides transparency, reduces anxiety, and empowers them to take proactive steps toward graduation.
- **For Administrators:** It reduces manual labor, eliminates arithmetic errors, and provides better data insights for cohort management.
- **For the Institution:** It enhances the professional image of the faculty and promotes a paperless, sustainable administrative culture.

## 1.6 Definition of Terms

- **BBICT:** Bachelor of Business Information and Communication Technology.
- **Clearance:** The process of obtaining official approval from various university departments before graduation.
- **CGPA:** Cumulative Grade Point Average.
- **MERN Stack:** A collection of JavaScript-based technologies (MongoDB, Express, React, Node) used for web development.
- **JWT:** JSON Web Token, used for secure authentication.
