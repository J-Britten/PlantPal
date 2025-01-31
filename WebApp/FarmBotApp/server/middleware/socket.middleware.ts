import { Socket, Server } from 'socket.io'
import { UserSocket } from '../chat/user';
import { ChatMessage } from '../chat/chatMessage';
import FarmbotWrapper from '../utils/farmbotWrapper';
import { emitQueue } from '../utils/CustomQueue';
/**
 * This middleware acts as the server for the socket.io socket connection
 * We need a socket to make sending big data to and between clients easier
 * 
 * Note: Ignore the fact that io is marked as "does not exist". It very much does
 */

let appSocket = {
  emit: (channel: string, message: string) => {
    console.log('Not initiated yet', channel, message)
  }
}

let socketUserMappings: UserSocket[] = [] //this exists for the sake of mapping users to their socket id
let onlineUsers: string[] = []


export default defineEventHandler(async (event) => {

  event.context.appSocket = appSocket

  if (global.io) return
  console.log('Initiating socket.middleware')
  let botWrapper = new FarmbotWrapper();
  let allUsers = await prisma.user.findMany({
    select: {
      name: true,
      id: true,
      teamId: true
    }
  });

  let isLightOn = false;


  const node = event.node
  global.io = new Server(node.res.socket?.server)
  global.io.on('connection', async (socket: Socket) => {
    console.log('Socket connected', socket.id);
    socket.emit('message-channel', `You connected: ${socket.id}`);
    socket.emit('all-users', allUsers.map(u => u.name));

    //on connect send task queue info
    if (global.CurrentTask) {
      global.CurrentTask.emit();
    }
    emitQueue();

    /*socket.on('message', (data) => {
      global.io.emit('message-channel', 'Hello from the server: ' + Math.random() + data)
    })*/

    socket.on('hello-world', (data) => {
      //idk do something here
      socket.broadcast.emit('message-channel', `User ${socket.id} connected`)
    })

    socket.on('disconnect', async () => {
      console.log('Socket disconnected', socket.id);
      //Log the time the person was online
      let logOffTime = new Date();
      let user = socketUserMappings.find(u => u.socketId === socket.id); //if the person came online in a new tab before disconnecting, we wont find anything which is good
      if (user) { //this should catch any issues with the user not being found after opening a new tab
        console.log('User logged off', user.name);
        await prisma.userTime.create({
          data: {
            userId: user.userId,
            loginTime: user.loginTime,
            logoffTime: logOffTime
          }
        });

        //Push the user action logs to the database. This is done here to ensure that the user logs are not lost

      }

      onlineUsers = onlineUsers.filter(u => u !== socketUserMappings.find(u => u.socketId === socket.id)?.name);
      socketUserMappings = socketUserMappings.filter(u => u.socketId !== socket.id);
      global.io.emit('online-users', onlineUsers);

      const currHour = new Date().getHours();
      // if (onlineUsers.length == 0 && isLightOn) { //light is off
      //   //console.log("light off")
      //   global.farmbotSocket.execSequence(209612);
      //   isLightOn = false;
      // }
      /*     global.farmbotSocket.on("status", (status : any) => {
             const pos = status.location_data.position;
            // global.io.emit('farmbot-position', pos); //global.io is the global socket, we can send messages to all clients this way
             console.log(`FarmBot Position: (${pos.x}, ${pos.y}, ${pos.z})`);
           });
     */

    });



    /**
     * FarmBot related events
     * NOTE: We can either go for multiple different messages, or one general message with 
     * a body that contains the type of message
     * Said type is then parsed inside of the farmbotWrapper class. This could help keep this socket middleware clean
     *  */
    /*socket.on('farmbot-move', (data) => {
      console.log('Farmbot move', data);
      botWrapper.moveBot(data.x, data.y, data.z);
    });*/

    //übergabe einer Liste
    socket.on('farmbotList', async (data) => {
      console.log('Farmbot message received:', data);

      //if (Array.isArray(data.data) && data.type && typeof data.plantName === 'string') {
      if (data && typeof data === 'object' &&
        Array.isArray(data.data) &&
        typeof data.type === 'string' &&
        typeof data.name === 'string') {

        const message = {
          type: data.type,
          data: data.data,
          name: data.plantName
        };

        try {
          await botWrapper.handleGeneralListMessage(message);
          // Send confirmation to the client
          socket.emit('farmbot-action-complete', { success: true });
        } catch (error) {
          console.error('Error while processing farmbot message:', error);
          // Send error message to the client
          socket.emit('farmbot-action-complete', { success: false, error: error.message });
        }
      } else {
        console.error('Received invalid data:', data);
      }
    });

    socket.on('farmbot', async (data) => {
      // console.log('Farmbot message received:', data);
      // console.log('data', data);
      // console.log('data.data', data.data);
      // console.log('data number on x', typeof data.data.x);
      // console.log('data number on y', typeof data.data.y);
      // console.log('data number on z', typeof data.data.z);
      if (data && data.data && typeof data.data.x === 'number' && typeof data.data.y === 'number' && typeof data.data.z === 'number') {
        const message = {
          type: data.type,
          data: { x: data.data.x, y: data.data.y, z: data.data.z },
          name: data.name,
          plant: data.plant
        };

        try {
          await botWrapper.handleGeneralMessage(message);
          // Send confirmation to the client
          socket.emit('farmbot-action-complete', { type: message.type, name: message.name, success: true });
        } catch (error) {
          console.error('Error while processing farmbot message:', error);
          // Send error message to the client
          socket.emit('farmbot-action-complete', { type: message.type, name: message.name, success: false, error: error.message });
        }
      } else {
        console.error('Received invalid data:', data);
      }
    });

    /**
     * User Authentication, is sent to to the middleware immediately after login
     */
    socket.on('auth-user', async (name) => {
      console.log('User authentication: ', name);
      try {
        //this block should later be moved into on connection     
        let u: any = allUsers.find((u: any) => u.name === name); //find user by name
        // let team: any = await $fetch("/api/prisma/team/"+u.teamId); //find if team exists
        socket.join(u.teamId); //join the team room

        let socketUser = socketUserMappings.find(u => u.name === name);

        if (socketUser) { //Consider updating this to use an array of socket ids instead to avoid issues

          socketUser.socket.disconnect();
          socketUser.socketId = socket.id;
          socketUser.socket = socket;
        } else {
          socketUser = new UserSocket(u.id, name, socket.id, socket);
          socketUserMappings.push(socketUser);
        }

        let onlineUser = onlineUsers.find(u => u === name);

        if (!onlineUser) {
          onlineUsers.push(name);
        }

        global.io.emit('online-users', onlineUsers);

        const currHour = new Date().getHours();
        // if (onlineUsers.length > 0 && (currHour >= 22 || currHour < 6) && !isLightOn) { //if at leaset 1 user is online and its past 10pm, turn on lights
        //   // console.log("light on")
        //   global.farmbotSocket.execSequence(209613)
        //   isLightOn = true;
        // }


      } catch (e) {
        console.error('Chat login error', e);
      }
    })

    /** 
 * Chat related events
 */


    socket.on('chat-message', async (data) => {
      let msg = data as ChatMessage;


      let from = allUsers.find(u => u.name === msg.from);

      // return if user is not found
      if (!from) {
        console.error('User not found', msg.from);
        return;
      }


      if (msg.groupMsg) { //if group chat message
        global.io.to(from?.teamId).emit('chat-message', msg);

        prisma.chatMessage.create({ // create team chat message
          data: {
            chatIdentifier: from.teamId + "",
            fromUserId: from.id,
            toTeamId: from.teamId, // Ensure that from.teamId is always a number and not null
            toUserId: -1,
            message: msg.message
          }
        });

      } else {
        let to = allUsers.find(u => u.name === msg.to);

        if (!to) {
          console.error('User not found', msg.to);
          return;
        }

        try {
          let recID = socketUserMappings.find(u => u.name === msg.to)?.socketId;
          global.io.to(recID).emit('chat-message', msg);

          if (recID != socket.id.toString()) { //if the sender is not the receiver, send the message to the sender as well
            socket.emit('chat-message', msg);
          }
        } catch (e) {
          console.error('Error sending message', e);
        }

        let min = Math.min(from.id, to.id);
        let max = Math.max(from.id, to.id);

        await prisma.chatMessage.create({ //TODO: create team chat message
          data: {
            chatIdentifier: min + "_" + max,
            fromUserId: from.id,
            toUserId: to.id,  // Ensure that from.teamId is always a number and not null
            toTeamId: -1,
            message: msg.message
          }
        });
      }

    })

    //Logging user actions
    socket.on('log-action', async (data) => {
      let user = socketUserMappings.find(u => u.socketId === socket.id);
      if (user) { //this should catch any issues with the user not being found after opening a new tab
        /*if (!global.userLogs[user.name]) {
          global.userLogs[user.name] = [];
        }*/
        await prisma.userActivityLog.create({
          data: {
            userName: user.name,
            type: data.action,
            data: data.data,
            timestamp: new Date()
          }
        });

        //let log = { type: data.action, data: data.data, timestamp: new Date(), userName: user.name };
        /*global.userLogs[user.name].push(log); //we push the data here and then push it to the database when the user logs off, see the on disconnect event for that

        if (global.userLogs[user.name].length > 0) {
          await flushUserLogs(user.name)
        }*/


      }
    })
  });
})