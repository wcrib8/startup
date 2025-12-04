const { WebSocketServer } = require('ws');

function peerProxy(httpServer) {
    const socketServer = new WebSocketServer({ noServer: true });

    const clients = new Map();

    httpServer.on('upgrade', (request, socket, head) => {
        socketServer.handleUpgrade(request, socket, head, (ws) => {
            socketServer.emit('connection', ws, request);
        });
    });

    socketServer.on('connection', (socket) => {
        console.log('New WebSocket connection established');

        let userName = null;

        socket.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                console.log('Received message:', data.type);

                if (data.type === 'identify') {
                    userName = data.userName;
                    clients.set(userName, socket);
                    console.log(`User ${userName} connected. Total clients: ${clients.size}`);

                    // send confirmation back to client
                    socket.send(JSON.stringify({ type: 'connection_confirmed', userName: userName }));
                }

                if (data.type === 'friend_referral') {
                    console.log(`Referral from ${data.fromUser} to ${data.toUser}`);

                    const recipientSocket = clients.get(data.toUser);

                    if (recipientSocket && recipientSocket.readyState === 1) {
                        recipientSocket.send(JSON.stringify({
                            type: 'friend_referral_recieved',
                            fromUser: data.fromUser,
                            friend: data.friend,
                            originalFriendId: data.originalFriendId,
                        }));

                        socket.send(JSON.stringify({
                            type: 'referral_success',
                            message: `Referral sent to ${data.toUser}`,
                            toUser: data.toUser,
                            friendId: data.originalFriendId,
                        }));

                        console.log(`Referral sent to ${data.toUser}`);
                    } else {
                        socket.send(JSON.stringify({
                            type: 'referral_error',
                            message: `User ${data.toUser} is not connected`,
                            toUser: data.toUser,
                        }));

                        console.log(`Failed to send referral. ${data.toUser} is not connected`);
                    }
                }
            } catch (err) {
                console.error('Error processing WebSocket message:', err);
                socket.send(JSON.stringify({ type: 'error', message: 'Failed to process message' }));
            }
        });

        socket.on('close', () => {
            if (userName) {
                clients.delete(userName);
                console.log(`User ${userName} disconnected. Total clients: ${clients.size}`);
            } else {
                console.log('Anonymous connection closed');
            }
        });

        socket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        const pingInterval = setInterval(() => {
            if (socket.readyState === 1) {
                socket.ping();
            }
        }, 30000);

        socket.on('close', () => {
            clearInterval(pingInterval);
        });
    });

    return socketServer;
}

module.exports = { peerProxy };