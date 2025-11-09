const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Application = require('../models/Application');
const Job = require('../models/Job');

// Employer: Create Assessment
exports.createAssessment = async (req, res) => {
  try {
    const { title, type, description, instructions, timer, questions } = req.body;
    
    const assessment = new Assessment({
      employerId: req.user.id,
      title,
      type,
      description,
      instructions,
      timer,
      totalQuestions: questions.length,
      questions,
      status: 'published'
    });

    await assessment.save();
    res.status(201).json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer: Get All Assessments
exports.getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ employerId: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ success: true, assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer: Get Assessment Details
exports.getAssessmentDetails = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      employerId: req.user.id
    });
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer: Update Assessment
exports.updateAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOneAndUpdate(
      { _id: req.params.id, employerId: req.user.id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer: Delete Assessment
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOneAndDelete({
      _id: req.params.id,
      employerId: req.user.id
    });
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    res.json({ success: true, message: 'Assessment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Get Available Assessments
exports.getAvailableAssessments = async (req, res) => {
  try {
    const applications = await Application.find({
      candidateId: req.user.id,
      assessmentStatus: 'available'
    }).populate('jobId');
    
    const assessments = [];
    for (const app of applications) {
      if (app.jobId && app.jobId.assessmentId) {
        const assessment = await Assessment.findById(app.jobId.assessmentId)
          .select('-questions.correctAnswer -questions.explanation');
        
        if (assessment) {
          assessments.push({
            ...assessment.toObject(),
            jobTitle: app.jobId.title,
            applicationId: app._id,
            jobId: app.jobId._id
          });
        }
      }
    }
    
    res.json({ success: true, assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Get Assessment for Taking (without answers)
exports.getAssessmentForCandidate = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .select('-questions.correctAnswer -questions.explanation');
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Start Assessment
exports.startAssessment = async (req, res) => {
  try {
    const { assessmentId, jobId, applicationId } = req.body;
    
    // Check if already attempted
    let attempt = await AssessmentAttempt.findOne({
      assessmentId,
      candidateId: req.user.id,
      applicationId
    });
    
    if (attempt && attempt.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Assessment already completed' });
    }
    
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    if (!attempt) {
      attempt = new AssessmentAttempt({
        assessmentId,
        candidateId: req.user.id,
        jobId,
        applicationId,
        totalMarks: assessment.questions.reduce((sum, q) => sum + q.marks, 0)
      });
    }
    
    attempt.status = 'in_progress';
    attempt.startTime = new Date();
    attempt.timeRemaining = assessment.timer * 60;
    attempt.termsAccepted = true;
    attempt.termsAcceptedAt = new Date();
    
    await attempt.save();
    
    // Update application status
    await Application.findByIdAndUpdate(applicationId, {
      assessmentStatus: 'in_progress'
    });
    
    res.json({ success: true, attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Submit Answer
exports.submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionIndex, selectedAnswer, timeSpent } = req.body;
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user.id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Assessment not in progress' });
    }
    
    // Update or add answer
    const existingAnswerIndex = attempt.answers.findIndex(a => a.questionIndex === questionIndex);
    const answerData = {
      questionIndex,
      selectedAnswer,
      timeSpent,
      answeredAt: new Date()
    };
    
    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      attempt.answers.push(answerData);
    }
    
    attempt.currentQuestion = questionIndex + 1;
    await attempt.save();
    
    res.json({ success: true, attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Submit Complete Assessment
exports.submitAssessment = async (req, res) => {
  try {
    const { attemptId, violations } = req.body;
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user.id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    const assessment = await Assessment.findById(attempt.assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    // Calculate score
    let score = 0;
    let correctAnswers = 0;
    
    attempt.answers.forEach(answer => {
      const question = assessment.questions[answer.questionIndex];
      if (question && answer.selectedAnswer === question.correctAnswer) {
        score += question.marks;
        correctAnswers++;
      }
    });
    
    const percentage = (score / attempt.totalMarks) * 100;
    const result = percentage >= assessment.passingPercentage ? 'pass' : 'fail';
    
    attempt.score = score;
    attempt.percentage = percentage;
    attempt.result = result;
    attempt.status = 'completed';
    attempt.endTime = new Date();
    
    if (violations && violations.length > 0) {
      attempt.violations = violations;
    }
    
    await attempt.save();
    
    // Update application
    await Application.findByIdAndUpdate(attempt.applicationId, {
      assessmentStatus: 'completed',
      assessmentScore: score,
      assessmentPercentage: percentage,
      assessmentResult: result
    });
    
    res.json({ 
      success: true, 
      result: {
        score,
        totalMarks: attempt.totalMarks,
        percentage,
        result,
        correctAnswers,
        totalQuestions: assessment.totalQuestions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Get Assessment Result
exports.getAssessmentResult = async (req, res) => {
  try {
    const attempt = await AssessmentAttempt.findOne({
      _id: req.params.attemptId,
      candidateId: req.user.id,
      status: 'completed'
    }).populate('assessmentId');
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    
    res.json({ 
      success: true, 
      result: {
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        result: attempt.result,
        correctAnswers: attempt.answers.filter((a, i) => 
          a.selectedAnswer === attempt.assessmentId.questions[a.questionIndex]?.correctAnswer
        ).length,
        totalQuestions: attempt.assessmentId.totalQuestions,
        violations: attempt.violations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Record Violation
exports.recordViolation = async (req, res) => {
  try {
    const { attemptId, type, details } = req.body;
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user.id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    attempt.violations.push({
      type,
      timestamp: new Date(),
      details
    });
    
    await attempt.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer: Get Assessment Results
exports.getAssessmentResults = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      employerId: req.user.id
    });
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    const results = await AssessmentAttempt.find({
      assessmentId: req.params.id,
      status: 'completed'
    }).populate('candidateId', 'name email phone').sort({ endTime: -1 });
    
    res.json({ success: true, assessment, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer: Get Attempt Details
exports.getAttemptDetails = async (req, res) => {
  try {
    const attempt = await AssessmentAttempt.findById(req.params.attemptId)
      .populate('candidateId', 'name email phone')
      .populate('assessmentId');
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    if (attempt.assessmentId.employerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    res.json({ success: true, attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
