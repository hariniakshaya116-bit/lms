// Sample JavaScript function for enrollment
function enroll(courseTitle) {
    // Redirect to course content page after enrollment
    window.location.href = `course-content.html?course=${encodeURIComponent(courseTitle)}`;
  }
  
  // Sample JavaScript function for course creation form submission
  document.getElementById('courseForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevents the default form submission
    
    // Here you can add functionality to handle the form submission (e.g., send data to a server)
    const courseTitle = document.getElementById('courseTitle').value;
    const courseDescription = document.getElementById('courseDescription').value;
    
    // For demonstration, simply log the values to console
    console.log(`Course Title: ${courseTitle}`);
    console.log(`Course Description: ${courseDescription}`);
  });
  