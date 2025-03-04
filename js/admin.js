class AdminDashboard {
    constructor() {
        this.users = [];
        this.tasks = [];
        this.habits = [];
        this.dreams = [];
        this.activities = [];
        this.init();
    }

    async init() {
        // Check if user is admin
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.isAdmin) {
            alert('Access denied. Only administrators can access this page.');
            window.location.href = '../index.html';
            return;
        }

        await Promise.all([
            this.fetchUsers(),
            this.fetchAllTasks(),
            this.fetchAllHabits(),
            this.fetchAllDreams(),
            this.fetchActivities()
        ]);

        this.renderDashboard();
    }

    async fetchUsers() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch users');
            
            this.users = await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
            this.showError('Failed to load users. Please try refreshing the page.');
        }
    }

    async fetchAllTasks() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/todos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch tasks');
            
            this.tasks = await response.json();
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    async fetchAllHabits() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/habits', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch habits');
            
            this.habits = await response.json();
        } catch (error) {
            console.error('Error fetching habits:', error);
        }
    }

    async fetchAllDreams() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/dreams', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch dreams');
            
            this.dreams = await response.json();
        } catch (error) {
            console.error('Error fetching dreams:', error);
        }
    }

    async fetchActivities() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/activities', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch activities');
            
            this.activities = await response.json();
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    }

    renderDashboard() {
        this.renderStats();
        this.renderUserTable();
        this.renderActivityLog();
        // For now, we'll just show placeholders for charts
        // this.renderCharts();
    }

    renderStats() {
        document.getElementById('totalUsers').textContent = this.users.length;
        
        const activeTasks = this.tasks.filter(task => task.status !== 'completed').length;
        document.getElementById('activeTasks').textContent = activeTasks;
        
        const activeHabits = this.habits.length;
        document.getElementById('activeHabits').textContent = activeHabits;
        
        const activeDreams = this.dreams.filter(dream => dream.status !== 'achieved').length;
        document.getElementById('activeDreams').textContent = activeDreams;
    }

    renderUserTable() {
        const tableBody = document.getElementById('userTable');
        tableBody.innerHTML = '';

        this.users.forEach(user => {
            const userTasks = this.tasks.filter(task => task.userId === user.userId).length;
            const userHabits = this.habits.filter(habit => habit.userId === user.userId).length;
            const userDreams = this.dreams.filter(dream => dream.userId === user.userId).length;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${user.userId}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${user.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${user.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${new Date(user.createdAt).toLocaleDateString()}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ${userTasks}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        ${userHabits}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        ${userDreams}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="adminDashboard.viewUserDetails('${user.userId}')" class="text-indigo-600 hover:text-indigo-900 mr-2">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="adminDashboard.resetUserPassword('${user.userId}')" class="text-yellow-600 hover:text-yellow-900">
                        <i class="fas fa-key"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    renderActivityLog() {
        const activityLogContainer = document.getElementById('activityLog');
        activityLogContainer.innerHTML = '';

        // Sort activities by timestamp, most recent first
        const sortedActivities = [...this.activities].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        // Show the 20 most recent activities
        const recentActivities = sortedActivities.slice(0, 20);

        recentActivities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'p-2 border-l-4 border-purple-400';
            
            const user = this.users.find(u => u.userId === activity.userId);
            const userName = user ? user.name : 'Unknown User';
            
            activityElement.innerHTML = `
                <div class="flex justify-between">
                    <span class="text-sm font-medium text-gray-800">${userName}</span>
                    <span class="text-xs text-gray-500">${new Date(activity.timestamp).toLocaleString()}</span>
                </div>
                <p class="text-sm text-gray-600">${activity.description}</p>
            `;
            
            activityLogContainer.appendChild(activityElement);
        });

        if (recentActivities.length === 0) {
            activityLogContainer.innerHTML = '<p class="text-gray-500 text-center">No recent activity</p>';
        }
    }

    async viewUserDetails(userId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch user details');
            
            const userDetails = await response.json();
            
            // Create modal to display user details
            this.showUserDetailsModal(userDetails);
        } catch (error) {
            console.error('Error fetching user details:', error);
            this.showError('Failed to load user details.');
        }
    }

    showUserDetailsModal(user) {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
        
        // Get user tasks, habits, and dreams
        const userTasks = this.tasks.filter(task => task.userId === user.userId);
        const userHabits = this.habits.filter(habit => habit.userId === user.userId);
        const userDreams = this.dreams.filter(dream => dream.userId === user.userId);
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-purple-600">${user.name}</h2>
                    <button class="text-gray-500 hover:text-gray-700" id="closeModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-2">User Information</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500">Email</p>
                            <p class="text-gray-800">${user.email}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Registered</p>
                            <p class="text-gray-800">${new Date(user.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-2">Tasks (${userTasks.length})</h3>
                    <div class="max-h-40 overflow-y-auto">
                        ${userTasks.length > 0 
                            ? `<ul class="divide-y divide-gray-200">
                                ${userTasks.map(task => `
                                    <li class="py-2">
                                        <div class="flex items-center">
                                            <span class="inline-block w-2 h-2 rounded-full mr-2 ${
                                                task.status === 'completed' ? 'bg-green-500' : 
                                                task.status === 'inProgress' ? 'bg-yellow-500' : 'bg-red-500'
                                            }"></span>
                                            <span class="${task.status === 'completed' ? 'line-through text-gray-400' : ''}">${task.title}</span>
                                        </div>
                                    </li>
                                `).join('')}
                               </ul>` 
                            : '<p class="text-gray-500">No tasks</p>'
                        }
                    </div>
                </div>
                
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-2">Habits (${userHabits.length})</h3>
                    <div class="max-h-40 overflow-y-auto">
                        ${userHabits.length > 0 
                            ? `<ul class="divide-y divide-gray-200">
                                ${userHabits.map(habit => `
                                    <li class="py-2">
                                        <div>
                                            <span class="font-medium">${habit.title}</span>
                                            <span class="text-sm text-gray-500 ml-2">${habit.category}</span>
                                        </div>
                                        <div class="text-sm text-gray-500">
                                            Current streak: ${habit.currentStreak || 0} days
                                        </div>
                                    </li>
                                `).join('')}
                               </ul>` 
                            : '<p class="text-gray-500">No habits</p>'
                        }
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold mb-2">Dreams (${userDreams.length})</h3>
                    <div class="max-h-40 overflow-y-auto">
                        ${userDreams.length > 0 
                            ? `<ul class="divide-y divide-gray-200">
                                ${userDreams.map(dream => `
                                    <li class="py-2">
                                        <div class="flex items-center">
                                            <span class="inline-block w-2 h-2 rounded-full mr-2 ${
                                                dream.status === 'achieved' ? 'bg-green-500' : 'bg-blue-500'
                                            }"></span>
                                            <span class="${dream.status === 'achieved' ? 'text-green-600' : ''}">${dream.title}</span>
                                        </div>
                                    </li>
                                `).join('')}
                               </ul>` 
                            : '<p class="text-gray-500">No dreams</p>'
                        }
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener to close button
        modal.querySelector('#closeModal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    async resetUserPassword(userId) {
        if (!confirm('Are you sure you want to reset this user\'s password?')) {
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Failed to reset password');
            
            const { temporaryPassword } = await response.json();
            
            alert(`Password has been reset. Temporary password: ${temporaryPassword}`);
        } catch (error) {
            console.error('Error resetting password:', error);
            this.showError('Failed to reset password.');
        }
    }

    showError(message) {
        // Create error toast
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md z-50';
        toast.innerHTML = `
            <div class="flex">
                <div class="py-1"><i class="fas fa-exclamation-circle"></i></div>
                <div class="ml-3">
                    <p class="text-sm">${message}</p>
                </div>
                <div class="ml-auto pl-3">
                    <button class="text-red-700 hover:text-red-900" id="closeToast">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Add event listener to close button
        toast.querySelector('#closeToast').addEventListener('click', () => {
            document.body.removeChild(toast);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 5000);
    }
}

function logout() {
    localStorage.clear();
    window.location.href = '../login.html';
}

const adminDashboard = new AdminDashboard(); 