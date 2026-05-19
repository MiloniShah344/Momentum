export enum FitnessGoal {
  LOSE_WEIGHT = 'lose_weight',
  BUILD_MUSCLE = 'build_muscle',
  MAINTAIN = 'maintain',
  IMPROVE_ENDURANCE = 'improve_endurance',
}

export enum ThemePreference {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum WeightUnit {
  KG = 'kg',
  LBS = 'lbs',
}

export enum MeasurementUnit {
  CM = 'cm',
  INCH = 'inch',
}

export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  LEGS = 'legs',
  SHOULDERS = 'shoulders',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  CORE = 'core',
  CARDIO = 'cardio',
  FULL_BODY = 'full_body',
}

export enum Equipment {
  BARBELL = 'barbell',
  DUMBBELL = 'dumbbell',
  CABLE = 'cable',
  MACHINE = 'machine',
  BODYWEIGHT = 'bodyweight',
  KETTLEBELL = 'kettlebell',
  RESISTANCE_BAND = 'resistance_band',
  CARDIO_MACHINE = 'cardio_machine',
  OTHER = 'other',
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum WorkoutStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum WorkoutType {
  PUSH = 'push',
  PULL = 'pull',
  LEGS = 'legs',
  UPPER = 'upper',
  LOWER = 'lower',
  FULL_BODY = 'full_body',
  CARDIO = 'cardio',
  CUSTOM = 'custom',
}

export enum Intensity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum HabitType {
  WATER = 'water',
  PROTEIN = 'protein',
  SLEEP = 'sleep',
  STRETCHING = 'stretching',
  MEDITATION = 'meditation',
  STEPS = 'steps',
  CUSTOM = 'custom',
}

export enum ReminderType {
  WORKOUT = 'workout',
  WATER = 'water',
  SLEEP = 'sleep',
  HABIT = 'habit',
}

export enum NotificationType {
  ACHIEVEMENT = 'achievement',
  STREAK = 'streak',
  PR = 'pr',
  REMINDER = 'reminder',
  GENERAL = 'general',
}

export enum TemplateCategory {
  PUSH_PULL_LEGS = 'push_pull_legs',
  UPPER_LOWER = 'upper_lower',
  FULL_BODY = 'full_body',
  HOME_WORKOUT = 'home_workout',
  CARDIO = 'cardio',
  STRENGTH = 'strength',
  CUSTOM = 'custom',
}
