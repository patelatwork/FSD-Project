document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
        });
    });

    // Trainer approval functionality
    const approveBtns = document.querySelectorAll('.approve-btn');
    const rejectBtns = document.querySelectorAll('.reject-btn');

    approveBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.trainer-card');
            card.style.opacity = '0.5';
            setTimeout(() => card.remove(), 500);
        });
    });

    rejectBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.trainer-card');
            card.style.opacity = '0.5';
            setTimeout(() => card.remove(), 500);
        });
    });
});