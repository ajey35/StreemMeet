import { Socket } from "socket.io";
import http from "http";

import express from 'express';
import { Server } from 'socket.io';
import { UserManager } from "./managers/UserManger";
import { log } from "console";

const app = express();

app.get("/quote",(req,res)=>{
  res.json({
    msg:"Hello,How are You"
  })
})

app.listen(3000,()=>{
  console.log("Http Listenin on 3000");
  
})

const server = http.createServer(http);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const userManager = new UserManager();

io.on('connection', (socket: Socket) => {
  console.log('a user connected');
  userManager.addUser("randomName", socket);
  socket.on("disconnect", () => {
    console.log("user disconnected");
    userManager.removeUser(socket.id);
  })
});

server.listen(8080, () => {
    console.log('Socket io listening on *:8080');
});
