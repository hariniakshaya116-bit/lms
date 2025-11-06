document.addEventListener("DOMContentLoaded", async () => {
  const dynamicCoursesSection = document.querySelector(".dynamic-courses");
  const statusMsg = document.getElementById("status-msg");

  const API_BASE = "https://vc3atpev41.execute-api.us-east-1.amazonaws.com/prod/courses";

  try {
    console.log("Fetching course list from:", API_BASE);
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error("Failed to fetch courses");

    const data = await response.json();
    console.log("Raw API response:", data);

    // ✅ Handle both direct array and wrapped body
    const courses = Array.isArray(data)
      ? data
      : Array.isArray(JSON.parse(data.body || "[]"))
      ? JSON.parse(data.body)
      : [];

    statusMsg.style.display = "none";

    if (!courses || courses.length === 0) {
      const msg = document.createElement("p");
      msg.textContent = "No uploaded courses yet.";
      dynamicCoursesSection.appendChild(msg);
      return;
    }

    // ✅ Generate course cards dynamically
    courses.forEach(course => {
      const card = document.createElement("div");
      card.className = "card";

      const courseTitle = course.title || course.course_name || "Untitled Course";
      const courseDescription = course.description || "No description available";
      const courseId = course.course_id || course.id;

      card.innerHTML = `
        <h2>${courseTitle}</h2>
        <p>${courseDescription}</p>
        <a href="course-content-new.html?courseId=${encodeURIComponent(courseId)}" class="button">Start</a>
      `;

      dynamicCoursesSection.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading courses:", error);
    statusMsg.textContent = "Failed to load courses.";
  }
});
