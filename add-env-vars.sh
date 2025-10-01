#!/bin/bash

echo "Adding Supabase environment variables to Vercel..."

# Add SUPABASE_QUIZ_URL
echo "https://jqjftrlnyysqcwbbigpw.supabase.co" | vercel env add SUPABASE_QUIZ_URL

# Add SUPABASE_QUIZ_ANON_KEY  
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxamZ0cmxueXlzcWN3YmJpZ3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTQ2MzksImV4cCI6MjA2Njg3MDYzOX0.ZqgLIflQJY5zC3ZnU5K9k_KEM9bDdNhtq3ek6ckuwjAo" | vercel env add SUPABASE_QUIZ_ANON_KEY

# Add SUPABASE_QUIZ_SERVICE_ROLE_KEY
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxamZ0cmxueXlzcWN3YmJpZ3B3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTI5NDYzOSwiZXhwIjoyMDY2ODcwNjM5fQ.-PkMYXKDjL-7sINBFJt6GoF7TOzq_Py-VWX03rFYRjI" | vercel env add SUPABASE_QUIZ_SERVICE_ROLE_KEY

echo "Environment variables added successfully!"
