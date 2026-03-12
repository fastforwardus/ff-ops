import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        })

        if (!user || !user.passwordHash) return null

        let valid = false

        if (user.passwordHash.startsWith("$seed$")) {
          const { createHash } = await import("crypto")
          const hashed = "$seed$" + createHash("sha256").update(credentials.password as string).digest("hex")
          valid = hashed === user.passwordHash
        } else {
          const bcrypt = await import("bcryptjs")
          valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        }

        if (!valid) return null

        return {
          id:    user.id,
          email: user.email,
          name:  user.name,
          role:  user.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id   = token.sub!
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.AUTH_SECRET,
})
