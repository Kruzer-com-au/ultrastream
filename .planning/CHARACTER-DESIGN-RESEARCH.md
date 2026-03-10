# 3D Character Design Research: Primitives-Only Battle Characters

## Project Context

**Stack:** Three.js v0.183, React Three Fiber v9.5, @react-three/drei v10.7, TypeScript
**Constraint:** NO external 3D model files. Characters built ENTIRELY from primitive geometries.
**Theme:** Buff rebel barbarian heroes vs. corporate suit enemies in a browser-based 3D battle game.
**Current State:** Characters exist using basic CapsuleGeometry/BoxGeometry/SphereGeometry. They are functional but visually basic. This document provides the research foundation for making them look AWESOME.

---

## Table of Contents

1. [Proportions and Silhouette Design](#1-proportions-and-silhouette-design)
2. [Building Complex Characters from Primitives](#2-building-complex-characters-from-primitives)
3. [Materials and Visual Fidelity](#3-materials-and-visual-fidelity)
4. [Character Hierarchy and Rigging Without Bones](#4-character-hierarchy-and-rigging-without-bones)
5. [Visual Effects That Sell Characters](#5-visual-effects-that-sell-characters)
6. [Specific Design Recipes](#6-specific-design-recipes)

---

## 1. Proportions and Silhouette Design

### 1.1 Why Silhouette Is Everything

A character's silhouette is the single most important element of its visual design. If a character cannot be identified from its black-filled outline alone, no amount of detail, color, or animation will save it. In fast-moving game contexts, players perceive characters at small sizes, in motion, and often partially obscured. The silhouette is what registers first.

**Core principle:** Design the silhouette FIRST. Fill a shape with solid black. If the personality and role are not immediately readable, the design has failed at the foundational level. Details, colors, and textures are secondary enhancements.

**Readability at distance:** In a browser-based battle game viewed from an overhead/isometric camera at position [0, 8, 8], characters occupy relatively small screen area. Every polygon must contribute to the silhouette. Small details that look good in a turntable view become invisible noise at gameplay distance.

### 1.2 The Head-Count Proportion System

The classical system for measuring character proportions uses the head as a unit of measurement, a practice dating back to the Greek sculptor Polykleitos in the fifth century BCE.

**Standard proportion tiers:**

| Proportion | Head Count | Character Feel | Use For |
|---|---|---|---|
| Chibi / Cute | 2-3 heads tall | Adorable, comic | Mascots, comedy enemies |
| Stylized Child | 4-5 heads tall | Playful, approachable | Sidekicks, minions |
| Realistic Average | 7-7.5 heads tall | Normal, relatable | NPCs, realistic characters |
| Ideal / Noble | 8 heads tall | Graceful, aspirational | Action heroes |
| Heroic / Godlike | 8.5-9 heads tall | Powerful, superhuman | Barbarians, gods, bosses |

**For our barbarian heroes: use 8.5 heads tall.** This pushes them into "superhero territory" with elongated legs and an imposing frame. The body is 7.5x more prominent than the head, meaning the body silhouette (broad shoulders, narrow waist, powerful limbs) carries the character communication.

**For corporate enemies: use 5-6 heads tall.** This shorter, stockier proportion makes them look comically outmatched but also gives them a swarming, pest-like quality. Their bodies are boxy and their proportions read as "annoying bureaucrats" rather than physical threats.

**For boss enemies: use 7-8 heads tall.** Taller than regular enemies but not as heroically proportioned as the rebels. Their size comes from width and mass, not from idealized proportions.

### 1.3 Shoulder-to-Waist Ratio

This is the single most important ratio for communicating "heroic" vs "corporate" instantly.

**Heroic barbarian:**
- Shoulder width: 3.0-3.5 head-widths (extremely broad)
- Waist width: 1.5-2.0 head-widths (narrow by comparison)
- Ratio: approximately 2:1 shoulder-to-waist
- This creates a dramatic V-taper / inverted triangle that screams POWER

**Corporate enemy:**
- Shoulder width: 1.8-2.0 head-widths (narrow, sloped)
- Waist width: 1.8-2.2 head-widths (same or wider than shoulders)
- Ratio: approximately 1:1 or even inverted (wider at waist)
- This creates a boxy, rectangle shape that reads as WEAK and CORPORATE

**Boss enemy:**
- Shoulder width: 2.5-3.0 head-widths
- Waist width: 2.5-3.0 head-widths (just as wide)
- Ratio: approximately 1:1 but at massive scale
- This creates a MONOLITHIC, immovable rectangle that reads as WEALTH and POWER

### 1.4 Shape Language: The Geometry of Personality

Shape language is perhaps the most universal tool in character design. The psychological associations are deeply hardwired:

**Circles = Warmth, Safety, Friendliness**
- Characters built from rounded forms feel non-threatening and approachable.
- Mickey Mouse is constructed from just three circles, deliberately chosen to create maximum friendliness.
- Use for: Friendly NPCs, companions, support characters.

**Squares = Stability, Strength, Reliability**
- Characters with square/rectangular builds convey dependability and power.
- Carl Fredricksen in UP is literally built like a block, reflecting his stubborn, immovable nature.
- Reinhardt's boxy armor in Overwatch signals unyielding strength.
- Use for: Heroes, tanks, guardian figures, and also corporate enemies (reliable but rigid).

**Triangles = Danger, Aggression, Villainy**
- Sharp angular forms signal hostility, unpredictability, and threat.
- Scar in The Lion King uses triangular features to contrast Mufasa's squared design.
- Diablo (Blizzard) is the embodiment of triangular design: claws, spikes, angular body.
- Use for: Weapons, villain accents, aggressive elements.

**Application to our characters:**

| Character | Primary Shape | Secondary Shape | Feeling |
|---|---|---|---|
| Rebel Barbarian | Square (torso, power) | Triangle (weapons, shoulders, dynamism) | Strong, heroic, dangerous |
| Corporate Enemy | Square (suit, boxy body) | Rectangle (elongated, rigid) | Rigid, predictable, corporate |
| Boss Enemy | Square (massive, imposing) | Triangle (crown spikes, power symbols) | Wealthy, threatening, immovable |

### 1.5 Exaggeration Principles

The principle of exaggeration in character design is not about making everything bigger. It is about strategic amplification: identifying the 2-3 features that define the character and pushing THOSE beyond realism, while keeping everything else grounded.

**What to exaggerate for barbarian heroes:**
- Shoulders and upper back: push to 1.5-2x realistic width
- Forearms and hands: slightly oversized (communicates grip strength, weapon mastery)
- Chest depth (front-to-back): thicker than realistic
- Feet and stance width: wider base for stability

**What to MINIMIZE for barbarian heroes:**
- Head size: slightly undersized relative to body (makes body look even bigger)
- Waist: as narrow as silhouette allows (emphasizes V-taper)
- Neck: short or absent (head sits right on trapezius muscles)

**What to exaggerate for corporate enemies:**
- Head: slightly large (emphasizes "all brain, no brawn")
- Briefcase: oversized as a comedic weapon
- Tie: long, flapping, almost like a tail
- Walk cycle bobbing: exaggerated sway communicates weakness

**What to MINIMIZE for corporate enemies:**
- Arms: thin, noodly (no physical strength)
- Chest: flat, no depth (no physical presence)
- Legs: short relative to body (scurrying, insect-like movement)

### 1.6 How Blizzard, Riot, and Supercell Achieve Readable Characters

These studios demonstrate consistent principles:

**Blizzard (Overwatch):**
- Each hero's silhouette is designed to be instantly identifiable, even as a tiny icon.
- Shape language maps to gameplay role: square shapes for tanks, triangles for damage dealers, circles for healers.
- Reaper's jagged cloak means pure aggression. Mercy's soft curves signal care.
- Detail is concentrated at "read points" (head, weapon, distinctive feature) while large areas are left clean.

**Riot (League of Legends):**
- Champions use exaggerated proportions with hybrid forms (human + animal + fantasy) for maximum uniqueness.
- The vastaya race demonstrates hybrid proportions: human frames with animal features pushed beyond realism.
- Every champion reads as a unique silhouette at thumbnail size.

**Supercell (Clash Royale, Brawl Stars):**
- Extremely simplified forms with maximum personality.
- 3-4 head proportions with massive heads and tiny bodies.
- Proof that personality comes from proportion and silhouette, not polygon count.

**Key takeaway for our project:** With primitives-only construction, we are CLOSER to the Supercell/Blizzard stylization approach than to realistic modeling. Lean into bold proportions and clear shape language rather than trying to add fine detail.

### 1.7 The Rule of Thirds in Character Design

Divide the character vertically into three zones:

1. **Top Third (Head + Shoulders):** This is the CHARACTER IDENTITY zone. Helmet, hair, facial features, shoulder armor -- the elements that make the character recognizable. Allocate the most distinctive design elements here.

2. **Middle Third (Torso + Arms):** This is the ACTION zone. Weapons, shields, armor chest plates, belt accessories. This is where the character's ROLE is communicated (warrior vs. mage vs. corporate).

3. **Bottom Third (Legs + Feet):** This is the GROUNDING zone. Least detail needed. Provides stability and movement readability. Keep it simple.

**Practical implication:** Spend 50% of your primitive budget on the top third, 35% on the middle third, and 15% on the bottom third.

---

## 2. Building Complex Characters from Primitives

### 2.1 Available Primitive Geometries and Their Strengths

**Core Primitives and Best Uses:**

| Geometry | Best Used For | Key Parameters |
|---|---|---|
| `CapsuleGeometry` | Torso, limbs, rounded forms | radius, length, capSegments, radialSegments |
| `SphereGeometry` | Heads, shoulders, joints, shield boss | radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength |
| `BoxGeometry` | Suit bodies, briefcases, legs, blocky armor | width, height, depth |
| `CylinderGeometry` | Necks, weapon handles, columns, limbs | radiusTop, radiusBottom, height, radialSegments |
| `ConeGeometry` | Sword tips, helmet spikes, ties, pointed accents | radius, height, radialSegments |
| `TorusGeometry` | Shield rims, belt buckles, bracers, crown rings | radius, tube, radialSegments, tubularSegments, arc |
| `RingGeometry` | Flat decorative circles, halos, ground markers | innerRadius, outerRadius, thetaSegments |
| `PlaneGeometry` | Capes (single-sided), flat decorative elements | width, height |
| `LatheGeometry` | Vases, chalices, custom axe heads, rounded shields | points (Vector2[]), segments, phiStart, phiLength |
| `ExtrudeGeometry` | Custom cross-section shapes, sword blades, shield faces, logos | shape (Shape), extrudeSettings |

### 2.2 SphereGeometry Partial Rendering

SphereGeometry's `phiStart`, `phiLength`, `thetaStart`, `thetaLength` parameters are extremely powerful for creating partial spheres:

- **Half-sphere helmet:** `thetaStart: 0, thetaLength: Math.PI * 0.5` renders only the top half
- **Visor slot:** Two partial spheres with a gap between them
- **Shoulder pauldron:** Quarter-sphere rotated and positioned at shoulder
- **Muscle definition:** Flattened partial spheres layered on top of a base torso capsule

### 2.3 LatheGeometry for Custom Profiles

LatheGeometry takes an array of Vector2 points defining a 2D profile curve and revolves it around the Y-axis. This is ideal for:

- **Battle axe head:** Define a wedge profile, revolve partially (not full 360), creating a double-headed axe
- **Shield face:** Define a convex profile, revolve fully, creating a domed shield
- **Helmet with ridge:** Define a profile with a central ridge bump
- **Chalice/goblet shapes:** For boss enemy throne accessories
- **War horn:** Curved profile revolved to create a horn shape

**Key parameters:**
- `points`: Array of Vector2 defining the profile
- `segments`: Number of segments around the revolution (8-16 sufficient for stylized look)
- `phiStart`: Start angle of revolution (default 0)
- `phiLength`: How far to revolve (default Math.PI * 2 for full revolution)

### 2.4 ExtrudeGeometry for Custom Shapes

ExtrudeGeometry takes a 2D THREE.Shape and extrudes it into 3D. This is the most powerful tool for creating unique weapon and accessory shapes:

**Process:**
1. Create a `THREE.Shape()` object
2. Use `moveTo()`, `lineTo()`, `quadraticCurveTo()`, `bezierCurveTo()` to define the 2D outline
3. Pass to `ExtrudeGeometry` with depth and bevel settings

**Use cases:**
- **Sword blade cross-section:** A diamond/rhombus shape extruded long creates a proper blade
- **Shield face:** A shield-shaped 2D outline extruded with slight depth
- **Crown:** Star-pointed 2D shape extruded with small depth
- **Belt buckle:** Custom logo shape with slight extrusion
- **Armor plate:** Curved 2D plate shape extruded for thickness

**ExtrudeSettings that matter:**
- `depth`: Extrusion distance
- `bevelEnabled`: Whether to bevel edges (true for smoother look)
- `bevelThickness`: How deep the bevel goes
- `bevelSize`: How far bevel extends from outline
- `bevelSegments`: Smoothness of bevel (2-3 usually sufficient)

### 2.5 Constructive Solid Geometry (CSG)

CSG operations (union, subtract, intersect) allow creating complex shapes by combining primitives:

**Recommended library:** `three-bvh-csg` by gkjohnson -- more than 100x faster than BSP-based alternatives.
**React wrapper:** `@react-three/csg` by pmndrs -- declarative JSX syntax.

**Operations:**
- **Union:** Combine two shapes into one (e.g., two boxes into an L-shape)
- **Subtract:** Cut one shape from another (e.g., cut eye holes in a helmet sphere)
- **Intersect:** Keep only where two shapes overlap

**Use cases for characters:**
- Helmet with visor slot: sphere subtract box
- Armor with decorative cutouts
- Complex weapon heads
- Notched sword edges
- Shield with embossed symbol

**Performance note:** CSG should be computed once at character creation time and the resulting geometry cached. Do NOT run CSG operations per-frame.

### 2.6 BufferGeometry with Custom Vertices

For truly organic shapes that no primitive combination achieves, custom BufferGeometry allows defining vertices directly:

- Modify existing primitive vertices by accessing `geometry.attributes.position` and displacing individual vertices
- Add noise to sphere surfaces for rocky/organic textures
- Taper cylinder vertices for more natural limb shapes
- Pinch capsule midpoints for waist definition

**When to use:** Only when primitive combination plus CSG cannot achieve the desired shape. Custom vertices are harder to maintain and iterate on.

### 2.7 Creating the Illusion of Detail with Minimal Polygons

**Layered silhouette technique:**
- Stack 2-3 slightly different-sized primitives at the same position
- Each layer can have different material properties
- Outer layers with transparency/emission create depth illusion
- The current glow outline in RebelWarrior.tsx already uses this technique (BackSide material at 0.35 radius vs 0.3 body radius)

**Strategic polygon allocation:**
- Use higher segment counts (12-16) on character elements that define the silhouette (head, shoulders)
- Use lower segment counts (4-8) on elements that are secondary (legs, feet, inner armor details)
- Use 4-sided cylinders/cones for intentionally blocky/crystalline aesthetic

**Overlapping primitive technique:**
- Multiple small spheres overlapping on shoulders create "muscle mass" impression
- Stacked thin boxes at slight angles create "layered armor" look
- Intersecting torus rings create "chain mail" suggestion at joints

### 2.8 Accessory Design from Primitives

**Great Sword:**
- Handle: CylinderGeometry (radius 0.03, height 0.3) with leather-brown material
- Crossguard: BoxGeometry (0.25 x 0.04 x 0.04) or two flattened cones pointing outward
- Blade: ExtrudeGeometry with diamond cross-section shape, OR BoxGeometry (0.08 x 1.2 x 0.02) for simple version
- Pommel: SphereGeometry (radius 0.04) at base of handle
- Blade tip: ConeGeometry pointing downward
- Enhancement: Add a second blade mesh slightly larger with emissive transparent material for "magic glow"

**Battle Axe:**
- Shaft: CylinderGeometry (radius 0.025, height 0.9)
- Axe head option A: Two ConeGeometry primitives flattened and mirrored
- Axe head option B: LatheGeometry with wedge profile, phiLength of Math.PI (half revolution) for single-edged
- Axe head option C: ExtrudeGeometry with custom axe-head Shape path
- Wrap point: TorusGeometry at shaft/head junction

**Round Shield:**
- Face: SphereGeometry (radius 0.3, thetaLength: Math.PI * 0.5) for domed front
- Rim: TorusGeometry (radius 0.3, tube 0.025)
- Boss (center): SphereGeometry (radius 0.06) protruding from center
- Arm strap (back): Two small BoxGeometry strips

**Viking Helmet:**
- Dome: SphereGeometry (radius 0.22, thetaLength: Math.PI * 0.55) for top portion
- Nose guard: BoxGeometry (0.02 x 0.12 x 0.06) extending down front
- Horns (optional, stylized): ConeGeometry (radius 0.03, height 0.15) at 45-degree angles from sides
- Brow ridge: TorusGeometry (radius 0.22, tube 0.015, arc: Math.PI) positioned at forehead line

**Cape/Cloak:**
- Multiple overlapping PlaneGeometry panels at slight angles
- Animated via vertex displacement or simple rotation on each panel
- Use DoubleSide material
- Tapers from shoulder width to narrower at bottom
- Alternative: series of thin BoxGeometry strips cascading downward with slight sine-wave offset

**Pauldrons (Shoulder Armor):**
- Half-sphere: SphereGeometry with thetaLength: Math.PI * 0.5, radius 0.15
- Positioned at each shoulder, rotated outward
- Add spike: ConeGeometry (small) on top of each pauldron
- Edge trim: TorusGeometry arc at the bottom rim of each pauldron

---

## 3. Materials and Visual Fidelity

### 3.1 Material Selection Strategy

**Performance hierarchy (fastest to slowest):**
MeshBasicMaterial > MeshLambertMaterial > MeshPhongMaterial > MeshToonMaterial > MeshStandardMaterial > MeshPhysicalMaterial

**Recommendation for our game:**

- **Primary character bodies:** `MeshStandardMaterial` -- best balance of visual quality and performance. Supports metalness/roughness workflow which is essential for armor vs skin vs cloth differentiation.
- **Glow/aura effects:** `MeshStandardMaterial` with emissive properties + BackSide rendering (already used in current implementation).
- **Special boss effects:** `MeshPhysicalMaterial` ONLY for boss characters, using clearcoat for polished armor sheen. Limit to 1-2 meshes per boss.
- **Toon/stylized option:** `MeshToonMaterial` with custom gradient map for a cell-shaded look. Creates a cohesive stylized aesthetic that forgives the primitive geometry. Consider this as an alternative art direction.

### 3.2 Metalness/Roughness Recipes

These specific combinations create premium-looking surfaces:

| Surface Type | Metalness | Roughness | Color | Visual Effect |
|---|---|---|---|---|
| Polished Steel Armor | 0.9 | 0.15-0.2 | #c0c0c0 | Mirror-like, reflective |
| Worn Bronze Armor | 0.7 | 0.4-0.5 | #b8860b | Warm, aged metal |
| Gold Trim | 0.85 | 0.2-0.3 | #ffd700 | Rich, royal gleam |
| Dark Iron | 0.8 | 0.6 | #333333 | Matte, menacing |
| Leather | 0.1 | 0.7-0.8 | #8b4513 | Soft, organic |
| Skin | 0.05-0.1 | 0.6-0.7 | #d4a574 | Subsurface feel |
| Cloth/Fabric | 0.0 | 0.9-1.0 | varies | Completely matte |
| Corporate Suit | 0.2-0.3 | 0.5-0.6 | #333-#555 | Slight sheen, slick |
| Glowing Crystal | 0.3 | 0.1 | via emissive | Translucent glow |
| Corporate Tie (silk) | 0.4 | 0.3 | #ff0040 | Sleek, attention-grabbing |

### 3.3 Emissive Materials for Glowing Effects

Emissive materials are the primary tool for making characters "pop" in a dark battle arena. The current implementation uses emissive sparingly. Recommendations for enhancement:

**Eyes (both hero and villain):**
- Hero eyes: emissive #00d4ff (cyan) at intensity 0.8-1.2 -- these should be bright enough to glow visibly
- Villain eyes: emissive #ff0000 (red) at intensity 0.6-0.8 -- already present, intensity could increase
- Boss eyes: emissive #ff6600 (orange-red) at intensity 1.5 -- notably brighter, signals danger level

**Weapons:**
- Sword blade edge: emissive #00d4ff at intensity 0.3-0.5 with slight pulsation (sine wave on emissiveIntensity over time)
- Axe head rune marks: multiple small mesh strips with high emissive
- Briefcase (corporate): subtle emissive #ff0040 at intensity 0.1 -- evil paperwork energy

**Auras:**
- Hero aura: BackSide mesh at 1.05-1.1x body scale, emissive #00d4ff / #ffd700, opacity 0.08-0.15
- Villain aura: BackSide mesh at 1.1x body scale, emissive #ff0040, opacity 0.06-0.1
- Boss aura: DOUBLE layer -- inner aura + outer aura, different colors, different pulse rates

**Power-up states:**
- Increase emissiveIntensity across all materials by 2-3x
- Add a pulsing frequency (0.5-1Hz sine wave)
- Expand aura scale by 1.2-1.5x

### 3.4 Toon Shading with MeshToonMaterial

MeshToonMaterial creates a cell-shaded look using a gradient map (an X-by-1 texture):

**Default behavior:** Two-tone shading (70% brightness for shadows, 100% for lit areas).

**Custom gradient maps via CanvasTexture:**
- Create a small canvas (4x1 or 8x1 pixels)
- Paint discrete color bands to control shadow/midtone/highlight transitions
- 3-tone: dark shadow band, midtone band, bright highlight band
- Wrap with `THREE.CanvasTexture` and set `minFilter = THREE.NearestFilter`, `magFilter = THREE.NearestFilter`

**Why consider toon shading for this project:**
- Primitives-based characters inherently lack the surface detail that PBR materials are designed to enhance
- Toon shading EMBRACES simplicity and makes flat surfaces look intentional
- Creates a cohesive, stylized art direction that elevates the "indie game" feel
- Easier to achieve visual consistency across hero, villain, and environment
- Performance benefit over MeshStandardMaterial

### 3.5 Fresnel / Rim Lighting Effects

Fresnel (rim lighting) creates an illuminated edge around characters, making them visually separate from the background. This is crucial in dark arena environments.

**Implementation approaches:**

**A) Dedicated Fresnel shader material (otanodesignco/Fresnel-Shader-Material):**
- Controls: intensity, power, bias
- Can be used for transparency masking (rim-only visibility) to create energy-shield effects
- Best for: aura effects, character selection highlights, power-up states

**B) Shader parameter approach for halo effect:**
- Parameters: c = 0.6, p = 6, side = THREE.BackSide
- Creates a halo/aura around objects
- Best for: character glow outlines (replaces or enhances current BackSide approach)

**C) Scene lighting approach:**
- Position point lights behind/beside characters
- The current BattleLighting already has rim lights (red from edges)
- Enhancement: add per-character rim lights that move with the character group

### 3.6 Color Theory for Heroes vs Villains

**Hero Color Palette (Rebel Barbarians):**
- Primary (60%): Deep gold / dark bronze (#b8860b to #8b6914) -- warmth, nobility, earned glory
- Secondary (30%): Warm skin tones (#d4a574) and leather browns (#8b4513) -- organic, human, relatable
- Accent (10%): Cyan energy (#00d4ff) -- technology/magic distinction, high contrast against warm base
- Emissive accent: Gold (#ffd700) or Cyan (#00d4ff) for weapon/eye glow

**Villain Color Palette (Corporate Enemies):**
- Primary (60%): Corporate greys (#333333 to #555555) -- cold, institutional, lifeless
- Secondary (30%): Pale skin (#e0c8a8) and dark suit (#222222) -- vampiric, office-drone
- Accent (10%): Aggressive red (#ff0040) -- danger, greed, anger (tie, eyes, aura)
- Emissive accent: Red (#ff0000) for eyes, subtle red glow

**Boss Villain Color Palette:**
- Primary (60%): Near-black suit (#1a1a1a) with slight purple undertone -- wealth, corruption
- Secondary (30%): Gold accessories (#ffd700) -- stolen wealth, corporate excess
- Accent (10%): Deep purple (#7b2ff7) -- power, corruption, royalty
- Emissive accent: Orange-red (#ff6600) eyes, purple aura

**The 60-30-10 Rule:** Roughly 60% of the character surface should be the dominant color, 30% the secondary, and 10% the accent. The accent draws the eye to the most important features.

### 3.7 Procedural Textures via CanvasTexture

CanvasTexture allows generating textures from code, providing detail without image files:

**Process:**
1. Create an offscreen canvas element
2. Use Canvas 2D API to draw patterns, gradients, noise
3. Wrap with `new THREE.CanvasTexture(canvas)`
4. Apply to material's `map`, `normalMap`, or other texture slots
5. Set `texture.needsUpdate = true` if modified at runtime

**Useful procedural texture recipes:**

**Metal surface grain:**
- Draw random noise pixels at very low contrast on a small canvas (64x64)
- Apply as `roughnessMap` to metal materials
- Creates micro-surface variation that breaks up the "plastic" look

**Leather texture:**
- Draw small, slightly irregular dark dots/lines on brown background
- Apply as `map` to leather materials (belts, handles, armor straps)

**Grid/tech pattern (ground):**
- Already implemented in BattleScene.tsx's BattleGround component
- This technique can extend to armor plates, shield faces, etc.

**Gradient ramp for toon shading:**
- Small canvas (4x1 or 8x1)
- Draw discrete color bands
- Apply as gradientMap to MeshToonMaterial

### 3.8 Code-Generated Normal Maps

Normal maps fake surface detail by perturbing how light interacts with a flat surface. Creating them procedurally:

**Process:**
1. Create a canvas (64x64 or 128x128 is sufficient for small detail)
2. For each pixel, compute a surface normal direction
3. Encode as RGB where R = X normal, G = Y normal, B = Z normal
4. Flat surface = RGB(128, 128, 255) -- neutral blue
5. Bumps = deviation from neutral blue in R and G channels
6. Wrap as CanvasTexture, assign to material.normalMap
7. Control intensity with material.normalScale (Vector2)

**Useful normal map effects:**
- Hammered metal: random small bumps across surface
- Scales/chain mail: regular repeating bump pattern
- Muscle definition: smooth gradients suggesting underlying anatomy
- Wood grain: parallel curved lines

**Performance note:** Normal maps are computed once and stored as textures. They add visual detail at zero geometry cost. Even a rough, hand-coded normal map dramatically improves the perceived quality of a flat primitive surface.

---

## 4. Character Hierarchy and Rigging Without Bones

### 4.1 Group-Based Articulation Architecture

The current implementation already uses THREE.Group for body part organization. The key to convincing movement is getting the HIERARCHY right:

**Correct hierarchy (parent > child):**

```
Character Root (Group)
  +-- Body Core (Group) -- pivot at hip center
  |     +-- Torso (Mesh)
  |     +-- Upper Body (Group) -- pivot at spine/chest
  |     |     +-- Chest Armor (Mesh)
  |     |     +-- Neck (Group) -- pivot at neck base
  |     |     |     +-- Head (Mesh)
  |     |     |     +-- Helmet (Mesh)
  |     |     |     +-- Eyes (Mesh)
  |     |     +-- Left Shoulder (Group) -- pivot at shoulder joint
  |     |     |     +-- Pauldron (Mesh)
  |     |     |     +-- Upper Arm (Mesh)
  |     |     |     +-- Elbow (Group) -- pivot at elbow
  |     |     |           +-- Forearm (Mesh)
  |     |     |           +-- Hand (Group) -- pivot at wrist
  |     |     |                 +-- Hand Mesh
  |     |     |                 +-- Weapon (Group)
  |     |     +-- Right Shoulder (Group)
  |     |           +-- [mirror of left]
  |     |           +-- Shield (Group)
  |     +-- Hip (Group) -- pivot at hip joint
  |           +-- Left Leg (Group) -- pivot at hip socket
  |           |     +-- Upper Leg (Mesh)
  |           |     +-- Knee (Group) -- pivot at knee
  |           |           +-- Lower Leg (Mesh)
  |           |           +-- Foot (Mesh)
  |           +-- Right Leg (Group)
  |                 +-- [mirror of left]
  +-- Cape/Back Accessories (Group) -- separate from body rotation
  +-- Aura Effects (Group) -- world-space effects
```

### 4.2 Pivot Point Placement

The single most important factor for natural-looking joint movement is WHERE the pivot point (the Group's position) is placed:

**Shoulder joint pivot:** Position the shoulder Group at the TOP of the arm, at the point where the arm connects to the torso. When you rotate this group, the entire arm swings from the shoulder socket.

**Current issue in RebelWarrior.tsx:** The sword arm group is positioned at `[swordSide * 0.45, 1.2, 0]` which is approximately correct, but the arm meshes inside are offset with `position={[0, -0.2, 0]}`. The pivot IS at the shoulder, which is correct.

**Elbow joint pivot:** Add an intermediate Group between upper arm and forearm. Position it at the bottom of the upper arm mesh. The forearm and hand are children of this elbow group.

**Wrist/Hand pivot:** Another Group at the bottom of the forearm. The weapon is a child of the hand group.

**Hip joint pivot:** Position at the top of the leg, where it connects to the pelvis.

**Knee joint pivot:** Position at the bottom of the upper leg.

**Key rule:** The Group's position property defines the rotation pivot. All child meshes are offset RELATIVE to this pivot. When the Group rotates, everything inside rotates around the Group's position.

### 4.3 Procedural Walk Cycle Using Sine/Cosine

A convincing walk cycle can be built entirely from sine/cosine functions applied to the joint hierarchy:

**Phase-based animation system:**

The core insight is that walking is a CYCLIC motion. Every joint in the body follows a sinusoidal pattern, but each joint is at a different PHASE offset:

**Walk cycle parameters:**
- `walkSpeed`: controls frequency (typically 4-8 for gameplay-readable speed)
- `t`: elapsed time from clock
- `phase = t * walkSpeed`

**Joint rotations for walk:**

| Joint | Axis | Formula | Notes |
|---|---|---|---|
| Left Hip | X | `sin(phase) * 0.4` | Forward/back leg swing |
| Right Hip | X | `sin(phase + PI) * 0.4` | Opposite phase to left |
| Left Knee | X | `max(0, sin(phase + 0.5) * 0.5)` | Only bends backward, never forward |
| Right Knee | X | `max(0, sin(phase + PI + 0.5) * 0.5)` | Opposite phase |
| Left Shoulder | X | `sin(phase + PI) * 0.3` | Arms swing OPPOSITE to legs |
| Right Shoulder | X | `sin(phase) * 0.3` | Opposite to left arm |
| Body Y position | Y | `abs(sin(phase * 2)) * 0.05` | Bounce at double frequency (two steps per cycle) |
| Body Z rotation | Z | `sin(phase) * 0.03` | Slight side-to-side sway |
| Body Y rotation | Y | `sin(phase) * 0.02` | Slight twist |

**The `max(0, ...)` trick for knees:** Knees only bend backward. Clamping the sine wave to positive values ensures the knee never extends forward past straight.

### 4.4 Upper Body / Lower Body Independence

For a battle game, the upper body must be able to fight while the lower body walks or stands idle. Achieve this by separating the hierarchy at the torso:

- Lower body (hips, legs): driven by movement/walk cycle
- Upper body (chest, arms, head): driven by combat state

The Body Core group can rotate independently from the Upper Body group, allowing:
- Walking toward an enemy while swinging a sword at a different angle
- Idle legs while the upper body performs an attack combo
- Looking/facing direction independent of movement direction

### 4.5 IK-Like Effects Using Trigonometry

For special cases like a character planting feet on uneven terrain or reaching for a specific target:

**Two-joint IK (shoulder-elbow-hand):**
Given a target position for the hand, compute the elbow angle using the law of cosines:
- `d = distance from shoulder to target`
- `L1 = upper arm length`
- `L2 = forearm length`
- `elbowAngle = acos((L1^2 + L2^2 - d^2) / (2 * L1 * L2))`
- `shoulderAngle = acos((L1^2 + d^2 - L2^2) / (2 * L1 * d)) + atan2(target.y, target.x)`

This allows a sword arm to point at specific enemy positions during attack animations, making combat feel responsive.

### 4.6 Fighting Animation Patterns

**Sword swing combo (3 hit):**
1. Wind-up: shoulder rotates backward (rotation.x = -1.2) over 0.15s
2. Strike 1: fast forward swing (rotation.x from -1.2 to 0.8) over 0.1s
3. Brief hold: 0.05s
4. Cross slash: shoulder rotates + body rotates (rotation.z swing) over 0.12s
5. Overhead: shoulder up then down (rotation.x from -0.5 to 1.0) over 0.15s
6. Recovery: return to idle over 0.2s

**Shield block:**
- Shield arm rotation.x rapidly goes to -0.8 (raised position)
- Shield arm rotation.z angles outward slightly
- Body tilts slightly away from attacker
- Hold for 0.3s then return

**Impact recoil:**
- Entire character group scales to 0.95 on hit frame
- Returns to 1.0 over 0.15s (elastic ease)
- Combined with flash-white material swap (0.05s)

---

## 5. Visual Effects That Sell Characters

### 5.1 Outline / Glow Using BackSide Mesh Technique

The current implementation already uses this technique. It can be enhanced:

**The technique:**
1. Duplicate the character mesh (or use a slightly larger version)
2. Set `side: THREE.BackSide` on its material
3. Set the material to transparent with emissive color
4. The backside-rendered mesh is only visible where it extends beyond the front-face mesh, creating an outline/glow

**Enhancements:**
- Use a SLIGHTLY different shape for the outline mesh (e.g., if body is CapsuleGeometry, outline could be SphereGeometry stretched vertically) to create non-uniform outline width
- Pulse the outline opacity and scale with a sine wave for a "breathing" energy effect
- Change outline color based on character state (blue = healthy, yellow = damaged, red = critical)
- Layer MULTIPLE outline meshes at different scales for a multi-ring aura (boss characters)

**Drei's `<Outlines>` component:**
- Built into @react-three/drei (already in dependencies)
- Extracts geometry from parent mesh automatically and creates inverted-hull outline
- Props: `thickness`, `color`, `opacity`, `transparent`, `angle`
- Works with `<mesh>`, `<skinnedMesh>`, and `<instancedMesh>`
- Simpler to use than manual BackSide technique and handles edge cases better
- Recommended for clean character selection highlights

### 5.2 Particle Trails Behind Weapons

When a sword or axe swings, particles trailing behind the weapon arc communicate speed and power:

**Implementation approach:**
- Store the last N positions (10-20) of the weapon tip in a circular buffer
- Each frame, update the buffer with the current weapon tip world position
- Render using Points (PointsMaterial) or InstancedMesh for lit particles
- Each particle fades out (opacity or scale approaching zero) based on age
- Color: match weapon emissive color (cyan for hero sword, red for boss weapon)

**Performance budget:** 10-20 particles per weapon, using Points with PointsMaterial (single draw call). Size attenuation ON so particles appear smaller at distance.

**Alternative: Trail mesh:**
- Build a ribbon/trail geometry from the position buffer
- Creates a smooth, swooping arc rather than discrete particles
- More visually impressive but more complex to implement
- Use a custom PlaneGeometry that updates vertex positions each frame

### 5.3 Ground Impact Effects

When an enemy is defeated or a heavy attack lands:

**Dust ring:**
- Spawn 8-12 particles in a ring pattern at the impact point
- Each particle moves outward radially and upward slightly
- Gravity pulls them down: `y = initialVelocity * t - 0.5 * g * t^2`
- Fade out over 0.5-1.0 seconds
- Use BoxGeometry particles (current implementation) or SphereGeometry for dust puffs
- Color: match ground color with slight warmth (#443322)

**Shockwave ring:**
- A TorusGeometry or RingGeometry at ground level
- Rapidly scales outward (from radius 0 to radius 2-3 over 0.3s)
- Simultaneously fades opacity from 0.5 to 0
- Emissive material matching attack color
- Very low-cost, single mesh, high visual impact

**Screen shake (implemented in game logic, not 3D):**
- On major impacts, apply small random offsets to camera position
- Amplitude: 0.05-0.15 units
- Duration: 0.2-0.4 seconds
- Decay: exponential falloff
- Can also be achieved by shaking the root character group slightly

### 5.4 Character Auras and Energy Effects

**Ambient aura (always-on character glow):**
- Already implemented via BackSide material
- Enhancement: make it PULSE with breathing animation
- Pulse rate: 0.5-1.0 Hz (slow, meditative for idle; faster 2-3 Hz during combat)
- Pulse range: opacity 0.05 to 0.15

**Power-up aura (temporary state):**
- Additional concentric aura layers (2-3 nested BackSide meshes)
- Each layer at different scale, color, and pulse rate
- Particle ring orbiting the character at waist height
- Implementation: 4-8 small SphereGeometry meshes arranged in a circle, rotating as a group
- The particle ring radius and speed increase during power-up state

**Energy pillar (dramatic moment):**
- Vertical CylinderGeometry (very thin, tall) with emissive material
- Scales up from 0 height to full height rapidly
- Fades out over 0.5-1.0 seconds
- Used for: character spawning, level-up, boss entrance

### 5.5 Damage Feedback

**Flash white technique:**
1. On hit, swap ALL character materials to a pure white emissive material
2. Hold for 1-2 frames (0.03-0.06 seconds)
3. Swap back to original materials
4. Implementation: keep a ref to all original materials, swap temporarily

**Scale pulse:**
1. On hit, set character scale to 1.1-1.15 (brief expansion)
2. Immediately lerp back to 1.0 over 0.15 seconds
3. Creates a "thud" feeling
4. Alternative: scale DOWN to 0.9 then back up (compression on impact)

**Hit particles:**
- 5-8 small meshes spawned at hit location
- Move outward randomly with slight upward bias
- Color: red for damage, gold for critical hit
- Fade and shrink over 0.3-0.5 seconds
- The current DeathParticles in CorporateEnemy.tsx demonstrates this pattern

**Color flash:**
- Briefly tint the character's materials toward red (damaged) or gold (buffed)
- Lerp material.color from original toward tint color and back over 0.2 seconds
- Less jarring than full white flash, good for minor hits

### 5.6 Shadow and Lighting Tricks

**Character-specific key lights:**
- Add a PointLight as a child of each hero character group
- Position slightly above and behind (0, 2, -1)
- Low intensity (5-10), warm color (#ffd700)
- Moves WITH the character, ensuring they are always well-lit
- Creates a "chosen one" effect -- heroes are always illuminated

**Villain under-lighting:**
- Add a subtle red PointLight BELOW each villain group
- Position at (0, -0.5, 0)
- Very low intensity (2-5), red color (#ff0040)
- Creates sinister under-lighting on their faces/bodies

**Ground shadow circle:**
- A RingGeometry or CircleGeometry flat on the ground beneath each character
- Dark, semi-transparent material
- Scales with character height (taller = larger shadow)
- Cheaper than real-time shadow maps, guaranteed visible
- The circle can pulse slightly for a "hovering" effect

**Contact shadow using drei:**
- @react-three/drei provides a `<ContactShadows>` component
- Creates soft, diffuse shadows without needing shadow maps on every light
- Lower performance cost than multiple shadow-casting lights
- Good for grounding characters on the arena floor

### 5.7 Billboard Sprites for Effects

For effects like sparks, impact stars, floating damage numbers:

**Sprite approach:**
- THREE.Sprite with SpriteMaterial
- Always faces camera automatically
- Good for small numbers of effects (under 100)
- Each sprite is a separate draw call

**Points approach (recommended for many particles):**
- THREE.Points with PointsMaterial
- Single draw call for ALL particles
- Set sizeAttenuation: true for distance-based scaling
- Use CanvasTexture for particle shapes (circle, star, diamond)
- Good for: dust, sparks, rain, ambient particles (hundreds-thousands)

**InstancedMesh approach (recommended for lit particles):**
- Single draw call, supports lighting and materials
- Each instance can have unique position, rotation, scale, color
- Good for: debris chunks, coins, collectibles (tens to hundreds)
- Use a dummy Object3D to calculate matrices: `dummy.position.set(x,y,z); dummy.updateMatrix(); instancedMesh.setMatrixAt(i, dummy.matrix)`

---

## 6. Specific Design Recipes

### 6.A Buff Rebel Barbarian Hero

**Overall Proportions:**
- Total height: 2.2 units (from feet to helmet top)
- Head height (unit): ~0.25 units (so character is ~8.5 "heads" tall)
- Shoulder span: 0.9-1.0 units (3.5-4 head-widths, VERY broad)
- Waist width: 0.5 units (2 head-widths -- strong V-taper)
- Stance width (feet): 0.3-0.35 units apart

**Body Part Specifications:**

| Part | Geometry | Size/Args | Position (relative to root) | Material |
|---|---|---|---|---|
| **Torso** | CapsuleGeometry | radius: 0.25, length: 0.7 | [0, 0.85, 0] | Bronze armor: color #b8860b, metalness 0.7, roughness 0.4 |
| **Upper Chest** | SphereGeometry | radius: 0.28, widthSeg: 12, heightSeg: 8, thetaLength: PI*0.6 | [0, 1.15, 0] | Same bronze armor -- creates barrel chest effect |
| **Waist** | CylinderGeometry | radiusTop: 0.22, radiusBottom: 0.18, height: 0.2 | [0, 0.55, 0] | Leather: color #5a3a1a, metalness 0.1, roughness 0.8 |
| **Belt** | TorusGeometry | radius: 0.2, tube: 0.03, radialSeg: 8, tubularSeg: 16 | [0, 0.55, 0] | Gold: color #ffd700, metalness 0.85, roughness 0.25 |
| **Head** | SphereGeometry | radius: 0.18, widthSeg: 12, heightSeg: 12 | [0, 1.58, 0] | Skin: color #d4a574, metalness 0.05, roughness 0.65 |
| **Helmet Dome** | SphereGeometry | radius: 0.2, thetaLength: PI*0.55 | [0, 1.65, 0] | Bronze armor (same as torso) |
| **Helmet Nose Guard** | BoxGeometry | 0.025 x 0.1 x 0.04 | [0, 1.55, 0.18] | Bronze armor |
| **Eyes (2x)** | SphereGeometry | radius: 0.025 | [+/-0.06, 1.6, 0.15] | Emissive cyan: color #00d4ff, emissive #00d4ff, emissiveIntensity 1.0 |
| **Neck** | CylinderGeometry | radiusTop: 0.1, radiusBottom: 0.12, height: 0.08 | [0, 1.42, 0] | Skin |
| **Left Pauldron** | SphereGeometry (half) | radius: 0.15, thetaLength: PI*0.5 | [-0.42, 1.35, 0] rotated | Bronze armor |
| **Right Pauldron** | SphereGeometry (half) | radius: 0.15, thetaLength: PI*0.5 | [0.42, 1.35, 0] rotated | Bronze armor |
| **Pauldron Spikes (2x)** | ConeGeometry | radius: 0.03, height: 0.1 | atop each pauldron | Bronze armor |
| **Upper Arms (2x)** | CapsuleGeometry | radius: 0.07, length: 0.25 | [+/-0.45, 1.1, 0] | Skin |
| **Forearms (2x)** | CapsuleGeometry | radius: 0.065, length: 0.22 | [0, -0.3, 0] relative to upper arm | Skin with leather bracer overlay |
| **Bracer Wraps (2x)** | CylinderGeometry | radiusTop: 0.075, radiusBottom: 0.075, height: 0.12 | around forearm position | Leather: color #5a3a1a |
| **Hands (2x)** | SphereGeometry | radius: 0.05 | [0, -0.45, 0] relative to upper arm | Skin |
| **Upper Legs (2x)** | CapsuleGeometry | radius: 0.09, length: 0.3 | [+/-0.12, 0.25, 0] | Leather/cloth: color #4a2a10 |
| **Lower Legs (2x)** | CapsuleGeometry | radius: 0.07, length: 0.28 | below knee joint | Leather boots: color #3a1a08, metalness 0.15 |
| **Feet/Boots (2x)** | BoxGeometry | 0.1 x 0.06 x 0.14 | [+/-0.12, -0.08, 0.02] | Dark leather |

**Great Sword Specifications:**

| Part | Geometry | Size/Args | Position (relative to hand) | Material |
|---|---|---|---|---|
| Pommel | SphereGeometry | radius: 0.04 | [0, 0.15, 0] | Gold |
| Handle (grip) | CylinderGeometry | radiusTop: 0.025, radiusBottom: 0.03, height: 0.3 | [0, 0, 0] | Leather brown: #5a3a1a |
| Crossguard | BoxGeometry | 0.22 x 0.035 x 0.035 | [0, -0.15, 0] | Gold |
| Crossguard Tips (2x) | SphereGeometry | radius: 0.02 | [+/-0.11, -0.15, 0] | Gold |
| Blade | BoxGeometry | 0.06 x 1.0 x 0.015 | [0, -0.7, 0] | Polished steel: color #d0d0e0, metalness 0.95, roughness 0.1 |
| Blade Glow | BoxGeometry | 0.07 x 1.02 x 0.02 | [0, -0.7, 0] | Emissive cyan: emissive #00d4ff, emissiveIntensity 0.3, transparent, opacity 0.15, side: BackSide |
| Blade Tip | ConeGeometry | radius: 0.03, height: 0.1 | [0, -1.25, 0] | Polished steel |
| Blade Edge Lines (2x) | BoxGeometry | 0.005 x 0.95 x 0.005 | [+/-0.03, -0.7, 0.008] | Emissive cyan at 0.5 intensity |

**Shield Specifications:**

| Part | Geometry | Size/Args | Position (relative to hand) | Material |
|---|---|---|---|---|
| Shield Face | SphereGeometry (half) | radius: 0.25, thetaLength: PI*0.5 | [0, 0, 0.05] rotation: facing forward | Bronze armor |
| Shield Rim | TorusGeometry | radius: 0.25, tube: 0.02, arc: PI*2 | [0, 0, 0] | Gold |
| Shield Boss | SphereGeometry | radius: 0.06 | [0, 0, 0.08] | Gold |
| Shield Emblem | Small BoxGeometry cross or star shape | varies | center of shield face | Emissive cyan |

**Cape (Back Accessory):**
- 3-4 overlapping PlaneGeometry panels
- Widths: 0.6 (top), 0.5 (middle), 0.4 (bottom)
- Heights: 0.3 each, stacked vertically
- Material: color #8b1a1a (deep crimson), DoubleSide, roughness 0.95
- Animation: each panel rotates on X axis with sine wave, cascading phase offset (creates flowing motion)

**Aura:**
- Inner glow: CapsuleGeometry slightly larger than body, BackSide, emissive #00d4ff, opacity 0.1, pulsing
- Outer glow: CapsuleGeometry 1.15x body size, BackSide, emissive #ffd700, opacity 0.05, slower pulse

**What Makes Them Look HEROIC and POWERFUL:**
1. The V-taper from massively broad shoulders to narrow waist is the #1 heroic signal
2. Thick limbs with visible bulk (capsule geometry radius 0.07-0.09 for arms/legs vs current 0.05)
3. Warm gold/bronze/amber color palette communicates nobility and earned glory
4. Cyan emissive accents provide technological/magical edge contrast
5. The helmet and pauldrons add to the upper-body silhouette mass
6. The cape creates a dramatic trailing shape that extends the character's visual footprint
7. The great sword is nearly as tall as the character, communicating overwhelming strength
8. Dual glow layers (cyan + gold) create a rich, multi-color aura

### 6.B Corporate Enemy (Standard Unit)

**Overall Proportions:**
- Total height: 1.1-1.2 units (roughly half the hero height)
- Head height (unit): ~0.18 units (so character is ~6 "heads" tall)
- Shoulder span: 0.35 units (narrow, sloped)
- Body width: 0.3 units at torso (boxy, no V-taper)
- They should look like SWARMING PESTS compared to the heroes

**Body Part Specifications:**

| Part | Geometry | Size/Args | Position (relative to root) | Material |
|---|---|---|---|---|
| **Body/Suit** | BoxGeometry | 0.28 x 0.5 x 0.18 | [0, 0.45, 0] | Dark grey suit: color #444444, metalness 0.25, roughness 0.55 |
| **Head** | SphereGeometry | radius: 0.14, widthSeg: 10, heightSeg: 10 | [0, 0.88, 0] | Pale skin: color #e8d5b8, roughness 0.8 |
| **Hair/Combover** | BoxGeometry | 0.12 x 0.03 x 0.14 | [0.02, 0.98, -0.02] rotation: slight tilt | Black: color #1a1a1a |
| **Evil Eyes (2x)** | SphereGeometry | radius: 0.022 | [+/-0.045, 0.9, 0.12] | Emissive red: color #ff0000, emissive #ff0000, emissiveIntensity 0.7 |
| **Frown/Mouth** | BoxGeometry | 0.06 x 0.01 x 0.01 | [0, 0.82, 0.13] | Dark: color #333333 |
| **Collar** | BoxGeometry | 0.25 x 0.04 x 0.16 | [0, 0.72, 0] | White: color #f0f0f0, roughness 0.9 |
| **Tie Knot** | SphereGeometry | radius: 0.02 | [0, 0.7, 0.1] | Red: color #cc0030, emissive #ff0040, emissiveIntensity 0.3 |
| **Tie Body** | ConeGeometry | radius: 0.025, height: 0.22 | [0, 0.55, 0.1] rotation: [PI, 0, 0] | Red: same as knot |
| **Left Arm** | BoxGeometry | 0.07 x 0.38 x 0.07 | [0.2, 0.42, 0] | Dark suit |
| **Right Arm** | BoxGeometry | 0.07 x 0.38 x 0.07 | [-0.2, 0.42, 0] | Dark suit |
| **Briefcase** | BoxGeometry | 0.18 x 0.13 x 0.04 | [-0.2, 0.15, 0.04] | Dark brown: color #2a1808, metalness 0.4, roughness 0.45 |
| **Briefcase Handle** | TorusGeometry | radius: 0.035, tube: 0.008, arc: PI | [-0.2, 0.24, 0.04] | Dark brown |
| **Briefcase Clasps (2x)** | BoxGeometry | 0.02 x 0.01 x 0.01 | on briefcase front | Gold: color #b8860b |
| **Legs (2x)** | BoxGeometry | 0.09 x 0.28 x 0.09 | [+/-0.07, 0.06, 0] | Slightly darker suit: color #333333 |
| **Shoes (2x)** | BoxGeometry | 0.09 x 0.04 x 0.13 | [+/-0.07, -0.08, 0.02] | Black: color #111111, metalness 0.3, roughness 0.4 |

**Red Aura:**
- BoxGeometry slightly larger than body, BackSide, emissive #ff0040, opacity 0.06-0.1
- Subtle, sickly glow compared to hero's powerful aura

**What Makes Them Look MENACING but COMEDIC:**
1. Boxy proportions with NO curves -- everything is BoxGeometry. They are LITERALLY square.
2. Head is proportionally too large for body (6-head tall with large head = corporate drone look)
3. Red glowing eyes are the single menacing element on an otherwise mundane design
4. The tie is a long dangling accent that flaps during movement (comedic)
5. The briefcase-as-weapon is inherently absurd
6. Narrow sloped shoulders communicate physical weakness
7. Their short stature compared to heroes makes them look like swarm pests
8. Walk wobble animation (already present) adds to the comedy
9. Corporate grey color palette is deliberately BORING compared to the heroes' warm golds

**What Makes Them Look GREEDY and SWARMING:**
1. Red eyes + red tie = greed/anger color coding
2. Death-grip on oversized briefcase = attachment to money/power
3. Short legs with fast movement speed = scurrying, insect-like
4. Multiple enemies spawning in waves = horde/infestation feeling
5. Speech bubbles with corporate jargon reinforce the satire

### 6.C Boss Enemy (Large Corporate Villain)

**Overall Proportions:**
- Total height: 2.5-3.0 units (LARGER than the heroes)
- Head height (unit): ~0.3 units (so character is ~8-9 "heads" tall)
- Shoulder span: 1.0-1.2 units (as wide as the heroes, but THICKER)
- Body width: 0.8-1.0 units (massive rectangular frame -- no V-taper, just a WALL of suit)
- They are the heroes' size or larger, with corporate proportions SCALED UP

**Body Part Specifications:**

| Part | Geometry | Size/Args | Position (relative to root) | Material |
|---|---|---|---|---|
| **Body/Suit** | BoxGeometry | 0.7 x 1.0 x 0.5 | [0, 0.9, 0] | Near-black suit: color #1a1a2a (slight purple tint), metalness 0.3, roughness 0.45 |
| **Head** | SphereGeometry | radius: 0.22 | [0, 1.7, 0] | Pale: color #d8c8a8, roughness 0.75 |
| **Crown/Top Hat** | CylinderGeometry | radiusTop: 0.18, radiusBottom: 0.2, height: 0.25 | [0, 1.95, 0] | Black with gold trim: color #111111 |
| **Crown Brim** | CylinderGeometry | radiusTop: 0.28, radiusBottom: 0.28, height: 0.03 | [0, 1.82, 0] | Black |
| **Crown Gold Band** | TorusGeometry | radius: 0.2, tube: 0.015 | [0, 1.88, 0] | Gold: color #ffd700, metalness 0.9, roughness 0.2 |
| **Crown Spikes (4-6)** | ConeGeometry | radius: 0.02, height: 0.08 | evenly around crown | Gold, emissive #ffd700, emissiveIntensity 0.3 |
| **Evil Eyes (2x)** | SphereGeometry | radius: 0.035 | [+/-0.07, 1.72, 0.18] | Orange-red emissive: emissive #ff6600, emissiveIntensity 1.5 |
| **Evil Grin** | TorusGeometry | radius: 0.08, tube: 0.01, arc: PI | [0, 1.62, 0.18] rotation: upside down | Red: color #cc0000, emissive #ff0000, emissiveIntensity 0.3 |
| **Collar** | BoxGeometry | 0.6 x 0.08 x 0.4 | [0, 1.42, 0] | White |
| **Power Tie** | ConeGeometry | radius: 0.05, height: 0.5 | [0, 1.1, 0.26] rotation: [PI, 0, 0] | Deep red: color #990020, emissive #ff0040, emissiveIntensity 0.4 |
| **Tie Pin** | SphereGeometry | radius: 0.02 | [0, 1.2, 0.28] | Gold, highly emissive |
| **Left Arm** | CapsuleGeometry | radius: 0.1, length: 0.5 | [0.45, 1.1, 0] | Dark suit |
| **Right Arm** | CapsuleGeometry | radius: 0.1, length: 0.5 | [-0.45, 1.1, 0] | Dark suit |
| **Left Hand** | SphereGeometry | radius: 0.07 | end of left arm chain | Pale skin with gold ring (tiny torus) |
| **Right Hand** | SphereGeometry | radius: 0.07 | end of right arm chain | Same |
| **Mega Briefcase** | BoxGeometry | 0.4 x 0.3 x 0.08 | right hand position | Premium leather: color #1a0a00, metalness 0.5, roughness 0.35 |
| **Briefcase Gold Clasps (3x)** | BoxGeometry | 0.03 x 0.015 x 0.015 | spaced on briefcase front | Gold |
| **Legs (2x)** | BoxGeometry | 0.18 x 0.55 x 0.18 | [+/-0.15, 0.1, 0] | Dark suit |
| **Shoes (2x)** | BoxGeometry | 0.18 x 0.08 x 0.25 | [+/-0.15, -0.2, 0.03] | Polished black: metalness 0.5, roughness 0.2 |
| **Cigar** | CylinderGeometry | radius: 0.015, height: 0.12 | angled from mouth area | Brown with orange emissive tip |
| **Cigar Glow** | SphereGeometry | radius: 0.02 | cigar tip | Emissive #ff6600, intensity 0.8 |

**More Imposing Proportions:**
1. The boss is a WALL. No V-taper. Just a massive rectangle. This communicates "immovable corporate power."
2. Body width (0.7 units) is nearly as wide as a hero's shoulder span, but it is ALL torso with no muscular definition.
3. The top hat / crown adds height, making the boss appear to tower over heroes even more.
4. Arms are proportionally short relative to body mass (T-Rex arms = doesn't fight physically, fights with MONEY and POWER).
5. The massive briefcase is both weapon and symbol.

**Special Visual Effects for Boss:**

**Double-layer aura:**
- Inner aura: BackSide mesh, emissive #7b2ff7 (purple), opacity 0.1, scale 1.08x body
- Outer aura: BackSide mesh, emissive #ff6600 (orange), opacity 0.05, scale 1.2x body
- Both pulsing at different rates (inner: 1.5 Hz, outer: 0.7 Hz)

**Ground crack / pressure effect:**
- Dark ring geometry beneath boss that grows when boss appears
- Suggests the ground is cracking under their weight/presence
- RingGeometry with dark emissive, expanding from 0 to full size over 1 second

**Money particle orbit:**
- 6-8 small golden BoxGeometry cubes (representing coins/money) orbiting the boss
- Positioned in a circle at waist height, rotating as a group
- Each cube slowly spins on its own axis
- Emissive gold glow
- Speed up during attack phases, scatter during damage

**Dramatic entrance:**
- Vertical energy pillar (CylinderGeometry, emissive purple, transparent)
- Ground shockwave ring expanding outward
- Screen shake (camera offset)
- Boss scales from 0 to 1.0 over 0.5 seconds with slight bounce (overshoot to 1.05, settle to 1.0)

---

## Appendix A: Current Implementation Analysis

The existing `RebelWarrior.tsx` and `CorporateEnemy.tsx` provide a solid foundation. Key improvements based on this research:

**RebelWarrior.tsx current vs. recommended changes:**

| Aspect | Current | Recommended |
|---|---|---|
| Body | Single CapsuleGeometry (r: 0.3, len: 1.2) | Separate chest/waist/hip with V-taper |
| Shoulders | Two small BoxGeometry (0.2 x 0.15 x 0.2) | Half-sphere pauldrons with spikes |
| Head proportion | Sphere r: 0.25 (slightly large) | Reduce to r: 0.18 (makes body look bigger) |
| Arms | Single box per arm (0.1 x 0.35 x 0.1) | Upper + forearm with elbow joint group |
| Legs | Single box per leg (0.12 x 0.5 x 0.12) | Upper + lower with knee joint group |
| Sword | Correct basic shape | Add blade glow mesh, crossguard detail, pommel |
| Shield | CircleGeometry face (flat) | Half-sphere domed face for depth |
| Cape | Not present | Add cascading PlaneGeometry panels |
| Eye glow | Not present | Add emissive cyan SphereGeometry eyes |
| Aura | Single BackSide layer | Dual-layer with different colors/pulse rates |
| Walk animation | Breathing only (Y oscillation) | Add leg swing, arm counter-swing, body bob |

**CorporateEnemy.tsx current vs. recommended changes:**

| Aspect | Current | Recommended |
|---|---|---|
| Body proportion | Approximately correct (boxy, small) | Fine-tune to 5-6 head ratio |
| Walk cycle | Simple Z rotation wobble + Y bounce | Add arm swing, leg alternation |
| Tie | ConeGeometry (good) | Add slight sine-wave flapping animation |
| Briefcase | Good but small | Scale up slightly for comedic emphasis |
| Eyes | Red emissive spheres (good) | Increase emissiveIntensity to 0.8+ |
| Aura | BoxGeometry BackSide (functional) | Match body shape more closely |

## Appendix B: Performance Budget Guidelines

For a browser-based game with potentially 10-20 enemies on screen plus 2 heroes:

| Category | Budget per Character | Notes |
|---|---|---|
| Mesh count | 15-30 meshes | Each primitive is a mesh |
| Triangle count | 500-2000 triangles | Low-segment primitives |
| Material count | 5-8 unique materials | Share materials between similar parts |
| Draw calls | 15-30 per character | One per mesh (without instancing) |
| Particle count | 10-20 per effect | Points preferred over individual meshes |
| Lights per character | 0-1 | Only heroes get personal lights |

**Optimization strategies:**
1. Share material instances between characters of the same type (useMemo)
2. Use lower segment counts on background/distant enemies (6-8 segments vs 12 for heroes)
3. Disable castShadow on small detail meshes (hands, eyes, belt buckle)
4. Use InstancedMesh for enemy waves (all enemies share geometry)
5. Pool and reuse particle systems rather than creating/destroying
6. Consider MeshToonMaterial for a faster, cohesive art style
7. Use LOD (level of detail) -- distant enemies use 4-segment geometry, close ones use 12

## Appendix C: Key Reference Links

- Three.js Official Materials Guide: https://threejs.org/manual/en/materials.html
- Three.js ExtrudeGeometry Docs: https://threejs.org/docs/pages/ExtrudeGeometry.html
- Fresnel Shader Material for R3F: https://github.com/otanodesignco/Fresnel-Shader-Material
- Custom Toon Shader Tutorial: https://www.maya-ndljk.com/blog/threejs-basic-toon-shader
- three-bvh-csg (fast CSG): https://github.com/gkjohnson/three-bvh-csg
- @react-three/csg (React wrapper): https://github.com/pmndrs/react-three-csg
- React Postprocessing (Bloom/Outline): https://github.com/pmndrs/react-postprocessing
- Drei Outlines Component: https://drei.docs.pmnd.rs/abstractions/outlines
- Drei Documentation: https://github.com/pmndrs/drei
- Three.js Canvas Textures Tutorial: https://threejsfundamentals.org/threejs/lessons/threejs-canvas-textures.html
- Procedural Normal Maps in Three.js: https://dustinpfister.github.io/2021/06/24/threejs-normal-map/
- Shape Language in Character Design: https://pixune.com/blog/shape-language-technique/
- Character Proportions Guide: https://www.creativecomicart.com/measuring-human-proportion.html
- Low Poly Character Design Principles: https://3d-ace.com/blog/low-poly-graphics-in-games/
- Color Theory for Character Design: https://dreamfarmstudios.com/blog/color-theory-for-character-design/
- Silhouette Importance in Character Design: https://bigredillustration.com/articles/importance-of-silhouette-in-character-design/
- Three.js Particle Effects Approaches: https://varun.ca/three-js-particles/
- Procedural Walk Cycle Animation: https://www.wayline.io/blog/procedural-animation-dynamic-game-worlds
- Three.js Scene Graph and Transforms: https://discoverthreejs.com/book/first-steps/transformations/
- Fake Glow Material (no postprocessing): https://r3f-fake-glow-material.vercel.app/
