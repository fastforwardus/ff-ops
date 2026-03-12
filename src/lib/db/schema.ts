import { pgTable, uuid, text, timestamp, date, boolean, integer, pgEnum } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const userRoleEnum = pgEnum("user_role", ["admin", "vendor", "ops", "client"])
export const dunsStatusEnum = pgEnum("duns_status", ["has", "pending", "waiting"])
export const urgencyEnum = pgEnum("urgency", ["critical", "high", "normal"])
export const submissionStatusEnum = pgEnum("submission_status", [
  "waiting_duns", "pending_review", "under_review",
  "ready_to_submit", "submitted", "confirmed", "problem"
])

export const users = pgTable("users", {
  id:           uuid("id").primaryKey().defaultRandom(),
  email:        text("email").notNull().unique(),
  name:         text("name").notNull(),
  passwordHash: text("password_hash"),
  role:         userRoleEnum("role").notNull().default("vendor"),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
})

export const services = pgTable("services", {
  id:          uuid("id").primaryKey().defaultRandom(),
  key:         text("key").notNull().unique(),
  labelEn:     text("label_en").notNull(),
  labelEs:     text("label_es").notNull(),
  priceUsd:    integer("price_usd").notNull(),
  category:    text("category").notNull(),
  active:      boolean("active").notNull().default(true),
  sortOrder:   integer("sort_order").notNull().default(0),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
  updatedById: uuid("updated_by_id").references(() => users.id),
})

export const priceHistory = pgTable("price_history", {
  id:          uuid("id").primaryKey().defaultRandom(),
  serviceId:   uuid("service_id").references(() => services.id).notNull(),
  oldPriceUsd: integer("old_price_usd").notNull(),
  newPriceUsd: integer("new_price_usd").notNull(),
  changedById: uuid("changed_by_id").references(() => users.id),
  changedAt:   timestamp("changed_at").defaultNow().notNull(),
})

export const clients = pgTable("clients", {
  id:                   uuid("id").primaryKey().defaultRandom(),
  vendorId:             uuid("vendor_id").references(() => users.id).notNull(),
  portalEmail:          text("portal_email").notNull(),
  portalPasswordHash:   text("portal_password_hash"),
  firstLoginAt:         timestamp("first_login_at"),
  companyName:          text("company_name").notNull(),
  tradeNames:           text("trade_names"),
  country:              text("country").notNull(),
  address:              text("address").notNull(),
  state:                text("state"),
  postalCode:           text("postal_code"),
  phone:                text("phone").notNull(),
  emergencyPhone:       text("emergency_phone"),
  ownerEmail:           text("owner_email").notNull(),
  dunsStatus:           dunsStatusEnum("duns_status").notNull().default("has"),
  dunsNumber:           text("duns_number"),
  dunsRequestedAt:      date("duns_requested_at"),
  parentCompanyName:    text("parent_company_name"),
  parentCompanyCountry: text("parent_company_country"),
  createdAt:            timestamp("created_at").defaultNow().notNull(),
})

export const submissions = pgTable("submissions", {
  id:                uuid("id").primaryKey().defaultRandom(),
  clientId:          uuid("client_id").references(() => clients.id).notNull(),
  assignedToId:      uuid("assigned_to_id").references(() => users.id),
  serviceId:         uuid("service_id").references(() => services.id).notNull(),
  status:            submissionStatusEnum("status").notNull().default("pending_review"),
  urgency:           urgencyEnum("urgency").notNull().default("normal"),
  etaDate:           date("eta_date"),
  expiresAt:         date("expires_at"),
  fdaRegNumber:      text("fda_reg_number"),
  etaStep2:          text("eta_step2"),
  etaStep3:          text("eta_step3"),
  etaStep4:          text("eta_step4"),
  internalNotes:     text("internal_notes"),
  paymentAccredited: boolean("payment_acredited").notNull().default(false),
  submittedAt:       timestamp("submitted_at"),
  confirmedAt:       timestamp("confirmed_at"),
  createdAt:         timestamp("created_at").defaultNow().notNull(),
})

