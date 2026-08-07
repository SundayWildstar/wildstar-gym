// ─── Wildstar Home Gym: equipment + exercise library ─────────────────────────

const EQUIPMENT = [
  { id: "legext",     name: "Leg Extension",               tag: "machine" },
  { id: "legcurl",    name: "Leg Curl",                    tag: "machine" },
  { id: "legpress",   name: "Leg Press",                   tag: "machine" },
  { id: "abmachine",  name: "Total Abdominal Machine",     tag: "machine" },
  { id: "cables",     name: "Kinesis / Cable Station",     tag: "strength" },
  { id: "rack",       name: "Power Rack + Barbell",        tag: "strength" },
  { id: "rig",        name: "Pull-up Rig",                 tag: "strength" },
  { id: "trx",        name: "Suspension Straps (TRX)",     tag: "strength" },
  { id: "bag",        name: "Heavy Punching Bag",          tag: "conditioning" },
  { id: "kb",         name: "Kettlebells",                 tag: "strength" },
  { id: "db",         name: "Dumbbells",                   tag: "strength" },
  { id: "treadmill",  name: "Treadmill",                   tag: "cardio" },
  { id: "curved",     name: "Curved Treadmill",            tag: "cardio" },
  { id: "elliptical", name: "Elliptical Cross-Trainer",    tag: "cardio" },
  { id: "excite",     name: "Technogym Excite Cardio",     tag: "cardio" },
  { id: "ball",       name: "Stability Balls",             tag: "accessory" },
  { id: "medball",    name: "Medicine Balls",              tag: "accessory" },
];

// pattern: squat | hinge | lunge | hpush | vpush | hpull | vpull |
//          isoLower | isoUpper | core | condition | cardio
// level: 1 beginner · 2 intermediate · 3 advanced
// unit: "reps" (default) or "time"
function E(name, equip, pattern, level, opts = {}) {
  return { name, equip, pattern, level, unit: "reps", ...opts };
}

