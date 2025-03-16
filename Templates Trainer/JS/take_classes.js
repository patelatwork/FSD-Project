document.addEventListener('DOMContentLoaded', function() {
    // Initialize Flatpickr Calendar
    const calendar = flatpickr("#calendar", {
        inline: true,
        minDate: "today",
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr) {
            // Handle date selection
            console.log(`Selected date: ${dateStr}`);
        }
    });

    // Handle class scheduling
    const scheduleBtn = document.querySelector('.schedule-btn');
    scheduleBtn.addEventListener('click', scheduleClass);

    // Load upcoming classes
    loadUpcomingClasses();
});

function scheduleClass() {
    const classData = {
        type: document.getElementById('classType').value,
        duration: document.getElementById('classDuration').value,
        level: document.getElementById('classLevel').value,
        maxParticipants: document.getElementById('maxParticipants').value,
        description: document.getElementById('classDescription').value,
        date: document.querySelector('.flatpickr-input').value
    };

    // Validate form
    if (!validateClassData(classData)) {
        return;
    }

    // Add class to upcoming classes
    addClassToGrid(classData);

    // Reset form
    resetForm();

    // Show success message
    showNotification('Class scheduled successfully!');
}

function validateClassData(data) {
    if (!data.type) {
        showNotification('Please select a class type', 'error');
        return false;
    }
    if (!data.date) {
        showNotification('Please select a date', 'error');
        return false;
    }
    return true;
}

function addClassToGrid(classData) {
    const classesGrid = document.querySelector('.classes-grid');
    const classCard = document.createElement('div');
    classCard.className = 'class-card';
    
    classCard.innerHTML = `
        <div class="class-info">
            <div class="class-type">${classData.type}</div>
            <h3 class="class-title">${classData.type} Class - ${formatDate(classData.date)}</h3>
            <div class="class-meta">
                <span class="meta-item">
                    <i class="far fa-clock"></i>
                    ${classData.duration} mins
                </span>
                <span class="meta-item">
                    <i class="fas fa-signal"></i>
                    ${classData.level}
                </span>
                <span class="meta-item">
                    <i class="fas fa-users"></i>
                    ${classData.maxParticipants} spots
                </span>
            </div>
        </div>
    `;

    classesGrid.insertBefore(classCard, classesGrid.firstChild);
}

function loadUpcomingClasses() {
    // Sample data - replace with actual data from your backend
    const upcomingClasses = [
        {
            type: 'HIIT',
            date: '2024-03-20',
            duration: 45,
            level: 'Intermediate',
            maxParticipants: 20
        },
        // Add more sample classes
    ];

    upcomingClasses.forEach(classData => addClassToGrid(classData));
}

function resetForm() {
    document.getElementById('classType').value = '';
    document.getElementById('classDuration').value = '30';
    document.getElementById('classLevel').value = 'beginner';
    document.getElementById('maxParticipants').value = '20';
    document.getElementById('classDescription').value = '';
}

function showNotification(message, type = 'success') {
    // Implement your notification system here
    alert(message);
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}