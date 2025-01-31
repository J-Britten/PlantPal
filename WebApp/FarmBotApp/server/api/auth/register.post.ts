import { hash } from "bcrypt"
import prisma from "~/server/utils/prisma"


export default defineEventHandler(async (event) => {

    return { message: "Registration is disabled"};
    const body = await readBody(event)


    const userExists = await prisma.user.findFirst({
        where: { 
            //OR: [
              //  { email: body.email },
                //{ name: body.name }
            //]
            name: body.name
        }
    })

    if(userExists) {
        throw createError({
            statusCode: 403,
            statusMessage: "User already exists",
        })
    }

    await prisma.user.create({
        data: {
           // email: body.email,
            name: body.name,
            password: await hash(body.password, 12)
        },
    })

    setResponseStatus(event, 201)
    
    return { message: "User created" }
})

