document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    if(signupForm){
        signupForm.addEventListener('submit', handleFormSubmit);
    }
    if(loginForm){
        loginForm.addEventListener('submit', loginFormSubmit);
    }
});

async function handleFormSubmit(event) {
    event.preventDefault();

    const data = {
        name: event.target.username.value,
        email: event.target.email.value,
        password: event.target.password.value,
    };

    try {
        axios.post('http://localhost:3000/api/users/signup', data)
            
        alert('Signup successful! Please log in.');
        window.location.href = '/login.html';
            
            // .catch(error => {
            //     displayError(error.response.data.message || 'Sign-up failed. Please try again.');
            //     console.error('Error during signup:', error);
            //     return;
            // });
         
    } catch (error) {
        console.error('Error during signup:', error);
    }

}

async function loginFormSubmit(event) {
    event.preventDefault();

    const email = event.target.email.value.trim();
    const password = event.target.password.value.trim();

    try {
        const response = await axios.post('http://localhost:3000/api/users/sign-in', {
            email,
            password
        });

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', response.data.user.name);
        
        alert('Login successful! ');
        window.location.href = 'recipes.html';
    } catch (error) {
        displayError(error.response?.data?.message || 'Login failed');
        console.error('Error during login:', error);
    }
}

function displayError(message) {
    const errorDiv = document.getElementById('message');
    errorDiv.textContent = message;
}