import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"
import { createHash } from "crypto"

config({ path: ".env.local" })

const sql = neon(process.env.DATABASE_URL)

// Simple hash para el seed — bcrypt no funciona en mjs fácilmente
// Después NextAuth usa bcrypt normal
function hashPassword(password) {
  return "$seed$" + createHash("sha256").update(password).digest("hex")
}

const email = "info@fastfwdus.com"
const password = "FastForward2026!"  // cambialo después desde el panel
const name = "Admin FastForward"

await sql`
  INSERT INTO users (id, email, name, password_hash, role)
  VALUES (
    gen_random_uuid(),
    ${email},
    ${name},
    ${hashPassword(password)},
    'admin'
  )
  ON CONFLICT (email) DO NOTHING
`

console.log("✓ Admin creado:")
console.log("  Email:    " + email)
console.log("  Password: " + password)
console.log("  Rol:      admin")
