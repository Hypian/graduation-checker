# CHAPTER 2: LITERATURE REVIEW

## 2.0 Introduction

This chapter presents a review of existing literature relevant to the development of web-based academic management systems and graduation clearance automation. It examines the theoretical foundations underpinning the Degreefi system, reviews existing solutions and their limitations, and provides justification for the chosen technology stack. The chapter concludes with an identification of the research gap that this project aims to address.

## 2.1 Theoretical Framework

### 2.1.1 General Systems Theory (GST)

General Systems Theory, proposed by Ludwig von Bertalanffy in 1968, provides a foundational lens for understanding complex organizational processes. GST posits that any complex entity—whether biological, mechanical, or organizational—can be understood as a system composed of interrelated and interdependent parts. These parts work together to transform inputs into outputs through defined processes, while feedback loops enable continuous improvement and adaptation.

In the context of Degreefi, the university's graduation clearance process can be modeled as a system with multiple subsystems: the Academic subsystem (grades, credits), the Financial subsystem (fees, bursary clearance), and the Logistics subsystem (library, sports equipment). Degreefi serves as the **Integration Layer** that harmonizes inputs from these subsystems (transcripts, receipts, clearance forms) and produces a decisive output (graduation eligibility status). The real-time dashboard acts as a feedback mechanism, allowing students and administrators to monitor progress and take corrective action when needed.

### 2.1.2 Technology Acceptance Model (TAM)

The Technology Acceptance Model, introduced by Fred Davis in 1989, is a widely used framework for predicting user adoption of information systems. TAM proposes that two primary factors influence whether users will accept and use a new technology: **Perceived Usefulness (PU)**, the degree to which a user believes the system will enhance their performance, and **Perceived Ease of Use (PEOU)**, the degree to which a user believes the system will be effortless to operate.

Degreefi is designed with TAM principles at its core. Perceived Usefulness is maximized by providing real-time GPA calculations, instant eligibility feedback, and direct communication with administrators—features that directly address student pain points. Perceived Ease of Use is achieved through a modern, intuitive "Glassmorphism" user interface, responsive design for mobile access, and a streamlined document upload process. By optimizing both PU and PEOU, the system increases the likelihood of successful adoption by both students and administrative staff.

## 2.2 Review of Related Systems

### 2.2.1 Traditional Manual Clearance Systems

Most academic institutions, particularly in developing countries, still rely on paper-based clearance processes. Students are issued physical clearance forms that must be signed by various departmental heads. This approach is characterized by long processing times, high risk of document loss, lack of transparency, and significant administrative overhead. These systems offer no mechanism for students to track their progress in real-time.

### 2.2.2 Existing Student Information Systems (SIS)

Modern universities often deploy comprehensive Student Information Systems such as Banner, PeopleSoft, or PowerCampus. While these systems excel at managing enrollment, course registration, and grading, they typically do not provide specialized modules for graduation clearance. The clearance workflow, which involves multi-departmental verification and document uploads, often falls outside their core functionality, leaving institutions to manage it manually.

### 2.2.3 Custom Web-Based Solutions

Some institutions have developed custom web applications to address specific administrative needs. These solutions vary widely in scope and quality. A review of similar projects reveals common features such as online grade viewing, document submission portals, and basic notification systems. However, many lack an integrated "Eligibility Engine" that can algorithmically determine graduation readiness by cross-referencing student records against a dynamic curriculum.

## 2.3 Conceptual Framework

The conceptual framework for Degreefi maps the relationship between the system's key features (Independent Variables) and the expected outcomes (Dependent Variables):

| **Independent Variables** | **Dependent Variables**        |
| ------------------------- | ------------------------------ |
| Automated GPA Calculation | Accuracy of Eligibility Status |
| Digital Document Upload   | Administrative Efficiency      |
| Real-Time Notifications   | Student Satisfaction           |
| Centralized Dashboard     | Transparency                   |
| Secure Authentication     | Data Integrity                 |

This framework hypothesizes that the implementation of automated logic, cloud-based storage, and real-time communication will directly improve the efficiency, accuracy, and transparency of the graduation clearance process.

## 2.4 Technology Stack Justification

The **MERN Stack** (MongoDB, Express.js, React.js, Node.js) was selected for Degreefi based on the following technical requirements:

- **MongoDB:** A NoSQL document database chosen for its schema flexibility, which is ideal for handling nested data structures like student records and dynamic curriculum definitions. It also allows for single-query retrieval of complex documents, improving performance.

- **Express.js & Node.js:** A JavaScript runtime and web framework chosen for their non-blocking, event-driven I/O model. This is critical for handling concurrent operations such as multiple students uploading documents simultaneously without causing server crashes.

- **React.js:** A component-based frontend library chosen for its Virtual DOM, which enables efficient re-rendering of UI components when data changes. This is essential for real-time updates on the student dashboard without requiring full page reloads.

- **Additional Tools:**
  - **JWT (JSON Web Tokens):** For secure, stateless authentication.
  - **Multer:** For handling multi-part form data (file uploads).
  - **TailwindCSS:** For rapid, utility-first UI styling.

## 2.5 Research Gap

While existing literature and solutions address various aspects of academic management, there is a notable gap in systems that specifically target the **end-to-end automation of the graduation clearance workflow**. Most SIS platforms focus on enrollment and grading, leaving the clearance process as a manual appendix. Custom solutions, where they exist, often lack a robust eligibility engine capable of performing real-time, algorithmic audits against a dynamic curriculum.

Degreefi addresses this gap by providing:

1. An automated eligibility engine that cross-references student transcripts with curriculum requirements.
2. A unified digital clearance portal for multi-departmental verification.
3. A real-time notification system for transparent communication.

This project contributes to the body of knowledge by demonstrating a practical, scalable implementation of a graduation clearance system using modern web technologies.
