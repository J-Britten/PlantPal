
import { getServerSession } from "#auth"
import { ChatMessage } from "~/server/chat/chatMessage";

export default defineEventHandler(async (event) => {

  const session = await getServerSession(event)
  const name = session?.user?.name;
  
    let user = await prisma.user.findUnique({
        where: {
            name: name ?? undefined
        }
    })

    if (!user) {
        return 0;
    }

    let lastSeen = await prisma.userTime.findMany({
        where: {
            userId: user.id
        },
        orderBy: {
            id: 'desc'
        },
        take: 1
    })

    if (lastSeen.length == 0) {
        return 0;
    }

    let chatMessages = await prisma.chatMessage.findMany({
      where: {
        toUserId: user.id,
        createdAt: {
          gt: lastSeen[0]?.logoffTime
        }
      }
    });

    return chatMessages.length;
})
