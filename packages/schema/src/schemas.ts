import { z } from "zod";

export const courseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  professor_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Course = z.infer<typeof courseSchema>;

export const worldSchema = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  current_period: z.number().int().min(1),
  status: z.enum(["setup", "active", "paused", "completed"]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type World = z.infer<typeof worldSchema>;

export const teamSchema = z.object({
  id: z.string().uuid(),
  world_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  created_at: z.string().datetime(),
});
export type Team = z.infer<typeof teamSchema>;

export const teamMemberSchema = z.object({
  id: z.string().uuid(),
  team_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role_in_team: z.string().max(100).nullable(),
  created_at: z.string().datetime(),
});
export type TeamMember = z.infer<typeof teamMemberSchema>;

export const periodSchema = z.object({
  id: z.string().uuid(),
  world_id: z.string().uuid(),
  period_number: z.number().int().min(1),
  status: z.enum(["pending", "decisions_open", "processing", "completed"]),
  deadline: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
});
export type Period = z.infer<typeof periodSchema>;

export const decisionsSchema = z.object({
  id: z.string().uuid(),
  period_id: z.string().uuid(),
  team_id: z.string().uuid(),
  data: z.record(z.unknown()),
  submitted_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Decisions = z.infer<typeof decisionsSchema>;

export const simulationResultSchema = z.object({
  id: z.string().uuid(),
  period_id: z.string().uuid(),
  team_id: z.string().uuid(),
  state_snapshot: z.record(z.unknown()),
  report: z.record(z.unknown()),
  trace: z.record(z.unknown()),
  created_at: z.string().datetime(),
});
export type SimulationResult = z.infer<typeof simulationResultSchema>;
