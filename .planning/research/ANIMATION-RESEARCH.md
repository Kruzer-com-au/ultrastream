# AAA-Quality Procedural 3D Animation Research Document

## For: ULTASTREAM Battle Game (Browser-Based, Three.js / React Three Fiber)

**Technology Stack**: Three.js v0.183, React Three Fiber v9.5, @react-three/drei v10.7, GSAP v3.14, TypeScript
**Constraint**: All animation is procedural/code-driven. No pre-made animation files.
**Target**: 60fps on modern browsers. Characters built from primitive geometry groups.

---

## TABLE OF CONTENTS

1. [Animation Principles for Games (The 12 Principles Applied to Code)](#1-animation-principles-for-games)
2. [Procedural Animation Systems](#2-procedural-animation-systems)
3. [Combat Animation Techniques](#3-combat-animation-techniques)
4. [Easing & Interpolation Deep Dive](#4-easing--interpolation-deep-dive)
5. [Visual Feedback Animation](#5-visual-feedback-animation)
6. [Performance Optimization for Animation](#6-performance-optimization-for-animation)
7. [Specific Animation Recipes](#7-specific-animation-recipes)

---

## CURRENT STATE ANALYSIS

The existing codebase (`RebelWarrior.tsx`, `CorporateEnemy.tsx`) uses:
- **Simple sine oscillations** for all motion (`Math.sin(t * speed) * amount`)
- **No delta-time normalization** (uses `clock.getElapsedTime()` directly)
- **No state machine** (binary `isFighting` toggle)
- **No easing curves** (all sinusoidal, no anticipation/follow-through)
- **No hit feedback** (no flash, no hitstop, no screen shake)
- **Basic death animation** (uniform scale-down + spin)
- **Materials re-created in DeathParticles** on every mount (GC pressure)
- **`new THREE.Vector3()` allocated inside useFrame** in CorporateEnemy (line 199 -- GC pressure every frame)

These are the exact problems this research addresses.

---

## 1. ANIMATION PRINCIPLES FOR GAMES

The 12 Principles of Animation, originally codified by Disney animators Frank Thomas and Ollie Johnston, apply directly to game animation but with important modifications for interactivity.

### 1.1 Squash & Stretch (Code Implementation)

**Principle**: Objects deform to show force and momentum. Volume is always preserved.

**In code with primitives**: Apply non-uniform scale to the character group or body mesh. When squashing, increase X/Z and decrease Y proportionally.

**Rules for volume preservation**:
- If you scale Y by 0.8 (squash), scale X and Z by approximately 1.12 each (cube root of 1/0.8)
- Formula: `compensationScale = 1 / Math.sqrt(primaryScale)`
- This keeps the visual volume consistent

**When to apply**:
- **Landing from jump**: Squash on contact (Y: 0.7, XZ: 1.2) for 80-100ms, then spring back
- **Jump launch**: Stretch vertically (Y: 1.3, XZ: 0.88) during upward acceleration
- **Attack impact**: Brief squash on the weapon contact point
- **Walk cycle**: Subtle squash at lowest point of stride (Y: 0.95), stretch at highest (Y: 1.05)

**Critical for our primitives**: Because characters are built from boxes, spheres, and capsules, squash-and-stretch applied to the root group will uniformly scale all child primitives. This actually works well since it avoids the collision-boundary mismatch problem that plagues skinned-mesh squash-and-stretch.

**Recommended values**:
- Subtle (idle): 2-5% scale deviation
- Moderate (walk): 5-10% scale deviation
- Exaggerated (combat): 10-30% scale deviation
- Never exceed 40% in any axis or it looks broken

### 1.2 Anticipation (Wind-Up Before Action)

**Principle**: Prepare the audience for an action by showing the opposite motion first.

**Game-specific tension**: In games, anticipation must be very short or else the controls feel sluggish. The player pressed a button and expects an immediate response. The solution is to make anticipation fast but visually distinct.

**Implementation approach**:
- **Sword swing**: 80-120ms of the arm pulling backward before the strike
- **Jump**: 60-100ms crouch (character squashes down)
- **Dodge**: 40-60ms weight shift in the opposite direction
- **Heavy attack**: 200-350ms wind-up (longer anticipation = reads as more powerful)

**For our RebelWarrior sword swing**: Instead of the current continuous `Math.sin(t * 6) * 1.1` oscillation, break the swing into phases:
1. Wind-up: Sword arm rotates back 30 degrees over 100ms
2. Strike: Arm whips forward 150 degrees in 50ms
3. Follow-through: Arm drifts 20 degrees past the target over 80ms
4. Recovery: Arm returns to guard position over 150ms

### 1.3 Follow-Through & Overlapping Action

**Principle**: Different parts of the body don't start and stop at the same time. After the main action stops, appendages continue.

**Implementation for primitives**:
- When the body stops moving, the sword arm continues for 2-3 frames
- When the character turns, the head leads, then torso, then limbs follow with 30-60ms delays
- After a sword swing, the body rotates slightly in the direction of the swing before recovering

**Overlapping action offsets** (time delays from primary action):
- Head: leads by 30ms (looks before turning)
- Torso: primary driver (0ms offset)
- Arms: lag by 40-60ms
- Legs: lag by 20-40ms
- Weapon: lags by 60-100ms (shows weapon weight)

**Code approach**: Store the "desired" rotation/position and use lerp with different rates per body part:
- Head lerp rate: 12-15 per second
- Torso lerp rate: 8-10 per second
- Arms lerp rate: 6-8 per second
- Weapon: 4-6 per second (heavier feel)

### 1.4 Slow In / Slow Out (Easing)

**Principle**: Almost nothing in nature moves at constant speed. Acceleration and deceleration make motion feel physical.

**GSAP easing map for combat**:

| Action | Ease | Why |
|--------|------|-----|
| Sword wind-up | `power2.in` | Slow start builds tension |
| Sword strike | `power4.out` | Fast start, sharp deceleration = impact |
| Jump ascent | `power2.out` | Decelerating against gravity |
| Jump descent | `power2.in` | Accelerating with gravity |
| Knockback | `power3.out` | Fast initial push, gradual stop |
| Death fall | `power2.in` | Accelerating collapse |
| UI element popup | `back.out(1.7)` | Overshoot then settle |
| Camera shake decay | `power3.out` | Rapid dampening |
| Health bar drain | `power2.inOut` | Smooth and readable |
| Wave text entry | `elastic.out(1, 0.5)` | Dramatic bounce-in |

**The golden rule**: `.out` eases feel responsive because they respond immediately to input then settle. Use `.in` eases only for wind-ups and anticipation.

### 1.5 Arcs

**Principle**: Natural motion follows curved paths, not straight lines.

**For sword swings**: The current implementation uses `rotation.x` oscillation which produces a pendulum-like swing. A proper sword arc should combine:
- rotation.x (forward/backward swing)
- rotation.z (lateral wrist twist)
- rotation.y (body rotation contributing to the arc)

**For enemy knockback**: Instead of `position.x += velocity`, apply both horizontal and vertical components:
- Horizontal: decaying velocity
- Vertical: parabolic arc (initial upward velocity, gravity pulling down)
- This creates a natural "knocked into the air, lands and skids" arc

**Math for a parabolic knockback arc**:
- `posY = initialY + verticalVelocity * t - 0.5 * gravity * t * t`
- `posX = initialX + horizontalVelocity * t * dampingFactor`
- Where dampingFactor decays each frame: `dampingFactor *= 0.95`

### 1.6 Secondary Action

**Principle**: Supporting animations that happen alongside the main action without drawing attention away.

**For our characters**:
- **While idle**: Breathing (chest rise/fall), weight shifting (subtle lean), head micro-movements
- **While walking**: Arms counter-swing to legs, body rocks side-to-side, head bobs slightly
- **While fighting**: Cape/cloth simulation (if applicable), glow intensity pulsing, ground dust particles
- **While dying**: Sparks/particles trail behind, red glow intensifies then fades

**Implementation**: Layer multiple sine waves with different frequencies and amplitudes. Use prime-number-related frequencies to avoid synchronization (which looks robotic):
- Breathing: `sin(t * 1.8)` (primary) + `sin(t * 0.7) * 0.3` (variation)
- Weight shift: `sin(t * 0.4)` (slow sway)
- Head bob: `sin(t * 2.3) * 0.02` (subtle, faster)

### 1.7 Timing & Spacing

**Principle**: The number of frames an action takes defines its perceived weight and speed.

**Frame count guidelines at 60fps**:

| Action | Frames | Milliseconds | Feel |
|--------|--------|-------------|------|
| Jab/light attack | 8-12 | 133-200ms | Snappy, responsive |
| Medium attack | 15-20 | 250-333ms | Balanced |
| Heavy attack | 25-40 | 416-666ms | Weighty, committal |
| Idle breathing cycle | 108 | 1800ms | Relaxed, natural |
| Walk cycle (full stride) | 30-36 | 500-600ms | Standard pace |
| Enemy death animation | 36-48 | 600-800ms | Satisfying, not too long |
| Hit flash | 3-6 | 50-100ms | Quick visual punch |
| Hitstop/freeze | 3-6 | 50-100ms | Impact emphasis |
| Screen shake | 6-18 | 100-300ms | Short burst |
| Knockback travel | 12-24 | 200-400ms | Depending on force |
| Recovery to idle | 12-18 | 200-300ms | Return to readiness |

**Spacing principle**: Uneven spacing makes motion feel alive. The current codebase uses pure sine waves which produce perfectly even, metronomic motion. Break this by:
- Adding Perlin noise or secondary harmonics
- Using different easing curves for different phases
- Randomizing timing slightly (plus/minus 10-20%)

### 1.8 Exaggeration

**Principle**: Push motion beyond realism to make it read clearly.

**For our style (stylized primitive characters)**: We can be very exaggerated because the characters are already abstract. This is our advantage.

**When to exaggerate**:
- Sword swings: 30-50% more rotation than physically realistic
- Death animations: Characters can spin, shrink, and burst -- not realistic, but satisfying
- Hit reactions: Knockback distance 2-3x what physics would dictate
- Walk bobble: More pronounced vertical bounce and sway for comedy

**When NOT to exaggerate**:
- Camera shake (too much causes nausea)
- Health bar changes (must be readable)
- Movement speed (must match gameplay)

### 1.9 Appeal

**Principle**: Characters should be interesting to look at and their movement should have personality.

**What makes animation feel "alive" vs "robotic"**:

ROBOTIC signs (our current problem):
- Perfect sine waves (too smooth, too predictable)
- All body parts move in perfect sync
- No variation between cycles
- No response to game events (fighting looks same as idle with different speed)
- Death animation is generic (scale + spin for every enemy)

ALIVE signs (our target):
- Layered motion at different frequencies
- Slight asymmetry (left/right arms slightly different timing)
- Micro-variations per cycle (add noise)
- Distinct poses for each state (idle, alert, attacking, hurt, dying)
- Personality through movement (hero = confident, enemy = menacing/comedic)
- Reaction to events (flinch on hit, celebrate on kill)

---

## 2. PROCEDURAL ANIMATION SYSTEMS

### 2.1 State Machine Architecture

The current codebase has a binary state: `isFighting` is true or false. A proper animation state machine for our RebelWarrior needs these states:

```
STATES:
  IDLE        - Default stance, breathing, subtle sway
  ALERT       - Enemies approaching, stance widens, weapon readied
  ATTACKING   - Active sword swing cycle
  HIT         - Flinch reaction when rebels take damage
  CELEBRATING - Brief victory pose between waves
  DYING       - Health reaches zero

TRANSITIONS:
  IDLE -> ALERT:       enemies spawn (0.3s blend)
  ALERT -> ATTACKING:  enemy enters combat range (0.15s blend)
  ATTACKING -> ALERT:  no enemies in range (0.2s blend)
  ANY -> HIT:          rebels take damage (immediate, 0.3s duration)
  HIT -> previous:     hit animation completes (0.15s blend)
  ALERT -> CELEBRATING: wave cleared (0.2s blend)
  CELEBRATING -> IDLE:  celebration ends (0.3s blend)
  ANY -> DYING:        health reaches zero (immediate)
```

For the CorporateEnemy:

```
STATES:
  SPAWNING    - Pop into existence (scale from 0, spin)
  WALKING     - Marching toward center
  ATTACKING   - Reached center, damaging rebels
  DYING       - Defeated (several death variations)

TRANSITIONS:
  SPAWNING -> WALKING:  spawn animation completes (0.3s)
  WALKING -> ATTACKING: reached center proximity (0.15s)
  WALKING -> DYING:     player clicks/defeats (immediate)
  ATTACKING -> DYING:   player clicks/defeats (immediate)
```

### 2.2 State Blending and Interpolation

**The problem with hard state switches**: Instantly changing from one pose to another causes "popping" -- a jarring visual artifact. Solution: blend between states over a short duration.

**Lerp blending implementation**:

For each animated property (position offset, rotation), maintain:
- `currentValue`: the live animated value
- `targetValue`: what the new state wants
- `blendProgress`: 0.0 to 1.0

On each frame:
- `currentValue = lerp(currentValue, targetValue, blendSpeed * delta)`

Where `lerp(a, b, t) = a + (b - a) * t`

**For rotations**: Use quaternion SLERP (Spherical Linear Interpolation) instead of Euler lerp:
- Euler angles can cause gimbal lock and take weird paths
- Three.js provides `Quaternion.slerp(target, alpha)` and the newer `Quaternion.slerpQuaternions(start, end, alpha)`
- Alpha values of 0.08-0.15 per frame provide smooth, responsive blending
- SLERP guarantees the shortest rotation path and constant angular velocity

**Lerp smoothing rates by use case**:
- Responsive combat motion: `lerpFactor = 1 - Math.pow(0.001, delta)` (approximately 0.12 at 60fps)
- Smooth camera following: `lerpFactor = 1 - Math.pow(0.01, delta)` (approximately 0.08 at 60fps)
- Lazy follow-through (cape, weapon trail): `lerpFactor = 1 - Math.pow(0.1, delta)` (approximately 0.04 at 60fps)

**Frame-rate independent lerp** (critical): The standard `lerp(a, b, 0.1)` is NOT frame-rate independent. At 30fps it moves differently than at 60fps. Use the exponential decay formulation:
- `lerpFactor = 1 - Math.pow(remainingFraction, delta * speed)`
- Where `remainingFraction` is how much of the gap remains after 1 second (e.g., 0.001 means 99.9% of the way there in 1 second)

### 2.3 Procedural Walk Cycle

The CorporateEnemy's current walk is `rotation.z = Math.sin(t * 8) * 0.06` and `position.y = Math.abs(Math.sin(t * 8)) * 0.05`. This is minimal. A proper procedural walk combines several synchronized sine waves:

**Components of a walk cycle** (all driven by a single phase variable `phi = t * walkSpeed`):

1. **Vertical bounce** (body Y):
   - `bodyY = Math.abs(Math.sin(phi)) * bounceHeight`
   - bounceHeight: 0.04-0.08 units
   - Two peaks per full stride cycle (each foot contact creates a bounce)

2. **Lateral sway** (body X offset):
   - `bodyX = Math.sin(phi * 0.5) * swayAmount`
   - swayAmount: 0.02-0.04 units
   - Frequency is half the step frequency (sway per stride, not per step)

3. **Body tilt** (rotation Z):
   - `bodyRotZ = Math.sin(phi * 0.5) * tiltAmount`
   - tiltAmount: 0.03-0.06 radians
   - Synchronized with lateral sway

4. **Leg swing** (leg rotation X):
   - Left leg: `legRotX = Math.sin(phi) * legSwingAmount`
   - Right leg: `legRotX = Math.sin(phi + PI) * legSwingAmount` (180 degrees offset)
   - legSwingAmount: 0.3-0.5 radians

5. **Arm swing** (counter to legs):
   - Left arm: `armRotX = Math.sin(phi + PI) * armSwingAmount` (opposite to left leg)
   - Right arm: `armRotX = Math.sin(phi) * armSwingAmount` (opposite to right leg)
   - armSwingAmount: 0.2-0.4 radians
   - Add a 30-60ms delay (phase offset of 0.2-0.4 radians) for overlapping action

6. **Hip rotation** (body rotation Y):
   - `bodyRotY = Math.sin(phi) * hipRotAmount`
   - hipRotAmount: 0.03-0.06 radians
   - Adds a subtle twist that makes the walk feel more natural

7. **Shoulder counter-rotation**:
   - Rotate the upper body opposite to the hip rotation
   - `shoulderRotY = -bodyRotY * 0.5`
   - Creates the natural counter-twist of walking

8. **Head bob** (head position Y, additional to body):
   - `headBobY = Math.sin(phi * 2) * 0.01`
   - Double frequency of main bounce (subtle)
   - Add `Math.sin(phi * 0.3) * 0.02` for occasional head turn (looking around)

**Speed-to-animation mapping**:
- Slow walk: phi rate = 4-6, low amplitudes
- Normal walk: phi rate = 7-9, medium amplitudes
- Fast march: phi rate = 10-14, larger amplitudes, more forward lean
- Run: phi rate = 14+, body tilts forward 10-15 degrees, arms pump more

### 2.4 Procedural Idle Animation

The current RebelWarrior idle is a single sine wave: `position.y = Math.sin(t * 1.8) * 0.04`. A convincing idle needs multiple layers:

**Layer 1 -- Breathing** (most important):
- Chest/body scale Y: `1.0 + Math.sin(t * 1.8) * 0.015`
- Shoulder position Y: `baseY + Math.sin(t * 1.8) * 0.008`
- Chest scale X/Z compensating: `1.0 - Math.sin(t * 1.8) * 0.008`
- Breathing rate: 1.6-2.0 Hz (natural range is 12-20 breaths/minute)

**Layer 2 -- Weight shifting**:
- Body X offset: `Math.sin(t * 0.4) * 0.02` (very slow sway)
- Body rotation Z: `Math.sin(t * 0.4) * 0.01` (lean with the sway)
- Frequency: 0.3-0.5 Hz (shift weight every 2-3 seconds)

**Layer 3 -- Head movement**:
- Head rotation Y: `Math.sin(t * 0.3) * 0.05 + Math.sin(t * 1.1) * 0.02`
- Head rotation X (nod): `Math.sin(t * 0.7) * 0.015`
- Use non-harmonic frequencies (0.3, 0.7, 1.1) to avoid repetitive patterns

**Layer 4 -- Micro-movement (life noise)**:
- Add Perlin-like noise to all values: `(Math.sin(t * 3.7) * Math.sin(t * 5.3)) * 0.003`
- This "noise" comes from multiplying two sine waves at non-harmonic frequencies
- Apply to: body position (all axes), all rotations (tiny amounts)

**Layer 5 -- Weapon idle**:
- Sword arm gentle pendulum: `Math.sin(t * 1.2) * 0.06`
- Wrist micro-rotation: `Math.sin(t * 2.1) * 0.03`
- Shield arm: `Math.sin(t * 1.2 + 0.5) * 0.04` (slight offset from sword arm)

**What makes an idle feel "badass" vs "bored"**:
- BADASS: Wider stance, slight forward lean, head slightly down (looking up from under brows), weapon held at ready, subtle rhythmic bounce (like a boxer)
- BORED: Narrow stance, upright posture, head level, weapon lowered, slow movements
- For our rebel warrior: Use the badass approach. Add a subtle rhythmic bounce at 2.5Hz with very low amplitude (0.01 units) -- like a fighter staying light on their feet.

### 2.5 Attack Animations: Making Hits Feel POWERFUL

The key insight from fighting game design: **an attack's power is communicated through contrast**. A fast strike feels powerful because of the slow wind-up before it and the pause after impact.

**The 4-Phase Attack Structure**:

**Phase 1: Anticipation (Wind-Up)**
- Duration: 80-150ms for light attacks, 200-400ms for heavy
- Motion: Pull weapon back, shift weight, coil the body
- The body leans away from the attack direction
- This is where the player "sees it coming" -- essential for readability
- Ease: `power2.in` (accelerating into position)

**Phase 2: Strike (Active)**
- Duration: 30-60ms (as fast as possible)
- Motion: Weapon arcs through the attack zone
- The body uncoils, weight shifts forward aggressively
- This should be the fastest motion in the entire game
- Ease: `power4.out` or `none` (near-instant)

**Phase 3: Impact (Hit Confirmation)**
- Duration: 50-100ms
- This is where "hit-stop" occurs (see section 3)
- Weapon motion freezes at the point of contact
- Screen shake triggers, hit flash activates
- Particles spawn at contact point
- Ease: none (frozen)

**Phase 4: Recovery (Follow-Through)**
- Duration: 100-200ms
- Weapon continues past the impact point, then returns
- Body returns to guard/idle stance
- Character is vulnerable during this phase (gameplay balance)
- Ease: `power2.out` (decelerating back to rest)

**What makes attacks feel weak (avoid these)**:
- Constant-speed motion (no contrast between wind-up and strike)
- Weapon returning immediately to idle (no follow-through)
- No visual feedback at impact point
- Attack and idle animations blend smoothly (should be a sharp transition TO the attack)
- Symmetrical timing (wind-up = recovery -- feels mechanical)

---

## 3. COMBAT ANIMATION TECHNIQUES

### 3.1 Sword Swing Arc

The sword swing should not be a simple pendulum rotation on one axis. A proper slash uses combined rotations:

**Diagonal Downward Slash**:
- Wind-up: Arm rotates to position above opposite shoulder (rotation.x: -1.2rad, rotation.z: 0.6rad)
- Strike: Arm sweeps diagonally down across body (rotation.x: 0.8rad, rotation.z: -0.4rad)
- The body provides additional rotation (body.rotation.y: -0.3 to 0.3 radians)
- Total arc: roughly 160-200 degrees of combined rotation

**Horizontal Slash**:
- Wind-up: Arm extends to one side, wrist cocked (rotation.y: -1.0rad)
- Strike: Arm sweeps horizontally (rotation.y: -1.0 to 1.0rad)
- Body rotates to follow (body.rotation.y: -0.2 to 0.2rad)

**Overhead Chop** (heavy attack):
- Wind-up: Both arms raise overhead (rotation.x: -2.0rad)
- Strike: Arms come straight down (rotation.x: -2.0 to 0.5rad)
- Impact: Slight bounce at the bottom of the swing
- Body leans forward, then recovers

### 3.2 Hit-Stop (Impact Freeze) Technique

Hitstop is one of the most important techniques for making combat feel impactful. When an attack connects, both the attacker and target freeze for a brief moment.

**Implementation approach for useFrame**:

Maintain a `hitStopTimer` ref:
- When an attack connects, set `hitStopTimer = hitStopDuration`
- In useFrame, if `hitStopTimer > 0`, decrement by delta and SKIP all animation updates
- This freezes all characters in place at the moment of impact
- Optionally, add a tiny vibration (1-2 pixel offset oscillating at high frequency) during the freeze for extra punch

**Recommended durations**:
- Light attack hit: 50ms (3 frames at 60fps)
- Medium attack hit: 80ms (5 frames)
- Heavy attack hit: 100-130ms (6-8 frames)
- Critical/killing blow: 130-200ms (8-12 frames)

**Scaling with damage**: Make hitstop proportional to damage dealt. Higher damage = longer freeze = feels more devastating.

**Visual enhancements during hitstop**:
- Attacker vibrates slightly (tiny random position offsets of 0.01-0.02 units)
- White flash on the target (set emissive to white for 1-2 frames)
- Spawn impact particles at the contact point
- Slight camera zoom (0.5-1% FOV decrease for the duration)

### 3.3 Enemy Knockback Physics

The current enemy death is a simple scale-down with spin. Knockback should feel physical:

**Knockback formula**:
- Initial velocity: proportional to attack damage
- Direction: away from the attacker (use the vector from attacker to target)
- Add upward component for "launched" feel: verticalVelocity = horizontalVelocity * 0.3
- Apply damping each frame: `velocity *= 0.92` (quick deceleration)
- Apply gravity: `verticalVelocity -= gravity * delta` (gravity = 20-30 units/s^2)
- Clamp to ground: `if (position.y < 0) position.y = 0`

**Rotation during knockback**:
- Character tumbles: `rotation.x += angularVelocity * delta`
- angularVelocity: 8-15 radians/second for dramatic tumble
- Apply angular damping: `angularVelocity *= 0.95`

### 3.4 Death Animations (Multiple Variations)

Instead of one generic death, implement 3-4 variations randomly selected:

**Variation A: Dramatic Collapse**
- Phase 1 (0-200ms): Hit reaction -- body jerks backward, arms flail outward
- Phase 2 (200-500ms): Sequential joint collapse:
  - Head drops forward (rotation.x += 0.5 over 100ms)
  - Arms go limp (rotation.x lerps to hanging position over 150ms)
  - Knees buckle (legs rotate backward over 200ms)
  - Body falls to ground (position.y decreases with gravity)
- Phase 3 (500-800ms): Scale down to zero with `power2.in` easing
- Particle burst at the moment of final disappearance

**Variation B: Explosion/Shatter**
- Phase 1 (0-50ms): Flash white (emissive intensity spike)
- Phase 2 (50-100ms): Scale up slightly (1.0 to 1.2) -- expanding before burst
- Phase 3 (100-150ms): Scale to 0 instantly, spawn 10-15 cube particles
- Particles: random velocities outward (speed 3-8 units/s), gravity affected, scale to 0 over 500ms
- Each particle rotates randomly

**Variation C: Dissolve Spin**
- Phase 1 (0-600ms): Character spins on Y axis (accelerating rotation, 0 to 15 rad/s)
- Phase 2 (throughout): Scale decreases linearly from 1.0 to 0
- Phase 3 (throughout): Position Y increases (character rises up as it dissolves)
- Phase 4 (throughout): Opacity decreases (material transparency)
- Spawn upward-drifting particles throughout

**Variation D: Comedy Deflation (for corporate enemies)**
- Phase 1 (0-100ms): Freeze in a surprised pose (arms up, lean back)
- Phase 2 (100-400ms): Squash vertically (scale.y from 1.0 to 0.1, scale.xz from 1.0 to 1.8)
- Phase 3 (400-600ms): Slide/flatten into ground
- Phase 4 (600-800ms): Pop sound and particle burst, vanish
- This fits the comedic tone of corporate enemies

### 3.5 Crowd/Swarm Animation (20+ Enemies)

When rendering many enemies simultaneously, several techniques prevent both visual monotony and performance degradation:

**Staggered Animation Offsets**:
- Give each enemy a random time offset: `const animOffset = Math.random() * Math.PI * 2`
- Use `Math.sin(t * speed + animOffset)` instead of `Math.sin(t * speed)`
- This prevents the "chorus line" effect where all enemies move identically
- Also randomize walk speed by plus/minus 10-15%

**LOD Animation**:
- **Near enemies** (distance < 5 units): Full animation -- all body parts animated, all sine layers
- **Mid enemies** (5-10 units): Simplified animation -- body bob and rotation only, no individual limb animation
- **Far enemies** (> 10 units): Minimal animation -- vertical bounce only, no rotations
- Calculate distance from camera each frame and adjust complexity

**InstancedMesh for Distant Enemies**:
- For enemies beyond 8-10 units from camera, consider rendering them as InstancedMesh
- Use `setMatrixAt()` to position each instance
- Update `instanceMatrix.needsUpdate = true` after all positions are set
- This reduces draw calls from N to 1 for distant enemies
- Transition between individual mesh and instanced mesh at a distance threshold

**Animation Update Throttling**:
- Not every enemy needs to update animation every frame
- Alternate: update even-numbered enemies on even frames, odd on odd frames
- Or update based on distance: near enemies every frame, far enemies every 2-3 frames
- This halves the animation CPU cost with minimal visual impact

### 3.6 Combo System: Chaining Attacks

For the rebel warriors' combat, a combo system adds depth and visual variety:

**Chain structure**:
- Attack 1 (Light): Quick horizontal slash, 200ms total
- Attack 2 (Light): Backhand slash (opposite direction), 220ms total
- Attack 3 (Heavy Finisher): Overhead chop, 400ms total with bigger hitstop

**Timing windows**:
- After Attack 1's recovery phase, there's a 200ms window to trigger Attack 2
- After Attack 2's recovery phase, there's a 150ms window to trigger Attack 3
- If the window is missed, the character returns to idle/alert

**Visual progression**:
- Each combo hit has increasing visual intensity:
  - Attack 1: Normal hit effects
  - Attack 2: 1.5x particle count, slightly longer hitstop
  - Attack 3: 2x particles, longest hitstop, bigger screen shake, wider slash trail

---

## 4. EASING & INTERPOLATION DEEP DIVE

### 4.1 Linear vs. Eased Motion

**When to use LINEAR**:
- Constant-speed projectiles (bullets, arrows)
- Timer countdowns
- Progress bars that should feel mechanical
- Constant-speed scrolling

**When to use EASED** (almost everything else):
- Character movement start/stop
- UI element transitions
- Camera movements
- Attack wind-ups and recoveries
- Health bar changes
- Particle fade-out

### 4.2 GSAP Eases for Combat

**power1 (Quad)**: Subtle acceleration/deceleration. Good for minor UI transitions.

**power2 (Cubic)**: The workhorse ease. Good for most movement and transitions.
- `power2.out`: Use for sword recovery, knockback deceleration, camera settling
- `power2.in`: Use for gravity, wind-up acceleration
- `power2.inOut`: Use for weight shifts, smooth camera pans

**power3 (Quart)**: More dramatic than power2. Good for impactful moments.
- `power3.out`: Fast initial response, smooth settle. Good for knockback.

**power4 (Quint)**: Very sharp. Use sparingly for maximum impact.
- `power4.out`: Ideal for the strike phase of attacks. Starts extremely fast, then decelerates sharply -- communicates "this hit is FAST and POWERFUL."
- `power4.in`: Extreme slow start. Good for a very dramatic heavy attack wind-up.

**back**: Overshoots the target, then settles back. The overshoot amount is configurable.
- `back.out(1.7)`: Default overshoot. Great for weapon swing follow-through (weapon goes past the target then returns).
- `back.out(3)`: Exaggerated overshoot. Use for comical effects (enemy head snap-back on hit).
- `back.in(1.7)`: Pulls back before going forward. Perfect for the wind-up phase of an attack -- the weapon pulls back slightly before striking.

**elastic**: Spring-like oscillation. Bouncy and attention-grabbing.
- `elastic.out(1, 0.3)`: One strong bounce then settle. Good for: damage numbers popping in, UI element reveals, landing impacts on springy surfaces.
- `elastic.out(1, 0.5)`: Tighter spring, less oscillation. Better for: weapon recoil, shield vibration after blocking.
- Configurable: First parameter is amplitude (default 1), second is period (default 0.3). Smaller period = faster oscillation.

**bounce**: Multiple diminishing bounces. Use for objects hitting surfaces.
- `bounce.out`: Perfect for: defeated enemies hitting the ground, items dropping, comedic "bonk" effects.

### 4.3 Custom Easing for Weapon Swings

Standard easing functions may not perfectly match the feel of a weapon swing. Custom cubic-bezier curves provide precise control:

**Sword swing curve** (fast start, slight hold at apex, fast through):
- Approximation: Start with `power3.out`, but add a brief plateau in the middle
- In GSAP, use CustomEase (if available) or chain two tweens:
  - Tween 1: wind-up to apex position, `power2.in`, 120ms
  - Tween 2: apex to impact, `power4.out`, 50ms
  - Tween 3: follow-through, `back.out(1.2)`, 150ms

### 4.4 Spring Physics for Secondary Motion

For elements that should feel physically attached but responsive (weapon tip trailing, health bar "jelly" effect, camera follow):

**Critically Damped Spring** (no oscillation, fastest convergence):
- Use for: camera following player, smooth UI value changes, cursor following
- Parameters: damping ratio = 1.0, frequency = 8-12 Hz
- Implementation:

```
velocity += (target - current) * stiffness * delta
velocity *= Math.exp(-damping * delta)  // frame-rate independent damping
current += velocity * delta
```

Where:
- stiffness: 150-300 (higher = faster convergence)
- damping: 15-25 for critically damped feel
- Both values should be tuned together: `damping = 2 * Math.sqrt(stiffness)` for critical damping

**Underdamped Spring** (oscillation, bouncy):
- Use for: hit reactions, springy UI elements, wobbly weapon
- Parameters: damping ratio = 0.3-0.7, frequency = 5-15 Hz
- Same formula but with lower damping value: `damping = dampingRatio * 2 * Math.sqrt(stiffness)`

**The exponential decay smoothing shortcut** (simple but effective):
- `current += (target - current) * (1 - Math.pow(smoothing, delta))`
- Where smoothing is 0.0001-0.01 (smaller = faster)
- This is frame-rate independent and easy to implement
- Does not support velocity (no overshoot), so it is limited to non-bouncy smoothing

### 4.5 Quaternion SLERP for Rotations

Three.js Euler angles (rotation.x, rotation.y, rotation.z) are simple but can cause gimbal lock when two axes align. For smooth character turning and weapon rotation:

**When to use Euler angles** (current approach):
- Simple single-axis rotations (sword pendulum swing)
- Small rotations (idle micro-movements)
- When axes are guaranteed not to align

**When to use Quaternion SLERP**:
- Character turning to face a target (smooth 360-degree capability)
- Camera orientation interpolation
- Blending between two known orientations (e.g., idle pose to attack pose)
- Any rotation that might approach 90 degrees on multiple axes simultaneously

**Three.js SLERP API**:
- Create start and end quaternions: `startQuat.setFromEuler(startEuler)`, `endQuat.setFromEuler(endEuler)`
- Interpolate: `currentQuat.slerpQuaternions(startQuat, endQuat, alpha)`
- Apply: `mesh.quaternion.copy(currentQuat)`
- Alpha: 0.0 = start orientation, 1.0 = end orientation, animated over time

---

## 5. VISUAL FEEDBACK ANIMATION

### 5.1 Hit Flash (Damage Indicator)

When an enemy is hit, briefly flash the material:

**Implementation**:
- Store original emissive color and intensity
- On hit: Set emissive to white (#ffffff), emissiveIntensity to 2.0-3.0
- Duration: 50-80ms (3-5 frames)
- Tween back to original: `power2.out` over 100ms
- Alternative: oscillate between white and original 2-3 times (strobe effect)

**For our MeshStandardMaterial**:
- Access the material ref: `meshRef.current.material.emissive.set('#ffffff')`
- Set intensity: `meshRef.current.material.emissiveIntensity = 3.0`
- Reset after timer expires

**Color coding for damage types**:
- Normal damage: white flash
- Critical hit: yellow/gold flash (#ffd700)
- Fire damage: orange flash (#ff6600)
- Special/ultimate: cyan flash (#00ffff)

### 5.2 Screen Shake

**Trauma-based system** (industry standard):

Maintain a `trauma` value (0.0 to 1.0):
- On hit received: `trauma = Math.min(1.0, trauma + 0.3)`
- Each frame: `trauma = Math.max(0, trauma - decayRate * delta)`
- Decay rate: 1.5-3.0 per second
- Square the trauma for exponential feel: `shakePower = trauma * trauma`

**Camera offset calculation** (using Perlin-like noise):
- `offsetX = maxShake * shakePower * (Math.sin(time * 37.0) * Math.cos(time * 71.0))`
- `offsetY = maxShake * shakePower * (Math.sin(time * 53.0) * Math.cos(time * 43.0))`
- `offsetRotZ = maxRotation * shakePower * Math.sin(time * 61.0)`
- Where maxShake = 0.15-0.3 units, maxRotation = 0.02-0.04 radians
- The non-harmonic frequencies (37, 71, 53, 43, 61) prevent repetitive patterns

**Implementation in React Three Fiber**:
- Add the offset to the camera position in useFrame
- DO NOT use `camera.position.set()` (overwrites the base position)
- Instead: `camera.position.x = basePosition.x + offsetX`
- Reset: when trauma reaches 0, offsets naturally reach 0

**Shake amounts by event**:
- Enemy hit by player: trauma += 0.1 (subtle)
- Player takes damage: trauma += 0.3 (noticeable)
- Enemy death: trauma += 0.15 (satisfying)
- Wave clear: trauma += 0.05 (celebratory)
- Heavy attack impact: trauma += 0.4 (dramatic)
- Game over: trauma += 0.6 (devastating)

### 5.3 Hit-Stop Implementation

See section 3.2 for the core concept. Additional details:

**Global time scale approach** (alternative to per-character freeze):
- Instead of freezing individual characters, slow the entire game time
- `timeScale = 0.05` for 50ms, then restore to 1.0
- This is simpler to implement but affects everything (particles, UI, etc.)
- GSAP supports this: `gsap.globalTimeline.timeScale(0.05)`

**Selective hitstop** (preferred):
- Only freeze the attacker and the target
- Other enemies, particles, and camera continue normally
- More complex but looks more professional
- Implementation: each character checks a `frozen` flag before updating animations

### 5.4 Damage Numbers

Floating damage numbers add clarity and satisfaction:

**Spawn behavior**:
- Position: at the hit point on the enemy
- Initial velocity: upward (1.5-2.5 units/s) with slight random horizontal spread
- Apply gravity: slow deceleration upward, then fall
- Duration: 800ms-1200ms total
- Fade: Start fading at 60% of lifetime, fully transparent by end

**Scaling animation**:
- Pop-in: Scale from 0 to 1.2 over 80ms (`back.out(2)`)
- Settle: Scale from 1.2 to 1.0 over 60ms
- Hold at 1.0 for 400ms
- Shrink and fade: Scale to 0.5 over remaining time

**Visual style**:
- Regular damage: white, moderate size
- Critical hit: 1.5x larger, gold color, bold, add exclamation mark
- Multi-hit combo: Increasing size with each hit in the chain

**Implementation**: Use `<Html>` from drei with absolute positioning, or use Three.js `Sprite` with `SpriteMaterial` for a canvas-rendered number texture. The Html approach is simpler but has overhead; Sprite is more performant but less styled.

### 5.5 Health Bar Animation

The current health bar uses CSS `transition: width 0.3s ease`. This can be enhanced:

**"Damage Preview" bar** (the red bar chasing the white bar):
- Maintain two bar widths: `currentHealth` (white/green) and `previewHealth` (red)
- When damage occurs: `currentHealth` drops immediately
- `previewHealth` follows after a 300ms delay, draining at a visible rate
- The gap between them (red section) shows "recent damage"
- This technique is used in games like Street Fighter and many RPGs

**Implementation**:
- Instant bar: `width = currentHealth + '%'`, transitions immediately
- Preview bar: `width = previewHealth + '%'`, `transition: width 0.8s power2.inOut`
- Background: dark, Border: themed color
- Stack order (back to front): background, preview bar (red), current bar (green/yellow/red)

### 5.6 Wave Transition Animation

Between waves, create a dramatic moment:

**Camera movement**:
- Pan out (FOV increases from 50 to 55 over 500ms) with `power2.inOut`
- Slight upward tilt
- Hold for 1 second
- Pan back to normal over 500ms

**"WAVE X" text animation**:
- Entry: Scale from 3.0 to 1.0 with `elastic.out(1, 0.4)` over 600ms
- This creates a dramatic "slam into place" effect
- Hold for 1.5 seconds
- Exit: Scale from 1.0 to 0 with `power3.in` over 300ms (shrinks away)
- Optional: Add rotation from -15deg to 0deg during entry
- Color: Start red, transition to gold during hold

**Enemy spawn animation** (for new wave):
- Each enemy spawns with a staggered delay: `spawnDelay = enemyIndex * 100ms`
- Spawn effect: Scale from 0 to 1.2 to 1.0 (pop-in with `back.out(1.5)`) over 300ms
- Add a ground ring/flash at spawn point
- Enemies are invulnerable during spawn animation (200ms grace period)

### 5.7 Slow Motion (Time Dilation)

For special moments (killing blow, wave clear, critical hit):

**Implementation**:
- Multiply delta by a timeScale factor in useFrame
- Ramp down: `timeScale` goes from 1.0 to 0.2 over 100ms
- Hold slow: 200-400ms at 0.2 speed
- Ramp up: `timeScale` goes from 0.2 to 1.0 over 200ms with `power2.out`
- Use `power2.in` for the ramp-down (sudden slow-down) and `power2.out` for ramp-up (gradual return)

**What to slow**:
- Character animations: yes
- Particle physics: yes (slow motion particles look great)
- Camera shake: yes (exaggerated)
- UI animations: NO (health bars, wave text should remain at normal speed)
- Input handling: NO (player should always have responsive controls)

---

## 6. PERFORMANCE OPTIMIZATION FOR ANIMATION

### 6.1 useFrame vs GSAP vs requestAnimationFrame

**useFrame** (React Three Fiber hook):
- Use for: Continuous per-frame animation (idle, walk cycles, breathing)
- Pros: Integrated with R3F render loop, provides delta and state
- Cons: Runs every frame regardless, must be manually throttled
- Best practice: Always use the provided `delta` parameter, never `clock.getDelta()`

**GSAP tweens/timelines**:
- Use for: One-shot animations with defined start/end (attack sequences, transitions, UI animations)
- Pros: Handles easing natively, timeline sequencing, can be paused/reversed/replayed
- Cons: External to R3F render loop, creates objects on the heap
- Best practice: Create timelines for attack sequences, use `.kill()` to clean up when component unmounts

**Raw requestAnimationFrame**:
- Use for: Almost never in R3F context (useFrame already wraps it)
- Only use if you need animation outside of the Canvas context

**Recommended split**:
- useFrame: Idle, walk cycles, breathing, continuous effects, physics updates, camera following
- GSAP: Attack sequences (timeline with phases), wave transitions, UI animation, one-shot effects
- Neither (declarative): Health bar CSS transitions, simple hover effects

### 6.2 Batching Animation Updates

**Problem**: Each useFrame callback accesses and mutates Three.js objects. If 20 enemies each have their own useFrame, that is 20 separate callbacks per frame.

**Solution: centralized animation manager**:
- One component with one useFrame callback that updates ALL enemies
- Pass enemy data as an array, iterate and update positions in a single loop
- This is more cache-friendly and allows batch optimizations

**For our EnemyManager**: It already has a useFrame, but each CorporateEnemy also has its own useFrame. Consider moving enemy animation logic into EnemyManager's loop:
- Iterate enemies array
- Calculate new positions, rotations, scales
- Apply via refs stored in a Map

### 6.3 Object Pooling

The current CorporateEnemy creates `new THREE.Vector3()` on line 199 of the source file INSIDE the useFrame loop -- this allocates a new object every frame per enemy. At 20 enemies and 60fps, that is 1,200 Vector3 allocations per second, all of which become garbage.

**Fix: pre-allocate vectors**:
- Declare vectors outside the component or in a ref:
  `const tempVec = useRef(new THREE.Vector3())`
  `const tempDir = useRef(new THREE.Vector3())`
- Reuse with `.set()`, `.copy()`, `.sub()`, etc.
- Never use `new` inside useFrame

**Object pool for enemies**:
- Pre-create a pool of 30 enemy groups (meshes, materials)
- When spawning: take from pool, set position/rotation, make visible
- When dying: play death animation, then make invisible and return to pool
- This eliminates the cost of creating and destroying Three.js objects

**Pool management**:
- Pool size: 1.5x to 2x the maximum simultaneous enemy count
- Reset procedure: position to (0,0,0), scale to (1,1,1), rotation to (0,0,0), visible = false
- Material reset: opacity = 1, emissive back to default

### 6.4 InstancedMesh for Many Enemies

When enemy count exceeds 15-20, consider InstancedMesh:

**Setup**:
- Create one InstancedMesh with the enemy geometry and material
- Set count to max expected enemies (e.g., 30)
- Use a dummy Object3D to calculate matrices:
  ```
  dummy.position.set(x, y, z)
  dummy.rotation.set(rx, ry, rz)
  dummy.scale.set(sx, sy, sz)
  dummy.updateMatrix()
  instancedMesh.setMatrixAt(index, dummy.matrix)
  ```
- After updating all instances: `instancedMesh.instanceMatrix.needsUpdate = true`

**Limitation for our use case**: Our enemies are composed of multiple primitives (body box, head sphere, legs, arms, briefcase). InstancedMesh works for single-geometry objects. Options:
1. Create a merged geometry for distant enemies (combine all primitives into one BufferGeometry)
2. Use InstancedMesh only for the body (largest part), skip smaller details at distance
3. Use the drei `<Instances>` component which handles this more elegantly in R3F

### 6.5 Reducing GC Pressure

**Specific fixes for the current codebase**:

1. CorporateEnemy line 199: `const target = new THREE.Vector3(...targetPosition)` -- allocates every frame
   - Fix: `tempTarget.current.set(targetPosition[0], targetPosition[1], targetPosition[2])`

2. CorporateEnemy line 200: `const dir = target.clone().sub(currentPos.current)` -- `.clone()` allocates
   - Fix: `tempDir.current.copy(tempTarget.current).sub(currentPos.current)`

3. DeathParticles line 86-93: `const mat = new THREE.MeshStandardMaterial(...)` -- creates material every mount
   - Fix: Move material creation to a useMemo or module-level constant

4. General: Avoid creating arrays, objects, or strings inside useFrame
   - Pre-allocate all temporary computation objects as refs or module-level constants

**Pre-allocation checklist**:
- Vector3 temporaries: 2-3 per component that does spatial math
- Quaternion temporaries: 1-2 if using SLERP
- Color temporaries: 1 per component that does color animation
- Matrix4 temporaries: 1 per component using InstancedMesh

### 6.6 Frame Budget

At 60fps, each frame has 16.67ms total. The browser needs time for:
- JavaScript execution: ~4-6ms budget for animation logic
- Three.js scene graph traversal: ~1-2ms
- GPU rendering: ~6-8ms
- Browser overhead (compositing, GC): ~2-3ms

**Animation budget allocation** (~5ms for animation):
- Camera update: 0.1ms
- Hero animation (2 warriors): 0.2ms
- Enemy animations (20 enemies): 1.0-2.0ms
- Particle updates (50-100 particles): 0.5-1.0ms
- State machine transitions: 0.1ms
- Visual effects (flash, shake): 0.1ms
- Remaining buffer: ~1-2ms

**Profiling strategy**:
- Use `performance.now()` around animation code blocks to measure
- Use Chrome DevTools Performance tab to identify frame drops
- Use `renderer.info` to monitor draw calls, triangles, textures

### 6.7 Web Workers for Animation Math

**Verdict**: Generally NOT worth it for our use case.

**Why**:
- The communication overhead (postMessage/structured clone) between main thread and worker costs 0.1-0.5ms per message
- Our animation math per frame is simple (sine functions, vector operations): ~0.5-2ms total
- The overhead of sending position data to a worker and receiving results back would likely exceed the computation cost itself
- Web Workers shine when computation takes >5ms (physics simulations, pathfinding, large particle systems)

**When it WOULD be worth it**:
- If we had 100+ enemies with complex AI pathfinding
- If we added proper physics simulation (collision detection, force resolution)
- If we implemented procedural terrain or level generation

**Alternative**: Use `requestIdleCallback` for non-critical animation prep (pre-calculating attack sequences, building particle pools) during idle moments.

---

## 7. SPECIFIC ANIMATION RECIPES

### 7.A REBEL HERO IDLE ANIMATION

**Character personality**: Confident rebel fighter, alert but composed. Fights for freedom. Feels like a seasoned warrior -- not nervous, not lazy.

**Body parts and their motion**:

| Body Part | Motion Type | Frequency (Hz) | Amplitude | Phase Offset | Notes |
|-----------|------------|-----------------|-----------|--------------|-------|
| Full body Y | Breathing rise/fall | 1.8 | 0.03 units | 0 | Primary life signal |
| Full body Y | Fighter bounce | 2.5 | 0.008 units | 0 | Subtle boxer-like readiness |
| Body scale Y | Breath expand | 1.8 | 0.012 (multiplicative) | 0 | Chest expanding |
| Body scale XZ | Breath compress | 1.8 | 0.007 (multiplicative) | PI | Compensate to preserve volume |
| Body rotation Z | Weight shift lean | 0.4 | 0.012 radians | 0 | Very slow sway |
| Body position X | Weight shift | 0.4 | 0.015 units | 0 | Matches lean |
| Head rotation Y | Looking around | 0.3 | 0.04 radians | 0 | Scanning environment |
| Head rotation X | Subtle nod | 0.7 | 0.015 radians | PI/4 | Not sync'd with Y |
| Sword arm rotation X | Gentle pendulum | 1.2 | 0.06 radians | 0 | Weapon sway |
| Sword arm rotation Z | Wrist twist | 2.1 | 0.02 radians | PI/3 | Adds complexity |
| Shield arm rotation X | Counter-sway | 1.2 | 0.04 radians | PI/2 | Offset from sword |
| Left leg rotation X | Micro-shift | 0.35 | 0.01 radians | 0 | Weight distribution |
| Right leg rotation X | Micro-shift | 0.35 | 0.01 radians | PI | Alternating |

**Additional layers**:
- Apply noise function to all values: `value += Math.sin(t * 3.7) * Math.cos(t * 5.3) * 0.003`
- Occasionally (every 4-6 seconds), trigger a "readiness check" micro-animation: sharper head turn, grip tightens (sword arm rotates slightly)
- Glow aura intensity oscillates: `emissiveIntensity = 0.3 + Math.sin(t * 1.5) * 0.05`

**What makes it feel badass**:
- The fighter bounce (2.5Hz) at very low amplitude -- this is the "I'm ready to fight" signal
- Wide stance (legs positioned further apart than currently)
- Slight forward lean of the torso (rotation.x = -0.05 radians at rest)
- Head angled slightly down (rotation.x = 0.08) -- looking up through brows
- Sword held at mid-guard, not drooping (sword arm base rotation.x = -0.3)

### 7.B REBEL HERO SWORD SWING

**Full attack timeline** (total duration: ~500ms):

**Phase 1: ANTICIPATION (0-120ms)**
```
Time 0ms:
  Body rotation.y: 0 -> -0.2 (turn away from strike direction)
  Sword arm rotation.x: -0.3 -> -1.4 (pull sword back and up)
  Sword arm rotation.z: 0 -> 0.3 (cock wrist outward)
  Body position.z: 0 -> -0.03 (lean back slightly)
  Body scale.y: 1.0 -> 0.95 (coiling crouch)
  Shield arm rotation.x: -0.1 -> -0.4 (shield comes up defensively)
  Easing: power2.in (accelerating into the coil)
```

**Phase 2: STRIKE (120-170ms) -- 50ms only!**
```
Time 120ms -> 170ms:
  Body rotation.y: -0.2 -> 0.35 (explosive body twist INTO the strike)
  Sword arm rotation.x: -1.4 -> 0.6 (full forward swing arc = ~115 degrees)
  Sword arm rotation.z: 0.3 -> -0.2 (wrist snaps through)
  Body position.z: -0.03 -> 0.04 (weight shifts forward)
  Body scale.y: 0.95 -> 1.05 (explosive extension)
  Easing: power4.out (MAXIMUM speed at start, sharp deceleration)
```

**Phase 3: IMPACT (170-230ms) -- 60ms freeze**
```
Time 170ms -> 230ms:
  ALL MOTION FREEZES (hitstop)
  Add vibration: random offset of 0.01 units per frame on X and Z
  Camera shake: trauma += 0.15
  Hit flash on target: emissive white for 50ms
  Spawn 5-8 impact particles at contact point
  Play hit sound effect
```

**Phase 4: FOLLOW-THROUGH (230-380ms)**
```
Time 230ms -> 380ms:
  Sword arm rotation.x: 0.6 -> 0.8 (continues past impact)
  Sword arm rotation.z: -0.2 -> -0.35 (wrist continues)
  Body rotation.y: 0.35 -> 0.15 (body begins to recover)
  Body position.z: 0.04 -> 0.01 (settling)
  Easing: power2.out (decelerating naturally)
```

**Phase 5: RECOVERY (380-500ms)**
```
Time 380ms -> 500ms:
  Sword arm rotation.x: 0.8 -> -0.3 (return to guard)
  Sword arm rotation.z: -0.35 -> 0 (wrist straightens)
  Body rotation.y: 0.15 -> 0 (face forward)
  Body position.z: 0.01 -> 0 (centered)
  Body scale.y: 1.05 -> 1.0 (relax)
  Shield arm rotation.x: -0.4 -> -0.1 (shield lowers)
  Easing: power2.inOut (smooth return to guard)
```

**GSAP Timeline approach**:
- Create a `gsap.timeline()` with 5 sequential tweens
- Each tween targets the ref's rotation/position/scale
- Trigger the timeline on attack command
- On timeline complete, return to idle state

### 7.C CORPORATE ENEMY WALK

**Character personality**: A corporate drone. Menacing because they represent conformity, but also slightly comedic. Their gait should be rigid, purposeful, and a bit robotic -- like a middle manager marching toward you with a quarterly report.

**Walk cycle parameters** (phase variable: `phi = t * 7`):

| Body Part | Formula | Result |
|-----------|---------|--------|
| Body Y (bounce) | `abs(sin(phi)) * 0.06` | Stiff, bouncy march |
| Body Z rotation (tilt) | `sin(phi * 0.5) * 0.05` | Side-to-side sway |
| Body Y rotation (march) | `sin(phi) * 0.04` | Rigid hip twist |
| Head Y rotation | `sin(phi * 0.3) * 0.03` | Slow, suspicious look-around |
| Head X rotation | `-0.1` (constant) | Slight chin-down, looking ahead menacingly |
| Left leg rotation X | `sin(phi) * 0.35` | Forward stride |
| Right leg rotation X | `sin(phi + PI) * 0.35` | Opposite stride |
| Left arm rotation X | `sin(phi + PI) * 0.25` | Counter-swing (opposite to left leg) |
| Right arm rotation X | `sin(phi) * 0.15` | Reduced swing (holding briefcase) |
| Briefcase rotation X | `sin(phi) * 0.08` | Subtle briefcase sway |
| Briefcase position Y | `sin(phi * 2) * 0.01` | Tiny vertical bounce |

**Comedic touches**:
- Walk speed is slightly too fast for the stride length (legs move comically quickly for short steps)
- Head stays unnervingly stable while body bounces (isolate head from body bounce)
- Red eyes glow brighter as they get closer: `emissiveIntensity = 0.4 + (1 - distToCenter/8) * 0.6`
- Tie flaps: `tieRotation.z = sin(phi * 2) * 0.15` (bouncing with walk)
- Occasional speech bubble with corporate jargon (already implemented)

**Speed variation by wave**:
- Wave 1-2: walkSpeed = 6 (slow march, time to learn)
- Wave 3-4: walkSpeed = 8 (medium pace, some pressure)
- Wave 5+: walkSpeed = 10-12 (aggressive rush)

### 7.D ENEMY DEATH ANIMATION

**Selected variation for corporate enemy: "Boardroom Bust"**

**Timeline (total: 750ms)**:

**Phase 1: SHOCK (0-100ms)**
```
Time 0ms -> 100ms:
  Body rotation.x: 0 -> -0.3 (leans backward in shock)
  Arms rotation.x: current -> -0.8 (arms fling up)
  Scale.y: 1.0 -> 1.1 (slight upward stretch of surprise)
  Scale.xz: 1.0 -> 0.95 (volume preservation)
  Eyes emissiveIntensity: 0.6 -> 3.0 (eyes flare)
  Easing: power4.out (sudden jerk back)

  At t=0ms:
    Trigger hit flash (white emissive 50ms)
    Camera trauma += 0.15
    Spawn 3 small spark particles
```

**Phase 2: SPIN UP (100-350ms)**
```
Time 100ms -> 350ms:
  Body rotation.y: accelerating spin (0 to ~4*PI, ease: power2.in)
  Position.y: 0 -> 0.5 (rises off ground)
  Scale: 1.1 -> 0.7 (shrinking)
  Arms rotation.z: spread outward to 1.5 radians (spinning with arms out)
  Red glow opacity: 0.08 -> 0.4 (aura intensifies)
  Easing: power2.in (accelerating spin)
```

**Phase 3: BURST (350-450ms)**
```
Time 350ms:
  Scale instantly to 0
  Spawn 10-15 cube particles:
    Colors: mix of #ff0040, #555555, #333333 (suit colors + red)
    Velocities: radial outward, speed 2-5 units/s
    Random rotation velocities: 5-15 rad/s per axis
    Each particle: different size (0.03-0.08 units)
    Gravity: 15 units/s^2
  Spawn briefcase as separate particle:
    Larger (0.12 units)
    Higher initial velocity (upward)
    Tumbles dramatically
    Lasts slightly longer than other particles
  Camera trauma += 0.1
```

**Phase 4: PARTICLE FADE (450-750ms)**
```
Time 450ms -> 750ms:
  All particles:
    Continue physics (gravity, velocity)
    Scale decreasing: 1.0 -> 0 over 300ms, power2.in
    Opacity decreasing: 1.0 -> 0 over 300ms
    Hit ground: bounce once with 0.3 coefficient of restitution
  Briefcase:
    Lands on ground, bounces, settles
    Fades out last (extra 100ms)
```

**Score popup** (concurrent with Phase 3):
- "+100" appears at death position
- Scale: 0 -> 1.3 -> 1.0 (pop-in with `back.out(2)`) over 150ms
- Drift upward: 1.0 units/s
- Fade: start at t+600ms, fully transparent by t+1000ms
- Color: white for normal, gold for combo finisher

### 7.E WAVE TRANSITION ANIMATION

**Timeline for transition from Wave N to Wave N+1** (total: ~4000ms):

**Phase 1: VICTORY MOMENT (0-800ms)**
```
Time 0ms:
  All remaining death particles complete
  Camera: Begin slow zoom out (FOV 50 -> 55 over 800ms, power2.inOut)
  Camera: Slight upward pan (position.y += 1.0 over 800ms)
  Rebels: Transition to CELEBRATING state
    Both warriors: Sword arm raised overhead (rotation.x: -0.3 -> -2.0)
    Body: slight lean back (confident pose)
    Add golden particle burst around rebels (20 particles, upward drift)
```

**Phase 2: WAVE TEXT ENTRY (800-1800ms)**
```
Time 800ms:
  "WAVE X CLEARED!" text appears (HTML overlay or 3D Text)
  Entry animation:
    Scale: 3.0 -> 1.0 with elastic.out(1, 0.5) over 600ms
    Opacity: 0 -> 1 with power2.out over 200ms
    Rotation: -10deg -> 0deg with power2.out over 400ms
    Color: Start white, shift to gold over 500ms

  Subtext: "+X ENEMIES DEFEATED" appears 200ms after main text
    Scale: 0 -> 1.0 with back.out(1.5) over 300ms
    Position: starts 0.5 units below final, rises into place
```

**Phase 3: WAVE TEXT HOLD & EXIT (1800-2800ms)**
```
Time 1800ms -> 2500ms:
  Text holds in place
  Subtle pulse animation: scale oscillates 1.0 to 1.03 at 2Hz

Time 2500ms -> 2800ms:
  Text exit:
    Scale: 1.0 -> 0 with power3.in over 300ms
    Opacity: 1 -> 0 with power2.in over 250ms
    Position.y: rises 0.5 units (floats up and away)
```

**Phase 4: NEW WAVE INTRO (2800-4000ms)**
```
Time 2800ms:
  "WAVE X+1" text appears
  Entry: Scale from 0 with back.out(2) over 400ms
  Color: Red/threatening theme
  Camera: zoom back in (FOV 55 -> 50 over 600ms, power2.inOut)

Time 3000ms onward:
  Enemies begin spawning with staggered delays:
    Enemy 1: spawns at t=3000ms
    Enemy 2: spawns at t=3100ms
    Enemy 3: spawns at t=3200ms
    ...and so on, 100ms apart

  Each enemy spawn:
    Scale: 0 -> 1.2 -> 1.0 (back.out(1.5), 300ms)
    Position.y: drops from 1.0 to 0 (falls into place)
    Red flash at spawn point (ground ring pulse)

Time 3500ms:
  "WAVE X+1" text exits (same as Phase 3 exit)

Time 3800ms:
  Rebels transition from CELEBRATING to ALERT
  Camera fully returned to normal

Time 4000ms:
  Game resumes normal play
  All enemies now active and moving
```

**Camera path during transition**:
- Use smooth spline or SLERP for camera orientation
- Position: (0, 8, 8) -> (0, 10, 10) -> (0, 8, 8) (zoom out and back)
- LookAt: always (0, 0, 0) (center of arena)
- Add subtle rotation (rotation.z: 0 -> 0.02 -> 0) for dynamism

---

## APPENDIX: KEY FORMULAS REFERENCE

### Frame-Rate Independent Lerp
```
value += (target - value) * (1 - Math.pow(smoothFactor, delta))
```
Where smoothFactor is 0.0001 (fast) to 0.1 (slow), delta is seconds since last frame.

### Volume-Preserving Squash/Stretch
```
compensationScale = 1 / Math.sqrt(primaryScale)
```
If squashing Y by factor s, set X and Z to `1 / Math.sqrt(s)`.

### Parabolic Arc (knockback, jump)
```
y = y0 + vy * t - 0.5 * g * t^2
x = x0 + vx * t * dampFactor^t
```
Where g = 20-30, dampFactor = 0.92-0.97.

### Trauma-Based Shake
```
shakePower = trauma * trauma
offsetX = maxShake * shakePower * sin(time * 37) * cos(time * 71)
offsetY = maxShake * shakePower * sin(time * 53) * cos(time * 43)
trauma -= decayRate * delta
```

### Critical Damping Spring
```
velocity += (target - current) * stiffness * delta
velocity *= Math.exp(-damping * delta)
current += velocity * delta
// For critical damping: damping = 2 * Math.sqrt(stiffness)
```

### Pseudo-Perlin Noise (cheap, no library)
```
noise(t) = sin(t * 3.7) * cos(t * 5.3) * sin(t * 7.1)
```
Multiply incommensurate frequencies for non-repeating patterns.

### Staggered Enemy Animation Offset
```
const animOffset = enemyIndex * 0.7 + Math.random() * 0.5
const animTime = elapsedTime + animOffset
```

---

## RESEARCH SOURCES

- [Game Developer -- 12 Principles for Game Animation](https://www.gamedeveloper.com/game-platforms/12-principles-for-game-animation)
- [Game Developer -- The 12 Principles of Animation in Video Games](https://www.gamedeveloper.com/production/the-12-principles-of-animation-in-video-games)
- [GDKeys -- Keys to Combat Design: Anatomy of an Attack](https://gdkeys.com/keys-to-combat-design-1-anatomy-of-an-attack/)
- [SLYNYRD -- Pixelblog 9: Melee Attacks](https://www.slynyrd.com/blog/2018/9/8/pixelblog-9-melee-attacks)
- [SmashWiki -- Hitlag](https://www.ssbwiki.com/Hitlag)
- [Source Gaming -- Sakurai on Hitstop](https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/)
- [CritPoints -- Hitstop Deep Dive](https://critpoints.net/2017/05/17/hitstophitfreezehitlaghitpausehitshit/)
- [GSAP Official -- Easing Documentation](https://gsap.com/resources/getting-started/Easing/)
- [GSAPify -- GSAP Ease Complete Guide](https://gsapify.com/gsap-ease)
- [Palos Publishing -- Simulating Breathing and Idle Motion Procedurally](https://palospublishing.com/simulating-breathing-and-idle-motion-procedurally/)
- [Palos Publishing -- Managing Transitions Between Animation States](https://palospublishing.com/managing-transitions-between-animation-states/)
- [Wayline -- Procedural Animation for Dynamic Game Worlds](https://www.wayline.io/blog/procedural-animation-dynamic-game-worlds)
- [Wayline -- Procedural Animation Techniques](https://www.wayline.io/blog/procedural-animation-techniques)
- [Allen Chou -- Game Math: Precise Control over Numeric Springing](https://allenchou.net/2015/04/game-math-precise-control-over-numeric-springing/)
- [Alexis Bacot -- The Art of Damping](https://www.alexisbacot.com/blog/the-art-of-damping)
- [The Orange Duck -- Spring Roll Call](https://theorangeduck.com/page/spring-roll-call)
- [R3F Docs -- Performance Pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)
- [Three.js Docs -- InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html)
- [Codrops -- Three.js Instances](https://tympanus.net/codrops/2025/07/10/three-js-instances-rendering-multiple-objects-simultaneously/)
- [Codrops -- Building Efficient Three.js Scenes](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/)
- [Blood Moon Interactive -- Juice in Game Design](https://www.bloodmooninteractive.com/articles/juice.html)
- [Game Programming Patterns -- Object Pool](https://gameprogrammingpatterns.com/object-pool.html)
- [DEV Community -- Trigonometry Tricks for Game Effects](https://dev.to/patrocinioluisf/trigonometry-tricks-the-math-behind-game-effects-3pmi)
- [Surma -- When Should You Use Web Workers](https://surma.dev/things/when-workers/)
- [Wikipedia -- Slerp](https://en.wikipedia.org/wiki/Slerp)
- [AnimSchool -- Breathing Life into Idle Animations](https://blog.animschool.edu/2024/06/14/breathing-life-into-idle-animations/)
- [GarageFarm -- Idle Animation Tips](https://garagefarm.net/blog/idle-animation-tips-to-animate-your-characters)
- [Rivals Workshop -- Anticipation, Action, Recovery](https://www.rivalslib.com/workshop_guide/art/anticipation_action_recovery.html)
- [Number Analytics -- State Machines for Advanced Game Animation](https://www.numberanalytics.com/blog/advanced-state-machines-game-animation)
- [Utsubo -- 100 Three.js Tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips)
