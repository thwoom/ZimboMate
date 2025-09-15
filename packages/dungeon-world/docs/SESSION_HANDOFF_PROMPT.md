# 🎯 ZimboMate V2 Session Handoff Prompt
*Copy this prompt for every new chat session to maintain continuity*

## 🤖 **COPY THIS PROMPT FOR NEW SESSIONS:**

---

I'm continuing work on **ZimboMate V2**, a magical Dungeon World companion app. This is a **COMPLETE REWRITE** of the existing V1 codebase using modern tools.

## 🎯 **CRITICAL CONTEXT:**

### **1. READ PROGRESS FIRST**
- Check `packages/zimbomate-v2/docs/PROGRESS.md` for current status
- This tells you exactly what phase we're in and what to work on next
- **ALWAYS UPDATE THIS FILE** as you make progress

### **2. PROJECT STRUCTURE**
- **V2 Location**: `packages/zimbomate-v2/` (NEW package in monorepo)
- **V1 Reference**: `packages/dungeon-world/` (DON'T MODIFY - reference only)
- **Strategy**: Copy models/services from V1, rebuild UI from scratch

### **3. TECH STACK**
- **React 19** + **TypeScript** + **Vite**
- **Zustand** (state management)
- **Framer Motion** (animations)
- **Three.js** (3D effects)
- **Tailwind CSS v4** (styling)
- **Radix UI** (accessible components)

## 📋 **CURRENT MISSION:**
1. Read `packages/zimbomate-v2/docs/PROGRESS.md` to see current phase
2. Continue the active task or start next phase
3. Update PROGRESS.md with your changes
4. Follow implementation rules and patterns

## 🚨 **CRITICAL RULES:**

### **NEVER MODIFY V1:**
- Don't touch anything in `packages/dungeon-world/`
- V1 is reference only - we're building V2 from scratch
- Copy files from V1, don't move them

### **ALWAYS UPDATE PROGRESS:**
- Update `packages/zimbomate-v2/docs/PROGRESS.md` with every change
- Include what you completed, what's next, any issues
- This is how we maintain continuity across sessions

### **KEEP IT SIMPLE:**
- No complex abstractions or custom frameworks
- Use modern React patterns (hooks, composition)
- Follow patterns in `docs/IMPLEMENTATION_RULES.md`

## 📚 **DOCUMENTATION TO READ:**

### **Essential (Read First):**
- `packages/zimbomate-v2/docs/PROGRESS.md` - **CURRENT STATUS**
- `packages/dungeon-world/docs/FRONTEND_VISION.md` - Overall vision
- `packages/dungeon-world/docs/IMPLEMENTATION_RULES.md` - Development rules

### **Reference (As Needed):**
- `packages/dungeon-world/docs/OPTIMAL_TECH_STACK.md` - Tech stack details
- `packages/dungeon-world/docs/PROJECT_STRUCTURE_DECISION.md` - Project setup
- `packages/dungeon-world/docs/REWRITE_DECISION.md` - Why we're rewriting

## 🎮 **WHAT WE'RE BUILDING:**

A **magical Dungeon World companion** with:
- **3D dice rolling** with physics and particles
- **Smooth animations** for all interactions
- **Beautiful fantasy UI** with parchment textures
- **Smart AI assistance** for rules and content
- **Real-time multiplayer** capabilities
- **PWA support** for mobile

## 🚀 **TYPICAL SESSION WORKFLOW:**

1. **Check Progress**: Read `PROGRESS.md` to understand current state
2. **Continue Work**: Pick up where last session left off
3. **Make Changes**: Implement features following the rules
4. **Update Progress**: Document what you did and what's next
5. **Test**: Ensure everything works before ending session

## 🎯 **SUCCESS CRITERIA:**

- **User Experience**: Feels magical and delightful
- **Performance**: 60fps animations, instant responses
- **Code Quality**: Simple, maintainable, well-documented
- **Accessibility**: WCAG AA compliant

## 🎲 **READY TO BUILD MAGIC!**

The vision is clear, the tech stack is optimal, and the architecture is simple. Let's create the most amazing Dungeon World companion ever built! ✨

**First step**: Read `packages/zimbomate-v2/docs/PROGRESS.md` and continue from there.

---

## 🔄 **Session Handoff Template**

When ending a session, update PROGRESS.md with:

~~~
### [Date] - Session Summary
**Completed:**
- [List what was finished]

**In Progress:**
- [What's partially done]

**Issues/Blockers:**
- [Any problems encountered]

**Next Session Focus:**
- [Specific tasks for next session]

**Files Modified:**
- [List of files changed]
~~~

This ensures perfect continuity between sessions! 🎯