const EXERCISES = [
  // ── Squat pattern
  E("Barbell Back Squat", ["rack"], "squat", 2, { cue: "Brace, sit down between your hips, drive up." }),
  E("Goblet Squat", ["kb"], "squat", 1, { cue: "Hold the bell at your chest, elbows inside knees at the bottom." }),
  E("Kettlebell Front Squat", ["kb"], "squat", 2, { cue: "Two bells in the rack position, stay tall." }),
  E("Leg Press", ["legpress"], "squat", 1, { cue: "Full foot pressure, don't lock the knees hard at the top." }),
  E("Dumbbell Squat", ["db"], "squat", 1, { cue: "Dumbbells at your sides or shoulders, chest up." }),
  E("TRX Assisted Squat", ["trx"], "squat", 1, { cue: "Light hold on the straps, full depth, control the way down." }),

  // ── Hinge pattern
  E("Barbell Romanian Deadlift", ["rack"], "hinge", 2, { cue: "Soft knees, push hips back, bar close to the legs." }),
  E("Dumbbell Romanian Deadlift", ["db"], "hinge", 1, { cue: "Hinge until you feel the hamstrings, squeeze glutes up." }),
  E("Kettlebell Deadlift", ["kb"], "hinge", 1, { cue: "Bell between your feet, flat back, stand tall." }),
  E("Kettlebell Swing", ["kb"], "hinge", 2, { cue: "Snap the hips — it's a hinge, not a squat." }),
  E("Cable Pull-Through", ["cables"], "hinge", 1, { cue: "Face away from the stack, hinge and squeeze through." }),
  E("Barbell Hip Thrust", ["rack"], "hinge", 2, { cue: "Shoulders on a pad, drive hips to full lockout." }),
  E("Single-Leg Romanian Deadlift", ["db"], "hinge", 3, { cue: "One dumbbell, slow and balanced — great for stability." }),

  // ── Lunge / single-leg
  E("Bulgarian Split Squat", ["db"], "lunge", 2, { cue: "Rear foot elevated, drop straight down." }),
  E("Walking Lunge", ["db"], "lunge", 1, { cue: "Long steps, knee tracks over the toes." }),
  E("Reverse Lunge", ["db", "kb"], "lunge", 1, { cue: "Step back, gentle knee touch, drive through the front heel." }),
  E("Step-Up", ["db"], "lunge", 1, { cue: "Use a sturdy box or bench height, no push off the back leg." }),

  // ── Horizontal push
  E("Push-Up", [], "hpush", 1, { cue: "Body in one line, chest to the floor." }),
  E("Cable Chest Press", ["cables"], "hpush", 1, { cue: "Standing split stance on the Kinesis, press straight out." }),
  E("Dumbbell Floor Press", ["db"], "hpush", 1, { cue: "Lying on the floor, elbows touch down softly each rep." }),
  E("Cable Fly", ["cables"], "hpush", 2, { cue: "Slight elbow bend, hug a barrel shape." }),
  E("TRX Push-Up", ["trx"], "hpush", 2, { cue: "Hands in the straps — the wobble is the work." }),
  E("Kettlebell Floor Press", ["kb"], "hpush", 1, { cue: "One bell at a time works the core too." }),

  // ── Vertical push
  E("Barbell Overhead Press", ["rack"], "vpush", 2, { cue: "Squeeze glutes, press the bar in a straight line." }),
  E("Dumbbell Shoulder Press", ["db"], "vpush", 1, { cue: "Standing or seated, don't lean back." }),
  E("Kettlebell Push Press", ["kb"], "vpush", 2, { cue: "Small leg dip, drive the bell overhead." }),
  E("Cable Shoulder Press", ["cables"], "vpush", 1, { cue: "Smooth line of resistance from the low pulleys." }),

  // ── Horizontal pull
  E("Cable Row", ["cables"], "hpull", 1, { cue: "Chest proud, pull the handles to your ribs." }),
  E("Single-Arm Dumbbell Row", ["db"], "hpull", 1, { cue: "Support on a bench or rack, pull to the hip." }),
  E("TRX Row", ["trx"], "hpull", 1, { cue: "Walk your feet forward to make it harder." }),
  E("Kettlebell Gorilla Row", ["kb"], "hpull", 2, { cue: "Two bells on the floor, row one at a time." }),

  // ── Vertical pull
  E("Pull-Up", ["rig"], "vpull", 3, { cue: "Full hang to chin over the bar." }),
  E("TRX-Assisted Pull-Up", ["rig", "trx"], "vpull", 1, { cue: "Feet help just enough to finish each rep." }),
  E("Kneeling Cable Lat Pulldown", ["cables"], "vpull", 1, { cue: "Kneel under the high pulleys, pull elbows to ribs." }),
  E("Hanging Scapular Pull", ["rig"], "vpull", 1, { cue: "Straight arms, pull the shoulder blades down." }),

  // ── Isolation, lower
  E("Cable Glute Kickback", ["cables"], "isoLower", 1, { cue: "Low pulley at your ankle, kick straight back and squeeze." }),
  E("Cable Hip Abduction", ["cables"], "isoLower", 1, { cue: "Low pulley at your ankle, lift the leg out to the side." }),
  E("Glute Bridge", [], "hinge", 1, { cue: "Shoulders on the floor, drive hips up, squeeze for a second." }),
  E("Leg Extension", ["legext"], "isoLower", 1, { cue: "Pause one second at the top." }),
  E("Lying / Seated Leg Curl", ["legcurl"], "isoLower", 1, { cue: "Control the lowering — 3 seconds down." }),
  E("Standing Calf Raise", ["db"], "isoLower", 1, { cue: "Full stretch at the bottom, high on the toes." }),
  E("Leg Press Calf Press", ["legpress"], "isoLower", 1, { cue: "Toes on the low edge of the platform." }),

  // ── Isolation, upper
  E("Dumbbell Lateral Raise", ["db"], "isoUpper", 1, { group: "shoulders", cue: "Lead with the elbows, stop at shoulder height." }),
  E("Cable Lateral Raise", ["cables"], "isoUpper", 2, { group: "shoulders", cue: "Constant tension from the low pulley." }),
  E("Dumbbell Biceps Curl", ["db"], "isoUpper", 1, { group: "biceps", cue: "Elbows pinned to your sides." }),
  E("Cable Biceps Curl", ["cables"], "isoUpper", 1, { group: "biceps", cue: "Step back for constant tension." }),
  E("Hammer Curl", ["db"], "isoUpper", 1, { group: "biceps", cue: "Neutral grip, controlled tempo." }),
  E("Cable Triceps Pressdown", ["cables"], "isoUpper", 1, { group: "triceps", cue: "Elbows still, full lockout." }),
  E("Overhead Triceps Extension", ["db", "cables"], "isoUpper", 1, { group: "triceps", cue: "Big stretch behind the head." }),
  E("Cable Rear-Delt Fly", ["cables"], "isoUpper", 2, { group: "shoulders", cue: "Arms cross, pull apart wide." }),
  E("Cable Face Pull", ["cables"], "isoUpper", 1, { group: "shoulders", cue: "Pull to the bridge of your nose, thumbs back." }),

  // ── Core
  E("Total Ab Machine Crunch", ["abmachine"], "core", 1, { cue: "Exhale hard as you crunch." }),
  E("Hanging Knee Raise", ["rig"], "core", 2, { cue: "No swinging — lift with the abs." }),
  E("Cable Pallof Press", ["cables"], "core", 1, { cue: "Press out and resist the twist." }),
  E("Cable Woodchop", ["cables"], "core", 2, { cue: "Rotate through the hips, arms stay long." }),
  E("Plank", [], "core", 1, { unit: "time", cue: "Squeeze glutes, don't let the hips sag." }),
  E("TRX Body Saw", ["trx"], "core", 3, { cue: "Feet in straps, small forward-back rocking in a plank." }),
  E("Stability Ball Rollout", ["ball"], "core", 2, { cue: "Roll out only as far as you can keep a flat back." }),
  E("Stability Ball Stir-the-Pot", ["ball"], "core", 2, { unit: "time", cue: "Forearms on the ball, small circles." }),
  E("Medicine Ball Russian Twist", ["medball"], "core", 1, { cue: "Heels light, rotate shoulder to shoulder." }),
  E("Dead Bug", [], "core", 1, { cue: "Lower back glued to the floor." }),

  // ── Conditioning
  E("Heavy Bag Rounds", ["bag"], "condition", 1, { unit: "time", cue: "2–3 min rounds, 1 min rest. Stay light on your feet." }),
  E("Curved Treadmill Sprints", ["curved"], "condition", 2, { unit: "time", cue: "15–20 s hard, walk 60–90 s. It's self-powered — it bites." }),
  E("Kettlebell Swings (EMOM)", ["kb"], "condition", 2, { cue: "Every minute on the minute: 15 swings, rest the remainder." }),
  E("Kettlebell Clean & Press", ["kb"], "condition", 2, { cue: "Smooth clean to the rack, press overhead." }),
  E("Medicine Ball Slam", ["medball"], "condition", 1, { cue: "Full extension up, slam through the floor." }),
  E("Farmer's Carry", ["kb", "db"], "condition", 1, { unit: "time", cue: "Heavy bells, tall posture, walk laps of the gym." }),
  E("Kettlebell Goblet Carry", ["kb"], "condition", 1, { unit: "time", cue: "Bell at the chest, ribs down, breathe." }),
  E("TRX Mountain Climber", ["trx"], "condition", 2, { unit: "time", cue: "Feet in straps, fast knees, hips level." }),
  E("Turkish Get-Up", ["kb"], "condition", 3, { cue: "Slow and perfect. Eyes on the bell." }),

  // ── Cardio
  E("Treadmill Incline Walk", ["treadmill"], "cardio", 1, { unit: "time", cue: "10–12% incline, brisk pace, no hands on the rails." }),
  E("Treadmill Easy Run", ["treadmill"], "cardio", 1, { unit: "time", cue: "Conversational pace — you should be able to talk." }),
  E("Treadmill Intervals", ["treadmill"], "cardio", 2, { unit: "time", cue: "1 min quick / 2 min easy, repeat." }),
  E("Curved Treadmill Tempo", ["curved"], "cardio", 2, { unit: "time", cue: "Steady self-powered pace — shorter than a normal run." }),
  E("Elliptical Steady State", ["elliptical"], "cardio", 1, { unit: "time", cue: "Smooth resistance, use the arms." }),
  E("Excite Cardio Intervals", ["excite"], "cardio", 1, { unit: "time", cue: "2 min moderate / 1 min pushed, repeat." }),
];

