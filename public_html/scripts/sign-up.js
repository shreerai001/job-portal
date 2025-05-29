document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('signupForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const userType = document.getElementById('userType');

        let isValid = true;

        // Clear previous error messages
        document.getElementById('firstNameError').textContent = '';
        document.getElementById('lastNameError').textContent = '';
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        document.getElementById('userTypeError').textContent = '';

        // Validate first name
        if (!firstName.value.trim()) {
            isValid = false;
            document.getElementById('firstNameError').textContent = 'First name is required.';
        }
        // Validate last name
        if (!lastName.value.trim()) {
            isValid = false;
            document.getElementById('lastNameError').textContent = 'Last name is required.';
        }

        // Validate email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
            isValid = false;
            document.getElementById('emailError').textContent = 'Email is required.';
        } else if (!emailPattern.test(email.value)) {
            isValid = false;
            document.getElementById('emailError').textContent = 'Please enter a valid email address.';
        }

        // Validate password
        if (!password.value.trim()) {
            isValid = false;
            document.getElementById('passwordError').textContent = 'Password is required.';
        }

        // Validate user type
        if (!userType.value) {
            isValid = false;
            document.getElementById('userTypeError').textContent = 'Please select a user type.';
        }

        if (isValid) {
            // Send signup data to backend
            fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: firstName.value.trim(),
                    lastName: lastName.value.trim(),
                    email: email.value.trim(),
                    password: password.value.trim(),
                    userType: userType.value
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert('Sign up successful! Redirecting to login...');
                        window.location.href = 'login.html';
                    } else {
                        if (data.message && data.message.includes('Email already registered')) {
                            document.getElementById('emailError').textContent = data.message;
                        } else {
                            alert(data.message || 'Signup failed.');
                        }
                    }
                })
                .catch(() => {
                    alert('Server error. Please try again later.');
                });
        }
    });
});