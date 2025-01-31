/**
 * Code adapted from: 
 * https://github.com/ismaelcmajada/Nuxt3-Vuetify3-Prisma-Auth
 * 
 * This file authenticates users
 */

import CredentialsProvider from 'next-auth/providers/credentials'
import { NuxtAuthHandler } from '#auth'
import { compare } from "bcrypt"
import { PrismaClient } from "@prisma/client";
import prisma from '~/server/utils/prisma';
export default NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret,
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/login',
  },
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
     
      async authorize (credentials: any) {

        const user = await prisma.user.findUnique({
          where: { name: credentials?.username },
        })

        if(!user) {
          throw createError({
            statusCode: 403,
            statusMessage: "Credentials not working",
          })

        }

        const isPasswordValid = await compare(credentials?.password, user.password)

        if (!isPasswordValid) {
          throw createError({
            statusCode: 403,
            statusMessage: "Credentials not working",
          })

        }

        return user
      }
    })
  ],
  callbacks: {
    // Specify here the payload of your token and session
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) { 
        token.id = user.id
        token.nombre = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }: { session: any, token: any }) {
      session.user.id = token.id
      session.user.nombre = token.name
      session.user.email = token.email
      return session
    },
  },
})