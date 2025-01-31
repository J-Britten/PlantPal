import { ChatMessage } from "./chatMessage";

export class ChatChannel {
    name: string;
    messages: ChatMessage[] ;
    synched: boolean = false;

    constructor(name: string) {
        this.name =  name;
        this.messages = [];
        this.synched = false;
    }
}