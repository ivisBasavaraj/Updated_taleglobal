const jwt = require('jsonwebtoken');
const Candidate = require('../models/Candidate');
const CandidateProfile = require('../models/CandidateProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Message = require('../models/Message');
const { createProfileCompletionNotification } = require('./notificationController');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// Authentication Controllers
exports.registerCandidate = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingCandidate = await Candidate.findOne({ email });
    if (existingCandidate) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const candidate = await Candidate.create({ 
      name, 
      email, 
      password, 
      phone,
      registrationMethod: 'signup',
      credits: 0
    });
    await CandidateProfile.create({ candidateId: candidate._id });

    const token = generateToken(candidate._id, 'candidate');

    res.status(201).json({
      success: true,
      token,
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.loginCandidate = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    const candidate = await Candidate.findOne({ email: email.toLowerCase().trim() });
    if (!candidate) {
      console.log('Candidate not found:', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    console.log('Candidate found:', candidate.name, 'Status:', candidate.status);
    console.log('Password hash exists:', !!candidate.password);
    
    console.log('Candidate registration method:', candidate.registrationMethod);
    console.log('Stored password length:', candidate.password ? candidate.password.length : 0);
    console.log('Login password length:', password ? password.length : 0);
    console.log('Password comparison type:', candidate.registrationMethod === 'placement' ? 'plain text' : 'bcrypt');
    const passwordMatch = await candidate.comparePassword(password);
    console.log('Password match result:', passwordMatch);
    
    if (!passwordMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    console.log('Login successful for:', email);

    if (candidate.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    const token = generateToken(candidate._id, 'candidate');

    res.json({
      success: true,
      token,
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        credits: candidate.credits || 0
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Profile Controllers
exports.getProfile = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ candidateId: req.user._id })
      .populate('candidateId', 'name email phone');
    
    if (!profile) {
      return res.json({ success: true, profile: null });
    }

    const profileData = profile.toObject({ getters: true });

    res.json({
      success: true,
      profile: {
        ...profileData,
        resumeFileName: profileData.resumeFileName || null,
        resumeMimeType: profileData.resumeMimeType || null,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User ID:', req.user._id);
    
    const { name, phone, email, middleName, lastName, ...profileData } = req.body;
    
    // Validation for middleName and lastName
    const errors = [];
    
    if (middleName && middleName.trim()) {
      if (middleName.length > 30) {
        errors.push({ field: 'middleName', msg: 'Middle name cannot exceed 30 characters' });
      } else if (!/^[a-zA-Z\s]*$/.test(middleName)) {
        errors.push({ field: 'middleName', msg: 'Middle name can only contain letters and spaces' });
      }
    }
    
    if (lastName && lastName.trim()) {
      if (lastName.length > 30) {
        errors.push({ field: 'lastName', msg: 'Last name cannot exceed 30 characters' });
      } else if (!/^[a-zA-Z\s]*$/.test(lastName)) {
        errors.push({ field: 'lastName', msg: 'Last name can only contain letters and spaces' });
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    
    // Update candidate basic info
    if (name || phone || email) {
      const updatedCandidate = await Candidate.findByIdAndUpdate(req.user._id, {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(email && { email })
      }, { new: true });
      console.log('Updated candidate:', updatedCandidate);
    }
    
    // Prepare profile update data
    const updateData = { ...profileData };

    if (middleName !== undefined) updateData.middleName = middleName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (req.file) {
      const { fileToBase64 } = require('../middlewares/upload');
      updateData.profilePicture = fileToBase64(req.file);
    }
    
    // Update profile data
    const profile = await CandidateProfile.findOneAndUpdate(
      { candidateId: req.user._id },
      updateData,
      { new: true, upsert: true }
    ).populate('candidateId', 'name email phone');
    
    // Calculate profile completion and create notification
    try {
      const { calculateProfileCompletion } = require('../utils/profileCompletion');
      const completionPercentage = calculateProfileCompletion(profile);
      
      // Create notification for significant completion milestones
      if (completionPercentage === 100 || completionPercentage >= 50) {
        await createProfileCompletionNotification(req.user._id, completionPercentage);
      }
    } catch (notifError) {
      console.error('Profile completion notification error:', notifError);
    }
    
    console.log('Updated profile:', profile);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { fileToBase64 } = require('../middlewares/upload');
    const resumeBase64 = fileToBase64(req.file);

    const profile = await CandidateProfile.findOneAndUpdate(
      { candidateId: req.user._id },
      {
        resume: resumeBase64,
        resumeFileName: req.file.originalname,
        resumeMimeType: req.file.mimetype
      },
      { new: true, upsert: true }
    );

    // Calculate profile completion and create notification
    try {
      const { calculateProfileCompletion } = require('../utils/profileCompletion');
      const completionPercentage = calculateProfileCompletion(profile);
      
      if (completionPercentage === 100 || completionPercentage >= 50) {
        await createProfileCompletionNotification(req.user._id, completionPercentage);
      }
    } catch (notifError) {
      console.error('Profile completion notification error:', notifError);
    }

    res.json({ success: true, resume: resumeBase64, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadMarksheet = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { fileToBase64 } = require('../middlewares/upload');
    const marksheetBase64 = fileToBase64(req.file);

    res.json({ success: true, filePath: marksheetBase64 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Job Controllers
exports.applyForJob = async (req, res) => {
  try {
    const { coverLetter, jobId: bodyJobId } = req.body;
    const jobId = req.params.jobId || bodyJobId;
    
    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required' });
    }
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Block applying if job is not active or application limit reached
    if (job.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Job post ended' });
    }
    if (typeof job.applicationLimit === 'number' && job.applicationLimit > 0 && job.applicationCount >= job.applicationLimit) {
      return res.status(400).json({ success: false, message: 'Job post ended: application limit reached' });
    }

    const existingApplication = await Application.findOne({
      jobId,
      candidateId: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'Already applied to this job' });
    }

    // Get full candidate data to check credits
    const candidate = await Candidate.findById(req.user._id);
    console.log('Candidate applying for job:', candidate.email, 'Credits:', candidate.credits);
    
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Check if candidate has credits (only for placement candidates)
    if (candidate.registrationMethod === 'placement' && candidate.credits <= 0) {
      console.log('Application blocked - insufficient credits for placement candidate');
      return res.status(400).json({ success: false, message: 'Insufficient credits to apply for jobs' });
    }
    
    // Signup candidates can apply without credit restrictions
    if (candidate.registrationMethod === 'signup') {
      console.log('Signup candidate - unlimited applications allowed');
    }

    const profile = await CandidateProfile.findOne({ candidateId: req.user._id });
    
    const application = await Application.create({
      jobId,
      candidateId: req.user._id,
      employerId: job.employerId,
      coverLetter,
      resume: profile?.resume
    });

    // Deduct credit only for placement candidates
    if (candidate.registrationMethod === 'placement') {
      console.log('About to deduct credit. Current credits:', candidate.credits);
      if (candidate.credits > 0) {
        const updateResult = await Candidate.findByIdAndUpdate(req.user._id, {
          $inc: { credits: -1 }
        });
        console.log(`Successfully deducted 1 credit from candidate ${candidate.email}. Previous: ${candidate.credits}, New: ${candidate.credits - 1}`);
        console.log('Update result:', updateResult ? 'Success' : 'Failed');
      } else {
        console.log('No credits to deduct');
      }
    } else {
      console.log('Signup candidate - no credit deduction needed');
    }

    // Update job application count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    // Create notification for employer about new application
    try {
      const { createNotification } = require('./notificationController');
      await createNotification({
        title: 'New Job Application',
        message: `${candidate.name} has applied for ${job.title} position`,
        type: 'application_received',
        role: 'employer',
        relatedId: application._id,
        createdBy: req.user._id
      });
    } catch (notifError) {
      console.error('Employer notification creation failed:', notifError);
    }

    // Create notification for candidate if job has scheduled interviews
    if (job.interviewScheduled && job.interviewRoundDetails) {
      try {
        const { createNotification } = require('./notificationController');
        
        // Get scheduled rounds with details
        const scheduledRounds = [];
        Object.entries(job.interviewRoundTypes).forEach(([roundType, isSelected]) => {
          if (isSelected && job.interviewRoundDetails[roundType]) {
            const details = job.interviewRoundDetails[roundType];
            if (details.date && details.time) {
              const roundNames = {
                technical: 'Technical Round',
                nonTechnical: 'Non-Technical Round', 
                managerial: 'Managerial Round',
                final: 'Final Round',
                hr: 'HR Round'
              };
              scheduledRounds.push({
                name: roundNames[roundType],
                date: new Date(details.date).toLocaleDateString(),
                time: details.time,
                description: details.description
              });
            }
          }
        });
        
        if (scheduledRounds.length > 0) {
          let message = `Your application for ${job.title} has been received. Interview rounds scheduled:\n\n`;
          scheduledRounds.forEach((round, index) => {
            message += `${index + 1}. ${round.name}\n`;
            message += `   Date: ${round.date}\n`;
            message += `   Time: ${round.time}\n`;
            if (round.description) {
              message += `   Details: ${round.description}\n`;
            }
            message += '\n';
          });
          message += 'Please be prepared and arrive on time. Good luck!';
          
          await createNotification({
            title: 'Interview Schedule - Application Received',
            message: message,
            type: 'interview_scheduled',
            role: 'candidate',
            relatedId: application._id,
            createdBy: job.employerId,
            candidateId: req.user._id
          });
        }
      } catch (notifError) {
        console.error('Notification creation failed:', notifError);
      }
    }

    // If we just hit the limit, mark job as closed
    const updatedJob = await Job.findById(jobId).select('applicationCount applicationLimit status');
    if (
      updatedJob &&
      typeof updatedJob.applicationLimit === 'number' &&
      updatedJob.applicationLimit > 0 &&
      updatedJob.applicationCount >= updatedJob.applicationLimit &&
      updatedJob.status !== 'closed'
    ) {
      await Job.findByIdAndUpdate(jobId, { status: 'closed' });
    }

    res.status(201).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAppliedJobs = async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id })
      .populate('jobId', 'title location jobType status interviewRoundsCount interviewRoundTypes')
      .populate('employerId', 'companyName')
      .sort({ createdAt: -1 });

    console.log('Applications found:', applications.length);
    if (applications.length > 0) {
      console.log('First application jobId:', applications[0].jobId);
      console.log('Job interviewRoundTypes:', applications[0].jobId?.interviewRoundTypes);
      console.log('Interview rounds data:', applications[0].interviewRounds);
    }

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Application Status Controller
exports.getApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.applicationId,
      candidateId: req.user._id
    })
    .populate('jobId', 'title interviewRoundsCount interviewRoundTypes')
    .populate('employerId', 'companyName');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Message Controllers
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const conversationId = [req.user._id, receiverId].sort().join('-');
    
    const newMessage = await Message.create({
      senderId: req.user._id,
      senderModel: 'Candidate',
      receiverId,
      receiverModel: 'Employer',
      message,
      conversationId
    });

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name')
      .populate('receiverId', 'name companyName')
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Password Management Controllers
exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const candidate = await Candidate.findOne({ email });
    
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const resetToken = require('crypto').randomBytes(32).toString('hex');
    candidate.resetPasswordToken = resetToken;
    candidate.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await candidate.save();

    const { sendResetEmail } = require('../utils/emailService');
    await sendResetEmail(email, resetToken, 'candidate');

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.confirmResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const candidate = await Candidate.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!candidate) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    candidate.password = newPassword;
    candidate.resetPasswordToken = undefined;
    candidate.resetPasswordExpires = undefined;
    await candidate.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const candidate = await Candidate.findById(req.user._id);
    
    if (!(await candidate.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // For placement candidates, change registration method to 'signup' so password gets hashed
    if (candidate.registrationMethod === 'placement') {
      console.log('🔄 Converting placement candidate to signup method for password hashing');
      candidate.registrationMethod = 'signup';
    }
    
    candidate.password = newPassword;
    await candidate.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePasswordReset = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    console.log('🔄 Password reset request for:', email);
    console.log('🔑 New password provided:', !!newPassword, 'Length:', newPassword?.length);
    
    if (!email || !newPassword) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ success: false, message: 'Email and new password are required' });
    }

    const candidate = await Candidate.findOne({ email });
    if (!candidate) {
      console.log('❌ Candidate not found for email:', email);
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    console.log('✅ Found candidate:', candidate.email);
    console.log('📝 Registration method:', candidate.registrationMethod);
    console.log('🔐 Old password length:', candidate.password ? candidate.password.length : 0);
    console.log('🔐 Old password is hashed:', candidate.password ? candidate.password.startsWith('$2') : false);
    
    // For placement candidates, change to signup method so password gets hashed
    if (candidate.registrationMethod === 'placement') {
      console.log('🔄 Converting placement candidate to signup method for password hashing');
      candidate.registrationMethod = 'signup';
    }
    
    candidate.password = newPassword;
    candidate.markModified('password');
    await candidate.save();
    
    console.log('✅ Password updated successfully');
    console.log('🔑 New password length:', candidate.password ? candidate.password.length : 0);
    console.log('🔑 New password is hashed:', candidate.password ? candidate.password.startsWith('$2') : false);
    console.log('💾 Database save completed');

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const candidateId = req.user._id;
    
    const applied = await Application.countDocuments({ candidateId });
    const inProgress = await Application.countDocuments({ candidateId, status: { $in: ['pending', 'interviewed'] } });
    const shortlisted = await Application.countDocuments({ candidateId, status: 'shortlisted' });
    
    const recentApplications = await Application.find({ candidateId })
      .populate('jobId', 'title location')
      .populate('employerId', 'companyName')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      stats: { applied, inProgress, shortlisted },
      recentApplications,
      candidate: { 
        name: req.user.name,
        credits: req.user.credits || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const candidateId = req.user._id;
    
    const applied = await Application.countDocuments({ candidateId });
    const inProgress = await Application.countDocuments({ candidateId, status: { $in: ['pending', 'interviewed'] } });
    const shortlisted = await Application.countDocuments({ candidateId, status: 'shortlisted' });
    
    const candidate = await Candidate.findById(candidateId)
      .select('name email credits registrationMethod placementId course')
      .populate('placementId', 'name collegeName');
    
    res.json({
      success: true,
      stats: { applied, inProgress, shortlisted },
      candidate: { 
        name: candidate.name,
        credits: candidate.credits || 0,
        registrationMethod: candidate.registrationMethod || 'signup',
        placement: candidate.placementId ? {
          name: candidate.placementId.name,
          collegeName: candidate.placementId.collegeName
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCandidateApplicationsWithInterviews = async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id })
      .populate('jobId', 'title location jobType status interviewRoundsCount interviewRoundTypes interviewRoundDetails')
      .populate('employerId', 'companyName')
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get candidate's complete profile including Excel data
exports.getCandidateCompleteProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user._id)
      .select('name email phone course credits registrationMethod placementId fileId')
      .populate('placementId', 'name collegeName');
    
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const profile = await CandidateProfile.findOne({ candidateId: req.user._id });
    
    // If candidate was created from placement Excel, get additional data
    let excelData = null;
    if (candidate.registrationMethod === 'placement' && candidate.placementId && candidate.fileId) {
      try {
        const Placement = require('../models/Placement');
        const placement = await Placement.findById(candidate.placementId);
        if (placement && placement.fileHistory) {
          const file = placement.fileHistory.id(candidate.fileId);
          if (file && file.fileData) {
            // Parse Excel data to get original candidate information
            const XLSX = require('xlsx');
            const { base64ToBuffer } = require('../utils/base64Helper');
            
            const result = base64ToBuffer(file.fileData);
            const buffer = result.buffer;
            
            let workbook;
            if (file.fileType && file.fileType.includes('csv')) {
              const csvData = buffer.toString('utf8');
              workbook = XLSX.read(csvData, { type: 'string' });
            } else {
              workbook = XLSX.read(buffer, { type: 'buffer' });
            }
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            // Find this candidate's row in the Excel data
            const candidateRow = jsonData.find(row => {
              const rowEmail = row.Email || row.email || row.EMAIL;
              return rowEmail && rowEmail.toLowerCase() === candidate.email.toLowerCase();
            });
            
            if (candidateRow) {
              excelData = {
                id: candidateRow.ID || candidateRow.id || candidateRow.Id || '',
                originalName: candidateRow['Candidate Name'] || candidateRow['candidate name'] || candidateRow['CANDIDATE NAME'] || candidateRow.Name || candidateRow.name || candidateRow.NAME,
                collegeName: candidateRow['College Name'] || candidateRow['college name'] || candidateRow['COLLEGE NAME'] || candidateRow.College || candidateRow.college || candidateRow.COLLEGE,
                course: candidateRow.Course || candidateRow.course || candidateRow.COURSE || candidateRow.Branch || candidateRow.branch || candidateRow.BRANCH,
                originalCredits: parseInt(candidateRow['Credits Assigned'] || candidateRow['credits assigned'] || candidateRow['CREDITS ASSIGNED'] || candidateRow.Credits || candidateRow.credits || candidateRow.CREDITS || 0)
              };
            }
          }
        }
      } catch (excelError) {
        console.error('Error parsing Excel data for candidate:', excelError);
      }
    }
    
    res.json({
      success: true,
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        course: candidate.course,
        credits: candidate.credits,
        registrationMethod: candidate.registrationMethod,
        placement: candidate.placementId ? {
          name: candidate.placementId.name,
          collegeName: candidate.placementId.collegeName
        } : null
      },
      profile,
      excelData
    });
  } catch (error) {
    console.error('Error getting complete candidate profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get recommended jobs based on candidate skills
exports.getRecommendedJobs = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ candidateId: req.user._id });
    
    if (!profile || !profile.skills || profile.skills.length === 0) {
      return res.json({ success: true, jobs: [] });
    }

    // Get active jobs that match candidate skills
    const jobs = await Job.find({
      status: 'active',
      requiredSkills: { $in: profile.skills }
    })
    .populate('employerId', 'companyName')
    .sort({ createdAt: -1 })
    .limit(10);

    // Calculate skill match score for each job
    const jobsWithScore = jobs.map(job => {
      const jobObj = job.toObject();
      const matchingSkills = job.requiredSkills.filter(skill => 
        profile.skills.includes(skill)
      );
      const matchScore = Math.round((matchingSkills.length / job.requiredSkills.length) * 100);
      
      return {
        ...jobObj,
        matchingSkills,
        matchScore
      };
    });

    // Sort by match score (highest first)
    jobsWithScore.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, jobs: jobsWithScore });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Education Management Controllers
exports.addEducation = async (req, res) => {
  try {
    const { schoolName, location, passoutYear, percentage, cgpa, sgpa, grade } = req.body;
    
    if (!schoolName || !location || !passoutYear || !percentage) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    let marksheetBase64 = null;
    if (req.file) {
      const { fileToBase64 } = require('../middlewares/upload');
      marksheetBase64 = fileToBase64(req.file);
    }

    const educationData = {
      degreeName: schoolName,
      collegeName: location,
      passYear: passoutYear,
      percentage,
      cgpa,
      sgpa,
      grade,
      marksheet: marksheetBase64
    };

    const profile = await CandidateProfile.findOneAndUpdate(
      { candidateId: req.user._id },
      { $push: { education: educationData } },
      { new: true, upsert: true }
    );

    res.json({ success: true, education: educationData, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteEducation = async (req, res) => {
  try {
    const { educationId } = req.params;

    const profile = await CandidateProfile.findOneAndUpdate(
      { candidateId: req.user._id },
      { $pull: { education: { _id: educationId } } },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};