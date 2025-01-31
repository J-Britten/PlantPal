import { UserSocket } from "./user";

export class ChatMessage {
    from: string;
    to: string;
    message: string;
    groupMsg: boolean;
    time: Date;

  constructor(from: string, to: string, message: string, groupMsg: boolean, timeStamp: Date) {
    this.from = from;
    this.to = to;
    this.message = message;
    this.groupMsg = groupMsg;
    this.time = timeStamp;
  }
}