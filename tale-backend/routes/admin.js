const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const handleValidationErrors = require('../middlewares/validation');
const { checkPermission } = require('../middlewares/permissions');

// Authentication Routes (No auth required)
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], handleValidationErrors, adminController.loginAdmin);

// Protected Routes
router.use(auth(['admin', 'sub-admin']));

// Dashboard Route
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/chart-data', adminController.getChartData);

// User Management Routes
router.get('/users', adminController.getUsers);
router.delete('/users/:userType/:userId', adminController.deleteUser);
router.put('/users/:userType/:userId', adminController.updateUser);

// Job Management Routes
router.get('/jobs', adminController.getAllJobs);
router.delete('/jobs/:id', adminController.deleteJob);
router.put('/jobs/:jobId/approve', adminController.approveJob);
router.put('/jobs/:jobId/reject', adminController.rejectJob);

// Employer Management Routes
router.get('/employers', checkPermission('employers'), adminController.getAllEmployers);
router.get('/employer-profile/:id', checkPermission('employers'), adminController.getEmployerProfile);
router.put('/employer-profile/:id', checkPermission('employers'), adminController.updateEmployerProfile);
router.get('/download-document/:employerId/:documentType', checkPermission('employers'), adminController.downloadDocument);
router.put('/employers/:id/status', checkPermission('employers'), adminController.updateEmployerStatus);
router.delete('/employers/:id', checkPermission('employers'), adminController.deleteEmployer);
router.get('/employer-jobs/:employerId', checkPermission('employers'), adminController.getEmployerJobs);

// Candidate Management Routes
router.get('/candidates', checkPermission('registered_candidates'), adminController.getAllCandidates);
router.get('/registered-candidates', checkPermission('registered_candidates'), adminController.getRegisteredCandidates);
router.get('/candidates/:candidateId', checkPermission('registered_candidates'), adminController.getCandidateDetails);
router.delete('/candidates/:id', checkPermission('registered_candidates'), adminController.deleteCandidate);

// Credit Management Routes
router.put('/candidates/:candidateId/credits', adminController.updateCandidateCredits);
router.put('/candidates/credits/bulk', adminController.bulkUpdateCandidateCredits);

// Content Management Routes
router.post('/content/:type', upload.single('image'), [
  body('title').optional().notEmpty(),
  body('content').optional().notEmpty(),
  body('name').optional().notEmpty()
], handleValidationErrors, adminController.createContent);

router.put('/content/:type/:contentId', upload.single('image'), adminController.updateContent);
router.delete('/content/:type/:contentId', adminController.deleteContent);

// Contact Form Management Routes
router.get('/contacts', adminController.getContactForms);
router.delete('/contacts/:contactId', adminController.deleteContactForm);

// Applications Routes
router.get('/applications', adminController.getApplications);

// Placement Management Routes
router.get('/placements', checkPermission('placement_officers'), adminController.getAllPlacements);
router.get('/placements/:id', checkPermission('placement_officers'), adminController.getPlacementDetails);
router.put('/placements/:id/status', checkPermission('placement_officers'), adminController.updatePlacementStatus);
router.post('/placements/:id/process', checkPermission('placement_officers'), require('../controllers/placementController').processPlacementApproval);
router.get('/placements/:id/download', checkPermission('placement_officers'), adminController.downloadPlacementFile);
router.get('/placements/:id/data', checkPermission('placement_officers'), require('../controllers/placementController').getPlacementData);
router.put('/placements/:id/credits', checkPermission('placement_officers'), adminController.assignPlacementCredits);

// Sub Admin Management Routes (Only for main admins)
router.post('/sub-admins', auth(['admin']), [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('permissions').isArray({ min: 1 }).withMessage('At least one permission is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], handleValidationErrors, adminController.createSubAdmin);

router.get('/sub-admins', auth(['admin']), adminController.getAllSubAdmins);
router.delete('/sub-admins/:id', auth(['admin']), adminController.deleteSubAdmin);

// Site Settings Routes
router.get('/settings', adminController.getSettings);
router.put('/settings', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 }
]), adminController.updateSettings);

module.exports = router;