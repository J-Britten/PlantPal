import type { FarmBotTask } from "#build/types/nitro-imports";
import { defineStore } from "pinia";
import { io } from "socket.io-client";
import { ChatChannel } from "~/server/chat/chatChannel";
import { ChatMessage } from "~/server/chat/chatMessage";

/**
 * This store is the client for the socket.io socket connection
 * We need a socket to make sending data to and between clients easier
 */

export const useConnectionStore = defineStore("connection", () => {

  const socket = io();
  const isConnected = ref(false);
  const _userData : any = ref({}); //User data
  const messages = ref<string[]>([]); //Array of messages
  const onlineUsers = ref<string[]>([]); //Array of online users, we could use this to display who is online to the user
  const availableUsers = ref<string[]>([]); //List of all users
  const queue = ref<any[]>([]); //Queue
  const currentTask = ref({})
  const userData = readonly(_userData)
  const myField : any = ref({}); //field of person
  const { data } = useAuth()

  const displayDisconnect = inject("displayDisconnect");

  const chats = ref<ChatChannel[]>([]); //List of chat channels
  const newChatMessages = ref(0); //List of new chat messages
  const farmbotPosition = ref({x: 0, y:0, z:0});

  
  function bindEvents() { //function to bind socket functions
    socket.on("connect", async () => { //On Connect
      isConnected.value = true;
      //sendHelloWorld(); //move chat-Login here
      authUser();
    });

    socket.on("disconnect", () => { //On disconnect
      isConnected.value = false;
      displayDisconnect();
      //console.log("Disconnected from server");
    });

    socket.on("message-channel", (message: string) => { //Incoming message on "message-channel"
      messages.value.push(message);
    });


    socket.on("chat-message", (message: ChatMessage) => { //Incoming chat message from another user
      //console.log("Received chat message", message);
      newChatMessages.value++;
      let channel = null;
      if(message.from == data.value?.user?.name) { 
        channel = chats.value.find(c => c.name == message.to);
      } else {
        channel = chats.value.find(c => c.name == message.from);
      }
  
      if(!channel) {
        channel = new ChatChannel(message.from);
        chats.value.push(channel);
      }

      channel.messages.push(message);
    });

    socket.on("online-users", (users: string[]) => { //Currently online users
      //console.log("Received chat users", users);
      onlineUsers.value = users;
    });
    
    socket.on("farmbot-position", (pos: any) => { 
      //console.log("Received  fbot pos", pos);
      farmbotPosition.value = pos;
    });

    socket.on("farmbot-task-queue", (q: any[]) => { 
        queue.value = q;
    });

    socket.on("farmbot-current-task", (task: any) => {
      currentTask.value = task;
    });

    socket.on("all-users", (users: string[]) => { //All users
      //console.log("Received all users", users);
      availableUsers.value = users;
        //foreach user, create a chat channel
      users.forEach(user => {
        let channel = chats.value.find(c => c.name == user);
        if(!channel) {
          channel = new ChatChannel(user);
         chats.value.push(channel);
        }
      });

    });

 /*    socket.on('farmbot-position', (position: any) => {
       farmbotPosition.value = position;
     //console.log(farmbotPosition); });*/
   }

  function sendMessage(message: string) { //function to send a message
    messages.value.push(message);
    socket.emit("message", message);
  }


  function sendHelloWorld() { //function to send a hello world message
    socket.emit("hello-world", "Hello, world!");
  }


  // CHAT SERVICE

  /**
   * Log into the chat service
   * @param name Chat username
   *
  async function chatLogin(name: string) { //function to login to chat
    socket.emit("chat-login", name);
    userData.value = await $fetch("/api/prisma/user/"+name);
  }*/

  async function authUser() { //function to authenticate a user
    socket.emit("auth-user", data.value?.user?.name)
    _userData.value = await $fetch("/api/prisma/user/"+data.value?.user?.name);

    newChatMessages.value = await $fetch("/api/prisma/newMessages");
  }


  function sendChatMessage(to: string, message: string) { //function to send a chat message
    
    if(!_userData.value) {
      console.error("User not authenticated");
      return;
    }
    if(!to || !message) {
      console.error("Invalid message");
      return;
    }

    let groupMsg = false;
    /*if(to == _userData.value.team.name) { 
      groupMsg = true;
    }*/

    let msg = new ChatMessage(_userData.value.name, to, message, groupMsg, new Date());
    socket.emit("chat-message", msg);
    logAction("sendChatMessage", {to: to});
  }


  async function getChatMessages(chat: string) { //function to get chat messages from database, but only once
    let c = chats.value.find(c => c.name == chat);
    if(!c || c.synched) {
      return;
    }
    let chatMessages: ChatMessage[] = [];
    chatMessages = await $fetch("/api/prisma/"+chat+"/false");
    
    c?.messages.push(...chatMessages);
    c.synched = true;

  }

  //Logging
  function logAction(action: string, data: any) {
    let log = {action: action, data: data};
    socket.emit("log-action", log);
  }

  return {queue, currentTask, farmbotPosition,socket ,isConnected, messages, onlineUsers, userData, availableUsers, chats, newChatMessages, bindEvents, sendMessage, sendHelloWorld, sendChatMessage, getChatMessages, logAction };

});