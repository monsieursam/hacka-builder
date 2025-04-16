import { pgTable, serial, text, timestamp, varchar, boolean, integer, json, foreignKey, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  first_name: varchar('first_name'),
  last_name: varchar('last_name'),
  email: varchar('email').notNull().unique(),
  image_url: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  hackathons: many(hackathons),
  teamMembers: many(teamMembers),
}));

export const hackathons = pgTable('hackathons', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  registrationStatus: varchar('registration_status', { length: 50 }).notNull().default('closed'),
  location: text('location'),
  isVirtual: boolean('is_virtual').default(false).notNull(),
  maxTeamSize: integer('max_team_size').default(5).notNull(),
  minTeamSize: integer('min_team_size').default(1).notNull(),
  maxParticipants: integer('max_participants'),
  banner: text('banner'),
  logo: text('logo'),
  theme: text('theme'),
  rules: text('rules'),
  organizerId: varchar('organizer_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const hackathonsRelations = relations(hackathons, ({ one, many }) => ({
  organizer: one(users, {
    fields: [hackathons.organizerId],
    references: [users.id],
  }),
  teams: many(teams),
  tracks: many(tracks),
  prizes: many(prizes),
}));

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  hackathonId: uuid('hackathon_id').notNull().references(() => hackathons.id),
  projectName: varchar('project_name', { length: 255 }),
  lookingForMembers: boolean('looking_for_members').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teamsRelations = relations(teams, ({ one, many }) => ({
  hackathon: one(hackathons, {
    fields: [teams.hackathonId],
    references: [hackathons.id],
  }),
  members: many(teamMembers),
}));

export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id),
  userId: varchar('user_id').notNull().references(() => users.id),
  role: varchar('role', { length: 50 }).default('member').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const tracks = pgTable('tracks', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  hackathonId: uuid('hackathon_id').notNull().references(() => hackathons.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tracksRelations = relations(tracks, ({ one }) => ({
  hackathon: one(hackathons, {
    fields: [tracks.hackathonId],
    references: [hackathons.id],
  }),
}));

export const submissions = pgTable('submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id),
  trackId: uuid('track_id').references(() => tracks.id),
  projectName: varchar('project_name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  demoUrl: text('demo_url'),
  repoUrl: text('repo_url'),
  presentationUrl: text('presentation_url'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const submissionsRelations = relations(submissions, ({ one }) => ({
  team: one(teams, {
    fields: [submissions.teamId],
    references: [teams.id],
  }),
  track: one(tracks, {
    fields: [submissions.trackId],
    references: [tracks.id],
  }),
}));

export const prizes = pgTable('prizes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  value: integer('value'),
  currency: varchar('currency', { length: 10 }).default('USD'),
  rank: integer('rank'),
  hackathonId: uuid('hackathon_id').notNull().references(() => hackathons.id),
  trackId: uuid('track_id').references(() => tracks.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const prizesRelations = relations(prizes, ({ one }) => ({
  hackathon: one(hackathons, {
    fields: [prizes.hackathonId],
    references: [hackathons.id],
  }),
  track: one(tracks, {
    fields: [prizes.trackId],
    references: [tracks.id],
  }),
}));

export const hackathonStatusEnum = ['draft', 'published', 'active', 'completed', 'archived'] as const;
export type HackathonStatus = typeof hackathonStatusEnum[number];

export type Hackathon = typeof hackathons.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Track = typeof tracks.$inferSelect;
export type User = typeof users.$inferSelect; 
export type TeamMember = typeof teamMembers.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type Prize = typeof prizes.$inferSelect;
