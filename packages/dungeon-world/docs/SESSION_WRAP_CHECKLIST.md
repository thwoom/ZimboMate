# 📋 Session Wrap-Up Checklist
*Complete this before ending any development session*

## 🎯 **CRITICAL END-OF-SESSION TASKS**

### **1. Update Progress Documentation** ✅
- [ ] Update `packages/zimbomate-v2/docs/PROGRESS.md` with:
  - [ ] Session summary and date
  - [ ] Tasks completed
  - [ ] Tasks in progress
  - [ ] Any issues or blockers
  - [ ] Next session focus
  - [ ] Files modified

### **2. Code Quality Check** ✅
- [ ] Code builds without errors
- [ ] TypeScript types are correct
- [ ] No console errors in browser
- [ ] Basic functionality works
- [ ] Follows established patterns

### **3. Documentation Updates** ✅
- [ ] Any new patterns documented
- [ ] Architectural decisions recorded
- [ ] Breaking changes noted
- [ ] Dependencies updated if needed

### **4. Session Handoff Preparation** ✅
- [ ] Progress file is comprehensive
- [ ] Next steps are clear and specific
- [ ] Any blockers are well-documented
- [ ] Context is preserved for next session

## 📝 **PROGRESS UPDATE TEMPLATE**

Copy this template to `packages/zimbomate-v2/docs/PROGRESS.md`:

~~~
# ZimboMate V2 Development Progress

## Current Phase: [Phase Name]
## Last Updated: [Date and Time]
## Next Session Focus: [Specific task or area]

## Session Summary - [Date]

### ✅ Completed This Session
- [List specific accomplishments]
- [Include file names and key changes]

### 🔄 In Progress
- [Tasks that are partially complete]
- [What's been started but not finished]

### ❌ Issues/Blockers
- [Any problems encountered]
- [Dependencies or decisions needed]

### 🎯 Next Session Priorities
1. [Most important task]
2. [Second priority]
3. [Third priority]

### 📁 Files Modified
- [List all files changed this session]

### 🏗️ Architecture Notes
- [Any important architectural decisions]
- [Patterns established or changed]

## Overall Project Status

### Phase Completion
- [ ] Phase 1: Foundation Setup
- [ ] Phase 2: Core UI Development  
- [ ] Phase 3: Game Features
- [ ] Phase 4: Polish & Optimization

### Key Metrics
- **Lines of Code**: [Estimate]
- **Components Created**: [Count]
- **Features Working**: [List]
- **Performance**: [Notes on speed/smoothness]
~~~

## 🚀 **NEXT SESSION PREPARATION**

### **For the Next Developer/Session**
1. **Use the handoff prompt** from `docs/SESSION_HANDOFF_PROMPT.md`
2. **Read PROGRESS.md first** to understand current state
3. **Follow the RULES.md** for all development decisions
4. **Continue from the "Next Session Focus"** area

### **Optimal Session Start**
~~~
I'm continuing ZimboMate V2 development. Let me start by reading the progress file to understand the current state.

*[Read packages/zimbomate-v2/docs/PROGRESS.md]*

Based on the progress, I need to focus on: [Next Session Focus from progress file]
~~~

## 🎯 **SUCCESS INDICATORS**

### **Good Session Wrap-Up**
- [ ] Progress is clearly documented
- [ ] Next steps are specific and actionable
- [ ] Code is in working state
- [ ] No critical issues left unresolved
- [ ] Context is preserved for continuity

### **Red Flags** (Fix Before Ending)
- [ ] Progress file not updated
- [ ] Code doesn't build or run
- [ ] Major issues left undocumented
- [ ] Next steps are vague or unclear
- [ ] Breaking changes not documented

## 🎲 **FINAL REMINDER**

**The goal is seamless continuity.** The next session should be able to pick up exactly where this one left off, with full context and clear direction.

*A well-documented session is worth two poorly documented ones.*