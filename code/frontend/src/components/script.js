const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// Example usernames
const currentUser = 'You';
const opponentUser = 'User123';
// Sample messages array
const sampleMessages = [
    { text: "Hey! How's it going?", sender: currentUser },
    { text: "I’m doing well, thanks! How about you?", sender: opponentUser },
    { text: "Just working on a project. What are you up to?", sender: currentUser },
    { text: "Just finished a meeting. It was pretty intense!", sender: opponentUser },
    { text: "Oh no, I hope it went well! What was it about?", sender: currentUser },
    { text: "Just discussing our new product launch. Exciting stuff!", sender: opponentUser },
    { text: "That sounds interesting! When is it launching?", sender: currentUser },
    { text: "We’re aiming for next month. Fingers crossed!", sender: opponentUser },
    { text: "Awesome! Let me know if you need any help with it.", sender: currentUser },
    { text: "Will do! I appreciate it.", sender: opponentUser }
];

// Function to initialize chat with sample messages
function initializeChat() {
    sampleMessages.forEach(message => {
        addMessage(message.text, message.sender);
    });
}

// Call this function on page load
initializeChat();

// Function to add a message to the chat
function addMessage(text, sender) {
    const messageBlock = document.createElement('div');
    const timeStamp = new Date().toLocaleTimeString();
    messageBlock.classList.add('message', sender === currentUser ? 'user' : 'opponent');
    messageBlock.innerHTML = `<div>${text}</div><div style="font-size: 0.8em; color: gray;">${timeStamp}</div>`;
    messagesContainer.appendChild(messageBlock);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll to the latest message
}

// Send message on button click
sendButton.addEventListener('click', () => {
    const messageText = messageInput.value.trim();
    if (messageText) {
        addMessage(messageText, currentUser);
        messageInput.value = ''; // Clear input
        // Simulate opponent's reply (for demo purposes)
        setTimeout(() => {
            addMessage('This is a reply', opponentUser);
        }, 1000);
    }
});

// Send message on Enter key
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendButton.click();
    }
});
