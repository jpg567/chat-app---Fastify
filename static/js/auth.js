// Get the buttons and containers
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginContainer = document.querySelector('.login-container');
const signupContainer = document.querySelector('.signup-container');

// Show login form on login button click
loginBtn.addEventListener('click', () => {
    loginContainer.style.display = 'block';
    signupContainer.style.display = 'none';
});

// Show signup form on signup button click
signupBtn.addEventListener('click', () => {
    signupContainer.style.display = 'block';
    loginContainer.style.display = 'none';
});

const signupSubmit = document.getElementById('signup');
signupSubmit.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const name = document.getElementById('newName').value; // Get the value
    const username = document.getElementById('newUsername').value; // Get the value
    const password = document.getElementById('newPassword').value; // Get the value

    try {
        const response = await fetch('/api/users/add-user', {
            method: 'POST', // Use POST method
            headers: {
                'Content-Type': 'application/json' // Set the content type
            },
            body: JSON.stringify({ name, username, password }) // Send the data as JSON
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json(); // Parse the JSON response
        console.log(data); // Handle the response data as needed
        window.location.href = '/'; 
    } catch (error) {
        console.error('Error:', error); // Handle errors
    }
});

const loginSubmit = document.getElementById('login');
loginSubmit.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Login failed');
        }

        const data = await response.json();
        console.log(data);

        window.location.href = '/'; 
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
});
