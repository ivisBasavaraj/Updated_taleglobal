// Quick production health check
fetch('https://taleglobal.cloud/health')
  .then(res => {
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    return res.text();
  })
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err.message));