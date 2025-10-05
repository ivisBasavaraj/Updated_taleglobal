const mongoose = require('mongoose');
const Placement = require('./models/Placement');
const XLSX = require('xlsx');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createRealisticPlacement() {
  try {
    console.log('=== CREATING REALISTIC PLACEMENT OFFICER WITH EXCEL DATA ===');
    
    // Create sample student data
    const studentData = [
      {
        'ID': 1,
        'Candidate Name': 'John Smith',
        'College Name': 'ABC Engineering College',
        'Email': 'john.smith@student.edu',
        'Phone': '9876543210',
        'Course': 'Computer Science',
        'Password': 'john123',
        'Credits Assigned': 5
      },
      {
        'ID': 2,
        'Candidate Name': 'Jane Doe',
        'College Name': 'ABC Engineering College',
        'Email': 'jane.doe@student.edu',
        'Phone': '9876543211',
        'Course': 'Information Technology',
        'Password': 'jane456',
        'Credits Assigned': 5
      },
      {
        'ID': 3,
        'Candidate Name': 'Mike Johnson',
        'College Name': 'ABC Engineering College',
        'Email': 'mike.johnson@student.edu',
        'Phone': '9876543212',
        'Course': 'Electronics',
        'Password': 'mike789',
        'Credits Assigned': 5
      }
    ];
    
    // Create Excel workbook
    const worksheet = XLSX.utils.json_to_sheet(studentData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    // Convert to buffer and then to base64
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const base64Data = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelBuffer.toString('base64')}`;
    
    // Create placement officer
    const placement = await Placement.create({
      name: 'ABC College Placement Officer',
      email: 'placement@abc.edu',
      password: 'placement123',
      phone: '9876543200',
      collegeName: 'ABC Engineering College',
      status: 'active',
      fileHistory: [
        {
          fileName: 'students_batch_2024.xlsx',
          uploadedAt: new Date(),
          status: 'pending',
          fileData: base64Data,
          fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          credits: 5
        }
      ]
    });
    
    console.log('Realistic placement officer created successfully!');
    console.log(`Placement ID: ${placement._id}`);
    console.log(`Name: ${placement.name}`);
    console.log(`Email: ${placement.email}`);
    console.log(`College: ${placement.collegeName}`);
    console.log(`Files: ${placement.fileHistory.length}`);
    
    if (placement.fileHistory.length > 0) {
      console.log(`File ID: ${placement.fileHistory[0]._id}`);
      console.log(`File Name: ${placement.fileHistory[0].fileName}`);
      console.log(`File Status: ${placement.fileHistory[0].status}`);
      console.log(`File Credits: ${placement.fileHistory[0].credits}`);
      console.log(`File Data Length: ${placement.fileHistory[0].fileData.length} characters`);
    }
    
    console.log('\nYou can now:');
    console.log(`1. Navigate to: /admin/placement-details/${placement._id}`);
    console.log(`2. Click "Process Data" button for the file`);
    console.log(`3. Test the process data functionality`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating realistic placement:', error);
    process.exit(1);
  }
}

createRealisticPlacement();