const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Job = require('./models/Job');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://admin:password123@mongodb:27017/gujaratjobs?authSource=admin');
    console.log('Connected to DB');

    // Create a real-looking recruiter
    let recruiter = await User.findOne({ email: 'careers@tatvasoft.com' });
    if (!recruiter) {
      recruiter = await User.create({
        name: 'TatvaSoft HR Team',
        email: 'careers@tatvasoft.com',
        password: await bcrypt.hash('password123', 12),
        phone: '9876543210',
        location: { city: 'Ahmedabad', state: 'Gujarat' },
        role: 'recruiter',
        isVerified: true
      });
    }
    
    let tcs_recruiter = await User.findOne({ email: 'campus@tcs.com' });
    if (!tcs_recruiter) {
      tcs_recruiter = await User.create({
        name: 'TCS TA Team',
        email: 'campus@tcs.com',
        password: await bcrypt.hash('password123', 12),
        phone: '9876543211',
        location: { city: 'Gandhinagar', state: 'Gujarat' },
        role: 'recruiter',
        isVerified: true
      });
    }

    // Completely clear out old fake jobs
    await Job.deleteMany({});

    // Create Real Jobs
    const jobs = [
      {
        title: 'Frontend Developer (React.js) - Mega Walk-in Drive',
        company: 'TatvaSoft',
        description: 'TatvaSoft is conducting a Mega Walk-in Drive for React.js Developers with 1-3 years of experience. Bring your updated CV. We are looking for experts in React, Redux, HTML5, CSS3, and JavaScript.',
        salary: { min: 400000, max: 800000, currency: 'INR', period: 'yearly' },
        location: { city: 'Ahmedabad', address: 'TatvaSoft House, SG Highway' },
        type: 'full-time',
        category: 'IT-Software / Software Services',
        isWalkIn: true,
        walkInDetails: {
          date: new Date(Date.now() + 86400000 * 2), // 2 days from now
          startTime: '09:00 AM',
          endTime: '05:00 PM',
          venue: 'TatvaSoft House, SG Highway, Ahmedabad',
          contactPerson: 'HR Executive'
        },
        experienceLevel: 'junior',
        minExperience: 1,
        maxExperience: 3,
        skills: ['React JS', 'Redux', 'JavaScript', 'HTML5', 'CSS'],
        qualification: 'Graduate',
        recruiter: recruiter._id,
        status: 'active',
        isGuaranteedHiring: true,
        isFresherFriendly: false
      },
      {
        title: 'Software Engineer - Entry Level Walk-in',
        company: 'Tata Consultancy Services (TCS)',
        description: 'TCS Gandhinagar is hosting a walk-in interview for fresh engineering graduates (2025/2026 batches). Candidates must have strong foundational knowledge in OOPs, Java, or Python.',
        salary: { min: 336000, max: 336000, currency: 'INR', period: 'yearly' },
        location: { city: 'Gandhinagar', address: 'TCS Garima Park, IT/ITES SEZ' },
        type: 'full-time',
        category: 'IT-Software / Software Services',
        isWalkIn: true,
        walkInDetails: {
          date: new Date(Date.now() + 86400000 * 5), 
          startTime: '10:00 AM',
          endTime: '02:00 PM',
          venue: 'TCS Garima Park, Gandhinagar',
          contactPerson: 'Campus Recruitment Team'
        },
        experienceLevel: 'fresher',
        minExperience: 0,
        maxExperience: 1,
        skills: ['Java', 'Python', 'C++', 'SQL'],
        qualification: 'Graduate',
        recruiter: tcs_recruiter._id,
        status: 'active',
        isGuaranteedHiring: false,
        isFresherFriendly: true
      },
      {
        title: 'Senior MERN Stack Developer - Immediate Joiner',
        company: 'Gateway Group of Companies',
        description: 'Looking for a Senior Software Engineer specializing in MERN stack. Must have experience with React.js, Node.js, Express, and MongoDB. Urgent hiring!',
        salary: { min: 800000, max: 1500000, currency: 'INR', period: 'yearly' },
        location: { city: 'Ahmedabad', address: 'Sindhu Bhavan Road' },
        type: 'full-time',
        category: 'IT-Software / Software Services',
        isWalkIn: false,
        experienceLevel: 'senior',
        minExperience: 4,
        maxExperience: 8,
        skills: ['React JS', 'Node JS', 'Express JS', 'MongoDB'],
        qualification: 'Post-Graduate',
        recruiter: recruiter._id,
        status: 'active',
        isGuaranteedHiring: true,
        isFresherFriendly: false
      },
      {
        title: 'Backend Node.js Developer (Walk in Drive)',
        company: 'Zeus Learning',
        description: 'Walk-in recruitment drive for Node.js backend developers. Candidates will undergo a technical screening on the spot followed by HR round.',
        salary: { min: 500000, max: 900000, currency: 'INR', period: 'yearly' },
        location: { city: 'Vadodara', address: 'Alkapuri' },
        type: 'full-time',
        category: 'IT-Software / Software Services',
        isWalkIn: true,
        walkInDetails: {
          date: new Date(Date.now() + 86400000 * 3), 
          startTime: '10:00 AM',
          endTime: '04:00 PM',
          venue: 'Zeus Learning, Alkapuri, Vadodara'
        },
        experienceLevel: 'mid',
        minExperience: 2,
        maxExperience: 5,
        skills: ['Node JS', 'Express', 'Firebase', 'Data Structures'],
        qualification: 'Graduate',
        recruiter: recruiter._id,
        status: 'active',
        isGuaranteedHiring: false,
        isFresherFriendly: false
      }
    ];

    await Job.insertMany(jobs);
    console.log('Real-company jobs seeded successfully!');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
