import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { createHash } from "crypto"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const [user] = await db.select().from(users).where(eq(users.email, credentials.email as string))
        if (!user) return null

        const hash = user.passwordHash ?? ""
        let valid = false
        let needsPwChange = false

        if (hash.startsWith("$seed$")) {
          const expected = "$seed$" + createHash("sha256").update(credentials.password as string).digest("hex")
          valid = hash === expected
          needsPwChange = valid
        } else {
          valid = await bcrypt.compare(credentials.password as string, hash)
        }

        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role, needsPwChange }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id           = user.id
        token.role         = (user as any).role
        token.name         = user.name
        token.needsPwChange = (user as any).needsPwChange ?? false
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id           = token.id
        ;(session.user as any).role        = token.role
        ;(session.user as any).needsPwChange = token.needsPwChange
        session.user.name                  = token.name as string
      }
      return session
    },
  },
})