// Step-by-step how-tos, keyed by exercise name. Shown when an exercise is clicked.
const HOWTO = {
  "Cable Glute Kickback": [
    "Set the pulley to the lowest position with an ankle strap (or loop the handle over your foot).",
    "Face the stack, hands on the frame, slight forward lean.",
    "Kick the working leg straight back and slightly up, squeezing the glute hard at the end.",
    "Return under control without letting the stack touch down. Keep hips square — no twisting.",
  ],
  "Cable Hip Abduction": [
    "Low pulley with an ankle strap on your outside leg, stand side-on to the stack.",
    "Hold the frame for balance, stand tall.",
    "Lift the strapped leg straight out to the side, leading with the heel.",
    "Pause, then return slowly. All reps one side, then switch.",
  ],
  "Glute Bridge": [
    "Lie on your back, knees bent, feet flat and close to your glutes.",
    "Drive through your heels and lift your hips until your body is straight from knees to shoulders.",
    "Squeeze your glutes for a full second at the top.",
    "Lower with control. Add a dumbbell on your hips to make it harder.",
  ],
  "Barbell Back Squat": [
    "Set the bar in the rack just below shoulder height. Step under it so it rests on your upper back (not your neck), grip outside your shoulders, and stand it out of the hooks.",
    "Step back, feet shoulder-width, toes slightly out.",
    "Take a big breath, brace your core, and sit down between your hips until your thighs are at least parallel.",
    "Drive the whole foot into the floor to stand back up, exhale at the top.",
    "Common mistake: knees caving in — push them out over your toes the whole way.",
  ],
  "Goblet Squat": [
    "Hold one kettlebell (or dumbbell) by the horns against your chest, elbows tucked down.",
    "Feet shoulder-width, toes slightly out.",
    "Squat down slowly until your elbows brush the inside of your knees.",
    "Keep your chest tall and heels down; stand back up and squeeze your glutes.",
  ],
  "Kettlebell Front Squat": [
    "Clean two kettlebells to the rack position: bells resting on your forearms at your chest, elbows tucked.",
    "Feet shoulder-width apart, squat down keeping your torso tall.",
    "Pause briefly at the bottom, then drive up through your heels.",
    "Common mistake: letting the elbows drop — keep them high and tucked.",
  ],
  "Leg Press": [
    "Sit fully back in the seat, feet shoulder-width in the middle of the platform.",
    "Release the safety handles and lower the platform under control until your knees are at ~90°.",
    "Press through your whole foot back to the start without slamming your knees straight.",
    "For extra glute emphasis, place your feet higher on the platform.",
  ],
  "Dumbbell Squat": [
    "Hold a dumbbell in each hand at your sides (or at your shoulders).",
    "Feet shoulder-width, chest up, eyes ahead.",
    "Squat until your thighs are parallel to the floor.",
    "Stand tall, squeezing your glutes at the top.",
  ],
  "TRX Assisted Squat": [
    "Hold both TRX handles with light tension, arms extended, feet shoulder-width.",
    "Squat as deep as you comfortably can, using the straps only for balance.",
    "Take 3 seconds on the way down; drive up through your heels.",
    "As you improve, use the straps less and less.",
  ],
  "Barbell Romanian Deadlift": [
    "Hold the bar at hip height with a shoulder-width grip (start from the rack).",
    "Soft bend in the knees. Push your hips straight back and slide the bar down your thighs.",
    "Stop when you feel a strong stretch in your hamstrings — usually just below the knees. Back stays flat.",
    "Drive your hips forward to stand, squeezing your glutes hard at the top.",
    "Common mistake: turning it into a squat — the knees barely move; it's all hips.",
  ],
  "Dumbbell Romanian Deadlift": [
    "Hold dumbbells in front of your thighs, palms facing you.",
    "Soft knees; hinge at the hips, sliding the weights down the front of your legs.",
    "Stop at the hamstring stretch (mid-shin at most), back flat the whole way.",
    "Squeeze your glutes to stand back up.",
  ],
  "Kettlebell Deadlift": [
    "Stand over the bell so it's between the middle of your feet.",
    "Push hips back, flat back, and grip the handle with both hands.",
    "Push the floor away and stand tall — hips and shoulders rise together.",
    "Lower it back down with the same hinge, no rounding.",
  ],
  "Kettlebell Swing": [
    "Start with the bell a foot in front of you. Hinge and hike it back between your legs like a football snap.",
    "Snap your hips forward hard — the bell floats to chest height on its own.",
    "Let it swing back down and immediately hinge into the next rep.",
    "The arms are just ropes; all the power comes from the hip snap.",
    "Common mistake: squatting and lifting with the arms — it's a hinge, not a front raise.",
  ],
  "Cable Pull-Through": [
    "Set the pulley to the lowest position with a rope handle. Face away and hold the rope between your legs.",
    "Walk forward a step, feet shoulder-width.",
    "Hinge at the hips letting the rope pull back between your legs, back flat.",
    "Drive your hips forward and squeeze your glutes to stand tall. Excellent glute-builder.",
  ],
  "Barbell Hip Thrust": [
    "Sit on the floor with your upper back against a sturdy bench or box, bar over your hips (use a pad or towel).",
    "Feet flat, shoulder-width, heels close to your glutes.",
    "Drive through your heels and lift your hips until your body is a straight line from knees to shoulders.",
    "Squeeze your glutes hard for a full second at the top, then lower with control.",
    "The best single glute exercise in the gym — chin tucked, ribs down.",
  ],
  "Single-Leg Romanian Deadlift": [
    "Hold a dumbbell in one hand, stand on the opposite leg.",
    "Hinge forward slowly, letting the free leg travel straight back for balance.",
    "Stop when you feel the hamstring stretch; keep hips square to the floor.",
    "Squeeze the glute of the standing leg to return. Slow is the whole point.",
  ],
  "Bulgarian Split Squat": [
    "Stand a big step in front of a bench or box; place the top of your rear foot on it.",
    "Hold dumbbells at your sides, torso tall with a slight forward lean.",
    "Drop your back knee straight down toward the floor.",
    "Drive through the front heel to stand. All the work belongs to the front leg.",
    "Leaning slightly forward shifts the work to the glutes.",
  ],
  "Walking Lunge": [
    "Dumbbells at your sides, take a long step forward.",
    "Lower until both knees are at ~90°, back knee just off the floor.",
    "Push off the front heel and step straight into the next lunge.",
    "Keep your torso tall and steps long — short choppy steps stress the knees.",
  ],
  "Reverse Lunge": [
    "Stand tall holding dumbbells or a kettlebell at your chest.",
    "Step backward into a lunge, gently touching the back knee down.",
    "Drive through the front heel to return to standing.",
    "Easier on the knees than forward lunges; great glute exercise with a slight forward lean.",
  ],
  "Step-Up": [
    "Use a knee-height box or bench. Place one whole foot on it.",
    "Drive through that heel to stand up on the box — don't push off the bottom leg.",
    "Lower yourself back down slowly with the same leg.",
    "Finish all reps on one side before switching.",
  ],
  "Push-Up": [
    "Hands slightly wider than shoulders, body in one straight line from head to heels.",
    "Lower your chest to the floor, elbows at ~45° from your body.",
    "Press back up to full lockout.",
    "Too hard? Elevate your hands on a box or the rack's safety bars. Too easy? Elevate your feet.",
  ],
  "Cable Chest Press": [
    "Set both pulleys to chest height. Face away from the station, one handle in each hand.",
    "Split stance for balance, handles at your chest.",
    "Press both handles straight forward until your arms are extended.",
    "Return slowly, feeling a stretch across your chest.",
  ],
  "Dumbbell Floor Press": [
    "Lie on your back, knees bent, a dumbbell in each hand at your chest.",
    "Press the weights straight up over your chest.",
    "Lower until your upper arms rest softly on the floor, pause a beat.",
    "Press back up. A bench-press substitute that's kind to the shoulders.",
  ],
  "Cable Fly": [
    "Pulleys at chest height, one handle in each hand, step forward into a split stance.",
    "Arms out wide with a slight elbow bend, chest proud.",
    "Sweep your hands together in front of your chest like hugging a barrel.",
    "Open back up slowly — the stretch is where the growth is.",
  ],
  "TRX Push-Up": [
    "Set the straps to about knee height. Take a handle in each hand and walk into a plank.",
    "Body in one line, hands under your shoulders.",
    "Lower your chest between the handles, elbows at 45°.",
    "Press back up, fighting the wobble the whole time.",
  ],
  "Kettlebell Floor Press": [
    "Lie on your back, one kettlebell racked on your forearm at your chest.",
    "Press it straight up until your arm is locked out.",
    "Lower slowly until your upper arm touches the floor.",
    "Do all reps one side, then switch — your core fights the offset load.",
  ],
  "Barbell Overhead Press": [
    "Set the bar at upper-chest height in the rack. Grip just outside your shoulders.",
    "Squeeze your glutes and brace — no leaning back.",
    "Press the bar in a straight line past your face to full lockout overhead.",
    "Lower under control to your collarbones. Move your head back, not your spine.",
  ],
  "Dumbbell Shoulder Press": [
    "Stand (or sit) with dumbbells at shoulder height, palms forward or neutral.",
    "Brace your core and press both weights straight overhead.",
    "Touch them together (or nearly) at the top without shrugging.",
    "Lower with control back to your shoulders.",
  ],
  "Kettlebell Push Press": [
    "Clean the bell(s) to the rack position at your shoulder.",
    "Dip your knees a few inches, then drive up explosively with your legs.",
    "Use that momentum to punch the bell to lockout overhead.",
    "Lower back to the rack and reset. The leg drive lets you go heavier than a strict press.",
  ],
  "Cable Shoulder Press": [
    "Set the pulleys low. Handles at your shoulders, facing away from the stack.",
    "Split stance or kneeling, ribs down.",
    "Press both handles overhead in a smooth line.",
    "Lower slowly — the cables keep tension the whole way.",
  ],
  "Cable Row": [
    "Pulleys at chest height (or low for a low row). Grab both handles and step back until the cables are taut.",
    "Chest proud, knees soft, arms long.",
    "Pull the handles to your ribs, driving your elbows back and squeezing your shoulder blades.",
    "Let your arms extend fully between reps — no shrugging.",
  ],
  "Single-Arm Dumbbell Row": [
    "Support your free hand on the rack, a bench or your knee, back flat and nearly parallel to the floor.",
    "Let the dumbbell hang straight down.",
    "Pull it to your hip pocket (not your armpit), elbow brushing your side.",
    "Lower slowly. No twisting to heave the weight up.",
  ],
  "TRX Row": [
    "Hold both handles, lean back with arms straight, body in one rigid line.",
    "Pull your chest to the handles, elbows tight to your ribs.",
    "Squeeze your shoulder blades, then lower slowly.",
    "Walk your feet forward to make it harder, back to make it easier.",
  ],
  "Kettlebell Gorilla Row": [
    "Two bells on the floor between your feet, hinge over with a flat back.",
    "Grip both handles; row one bell to your hip while pushing the other into the floor.",
    "Lower and switch sides, staying braced in the hinge the whole set.",
  ],
  "Pull-Up": [
    "Hang from the rig bar, hands just outside shoulder-width, arms fully straight.",
    "Start every rep by pulling your shoulder blades down (no dead-fish hang).",
    "Drive your elbows to your ribs until your chin clears the bar.",
    "Lower all the way down under control. Half reps don't count; quality does.",
  ],
  "TRX-Assisted Pull-Up": [
    "Set the straps under the rig bar. Hold the bar, place your feet in the straps (or stand on a box beneath).",
    "Use just enough leg push to complete each pull-up.",
    "Focus on the lowering phase — take 3 slow seconds down. That's what builds toward a full pull-up.",
    "Each session, try to use a little less help.",
  ],
  "Kneeling Cable Lat Pulldown": [
    "Set both pulleys high. Kneel facing the station, one handle in each hand.",
    "Arms long overhead, torso tall.",
    "Pull the handles down until your elbows reach your ribs.",
    "Control the way back up, feeling the stretch in your lats.",
  ],
  "Hanging Scapular Pull": [
    "Hang from the rig with straight arms.",
    "Without bending your elbows, pull your shoulder blades down and together — your body lifts an inch or two.",
    "Pause, then release back to a full hang.",
    "This is step one on the road to a pull-up.",
  ],
  "Leg Extension": [
    "Adjust the seat so your knees line up with the machine's pivot; pad on your shins.",
    "Extend your legs until they're straight, without slamming.",
    "Pause one full second at the top, squeezing your quads.",
    "Lower slowly — 3 seconds down beats 10 fast reps.",
  ],
  "Lying / Seated Leg Curl": [
    "Line your knees up with the machine's pivot, pad just above your heels.",
    "Curl your heels toward your glutes.",
    "Pause briefly at full flexion.",
    "Resist the weight on the way back — that lowering phase is where hamstrings grow.",
  ],
  "Standing Calf Raise": [
    "Stand on a step or plate edge with the balls of your feet, heels hanging off. Dumbbell in one hand, other hand on the rack.",
    "Lower your heels for a deep 2-second stretch.",
    "Drive up as high as you can onto your toes and pause at the top.",
    "Full range, no bouncing.",
  ],
  "Leg Press Calf Press": [
    "In the leg press, place just the balls of your feet on the low edge of the platform, legs extended.",
    "Let your heels drop back for a full stretch.",
    "Press through your toes as far as possible, pause, and return slowly.",
  ],
  "Dumbbell Lateral Raise": [
    "Stand tall, light dumbbells at your sides, slight bend in the elbows.",
    "Raise your arms out to the sides, leading with the elbows, until they reach shoulder height.",
    "Pause, then lower twice as slowly as you lifted.",
    "Common mistake: going heavy and shrugging — this move stays light forever.",
  ],
  "Cable Lateral Raise": [
    "Set the pulley low, stand side-on, handle in your far hand.",
    "Raise your arm across and out to shoulder height.",
    "Lower slowly — the cable keeps tension at the bottom where dumbbells lose it.",
  ],
  "Dumbbell Biceps Curl": [
    "Dumbbells at your sides, palms forward, elbows pinned to your ribs.",
    "Curl both weights to your shoulders without swinging.",
    "Squeeze at the top, lower for a slow 3-count.",
    "If your torso rocks, the weight is too heavy.",
  ],
  "Cable Biceps Curl": [
    "Pulley set low with a straight or rope handle. Step back so there's tension at arms-length.",
    "Elbows pinned to your sides, curl to your shoulders.",
    "Lower slowly, keeping tension the whole way down.",
  ],
  "Hammer Curl": [
    "Dumbbells at your sides with palms facing each other (neutral grip).",
    "Curl to your shoulders keeping the thumbs-up position.",
    "Lower under control. Hits the forearms and the thicker arm muscles.",
  ],
  "Cable Triceps Pressdown": [
    "High pulley with rope or bar. Elbows pinned to your sides, forearms up.",
    "Press your hands down until your arms are fully straight.",
    "Squeeze the triceps at lockout, then let your forearms rise slowly — elbows never move.",
  ],
  "Overhead Triceps Extension": [
    "Hold one dumbbell with both hands overhead (or use a low cable facing away).",
    "Keeping elbows close to your ears, lower the weight behind your head for a big stretch.",
    "Extend back to straight arms without flaring the elbows.",
  ],
  "Cable Rear-Delt Fly": [
    "Set both pulleys at shoulder height. Grab the left handle with your right hand and vice versa, arms crossed.",
    "With nearly straight arms, pull wide apart until your arms form a T.",
    "Squeeze between your shoulder blades, then return slowly.",
  ],
  "Cable Face Pull": [
    "High pulley with a rope. Grip with thumbs pointing back at you.",
    "Pull the rope toward the bridge of your nose, elbows high and wide.",
    "Finish with your knuckles beside your ears, squeeze, and return slowly.",
    "The best posture exercise in the gym — keep it light and smooth.",
  ],
  "Total Ab Machine Crunch": [
    "Adjust the seat and select a moderate weight; grip the handles or pads.",
    "Exhale hard and crunch your ribs toward your hips.",
    "Pause a second in the fully crunched position.",
    "Return slowly — don't let the stack yank you back.",
  ],
  "Hanging Knee Raise": [
    "Hang from the rig bar, shoulders active (pulled slightly down).",
    "Lift your knees to hip height or higher without swinging.",
    "Curl your pelvis up at the top — that's what turns it on for the abs.",
    "Lower slowly and dead-stop before the next rep.",
  ],
  "Cable Pallof Press": [
    "Pulley at chest height, stand side-on to the stack, handle at your sternum with both hands.",
    "Press the handle straight out in front of you.",
    "The cable tries to twist you toward it — don't let it. Hold 2 seconds.",
    "Return to your chest. Finish the set, then face the other way.",
  ],
  "Cable Woodchop": [
    "Set the pulley high. Stand side-on, both hands on the handle.",
    "With long arms, pull the handle down and across your body to the opposite hip.",
    "Rotate through your hips and torso, not just the arms.",
    "Control the return. Do both directions.",
  ],
  "Plank": [
    "Forearms on the floor, elbows under shoulders, feet back.",
    "One straight line from head to heels — squeeze glutes, tuck ribs.",
    "Breathe steadily; don't hold your breath.",
    "When your hips sag or pike, the set is over — quality time only.",
  ],
  "TRX Body Saw": [
    "Feet in the straps, forearms on the floor in a plank.",
    "Keeping your body rigid, rock a few inches forward and backward from the shoulders.",
    "The further you saw, the harder your core works. Small range, big effect.",
  ],
  "Stability Ball Rollout": [
    "Kneel with forearms on the ball, hips forward in line with your knees.",
    "Roll the ball away, extending your arms, keeping your back flat.",
    "Go only as far as you can without your lower back arching.",
    "Pull back with your abs, not your arms.",
  ],
  "Stability Ball Stir-the-Pot": [
    "Forearms on the ball in a plank position, feet on the floor.",
    "Draw small circles with your elbows, keeping hips dead level.",
    "5 circles one way, 5 the other. Bigger circles = harder.",
  ],
  "Medicine Ball Russian Twist": [
    "Sit holding the ball at your chest, knees bent, heels lightly touching the floor.",
    "Lean back slightly with a straight spine.",
    "Rotate the ball to touch beside one hip, then the other — shoulder to shoulder, not just arms.",
  ],
  "Dead Bug": [
    "Lie on your back, arms straight up, knees bent 90° over your hips.",
    "Press your lower back into the floor and keep it there.",
    "Slowly lower one arm overhead and the opposite leg toward the floor.",
    "Return and switch sides. If your back arches off the floor, shorten the range.",
  ],
  "Heavy Bag Rounds": [
    "Wrap your hands or use gloves. Set a timer: 2–3 minute rounds, 1 minute rest.",
    "Stay light on your feet, hands up between punches.",
    "Mix jabs, crosses, hooks and body shots — combos of 2–4 punches.",
    "Punch through the bag, exhale sharply with each shot. Work, don't pose.",
  ],
  "Curved Treadmill Sprints": [
    "Walk 30 seconds to find your footing — the belt moves when you do.",
    "Sprint hard for 15–20 seconds by driving your knees and pumping your arms.",
    "Straddle the rails or walk slowly for 60–90 seconds to recover.",
    "Repeat. 6–10 rounds is a serious session; it's much harder than a motorized treadmill.",
  ],
  "Kettlebell Swings (EMOM)": [
    "EMOM = every minute on the minute. Start a clock.",
    "At the top of each minute, do 15 crisp swings (see Kettlebell Swing form).",
    "Rest whatever's left of the minute.",
    "Repeat for 8–12 minutes. If you can't finish 15 by second 40, drop to 10 per round.",
  ],
  "Kettlebell Clean & Press": [
    "Start with the bell between your feet. Hike it back and clean it to the rack position in one smooth pull — it should roll around your wrist, not crash on it.",
    "Squeeze your glutes, brace, and press the bell overhead to lockout.",
    "Lower to the rack, then swing it back down between your legs into the next clean.",
    "Switch arms halfway through the set.",
  ],
  "Medicine Ball Slam": [
    "Hold the ball, reach fully overhead, up on your toes.",
    "Slam it into the floor as hard as you can, following through with your whole body.",
    "Catch it on the bounce (or pick it up), and repeat immediately.",
    "All-out effort, every rep — this is a power move, not a toe-touch.",
  ],
  "Farmer's Carry": [
    "Deadlift a heavy kettlebell or dumbbell in each hand.",
    "Walk laps of the gym: tall posture, shoulders back, eyes ahead.",
    "Grip hard and breathe — don't hold your breath.",
    "When your posture breaks or grip fails, set them down, rest, repeat.",
  ],
  "Kettlebell Goblet Carry": [
    "Hold one bell at your chest by the horns, elbows tucked.",
    "Walk slowly with ribs down and glutes lightly squeezed.",
    "Breathe behind your brace — 30–45 seconds per carry.",
  ],
  "TRX Mountain Climber": [
    "Feet in the straps, hands on the floor in a strong plank.",
    "Drive one knee to your chest, then switch, running in place.",
    "Keep hips level and low — no piking.",
    "Fast feet, rigid torso, 20–30 seconds per round.",
  ],
  "Turkish Get-Up": [
    "Lie on your back, press a light bell to arms-length above your shoulder. Eyes on the bell from here on.",
    "Roll onto your opposite elbow, then your hand.",
    "Sweep the free leg back to a kneeling position under yourself.",
    "Stand up, reverse every step to lie back down. Slow, deliberate, perfect — one rep can take 30 seconds and that's correct.",
  ],
  "Treadmill Incline Walk": [
    "Set the incline to 10–12% and speed to a brisk walk (5–6 km/h).",
    "Walk without holding the rails — pump your arms instead.",
    "You should be breathing noticeably but able to speak in short sentences.",
    "20–40 minutes. Deceptively hard, very joint-friendly.",
  ],
  "Treadmill Easy Run": [
    "Flat or 1% incline, at a pace where you could hold a conversation.",
    "If you're gasping, slow down — easy runs build the engine; they're not races.",
    "Relax your shoulders and hands, land softly.",
  ],
  "Treadmill Intervals": [
    "Warm up 5 minutes easy.",
    "Run 1 minute at a hard-but-repeatable pace.",
    "Jog or walk 2 minutes easy.",
    "Repeat 6–8 times, then cool down 5 minutes.",
  ],
  "Curved Treadmill Tempo": [
    "Find a steady, self-powered pace you can hold — the curve makes every minute count for about double.",
    "Run 10–20 minutes at a 'comfortably hard' effort: you can say a few words, not sentences.",
    "Keep your posture tall; short quick steps work best on the curve.",
  ],
  "Elliptical Steady State": [
    "Set a moderate resistance you can keep smooth for the full session.",
    "Push and pull with the arms — it's a whole-body machine.",
    "20–40 minutes at conversational effort.",
  ],
  "Excite Cardio Intervals": [
    "Warm up 3–5 minutes at an easy setting.",
    "Alternate 2 minutes moderate with 1 minute pushed (raise resistance or speed).",
    "Repeat 6–8 rounds and cool down easy for 3 minutes.",
  ],
};

