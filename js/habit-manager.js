class HabitManager {
    constructor() {
        this.habits = JSON.parse(localStorage.getItem('habits')) || {
            active: [],
            startDate: null,
            tracking: {}
        };
        this.init();
    }

    init() {
        this.renderHabits();
        document.getElementById('habitInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addHabit();
        });
    }

    addHabit() {
        const input = document.getElementById('habitInput');
        const habitText = input.value.trim();
        
        if (habitText && this.habits.active.length < 3) {
            const habit = {
                id: Date.now(),
                text: habitText,
                created: new Date().toISOString()
            };
            
            this.habits.active.push(habit);
            
            if (this.habits.active.length === 1) {
                this.habits.startDate = new Date().toISOString().split('T')[0];
            }
            
            this.saveHabits();
            this.renderHabits();
            input.value = '';
        } else if (this.habits.active.length >= 3) {
            alert('You can only track up to 3 habits at a time');
        }
    }

    removeHabit(habitId) {
        this.habits.active = this.habits.active.filter(h => h.id !== habitId);
        delete this.habits.tracking[habitId];
        
        if (this.habits.active.length === 0) {
            this.habits.startDate = null;
        }
        
        this.saveHabits();
        this.renderHabits();
    }

    toggleHabitCompletion(habitId, date) {
        if (!this.habits.tracking[habitId]) {
            this.habits.tracking[habitId] = {};
        }
        
        this.habits.tracking[habitId][date] = !this.habits.tracking[habitId][date];
        this.saveHabits();
        this.renderHabits();
    }

    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    getDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = [];
        
        for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d).toISOString().split('T')[0]);
        }
        
        return days;
    }

    calculateProgress(habitId) {
        if (!this.habits.startDate) return 0;
        
        const today = new Date().toISOString().split('T')[0];
        const days = this.getDaysBetween(this.habits.startDate, today);
        const completed = days.filter(date => 
            this.habits.tracking[habitId] && this.habits.tracking[habitId][date]
        ).length;
        
        return Math.round((completed / days.length) * 100);
    }

    renderHabits() {
        const activeHabits = document.getElementById('activeHabits');
        const habitTracking = document.getElementById('habitTracking');
        const trackingBody = document.getElementById('habitTrackingBody');
        const progressCharts = document.getElementById('progressCharts');
        
        // Clear existing content
        activeHabits.innerHTML = '';
        trackingBody.innerHTML = '';
        progressCharts.innerHTML = '';

        // Render active habits
        this.habits.active.forEach(habit => {
            const habitElement = document.createElement('div');
            habitElement.className = 'flex justify-between items-center bg-purple-50 p-3 rounded';
            habitElement.innerHTML = `
                <span class="font-semibold text-purple-700">${habit.text}</span>
                <button onclick="habitManager.removeHabit(${habit.id})"
                        class="text-red-600 hover:text-red-700">
                    Remove
                </button>
            `;
            activeHabits.appendChild(habitElement);
        });

        // Show/hide tracking section based on active habits
        if (this.habits.active.length > 0) {
            habitTracking.classList.remove('hidden');
            
            // Render tracking table
            const today = new Date().toISOString().split('T')[0];
            const days = this.getDaysBetween(this.habits.startDate, today).slice(-7); // Show last 7 days
            
            // Update date header
            document.getElementById('dateHeader').innerHTML = days.map(date => 
                `<div class="px-2">${new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>`
            ).join('');
            
            // Render habit rows
            this.habits.active.forEach(habit => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="p-2 font-medium">${habit.text}</td>
                    ${days.map(date => `
                        <td class="text-center p-2">
                            <button onclick="habitManager.toggleHabitCompletion(${habit.id}, '${date}')"
                                    class="w-6 h-6 rounded-full ${this.habits.tracking[habit.id]?.[date] 
                                        ? 'bg-green-500 hover:bg-green-600' 
                                        : 'bg-gray-200 hover:bg-gray-300'}">
                            </button>
                        </td>
                    `).join('')}
                `;
                trackingBody.appendChild(row);
                
                // Render progress chart
                const progress = this.calculateProgress(habit.id);
                const progressElement = document.createElement('div');
                progressElement.className = 'bg-purple-50 p-4 rounded';
                progressElement.innerHTML = `
                    <div class="flex justify-between mb-2">
                        <span class="font-medium">${habit.text}</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div class="bg-purple-600 h-2.5 rounded-full" style="width: ${progress}%"></div>
                    </div>
                `;
                progressCharts.appendChild(progressElement);
            });
        } else {
            habitTracking.classList.add('hidden');
        }
    }
}

const habitManager = new HabitManager(); 