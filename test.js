/* providing token in bearer */
fetch('https://ibos-deploy.vercel.app/verifyToken', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YzA5MTg0YTNhNmY5OTllZTJlY2RmOSIsImVtYWlsIjoiaGFzc2FuYWJkZWxhemltLm1heEBnbWFpbC5jb20iLCJpYXQiOjE3MjQ0NTQ3MjQsImV4cCI6MTcyNDU0MTEyNH0.EpeBArn5LsGxoV_q0fqtnkJDC2gj157JKs26C-vT_6k', 
  }, 
})
.then(res => res.json())
.then(console.log);

