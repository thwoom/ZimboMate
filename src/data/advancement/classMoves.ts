import type { Attribute, CharacterClass } from '../../models/Character'

/**
 * Dungeon World class moves data.
 * Sources: docs/compendium_data.md and docs/dungeon_world_wizard.yaml
 * (Dungeon World SRD, CC-BY 3.0).
 */
export interface ClassMove {
  id: string
  name: string
  tier: 'starting' | 'advanced' | 'master' | 'race'
  description: string
  prerequisites?: {
    level?: number
    requiresMoveIds?: string[]
    requiresRace?: string[]
    requiresAlignment?: string[]
    requiresStat?: { stat: Attribute; min: number }
  }
  mutuallyExclusiveIds?: string[]
  tags?: string[]
}

export type ClassMoves = Record<CharacterClass, ClassMove[]>

export const CLASS_MOVES: ClassMoves = {
  "Fighter": [
    {
      "id": "fighter_dwarf",
      "name": "Dwarf",
      "tier": "race",
      "description": "When you share a drink with someone, you can **Parley** with CON instead of CHA.",
      "prerequisites": {
        "requiresRace": [
          "Dwarf"
        ]
      }
    },
    {
      "id": "fighter_elf",
      "name": "Elf",
      "tier": "race",
      "description": "Choose one weapon type. You treat all weapons of that type as if they had the _precise_ tag.",
      "prerequisites": {
        "requiresRace": [
          "Elf"
        ]
      }
    },
    {
      "id": "fighter_halfling",
      "name": "Halfling",
      "tier": "race",
      "description": "When you **Defy Danger** by using your small size, take +1.",
      "prerequisites": {
        "requiresRace": [
          "Halfling"
        ]
      }
    },
    {
      "id": "fighter_human",
      "name": "Human",
      "tier": "race",
      "description": "Once per battle, you may re-roll a single damage roll (yours or someone else's).",
      "prerequisites": {
        "requiresRace": [
          "Human"
        ]
      }
    },
    {
      "id": "fighter_bend_bars_lift_gates",
      "name": "Bend Bars, Lift Gates",
      "tier": "starting",
      "description": "_When you use pure strength to smash through an inanimate obstacle, roll+STR._\n- On 10+, choose 3 options. On 7-9, choose 2: _(1)_ It doesn't take a long time; _(2)_ Nothing of value is damaged; _(3)_ It doesn't make an inordinate amount of noise; _(4)_ You can fix the thing again without a lot of effort."
    },
    {
      "id": "fighter_armored",
      "name": "Armored",
      "tier": "starting",
      "description": "You ignore the _clumsy_ tag on any armor you wear."
    },
    {
      "id": "fighter_signature_weapon",
      "name": "Signature Weapon",
      "tier": "starting",
      "description": "_This is your personal weapon._ You define it during creation. **Choose a base type** (e.g. sword, axe, hammer, spear, flail, or fists - all 2 weight), **choose a range** (hand, close, or reach), and **choose two enhancements** for it (e.g. \"Hooks and spikes\" +1 damage +1 weight, \"Sharp\" +2 piercing, \"Perfectly weighted\" add _precise_, \"Serrated edges\" +1 damage, \"Glows in presence of \\[creature type\\]\", \"Huge\" add _messy_ and _forceful_, \"Versatile\" add an extra range, or \"Well-crafted\" -1 weight). Also **choose a look** for the weapon (ancient, unblemished, ornate, blood-stained, or sinister). _Your signature weapon's enhancements and tags define its unique properties._\n_(Flavor:_ \"This is your weapon. There are many like it, but this one is yours...\" - a bit of narrative text emphasizing the bond with your weapon._)_"
    },
    {
      "id": "fighter_merciless",
      "name": "Merciless",
      "tier": "advanced",
      "description": "When you deal damage, deal +1d4 damage.",
      "mutuallyExclusiveIds": [
        "fighter_bloodthirsty"
      ]
    },
    {
      "id": "fighter_heirloom",
      "name": "Heirloom",
      "tier": "advanced",
      "description": "When you consult the spirits in your signature weapon for insight, roll+CHA. _On 10+_, the GM gives you good detail; _on 7-9_, an impression."
    },
    {
      "id": "fighter_armor_mastery",
      "name": "Armor Mastery",
      "tier": "advanced",
      "description": "When you direct an attack's damage to your armor, the damage is negated but your armor or shield's armor value is reduced by 1. If an item's armor value drops to 0, it is destroyed.",
      "mutuallyExclusiveIds": [
        "fighter_armored_perfection"
      ]
    },
    {
      "id": "fighter_improved_weapon",
      "name": "Improved Weapon",
      "tier": "advanced",
      "description": "Choose one additional enhancement for your signature weapon (add a new ability/tag to it)."
    },
    {
      "id": "fighter_seeing_red",
      "name": "Seeing Red",
      "tier": "advanced",
      "description": "When you **Discern Realities** in the heat of battle, take +1 ongoing to the roll."
    },
    {
      "id": "fighter_interrogator",
      "name": "Interrogator",
      "tier": "advanced",
      "description": "When you **Parley** using threats of violence as leverage, you may roll STR instead of CHA."
    },
    {
      "id": "fighter_scent_of_blood",
      "name": "Scent of Blood",
      "tier": "advanced",
      "description": "When you **Hack and Slash** an enemy, your next attack against that same foe deals +1d4 damage.",
      "mutuallyExclusiveIds": [
        "fighter_taste_of_blood"
      ]
    },
    {
      "id": "fighter_multiclass_dabbler",
      "name": "Multiclass Dabbler",
      "tier": "advanced",
      "description": "Choose one move from another class list. You may select only moves that a character of one level lower than you could take (treat your level as one lower for this purpose). (This is the Fighter's way to take a move from another class; see multiclass rules below.)"
    },
    {
      "id": "fighter_iron_hide",
      "name": "Iron Hide",
      "tier": "advanced",
      "description": "You gain +1 armor (permanently, in addition to armor worn).",
      "mutuallyExclusiveIds": [
        "fighter_steel_hide"
      ]
    },
    {
      "id": "fighter_blacksmith",
      "name": "Blacksmith",
      "tier": "advanced",
      "description": "When you have access to a forge, you can destroy a magical weapon to transfer its magic to your signature weapon (your weapon gains the destroyed weapon's powers)."
    },
    {
      "id": "fighter_bloodthirsty",
      "name": "Bloodthirsty",
      "tier": "master",
      "description": "When you deal damage, deal +1d8 damage (instead of +1d4).",
      "prerequisites": {
        "requiresMoveIds": [
          "fighter_merciless"
        ]
      },
      "mutuallyExclusiveIds": [
        "fighter_merciless"
      ]
    },
    {
      "id": "fighter_armored_perfection",
      "name": "Armored Perfection",
      "tier": "master",
      "description": "When you let your armor take the brunt of an attack, you negate the damage **and** take +1 forward against the attacker, but you still reduce the armor's value by 1 as before (destroyed at 0 armor).",
      "prerequisites": {
        "requiresMoveIds": [
          "fighter_armor_mastery"
        ]
      },
      "mutuallyExclusiveIds": [
        "fighter_armor_mastery"
      ]
    },
    {
      "id": "fighter_evil_eye",
      "name": "Evil Eye",
      "tier": "master",
      "description": "When you enter combat, roll+CHA. _On 10+_, hold 2. _On 7-9_, hold 1. Spend 1 hold at any time to make eye contact with an NPC, causing them to freeze or flinch, unable to act until you break it. _On a miss_, your enemies immediately target you as the biggest threat.",
      "prerequisites": {
        "requiresMoveIds": [
          "fighter_seeing_red"
        ]
      }
    },
    {
      "id": "fighter_taste_of_blood",
      "name": "Taste of Blood",
      "tier": "master",
      "description": "When you **Hack and Slash** an enemy, your next attack against that foe deals +1d8 damage (instead of +1d4).",
      "prerequisites": {
        "requiresMoveIds": [
          "fighter_scent_of_blood"
        ]
      },
      "mutuallyExclusiveIds": [
        "fighter_scent_of_blood"
      ]
    },
    {
      "id": "fighter_multiclass_initiate",
      "name": "Multiclass Initiate",
      "tier": "master",
      "description": "Choose another move from another class, treating your level as one lower as usual. (This allows a second multiclass move; effectively the Fighter can take Dabbler at 2-5 and then Initiate at 6+ to gain two off-class moves total.)",
      "prerequisites": {
        "requiresMoveIds": [
          "fighter_multiclass_dabbler"
        ]
      }
    },
    {
      "id": "fighter_steel_hide",
      "name": "Steel Hide",
      "tier": "master",
      "description": "You gain +2 armor (instead of +1).",
      "prerequisites": {
        "requiresMoveIds": [
          "fighter_iron_hide"
        ]
      },
      "mutuallyExclusiveIds": [
        "fighter_iron_hide"
      ]
    },
    {
      "id": "fighter_through_deaths_eyes",
      "name": "Through Death's Eyes",
      "tier": "master",
      "description": "When you go into battle, roll+WIS. _On 10+_, name one person who will live and one who will die in the conflict (GM's choice how). _On 7-9_, name someone who will live or someone who will die (not both). These must be **NPCs**; the GM will make it come true if at all possible. _On a miss_, you foresee your own death and take -1 ongoing throughout the battle due to the terror."
    },
    {
      "id": "fighter_eye_for_weaponry",
      "name": "Eye for Weaponry",
      "tier": "master",
      "description": "When you closely examine an enemy's weaponry, you can ask the GM \"How much damage does it do?\" and get an honest answer."
    },
    {
      "id": "fighter_superior_warrior",
      "name": "Superior Warrior",
      "tier": "master",
      "description": "When you **Hack and Slash** and roll a 12+ (after modifiers), you deal your damage **and** avoid the enemy's attack **and** impress, dismay, or frighten them by your prowess."
    }
  ],
  "Paladin": [
    {
      "id": "paladin_human",
      "name": "Human",
      "tier": "race",
      "description": "When you pray for guidance, even for a moment, and ask \"What here is evil?\" the GM will answer you truthfully.",
      "prerequisites": {
        "requiresRace": [
          "Human"
        ]
      }
    },
    {
      "id": "paladin_lay_on_hands",
      "name": "Lay on Hands",
      "tier": "starting",
      "description": "_Cha-based healing._ When you touch someone skin-to-skin and pray for their well-being, roll+CHA. _On 10+_, heal 1d8 HP or cure one disease. _On 7-9_, you still heal them but you take the damage or disease into yourself."
    },
    {
      "id": "paladin_armored",
      "name": "Armored",
      "tier": "starting",
      "description": "You ignore the _clumsy_ tag on armor you wear (same as the Fighter's Armored move)."
    },
    {
      "id": "paladin_i_am_the_law",
      "name": "I Am the Law",
      "tier": "starting",
      "description": "When you give an NPC an order under rightful divine authority, roll+CHA. _On 7+_, the target NPC chooses one: obey you, flee (or back away) from you, or attack you. _On 10+_, you also take +1 forward against that NPC (they are cowed). _On a miss_, they do as they please and you take -1 forward against them."
    },
    {
      "id": "paladin_quest",
      "name": "Quest",
      "tier": "starting",
      "description": "When you dedicate yourself to a mission through prayer and ritual cleansing, state what you set out to do (choose one goal from the list below), then choose up to two **boons** and the GM will give you one or more **vows** you must honor while on that quest.\n- **Quest goal options:** _Slay_ &lt;em&gt;**___**&lt;/em&gt; (a great blight on the land), _Defend_ &lt;em&gt;**___**&lt;/em&gt; (a person, place, or thing) from the injustices that beset them, or _Discover the truth of_ &lt;em&gt;**___**&lt;/em&gt; (some hidden lore or secret).\n- **Boons (choose up to 2):** An unwavering sense of direction to &lt;em&gt;**_&lt;/em&gt; (e.g. always know the path to your goal), Invulnerability to &lt;em&gt;_**&lt;/em&gt; (a type of damage, e.g. fire, edged weapons, enchantment, etc.), A mark of divine authority (e.g. a holy aura or sign), Senses that pierce lies, A voice that transcends language (you can speak/understand any tongue), or Freedom from hunger, thirst, and sleep.\n- **Vows (GM will assign one or more):** Honor (forbidden: cowardly tactics or tricks), Temperance (forbidden: gluttony or excess in food, drink, or pleasures of the flesh), Piety (required: observance of daily holy rituals), Valor (forbidden: suffering an evil creature to live), Truth (forbidden: lies), or Hospitality (required: comfort to those in need, no matter who they are).\n_(_In play, the Quest move gives the Paladin a holy mission. The boons are benefits they gain; the vows are conditions they must follow or lose those boons._)_"
    },
    {
      "id": "paladin_divine_favor",
      "name": "Divine Favor",
      "tier": "advanced",
      "description": "Dedicate yourself to a deity (either a new one you name or an existing one in the world). You gain the Cleric's spellcasting ability: specifically, you gain the Cleric moves **Commune** and **Cast a Spell** (see Cleric below). Treat yourself as a level 1 Cleric for spellcasting. Each time you level up as a Paladin, increase your effective Cleric level by 1 for spellcasting purposes. (This effectively multiclasses you into the Cleric's magic; e.g. if you take this at Paladin level 2, you cast spells as a 1st-level Cleric; at Paladin level 3, as a 2nd-level Cleric, etc.)"
    },
    {
      "id": "paladin_bloody_aegis",
      "name": "Bloody Aegis",
      "tier": "advanced",
      "description": "When you would take damage, you can choose to grit your teeth and accept the blow without effect - you take **no damage**, but you suffer a debility of your choice instead (a lasting injury or hindrance). If you already have all six debilities marked, you can't use this move (you're too battered)."
    },
    {
      "id": "paladin_smite",
      "name": "Smite",
      "tier": "advanced",
      "description": "While on an ongoing **Quest** (i.e. you have sworn a quest via the Quest move), you deal +1d4 damage.",
      "mutuallyExclusiveIds": [
        "paladin_holy_smite"
      ]
    },
    {
      "id": "paladin_exterminatus",
      "name": "Exterminatus",
      "tier": "advanced",
      "description": "When you publicly swear to defeat a specific enemy, you deal +2d4 damage to that enemy _and_ -4 damage to all other targets. This effect lasts until that enemy is defeated. If you abandon your quest or fail to defeat the enemy, you can confess your failure to end the effect, but otherwise the damage penalty versus others persists until you redeem yourself."
    },
    {
      "id": "paladin_charge",
      "name": "Charge!",
      "tier": "advanced",
      "description": "When you lead the charge in combat (literally rush at the enemy at the front of your group), all allies following your lead take +1 forward (i.e. +1 on their next rolls)."
    },
    {
      "id": "paladin_staunch_defender",
      "name": "Staunch Defender",
      "tier": "advanced",
      "description": "When you stand in defense of a person or location (**Defend** move), you always get +1 hold (even on a 6- where you would normally get none, you get 1 hold).",
      "mutuallyExclusiveIds": [
        "paladin_impervious_defender"
      ]
    },
    {
      "id": "paladin_setup_strike",
      "name": "Setup Strike",
      "tier": "advanced",
      "description": "When you **Hack and Slash**, you may choose an ally and set them up for success - their next attack against the same target does +1d4 damage (in addition to your own attack as normal).",
      "mutuallyExclusiveIds": [
        "paladin_tandem_strike"
      ]
    },
    {
      "id": "paladin_holy_protection",
      "name": "Holy Protection",
      "tier": "advanced",
      "description": "You gain +1 armor while on a quest (i.e. after using the Quest move).",
      "mutuallyExclusiveIds": [
        "paladin_divine_protection"
      ]
    },
    {
      "id": "paladin_voice_of_authority",
      "name": "Voice of Authority",
      "tier": "advanced",
      "description": "You gain +1 to the rolls to order hirelings (followers) around. (This improves your ability to command NPC underlings).",
      "mutuallyExclusiveIds": [
        "paladin_divine_authority"
      ]
    },
    {
      "id": "paladin_hospitaller",
      "name": "Hospitaller",
      "tier": "advanced",
      "description": "When you heal someone (via Lay on Hands or other means), you heal +1d8 additional HP.",
      "mutuallyExclusiveIds": [
        "paladin_perfect_hospitaller"
      ]
    },
    {
      "id": "paladin_evidence_of_faith",
      "name": "Evidence of Faith",
      "tier": "master",
      "description": "When you witness divine magic in action, you can ask the GM which deity is the source of that magic and what the effect is. Take +1 forward when acting on the answer (e.g. exploiting that knowledge).",
      "prerequisites": {
        "requiresMoveIds": [
          "paladin_divine_favor"
        ]
      }
    },
    {
      "id": "paladin_holy_smite",
      "name": "Holy Smite",
      "tier": "master",
      "description": "When on a quest, you deal +1d8 damage (instead of +1d4).",
      "prerequisites": {
        "requiresMoveIds": [
          "paladin_smite"
        ]
      },
      "mutuallyExclusiveIds": [
        "paladin_smite"
      ]
    },
    {
      "id": "paladin_ever_onward",
      "name": "Ever Onward",
      "tier": "master",
      "description": "_Replaces Charge!_ When you lead a charge into combat, allies you lead take +1 forward **and** +2 armor forward (they get a temporary +2 Armor until the first attack)."
    },
    {
      "id": "paladin_impervious_defender",
      "name": "Impervious Defender",
      "tier": "master",
      "description": "When you **Defend**, you always get +1 hold (as before). Additionally, if you get a 12+ on a Defend roll, instead of the normal effects, the nearest attacking enemy is completely thwarted - the GM will describe how it fails or is put at a disadvantage.",
      "prerequisites": {
        "requiresMoveIds": [
          "paladin_staunch_defender"
        ]
      },
      "mutuallyExclusiveIds": [
        "paladin_staunch_defender"
      ]
    },
    {
      "id": "paladin_tandem_strike",
      "name": "Tandem Strike",
      "tier": "master",
      "description": "When you **Hack and Slash**, choose an ally - their next attack against the target does +1d4 damage **and** they take +1 forward against that target (so they also get +1 on the attack roll).",
      "prerequisites": {
        "requiresMoveIds": [
          "paladin_setup_strike"
        ]
      },
      "mutuallyExclusiveIds": [
        "paladin_setup_strike"
      ]
    },
    {
      "id": "paladin_divine_protection",
      "name": "Divine Protection",
      "tier": "master",
      "description": "You gain +2 armor while on a quest (instead of +1).",
      "prerequisites": {
        "requiresMoveIds": [
          "paladin_holy_protection"
        ]
      },
      "mutuallyExclusiveIds": [
        "paladin_holy_protection"
      ]
    },
    {
      "id": "paladin_divine_authority",
      "name": "Divine Authority",
      "tier": "master",
      "description": "You still get +1 to order hirelings, and when you **Order Hirelings** and roll a 12+ the hireling overcomes their fear or doubt and performs your order with optimal efficiency or courage (extra effect as determined by GM).",
      "prerequisites": {
        "requiresMoveIds": [
          "paladin_voice_of_authority"
        ]
      },
      "mutuallyExclusiveIds": [
        "paladin_voice_of_authority"
      ]
    },
    {
      "id": "paladin_perfect_hospitaller",
      "name": "Perfect Hospitaller",
      "tier": "master",
      "description": "When you heal an ally, you heal +2d8 damage (instead of +1d8).",
      "prerequisites": {
        "requiresMoveIds": [
          "paladin_hospitaller"
        ]
      },
      "mutuallyExclusiveIds": [
        "paladin_hospitaller"
      ]
    },
    {
      "id": "paladin_indomitable",
      "name": "Indomitable",
      "tier": "master",
      "description": "Whenever you suffer a debility (even if it's by using Bloody Aegis), take +1 forward against whatever caused it."
    },
    {
      "id": "paladin_perfect_knight",
      "name": "Perfect Knight",
      "tier": "master",
      "description": "When you **Quest**, you may choose _three_ boons instead of two."
    }
  ],
  "Ranger": [
    {
      "id": "ranger_elf",
      "name": "Elf",
      "tier": "race",
      "description": "When you **Undertake a Perilous Journey** through wilderness, you succeed as if you rolled a 10+ in whatever job you take (Trailblazer, Scout, or Quartermaster). (_This essentially means an elf ranger automatically excels in one travel role without risk_.)",
      "prerequisites": {
        "requiresRace": [
          "Elf"
        ]
      }
    },
    {
      "id": "ranger_human",
      "name": "Human",
      "tier": "race",
      "description": "When you **Make Camp** in a dungeon or city, you **don't need to consume a ration** (you can scrounge or manage without using up food).",
      "prerequisites": {
        "requiresRace": [
          "Human"
        ]
      }
    },
    {
      "id": "ranger_hunt_and_track",
      "name": "Hunt and Track",
      "tier": "starting",
      "description": "_Wisdom-based tracking._ When you follow a trail of clues left by passing creatures, roll+WIS. _On 7+_, you follow the creature's trail until there's a significant change in its direction or mode of travel. _On 10+_, you also get to choose 1 benefit: either you gain a useful bit of information about your quarry (the GM will tell you what), **or** you determine what caused the trail to end (e.g. you learn if they reached water, magic was used, etc.)."
    },
    {
      "id": "ranger_called_shot",
      "name": "Called Shot",
      "tier": "starting",
      "description": "_Dexterity-based ranged precision._ When you attack a defenseless or unsuspecting enemy at range, you can choose to deal your damage OR **name a specific part of the target's body to aim for** and roll+DEX. On a called shot:\n- **Head:** _On 10+_, as 7-9 plus you deal your damage. _On 7-9_, the target is stunned a few moments (cannot act, basically \"stands and drools\").\n- **Arms (or appendages holding something):** _On 10+_, as 7-9 plus you deal your damage. _On 7-9_, the target drops anything they're holding.\n- **Legs:** _On 10+_, as 7-9 plus you deal your damage. _On 7-9_, the target is hobbled and slow moving.\n_On a miss with Called Shot, it's up to the GM - usually your shot goes awry or the enemy is alerted._"
    },
    {
      "id": "ranger_animal_companion",
      "name": "Animal Companion",
      "tier": "starting",
      "description": "You have a faithful animal companion with whom you share a supernatural bond. **Name your animal and choose its species** (examples in the book include wolf, cougar, bear, eagle, dog, hawk, cat, owl, pigeon, rat, mule - or any similar animal). Then determine its attributes:\n- **Base**: Choose a base stat line for your companion:\n- Ferocity +2, Cunning +1, 1 Armor, Instinct +1;\n- Ferocity +2, Cunning +2, 0 Armor, Instinct +1;\n- Ferocity +1, Cunning +2, 1 Armor, Instinct +1;\n- Ferocity +3, Cunning +1, 1 Armor, Instinct +2.\n(Ferocity = damage capability, Cunning = intelligence/training, Instinct = independent action trait.)\n- **Strengths**: Choose a number of **strengths** equal to your companion's Ferocity score. Examples: _fast, burly, huge, calm, adaptable, quick reflexes, tireless, camouflage, ferocious, intimidating, keen senses, stealthy_.\n- **Training**: Your companion is trained in a number of tasks equal to its Cunning score (default includes _fight humanoids_). You can choose additional training such as _hunt, search, scout, guard, fight monsters, perform, labor, travel_.\n- **Weaknesses**: Your companion has a number of **weaknesses** equal to its Instinct. Choose that many from: _flighty, savage, slow, broken, frightening, forgetful, stubborn, lame_.\n_Your animal companion acts according to its stats. It won't talk (usually) but always understands you and strives to obey._"
    },
    {
      "id": "ranger_command",
      "name": "Command",
      "tier": "starting",
      "description": "When you **work with your animal companion** on a task it's trained in, you get specific bonuses:\n- If you **attack** the same target, add your companion's Ferocity to your damage.\n- If you **track** (Hunt and Track) a target, add its Cunning to your roll.\n- If you **take damage**, add its Armor to your armor.\n- If you **Discern Realities**, add its Cunning to your roll.\n- If you **Parley**, add its Cunning to your roll.\n- If someone **Interferes** with you, add its Instinct to their roll (your companion hinders them).\nThese bonuses reflect the companion helping you. They only apply if the companion is actively assisting and trained in that area (per the fiction)."
    },
    {
      "id": "ranger_half_elven",
      "name": "Half-Elven",
      "tier": "advanced",
      "description": "_Special:_ You may only take this move as your **first** advancement (i.e. at level 2). If you have both human and elven heritage, this latent trait now surfaces. You gain the Elf starting move if you had the Human one at creation, or vice versa. (In other words, you get the racial move you _didn't_ take initially. This effectively makes your ranger count as both human and elf for move purposes.)"
    },
    {
      "id": "ranger_wild_empathy",
      "name": "Wild Empathy",
      "tier": "advanced",
      "description": "You can **speak with and understand animals**. (You gain the ability to communicate with any normal animal as if conversing).",
      "mutuallyExclusiveIds": [
        "ranger_wild_speech"
      ]
    },
    {
      "id": "ranger_familiar_prey",
      "name": "Familiar Prey",
      "tier": "advanced",
      "description": "When you **Spout Lore** about a monster, you can roll WIS (instinctive knowledge) instead of INT.",
      "mutuallyExclusiveIds": [
        "ranger_hunters_prey"
      ]
    },
    {
      "id": "ranger_vipers_strike",
      "name": "Viper's Strike",
      "tier": "advanced",
      "description": "When you attack an enemy with two melee weapons at once, add +1d4 damage for your off-hand strike.",
      "mutuallyExclusiveIds": [
        "ranger_vipers_fangs"
      ]
    },
    {
      "id": "ranger_camouflage",
      "name": "Camouflage",
      "tier": "advanced",
      "description": "When you **Keep Still** in natural surroundings, enemies will never spot you until you make a move. (You are effectively invisible as long as you remain still in the wilderness)."
    },
    {
      "id": "ranger_mans_best_friend",
      "name": "Man's Best Friend",
      "tier": "advanced",
      "description": "When you **Allow your animal companion to take a blow for you**, the damage is negated and your companion's Ferocity is reduced to 0 (until it rests). If its Ferocity is already 0, it cannot absorb the hit. When you have a few hours of rest with your companion, its Ferocity returns to normal."
    },
    {
      "id": "ranger_blot_out_the_sun",
      "name": "Blot Out the Sun",
      "tier": "advanced",
      "description": "When you **Volley** (shoot an ranged attack), you can spend extra ammo before rolling. For each 1 ammo spent, you may choose an additional target _in range_ and apply your single attack roll to all chosen targets. (Roll once, apply the result to everyone you targeted)."
    },
    {
      "id": "ranger_well_trained",
      "name": "Well-Trained",
      "tier": "advanced",
      "description": "Choose another training for your animal companion (add one more thing it can do)."
    },
    {
      "id": "ranger_god_amidst_wastes",
      "name": "God Amidst the Wastes",
      "tier": "advanced",
      "description": "Through solitude or revelation, you dedicate yourself to a deity (you can name a new deity or use an established one). You gain the Cleric moves **Commune** and **Cast a Spell** (spellcasting as a Cleric). When you take this move, treat yourself as a level 1 Cleric for spells. Each time you level up thereafter, increase your effective Cleric level by 1. (This is analogous to the Paladin's Divine Favor; it gives the Ranger limited Cleric spellcasting.)"
    },
    {
      "id": "ranger_follow_me",
      "name": "Follow Me",
      "tier": "advanced",
      "description": "When you **Undertake a Perilous Journey**, you can take two roles yourself. Roll separately for each role (for example, you can act as both scout and trailblazer, rolling twice).",
      "mutuallyExclusiveIds": [
        "ranger_strider"
      ]
    },
    {
      "id": "ranger_a_safe_place",
      "name": "A Safe Place",
      "tier": "advanced",
      "description": "When you **Set Camp (Make Camp)** and you are the one organizing watch, everyone takes +1 to their roll to **Take Watch** that night.",
      "mutuallyExclusiveIds": [
        "ranger_a_safer_place"
      ]
    },
    {
      "id": "ranger_wild_speech",
      "name": "Wild Speech",
      "tier": "master",
      "description": "You can speak with and understand **any non-magical, non-planar creature** (any natural creature of any sort). This extends your empathy to all natural beasts (not just normal animals).",
      "prerequisites": {
        "requiresMoveIds": [
          "ranger_wild_empathy"
        ]
      },
      "mutuallyExclusiveIds": [
        "ranger_wild_empathy"
      ]
    },
    {
      "id": "ranger_hunters_prey",
      "name": "Hunter's Prey",
      "tier": "master",
      "description": "When you **Spout Lore** about a monster, you roll WIS instead of INT. _On a 12+_, in addition to the normal effects, you may ask the GM any one question about that creature (it can be something not covered by the lore lists).",
      "prerequisites": {
        "requiresMoveIds": [
          "ranger_familiar_prey"
        ]
      },
      "mutuallyExclusiveIds": [
        "ranger_familiar_prey"
      ]
    },
    {
      "id": "ranger_vipers_fangs",
      "name": "Viper's Fangs",
      "tier": "master",
      "description": "When you attack with two weapons at once, add +1d8 damage (instead of +1d4) for your off-hand strike.",
      "prerequisites": {
        "requiresMoveIds": [
          "ranger_vipers_strike"
        ]
      },
      "mutuallyExclusiveIds": [
        "ranger_vipers_strike"
      ]
    },
    {
      "id": "ranger_smaugs_belly",
      "name": "Smaug's Belly",
      "tier": "master",
      "description": "When you know a target's weakest point (presumably via discernment or past knowledge), your arrows gain +2 piercing against that target. (Your ranged attacks ignore 2 points of its armor)."
    },
    {
      "id": "ranger_strider",
      "name": "Strider",
      "tier": "master",
      "description": "When you Undertake a Perilous Journey, you can take two roles as before, but now **roll twice and use the better result for both roles**.",
      "prerequisites": {
        "requiresMoveIds": [
          "ranger_follow_me"
        ]
      },
      "mutuallyExclusiveIds": [
        "ranger_follow_me"
      ]
    },
    {
      "id": "ranger_a_safer_place",
      "name": "A Safer Place",
      "tier": "master",
      "description": "When you Set Camp and organize the watch, everyone gets +1 to Take Watch as before. Additionally, after a night in this camp, everyone gets +1 forward (the next day).",
      "prerequisites": {
        "requiresMoveIds": [
          "ranger_a_safe_place"
        ]
      },
      "mutuallyExclusiveIds": [
        "ranger_a_safe_place"
      ]
    },
    {
      "id": "ranger_observant",
      "name": "Observant",
      "tier": "master",
      "description": "When you **Hunt and Track**, on any hit (7+), you may also immediately ask one question from the **Discern Realities** list about the creature you're tracking (for free)."
    },
    {
      "id": "ranger_special_trick",
      "name": "Special Trick",
      "tier": "master",
      "description": "Choose one move from another class. **You can only use that move when working alongside your animal companion.** If the situation doesn't involve your companion, you can't use the move. (This represents your pet enabling a trick learned from another class.)"
    },
    {
      "id": "ranger_unnatural_ally",
      "name": "Unnatural Ally",
      "tier": "master",
      "description": "Your animal companion is not an ordinary animal at all, but a **monster**. Describe its monstrous nature. Increase its Ferocity by +2 and Instinct by +1, and give it a new training reflecting its monstrous abilities. _Note:_ Because this move makes your companion a \"monster\" instead of a natural animal, it may have implications in the fiction - for example, a Druid's **Spirit Tongue** (which lets them speak with natural animals) would **not** work on your monster companion (e.g. if it's a dragon, dinosaur, demon, etc.). In other words, **Unnatural Ally** is effectively the \"dinosaur companion\" move - it allows the ranger to have a companion that is outside the normal animal kingdom (with corresponding benefits and drawbacks)."
    }
  ],
  "Thief": [
    {
      "id": "thief_halfling",
      "name": "Halfling",
      "tier": "race",
      "description": "When you attack with a ranged weapon, deal +2 damage (tiny but deadly!).",
      "prerequisites": {
        "requiresRace": [
          "Halfling"
        ]
      }
    },
    {
      "id": "thief_human",
      "name": "Human",
      "tier": "race",
      "description": "You are a professional criminal. When you **Spout Lore** or **Discern Realities** about criminal activities (underworld events, traps, crimes, treasure, etc.), you get +1 to the roll.",
      "prerequisites": {
        "requiresRace": [
          "Human"
        ]
      }
    },
    {
      "id": "thief_trap_expert",
      "name": "Trap Expert",
      "tier": "starting",
      "description": "When you spend a moment to survey a dangerous area for traps, roll+DEX. _On 10+_, hold 3. _On 7-9_, hold 1. You can spend 1 hold to ask the GM any of these questions as you move through the area (1-for-1): **Is there a trap here and if so, what activates it?** - **What does the trap do when activated?** - **What else is hidden here?**."
    },
    {
      "id": "thief_tricks_of_the_trade",
      "name": "Tricks of the Trade",
      "tier": "starting",
      "description": "When you pick locks or pockets, or disable a trap, roll+DEX. _On 10+_, you do it with no trouble. _On 7-9_, you still do it but the GM will offer you a hard choice or cost: e.g. you set off the trap but get clear, you get spotted or leave evidence, etc. (The text: GM will offer two options between suspicion, danger, or cost)."
    },
    {
      "id": "thief_backstab",
      "name": "Backstab",
      "tier": "starting",
      "description": "When you attack a surprised or defenseless enemy in melee, you can choose to deal your damage OR roll+DEX. _On 10+_, choose two from the list. _On 7-9_, choose one: **(a)** You don't get into melee with them (you strike from the shadows and stay out of reach), **(b)** You deal your damage +1d6, **(c)** You create an advantage (+1 forward to you or an ally acting on it), **(d)** Reduce the target's armor by 1 (until they repair it)."
    },
    {
      "id": "thief_flexible_morals",
      "name": "Flexible Morals",
      "tier": "starting",
      "description": "When someone tries to **discern your alignment**, you can tell them any alignment you like. (You can lie about your alignment and magically/mentally it registers as that - effectively you're immune to alignment detection)."
    },
    {
      "id": "thief_poisoner",
      "name": "Poisoner",
      "tier": "starting",
      "description": "You have mastered the care and use of a poison. **Choose one poison** from the list below; you start with three uses of it. That poison is not dangerous _to you_, meaning you can handle or ingest it safely. Whenever you have some downtime and a safe place, you can resupply by brewing 3 doses of your chosen poison for free (since you know how to gather ingredients or have a kit). You can also **brew other poisons** if you find the recipes, but by default you start with one type you're adept with. The standard poisons:\n- _Oil of Tagit_ (applied): The target falls into a light sleep (applied to a surface or ingested, it knocks them out).\n- _Bloodweed_ (touch): The target's damage rolls are -1d4 ongoing until cured (a contact poison that weakens their attacks).\n- _Goldenroot_ (applied): The target **treats the next creature they see as a trusted ally** until proved otherwise. (In other words, it causes friendly charmed behavior toward the first person/being they lay eyes on.)\n- _Serpent's Tears_ (touch): Anyone dealing damage to the target rolls twice and takes the better result (effectively others gain _advantage_ on damage against the poisoned target).\n_(The Thief can later learn additional poisons via moves or fiction. Applied = must be ingested or smeared on something that touches skin; Touch = just contact is enough. Note: The Poisoner move makes_ _your chosen poison safe for you_ _to handle or even taste - you are immune to it.)_"
    },
    {
      "id": "thief_cheap_shot",
      "name": "Cheap Shot",
      "tier": "advanced",
      "description": "When using a precise or hand weapon, your Backstab deal an extra +1d6 damage (on top of the normal extra damage option). In other words, whenever you Backstab, add +1d6 damage automatically.",
      "mutuallyExclusiveIds": [
        "thief_dirty_fighter"
      ]
    },
    {
      "id": "thief_cautious",
      "name": "Cautious",
      "tier": "advanced",
      "description": "When using **Trap Expert**, you always get +1 hold, even on a miss (so on a 6-, you still get 1 hold to ask a question).",
      "mutuallyExclusiveIds": [
        "thief_extremely_cautious"
      ]
    },
    {
      "id": "thief_wealth_and_taste",
      "name": "Wealth and Taste",
      "tier": "advanced",
      "description": "When you make a show of flashing around your most valuable possession, choose one person present. That person will do anything reasonable to get it. (They become temporarily obsessed with obtaining your flashy valuable or one like it)."
    },
    {
      "id": "thief_shoot_first",
      "name": "Shoot First",
      "tier": "advanced",
      "description": "You're never caught by surprise. If an enemy would get the drop on you, you act first instead. (Mechanically, if an ambush or surprise attack would occur, you get to react before the enemy can execute it)."
    },
    {
      "id": "thief_poison_master",
      "name": "Poison Master",
      "tier": "advanced",
      "description": "After you've used a poison **once**, it is no longer dangerous for you to use (meaning you become immune to any poison you have used before). Essentially, any poison you've experienced or applied in the past becomes like your chosen poison - safe for you."
    },
    {
      "id": "thief_envenom",
      "name": "Envenom",
      "tier": "advanced",
      "description": "You can apply even complex poisons with just a pinprick. When you apply a poison that is not dangerous to you (i.e. one you're immune to) to your weapon, it counts as a _touch_ poison instead of _applied_. (This means even poisons normally needing ingestion or coating on food can be delivered by a mere scratch of your blade)."
    },
    {
      "id": "thief_brewer",
      "name": "Brewer",
      "tier": "advanced",
      "description": "When you have time and safety to brew potions or poisons, you can create three doses of **any one poison you've used before** (not just your starting poison) without cost. (You've expanded your expertise to all poisons you've encountered).",
      "mutuallyExclusiveIds": [
        "thief_alchemist"
      ]
    },
    {
      "id": "thief_underdog",
      "name": "Underdog",
      "tier": "advanced",
      "description": "When you're **outnumbered**, you have +1 armor. (\"Outnumbered\" generally means 2-to-1 or worse odds against you in a fight).",
      "mutuallyExclusiveIds": [
        "thief_serious_underdog"
      ]
    },
    {
      "id": "thief_connections",
      "name": "Connections",
      "tier": "advanced",
      "description": "When you put out word in criminal circles about something you want or need, roll+CHA. _On 10+_, someone has it, just for you - no strings attached (or at least, easily obtained). _On 7-9_, you'll have to settle for something close or deal with strings attached - the GM will tell you what you get or what it's going to cost/trouble."
    },
    {
      "id": "thief_dirty_fighter",
      "name": "Dirty Fighter",
      "tier": "master",
      "description": "When using a precise or hand weapon, your Backstab deals an extra +1d8 damage, **and** all your other attacks (not just backstabs) deal +1d4 damage as well.",
      "prerequisites": {
        "requiresMoveIds": [
          "thief_cheap_shot"
        ]
      },
      "mutuallyExclusiveIds": [
        "thief_cheap_shot"
      ]
    },
    {
      "id": "thief_extremely_cautious",
      "name": "Extremely Cautious",
      "tier": "master",
      "description": "When using Trap Expert, you always get +1 hold (as before). Also, _on a 12+_ with Trap Expert, you get 3 hold **and** the **next time you approach a trap**, the GM must immediately tell you what it does, what triggers it, who set it, _and_ how you could use it to your advantage.",
      "prerequisites": {
        "requiresMoveIds": [
          "thief_cautious"
        ]
      },
      "mutuallyExclusiveIds": [
        "thief_cautious"
      ]
    },
    {
      "id": "thief_alchemist",
      "name": "Alchemist",
      "tier": "master",
      "description": "When you have time and safety to brew, you can create three doses of any poison you've used before (as before). **Alternatively**, you can describe a brand new poison effect you'd like to create. The GM will tell you one or more caveats that apply: e.g. _It will only work under specific circumstances; The best you can manage is a weaker version; It'll take a while to take effect; It'll have obvious side effects_. (You can then decide if you still want to brew that poison under those conditions.)",
      "prerequisites": {
        "requiresMoveIds": [
          "thief_brewer"
        ]
      },
      "mutuallyExclusiveIds": [
        "thief_brewer"
      ]
    },
    {
      "id": "thief_serious_underdog",
      "name": "Serious Underdog",
      "tier": "master",
      "description": "You always have +1 armor. When outnumbered, you have +2 armor instead.",
      "prerequisites": {
        "requiresMoveIds": [
          "thief_underdog"
        ]
      },
      "mutuallyExclusiveIds": [
        "thief_underdog"
      ]
    },
    {
      "id": "thief_evasion",
      "name": "Evasion",
      "tier": "master",
      "description": "When you **Defy Danger** and get a **12+**, you \"transcend\" the danger - not only do you manage what you set out to do, the GM will offer you an extra benefit, a moment of grace or beauty beyond expectations."
    },
    {
      "id": "thief_strong_arm_true_aim",
      "name": "Strong Arm, True Aim",
      "tier": "master",
      "description": "You can throw _any_ melee weapon as if it were a thrown weapon for purposes of the **Volley** move. (It still counts as one ammo - and note: \"A thrown melee weapon is gone; you can never choose to reduce ammo on a 7-9,\" meaning if you throw your sword, you can't just reduce ammo - that weapon is lost or stuck until retrieved)."
    },
    {
      "id": "thief_escape_route",
      "name": "Escape Route",
      "tier": "master",
      "description": "When things go bad and you need a quick way out, name your escape route and roll+DEX. _On 10+_, you're gone - you make it out of the situation, no harm. _On 7-9_, you can stay or go, **but if you go, it costs you** - you either leave something behind or take something with you that the GM will declare. (Basically on 7-9 you escape but with a complication)."
    },
    {
      "id": "thief_disguise",
      "name": "Disguise",
      "tier": "master",
      "description": "Given time and materials, you can create a disguise that will fool anyone into thinking you're a different creature of roughly similar size/shape. Only your actions might give you away; visually you are indistinguishable from the real thing. (E.g. you can impersonate an orc, or a specific person, etc., as long as you don't act out of character)."
    },
    {
      "id": "thief_heist",
      "name": "Heist",
      "tier": "master",
      "description": "When you take time to plan a caper to steal something, name your target (the item or person to steal from) and ask the GM **three questions** from the list. When acting on the answers, you and your allies get +1 forward. Questions: **Who will notice it's missing?** - **What's its most powerful security or defense?** - **Who else wants it?** - **Who will come after it?**. (This move gives you intel to execute a theft with an edge.)"
    }
  ],
  "Bard": [
    {
      "id": "bard_elf",
      "name": "Elf",
      "tier": "race",
      "description": "When you enter an important location (your call if it's \"important\"), you can ask the GM for one fact from the history of that location. (Elves have long lifespans and deep lore, so you recall some historical tidbit about the place).",
      "prerequisites": {
        "requiresRace": [
          "Elf"
        ]
      }
    },
    {
      "id": "bard_human",
      "name": "Human",
      "tier": "race",
      "description": "When you first enter a civilized settlement, someone who respects the custom of hospitality to minstrels will take you in as their guest. (Basically, as a human Bard, you can often find free lodging or a friendly host in any town because of bardic tradition).",
      "prerequisites": {
        "requiresRace": [
          "Human"
        ]
      }
    },
    {
      "id": "bard_arcane_art",
      "name": "Arcane Art",
      "tier": "starting",
      "description": "Through music or performance, you weave magic. When you **perform** an arcane song (or poetics), choose an ally and an effect: _(a)_ Heal 1d8 damage, _(b)_ +1d4 forward to damage, _(c)_ Cure them of one enchantment or illusion affecting their mind, or _(d)_ The next time someone assists the target with Aid, they get +2 instead of +1. Then roll+CHA. _On 10+_, the ally gets the chosen effect, no complications. _On 7-9_, the spell still works but you draw unwanted attention or your magic affects others besides the target (GM's choice on what happens)."
    },
    {
      "id": "bard_bardic_lore",
      "name": "Bardic Lore",
      "tier": "starting",
      "description": "You are a font of obscure knowledge. Choose an area of expertise: _Spells and Magicks; The Dead and Undead; Grand Histories of the Known World; A Bestiary of Unusual Creatures; The Planar Spheres; Legends of Heroes Past; Gods and Their Servants_. When you first encounter an important creature, location, or item related to your chosen lore, you can ask the GM one question about it and the GM will answer truthfully. The GM may then ask you _\"How do you know this?\"_ - respond with the tale or song in which you learned that information."
    },
    {
      "id": "bard_charming_and_open",
      "name": "Charming and Open",
      "tier": "starting",
      "description": "When you speak frankly with someone, you can ask their player one question from the list below, and they must answer honestly. Then **they** may ask you one question from the list (which you must answer honestly). The questions: **Whom do you serve?** - **What do you wish I would do?** - **How can I get you to \\_**\\_**?** - **What are you really feeling right now?** - **What do you most desire?**. (This move represents the bard's ability to get someone to open up in conversation.)"
    },
    {
      "id": "bard_port_in_the_storm",
      "name": "A Port in the Storm",
      "tier": "starting",
      "description": "When you return to a civilized settlement you've visited before, you can tell the GM **when** you were last here. The GM will describe how it has changed since your last visit. (This doesn't require a roll; it's just a way to establish some history and get an update on the place.)"
    },
    {
      "id": "bard_healing_song",
      "name": "Healing Song",
      "tier": "advanced",
      "description": "When you heal an ally with Arcane Art, you heal +1d8 HP extra.",
      "mutuallyExclusiveIds": [
        "bard_healing_chorus"
      ]
    },
    {
      "id": "bard_vicious_cacophony",
      "name": "Vicious Cacophony",
      "tier": "advanced",
      "description": "When you grant bonus damage to an ally with Arcane Art, the bonus is +1d4 damage extra (so effectively +2d4 total).",
      "mutuallyExclusiveIds": [
        "bard_vicious_blast"
      ]
    },
    {
      "id": "bard_it_goes_to_eleven",
      "name": "It Goes to Eleven",
      "tier": "advanced",
      "description": "When you **unleash a crazed performance** (a shredding guitar solo, a deafening horn blast, etc.) on a target, roll+CHA. _On 10+_, the target attacks their nearest ally in range in a frenzy. _On 7-9_, they do so, but **also** you draw their attention and ire (after that one attack they're coming for you)."
    },
    {
      "id": "bard_metal_hurlant",
      "name": "Metal Hurlant",
      "tier": "advanced",
      "description": "When you **shout or play a note with great force**, choose a target and roll+CON. _On 10+_, the target takes 1d10 damage and is deafened for a few minutes. _On 7-9_, the target still takes damage, but the effect is out of control - the GM chooses an additional nearby target (could be an ally or something else) that also takes the effect."
    },
    {
      "id": "bard_a_little_help",
      "name": "A Little Help From My Friends",
      "tier": "advanced",
      "description": "When you successfully **Aid** someone, they get +1 _forward_ as usual, and _you_ also take +1 forward. (So helping others also hypes you up)."
    },
    {
      "id": "bard_eldritch_tones",
      "name": "Eldritch Tones",
      "tier": "advanced",
      "description": "Your Arcane Art is _potent_. When using Arcane Art, you can choose **two effects** instead of one (affecting the same target or different targets, your choice). For example, you could heal an ally _and_ remove an enchantment at the same time.",
      "mutuallyExclusiveIds": [
        "bard_eldritch_chord"
      ]
    },
    {
      "id": "bard_duelists_parry",
      "name": "Duelist's Parry",
      "tier": "advanced",
      "description": "When you **Hack and Slash**, you take +1 armor forward (basically, your fancy swordplay or footwork gives you +1 Armor against the next attack).",
      "mutuallyExclusiveIds": [
        "bard_duelists_block"
      ]
    },
    {
      "id": "bard_bamboozle",
      "name": "Bamboozle",
      "tier": "advanced",
      "description": "When you **Parley** with someone, on a 7+ you also take +1 forward with them (regardless of the result, as long as it wasn't a total miss). So even if they don't fully give you what you want, you've confused or charmed them enough to get an edge.",
      "mutuallyExclusiveIds": [
        "bard_con"
      ]
    },
    {
      "id": "bard_multiclass_dabbler",
      "name": "Multiclass Dabbler",
      "tier": "advanced",
      "description": "Take one move from another class list (treat your level as one lower to determine eligibility)."
    },
    {
      "id": "bard_multiclass_initiate",
      "name": "Multiclass Initiate",
      "tier": "advanced",
      "description": "(Yes, the Bard uniquely gets two multiclass moves at lower levels) Take another move from another class (treat level as one lower). This allows a second off-class move while still in the 2-5 level range."
    },
    {
      "id": "bard_healing_chorus",
      "name": "Healing Chorus",
      "tier": "master",
      "description": "When you heal with Arcane Art, heal +2d8 HP extra.",
      "prerequisites": {
        "requiresMoveIds": [
          "bard_healing_song"
        ]
      },
      "mutuallyExclusiveIds": [
        "bard_healing_song"
      ]
    },
    {
      "id": "bard_vicious_blast",
      "name": "Vicious Blast",
      "tier": "master",
      "description": "When you grant bonus damage with Arcane Art, it's +2d4 damage extra.",
      "prerequisites": {
        "requiresMoveIds": [
          "bard_vicious_cacophony"
        ]
      },
      "mutuallyExclusiveIds": [
        "bard_vicious_cacophony"
      ]
    },
    {
      "id": "bard_unforgettable_face",
      "name": "Unforgettable Face",
      "tier": "master",
      "description": "When you meet someone you've met before after some time apart, you take +1 forward against them (they remember you - for good or ill - giving you an edge)."
    },
    {
      "id": "bard_reputation",
      "name": "Reputation",
      "tier": "master",
      "description": "When you first meet someone who's heard songs or tales about you, roll+CHA. _On 10+_, you get to tell the GM two things they've heard about you (and those are true, or at least believed). _On 7-9_, you tell the GM one true thing they've heard, **and** the GM tells you one thing _they've_ heard (which might be an exaggeration or lie)."
    },
    {
      "id": "bard_eldritch_chord",
      "name": "Eldritch Chord",
      "tier": "master",
      "description": "When you use Arcane Art, you still choose two effects, **and** you may choose one of those effects to **double** in potency. (For example, if one effect was healing, you could double the healing; if one was +damage, double the bonus, etc.).",
      "prerequisites": {
        "requiresMoveIds": [
          "bard_eldritch_tones"
        ]
      },
      "mutuallyExclusiveIds": [
        "bard_eldritch_tones"
      ]
    },
    {
      "id": "bard_ear_for_magic",
      "name": "An Ear for Magic",
      "tier": "master",
      "description": "When you hear an enemy cast a spell, you immediately know the spell's name and effects. Take +1 forward when acting on that knowledge."
    },
    {
      "id": "bard_devious",
      "name": "Devious",
      "tier": "master",
      "description": "When using **Charming and Open**, you get to **add an extra question** you can ask: \"How are you vulnerable to me?\" The person must answer honestly. (Also, when you use Charming & Open with this move, they _cannot_ ask _you_ that question in return.)."
    },
    {
      "id": "bard_duelists_block",
      "name": "Duelist's Block",
      "tier": "master",
      "description": "When you Hack and Slash, you take +2 armor forward (instead of +1).",
      "prerequisites": {
        "requiresMoveIds": [
          "bard_duelists_parry"
        ]
      },
      "mutuallyExclusiveIds": [
        "bard_duelists_parry"
      ]
    },
    {
      "id": "bard_con",
      "name": "Con",
      "tier": "master",
      "description": "When you Parley, on a 7+ you get +1 forward with them **and** you may ask their player one question (from Charming & Open list or similarly personal) which they must answer truthfully.",
      "prerequisites": {
        "requiresMoveIds": [
          "bard_bamboozle"
        ]
      },
      "mutuallyExclusiveIds": [
        "bard_bamboozle"
      ]
    },
    {
      "id": "bard_multiclass_master",
      "name": "Multiclass Master",
      "tier": "master",
      "description": "Take a move from another class (treat level as one lower). (This is the Bard's third off-class move, available at 6+.)."
    }
  ],
  "Cleric": [
    {
      "id": "cleric_dwarf",
      "name": "Dwarf",
      "tier": "race",
      "description": "You are one with stone. When you **Commune** (pray for spells), you are also granted a special version of the spell **Words of the Unspeaking** as a rote cantrip, which only works on stone. (In essence, Dwarven clerics can speak to stone as a minor divination.)",
      "prerequisites": {
        "requiresRace": [
          "Dwarf"
        ]
      }
    },
    {
      "id": "cleric_human",
      "name": "Human",
      "tier": "race",
      "description": "Your faith is broad and diverse. Choose one Wizard spell; you can cast and be granted that spell as if it were a Cleric spell. (This lets a human cleric pick one spell from the wizard list and treat it as part of their clerical magic repertoire.)",
      "prerequisites": {
        "requiresRace": [
          "Human"
        ]
      }
    },
    {
      "id": "cleric_deity",
      "name": "Deity",
      "tier": "starting",
      "description": "You serve and worship a specific deity (or cosmic power) who grants you miracles. Give your god a name and choose a Domain and a Precept:\n- **Domain:** Choose one aspect that your deity governs (options: _Healing and Restoration; Bloody Conquest; Civilization; Knowledge and Hidden Things; The Downtrodden and Forgotten; What Lies Beneath_, or make up a similar domain). This domain will influence the kinds of miracles and guidance your deity provides.\n- **Precept (Petition):** Choose what your religion demands of its followers (options: _Suffering_ (you gain favor through enduring or inflicting suffering), _Gaining Secrets_, _Offering_ (sacrifices), _Personal Victory_ (trials by combat), etc. - each corresponds to a Petition). The precept defines how you get your god's attention - see **Divine Guidance** below."
    },
    {
      "id": "cleric_divine_guidance",
      "name": "Divine Guidance",
      "tier": "starting",
      "description": "When you **petition your deity** according to the precept of your religion (for example, offering a sacrifice, or seeking suffering, etc.), you are granted some useful knowledge or boon related to your deity's domain. The GM will tell you what. (This is a broad move - basically, if you perform the required ritual action, you get a clue, vision, or minor aid from your god relevant to the situation)."
    },
    {
      "id": "cleric_turn_undead",
      "name": "Turn Undead",
      "tier": "starting",
      "description": "When you hold aloft your holy symbol and call on your deity to repel undead, roll+WIS. _On 7+_, so long as you continue to pray and brandish your holy symbol, no undead may come close to you - they are held at bay. _On 10+_, in addition, you **daze intelligent undead** and **cause mindless undead to flee**. (The effect lasts until you stop praying or take aggressive action; intelligent undead can still find ways to harm you from afar.) If you _attack_ any undead or stop praying, the effect ends."
    },
    {
      "id": "cleric_commune",
      "name": "Commune",
      "tier": "starting",
      "description": "When you spend uninterrupted time (about an hour) in quiet communion with your deity, you **lose any spells you had prepared**, then **prepare new spells of your choice** from your deity's list (the Cleric spell list) whose total levels _do not exceed your level+1_, and none of which is higher level than your level. You automatically prepare all of your rotes (cantrips) as well - rotes don't count against your limit. _(This works exactly like the Wizard's prepare spells, but flavored for clerics - essentially \"praying for spells.\" E.g. a level 1 cleric (1+1=2) can prepare two level-1 spells, or one level-2 if they could cast level 2, etc.)_"
    },
    {
      "id": "cleric_cast_a_spell",
      "name": "Cast a Spell (Wis)",
      "tier": "starting",
      "description": "When you unleash a spell granted by your deity, roll+WIS. _On 10+_, the spell is successfully cast and your deity does not revoke it, so you may cast it again later. _On 7-9_, the spell is cast, **but choose one**: **Draw unwelcome attention** or put yourself in a spot (GM describes how), **or** your casting distances you from your deity - you take -1 ongoing to cast spells until the next time you Commune, **or** after casting, the spell is revoked by your deity (you cannot cast that spell again until you Commune to prepare it anew). _Note:_ Ongoing spells sometimes inflict a -1 to cast further spells as well (if the spell says \"ongoing\", maintaining it can impose a penalty). A _miss_ on Cast a Spell can have worse effects as determined by the GM (often the spell misfires or is lost)."
    },
    {
      "id": "cleric_chosen_one",
      "name": "Chosen One",
      "tier": "advanced",
      "description": "Choose one spell. You are granted that spell as if it were one level lower for you. (Effectively, you can treat a particular spell as if it were one level less - allowing you to prepare higher-level magic earlier.) For example, if you choose a level 3 spell as your \"Chosen One\" spell, once you hit level 2 (so you can cast level 2 spells), you could cast that level 3 spell as if it were level 2."
    },
    {
      "id": "cleric_invigorate",
      "name": "Invigorate",
      "tier": "advanced",
      "description": "When you heal someone (via magic or mundane means), they take +2 forward to damage. (Your healing fills them with holy vigor - their next attacks do +2 damage)."
    },
    {
      "id": "cleric_scales_of_life_and_death",
      "name": "The Scales of Life and Death",
      "tier": "advanced",
      "description": "When someone _else_ takes their **Last Breath** in your presence (i.e. they're dying), they take +1 to the roll. (Your deity subtly helps tip the scales to keep them alive)."
    },
    {
      "id": "cleric_serenity",
      "name": "Serenity",
      "tier": "advanced",
      "description": "When you cast a spell, you ignore the first -1 penalty from any ongoing spells you have. (So you can maintain one ongoing spell without the usual -1 casting penalty).",
      "mutuallyExclusiveIds": [
        "cleric_providence"
      ]
    },
    {
      "id": "cleric_first_aid",
      "name": "First Aid",
      "tier": "advanced",
      "description": "**Cure Light Wounds** (the spell) is considered a rote for you, and thus doesn't count against your prepared spells limit. (This means effectively you always have the basic healing spell available for free.)"
    },
    {
      "id": "cleric_divine_intervention",
      "name": "Divine Intervention",
      "tier": "advanced",
      "description": "When you **Commune**, you get 1 hold (in addition to preparing spells). You can spend that hold, one-for-one, when you or an ally takes damage to call upon your deity to intervene. The intervention **negates the damage** entirely, as appropriate to your deity (e.g. a sudden gust of wind, a radiant barrier, etc.). You lose any unspent hold when you Commune again (and you only ever have max 1 hold from this move at a time).",
      "mutuallyExclusiveIds": [
        "cleric_divine_invincibility"
      ]
    },
    {
      "id": "cleric_penitent",
      "name": "Penitent",
      "tier": "advanced",
      "description": "When you take damage and embrace the pain, you may _immediately_ take an additional +1d4 damage (ignoring armor) to yourself. If you do, take +1 forward to cast a spell. (Basically, you hurt yourself further to prove your faith, gaining a bonus on your next spell).",
      "mutuallyExclusiveIds": [
        "cleric_martyr"
      ]
    },
    {
      "id": "cleric_empower",
      "name": "Empower",
      "tier": "advanced",
      "description": "When you cast a spell, _on a 10+_ you have the option to choose from the 7-9 _Cast a Spell_ list as if you rolled a 7-9. If you do, you _also_ get to choose one of these effects: **The spell's effects are doubled** in potency, **or** **the spell's targets are doubled** in number. (So basically, you willingly accept a minor setback to supercharge the spell.)",
      "mutuallyExclusiveIds": [
        "cleric_greater_empower"
      ]
    },
    {
      "id": "cleric_orison_for_guidance",
      "name": "Orison for Guidance",
      "tier": "advanced",
      "description": "When you **sacrifice something of value** to your deity and pray for guidance, your deity will tell you what it would have you do (some guidance or command relevant to your situation). If you do as asked, mark XP. (Essentially an incentive to obey your deity's immediate wish.)"
    },
    {
      "id": "cleric_divine_protection",
      "name": "Divine Protection",
      "tier": "advanced",
      "description": "When you wear no armor or shield, you have 2 armor (through divine grace). This",
      "mutuallyExclusiveIds": [
        "cleric_divine_armor"
      ]
    },
    {
      "id": "cleric_devoted_healer",
      "name": "Devoted Healer",
      "tier": "advanced",
      "description": "When you heal someone else, add your level to the amount healed. (So higher-level clerics become significantly stronger healers.)"
    },
    {
      "id": "cleric_anointed",
      "name": "Anointed",
      "tier": "master",
      "description": "Choose one additional spell (in addition to the one from Chosen One). You are granted that spell as if it were one level lower as well. (Now two spells are effectively one level easier for you to cast.)",
      "prerequisites": {
        "requiresMoveIds": [
          "cleric_chosen_one"
        ]
      }
    },
    {
      "id": "cleric_apotheosis",
      "name": "Apotheosis",
      "tier": "master",
      "description": "The first time you spend time in prayer after gaining this move, choose a physical feature associated with your deity (e.g. glowing eyes, angelic wings, bark-like skin - whatever fits your god's iconography). When you finish that prayer session, you **permanently gain** that physical feature. (You are becoming more like your deity - largely a narrative effect, though it could have fictional benefits or drawbacks)."
    },
    {
      "id": "cleric_reaper",
      "name": "Reaper",
      "tier": "master",
      "description": "When you take time after a conflict to dedicate your victory to your deity and tend to the fallen (performing last rites, etc.), take +1 forward. (This is a small reward for being pious after battle)."
    },
    {
      "id": "cleric_providence",
      "name": "Providence",
      "tier": "master",
      "description": "You ignore the -1 penalty from **two** ongoing spells you maintain (instead of one).",
      "prerequisites": {
        "requiresMoveIds": [
          "cleric_serenity"
        ]
      },
      "mutuallyExclusiveIds": [
        "cleric_serenity"
      ]
    },
    {
      "id": "cleric_greater_first_aid",
      "name": "Greater First Aid",
      "tier": "master",
      "description": "**Cure Moderate Wounds** (a higher-level healing spell) is now a rote for you and doesn't count against your prepared spells limit. (So now both Light and Moderate healing spells are always available.)",
      "prerequisites": {
        "requiresMoveIds": [
          "cleric_first_aid"
        ]
      }
    },
    {
      "id": "cleric_divine_invincibility",
      "name": "Divine Invincibility",
      "tier": "master",
      "description": "When you Commune, you gain 2 hold (instead of 1). You can spend hold to negate damage as before; you lose unused hold when you Commune again.",
      "prerequisites": {
        "requiresMoveIds": [
          "cleric_divine_intervention"
        ]
      },
      "mutuallyExclusiveIds": [
        "cleric_divine_intervention"
      ]
    },
    {
      "id": "cleric_martyr",
      "name": "Martyr",
      "tier": "master",
      "description": "When you take damage and embrace the pain, you may take an extra +1d4 damage (ignoring armor) as before. If you do, you take +1 forward to cast a spell **and** add your level to any damage _you_ deal or _you_ heal with that spell. (So the bonus applies to both healing and harm done by the spell.)",
      "prerequisites": {
        "requiresMoveIds": [
          "cleric_penitent"
        ]
      },
      "mutuallyExclusiveIds": [
        "cleric_penitent"
      ]
    },
    {
      "id": "cleric_divine_armor",
      "name": "Divine Armor",
      "tier": "master",
      "description": "When unarmored and unshielded, you have 3 armor (instead of 2).",
      "prerequisites": {
        "requiresMoveIds": [
          "cleric_divine_protection"
        ]
      },
      "mutuallyExclusiveIds": [
        "cleric_divine_protection"
      ]
    },
    {
      "id": "cleric_greater_empower",
      "name": "Greater Empower",
      "tier": "master",
      "description": "When you cast a spell, _on 10-11_ (note: extending the range) you can choose to treat it like a 7-9 result to also pick an effect (as before). Additionally, _on a 12+_ you get to choose one of the \"empower\" effects for free _without_ having to accept a downside. The empower effects remain: double the spell's targets or double its effects.",
      "prerequisites": {
        "requiresMoveIds": [
          "cleric_empower"
        ]
      },
      "mutuallyExclusiveIds": [
        "cleric_empower"
      ]
    },
    {
      "id": "cleric_multiclass_dabbler",
      "name": "Multiclass Dabbler",
      "tier": "master",
      "description": "(The Cleric at 6-10 gets access to the generic multiclass move, if they didn't take it earlier.) Gain one move from another class list, treating your level as one lower."
    }
  ],
  "Druid": [
    {
      "id": "druid_elf",
      "name": "Elf",
      "tier": "race",
      "description": "\"The sap of the elder trees flows within you.\" In addition to any other Land you are attuned to, **The Great Forest** is always considered one of your lands. (So elf druids automatically count the great forests as an environment for shapeshifting).",
      "prerequisites": {
        "requiresRace": [
          "Elf"
        ]
      }
    },
    {
      "id": "druid_human",
      "name": "Human",
      "tier": "race",
      "description": "\"As your people learned to bind animals to field and farm, so are you bound to them.\" You may always take the shape of any domesticated animal, in addition to your normal options. (This effectively adds _Farm/domestic animals_ to your shapeshift repertoire.)",
      "prerequisites": {
        "requiresRace": [
          "Human"
        ]
      }
    },
    {
      "id": "druid_halfling",
      "name": "Halfling",
      "tier": "race",
      "description": "\"You sing the healing songs of spring and brook.\" When you **Make Camp**, you and your allies each heal +1d6 HP (on top of normal recovery).",
      "prerequisites": {
        "requiresRace": [
          "Halfling"
        ]
      }
    },
    {
      "id": "druid_born_of_the_soil",
      "name": "Born of the Soil",
      "tier": "starting",
      "description": "You learned your magic in a place whose spirits are particularly strong. The spirits of that land have marked you. **Choose one environment (Land) from the list**: _Great Forests, Whispering Plains, Vast Desert, Stinking Mire, River Delta, Depths of the Earth, Sapphire Islands, Open Sea, Towering Mountains, Frozen North, Blasted Wasteland_, etc. That Land is the one you are attuned to; when shapeshifting, you may take the form of any animal native to that land. Additionally, **choose a physical manifestation (Tell)** that marks you as connected to that land's spirits - e.g. antlers like a stag, cat-like eyes, feathers for hair, bark-like skin, etc. _Your Tell is an aspect of your appearance that remains in_ _every form_ _you take_. (It's a distinctive feature that carries over even when shapeshifted.)"
    },
    {
      "id": "druid_by_nature_sustained",
      "name": "By Nature Sustained",
      "tier": "starting",
      "description": "You **don't need to eat or drink**. You can survive on the power of the Land itself. Whenever a move tells you to mark off a ration, ignore it."
    },
    {
      "id": "druid_spirit_tongue",
      "name": "Spirit Tongue",
      "tier": "starting",
      "description": "The speech of animals (the growls, chirps, whistles, etc. of the wild) is understandable to you as language. You can **understand any animal native to your Land**, or akin to one whose essence you have studied (see Studied Essence), and they can understand you. You cannot speak to monsters or purely magical creatures (unless you later take moves to allow that)."
    },
    {
      "id": "druid_shapeshifter",
      "name": "Shapeshifter",
      "tier": "starting",
      "description": "When you call upon the spirits of the Land to change your shape, roll+WIS. _On 10+_, hold 3. _On 7-9_, hold 2. _On a miss_, hold 1 **and** the GM will also introduce a complication or danger. While shapeshifted, you can spend 1 hold to **make a move the animal could normally do**, such as \"pounce on an enemy,\" \"fly to a high branch,\" \"maul someone,\" etc., using your animal's inherent abilities. When you run out of hold, you revert to your normal form. You also revert if you **choose** to at any time. _Note:_ You still use your normal stats for any rolls, but some moves may be impossible or harder if the form is not suited (e.g. a housecat will struggle to **Hack & Slash** an ogre). The GM will also tell you what animal moves/abilities you get in that form (for example, if you turn into a wolf, the GM might say you can spend hold to \"scent out hidden creatures\" or \"run at incredible speed,\" etc.). This move is the core of Druid shapeshifting."
    },
    {
      "id": "druid_studied_essence",
      "name": "Studied Essence",
      "tier": "starting",
      "description": "When you spend time in quiet contemplation of the **spirit of a creature**, you may add that creature's species to the list of forms you can assume. (This is how you expand your shapeshifting repertoire beyond your starting Land. Essentially, observe or meditate on an animal to unlock it.)."
    },
    {
      "id": "druid_hunters_brother",
      "name": "Hunter's Brother",
      "tier": "advanced",
      "description": "Choose one move from the Ranger class list. (You gain a Ranger move as if via multiclassing; you must still meet any requirements of that move.)"
    },
    {
      "id": "druid_red_of_tooth_and_claw",
      "name": "Red of Tooth and Claw",
      "tier": "advanced",
      "description": "When you are in an _appropriate animal form_ (something dangerous, a predator for example) your damage die becomes d8 (instead of d6)."
    },
    {
      "id": "druid_communion_of_whispers",
      "name": "Communion of Whispers",
      "tier": "advanced",
      "description": "When you spend time in a place, silently communing with the spirits of the area, roll+WIS. You will receive a vision or dream relevant to the area. _On 10+_, the vision will be clear and helpful. _On 7-9_, it's unclear, cryptic, or incomplete. _On a miss_, the vision is horrifying or disturbing - the GM will describe it and you take -1 forward (shaken by the experience)."
    },
    {
      "id": "druid_barkskin",
      "name": "Barkskin",
      "tier": "advanced",
      "description": "So long as a part of your body is in contact with the earth (ground, soil), you have +1 armor."
    },
    {
      "id": "druid_eyes_of_the_tiger",
      "name": "Eyes of the Tiger",
      "tier": "advanced",
      "description": "When you **mark an animal with a symbol (mud, blood, etc.)**, you can see through that animal's eyes as if they were your own, no matter the distance. Only one animal can be marked this way at a time."
    },
    {
      "id": "druid_shed",
      "name": "Shed",
      "tier": "advanced",
      "description": "When you take damage while shapeshifted, you may choose to instantly revert to your natural form **and** negate that damage completely. (You \"shed\" your animal form to avoid harm.)"
    },
    {
      "id": "druid_thing_talker",
      "name": "Thing-Talker",
      "tier": "advanced",
      "description": "You see the spirits in **inanimate natural objects** (plants, rocks, water, etc.) or creatures made from them. You can now apply your Spirit Tongue, Shapeshifting, and Studied Essence moves to _plants and rocks_ (and creatures made of them) as well as animals. (This means you can speak to and even shapeshift into plant or rock forms - \"thing-forms\" - though moving might be odd, so they allow \"vaguely humanoid-shaped mobile entities\" of those elements.)"
    },
    {
      "id": "druid_formcrafter",
      "name": "Formcrafter",
      "tier": "advanced",
      "description": "When you shapeshift, choose one stat (STR, DEX, etc.); you get +1 ongoing to rolls using that stat while in animal form. However, the GM will choose a different stat and give you -1 ongoing with that stat while in that form (perhaps representing an awkward aspect of the form)."
    },
    {
      "id": "druid_elemental_mastery",
      "name": "Elemental Mastery",
      "tier": "advanced",
      "description": "When you call on the primal spirits of the elements (fire, water, earth, or air) to perform a task for you, roll+WIS. _On 10+_, choose 2 from the list. _On 7-9_, choose 1. On a miss, some catastrophe occurs. The choices are: **The effect you desire comes to pass**, **You avoid paying nature's price**, **You retain control**. (This is a general elemental magic move; the GM will tell you what \"nature's price\" is - often a cost or danger - and what losing control might mean.)."
    },
    {
      "id": "druid_balance",
      "name": "Balance",
      "tier": "advanced",
      "description": "Whenever you deal damage to a creature, take +1 \"balance.\" You can touch someone and spend balance, one-for-one, to heal them 1d4 HP per balance spent. (This is like siphoning life force from enemies and using it to heal allies)."
    },
    {
      "id": "druid_embracing_no_form",
      "name": "Embracing No Form",
      "tier": "master",
      "description": "When you shapeshift, roll an extra 1d4 and **add it to your hold**. (So you shapeshift with 2-5 hold instead of 1-3.)"
    },
    {
      "id": "druid_doppelgangers_dance",
      "name": "Doppelgänger's Dance",
      "tier": "master",
      "description": "You can now study the essence of specific _individuals_ (humanoids, etc.) to take their exact form. You may even suppress your Tell to pass as them - but if you do, you take -1 ongoing until you return to your own form. (Copying a person is possible, but hiding your druidic tell is taxing.)"
    },
    {
      "id": "druid_blood_and_thunder",
      "name": "Blood and Thunder",
      "tier": "master",
      "description": "In an appropriate dangerous animal form, your damage die is d10."
    },
    {
      "id": "druid_druid_sleep",
      "name": "The Druid Sleep",
      "tier": "master",
      "description": "When you gain this move, the next time you have safety and time in an appropriate place, you may undergo a ritual to attune to a **new Land**. The GM will tell you how long it takes and what it costs (it happens only once). After this, you are considered \"born of the soil\" in two lands - your original and the new one - for purposes of shapeshifting and moves."
    },
    {
      "id": "druid_world_talker",
      "name": "World-Talker",
      "tier": "master",
      "description": "You see the patterns that connect all natural things. You can now apply Spirit Tongue, Shapeshifting, and Studied Essence to the **pure elements** (fire, water, air, earth). In other words, you can speak to and take the form of elemental entities as well.",
      "prerequisites": {
        "requiresMoveIds": [
          "druid_thing_talker"
        ]
      }
    },
    {
      "id": "druid_stalkers_sister",
      "name": "Stalker's Sister",
      "tier": "master",
      "description": "Choose one move from the Ranger class list (just like Hunter's Brother earlier - another ranger move)."
    },
    {
      "id": "druid_formshaper",
      "name": "Formshaper",
      "tier": "master",
      "description": "When you shapeshift, you may choose to either **increase your armor by +1** or **add +1d4 damage** while in that form. Decide each time you shapeshift which benefit applies.",
      "prerequisites": {
        "requiresMoveIds": [
          "druid_formcrafter"
        ]
      }
    },
    {
      "id": "druid_chimera",
      "name": "Chimera",
      "tier": "master",
      "description": "When you shapeshift, you can combine up to **three different animal forms** into one form. For example, you could be a bear with eagle's wings and a snake's venomous fangs, etc. Each component may grant one of its moves/abilities. You still follow the normal shapeshift rules otherwise."
    },
    {
      "id": "druid_weather_weaver",
      "name": "Weather Weaver",
      "tier": "master",
      "description": "When you are under the open sky at dawn, the GM will ask you what the weather will be that day. Whatever you answer, it comes to pass (barring supernatural interference). You effectively control the day's basic weather pattern."
    }
  ],
  "Wizard": [
    {
      "id": "wizard_race_elf",
      "name": "Elf",
      "tier": "race",
      "description": "Magic is second nature to you. You also have Detect Magic as a cantrip.\nNotes: Adds Detect Magic to your cantrips list.\nSource: Dungeon World SRD - Wizard (Race Moves)",
      "prerequisites": {
        "requiresRace": [
          "Elf"
        ]
      }
    },
    {
      "id": "wizard_race_human",
      "name": "Human",
      "tier": "race",
      "description": "Choose one Cleric spell. You may cast it as if it were a Wizard spell.\nNotes: Casting stat remains INT; treat the chosen Cleric spell as on the Wizard list for you.\nSource: Dungeon World SRD - Wizard (Race Moves)",
      "prerequisites": {
        "requiresRace": [
          "Human"
        ]
      }
    },
    {
      "id": "wizard_spellbook",
      "name": "Spellbook",
      "tier": "starting",
      "description": "You begin with the cantrips and three 1st-level spells in your spellbook. On each level-up, add one spell of your level or lower.\nSource: Dungeon World SRD - Wizard (Spellbook)"
    },
    {
      "id": "wizard_prepare_spells",
      "name": "Prepare Spells",
      "tier": "starting",
      "description": "Spend about an hour with your spellbook to lose all prepared spells and prepare new ones with total levels ≤ your level+1. Prepare all cantrips; they do not count against the limit.\nSource: Dungeon World SRD - Wizard (Prepare Spells)"
    },
    {
      "id": "wizard_cast_a_spell",
      "name": "Cast a Spell (INT)",
      "tier": "starting",
      "description": "When you release a prepared spell, roll+INT. On 10+, it works and you don't forget it. On 7-9, it works but choose: draw unwelcome attention/put yourself in a spot; or -1 ongoing to cast until you next prepare; or forget the spell until you prepare again. Maintaining an ongoing spell may impose -1 to cast as noted by the spell.\nSource: Dungeon World SRD - Wizard (Cast a Spell)"
    },
    {
      "id": "wizard_spell_defense",
      "name": "Spell Defense",
      "tier": "starting",
      "description": "End one of your ongoing spells immediately to blunt an incoming attack; reduce the damage by that spell's level.\nSource: Dungeon World SRD - Wizard (Spell Defense)"
    },
    {
      "id": "wizard_ritual",
      "name": "Ritual",
      "tier": "starting",
      "description": "At a place of power you can attempt any magical effect. The GM sets concrete conditions (time, cost, help, risk, lesser version, sacrifice/disenchant, etc.) you must meet.\nSource: Dungeon World SRD - Wizard (Ritual)"
    },
    {
      "id": "wizard_prodigy",
      "name": "Prodigy",
      "tier": "advanced",
      "description": "Choose one spell; you prepare it as if it were one level lower.\nSource: Dungeon World SRD - Wizard (Prodigy)"
    },
    {
      "id": "wizard_empowered_magic",
      "name": "Empowered Magic",
      "tier": "advanced",
      "description": "On a 10+ to cast, you may also take a 7-9 drawback; if you do, choose one: maximize the spell's effects, or double its targets.\nSource: Dungeon World SRD - Wizard (Empowered Magic)",
      "mutuallyExclusiveIds": [
        "wizard_greater_empowered_magic"
      ]
    },
    {
      "id": "wizard_fount_of_knowledge",
      "name": "Fount of Knowledge",
      "tier": "advanced",
      "description": "When you Spout Lore on something no one else knows about, take +1.\nSource: Dungeon World SRD - Wizard (Fount of Knowledge)"
    },
    {
      "id": "wizard_know_it_all",
      "name": "Know-It-All",
      "tier": "advanced",
      "description": "When a PC follows your advice, they take +1 forward; you mark XP.\nSource: Dungeon World SRD - Wizard (Know-It-All)"
    },
    {
      "id": "wizard_expanded_spellbook",
      "name": "Expanded Spellbook",
      "tier": "advanced",
      "description": "Add one spell from any class's list to your spellbook.\nSource: Dungeon World SRD - Wizard (Expanded Spellbook)"
    },
    {
      "id": "wizard_enchanter",
      "name": "Enchanter",
      "tier": "advanced",
      "description": "With time and safety, you can ask the GM what a magic item does; they answer truthfully.\nSource: Dungeon World SRD - Wizard (Enchanter)"
    },
    {
      "id": "wizard_logical",
      "name": "Logical",
      "tier": "advanced",
      "description": "You may Discern Realities with INT instead of WIS when using strict deduction.\nSource: Dungeon World SRD - Wizard (Logical)",
      "mutuallyExclusiveIds": [
        "wizard_highly_logical"
      ]
    },
    {
      "id": "wizard_arcane_ward",
      "name": "Arcane Ward",
      "tier": "advanced",
      "description": "While you have any prepared spell (level 1+), you have +2 Armor.\nSource: Dungeon World SRD - Wizard (Arcane Ward)",
      "mutuallyExclusiveIds": [
        "wizard_arcane_armor"
      ]
    },
    {
      "id": "wizard_counterspell",
      "name": "Counterspell",
      "tier": "advanced",
      "description": "To block an arcane spell that would affect you, stake a prepared spell and roll+INT. On 10+, it's countered (no effect on you). On 7-9, it's countered but you forget the staked spell. Only protects you; other targets (if any) are still affected.\nSource: Dungeon World SRD - Wizard (Counterspell)"
    },
    {
      "id": "wizard_quick_study",
      "name": "Quick Study",
      "tier": "advanced",
      "description": "When you observe an arcane spell's effects, ask the GM its name and effects; take +1 when acting on that information.\nSource: Dungeon World SRD - Wizard (Quick Study)"
    },
    {
      "id": "wizard_master",
      "name": "Master",
      "tier": "master",
      "description": "Choose a second spell; you prepare it as if it were one level lower.\nRequires: wizard_prodigy.\nSource: Dungeon World SRD - Wizard (Master)",
      "prerequisites": {
        "requiresMoveIds": [
          "wizard_prodigy"
        ]
      }
    },
    {
      "id": "wizard_greater_empowered_magic",
      "name": "Greater Empowered Magic",
      "tier": "master",
      "description": "On 10–11 to cast, you may also take a 7–9 drawback and choose one: double effects or double targets. On 12+, choose one of those for free.\nReplaces: wizard_empowered_magic.\nSource: Dungeon World SRD - Wizard (Greater Empowered Magic)",
      "prerequisites": {
        "requiresMoveIds": [
          "wizard_empowered_magic"
        ]
      },
      "mutuallyExclusiveIds": [
        "wizard_empowered_magic"
      ]
    },
    {
      "id": "wizard_enchanters_soul",
      "name": "Enchanter's Soul",
      "tier": "master",
      "description": "With time/safety at a place of power, you can empower a magic item so its next use is amplified (GM specifies how).\nRequires: wizard_enchanter.\nSource: Dungeon World SRD - Wizard (Enchanter's Soul)",
      "prerequisites": {
        "requiresMoveIds": [
          "wizard_enchanter"
        ]
      }
    },
    {
      "id": "wizard_highly_logical",
      "name": "Highly Logical",
      "tier": "master",
      "description": "Discern Realities with INT; on a 12+, ask any three questions (not limited to the list).\nReplaces: wizard_logical.\nSource: Dungeon World SRD - Wizard (Highly Logical)",
      "prerequisites": {
        "requiresMoveIds": [
          "wizard_logical"
        ]
      },
      "mutuallyExclusiveIds": [
        "wizard_logical"
      ]
    },
    {
      "id": "wizard_arcane_armor",
      "name": "Arcane Armor",
      "tier": "master",
      "description": "While you have any prepared spell (level 1+), you have +4 Armor.\nReplaces: wizard_arcane_ward.\nSource: Dungeon World SRD - Wizard (Arcane Armor)",
      "prerequisites": {
        "requiresMoveIds": [
          "wizard_arcane_ward"
        ]
      },
      "mutuallyExclusiveIds": [
        "wizard_arcane_ward"
      ]
    },
    {
      "id": "wizard_protective_counter",
      "name": "Protective Counter",
      "tier": "master",
      "description": "You may counter an arcane spell affecting an ally in sight as if it targeted you. If it affects multiple allies, counter separately for each.\nRequires: wizard_counterspell.\nSource: Dungeon World SRD - Wizard (Protective Counter)",
      "prerequisites": {
        "requiresMoveIds": [
          "wizard_counterspell"
        ]
      }
    },
    {
      "id": "wizard_ethereal_tether",
      "name": "Ethereal Tether",
      "tier": "master",
      "description": "With time and a willing/helpless subject, create a tether: you perceive what they perceive and can Discern Realities about them/their surroundings at any distance. Willing targets can speak to you over the tether.\nSource: Dungeon World SRD - Wizard (Ethereal Tether)"
    },
    {
      "id": "wizard_mystical_puppet_strings",
      "name": "Mystical Puppet Strings",
      "tier": "master",
      "description": "When you magically control someone, they retain no memory of your control and feel no ill will toward you for it.\nSource: Dungeon World SRD - Wizard (Mystical Puppet Strings)"
    },
    {
      "id": "wizard_spell_augmentation",
      "name": "Spell Augmentation",
      "tier": "master",
      "description": "When you deal damage, you may end one of your ongoing spells to add its level to the damage.\nSource: Dungeon World SRD - Wizard (Spell Augmentation)"
    },
    {
      "id": "wizard_self_powered",
      "name": "Self-Powered",
      "tier": "master",
      "description": "With time, arcane materials, and a safe space, you can create your own place of power. The GM names a type of creature interested in your workings.\nSource: Dungeon World SRD - Wizard (Self-Powered)"
    }
  ],
  "Barbarian": [
    {
      "id": "barbarian_outsider",
      "name": "Outsider",
      "tier": "race",
      "description": "You may be human, elf, dwarf, halfling, etc., but you and your people are \"not from around here.\" At the beginning of each session, the GM will ask you a question about your homeland, why you left, or what you left behind. If you answer, mark XP. (This represents the Barbarian's foreign origins - effectively, every session you establish a new fact about your far-away culture in exchange for experience.)"
    },
    {
      "id": "barbarian_herculean_appetites",
      "name": "Herculean Appetites",
      "tier": "starting",
      "description": "You have **two driving appetites** that can never be truly sated. Choose two from: _Pure Destruction; Power Over Others; Mortal Pleasures; Conquest; Riches and Property; Fame and Glory_. When pursuing one of your appetites and you would roll for a move, you roll 1d6+1d8 instead of 2d6. If the d6 is higher than the d8, the GM also introduces a complication or danger related to your heedless pursuit of that appetite. (This is a signature move: it can make you succeed more (d8 gives potential for higher than d6) but at risk of complications.)"
    },
    {
      "id": "barbarian_upper_hand",
      "name": "The Upper Hand",
      "tier": "starting",
      "description": "You take +1 ongoing to **Last Breath** rolls. Additionally, when you are at Death's door (rolling Last Breath on a 7-9), you can opt to make an offer to Death to return to life. If Death accepts, you live; if not, you die as normal. (So on a 7-9 Last Breath, normally the GM offers a bargain. With this move, _you_ can propose a bargain to Death.)"
    },
    {
      "id": "barbarian_musclebound",
      "name": "Musclebound",
      "tier": "starting",
      "description": "Any melee weapon you wield gains the _forceful_ and _messy_ tags (because of your overwhelming strength). (_Forceful:_ knocks enemies back or aside; _Messy:_ does gruesome damage, causes collateral destruction.)"
    },
    {
      "id": "barbarian_what_are_you_waiting_for",
      "name": "What Are You Waiting For?",
      "tier": "starting",
      "description": "When you **bellow a challenge** to your enemies, roll+CON. _On 10+_, **all** enemies who can hear you focus on you exclusively - you become the obvious, biggest threat - and you take +2 damage ongoing against them (i.e. you deal +2 damage to them until they're defeated or you stop). _On 7-9_, only a few (the weakest or most foolhardy among them) fall for it and focus on you. _On a miss_, you attract _only_ their attention (they focus on you) **and** you don't get the damage bonus - probably not what you wanted!."
    },
    {
      "id": "barbarian_full_plate",
      "name": "Full Plate and Packing Steel",
      "tier": "starting",
      "description": "You ignore the clumsy tag on armor you wear. (This is exactly like the Fighter/Paladin's Armored move: lets you wear heavy armor freely.)\n**- OR -**",
      "mutuallyExclusiveIds": [
        "barbarian_unencumbered_unharmed"
      ]
    },
    {
      "id": "barbarian_unencumbered_unharmed",
      "name": "Unencumbered, Unharmed",
      "tier": "starting",
      "description": "As long as you are **below your Load** (not encumbered) and wearing **no armor and no shield**, you get +1 armor (from your quickness and lack of burden).\n_You choose EITHER \"Full Plate and Packing Steel\" OR \"Unencumbered, Unharmed\" at level 1 - not both._ These two moves are mutually exclusive starting options for the Barbarian (one favors heavy armor, the other favors going bare-chested light and quick).",
      "mutuallyExclusiveIds": [
        "barbarian_full_plate"
      ]
    },
    {
      "id": "barbarian_still_hungry",
      "name": "Still Hungry",
      "tier": "advanced",
      "description": "Choose an additional appetite from the list (now you have 3 total)."
    },
    {
      "id": "barbarian_appetite_for_destruction",
      "name": "Appetite for Destruction",
      "tier": "advanced",
      "description": "You may take a move from the **Fighter, Thief, or Bard** class list. You cannot take that class's multiclass moves (e.g. you can't pick Fighter's Multiclass Dabbler, etc.)."
    },
    {
      "id": "barbarian_love_like_a_truck",
      "name": "My Love For You Is Like a Truck",
      "tier": "advanced",
      "description": "When you perform a feat of prodigious strength, name someone present whom you impress. You take +1 forward to **Parley** with that person. (Basically, show off brute strength to gain leverage in social interaction)."
    },
    {
      "id": "barbarian_best_in_life",
      "name": "What Is Best in Life",
      "tier": "advanced",
      "description": "At the **end of a session**, if during that session you have _\"crushed your enemies, seen them driven before you, or heard the lamentations of their kin\"_, you mark XP. (A fun Conan reference; you get XP if you did something truly barbaric and glorious.)"
    },
    {
      "id": "barbarian_wide_wanderer",
      "name": "Wide Wanderer",
      "tier": "advanced",
      "description": "You've traveled far and wide. When you enter a new settlement, you can ask the GM about any important customs, rituals, or norms there, and the GM will tell you what you need to know."
    },
    {
      "id": "barbarian_usurper",
      "name": "Usurper",
      "tier": "advanced",
      "description": "When you prove yourself superior to someone in power (e.g. defeat them, humiliate them), you take +1 forward with _their_ followers or underlings. (They're more likely to follow you or be intimidated by you now)."
    },
    {
      "id": "barbarian_khan_of_khans",
      "name": "Khan of Khans",
      "tier": "advanced",
      "description": "Your hirelings (retainers) will accept **\"the gratuitous fulfillment of one of your appetites\"** as payment. (So you can pay a hireling by indulging in one of your appetites in an over-the-top way - e.g. a night of revelry - instead of coin)."
    },
    {
      "id": "barbarian_samson",
      "name": "Samson",
      "tier": "advanced",
      "description": "You can take a debility (willingly mark yourself with a permanent stat penalty) to immediately break free of any physical or mental restraint. (Shattering chains, throwing off enchantments through sheer will, etc.)."
    },
    {
      "id": "barbarian_smash",
      "name": "Smash!",
      "tier": "advanced",
      "description": "When you **Hack and Slash** and roll a 12+, you deal your damage _and_ you also choose something physical your target has (a weapon, their footing/position, an arm, etc.) - they _lose it_. (You disarm them, knock them down, maim a limb, etc., as appropriate)."
    },
    {
      "id": "barbarian_indestructible_hunger",
      "name": "Indestructible Hunger",
      "tier": "advanced",
      "description": "When you take damage, you can choose to take a -1 ongoing penalty until you sate one of your appetites, _instead of taking the damage_. If you already have this penalty active, you can't use this again until you satisfy an appetite. (So you can opt to defer damage by feeding your obsession later)."
    },
    {
      "id": "barbarian_eye_for_weakness",
      "name": "Eye for Weakness",
      "tier": "advanced",
      "description": "When you **Discern Realities**, you get to add the question \"What here is weak or vulnerable?\" to the list of questions you can ask."
    },
    {
      "id": "barbarian_on_the_move",
      "name": "On the Move",
      "tier": "advanced",
      "description": "When you **Defy Danger** due to movement (e.g. balancing on a ledge, running from an explosion), take +1 to the roll."
    },
    {
      "id": "barbarian_good_day_to_die",
      "name": "A Good Day to Die",
      "tier": "master",
      "description": "As long as your current HP is below your CON (or 1 HP, whichever is higher), you get +1 ongoing to all rolls. (So when you're badly hurt, you fight even harder)."
    },
    {
      "id": "barbarian_kill_em_all",
      "name": "Kill 'Em All",
      "tier": "master",
      "description": "You can take **another** move from the Fighter, Thief, or Bard class list (again except their multiclass moves). This essentially lets you multiclass a second time into those classes.",
      "prerequisites": {
        "requiresMoveIds": [
          "barbarian_appetite_for_destruction"
        ]
      }
    },
    {
      "id": "barbarian_war_cry",
      "name": "War Cry",
      "tier": "master",
      "description": "When you **enter battle with a show of force** (ululating war cry, intimidation display, war dance), roll+CHA. _On 10+_, choose two. _On 7-9_, choose one:\n- Your allies are rallied and take +1 forward (morale boost).\n- Your enemies feel fear and act accordingly (they hesitate, break ranks, or attack recklessly).\n(On a miss, perhaps your shout has the opposite effect or leaves you exposed.)"
    },
    {
      "id": "barbarian_mark_of_might",
      "name": "Mark of Might",
      "tier": "master",
      "description": "When you take this move, spend some uninterrupted time reflecting on past glories and **mark yourself with a symbol of your power** (such as a ritual scar, a fearsome tattoo, etc.). From then on, any intelligent mortal who sees this symbol **instinctively knows** you are a force to be reckoned with and will treat you accordingly (often with caution or respect)."
    },
    {
      "id": "barbarian_more_always_more",
      "name": "More! Always More!",
      "tier": "master",
      "description": "When you satisfy one of your appetites **to the extreme** (e.g. you don't just seek riches, you sack the greatest treasure hoard; you don't just seek pleasure, you revel for days in debauchery), you may choose to resolve that appetite. Cross it off and mark XP. You may pursue it again in the future, but it no longer drives you like before. **Then choose a new appetite** from the list (or create a new one) to replace it. (This allows the Barbarian to evolve - dropping one obsession and gaining another, once it's been fulfilled monumentally)."
    },
    {
      "id": "barbarian_one_who_knocks",
      "name": "The One Who Knocks",
      "tier": "master",
      "description": "When you **Defy Danger**, _on a 12+_ you don't just overcome the danger, you **turn it back** on itself. The GM will describe how the tables turn in your favor. (Example: You not only dodge the trap, but trigger it on your enemies.)."
    },
    {
      "id": "barbarian_healthy_distrust",
      "name": "Healthy Distrust",
      "tier": "master",
      "description": "Whenever you are forced to **Defy Danger due to an arcane magical effect** (a spell cast by mortal magic-users), treat any roll of 6- as a 7-9. (Your inherent distrust of magic helps you resist it, so you can't completely fail - a miss becomes a partial success)."
    },
    {
      "id": "barbarian_for_the_blood_god",
      "name": "For the Blood God",
      "tier": "master",
      "description": "You are initiated in the old ways of sacrifice. Choose something that your gods (or ancestors or totem spirits) value - it could be _blood, bones, gold,_ etc. When you **sacrifice those things** as per your rites, roll+WIS. _On 10+_, your deity or spirits grant you insight into your current trouble or a boon to help you. _On 7-9_, the sacrifice isn't enough - your gods demand more (the GM will say how you suffer), but they still grant some insight or boon. _On a miss_, you earn the ire of the spirits - a bad omen or curse upon you."
    }
  ],
  "Immolator": [
    {
      "id": "immolator_human",
      "name": "Human",
      "tier": "race",
      "description": "When you **Make Camp** beside a large open flame, you regain all your HP (full heal).",
      "prerequisites": {
        "requiresRace": [
          "Human"
        ]
      }
    },
    {
      "id": "immolator_salamander",
      "name": "Salamander",
      "tier": "race",
      "description": "Non-magical heat and fire cannot harm you at all. (You can bathe in ordinary flames safely - you're a fire creature.)"
    },
    {
      "id": "immolator_burning_brand",
      "name": "Burning Brand",
      "tier": "starting",
      "description": "You can conjure a weapon of pure flame. When you _summon a weapon of fire_, roll+CON. _On 10+_, choose two of the following tags for the weapon. _On 7-9_, choose one: **hand** (melee range), **thrown, near** (you can throw it, reaching near range), **+1 damage**, **remove the dangerous tag**. The weapon by default always has the tags: _fiery_, _touch_ (it's close range by default), _dangerous_, and has 3 uses (meaning you can strike with it 3 times before it gutters out). You may use INT instead of STR or DEX for attacks with this weapon (since it's your willpower guiding it). Each attack with the weapon consumes one \"use.\" The flame weapon disappears when its uses run out or when you dismiss it. _(Dangerous tag means on a 7-9 or miss, something bad could happen - like collateral fire damage.)_"
    },
    {
      "id": "immolator_fighting_fire",
      "name": "Fighting Fire with Fire",
      "tier": "starting",
      "description": "When you take damage, and that damage is an **odd number** (after armor), the fire inside you comes to your aid. Roll 1d4 and choose one: **Add that many uses to your Burning Brand** (if you currently have an active fire weapon), **or** take that result forward to your next _Burning Brand_ roll (if you don't currently have one, basically a bonus to summon the next), **or** reduce the damage by that amount. (This makes you unpredictably resilient - odd hits empower you.)"
    },
    {
      "id": "immolator_zuko_style",
      "name": "Zuko Style",
      "tier": "starting",
      "description": "When you **bend flame to your will** (manipulate an existing fire, not your Burning Brand but any other open flame), roll+WIS. _On 10+_, the flame obeys your command - you can shape it, move it, snuff it, ignite something else, as long as fuel is present - and it lasts as long as there is fuel. _On 7-9_, the effect is only momentary or incomplete: the fire does as you command but briefly or partially. (Miss might result in backlash - fire does something unintended.)"
    },
    {
      "id": "immolator_give_me_fuel",
      "name": "Give Me Fuel, Give Me Fire",
      "tier": "starting",
      "description": "When you **look intensely into someone's eyes**, you may ask, \"What fuels the flames of your desire?\" They **must answer truthfully**, even if the character doesn't know or would normally resist telling. (It compels an honest answer about their motivation or drive)."
    },
    {
      "id": "immolator_hand_crafted",
      "name": "Hand Crafted",
      "tier": "starting",
      "description": "You can use your bare hands and inner fire as tools. You may craft metal objects with just your hands and flame. You can forge weapons, armor, jewelry, etc., given raw materials. You can also unmake (melt down) such items with your touch. If you attempt to do this in a hurry or under pressure, the GM may require you to **Defy Danger** first. (Basically, you're a walking forge.)"
    },
    {
      "id": "immolator_lore_of_flame",
      "name": "Lore of Flame",
      "tier": "advanced",
      "description": "When you **stare into a source of fire** looking for guidance, roll+WIS. _On a hit_, the GM will tell you something new and interesting about the current situation. _On 10+_, it will be clear and helpful. _On 7-9_, it will be vague, unclear, or partially helpful. If you already know everything about the situation, the GM will tell you that instead."
    },
    {
      "id": "immolator_burns_twice",
      "name": "Burns Twice as Bright",
      "tier": "advanced",
      "description": "When you **channel the flames of fate**, you can treat a missed roll (6-) as a 7-9, or a 7-9 as a 10+, _one time_. After you do so, you must tell the GM something you've **lost** forever - an emotion, a memory, or some innate part of your being. You **cannot use this move again** until you've used _Burns Half As Long_ (see next). (In other words, you \"burn\" part of your soul to turn failure into partial success or partial into full success, but then you must recharge via the next move.)"
    },
    {
      "id": "immolator_burns_half",
      "name": "Burns Half As Long",
      "tier": "advanced",
      "description": "_You gain this move automatically when you take Burns Twice as Bright._ It represents the cost of that power. After you've channeled flames of fate, your flame dims: **Until you make a great sacrifice**, treat any roll of 10+ as a 6- (a failure). This lasts until you willingly sacrifice something precious (an NPC ally, a valued possession, etc.) to the flames to appease fate. (Basically, after using Burns Twice, your next _success_ counts as a fail - a tragic consequence - until you pay the price. This pair of moves is high-risk, high-reward.)"
    },
    {
      "id": "immolator_killing_fire",
      "name": "This Killing Fire",
      "tier": "advanced",
      "description": "Add the following to the list of tags you can choose for _Burning Brand_: **messy**, **forceful**, **reach**, **near**, **far**. (This greatly expands the versatility of your fire weapon - you can make a longer weapon, or even a ranged weapon with far range, etc., or make it messy/forceful.)"
    },
    {
      "id": "immolator_firebrand",
      "name": "Firebrand",
      "tier": "advanced",
      "description": "When you **introduce a new idea to an NPC** (for example, spread a dangerous new belief or suggestion), roll+CHA. _On 10+_, they believe it wholeheartedly and take it up as their own idea, with zeal. _On 7-9_, they take to it for now, but their passion will fade soon (after a day or two) unless reinforced. _On a miss_, they react negatively - rejecting your idea and likely taking offense or action against you for suggesting it."
    },
    {
      "id": "immolator_ogdru_jahad",
      "name": "Ogdru Jahad",
      "tier": "advanced",
      "description": "You gain the Wizard's move **Ritual** (the ability to cast powerful ritual magic given time and special components). The GM will always tell you what you have to **sacrifice** to get the effect you desire when using Ritual. (Essentially, you become capable of performing magical rituals, but as a fire cultist, it always demands a sacrifice, which the GM will specify.)"
    },
    {
      "id": "immolator_moth_to_flame",
      "name": "Moth to the Flame",
      "tier": "advanced",
      "description": "When you **tempt a weak mind with your inner fire**, roll+WIS. _On 10+_, their will is completely suppressed - they'll follow you and do as you desire, so long as nothing startles or surprises them out of the trance. _On 7-9_, you only daze or distract them briefly - they won't act against you for a moment. _On a miss_, your fiery presence agitates them - they become hostile or panicked immediately."
    },
    {
      "id": "immolator_burning_bridges",
      "name": "Burning Bridges",
      "tier": "advanced",
      "description": "When you would normally roll **Last Breath** (i.e. when you'd die), you don't roll. Instead, you may **erase one of your Bonds** (permanently remove a bond with someone). If you do, you miraculously survive with 1d6 HP. However, the bond is burned away forever and your maximum number of Bonds is reduced by one (you have one fewer slot for relationships). If you have no Bonds left to burn, then you must face Death normally."
    },
    {
      "id": "immolator_enkindler",
      "name": "The Enkindler",
      "tier": "advanced",
      "description": "When you **bolster someone's courage** with your fiery presence, roll+CHA. _On 10+_, they shake off all fear or doubt and become brave instantly (as if blessed with courage). _On 7-9_, they get a brief spark of courage but it fades - they might do one small brave act but then realize the fear again. _On a miss_, your attempt backfires and they become even more afraid - possibly of you."
    },
    {
      "id": "immolator_sick_burn",
      "name": "Sick Burn",
      "tier": "advanced",
      "description": "When you **insult or mock an NPC** cleverly, roll+CHA. _On 10+_, they are publicly humiliated - they have no witty reply and everyone who hears it laughs at them; they will remember this and bear shame. _On 7-9_, you cross a line - you get under their skin, but they will have their revenge on you eventually (they stew on it). _On a miss_, you've gone way too far - the target immediately retaliates or lashes out in the moment. (Essentially a social attack move.)"
    },
    {
      "id": "immolator_from_hells_heart",
      "name": "From Hell's Heart",
      "tier": "master",
      "description": "Whenever you summon or create fire with any of your moves, you can choose to make it the **black fire of the Underworld** instead of normal flame. Hellfire does not burn with heat and **ignores armor**, searing the soul directly. It will not affect soulless things (e.g. golems, most undead, constructs)."
    },
    {
      "id": "immolator_burning_ring",
      "name": "Burning Ring of Fire",
      "tier": "master",
      "description": "When you **fuse your soul with a willing person's soul** (perform a bonding ritual of fire), roll+CHA. _On a hit_, you and that person are soul-bound: you can sense each other's presence and emotional state across any distance. _On 7-9_, the connection is unstable - whenever one of you takes a debility, the other takes the same debility. _On a miss_, the attempt fails and you both must erase any Bond you had with each other (the attempt burns away your previous connection); you cannot form a bond with that person until perhaps after an end-of-session. _(This bond cannot be removed by mortal means once successful.)_."
    },
    {
      "id": "immolator_fanning_flames",
      "name": "Fanning the Flames",
      "tier": "master",
      "description": "You can now use your **Firebrand** move (spreading ideas) on a **group** of people (a dozen or so) at once. (You inspire mobs with dangerous ideas just as you would individuals).",
      "prerequisites": {
        "requiresMoveIds": [
          "immolator_firebrand"
        ]
      }
    },
    {
      "id": "immolator_watch_world_burn",
      "name": "Watch the World Burn",
      "tier": "master",
      "description": "You can call forth a truly apocalyptic fire. When you **open a channel to the burning planes** and summon a firestorm upon a location, tell the GM what you sacrifice to fuel it (it has to be significant - lives, large treasures, etc.) and roll+WIS. A firestorm engulfs an area about the size of a small village:\n- _On 10+_, you can end the firestorm when you choose (with some effort) after it has done its devastation.\n- _On 7-9_, the firestorm is _only partially under your control_: it rages and spreads unpredictably, subject to wind and terrain - it might burn beyond the intended area or last longer than you want.\n- _On a miss_, something terrible comes through the open channel - _\"something cruel, intelligent, and hungry comes with the storm\"_, the GM will say. (In short: on a miss, you basically summoned a demon or fire elemental army along with the fire.) This is a catastrophic move - essentially burning down a whole area at great cost."
    }
  ]
}
