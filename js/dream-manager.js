class DreamManager {
    constructor() {
        this.dreams = JSON.parse(localStorage.getItem('dreams')) || [];
        this.init();
    }

    init() {
        this.renderDreams();
        document.getElementById('dreamInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addDream();
        });
    }

    addDream() {
        const input = document.getElementById('dreamInput');
        const dreamText = input.value.trim();
        
        if (dreamText) {
            const dream = {
                id: Date.now(),
                text: dreamText,
                status: 'dreaming',
                subItems: [],
                order: this.dreams.length,
                created: new Date().toISOString()
            };
            
            this.dreams.push(dream);
            this.saveDreams();
            this.renderDreams();
            input.value = '';
        }
    }

    moveDream(dreamId, direction) {
        const dreamIndex = this.dreams.findIndex(d => d.id === dreamId);
        if (dreamIndex === -1) return;

        const newIndex = direction === 'up' ? dreamIndex - 1 : dreamIndex + 1;
        if (newIndex >= 0 && newIndex < this.dreams.length) {
            const temp = this.dreams[dreamIndex];
            this.dreams[dreamIndex] = this.dreams[newIndex];
            this.dreams[newIndex] = temp;
            
            // Update order properties
            this.dreams.forEach((dream, index) => {
                dream.order = index;
            });
            
            this.saveDreams();
            this.renderDreams();
        }
    }

    addSubItem(parentId) {
        const dream = this.dreams.find(d => d.id === parentId);
        if (dream) {
            const subItemText = prompt('Enter dream sub-item:');
            if (subItemText) {
                const subItem = {
                    id: Date.now(),
                    text: subItemText,
                    status: 'dreaming',
                    order: dream.subItems.length,
                    created: new Date().toISOString()
                };
                dream.subItems.push(subItem);
                this.saveDreams();
                this.renderDreams();
            }
        }
    }

    moveSubItem(dreamId, subItemId, direction) {
        const dream = this.dreams.find(d => d.id === dreamId);
        if (!dream) return;

        const subItemIndex = dream.subItems.findIndex(item => item.id === subItemId);
        if (subItemIndex === -1) return;

        const newIndex = direction === 'up' ? subItemIndex - 1 : subItemIndex + 1;
        if (newIndex >= 0 && newIndex < dream.subItems.length) {
            const temp = dream.subItems[subItemIndex];
            dream.subItems[subItemIndex] = dream.subItems[newIndex];
            dream.subItems[newIndex] = temp;
            
            dream.subItems.forEach((item, index) => {
                item.order = index;
            });
            
            this.saveDreams();
            this.renderDreams();
        }
    }

    updateDreamStatus(dreamId, status) {
        const dream = this.dreams.find(d => d.id === dreamId);
        if (dream) {
            const oldStatus = dream.status;
            dream.status = status;
            
            // If moving to achieved status, set achieved timestamp
            if (status === 'achieved') {
                dream.achievedAt = new Date().toISOString();
            } else {
                delete dream.achievedAt;
            }
            
            this.saveDreams();
            this.renderDreams();
        }
    }

    saveDreams() {
        localStorage.setItem('dreams', JSON.stringify(this.dreams));
    }

    discardDream(dreamId) {
        if (confirm('Are you sure you want to discard this dream?')) {
            this.dreams = this.dreams.filter(d => d.id !== dreamId);
            this.saveDreams();
            this.renderDreams();
        }
    }

    discardSubItem(dreamId, subItemId) {
        const dream = this.dreams.find(d => d.id === dreamId);
        if (dream && confirm('Are you sure you want to discard this sub-dream?')) {
            dream.subItems = dream.subItems.filter(item => item.id !== subItemId);
            this.saveDreams();
            this.renderDreams();
        }
    }

    addToOrganizer(text, type = 'task') {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const newTask = {
            id: Date.now(),
            text: text,
            status: 'todo',
            created: new Date().toISOString(),
            source: 'dream'
        };
        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        alert('Added to your organizer!');
    }

    renderDreams() {
        const activeDreamsList = document.getElementById('activeDreamsList');
        const achievedDreamsList = document.getElementById('achievedDreamsList');

        activeDreamsList.innerHTML = '';
        achievedDreamsList.innerHTML = '';

        // Split and sort dreams
        const activeDreams = this.dreams
            .filter(d => d.status !== 'achieved')
            .sort((a, b) => a.order - b.order);

        const achievedDreams = this.dreams
            .filter(d => d.status === 'achieved')
            .sort((a, b) => new Date(b.achievedAt) - new Date(a.achievedAt));

        // Render active dreams
        activeDreams.forEach((dream, index) => {
            const dreamElement = this.createDreamElement(dream, index, activeDreams.length);
            activeDreamsList.appendChild(dreamElement);
        });

        // Render achieved dreams
        achievedDreams.forEach(dream => {
            const dreamElement = this.createDreamElement(dream, null, null, true);
            achievedDreamsList.appendChild(dreamElement);
        });
    }

    createDreamElement(dream, index, totalDreams, isAchieved = false) {
        const div = document.createElement('div');
        div.className = `dream-item bg-purple-50 p-4 rounded shadow ${isAchieved ? 'border-l-4 border-green-500' : ''}`;
        
        const achievedDate = dream.achievedAt ? new Date(dream.achievedAt).toLocaleDateString() : '';
        
        div.innerHTML = `
            <div class="dream-content">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-2">
                        <span class="font-semibold ${isAchieved ? 'text-gray-500' : 'text-purple-700'}">${dream.text}</span>
                        ${!isAchieved ? `
                            <div class="flex gap-1">
                                ${index > 0 ? `
                                    <button onclick="dreamManager.moveDream(${dream.id}, 'up')"
                                            class="text-purple-600 hover:text-purple-700 px-1">↑</button>
                                ` : ''}
                                ${index < totalDreams - 1 ? `
                                    <button onclick="dreamManager.moveDream(${dream.id}, 'down')"
                                            class="text-purple-600 hover:text-purple-700 px-1">↓</button>
                                ` : ''}
                            </div>
                        ` : `
                            <span class="text-sm text-gray-500">(Achieved: ${achievedDate})</span>
                        `}
                    </div>
                    ${!isAchieved ? `
                        <div class="relative">
                            <button onclick="dreamManager.toggleDreamMenu(${dream.id})"
                                    class="text-gray-600 hover:text-gray-800 px-2 py-1 rounded">
                                ...
                            </button>
                            <div id="dreamMenu-${dream.id}" 
                                 class="hidden absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                                <button onclick="dreamManager.addToOrganizer('${dream.text.replace(/'/g, "\\'")}')"
                                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">
                                    Add to Organizer
                                </button>
                                <button onclick="dreamManager.modifyDream(${dream.id})"
                                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">
                                    Modify
                                </button>
                                <button onclick="dreamManager.discardDream(${dream.id})"
                                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">
                                    Discard
                                </button>
                                <button onclick="dreamManager.updateDreamStatus(${dream.id}, 'achieved')"
                                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">
                                    Mark as Achieved
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>
                ${!isAchieved ? `
                    <div class="flex gap-2">
                        <button onclick="dreamManager.addSubItem(${dream.id})"
                                class="text-sm bg-purple-100 text-purple-600 px-3 py-1 rounded hover:bg-purple-200">
                            Add Sub-dream
                        </button>
                    </div>
                ` : ''}
            </div>
            ${dream.subItems.length > 0 ? `
                <div class="sub-items mt-3 pl-4 border-l-2 border-purple-200">
                    ${dream.subItems.map((subItem, index) => `
                        <div class="sub-item-content flex items-center justify-between text-sm ${isAchieved ? 'text-gray-500' : 'text-gray-600'} py-1">
                            <span>↳ ${subItem.text}</span>
                            ${!isAchieved ? `
                                <div class="flex items-center gap-2">
                                    <div class="relative">
                                        <button onclick="dreamManager.toggleSubItemMenu(${dream.id}, ${subItem.id})"
                                                class="text-gray-600 hover:text-gray-800 px-2 py-1 rounded">
                                            ...
                                        </button>
                                        <div id="subItemMenu-${dream.id}-${subItem.id}" 
                                             class="hidden absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                                            <button onclick="dreamManager.addToOrganizer('${subItem.text.replace(/'/g, "\\'")}')"
                                                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">
                                                Add to Organizer
                                            </button>
                                            <button onclick="dreamManager.modifySubItem(${dream.id}, ${subItem.id})"
                                                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">
                                                Modify
                                            </button>
                                            <button onclick="dreamManager.discardSubItem(${dream.id}, ${subItem.id})"
                                                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">
                                                Discard
                                            </button>
                                        </div>
                                    </div>
                                    <div class="flex gap-1">
                                        ${index > 0 ? `
                                            <button onclick="dreamManager.moveSubItem(${dream.id}, ${subItem.id}, 'up')"
                                                    class="text-purple-600 hover:text-purple-700 px-1">↑</button>
                                        ` : ''}
                                        ${index < dream.subItems.length - 1 ? `
                                            <button onclick="dreamManager.moveSubItem(${dream.id}, ${subItem.id}, 'down')"
                                                    class="text-purple-600 hover:text-purple-700 px-1">↓</button>
                                        ` : ''}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;

        // Add click event listener to close menus when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.relative')) {
                document.querySelectorAll('[id^="dreamMenu-"], [id^="subItemMenu-"]').forEach(menu => {
                    menu.classList.add('hidden');
                });
            }
        });

        return div;
    }

    toggleDreamMenu(dreamId) {
        const menu = document.getElementById(`dreamMenu-${dreamId}`);
        document.querySelectorAll('[id^="dreamMenu-"], [id^="subItemMenu-"]').forEach(m => {
            if (m !== menu) m.classList.add('hidden');
        });
        menu.classList.toggle('hidden');
    }

    toggleSubItemMenu(dreamId, subItemId) {
        const menu = document.getElementById(`subItemMenu-${dreamId}-${subItemId}`);
        document.querySelectorAll('[id^="dreamMenu-"], [id^="subItemMenu-"]').forEach(m => {
            if (m !== menu) m.classList.add('hidden');
        });
        menu.classList.toggle('hidden');
    }

    modifyDream(dreamId) {
        const dream = this.dreams.find(d => d.id === dreamId);
        if (dream) {
            const newText = prompt('Modify dream:', dream.text);
            if (newText && newText.trim()) {
                dream.text = newText.trim();
                this.saveDreams();
                this.renderDreams();
            }
        }
    }

    modifySubItem(dreamId, subItemId) {
        const dream = this.dreams.find(d => d.id === dreamId);
        if (dream) {
            const subItem = dream.subItems.find(s => s.id === subItemId);
            if (subItem) {
                const newText = prompt('Modify sub-dream:', subItem.text);
                if (newText && newText.trim()) {
                    subItem.text = newText.trim();
                    this.saveDreams();
                    this.renderDreams();
                }
            }
        }
    }
}

const dreamManager = new DreamManager(); 