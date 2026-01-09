import { pgTable, foreignKey, serial, integer, timestamp, numeric, text, date } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const workoutExercises = pgTable("workout_exercises", {
	id: serial().primaryKey().notNull(),
	workoutId: integer("workout_id").notNull(),
	exerciseId: integer("exercise_id").notNull(),
	order: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.workoutId],
			foreignColumns: [workouts.id],
			name: "workout_exercises_workout_id_workouts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.exerciseId],
			foreignColumns: [exercises.id],
			name: "workout_exercises_exercise_id_exercises_id_fk"
		}).onDelete("cascade"),
]);

export const sets = pgTable("sets", {
	id: serial().primaryKey().notNull(),
	workoutExerciseId: integer("workout_exercise_id").notNull(),
	setNumber: integer("set_number").notNull(),
	weight: numeric().notNull(),
	reps: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.workoutExerciseId],
			foreignColumns: [workoutExercises.id],
			name: "sets_workout_exercise_id_workout_exercises_id_fk"
		}).onDelete("cascade"),
]);

export const workouts = pgTable("workouts", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: text(),
	date: date().notNull(),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const exercises = pgTable("exercises", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	userId: text("user_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
