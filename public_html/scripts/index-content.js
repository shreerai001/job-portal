document.addEventListener('DOMContentLoaded', () => {
    const greetingElement = document.createElement('p');
    const currentHour = new Date().getHours();
    let greeting = 'Welcome!';

    if (currentHour < 12) {
        greeting = 'Good Morning!';
    } else if (currentHour < 18) {
        greeting = 'Good Afternoon!';
    } else {
        greeting = 'Good Evening!';
    }

    greetingElement.textContent = greeting;
    greetingElement.className = 'text-center text-primary mt-3';
    document.querySelector('header').appendChild(greetingElement);
});