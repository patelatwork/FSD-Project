document.addEventListener('DOMContentLoaded', function() {
    // Make class cards clickable
    const classCards = document.querySelectorAll('.class-card');
    classCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const classTitle = this.querySelector('.class-title').textContent;
            console.log(`Clicked on class: ${classTitle}`);
            // Add your navigation logic here
        });
    });

    // Make trainer cards clickable
    const trainerCards = document.querySelectorAll('.trainer-card');
    trainerCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const trainerName = this.querySelector('.trainer-name').textContent;
            console.log(`Clicked on trainer: ${trainerName}`);
            // Add your navigation logic here
        });
    });

    // Make view all links hoverable
    const viewAllLinks = document.querySelectorAll('.view-all');
    viewAllLinks.forEach(link => {
        link.style.cursor = 'pointer';
    });

    // Make buttons hoverable
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.style.cursor = 'pointer';
    });
});


