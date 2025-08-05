// SaveChat - Main Application Logic
class SaveChat {
    constructor() {
        this.currentUser = null;
        this.currentChat = null;
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.verificationCode = null;
        this.tempUserData = null;
        this.loginAttempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
        this.emailjsInitialized = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyDarkMode();
        this.checkAuth();
        this.hideLoadingScreen();
        this.initEmailJS();
    }

    setupEventListeners() {
        // Auth events
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));
        document.getElementById('forgotPasswordForm').addEventListener('submit', (e) => this.handleForgotPassword(e));
        document.getElementById('resetPasswordForm').addEventListener('submit', (e) => this.handleResetPassword(e));
        document.getElementById('phoneVerificationForm').addEventListener('submit', (e) => this.handlePhoneVerification(e));
        
        // Auth navigation
        document.getElementById('showSignup').addEventListener('click', () => this.showAuthForm('signup'));
        document.getElementById('showLogin').addEventListener('click', () => this.showAuthForm('login'));
        document.getElementById('showForgotPassword').addEventListener('click', () => this.showAuthForm('forgotPassword'));
        document.getElementById('backToLogin').addEventListener('click', () => this.showAuthForm('login'));
        document.getElementById('backToSignup').addEventListener('click', () => this.showAuthForm('signup'));
        document.getElementById('backToForgotPassword').addEventListener('click', () => this.showAuthForm('forgotPassword'));
        
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

        // Password visibility toggles
        document.getElementById('togglePassword').addEventListener('click', () => this.togglePasswordVisibility('password'));
        document.getElementById('toggleSignupPassword').addEventListener('click', () => this.togglePasswordVisibility('signupPassword'));
        document.getElementById('toggleConfirmPassword').addEventListener('click', () => this.togglePasswordVisibility('confirmPassword'));
        document.getElementById('toggleResetPassword').addEventListener('click', () => this.togglePasswordVisibility('resetPassword'));
        document.getElementById('toggleConfirmResetPassword').addEventListener('click', () => this.togglePasswordVisibility('confirmResetPassword'));
    }

    // Enhanced Authentication Methods
    async hashPassword(password) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.error('Error hashing password:', error);
            throw new Error('Failed to hash password');
        }
    }

    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    initEmailJS() {
        // Initialize EmailJS with a public key (you'll need to get this from emailjs.com)
        // For demo purposes, we'll use a placeholder
        if (typeof emailjs !== 'undefined') {
            emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your actual EmailJS public key
            this.emailjsInitialized = true;
        }
    }

    async sendVerificationCode(phoneNumber, code) {
        // In a real app, this would integrate with SMS services like Twilio
        // For demo purposes, we'll show the code on screen
        console.log(`Verification code ${code} sent to ${phoneNumber}`);
        
        // Store the code temporarily (in production, this would be in a secure backend)
        this.verificationCode = code;
        
        // Show demo notification with the code
        this.showDemoCode(code, phoneNumber, 'SMS');
        
        // Simulate SMS delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return true;
    }

    async sendEmailVerification(email, code) {
        // For now, always show demo mode since EmailJS isn't configured
        // In production, you would configure EmailJS following EMAIL_SETUP.md
        
        console.log(`Password reset code ${code} for ${email} (Demo Mode)`);
        
        // Show demo notification with the code
        this.showDemoCode(code, email, 'Email');
        
        // Simulate email delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return true;
    }

    showDemoCode(code, destination, type) {
        const demoNotification = document.createElement('div');
        demoNotification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-100 dark:bg-red-900 border-2 border-red-400 text-red-800 dark:text-red-200 px-6 py-4 rounded-lg shadow-xl z-50 max-w-md animate-pulse';
        demoNotification.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
                <div class="ml-3 flex-1">
                    <h3 class="text-lg font-bold text-red-800 dark:text-red-200">🔑 VERIFICATION CODE</h3>
                    <div class="mt-3 text-sm">
                        <p><strong>To:</strong> ${destination}</p>
                        <p class="mt-2"><strong>Your Code:</strong></p>
                        <div class="mt-2 p-3 bg-red-200 dark:bg-red-800 rounded-lg text-center">
                            <span class="font-mono text-2xl font-bold text-red-900 dark:text-red-100 tracking-widest">${code}</span>
                        </div>
                        <p class="text-xs mt-3 text-red-600 dark:text-red-300">
                            ⚠️ DEMO MODE: This code appears on screen for testing. 
                            In production, this would be sent via ${type}.
                        </p>
                    </div>
                </div>
                <div class="ml-auto pl-3">
                    <button onclick="this.parentElement.parentElement.remove()" class="text-red-400 hover:text-red-600">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(demoNotification);
        
        // Make it more prominent with sound (if supported)
        try {
            // Play a notification sound
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
            audio.play();
        } catch (e) {
            // Ignore if audio fails
        }
        
        // Auto-remove after 30 seconds (longer for better visibility)
        setTimeout(() => {
            if (demoNotification.parentElement) {
                demoNotification.remove();
            }
        }, 30000);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return {
            isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
            errors: {
                length: password.length < minLength,
                uppercase: !hasUpperCase,
                lowercase: !hasLowerCase,
                numbers: !hasNumbers,
                special: !hasSpecialChar
            }
        };
    }

    checkLoginAttempts(email) {
        const attempts = this.loginAttempts[email] || { count: 0, lastAttempt: 0 };
        const now = Date.now();
        const lockoutDuration = 15 * 60 * 1000; // 15 minutes
        
        // Reset attempts if lockout period has passed
        if (now - attempts.lastAttempt > lockoutDuration) {
            attempts.count = 0;
        }
        
        return attempts;
    }

    updateLoginAttempts(email) {
        if (!this.loginAttempts[email]) {
            this.loginAttempts[email] = { count: 0, lastAttempt: 0 };
        }
        
        this.loginAttempts[email].count++;
        this.loginAttempts[email].lastAttempt = Date.now();
        
        localStorage.setItem('loginAttempts', JSON.stringify(this.loginAttempts));
    }

    async handleLogin(e) {
        e.preventDefault();
        try {
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                this.showToast('Please fill in all fields', 'error');
                return;
            }
            
            if (!this.validateEmail(email)) {
                this.showToast('Please enter a valid email address', 'error');
                return;
            }
            
            // Check for account lockout
            const attempts = this.checkLoginAttempts(email);
            if (attempts.count >= 5) {
                const remainingTime = Math.ceil((15 * 60 * 1000 - (Date.now() - attempts.lastAttempt)) / 1000 / 60);
                this.showToast(`Account temporarily locked. Try again in ${remainingTime} minutes.`, 'error');
                return;
            }
            
            const hashedPassword = await this.hashPassword(password);
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            
            console.log('Login attempt:', { email, hashedPassword, userExists: !!users[email] });
            
            if (users[email] && users[email].passwordHash === hashedPassword) {
                // Reset login attempts on successful login
                delete this.loginAttempts[email];
                localStorage.setItem('loginAttempts', JSON.stringify(this.loginAttempts));
                
                this.currentUser = email;
                localStorage.setItem('currentUser', email);
                this.showApp();
                this.loadConversations();
                this.showToast('Successfully logged in!', 'success');
            } else {
                this.updateLoginAttempts(email);
                const remainingAttempts = 5 - this.loginAttempts[email].count;
                this.showToast(`Invalid email or password. ${remainingAttempts} attempts remaining.`, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast('Login failed. Please try again.', 'error');
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        try {
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const phoneNumber = document.getElementById('signupPhone').value.trim();
            const fullName = document.getElementById('signupName').value.trim();
            
            if (!email || !password || !confirmPassword || !phoneNumber || !fullName) {
                this.showToast('Please fill in all fields', 'error');
                return;
            }
            
            if (!this.validateEmail(email)) {
                this.showToast('Please enter a valid email address', 'error');
                return;
            }
            
            if (!this.validatePhone(phoneNumber)) {
                this.showToast('Please enter a valid phone number', 'error');
                return;
            }
            
            const passwordValidation = this.validatePassword(password);
            if (!passwordValidation.isValid) {
                const errors = [];
                if (passwordValidation.errors.length) errors.push('at least 8 characters');
                if (passwordValidation.errors.uppercase) errors.push('one uppercase letter');
                if (passwordValidation.errors.lowercase) errors.push('one lowercase letter');
                if (passwordValidation.errors.numbers) errors.push('one number');
                if (passwordValidation.errors.special) errors.push('one special character');
                
                this.showToast(`Password must contain: ${errors.join(', ')}`, 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                this.showToast('Passwords do not match', 'error');
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            
            if (users[email]) {
                this.showToast('User already exists', 'error');
                return;
            }
            
            // Store temporary user data for verification
            this.tempUserData = {
                email,
                password,
                phoneNumber,
                fullName
            };
            
            // Generate and send verification code
            const verificationCode = this.generateVerificationCode();
            await this.sendVerificationCode(phoneNumber, verificationCode);
            
            // Show phone verification form
            this.showAuthForm('phoneVerification');
            this.showToast('Verification code sent to your phone', 'info');
            
        } catch (error) {
            console.error('Signup error:', error);
            this.showToast('Signup failed. Please try again.', 'error');
        }
    }

    async handlePhoneVerification(e) {
        e.preventDefault();
        try {
            const enteredCode = document.getElementById('verificationCode').value.trim();
            
            if (!enteredCode) {
                this.showToast('Please enter the verification code', 'error');
                return;
            }
            
            if (enteredCode === this.verificationCode) {
                // Create the user account
                const hashedPassword = await this.hashPassword(this.tempUserData.password);
                const users = JSON.parse(localStorage.getItem('users') || '{}');
                
                users[this.tempUserData.email] = {
                    passwordHash: hashedPassword,
                    phoneNumber: this.tempUserData.phoneNumber,
                    fullName: this.tempUserData.fullName,
                    conversations: [],
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                };
                
                localStorage.setItem('users', JSON.stringify(users));
                
                this.currentUser = this.tempUserData.email;
                localStorage.setItem('currentUser', this.tempUserData.email);
                
                // Clear temporary data
                this.tempUserData = null;
                this.verificationCode = null;
                
                this.showApp();
                this.loadConversations();
                this.showToast('Account created successfully!', 'success');
            } else {
                this.showToast('Invalid verification code', 'error');
            }
        } catch (error) {
            console.error('Verification error:', error);
            this.showToast('Verification failed. Please try again.', 'error');
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault();
        try {
            const email = document.getElementById('forgotEmail').value.trim();
            
            if (!email) {
                this.showToast('Please enter your email address', 'error');
                return;
            }
            
            if (!this.validateEmail(email)) {
                this.showToast('Please enter a valid email address', 'error');
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            
            if (!users[email]) {
                this.showToast('No account found with this email address', 'error');
                return;
            }
            
            // Generate reset code
            const resetCode = this.generateVerificationCode();
            this.verificationCode = resetCode;
            
            // Show loading state
            this.showToast('Sending reset code...', 'info');
            
            // Try to send real email
            await this.sendEmailVerification(email, resetCode);
            
            // Store email for reset process
            this.tempUserData = { email };
            
            this.showAuthForm('resetPassword');
            this.showToast('Reset code sent to your email', 'success');
            
        } catch (error) {
            console.error('Forgot password error:', error);
            this.showToast('Failed to process request. Please try again.', 'error');
        }
    }

    async handleResetPassword(e) {
        e.preventDefault();
        try {
            const resetCode = document.getElementById('resetCode').value.trim();
            const newPassword = document.getElementById('resetPassword').value;
            const confirmNewPassword = document.getElementById('confirmResetPassword').value;
            
            if (!resetCode || !newPassword || !confirmNewPassword) {
                this.showToast('Please fill in all fields', 'error');
                return;
            }
            
            if (resetCode !== this.verificationCode) {
                this.showToast('Invalid reset code', 'error');
                return;
            }
            
            const passwordValidation = this.validatePassword(newPassword);
            if (!passwordValidation.isValid) {
                const errors = [];
                if (passwordValidation.errors.length) errors.push('at least 8 characters');
                if (passwordValidation.errors.uppercase) errors.push('one uppercase letter');
                if (passwordValidation.errors.lowercase) errors.push('one lowercase letter');
                if (passwordValidation.errors.numbers) errors.push('one number');
                if (passwordValidation.errors.special) errors.push('one special character');
                
                this.showToast(`Password must contain: ${errors.join(', ')}`, 'error');
                return;
            }
            
            if (newPassword !== confirmNewPassword) {
                this.showToast('Passwords do not match', 'error');
                return;
            }
            
            // Update password
            const hashedPassword = await this.hashPassword(newPassword);
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            
            if (users[this.tempUserData.email]) {
                users[this.tempUserData.email].passwordHash = hashedPassword;
                users[this.tempUserData.email].passwordResetAt = new Date().toISOString();
                
                localStorage.setItem('users', JSON.stringify(users));
                
                // Clear temporary data
                this.tempUserData = null;
                this.verificationCode = null;
                
                this.showAuthForm('login');
                this.showToast('Password reset successfully! Please log in.', 'success');
            } else {
                this.showToast('Account not found', 'error');
            }
            
        } catch (error) {
            console.error('Reset password error:', error);
            this.showToast('Failed to reset password. Please try again.', 'error');
        }
    }

    showAuthForm(formType) {
        // Hide all auth forms
        const forms = ['loginForm', 'signupForm', 'forgotPasswordForm', 'resetPasswordForm', 'phoneVerificationForm'];
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) form.classList.add('hidden');
        });
        
        // Show the requested form
        const targetForm = document.getElementById(formType + 'Form');
        if (targetForm) {
            targetForm.classList.remove('hidden');
        }
        
        // Update navigation buttons visibility
        this.updateAuthNavigation(formType);
    }

    updateAuthNavigation(activeForm) {
        const navButtons = {
            showSignup: activeForm === 'login',
            showLogin: activeForm === 'signup' || activeForm === 'forgotPassword' || activeForm === 'resetPassword' || activeForm === 'phoneVerification',
            showForgotPassword: activeForm === 'login',
            backToLogin: activeForm === 'forgotPassword' || activeForm === 'resetPassword' || activeForm === 'phoneVerification',
            backToSignup: activeForm === 'phoneVerification',
            backToForgotPassword: activeForm === 'resetPassword'
        };
        
        Object.entries(navButtons).forEach(([buttonId, shouldShow]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.style.display = shouldShow ? 'block' : 'none';
            }
        });
    }

    togglePasswordVisibility(fieldId) {
        const field = document.getElementById(fieldId);
        const toggleBtn = document.getElementById('toggle' + fieldId.charAt(0).toUpperCase() + fieldId.slice(1));
        
        if (field.type === 'password') {
            field.type = 'text';
            toggleBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path></svg>';
        } else {
            field.type = 'password';
            toggleBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>';
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
        this.showAuthForm('login');
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

    // Chat Management Methods
    parseChatContent(content) {
        try {
            const lines = content.split('\n').filter(line => line.trim());
            const messages = [];
            let currentMessage = null;
            
            console.log('Parsing chat content:', { lineCount: lines.length, firstFewLines: lines.slice(0, 3) });
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                
                // Check for user messages (various formats)
                if (trimmedLine.match(/^(user|you|me):\s*/i)) {
                    if (currentMessage) {
                        messages.push(currentMessage);
                    }
                    currentMessage = {
                        role: 'user',
                        text: trimmedLine.replace(/^(user|you|me):\s*/i, '').trim()
                    };
                }
                // Check for AI messages (various formats)
                else if (trimmedLine.match(/^(assistant|chatgpt|ai|gpt|bot):\s*/i)) {
                    if (currentMessage) {
                        messages.push(currentMessage);
                    }
                    currentMessage = {
                        role: 'ai',
                        text: trimmedLine.replace(/^(assistant|chatgpt|ai|gpt|bot):\s*/i, '').trim()
                    };
                }
                // Continue current message
                else if (currentMessage) {
                    currentMessage.text += '\n' + trimmedLine;
                }
            }
            
            if (currentMessage) {
                messages.push(currentMessage);
            }
            
            console.log('Parsed messages:', messages);
            return messages;
        } catch (error) {
            console.error('Error parsing chat content:', error);
            return [];
        }
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
        try {
            const title = document.getElementById('chatTitle').value.trim();
            const content = document.getElementById('chatContent').value.trim();
            
            if (!content) {
                this.showToast('Please enter some chat content', 'error');
                return;
            }
            
            const messages = this.parseChatContent(content);
            if (messages.length === 0) {
                this.showToast('No valid messages found. Please check the format. Messages should start with "User:" or "Assistant:"', 'error');
                return;
            }
            
            const finalTitle = title || this.generateTitle(messages);
            const chatId = Date.now().toString();
            
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            if (!users[this.currentUser]) {
                users[this.currentUser] = { conversations: [] };
            }
            
            const newChat = {
                id: chatId,
                title: finalTitle,
                date: new Date().toISOString().split('T')[0],
                messages: messages
            };
            
            users[this.currentUser].conversations.unshift(newChat);
            localStorage.setItem('users', JSON.stringify(users));
            
            console.log('Chat saved:', { chatId, title: finalTitle, messageCount: messages.length });
            
            this.showToast('Chat saved successfully!', 'success');
            this.showDashboard();
        } catch (error) {
            console.error('Error saving chat:', error);
            this.showToast('Failed to save chat. Please try again.', 'error');
        }
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
        
        try {
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
        } catch (error) {
            console.error('Error copying chat:', error);
            this.showToast('Failed to copy chat', 'error');
        }
    }

    copyText(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Message copied to clipboard!', 'success');
        }).catch(() => {
            this.showToast('Failed to copy message', 'error');
        });
    }

    editChat() {
        if (!this.currentChat) return;
        
        try {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const chat = users[this.currentUser].conversations.find(c => c.id === this.currentChat);
            if (!chat) return;
            
            document.getElementById('chatTitle').value = chat.title;
            document.getElementById('chatContent').value = chat.messages.map(m => 
                `${m.role === 'user' ? 'You' : 'ChatGPT'}: ${m.text}`
            ).join('\n\n');
            
            this.showChatInput();
            document.getElementById('currentTitle').textContent = 'Edit Chat';
        } catch (error) {
            console.error('Error editing chat:', error);
            this.showToast('Failed to load chat for editing', 'error');
        }
    }

    deleteChat() {
        if (!this.currentChat) return;
        
        if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
            try {
                const users = JSON.parse(localStorage.getItem('users') || '{}');
                users[this.currentUser].conversations = users[this.currentUser].conversations.filter(c => c.id !== this.currentChat);
                localStorage.setItem('users', JSON.stringify(users));
                
                this.showToast('Chat deleted successfully', 'success');
                this.showDashboard();
            } catch (error) {
                console.error('Error deleting chat:', error);
                this.showToast('Failed to delete chat', 'error');
            }
        }
    }

    // Conversation Management
    loadConversations() {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const conversations = users[this.currentUser]?.conversations || [];
            
            console.log('Loading conversations:', { user: this.currentUser, count: conversations.length });
            
            this.renderConversationsList(conversations);
            this.renderDashboardContent(conversations);
        } catch (error) {
            console.error('Error loading conversations:', error);
            this.showToast('Failed to load conversations', 'error');
        }
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
            try {
                const users = JSON.parse(localStorage.getItem('users') || '{}');
                users[this.currentUser].conversations = users[this.currentUser].conversations.filter(c => c.id !== chatId);
                localStorage.setItem('users', JSON.stringify(users));
                
                this.showToast('Conversation deleted', 'success');
                this.loadConversations();
            } catch (error) {
                console.error('Error deleting conversation:', error);
                this.showToast('Failed to delete conversation', 'error');
            }
        }
    }

    // Utility Methods
    updateUserInfo() {
        if (this.currentUser) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const user = users[this.currentUser];
            
            document.getElementById('userEmail').textContent = this.currentUser;
            const displayName = user?.fullName || this.currentUser.split('@')[0];
            const initials = displayName.substring(0, 2).toUpperCase();
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
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application
const app = new SaveChat(); 