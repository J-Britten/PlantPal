export class UserSocket { //For now people can pick their own username, later we will connect this to the database
    userId: number;
    name: string;
    socketId: string; //we need to know who is who
    loginTime: Date = new Date();
    socket: any;

    constructor(userId:number, name: string, id: string, socket: any) {
        this.userId = userId;
        this.name = name;
        this.socketId = id;
        this.socket = socket;
    }
}