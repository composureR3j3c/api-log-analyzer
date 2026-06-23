import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('log.received', (log) => {
  console.log(log);
});

socket.on('incident.created', (incident) => {
  console.log(incident);
});

socket.on('dashboard.updated', (summary) => {
  console.log(summary);
});