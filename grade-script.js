function assignGrade() {
    const gradeInput = document.getElementById('gradeInput');
    const grade = parseFloat(gradeInput.value);

    // Perform any necessary validation for the grade value

    // Simulate sending the grade to a server or database (for demonstration purposes)
    console.log(`Assigned grade ${grade} to the student`);

    // Clear the input field after assigning the grade
    gradeInput.value = '';
}