export const facilityData = pgTable("facility_data", {
  id:              uuid("id").primaryKey().defaultRandom(),
  submissionId:    uuid("submission_id").references(() => submissions.id).notNull().unique(),
  ownerName:       text("owner_name"),
  ownerRole:       text("owner_role"),
  ownerAddress:    text("owner_address"),
  ownerEmail:      text("owner_email"),
  ownerPhone:      text("owner_phone"),
  authorizerName:  text("authorizer_name"),
  authorizerEmail: text("authorizer_email"),
  activityTypes:   text("activity_types").array(),
  foodCategories:  text("food_categories").array(),
  seasonal:        boolean("seasonal").default(false),
  monthsOperation: text("months_operation"),
  usAgentEmail:    text("us_agent_email"),
})

export const documents = pgTable("documents", {
  id:           uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").references(() => submissions.id).notNull(),
  uploadedById: uuid("uploaded_by_id").references(() => users.id),
  fileName:     text("file_name").notNull(),
  fileUrl:      text("file_url").notNull(),
  docType:      text("doc_type"),
  verified:     boolean("verified").default(false),
  uploadedAt:   timestamp("uploaded_at").defaultNow().notNull(),
})

export const activityLog = pgTable("activity_log", {
  id:           uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").references(() => submissions.id).notNull(),
  userId:       uuid("user_id").references(() => users.id),
  action:       text("action").notNull(),
  fromStatus:   submissionStatusEnum("from_status"),
  toStatus:     submissionStatusEnum("to_status"),
  notes:        text("notes"),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
})

export const messages = pgTable("messages", {
  id:           uuid("id").primaryKey().defaultRandom(),
  fromId:       uuid("from_id").references(() => users.id).notNull(),
  toId:         uuid("to_id").references(() => users.id),
  submissionId: uuid("submission_id").references(() => submissions.id),
  clientId:     uuid("client_id").references(() => clients.id),
  tag:          text("tag").notNull().default("internal"),
  body:         text("body").notNull(),
  readAt:       timestamp("read_at"),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
})

export const emailLog = pgTable("email_log", {
  id:           uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").references(() => submissions.id),
  clientId:     uuid("client_id").references(() => clients.id),
  toEmail:      text("to_email").notNull(),
  type:         text("type").notNull(),
  resendId:     text("resend_id"),
  status:       text("status").default("sent"),
  sentAt:       timestamp("sent_at").defaultNow().notNull(),
})

export const serviceRequests = pgTable("service_requests", {
  id:        uuid("id").primaryKey().defaultRandom(),
  clientId:  uuid("client_id").references(() => clients.id).notNull(),
  services:  text("services").array().notNull(),
  notes:     text("notes"),
  status:    text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const clientsRelations = relations(clients, ({ one, many }) => ({
  vendor:      one(users, { fields: [clients.vendorId], references: [users.id] }),
  submissions: many(submissions),
}))

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  client:       one(clients, { fields: [submissions.clientId], references: [clients.id] }),
  assignedTo:   one(users, { fields: [submissions.assignedToId], references: [users.id] }),
  service:      one(services, { fields: [submissions.serviceId], references: [services.id] }),
  facilityData: one(facilityData),
  documents:    many(documents),
  activityLog:  many(activityLog),
}))

export const servicesRelations = relations(services, ({ many }) => ({
  submissions:  many(submissions),
  priceHistory: many(priceHistory),
}))

// ── Notifications ──────────────────────────────────────────────────────────
export const notifications = pgTable("notifications", {
  id:        uuid("id").primaryKey().defaultRandom(),
  userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:      text("type").notNull(),
  title:     text("title").notNull(),
  body:      text("body"),
  link:      text("link"),
  read:      boolean("read").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})
