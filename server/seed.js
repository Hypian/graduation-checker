const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');

dotenv.config();

const courses = [
    { code: "BUCU 001", name: "Communication Skills" },
    { code: "BPY 1101", name: "Basic Electricity and Optics" },
    { code: "BIT 1106", name: "Introduction to Computer Application packages" },
    { code: "BIT 1101", name: "Computer Architecture" },
    { code: "BMA 1106", name: "Foundation Mathematics" },
    { code: "BAF 1101", name: "Financial Accounting I" },
    { code: "BBM 1101", name: "Introduction To Business Studies" },
    { code: "ABCU 001", name: "Research methodology" },
    { code: "BEG 2112", name: "Digital Electronics and Logics" },
    { code: "BIT 2102", name: "Fundamentals of Internet" },
    { code: "BMA 1202", name: "Discrete Mathematics" },
    { code: "BBM 1201", name: "Principles of Management" },
    { code: "BAF 1201", name: "Financial Accounting II" },
    { code: "BAF 2105", name: "Business Law" },
    { code: "BBM 2103", name: "Organizational Behaviour" },
    { code: "BAF 1203", name: "Accounting Information Systems" },
    { code: "BIT 1201", name: "Database Systems" },
    { code: "BIT 4204", name: "E-commerce" },
    { code: "BIT 2202", name: "Business Information System Analysis and Design" },
    { code: "BIT 1202", name: "Introduction To Web Design" },
    { code: "BAF 2102", name: "Cost Accounting" },
    { code: "BBM 1202", name: "Principles of Marketing" },
    { code: "BIT 3233", name: "Internet of Things" },
    { code: "BIT 2201", name: "Computer Programming Methodology" },
    { code: "BIT 2203", name: "Data Structure and Algorithms" },
    { code: "BIT 2204", name: "Data Communication And Computer Networks" },
    { code: "BAF 2202", name: "Management Accounting I" },
    { code: "BAF 2104", name: "Financial Management I" },
    { code: "BAF 3108", name: "Risk Management" },
    { code: "BMA 1104", name: "Probability & Statistics I" },
    { code: "BMA 3201", name: "Operations Research I" },
    { code: "BIT 3101", name: "Software Engineering" },
    { code: "BIT 3204", name: "Network Management" },
    { code: "BIT 3201", name: "Object Oriented Analysis and Design" },
    { code: "BIT 3102", name: "Event Driven Programming" },
    { code: "BIT 3130", name: "Signals and systems" },
    { code: "BIT 3104", name: "Analogue and Digital Communications" },
    { code: "BMA 2102", name: "Probability and statistics 2" },
    { code: "BBM 3107", name: "Human Resource Management" },
    { code: "BIT 3106", name: "Object Oriented Programming" },
    { code: "BIT 4202", name: "Artificial Intelligence" },
    { code: "BIT 3205", name: "Business Systems Simulation and Modeling" },
    { code: "BIT 3105", name: "Management Information Systems" },
    { code: "BIT 3206", name: "ICT project management" },
    { code: "BIT 3222", name: "Structured cabling" },
    { code: "BIT 3234", name: "Data Analytics in Python" },
    { code: "BIT 4102", name: "Computer Graphics" },
    { code: "BIT 4103", name: "Human Computer Interaction" },
    { code: "BIT 4104", name: "Security and Cryptography" },
    { code: "BIT 4108", name: "Information Systems Audit" },
    { code: "BIT 3228", name: "Machine Learning" },
    { code: "BBM 4214", name: "Total Quality Management" },
    { code: "BIT 4203", name: "Distributed Multimedia Systems" },
    { code: "BIT 4201", name: "Mobile Communications" },
    { code: "BIT 4206", name: "ICT In Business and Society" },
    { code: "BIT 4107", name: "Mobile Applications Development" },
    { code: "BIT 4122", name: "Telecommunications Switching and Transmission Systems" },
    { code: "BIT 4119", name: "Spectrum Management" },
    { code: "BIT 4140", name: "Data Visualization" }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        await Course.deleteMany({});
        await Course.insertMany(courses);

        console.log('Database Seeded Successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();
