class OrganizerManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.init();
    }

    // ... rest of the existing code, but replace 'todoManager' with 'organizerManager' ...
}

const organizerManager = new OrganizerManager(); 