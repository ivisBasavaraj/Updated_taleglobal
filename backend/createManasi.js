const mongoose = require('mongoose');
const Placement = require('./models/Placement');
const XLSX = require('xlsx');

mongoose.connect('mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createManasi() {
  try {
    const studentData = [
      {
        'ID': 1,
        'Candidate Name': 'Rahul Sharma',
        'College Name': 'KLE Technologies',
        'Email': 'rahul.sharma@kle.edu',
        'Phone': '9876543210',
        'Course': 'Computer Science',
        'Password': 'rahul123',
        'Credits Assigned': 5
      },
      {
        'ID': 2,
        'Candidate Name': 'Priya Patel',
        'College Name': 'KLE Technologies',
        'Email': 'priya.patel@kle.edu',
        'Phone': '9876543211',
        'Course': 'Information Technology',
        'Password': 'priya456',
        'Credits Assigned': 5
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(studentData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const base64Data = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelBuffer.toString('base64')}`;
    
    const placement = await Placement.create({
      name: 'Manasi Byali',
      email: 'manasiabyali2300@gmail.com',
      password: 'manasi123',
      phone: '9876543200',
      collegeName: 'KLE Technologies',
      status: 'active',
      fileHistory: [
        {
          fileName: 'kle_students.xlsx',
          uploadedAt: new Date(),
          status: 'pending',
          fileData: base64Data,
          fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          credits: 5
        }
      ]
    });
    
    console.log('Manasi Byali created successfully!');
    console.log('Placement ID:', placement._id);
    console.log('File ID:', placement.fileHistory[0]._id);
    console.log('Navigate to: /admin/placement-details/' + placement._id);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createManasi();