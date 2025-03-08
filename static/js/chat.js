const showAlert = (message) => {
    const alertContainer = document.getElementById('alertContainer');

    // Create the alert element
    const alertDiv = document.createElement('div');
    alertDiv.style.position = 'absolute'
    alertDiv.style.right = '1%'
    alertDiv.className = 'alert alert-danger alert-dismissible fade show mt-3 mx-3';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.classList.remove('show');
        alertDiv.classList.add('fade');
        alertDiv.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            alertContainer.removeChild(alertDiv);
        }, 500);
    }, 5000);
};
document.addEventListener('DOMContentLoaded', (event) => {
    const socket = new WebSocket(`ws://${window.location.host}/ws`);

    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const messages = document.getElementById('messages');
    const logoutButton = document.getElementById('logoutButton');

    console.log('Connecting to WebSocket...');

    function appendMessage(messageText) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.textContent = messageText;

        messageElement.addEventListener('click', async () => {
            console.log(messageElement)
            const sender = messageElement.textContent.split(':')[0]
            const content = messageElement.textContent.split(':')[1].trim()
            const confirmDelete = confirm('Are you sure you want to delete this message?');
            if (confirmDelete) {
                let messageId;

                await fetch('/api/messages/get-message', {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sender: sender, content: content })
                }).then(res => {
                    if (res.ok) {
                        return res.json(); // Get the response as JSON
                    } else {
                        throw new Error('Network response was not ok');
                    }
                }).then(data => {
                    if (data.messageId) {
                        messageId = data.messageId; // Assign the messageId from the JSON response
                    } else {
                        console.error('Message ID not found in response:', data);
                    }
                }).catch(error => {
                    console.error('Error fetching message ID:', error);
                });
                
                
                if (messageId) {
                    try {
                        console.log(messageId,JSON.stringify({ messageId }))
                        const response = await fetch('/api/messages/delete-message', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ messageId }),
                        });

                        if (response.ok) {
                            messages.removeChild(messageElement);
                        } else {
                            showAlert(`You can not delete others messages`);
                        }
                    } catch (error) {
                        console.error('Error during message deletion:', error);
                    }
                } else {
                    console.warn('Message ID not found');
                }
            }
        });

        messages.appendChild(messageElement);
        messages.scrollTop = messages.scrollHeight;
    }

    socket.addEventListener('message', (event) => {
        appendMessage(event.data);
    });

    socket.addEventListener('open', () => {
        console.log('WebSocket connection established');
    });

    socket.addEventListener('close', () => {
        console.log('WebSocket connection closed');
    });

    socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
    });

    chatForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const messageText = messageInput.value.trim();
        if (messageText) {
            socket.send(messageText);
            messageInput.value = '';
        } else {
            console.warn('Cannot send an empty message');
        }
    });

    logoutButton.addEventListener('click', async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('/api/users/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            if (response.ok) {
                window.location.href = '/auth';
            } else {
                console.error('Logout failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    });
});
