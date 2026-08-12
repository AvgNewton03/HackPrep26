# Product Requirements Document (PRD): "LevelUp" – Project Arise

**Project Name:** LevelUp (Theme: *Solo Leveling*)
**Platform:** Web Application (Desktop-optimized, mobile-responsive)
**Core Tech Stack:** Next.js (App Router), Supabase (Auth & PostgreSQL database), Tailwind CSS, Framer Motion (Animations), LLM API (OpenAI/Gemini)
**Objective:** To build a highly gamified, visually striking EdTech platform that leverages LLM-generated content to make learning feel like clearing dungeons in the *Solo Leveling* universe.

---

## 1. Core Concept & Thematic Mapping

The platform abandons traditional "course" UI for a "System" interface.

* **The User:** A "Hunter" who starts at E-Rank.
* **The Subjects/Topics:** "Gates" (Dungeons) scattered across a city map.
* **The Lesson:** "System Knowledge Download."
* **The Quiz:** "Dungeon Boss Raid" (5 MCQs).
* **XP & Leveling:** "Mana Stones" and Hunter Level.
* **Leaderboard:** "Hunter Association Rankings."

---

## 2. User Journey & UI/UX Design

### 2.1 The Dashboard: "The Hunter's Map"

Instead of a standard grid of courses, the user’s home screen is an interactive city map.

* **Fog of War:** Upon first login, the map is 90% covered in dark clouds/fog. Only the central "Safe Zone" and a few surrounding nodes are visible.
* **Radial Expansion:** When a user clicks a visible node, they enter a topic (e.g., "DBMS"). Upon clearing this "Gate," the fog around that specific node dissipates radially, revealing new, connected nodes.
* **Gate Visuals:** Nodes are represented by glowing rifts (Gates). Their color dictates their difficulty: E-Rank (Grey), D-Rank (Green), C-Rank (Blue), B-Rank (Purple), A-Rank (Orange), S-Rank (Red).

### 2.2 The "System" Interface

* **Aesthetic:** Deep blacks (`#0a0a0a`), neon blue accents (`#00e5ff`), and glowing box shadows.
* **Animations (Framer Motion):** Modals don't just appear; they "materialize" like holographic system alerts. Text uses a typewriter effect.
* **Feedback:** Wrong answers flash the screen with a red warning: *"System Alert: Incorrect strategy. Analyzing boss weakness..."* followed by the LLM explanation.

---

## 3. Core Features & Requirements (Incorporating USPs)

### Feature 1: Topic Selection & Adaptive Gates (USP 2)

* **Mechanic:** Users claim an un-cleared map node and type a subject (e.g., "React Hooks").
* **Adaptive Rank Generation:** The System always generates an **E-Rank Gate** for a new topic. If the user passes with 100% accuracy, the node upgrades, and the next time they challenge that topic, it becomes a **D/C-Rank Gate** (harder questions, complex scenarios).
* **LLM Prompting:** The backend dynamically injects the "Rank" into the LLM prompt to scale the reading level and MCQ difficulty.

### Feature 2: LLM-Generated Content (The Raid)

* **Phase 1: Knowledge Download:** A concise, LLM-generated explainer on the topic.
* **Phase 2: Boss Raid:** 5 LLM-generated MCQs based *strictly* on the explainer.
* **Bonus - System Analysis:** If a user gets a question wrong, they can trigger the LLM to explain the misconception without revealing the correct answer immediately.

### Feature 3: "Red Gate" Daily Quests & Penalties (USP 4)

* **The Daily Quest:** Once every 24 hours, a glowing "Red Gate" appears on the map. This is a timed challenge featuring a mix of previously learned topics.
* **The Penalty Zone:** If a user breaks their daily learning streak, they are transported to the Penalty Zone upon next login. The UI turns desolate (desert background). To restore their streak and return to the map, they must survive a 60-second rapid-fire quiz. Failure resets the streak to 0.

### Feature 4: Gamification & Hunter Rankings (USP 5)

* **Progression:** Correct answers yield Mana (XP). Gathering enough Mana triggers a full-screen "LEVEL UP" animation.
* **Hunter Association Leaderboard:** A global (or mock) leaderboard.
* *Tiers:* Unranked → Guild Member → A-Class Hunter → S-Class Hunter.
* The top 5 users on the platform are granted the exclusive title of **"National Level Hunter."**



---

## 5. Technical Architecture

### 5.1 System Blueprint

1. **Client (Next.js):** Handles the Map UI, 2D rendering of nodes, state management (Zustand/Context for Map state), and Framer Motion animations.
2. **Server Actions / API (Next.js):** Acts as the middleman. Receives user actions (e.g., "Enter Gate"), securely calls the LLM, validates answers, and computes XP.
3. **Database (Supabase/PostgreSQL):** Stores user profiles, map node coordinates, unlocked topics, and historical quiz performance.

### 5.2 High-Level Database Schema (PostgreSQL)

| Table Name | Description | Key Columns |
| --- | --- | --- |
| **`hunters`** (Users) | Core user profile and stats | `id`, `username`, `level`, `mana_xp`, `current_streak`, `highest_streak`, `hunter_class` |
| **`map_nodes`** | Represents locations on the city map | `id`, `x_coord`, `y_coord`, `is_unlocked`, `owner_id` |
| **`gates`** | Specific subjects tied to map nodes | `id`, `node_id`, `topic`, `current_rank` (E to S), `cleared_count` |
| **`raid_history`** | Logs of quizzes taken | `id`, `hunter_id`, `gate_id`, `score`, `time_taken`, `created_at` |

---

## 6. Implementation Phasing

**Phase 1: Core System & Infrastructure**

* Set up Next.js app, Supabase auth, and database schema.
* Build the LLM API integration (generate lesson + 5 MCQs).
* Implement basic Quiz UI and Answer validation on the backend.

**Phase 2: The Hunter's Dashboard (UI Focus)**

* Develop the 2D City Map interface (HTML5 Canvas or CSS Grid-based).
* Implement the Fog of War masking and the radial unlock logic upon completing a quiz.
* Apply the *Solo Leveling* "System" CSS theme (animations, modals, typography).

**Phase 3: Gamification & USPs**

* Implement XP calculation, Streak tracking, and database persistence.
* Build the "Red Gate" daily timer and "Penalty Zone" logic.
* Create the Hunter Association Leaderboard fetching logic.
* Refine adaptive difficulty prompting for the LLM based on user Gate rank.