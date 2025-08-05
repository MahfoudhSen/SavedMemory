// ChatLog Vault - Main Application Logic
class ChatLogVault {
    constructor() {
        this.currentUser = null;
        this.currentChat = null;
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyDarkMode();
        this.checkAuth();
        this.hideLoadingScreen();
    }

    setupEventListeners() {
        // Auth events
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));
        document.getElementById('showSignup').addEventListener('click', () => this.toggleAuthForms());
        document.getElementById('showLogin').addEventListener('click', () => this.toggleAuthForms());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Navigation events
        document.getElementById('newChatBtn').addEventListener('click', () => this.showChatInput());
        document.getElementById('backToDashboardBtn').addEventListener('click', () => this.showDashboard());
        document.getElementById('cancelChatBtn').addEventListener('click', () => this.showDashboard());

        // Chat management events
        document.getElementById('saveChatBtn').addEventListener('click', () => this.saveChat());
        document.getElementById('copyChatBtn').addEventListener('click', () => this.copyChat());
        document.getElementById('editChatBtn').addEventListener('click', () => this.editChat());
        document.getElementById('deleteChatBtn').addEventListener('click', () => this.deleteChat());

        // UI events
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());
        document.getElementById('sidebarToggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('mobileSidebarToggle').addEventListener('click', () => this.toggleSidebar());
    }

    // Authentication Methods
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const hashedPassword = await this.hashPassword(password);
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        
        if (users[email] && users[email].passwordHash === hashedPassword) {
            this.currentUser = email;
            localStorage.setItem('currentUser', email);
            this.showApp();
            this.loadConversations();
            this.showToast('Successfully logged in!', 'success');
        } else {
            this.showToast('Invalid email or password', 'error');
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return;
        }
        
        const hashedPassword = await this.hashPassword(password);
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        
        if (users[email]) {
            this.showToast('User already exists', 'error');
            return;
        }
        
        users[email] = {
            passwordHash: hashedPassword,
            conversations: []
        };
        
        localStorage.setItem('users', JSON.stringify(users));
        this.currentUser = email;
        localStorage.setItem('currentUser', email);
        this.showApp();
        this.loadConversations();
        this.showToast('Account created successfully!', 'success');
    }

    toggleAuthForms() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const showSignupBtn = document.getElementById('showSignup');
        const showLoginBtn = document.getElementById('showLogin');
        
        if (loginForm.classList.contains('hidden')) {
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
            showSignupBtn.style.display = 'block';
            showLoginBtn.style.display = 'none';
        } else {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            showSignupBtn.style.display = 'none';
            showLoginBtn.style.display = 'block';
        }
    }

    checkAuth() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            if (users[currentUser]) {
                this.currentUser = currentUser;
                this.showApp();
                this.loadConversations();
                return;
            }
        }
        this.showAuth();
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showAuth();
        this.showToast('Logged out successfully', 'info');
    }

    // UI Navigation Methods
    showAuth() {
        document.getElementById('authContainer').classList.remove('hidden');
        document.getElementById('appContainer').classList.add('hidden');
    }

    showApp() {
        document.getElementById('authContainer').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
        this.updateUserInfo();
    }

    showDashboard() {
        this.currentChat = null;
        document.getElementById('dashboardView').classList.remove('hidden');
        document.getElementById('chatInputView').classList.add('hidden');
        document.getElementById('chatView').classList.add('hidden');
        document.getElementById('currentTitle').textContent = 'Dashboard';
        this.loadConversations();
    }

    showChatInput() {
        document.getElementById('dashboardView').classList.add('hidden');
        document.getElementById('chatInputView').classList.remove('hidden');
        document.getElementById('chatView').classList.add('hidden');
        document.getElementById('currentTitle').textContent = 'New Chat';
        document.getElementById('chatTitle').value = '';
        document.getElementById('chatContent').value = '';
    }

    showChatView(chatId) {
        this.currentChat = chatId;
        document.getElementById('dashboardView').classList.add('hidden');
        document.getElementById('chatInputView').classList.add('hidden');
        document.getElementById('chatView').classList.remove('hidden');
        
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const chat = users[this.currentUser].conversations.find(c => c.id === chatId);
        if (chat) {
            document.getElementById('currentTitle').textContent = chat.title;
            this.renderChat(chat);
        }
    }

    // Improved Chat Management Methods
    parseChatContent(content) {
        if (!content || content.trim() === '') {
            return [];
        }

        const lines = content.split('\n');
        const messages = [];
        let currentMessage = null;
        let currentRole = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (!line) continue;
            
            // Check for role indicators
            const userPatterns = ['user:', 'you:', 'me:', 'human:'];
            const aiPatterns = ['chatgpt:', 'assistant:', 'ai:', 'bot:', 'gpt:'];
            
            const lowerLine = line.toLowerCase();
            let isUserLine = false;
            let isAILine = false;
            
            // Check if line starts with a role indicator
            for (const pattern of userPatterns) {
                if (lowerLine.startsWith(pattern)) {
                    isUserLine = true;
                    break;
                }
            }
            
            for (const pattern of aiPatterns) {
                if (lowerLine.startsWith(pattern)) {
                    isAILine = true;
                    break;
                }
            }
            
            // If we found a role indicator, start a new message
            if (isUserLine || isAILine) {
                // Save previous message if exists
                if (currentMessage && currentMessage.text.trim()) {
                    messages.push(currentMessage);
                }
                
                // Start new message
                const role = isUserLine ? 'user' : 'ai';
                const text = line.substring(line.indexOf(':') + 1).trim();
                
                currentMessage = {
                    role: role,
                    text: text
                };
                currentRole = role;
            } else {
                // This is a continuation line
                if (currentMessage) {
                    // If we have a current message, append to it
                    currentMessage.text += '\n' + line;
                } else {
                    // If no current message, assume it's a user message (common case)
                    currentMessage = {
                        role: 'user',
                        text: line
                    };
                    currentRole = 'user';
                }
            }
        }
        
        // Add the last message if it exists
        if (currentMessage && currentMessage.text.trim()) {
            messages.push(currentMessage);
        }
        
        // If no messages were parsed, try alternative parsing
        if (messages.length === 0) {
            return this.fallbackParse(content);
        }
        
        return messages;
    }

    fallbackParse(content) {
        // Fallback parsing for when standard parsing fails
        const lines = content.split('\n').filter(line => line.trim());
        const messages = [];
        
        if (lines.length === 0) return [];
        
        // If only one line, treat as user message
        if (lines.length === 1) {
            messages.push({
                role: 'user',
                text: lines[0]
            });
            return messages;
        }
        
        // Try to detect alternating pattern
        let currentRole = 'user';
        let currentText = '';
        
        for (const line of lines) {
            if (line.trim()) {
                if (currentText) {
                    messages.push({
                        role: currentRole,
                        text: currentText.trim()
                    });
                    currentRole = currentRole === 'user' ? 'ai' : 'user';
                    currentText = line;
                } else {
                    currentText = line;
                }
            } else if (currentText) {
                currentText += '\n' + line;
            }
        }
        
        // Add the last message
        if (currentText.trim()) {
            messages.push({
                role: currentRole,
                text: currentText.trim()
            });
        }
        
        return messages;
    }

    generateTitle(messages) {
        if (messages.length > 0 && messages[0].role === 'user') {
            const firstMessage = messages[0].text;
            const firstLine = firstMessage.split('\n')[0];
            return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
        }
        return 'Untitled Chat';
    }

    async saveChat() {
        const title = document.getElementById('chatTitle').value.trim();
        const content = document.getElementById('chatContent').value.trim();
        
        if (!content) {
            this.showToast('Please enter some chat content', 'error');
            return;
        }
        
        const messages = this.parseChatContent(content);
        console.log('Parsed messages:', messages); // Debug log
        
        if (messages.length === 0) {
            this.showToast('No valid messages found. Please check the format and try again.', 'error');
            return;
        }
        
        const finalTitle = title || this.generateTitle(messages);
        const chatId = Date.now().toString();
        
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const newChat = {
            id: chatId,
            title: finalTitle,
            date: new Date().toISOString().split('T')[0],
            messages: messages
        };
        
        users[this.currentUser].conversations.unshift(newChat);
        localStorage.setItem('users', JSON.stringify(users));
        
        this.showToast('Chat saved successfully!', 'success');
        this.showDashboard();
    }

    renderChat(chat) {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        
        chat.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-bubble ${message.role === 'user' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800'} p-4 rounded-lg`;
            
            const roleLabel = document.createElement('div');
            roleLabel.className = `text-xs font-medium mb-2 ${message.role === 'user' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`;
            roleLabel.textContent = message.role === 'user' ? 'You' : 'ChatGPT';
            
            const textDiv = document.createElement('div');
            textDiv.className = 'text-gray-900 dark:text-gray-100 whitespace-pre-wrap';
            textDiv.textContent = message.text;
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200';
            copyBtn.textContent = 'Copy';
            copyBtn.onclick = () => this.copyText(message.text);
            
            messageDiv.appendChild(roleLabel);
            messageDiv.appendChild(textDiv);
            messageDiv.appendChild(copyBtn);
            chatMessages.appendChild(messageDiv);
        });
    }

    copyChat() {
        if (!this.currentChat) return;
        
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const chat = users[this.currentUser].conversations.find(c => c.id === this.currentChat);
        if (!chat) return;
        
        let chatText = `${chat.title}\n\n`;
        chat.messages.forEach(message => {
            chatText += `${message.role === 'user' ? 'You' : 'ChatGPT'}: ${message.text}\n\n`;
        });
        
        navigator.clipboard.writeText(chatText).then(() => {
            this.showToast('Chat copied to clipboard!', 'success');
        });
    }

    copyText(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Message copied to clipboard!', 'success');
        });
    }

    editChat() {
        if (!this.currentChat) return;
        
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const chat = users[this.currentUser].conversations.find(c => c.id === this.currentChat);
        if (!chat) return;
        
        document.getElementById('chatTitle').value = chat.title;
        document.getElementById('chatContent').value = chat.messages.map(m => 
            `${m.role === 'user' ? 'You' : 'ChatGPT'}: ${m.text}`
        ).join('\n\n');
        
        this.showChatInput();
        document.getElementById('currentTitle').textContent = 'Edit Chat';
    }

    deleteChat() {
        if (!this.currentChat) return;
        
        if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            users[this.currentUser].conversations = users[this.currentUser].conversations.filter(c => c.id !== this.currentChat);
            localStorage.setItem('users', JSON.stringify(users));
            
            this.showToast('Chat deleted successfully', 'success');
            this.showDashboard();
        }
    }

    // Conversation Management
    loadConversations() {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const conversations = users[this.currentUser]?.conversations || [];
        
        this.renderConversationsList(conversations);
        this.renderDashboardContent(conversations);
    }

    renderConversationsList(conversations) {
        const conversationsList = document.getElementById('conversationsList');
        conversationsList.innerHTML = '';
        
        if (conversations.length === 0) {
            conversationsList.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-400 text-sm">No conversations yet</p>
                    <p class="text-gray-500 text-xs mt-1">Create your first chat!</p>
                </div>
            `;
            return;
        }
        
        conversations.forEach(chat => {
            const chatDiv = document.createElement('div');
            chatDiv.className = `p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors ${this.currentChat === chat.id ? 'bg-gray-800' : ''}`;
            chatDiv.onclick = () => this.showChatView(chat.id);
            
            chatDiv.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                        <p class="text-white text-sm font-medium truncate">${chat.title}</p>
                        <p class="text-gray-400 text-xs">${this.formatDate(chat.date)}</p>
                    </div>
                    <button class="text-gray-400 hover:text-red-400 ml-2" onclick="event.stopPropagation(); app.deleteConversation('${chat.id}')">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            `;
            
            conversationsList.appendChild(chatDiv);
        });
    }

    renderDashboardContent(conversations) {
        const dashboardContent = document.getElementById('dashboardContent');
        
        if (conversations.length === 0) {
            dashboardContent.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No conversations yet</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">Start by creating your first chat conversation</p>
                    <button onclick="app.showChatInput()" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors">
                        Create First Chat
                    </button>
                </div>
            `;
            return;
        }
        
        const recentChats = conversations.slice(0, 6);
        dashboardContent.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${recentChats.map(chat => `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="app.showChatView('${chat.id}')">
                        <div class="flex items-start justify-between mb-4">
                            <h3 class="text-lg font-medium text-gray-900 dark:text-white truncate">${chat.title}</h3>
                            <span class="text-xs text-gray-500 dark:text-gray-400">${this.formatDate(chat.date)}</span>
                        </div>
                        <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            ${chat.messages.length} messages
                        </p>
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500 dark:text-gray-400">
                                Last updated: ${this.formatDate(chat.date)}
                            </span>
                            <button class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                                View →
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${conversations.length > 6 ? `
                <div class="text-center mt-8">
                    <button onclick="app.showAllConversations()" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        View all ${conversations.length} conversations
                    </button>
                </div>
            ` : ''}
        `;
    }

    deleteConversation(chatId) {
        if (confirm('Are you sure you want to delete this conversation?')) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            users[this.currentUser].conversations = users[this.currentUser].conversations.filter(c => c.id !== chatId);
            localStorage.setItem('users', JSON.stringify(users));
            
            this.showToast('Conversation deleted', 'success');
            this.loadConversations();
        }
    }

    // Utility Methods
    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('userEmail').textContent = this.currentUser;
            const initials = this.currentUser.split('@')[0].substring(0, 2).toUpperCase();
            document.getElementById('userInitials').textContent = initials;
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        
        return date.toLocaleDateString();
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.applyDarkMode();
    }

    applyDarkMode() {
        if (this.isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('-translate-x-full');
    }

    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
        }, 1000);
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500'
        };
        
        toast.className = `${colors[type]} text-white px-4 py-2 rounded-md shadow-lg transform transition-all duration-300 translate-x-full`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Initialize the application
const app = new ChatLogVault(); 