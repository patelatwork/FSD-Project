document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById("loginForm");
    const roleSelect = document.getElementById("userRole");

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault(); 

        let email = document.getElementById("email").value.trim();
        let password = document.getElementById("password").value.trim();
        let role = roleSelect.value;
        let emailError = document.getElementById("emailError");
        let passwordError = document.getElementById("passwordError");
        let roleError = document.getElementById("roleError");

        let valid = true;

        // Email validation
        if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            emailError.style.display = "block";
            valid = false;
        } else {
            emailError.style.display = "none";
        }

        // Password validation
        if (password.length < 6) {
            passwordError.style.display = "block";
            valid = false;
        } else {
            passwordError.style.display = "none";
        }

        // Role validation
        if (role === "") {
            roleError.style.display = "block";
            valid = false;
        } else {
            roleError.style.display = "none";
        }

        if (valid) {
            // Redirect based on role
            switch(role) {
                case 'user':
                    window.location.href = 'homepage.html';
                    break;
                case 'trainer':
                    window.location.href = "/Templates Trainer/trainer.html";
                    break;
                case 'admin':
                    window.location.href = '/Templates Admin/admin.html';
                    break;
                case 'labpartner':
                    window.location.href = '/Templates LabPartners/lab_part.html';
                    break;
            }
        }
    });
});