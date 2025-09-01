# Spell System Audit Report

## 🔍 **Official Dungeon World Spell Rules**

Based on the official Dungeon World rulebook, here are the key spell mechanics:

### **Wizard Spell System**
- **Spellbook**: Contains known spells (3 first level spells + cantrips to start)
- **Prepare Spells**: Spend ~1 hour studying spellbook to prepare spells
  - Lose any currently prepared spells
  - Prepare new spells whose total levels ≤ character level + 1
  - Always prepare cantrips (don't count against limit)
- **Cast a Spell (INT)**: Roll+INT to cast prepared spell
  - **10+**: Spell cast successfully, don't forget it (can cast again)
  - **7-9**: Spell cast, choose one:
    - Draw unwelcome attention/put in spot
    - Take -1 ongoing to cast spells until next Prepare Spells
    - Forget the spell (can't cast until next Prepare Spells)
- **Level Up**: Add one new spell of your level or lower to spellbook

### **Cleric Spell System**
- **Commune**: Spend ~1 hour in communion with deity
  - Lose any currently granted spells
  - Granted new spells whose total levels ≤ character level + 1
  - None higher than character level
  - Always prepare rotes (don't count against limit)
- **Cast a Spell (WIS)**: Roll+WIS to cast granted spell
  - **10+**: Spell cast successfully, deity doesn't revoke (can cast again)
  - **7-9**: Spell cast, choose one:
    - Draw unwelcome attention/put in spot
    - Spell is revoked by deity (lose it until next Commune)

### **Spell Levels**
Official DW uses: **Cantrips/Rotes (level 0), 1st, 3rd, 5th, 7th, 9th level spells**

---

## ✅ **Our Implementation vs Official**

### **✅ CORRECT IMPLEMENTATIONS**
- ✅ **Spell preparation limit**: Level + 1 for total spell levels
- ✅ **Cantrips/Rotes**: Don't count against preparation limit
- ✅ **Spellbook concept**: Wizards choose from known spells
- ✅ **Commune concept**: Clerics get spells from deity
- ✅ **Spell level progression**: 1, 3, 5, 7, 9 (mostly correct)

### **❌ MAJOR DISCREPANCIES**

#### **1. Spell Level System - WRONG**
**Our Implementation**: Uses `SpellLevel = 1 | 3 | 5 | 7 | 9`
**Official DW**: Uses levels 0 (cantrips/rotes), 1, 3, 5, 7, 9

**Issue**: We're missing level 0 (cantrips/rotes) in our type definition.

#### **2. Spell Preparation Calculation - WRONG**

**Our Implementation**:

- Wizard: `level + 1`
- Cleric: `wisdomModifier + 1`

**Official DW**:

- **Both classes**: Total spell **levels** ≤ character level + 1
- This means you can prepare multiple low-level spells OR fewer high-level spells

**Example**: Level 5 character can prepare:
- Six 1st level spells (6 × 1 = 6 levels, but limit is 6)
- Two 3rd level spells (2 × 3 = 6 levels)
- One 1st + one 5th level spell (1 + 5 = 6 levels)

#### **3. Missing Cast a Spell Mechanics**
**Our Implementation**: No casting mechanics implemented
**Official DW**: Requires roll+INT (Wizard) or roll+WIS (Cleric) with specific outcomes

#### **4. Spell Data Structure Issues**
**Our Implementation**: 
```typescript
level: SpellLevel; // 1 | 3 | 5 | 7 | 9
```text
**Should be**: 
```typescript
level: 0 | 1 | 3 | 5 | 7 | 9; // Include cantrips/rotes
```text

---

## 🔧 **CRITICAL FIXES NEEDED**

### **Priority 1: Fix Spell Level System**
1. Update `SpellLevel` type to include level 0
2. Properly categorize cantrips/rotes as level 0
3. Update all spell data to use correct levels

### **Priority 2: Fix Preparation Mechanics**
1. Change from "number of spells" to "total spell levels"
2. Implement proper spell level budgeting
3. Always allow cantrips/rotes without counting against limit

### **Priority 3: Implement Cast a Spell Moves**
1. Add Wizard "Cast a Spell (INT)" move
2. Add Cleric "Cast a Spell (WIS)" move  
3. Implement proper roll outcomes and consequences

### **Priority 4: Update Spell Data**
1. Ensure all cantrips are level 0
2. Verify spell level assignments match official DW
3. Add missing core spells from official spell lists

---

## 📊 **COMPLIANCE STATUS**

- **Spell Data Structure**: ❌ 60% Compliant (missing level 0, wrong calculations)
- **Preparation System**: ❌ 40% Compliant (wrong calculation method)
- **Casting Mechanics**: ❌ 0% Compliant (not implemented)
- **Spell Lists**: ✅ 80% Compliant (good coverage, some level issues)

**Overall Assessment**: Our spell system has the right concepts but **major mechanical discrepancies** that need immediate fixing to match official Dungeon World rules.

---

## 🎯 **IMMEDIATE ACTION ITEMS**

1. **Fix SpellLevel type** to include 0 for cantrips/rotes
2. **Rewrite spell preparation logic** to use total spell levels instead of spell count
3. **Implement Cast a Spell moves** with proper roll mechanics
4. **Update all spell data** to use correct level assignments
5. **Add spell casting UI** that follows official DW mechanics
