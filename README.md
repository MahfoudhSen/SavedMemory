# SaveChat - Save & Organize Your ChatGPT Conversations

A beautiful, modern web application for saving and organizing your ChatGPT conversations with a focus on aesthetics and user experience.

## Features

- 🔐 **Secure Authentication** - User registration and login with password hashing
- 💬 **Chat Management** - Save, edit, and organize your ChatGPT conversations
- 🎨 **Beautiful UI** - Modern, responsive design with dark mode support
- 📱 **Mobile Friendly** - Works perfectly on all devices
- 🔍 **Smart Parsing** - Automatically detects and formats chat messages
- 📋 **Copy & Export** - Easy copying of individual messages or entire conversations
- 🗂️ **Dashboard** - Clean overview of all your saved conversations

## Quick Start

1. **Open the application** - Simply open `index.html` in your web browser
2. **Create an account** - Click "Don't have an account? Sign up" and register
3. **Start saving chats** - Click "New Chat" and paste your ChatGPT conversation
4. **Organize** - View, edit, and manage your saved conversations

## How to Use

### Saving a Chat

1. Click the **"New Chat"** button
2. Optionally enter a title for your chat
3. Paste your ChatGPT conversation in the text area
4. Click **"Save Chat"**

### Chat Format Requirements

Your chat should follow this format for proper parsing:

```
User: Your message here
Assistant: ChatGPT's response here
User: Another message
Assistant: Another response
```

**Supported formats:**
- `User:` or `You:` or `Me:` for your messages
- `Assistant:` or `ChatGPT:` or `AI:` or `GPT:` or `Bot:` for AI responses

### Managing Conversations

- **View**: Click on any conversation in the sidebar or dashboard
- **Edit**: Open a chat and click the "Edit" button
- **Copy**: Use "Copy Chat" to copy the entire conversation
- **Delete**: Use the delete button to remove conversations

## Debugging Guide

If you encounter issues, follow these debugging steps:

### 1. Authentication Problems

**Issue**: Can't log in or sign up

**Debug Steps**:
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try to log in/sign up and check for error messages
4. Check if localStorage is working:
   ```javascript
   localStorage.getItem('users')
   ```

**Common Fixes**:
- Clear browser cache and localStorage
- Ensure all form fields are filled
- Check that passwords match during signup

### 2. Chat Not Saving

**Issue**: Conversations aren't being saved

**Debug Steps**:
1. Check the console for parsing errors
2. Verify your chat format follows the required pattern
3. Ensure you're logged in (check `localStorage.getItem('currentUser')`)

**Common Fixes**:
- Make sure messages start with "User:" or "Assistant:"
- Check that the chat content isn't empty
- Verify the user object exists in localStorage

### 3. UI Not Updating

**Issue**: Saved chats don't appear in the list

**Debug Steps**:
1. Check if `loadConversations()` is being called
2. Verify the conversations array in localStorage
3. Look for JavaScript errors in the console

**Common Fixes**:
- Refresh the page after saving
- Check if the user object has a conversations array
- Verify localStorage is working properly

### 4. Form Toggle Issues

**Issue**: Login/signup forms not switching

**Debug Steps**:
1. Check if the toggle buttons exist in the HTML
2. Verify the `toggleAuthForms()` function is working
3. Look for CSS conflicts with the `hidden` class

**Common Fixes**:
- Ensure all form elements have correct IDs
- Check that the `hidden` class is properly applied
- Verify event listeners are attached

## Technical Details

### Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Local Storage Structure

```javascript
{
  "users": {
    "user@example.com": {
      "passwordHash": "hashed_password",
      "conversations": [
        {
          "id": "timestamp",
          "title": "Chat Title",
          "date": "YYYY-MM-DD",
          "messages": [
            {
              "role": "user|ai",
              "text": "message content"
            }
          ]
        }
      ]
    }
  },
  "currentUser": "user@example.com",
  "darkMode": "true|false"
}
```

### Key Functions

- `parseChatContent()` - Parses chat text into structured messages
- `saveChat()` - Saves a new conversation to localStorage
- `loadConversations()` - Loads and displays saved conversations
- `handleLogin()` / `handleSignup()` - Authentication functions

## Troubleshooting

### Clear All Data
To reset the application completely:
```javascript
localStorage.clear();
location.reload();
```

### Check User Data
To view current user data:
```javascript
console.log(JSON.parse(localStorage.getItem('users')));
```

### Test Chat Parsing
To test if your chat format is correct:
```javascript
// In browser console
const testContent = `User: Hello
Assistant: Hi there!`;
app.parseChatContent(testContent);
```

## Development

### File Structure
```
savechat/
├── index.html      # Main HTML file
├── app.js          # JavaScript application logic
├── styles.css      # Custom CSS styles
├── package.json    # Project dependencies
└── README.md       # This file
```

### Adding Features

1. **New Message Formats**: Update the regex patterns in `parseChatContent()`
2. **UI Enhancements**: Modify the CSS classes in `styles.css`
3. **New Functions**: Add methods to the `SaveChat` class

## Support

If you continue to experience issues:

1. Check the browser console for error messages
2. Verify your chat format matches the requirements
3. Try clearing browser data and starting fresh
4. Ensure you're using a supported browser

## License

This project is open source and available under the MIT License. 