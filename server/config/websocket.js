// WebSocket handler for real-time order tracking
export const orderConnections = new Map();

export const setupWebSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('New WebSocket connection:', socket.id);

    // User joins room for order tracking
    socket.on('track-order', (orderId, userId) => {
      const roomId = `order-${orderId}`;
      socket.join(roomId);
      orderConnections.set(socket.id, { orderId, userId, roomId });
      console.log(`User ${userId} joined order tracking room: ${roomId}`);
    });

    // Send order status update to all users tracking this order
    socket.on('update-order-status', (orderId, newStatus) => {
      const roomId = `order-${orderId}`;
      io.to(roomId).emit('order-status-changed', { orderId, status: newStatus });
      console.log(`Order ${orderId} status updated to ${newStatus}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      orderConnections.delete(socket.id);
      console.log('User disconnected:', socket.id);
    });

    // Ping/Pong for keeping connection alive
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });
};
