// Test file to debug job card issues
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobzz_2025')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const Job = require('./models/Job');
const Employer = require('./models/Employer');
const EmployerProfile = require('./models/EmployerProfile');

async function testJobData() {
    try {
        console.log('=== JOB CARD DEBUG TEST ===');
        
        // Get a few jobs from database
        const jobs = await Job.find({ status: { $in: ['active', 'pending'] } })
            .populate('employerId', 'companyName employerType')
            .limit(3)
            .lean();
        
        console.log('Number of jobs found:', jobs.length);
        
        if (jobs.length > 0) {
            jobs.forEach((job, index) => {
                console.log(`\n--- Job ${index + 1} ---`);
                console.log('Title:', job.title);
                console.log('Location:', job.location);
                console.log('Job Type:', job.jobType);
                console.log('Vacancies:', job.vacancies);
                console.log('CTC:', job.ctc);
                console.log('Employer ID:', job.employerId);
                console.log('Status:', job.status);
                
                // Test CTC calculation
                if (job.ctc?.min && job.ctc?.max) {
                    const minLPA = Math.floor(job.ctc.min / 100000);
                    const maxLPA = Math.floor(job.ctc.max / 100000);
                    const ctcDisplay = job.ctc.min === job.ctc.max ? `₹${minLPA}LPA` : `₹${minLPA} - ${maxLPA} LPA`;
                    console.log('CTC Display:', ctcDisplay);
                } else {
                    console.log('CTC Display: Not specified');
                }
            });
        }
        
        // Test the API aggregation pipeline
        console.log('\n=== Testing API Pipeline ===');
        const pipeline = [
            { $match: { status: { $in: ['active', 'pending'] }, 'employerId': { $exists: true } } },
            {
                $lookup: {
                    from: 'employers',
                    localField: 'employerId',
                    foreignField: '_id',
                    as: 'employer',
                    pipeline: [
                        { $match: { status: 'active', isApproved: true } },
                        { $project: { companyName: 1, employerType: 1 } }
                    ]
                }
            },
            { $match: { 'employer.0': { $exists: true } } },
            {
                $lookup: {
                    from: 'employerprofiles',
                    localField: 'employerId',
                    foreignField: 'employerId',
                    as: 'employerProfile',
                    pipeline: [
                        { $project: { logo: 1, companyName: 1 } }
                    ]
                }
            },
            {
                $addFields: {
                    employerId: { $arrayElemAt: ['$employer', 0] },
                    employerProfile: { $arrayElemAt: ['$employerProfile', 0] },
                    postedBy: {
                        $cond: {
                            if: { $eq: [{ $arrayElemAt: ['$employer.employerType', 0] }, 'consultant'] },
                            then: 'Consultant',
                            else: 'Company'
                        }
                    }
                }
            },
            {
                $project: {
                    title: 1,
                    location: 1,
                    jobType: 1,
                    vacancies: 1,
                    category: 1,
                    ctc: 1,
                    description: 1,
                    requiredSkills: 1,
                    createdAt: 1,
                    employerProfile: 1,
                    postedBy: 1,
                    employerId: 1
                }
            },
            { $sort: { createdAt: -1 } },
            { $limit: 3 }
        ];
        
        const aggregatedJobs = await Job.aggregate(pipeline);
        console.log('Aggregated jobs count:', aggregatedJobs.length);
        
        if (aggregatedJobs.length > 0) {
            console.log('First aggregated job:', JSON.stringify(aggregatedJobs[0], null, 2));
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

testJobData();