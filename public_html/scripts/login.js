document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('loginForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const userType = document.getElementById('userType').value;

        let hasError = false;

        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        document.getElementById('userTypeError').textContent = '';

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            hasError = true;
            document.getElementById('emailError').textContent = 'Email is required.';
        } else if (!emailPattern.test(email)) {
            hasError = true;
            document.getElementById('emailError').textContent = 'Please enter a valid email address.';
        }

        if (!password) {
            hasError = true;
            document.getElementById('passwordError').textContent = 'Password is required.';
        }

        if (!userType) {
            hasError = true;
            document.getElementById('userTypeError').textContent = 'Please select a user type.';
        }

        if (hasError) return;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, userType })
            });
            const data = await response.json();
            if (data.success) {
                // Save session info in localStorage
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userType', userType);
                localStorage.setItem('userEmail', email);
                if (userType === 'job_employer') {
                    window.location.href = 'components/employer_dashboard.html';
                } else {
                    window.location.href = 'index.html';
                }
            } else {
                document.getElementById('passwordError').textContent = data.message || 'Login failed.';
            }
        } catch (err) {
            document.getElementById('passwordError').textContent = 'Server error. Please try again later.';
        }
    });
});