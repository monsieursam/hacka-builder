import { pgTable, serial, text, timestamp, varchar, boolean, integer, json, foreignKey, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define enums
export const hackathonStatusEnum = ['draft', 'published', 'completed', 'cancelled'] as const;
export const registrationStatusEnum = ['open', 'closed', 'invite_only'] as const;

// Define all tables first
export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  first_name: varchar('first_name'),
  last_name: varchar('last_name'),
  name: varchar('name'),
  email: varchar('email').notNull().unique(),
  image_url: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const hackathons = pgTable('hackathons', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('draft').$type<typeof hackathonStatusEnum[number]>(),
  registrationStatus: varchar('registration_status', { length: 50 }).notNull().default('closed').$type<typeof registrationStatusEnum[number]>(),
  location: text('location'),
  isVirtual: boolean('is_virtual').default(false).notNull(),
  maxTeamSize: integer('max_team_size').default(5).notNull(),
  minTeamSize: integer('min_team_size').default(1).notNull(),
  maxParticipants: integer('max_participants'),
  maxTeams: integer('max_teams'),
  banner: text('banner'),
  logo: text('logo'),
  theme: text('theme'),
  rules: text('rules'),
  organizerId: varchar('organizer_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

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

export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id),
  userId: varchar('user_id').notNull().references(() => users.id),
  role: varchar('role', { length: 50 }).default('member').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

export const teamInvitations = pgTable('team_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id),
  email: varchar('email').notNull(),
  invitedById: varchar('invited_by_id').notNull().references(() => users.id),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const externalTeamMembers = pgTable('external_team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id),
  name: varchar('name').notNull(),
  addedById: varchar('added_by_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tracks = pgTable('tracks', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  hackathonId: uuid('hackathon_id').notNull().references(() => hackathons.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

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

export const judges = pgTable('judges', {
  id: uuid('id').primaryKey().defaultRandom(),
  hackathonId: uuid('hackathon_id').notNull().references(() => hackathons.id),
  userId: varchar('user_id').notNull().references(() => users.id),
  isAccepted: boolean('is_accepted').default(false).notNull(),
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id').notNull().references(() => submissions.id),
  judgeId: uuid('judge_id').notNull().references(() => judges.id),
  score: integer('score').notNull(),
  feedback: text('feedback'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Then define all relations
export const usersRelations = relations(users, ({ many }) => ({
  hackathons: many(hackathons),
  teamMembers: many(teamMembers),
  judges: many(judges),
}));

export const hackathonsRelations = relations(hackathons, ({ one, many }) => ({
  organizer: one(users, {
    fields: [hackathons.organizerId],
    references: [users.id],
  }),
  teams: many(teams),
  tracks: many(tracks),
  prizes: many(prizes),
  judges: many(judges),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  hackathon: one(hackathons, {
    fields: [teams.hackathonId],
    references: [hackathons.id],
  }),
  members: many(teamMembers),
  submissions: many(submissions),
  invitations: many(teamInvitations),
  externalMembers: many(externalTeamMembers),
}));

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

export const teamInvitationsRelations = relations(teamInvitations, ({ one }) => ({
  team: one(teams, {
    fields: [teamInvitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [teamInvitations.invitedById],
    references: [users.id],
  }),
}));

export const externalTeamMembersRelations = relations(externalTeamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [externalTeamMembers.teamId],
    references: [teams.id],
  }),
  addedBy: one(users, {
    fields: [externalTeamMembers.addedById],
    references: [users.id],
  }),
}));

export const tracksRelations = relations(tracks, ({ one, many }) => ({
  hackathon: one(hackathons, {
    fields: [tracks.hackathonId],
    references: [hackathons.id],
  }),
  prizes: many(prizes),
  submissions: many(submissions),
}));

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

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  team: one(teams, {
    fields: [submissions.teamId],
    references: [teams.id],
  }),
  track: one(tracks, {
    fields: [submissions.trackId],
    references: [tracks.id],
  }),
  reviews: many(reviews),
}));

export const judgesRelations = relations(judges, ({ one, many }) => ({
  hackathon: one(hackathons, {
    fields: [judges.hackathonId],
    references: [hackathons.id],
  }),
  user: one(users, {
    fields: [judges.userId],
    references: [users.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  submission: one(submissions, {
    fields: [reviews.submissionId],
    references: [submissions.id],
  }),
  judge: one(judges, {
    fields: [reviews.judgeId],
    references: [judges.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type Hackathon = typeof hackathons.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type Track = typeof tracks.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type Prize = typeof prizes.$inferSelect;
export type Judge = typeof judges.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type ExternalTeamMember = typeof externalTeamMembers.$inferSelect;
