// Set up environment variables for Supabase
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://aqicztygjpmunfljjuto.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxaWN6dHlnanBtdW5mbGpqdXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MDU1ODIsImV4cCI6MjA1OTI4MTU4Mn0.5e2hvTckSSbTFLBjQiccrvjoBd6QQDX0X4tccFOc1rs';

// Run the build script
require('child_process').spawn('npm', ['run', 'build-site'], {
  stdio: 'inherit',
  shell: true
});
