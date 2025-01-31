/**
 * Get chat messages from the database for a specific client
 */

import { PrismaClient } from '@prisma/client';

import { getServerSession } from "#auth"
import { ChatMessage } from '~/server/chat/chatMessage';

const prisma = new PrismaClient();



export default defineEventHandler(async (event) => {

    const session = await getServerSession(event)
    
    const { chatSlug, isTeamChat } = event.context.params as { chatSlug: string, isTeamChat: string };

    let a = session?.user?.name

    let userA = await prisma.user.findUnique({
        where: {
            name: a ?? undefined
        }
    })

    let b : string = chatSlug

    let userB = await prisma.user.findUnique({
        where: {
            name: b ?? undefined
        },
    })

    let min = Math.min(userA.id, userB.id);
    let max = Math.max(userA.id, userB.id);

    let messages = [];
    if(isTeamChat == "true") { //if group chat
        messages = await prisma.chatMessage.findMany({ 
            where: {
                chatIdentifier: userA.teamId+"",
            }
        });
    } else {
        messages = await prisma.chatMessage.findMany({
            where: {
                chatIdentifier: min + "_" + max,
            }
        });

    }

    let chatMessages: ChatMessage[] = [];
    for (let message of messages) {
        chatMessages.push(new ChatMessage(
            message.fromUserId == userA.id ? a ?? '' : b ?? '',
            message.toUserId == userA.id ? a ?? '' : b ?? '',
            message.message,
            message.toTeamId != -1,
            message.createdAt
        ));
    }


    return chatMessages;
});