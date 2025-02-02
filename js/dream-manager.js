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
                importance: 1,
                created: new Date().toISOString()
            };
            
            this.dreams.push(dream);
            this.saveDreams();
            this.renderDreams();
            input.value = '';
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
                    subItems: []
                };
                dream.subItems.push(subItem);
                this.saveDreams();
                this.renderDreams();
            }
        }
    }

    updateDreamStatus(dreamId, status) {
        const dream = this.dreams.find(d => d.id === dreamId);
        if (dream) {
            dream.status = status;
            this.saveDreams();
            this.renderDreams();
        }
    }

    updateImportance(dreamId, importance) {
        const dream = this.dreams.find(d => d.id === dreamId);
        if (dream) {
            dream.importance = parseInt(importance);
            this.saveDreams();
            this.renderDreams();
        }
    }

    saveDreams() {
        localStorage.setItem('dreams', JSON.stringify(this.dreams));
    }

    renderDreams() {
        const lists = {
            dreaming: document.getElementById('dreamingList'),
            planning: document.getElementById('planningList'),
            achieved: document.getElementById('achievedList')
        };

        Object.values(lists).forEach(list => list.innerHTML = '');

        // Sort dreams by importance
        this.dreams.sort((a, b) => b.importance - a.importance);

        this.dreams.forEach(dream => {
            const dreamElement = this.createDreamElement(dream);
            lists[dream.status].appendChild(dreamElement);
        });
    }

    createDreamElement(dream) {
        const div = document.createElement('div');
        div.className = 'dream-item bg-white p-4 rounded shadow';
        div.innerHTML = `
            <div class="dream-content">
                <div class="flex justify-between items-start mb-3">
                    <span class="font-semibold text-purple-700">${dream.text}</span>
                    <select class="text-sm border rounded" 
                            onchange="dreamManager.updateImportance(${dream.id}, this.value)">
                        ${[1, 2, 3, 4, 5].map(num => 
                            `<option value="${num}" ${dream.importance === num ? 'selected' : ''}>
                                Priority ${num}
                            </option>`
                        ).join('')}
                    </select>
                </div>
                <div class="flex gap-2">
                    <button onclick="dreamManager.addSubItem(${dream.id})"
                            class="text-sm bg-purple-100 text-purple-600 px-3 py-1 rounded hover:bg-purple-200">
                        Add Sub-item
                    </button>
                    <select class="text-sm border rounded" 
                            onchange="dreamManager.updateDreamStatus(${dream.id}, this.value)">
                        <option value="dreaming" ${dream.status === 'dreaming' ? 'selected' : ''}>Dreaming</option>
                        <option value="planning" ${dream.status === 'planning' ? 'selected' : ''}>Planning</option>
                        <option value="achieved" ${dream.status === 'achieved' ? 'selected' : ''}>Achieved</option>
                    </select>
                </div>
            </div>
            ${dream.subItems.length > 0 ? `
                <div class="sub-items mt-3 pl-4 border-l-2 border-purple-200">
                    ${dream.subItems.map(subItem => `
                        <div class="sub-item-content text-sm text-gray-600 py-1">
                            ↳ ${subItem.text}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
        return div;
    }
}

const dreamManager = new DreamManager(); 