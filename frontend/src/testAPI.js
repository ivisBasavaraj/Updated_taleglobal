// Simple test to check if the API is accessible from the frontend
fetch('http://localhost:5000/api/public/jobs')
  .then(response => response.json())
  .then(data => {
    
    
    
    
    
    if (data.jobs && data.jobs.length > 0) {
      
      data.jobs.slice(0, 3).forEach((job, index) => {
        
      });
    }
  })
  .catch(error => {
    
  });
