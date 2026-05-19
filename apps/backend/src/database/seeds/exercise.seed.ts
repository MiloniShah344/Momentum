/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Exercise } from '../../entities/exercise.entity';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Exercise],
  ssl: { rejectUnauthorized: false },
  synchronize: false,
  logging: false,
});

const exercises = [
  // ── CHEST (8) ──────────────────────────────────────────
  {
    name: 'Barbell Bench Press',
    muscle_group: 'chest',
    equipment: 'barbell',
    difficulty: 'intermediate',
    description: 'Classic compound chest exercise performed on a flat bench.',
    instructions:
      'Lie on bench, grip bar wider than shoulder-width, lower bar to chest, press back up explosively.',
    is_global: true,
  },
  {
    name: 'Incline Dumbbell Press',
    muscle_group: 'chest',
    equipment: 'dumbbell',
    difficulty: 'intermediate',
    description: 'Upper chest developer using dumbbells on an inclined bench.',
    instructions:
      'Set bench to 30-45°, hold dumbbells at chest level, press up and slightly together, lower controlled.',
    is_global: true,
  },
  {
    name: 'Dumbbell Chest Flyes',
    muscle_group: 'chest',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    description: 'Isolation movement emphasising chest stretch and squeeze.',
    instructions:
      'Lie flat, hold dumbbells above chest, arc arms out and down until stretch is felt, squeeze back up.',
    is_global: true,
  },
  {
    name: 'Push-ups',
    muscle_group: 'chest',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description:
      'Fundamental bodyweight pressing exercise for chest and triceps.',
    instructions:
      'Place hands shoulder-width apart, lower chest to floor keeping body straight, press back up.',
    is_global: true,
  },
  {
    name: 'Cable Crossover',
    muscle_group: 'chest',
    equipment: 'cable',
    difficulty: 'intermediate',
    description: 'Cable isolation exercise for full chest contraction.',
    instructions:
      'Stand between two cables set high, pull handles forward and together in arc motion, squeeze at peak.',
    is_global: true,
  },
  {
    name: 'Decline Bench Press',
    muscle_group: 'chest',
    equipment: 'barbell',
    difficulty: 'intermediate',
    description: 'Targets lower chest with a declined bench angle.',
    instructions:
      'Set bench to -15°, lower bar to lower chest, press upward focusing on lower pec contraction.',
    is_global: true,
  },
  {
    name: 'Chest Dips',
    muscle_group: 'chest',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    description: 'Bodyweight compound exercise targeting lower chest.',
    instructions:
      'Lean forward on parallel bars, lower until chest is engaged, press back up.',
    is_global: true,
  },
  {
    name: 'Pec Deck Machine',
    muscle_group: 'chest',
    equipment: 'machine',
    difficulty: 'beginner',
    description: 'Machine isolation for full chest contraction.',
    instructions:
      'Sit with arms on padded levers, bring pads together in front of chest, control the return.',
    is_global: true,
  },

  // ── BACK (10) ──────────────────────────────────────────
  {
    name: 'Conventional Deadlift',
    muscle_group: 'back',
    equipment: 'barbell',
    difficulty: 'advanced',
    description: 'King of all lifts — works the entire posterior chain.',
    instructions:
      'Stand over bar, bend and grip outside legs, drive floor away keeping back neutral, lock out at top.',
    is_global: true,
  },
  {
    name: 'Pull-ups',
    muscle_group: 'back',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    description: 'Compound back exercise using overhand bodyweight pulling.',
    instructions:
      'Hang from bar with overhand grip, pull chest to bar, lower in a controlled manner.',
    is_global: true,
  },
  {
    name: 'Barbell Bent Over Row',
    muscle_group: 'back',
    equipment: 'barbell',
    difficulty: 'intermediate',
    description: 'Compound rowing movement for back thickness and strength.',
    instructions:
      'Hinge at hips, hold bar, pull to lower chest keeping elbows close, lower controlled.',
    is_global: true,
  },
  {
    name: 'Lat Pulldown',
    muscle_group: 'back',
    equipment: 'cable',
    difficulty: 'beginner',
    description: 'Machine-assisted pulling movement for lat development.',
    instructions:
      'Sit at machine, grip bar wide, pull bar down to upper chest, control the return.',
    is_global: true,
  },
  {
    name: 'Seated Cable Row',
    muscle_group: 'back',
    equipment: 'cable',
    difficulty: 'beginner',
    description: 'Horizontal pulling exercise for mid-back thickness.',
    instructions:
      'Sit at row machine, pull handle to abdomen squeezing shoulder blades, control the return.',
    is_global: true,
  },
  {
    name: 'T-Bar Row',
    muscle_group: 'back',
    equipment: 'machine',
    difficulty: 'intermediate',
    description: 'Heavy compound rowing for back thickness.',
    instructions:
      'Straddle the bar, grip the handle, row to lower chest, lower with control.',
    is_global: true,
  },
  {
    name: 'Single Arm Dumbbell Row',
    muscle_group: 'back',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    description: 'Unilateral back exercise for balanced development.',
    instructions:
      'Place knee and hand on bench, pull dumbbell to hip keeping elbow close, lower slowly.',
    is_global: true,
  },
  {
    name: 'Face Pulls',
    muscle_group: 'back',
    equipment: 'cable',
    difficulty: 'beginner',
    description: 'Upper back and rear delt exercise for shoulder health.',
    instructions:
      'Set cable at face height with rope, pull to face externally rotating, return controlled.',
    is_global: true,
  },
  {
    name: 'Back Extension',
    muscle_group: 'back',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Lower back strengthening and erector spinae exercise.',
    instructions:
      'Lie face down on hyperextension bench, lower torso, raise back up focusing on lower back.',
    is_global: true,
  },
  {
    name: 'Chin-ups',
    muscle_group: 'back',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    description: 'Underhand pull-up variation with greater bicep involvement.',
    instructions:
      'Hang with underhand shoulder-width grip, pull chin over bar, lower in a controlled manner.',
    is_global: true,
  },

  // ── LEGS (11) ──────────────────────────────────────────
  {
    name: 'Barbell Back Squat',
    muscle_group: 'legs',
    equipment: 'barbell',
    difficulty: 'intermediate',
    description:
      'Fundamental lower body compound movement for total leg development.',
    instructions:
      'Bar on upper traps, squat to parallel or below keeping chest up, drive through heels to stand.',
    is_global: true,
  },
  {
    name: 'Leg Press',
    muscle_group: 'legs',
    equipment: 'machine',
    difficulty: 'beginner',
    description: 'Machine-based quad dominant leg exercise.',
    instructions:
      'Sit in machine, place feet shoulder-width on plate, press away until nearly straight, lower to 90°.',
    is_global: true,
  },
  {
    name: 'Walking Lunges',
    muscle_group: 'legs',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    description: 'Unilateral leg exercise for strength, balance and stability.',
    instructions:
      'Hold dumbbells at sides, step forward, lower back knee toward floor, drive up and repeat alternating legs.',
    is_global: true,
  },
  {
    name: 'Romanian Deadlift',
    muscle_group: 'legs',
    equipment: 'barbell',
    difficulty: 'intermediate',
    description: 'Hip hinge movement targeting hamstrings and glutes.',
    instructions:
      'Hold bar at hips, push hips back and lower bar along legs until hamstring stretch, drive hips forward.',
    is_global: true,
  },
  {
    name: 'Leg Extension',
    muscle_group: 'legs',
    equipment: 'machine',
    difficulty: 'beginner',
    description: 'Isolation exercise for quadriceps.',
    instructions:
      'Sit in machine with pad on shins, extend legs to straight, squeeze quads at top, lower controlled.',
    is_global: true,
  },
  {
    name: 'Leg Curl',
    muscle_group: 'legs',
    equipment: 'machine',
    difficulty: 'beginner',
    description: 'Isolation exercise for hamstrings.',
    instructions:
      'Lie or sit in machine, curl heels toward glutes squeezing hamstrings, lower controlled.',
    is_global: true,
  },
  {
    name: 'Standing Calf Raise',
    muscle_group: 'legs',
    equipment: 'machine',
    difficulty: 'beginner',
    description: 'Isolation exercise for gastrocnemius and soleus muscles.',
    instructions:
      'Stand with balls of feet on platform edge, raise heels as high as possible, lower below platform for stretch.',
    is_global: true,
  },
  {
    name: 'Bulgarian Split Squat',
    muscle_group: 'legs',
    equipment: 'dumbbell',
    difficulty: 'intermediate',
    description: 'Challenging unilateral exercise for quads and glutes.',
    instructions:
      'Rear foot elevated on bench, hold dumbbells, lower front knee to 90°, drive through front heel to stand.',
    is_global: true,
  },
  {
    name: 'Hack Squat',
    muscle_group: 'legs',
    equipment: 'machine',
    difficulty: 'intermediate',
    description: 'Machine-guided squat variation for quad development.',
    instructions:
      'Stand in machine with shoulders under pads, squat to 90°, drive back up through heels.',
    is_global: true,
  },
  {
    name: 'Step-ups',
    muscle_group: 'legs',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    description: 'Functional unilateral exercise for legs and glutes.',
    instructions:
      'Hold dumbbells, step onto elevated surface, drive through heel, step down and alternate legs.',
    is_global: true,
  },
  {
    name: 'Goblet Squat',
    muscle_group: 'legs',
    equipment: 'kettlebell',
    difficulty: 'beginner',
    description: 'Front-loaded squat variation improving squat mechanics.',
    instructions:
      'Hold kettlebell at chest, squat deep with elbows inside knees, keep chest tall, drive up.',
    is_global: true,
  },

  // ── SHOULDERS (8) ──────────────────────────────────────
  {
    name: 'Barbell Overhead Press',
    muscle_group: 'shoulders',
    equipment: 'barbell',
    difficulty: 'intermediate',
    description: 'Primary compound shoulder pressing movement.',
    instructions:
      'Stand or sit, press bar from clavicle overhead until arms are locked, lower controlled.',
    is_global: true,
  },
  {
    name: 'Dumbbell Lateral Raise',
    muscle_group: 'shoulders',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    description: 'Isolation exercise for lateral deltoid width.',
    instructions:
      'Hold dumbbells at sides, raise to shoulder height with slight elbow bend, lower controlled.',
    is_global: true,
  },
  {
    name: 'Dumbbell Front Raise',
    muscle_group: 'shoulders',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    description: 'Isolation exercise for anterior deltoid.',
    instructions:
      'Hold dumbbells at thighs, raise one or both arms forward to shoulder height, lower controlled.',
    is_global: true,
  },
  {
    name: 'Rear Delt Dumbbell Fly',
    muscle_group: 'shoulders',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    description:
      'Targets posterior deltoid and upper back for shoulder balance.',
    instructions:
      'Bend forward at hips, raise dumbbells to sides in arc motion, squeeze rear delts, lower controlled.',
    is_global: true,
  },
  {
    name: 'Arnold Press',
    muscle_group: 'shoulders',
    equipment: 'dumbbell',
    difficulty: 'intermediate',
    description: 'Full shoulder movement hitting all three delt heads.',
    instructions:
      'Hold dumbbells at chin with palms facing you, press and rotate palms outward at the top, reverse.',
    is_global: true,
  },
  {
    name: 'Upright Row',
    muscle_group: 'shoulders',
    equipment: 'barbell',
    difficulty: 'intermediate',
    description: 'Compound shoulder and trapezius exercise.',
    instructions:
      'Hold bar with narrow grip, pull to chin level with elbows flaring high, lower controlled.',
    is_global: true,
  },
  {
    name: 'Dumbbell Shrugs',
    muscle_group: 'shoulders',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    description: 'Trapezius isolation exercise for neck and upper back.',
    instructions:
      'Hold dumbbells at sides, shrug shoulders straight up toward ears, hold briefly, lower.',
    is_global: true,
  },
  {
    name: 'Cable Lateral Raise',
    muscle_group: 'shoulders',
    equipment: 'cable',
    difficulty: 'beginner',
    description: 'Cable version of lateral raise providing constant tension.',
    instructions:
      'Stand beside cable machine, raise handle out to side to shoulder height with slight elbow bend.',
    is_global: true,
  },

  // ── BICEPS (6) ─────────────────────────────────────────
  {
    name: 'Barbell Curl',
    muscle_group: 'biceps',
    equipment: 'barbell',
    difficulty: 'beginner',
    description: 'Classic barbell curl for bicep mass and strength.',
    instructions:
      'Hold barbell with shoulder-width underhand grip, curl to chest keeping elbows fixed, lower controlled.',
    is_global: true,
  },
  {
    name: 'Dumbbell Curl',
    muscle_group: 'biceps',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    description: 'Unilateral bicep exercise allowing supination at the top.',
    instructions:
      'Hold dumbbells at sides, curl while rotating palm upward, squeeze at top, lower controlled.',
    is_global: true,
  },
  {
    name: 'Hammer Curl',
    muscle_group: 'biceps',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    description: 'Targets brachialis and brachioradialis with neutral grip.',
    instructions:
      'Hold dumbbells with neutral grip (palms facing each other), curl to shoulder, lower controlled.',
    is_global: true,
  },
  {
    name: 'Preacher Curl',
    muscle_group: 'biceps',
    equipment: 'machine',
    difficulty: 'intermediate',
    description: 'Isolates biceps by eliminating body swing.',
    instructions:
      'Rest upper arms on preacher pad, curl weight to shoulders, fully extend at bottom.',
    is_global: true,
  },
  {
    name: 'Cable Curl',
    muscle_group: 'biceps',
    equipment: 'cable',
    difficulty: 'beginner',
    description: 'Constant tension bicep exercise using cables.',
    instructions:
      'Hold cable bar or handle with underhand grip, curl to chest, lower with control.',
    is_global: true,
  },
  {
    name: 'Concentration Curl',
    muscle_group: 'biceps',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    description: 'Maximum bicep isolation with braced elbow.',
    instructions:
      'Sit, brace elbow against inner thigh, curl dumbbell to shoulder, squeeze at peak, lower.',
    is_global: true,
  },

  // ── TRICEPS (6) ────────────────────────────────────────
  {
    name: 'Tricep Dips',
    muscle_group: 'triceps',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    description: 'Bodyweight compound movement for tricep mass.',
    instructions:
      'Support on parallel bars or bench, keep torso upright, lower body until triceps are stretched, press up.',
    is_global: true,
  },
  {
    name: 'Skull Crushers',
    muscle_group: 'triceps',
    equipment: 'barbell',
    difficulty: 'intermediate',
    description: 'Lying tricep extension for mass and strength.',
    instructions:
      'Lie on bench, lower barbell toward forehead bending at elbows, extend back up fully.',
    is_global: true,
  },
  {
    name: 'Cable Tricep Pushdown',
    muscle_group: 'triceps',
    equipment: 'cable',
    difficulty: 'beginner',
    description: 'Constant tension tricep isolation using cable machine.',
    instructions:
      'Stand at cable with bar or rope, push handle down until arms are fully extended, return controlled.',
    is_global: true,
  },
  {
    name: 'Overhead Tricep Extension',
    muscle_group: 'triceps',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    description: 'Stretches and works the long head of the tricep.',
    instructions:
      'Hold dumbbell overhead with both hands, lower behind head bending elbows, extend back up.',
    is_global: true,
  },
  {
    name: 'Close Grip Bench Press',
    muscle_group: 'triceps',
    equipment: 'barbell',
    difficulty: 'intermediate',
    description: 'Compound tricep press movement on flat bench.',
    instructions:
      'Grip bar shoulder-width or narrower, lower to chest, press focusing tension on triceps.',
    is_global: true,
  },
  {
    name: 'Diamond Push-ups',
    muscle_group: 'triceps',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Bodyweight tricep exercise with hands in diamond shape.',
    instructions:
      'Form diamond shape with thumbs and index fingers beneath chest, perform push-up targeting triceps.',
    is_global: true,
  },

  // ── CORE (10) ──────────────────────────────────────────
  {
    name: 'Plank',
    muscle_group: 'core',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Isometric core stability exercise.',
    instructions:
      'Hold push-up position on forearms, keep body in a straight line, breathe steadily, hold.',
    is_global: true,
  },
  {
    name: 'Crunches',
    muscle_group: 'core',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Basic core flexion exercise for abdominals.',
    instructions:
      'Lie on back with knees bent, hands behind head, curl shoulders toward knees, lower controlled.',
    is_global: true,
  },
  {
    name: 'Russian Twists',
    muscle_group: 'core',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Rotational core exercise targeting obliques.',
    instructions:
      'Sit with feet raised and knees bent, lean back slightly, rotate torso fully side to side.',
    is_global: true,
  },
  {
    name: 'Hanging Leg Raises',
    muscle_group: 'core',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    description: 'Advanced lower ab exercise performed from a bar.',
    instructions:
      'Hang from pull-up bar, raise legs to 90° or higher keeping them straight, lower controlled.',
    is_global: true,
  },
  {
    name: 'Ab Wheel Rollout',
    muscle_group: 'core',
    equipment: 'other',
    difficulty: 'intermediate',
    description: 'Full core stability and anti-extension strength exercise.',
    instructions:
      'Kneel with ab wheel in hands, roll forward maintaining tight core and flat back, roll back.',
    is_global: true,
  },
  {
    name: 'Cable Crunches',
    muscle_group: 'core',
    equipment: 'cable',
    difficulty: 'beginner',
    description: 'Weighted ab exercise for progressive core overload.',
    instructions:
      'Kneel at cable machine, hold rope at head, crunch down pulling elbows to knees, return controlled.',
    is_global: true,
  },
  {
    name: 'Bicycle Crunches',
    muscle_group: 'core',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Dynamic crunch that targets both abs and obliques.',
    instructions:
      'Lie on back, alternate bringing elbow to opposite knee in a slow pedaling motion.',
    is_global: true,
  },
  {
    name: 'Mountain Climbers',
    muscle_group: 'core',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Dynamic core exercise with a cardiovascular element.',
    instructions:
      'Start in push-up position, drive alternating knees to chest rapidly, keep hips low.',
    is_global: true,
  },
  {
    name: 'Dead Bug',
    muscle_group: 'core',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Core stability exercise with controlled limb movement.',
    instructions:
      'Lie on back with arms up and knees at 90°, lower opposite arm and leg toward floor keeping back flat.',
    is_global: true,
  },
  {
    name: 'Leg Raises',
    muscle_group: 'core',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Lower abdominal isolation exercise.',
    instructions:
      'Lie flat on back, raise legs to 90° keeping them straight, lower slowly without touching the floor.',
    is_global: true,
  },

  // ── CARDIO (10) ────────────────────────────────────────
  {
    name: 'Treadmill Running',
    muscle_group: 'cardio',
    equipment: 'cardio_machine',
    difficulty: 'beginner',
    description:
      'Classic cardiovascular exercise for endurance and calorie burn.',
    instructions:
      'Set desired speed, maintain upright posture, use natural arm swing, breathe rhythmically.',
    is_global: true,
  },
  {
    name: 'Stationary Bike',
    muscle_group: 'cardio',
    equipment: 'cardio_machine',
    difficulty: 'beginner',
    description: 'Low-impact cardiovascular exercise for heart health.',
    instructions:
      'Adjust seat to hip height, maintain steady cadence, set appropriate resistance, keep chest upright.',
    is_global: true,
  },
  {
    name: 'Jump Rope',
    muscle_group: 'cardio',
    equipment: 'other',
    difficulty: 'beginner',
    description: 'Highly effective cardio and coordination exercise.',
    instructions:
      'Hold handles loosely, swing rope with wrists not arms, jump with both feet on each pass.',
    is_global: true,
  },
  {
    name: 'Rowing Machine',
    muscle_group: 'cardio',
    equipment: 'cardio_machine',
    difficulty: 'intermediate',
    description:
      'Full body cardiovascular exercise engaging legs, core, and arms.',
    instructions:
      'Drive with legs, lean back slightly, pull handle to lower chest, then reverse: arms, body, legs.',
    is_global: true,
  },
  {
    name: 'Stair Climber',
    muscle_group: 'cardio',
    equipment: 'cardio_machine',
    difficulty: 'beginner',
    description: 'Lower body-focused cardio mimicking stair climbing.',
    instructions:
      'Step on pedals, maintain upright posture, control speed, avoid leaning heavily on handrails.',
    is_global: true,
  },
  {
    name: 'Elliptical',
    muscle_group: 'cardio',
    equipment: 'cardio_machine',
    difficulty: 'beginner',
    description: 'Low-impact full body cardio machine.',
    instructions:
      'Step on pedals, use handlebars for upper body engagement, maintain steady rhythm.',
    is_global: true,
  },
  {
    name: 'Burpees',
    muscle_group: 'cardio',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    description: 'High-intensity full body conditioning exercise.',
    instructions:
      'Squat down, jump feet back to plank, do a push-up, jump feet forward, explode upward.',
    is_global: true,
  },
  {
    name: 'High Knees',
    muscle_group: 'cardio',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Running in place with exaggerated knee drive.',
    instructions:
      'Run in place driving knees to hip height on each step, use arm drive for momentum.',
    is_global: true,
  },
  {
    name: 'Box Jumps',
    muscle_group: 'cardio',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    description: 'Plyometric power exercise for lower body explosiveness.',
    instructions:
      'Stand before box, squat slightly, explode upward landing softly on box, step down.',
    is_global: true,
  },
  {
    name: 'Battle Ropes',
    muscle_group: 'cardio',
    equipment: 'other',
    difficulty: 'intermediate',
    description: 'Upper body cardio conditioning with heavy ropes.',
    instructions:
      'Hold rope ends with firm grip, create alternating waves by driving arms up and down rapidly.',
    is_global: true,
  },

  // ── FULL BODY (11) ─────────────────────────────────────
  {
    name: 'Barbell Clean and Press',
    muscle_group: 'full_body',
    equipment: 'barbell',
    difficulty: 'advanced',
    description: 'Olympic-style full body power movement.',
    instructions:
      'Pull bar from floor explosively, catch at shoulders in squat, stand and press overhead.',
    is_global: true,
  },
  {
    name: 'Kettlebell Swing',
    muscle_group: 'full_body',
    equipment: 'kettlebell',
    difficulty: 'intermediate',
    description: 'Hip hinge power movement for the entire posterior chain.',
    instructions:
      'Hinge back swinging kettlebell between legs, drive hips forward explosively swinging to chest height.',
    is_global: true,
  },
  {
    name: 'Thrusters',
    muscle_group: 'full_body',
    equipment: 'barbell',
    difficulty: 'intermediate',
    description: 'Front squat combined with overhead press in one movement.',
    instructions:
      'Hold bar at shoulders, squat to parallel, drive up and use momentum to press bar overhead.',
    is_global: true,
  },
  {
    name: 'Man Makers',
    muscle_group: 'full_body',
    equipment: 'dumbbell',
    difficulty: 'advanced',
    description: 'Complex exercise combining push-up, row, and thruster.',
    instructions:
      'Hold dumbbells, do push-up, alternate dumbbell rows, stand and press overhead — that is one rep.',
    is_global: true,
  },
  {
    name: 'Turkish Get-up',
    muscle_group: 'full_body',
    equipment: 'kettlebell',
    difficulty: 'advanced',
    description:
      'Complex movement from lying to standing with weight overhead.',
    instructions:
      'Hold kettlebell overhead, slowly move through rolling, kneeling, and standing positions.',
    is_global: true,
  },
  {
    name: 'Bear Crawl',
    muscle_group: 'full_body',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Ground-based locomotion pattern for full body conditioning.',
    instructions:
      'On all fours with knees 2 inches off ground, crawl forward keeping hips low and back flat.',
    is_global: true,
  },
  {
    name: 'Medicine Ball Slam',
    muscle_group: 'full_body',
    equipment: 'other',
    difficulty: 'beginner',
    description: 'Explosive full body power and conditioning exercise.',
    instructions:
      'Hold ball overhead, slam to floor powerfully using entire body, catch on bounce and repeat.',
    is_global: true,
  },
  {
    name: "Farmer's Walk",
    muscle_group: 'full_body',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    description: 'Loaded carry for grip strength and full body conditioning.',
    instructions:
      'Hold heavy dumbbells at sides, walk with upright posture and short quick steps.',
    is_global: true,
  },
  {
    name: 'Sled Push',
    muscle_group: 'full_body',
    equipment: 'other',
    difficulty: 'intermediate',
    description: 'Pushing heavy sled for lower body power and conditioning.',
    instructions:
      'Drive low with hands on sled handles, push across floor using leg drive, maintain forward lean.',
    is_global: true,
  },
  {
    name: 'Jump Squats',
    muscle_group: 'full_body',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    description: 'Plyometric squat variation for lower body power development.',
    instructions:
      'Squat to parallel then explode upward, land softly bending knees, immediately squat again.',
    is_global: true,
  },
  {
    name: 'Inchworm',
    muscle_group: 'full_body',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description:
      'Mobility and core exercise walking hands out to plank and back.',
    instructions:
      'Stand, bend forward and place hands on floor, walk hands out to plank, walk feet to hands, repeat.',
    is_global: true,
  },
];

async function seed() {
  console.log('🔌 Connecting to database...');

  try {
    await dataSource.initialize();
    console.log('✅ Connected to Supabase PostgreSQL');
  } catch (err: any) {
    console.error('❌ Could not connect to database:', err.message);
    process.exit(1);
  }

  const repo = dataSource.getRepository(Exercise);

  const existing = await repo.count({ where: { is_global: true } });
  if (existing > 0) {
    console.log(
      `⚠️  Already seeded: ${existing} global exercises found. Skipping.`,
    );
    console.log(
      '   To re-seed, delete existing exercises from the Supabase dashboard first.',
    );
    await dataSource.destroy();
    return;
  }

  console.log(`🌱 Seeding ${exercises.length} exercises...`);

  try {
    await repo.save(exercises);
    const total = await repo.count();
    console.log(`✅ Seed complete! ${total} exercises in database.`);
  } catch (err: any) {
    console.error('❌ Seed failed:', err?.message ?? 'Unknown error');
    await dataSource.destroy();
    process.exit(1);
  }

  await dataSource.destroy();
  console.log('🔌 Database connection closed.');
}

seed();
