export class DataManager {
    constructor() {
        this.dbName = 'BarbacoaCalculatorDB';
        this.version = 1;
        this.db = null;
    }
    
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create projects store
                if (!db.objectStoreNames.contains('projects')) {
                    const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
                    projectStore.createIndex('name', 'name', { unique: false });
                    projectStore.createIndex('lastSaved', 'lastSaved', { unique: false });
                }
                
                // Create settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }
    
    async saveProject(project) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['projects'], 'readwrite');
            const store = transaction.objectStore('projects');
            
            const request = store.put({
                ...project,
                lastSaved: new Date().toISOString()
            });
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getProject(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['projects'], 'readonly');
            const store = transaction.objectStore('projects');
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getAllProjects() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['projects'], 'readonly');
            const store = transaction.objectStore('projects');
            const index = store.index('lastSaved');
            const request = index.getAll();
            
            request.onsuccess = () => {
                // Sort by lastSaved descending
                const projects = request.result.sort((a, b) => 
                    new Date(b.lastSaved) - new Date(a.lastSaved)
                );
                resolve(projects);
            };
            request.onerror = () => reject(request.error);
        });
    }
    
    async deleteProject(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['projects'], 'readwrite');
            const store = transaction.objectStore('projects');
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    async getLastProject() {
        const projects = await this.getAllProjects();
        return projects.length > 0 ? projects[0] : null;
    }
    
    async saveSetting(key, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key, value });
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    async getSetting(key, defaultValue = null) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);
            
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : defaultValue);
            };
            request.onerror = () => reject(request.error);
        });
    }
    
    // Backup and restore functionality
    async exportAllData() {
        const projects = await this.getAllProjects();
        const settings = await this.getAllSettings();
        
        return {
            version: this.version,
            exportDate: new Date().toISOString(),
            projects,
            settings
        };
    }
    
    async getAllSettings() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async importData(data) {
        // Clear existing data
        await this.clearAllData();
        
        // Import projects
        if (data.projects) {
            for (const project of data.projects) {
                await this.saveProject(project);
            }
        }
        
        // Import settings
        if (data.settings) {
            for (const setting of data.settings) {
                await this.saveSetting(setting.key, setting.value);
            }
        }
    }
    
    async clearAllData() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['projects', 'settings'], 'readwrite');
            
            const projectStore = transaction.objectStore('projects');
            const settingsStore = transaction.objectStore('settings');
            
            const clearProjects = projectStore.clear();
            const clearSettings = settingsStore.clear();
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }
}