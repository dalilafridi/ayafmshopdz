import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://tsdymklssbphztnrvzom.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImViZmUxMzRmLWYwODYtNDEyZi1iNjhiLTBkMDIyOWMyZjc2NSJ9.eyJwcm9qZWN0SWQiOiJ0c2R5bWtsc3NicGh6dG5ydnpvbSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcxODY5Njc2LCJleHAiOjIwODcyMjk2NzYsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.VVj2eGw41P9DYfZrBpW7Ui6EUZPbsL66VSsIl8i17c0';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };