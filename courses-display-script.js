window.onload = function () {
    const storedCourses = JSON.parse(localStorage.getItem('courses')) || [];
    const courseListSection = document.querySelector('.course-list');

    storedCourses.forEach(course => {
        const courseContainer = document.createElement('div'); // Create a container for each course
        courseContainer.classList.add('course-container'); // Add a class for course containers

        const courseCard = document.createElement('div');
        courseCard.classList.add('card'); // Adding card class

        const title = document.createElement('h2');
        title.textContent = course.title;

        const description = document.createElement('p');
        description.textContent = course.description;

        const enrollLink = document.createElement('a');
        enrollLink.textContent = 'Start';
        enrollLink.setAttribute('href', 'course-content.html');
        enrollLink.setAttribute('onclick', `enroll('${course.title}')`);
        enrollLink.classList.add('button');

        const deleteButton = document.createElement('button'); // Create delete button
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('button', 'delete-button'); // Add 'button' class for styling
        deleteButton.addEventListener('click', function () {
            deleteCourse(course.title); // Call function to delete course on button click
            courseContainer.remove(); // Remove course container from UI
        });

        courseCard.appendChild(title);
        courseCard.appendChild(description);
        courseCard.appendChild(enrollLink);
        courseCard.appendChild(deleteButton); // Append delete button to the course card

        courseContainer.appendChild(courseCard); // Place each course card inside its container
        courseListSection.appendChild(courseContainer); // Append the container to the course list
    });

    function deleteCourse(title) {
        let courses = JSON.parse(localStorage.getItem('courses')) || [];
        courses = courses.filter(course => course.title !== title);
        localStorage.setItem('courses', JSON.stringify(courses));
    }
};
