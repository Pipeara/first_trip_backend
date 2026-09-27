
const rideClients = new Map();

export function addClientToRide(rideId, ws) {
  if (!rideClients.has(rideId)) {
    rideClients.set(rideId, new Set());
  }

  rideClients.get(rideId).add(ws);
}

export function removeClientFromRide(rideId, ws) {
  const clients = rideClients.get(rideId);

  if (!clients) {
    return;
  }

  clients.delete(ws);

  if (clients.size === 0) {
    rideClients.delete(rideId);
  }
}

export function getRideClients(rideId) {
  return rideClients.get(rideId) ?? new Set();
}

export function broadcastToRide(rideId, message) {
  const clients = getRideClients(rideId);

  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}
