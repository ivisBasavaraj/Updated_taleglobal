const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const placementController = require('../controllers/placementController');
const handleValidationErrors = require('../middlewares/validation');
const { upload } = require('../middlewares/upload');
const auth = require('../middlewares/auth');

// Registration route without file upload
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('collegeName').notEmpty().withMessage('College name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], handleValidationErrors, placementController.registerPlacement);

// Login route
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], handleValidationErrors, placementController.loginPlacement);

// Get placement officer's student data
router.get('/students', auth(['placement']), placementController.getMyStudents);

// Get placement officer profile
router.get('/profile', auth(['placement']), async (req, res) => {
  try {
    const Placement = require('../models/Placement');
    const placement = await Placement.findById(req.user.id)
      .select('-password')
      .lean();
    
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }
    
    // Add file statistics
    const totalFiles = placement.fileHistory?.length || 0;
    const approvedFiles = placement.fileHistory?.filter(f => f.status === 'approved').length || 0;
    const pendingFiles = placement.fileHistory?.filter(f => f.status === 'pending').length || 0;
    
    res.json({
      success: true,
      placement: {
        ...placement,
        stats: {
          totalFiles,
          approvedFiles,
          pendingFiles
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get placement dashboard stats
router.get('/dashboard', auth(['placement']), placementController.getPlacementDashboard);

// Upload student data file
router.post('/upload-student-data', auth(['placement']), upload.single('studentData'), placementController.uploadStudentData);

// View specific file data
router.get('/files/:fileId/view', auth(['placement']), placementController.viewFileData);

// Get placement data (for placement officers to view their own data)
router.get('/data', auth(['placement']), async (req, res) => {
  try {
    const placementId = req.user.id;
    const placement = await require('../models/Placement').findById(placementId);
    
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    // Get student data from the most recent processed file
    const processedFile = placement.fileHistory?.find(f => f.status === 'processed');
    
    if (!processedFile || !processedFile.fileData) {
      return res.json({ success: true, students: [] });
    }

    // Parse the file data
    const { base64ToBuffer } = require('../utils/base64Helper');
    const XLSX = require('xlsx');
    
    const result = base64ToBuffer(processedFile.fileData);
    const buffer = result.buffer;

    let workbook;
    if (processedFile.fileType && processedFile.fileType.includes('csv')) {
      const csvData = buffer.toString('utf8');
      workbook = XLSX.read(csvData, { type: 'string' });
    } else {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    const students = jsonData.map(row => ({
      id: row.ID || row.id || row.Id || '',
      name: row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['Student Name'] || '',
      collegeName: row['College Name'] || row['college name'] || row['COLLEGE NAME'] || row.College || row.college || row.COLLEGE || '',
      email: row.Email || row.email || row.EMAIL || '',
      phone: row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE || '',
      course: row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH || 'Not Specified',
      password: row.Password || row.password || row.PASSWORD || '',
      credits: parseInt(row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || 0)
    }));
    
    res.json({ success: true, students });
  } catch (error) {
    console.error('Error getting placement data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Save dashboard state
router.post('/save-dashboard-state', auth(['placement']), placementController.saveDashboardState);

// Upload logo
router.post('/upload-logo', auth(['placement']), placementController.uploadLogo);

module.exports = router;