// Rough per-serving calories for the food-log estimator. Matched by keyword;
// a leading number multiplies ("2 eggs"). Deliberately coarse — estimates are
// labelled as such in the UI.
const FOOD_KCAL = {
  "sweet potato": 180, "avocado toast": 250, "peanut butter": 190,
  "protein shake": 200, "protein bar": 220, "cottage cheese": 110,
  "greek yogurt": 150, "greek yoghurt": 150, "orange juice": 110,
  "stir fry": 500, "banana": 105, "apple": 95, "egg": 75, "oatmeal": 300,
  "oats": 300, "granola": 200, "yogurt": 150, "yoghurt": 150, "berries": 70,
  "chicken": 300, "turkey": 250, "steak": 500, "beef": 400, "salmon": 400,
  "tuna": 130, "shrimp": 150, "fish": 300, "tofu": 180, "rice": 250,
  "pasta": 400, "potato": 160, "quinoa": 220, "lentil": 230, "beans": 120,
  "toast": 80, "bread": 80, "sandwich": 450, "wrap": 500, "burger": 700,
  "pizza": 570, "salad": 350, "soup": 300, "curry": 600, "smoothie": 250,
  "shake": 200, "cereal": 250, "pancake": 175, "bacon": 45, "avocado": 160,
  "cheese": 110, "hummus": 150, "nuts": 170, "chocolate": 150, "fruit": 80,
  "vegetables": 50, "veggies": 50, "broccoli": 50, "milk": 120, "latte": 150,
  "coffee": 5, "juice": 110, "beer": 150, "wine": 125,
};

// Goal definitions drive rep schemes, day structure and nutrition.
const GOALS = {
  muscle:    { label: "Build muscle",        blurb: "Get visibly stronger and more muscular." },
  strength:  { label: "Get strong",          blurb: "Move heavier weights on the big lifts." },
  fatloss:   { label: "Lose fat",            blurb: "Drop body fat while keeping muscle." },
  fitness:   { label: "General fitness",     blurb: "Feel good, move well, stay healthy." },
  endurance: { label: "Cardio & endurance",  blurb: "Build a bigger engine." },
  athletic:  { label: "Athletic conditioning", blurb: "Power, speed and work capacity." },
};

const MODALITY_COLORS = {
  strength:  "var(--plate-red)",
  cardio:    "var(--plate-blue)",
  core:      "var(--plate-yellow)",
  condition: "var(--plate-green)",
};
