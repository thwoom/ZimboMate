import * as webllm from "@mlc-ai/web-llm";

export type CampaignVibe = 'fantasy' | 'scifi' | 'cyberpunk' | 'horror' | 'western' | 'modern';

export interface CharacterAction {
  type: 'apply_debility' | 'modify_hp' | 'add_gear' | 'spend_resource' | 'gain_xp' | 'update_bonds';
  params: any;
}

export interface EnhancementResult {
  enhancedText: string;
  actions: CharacterAction[];
}

export interface AIProgress {
  progress: number; // 0-100
  text: string;
  timeRemaining?: string;
}

export class AINoteEnhancer {
  private engine?: webllm.MLCEngine;
  private isReady = false;
  private initializationPromise?: Promise<void>;
  public onProgress?: (progress: AIProgress) => void;

  private dungeonWorldTools = [
    {
      type: "function" as const,
      function: {
        name: "apply_debility",
        description: "Apply Dungeon World debilities from story events",
        parameters: {
        type: "object",
        properties: {
          debility: {
            type: "string",
            enum: ["weak", "shaky", "sick", "stunned", "confused", "scarred"],
            description: "weak: STR-1, shaky: DEX-1, sick: CON-1, stunned: INT-1, confused: WIS-1, scarred: CHA-1"
          },
          reason: { type: "string", description: "Story cause of debility" }
        },
        required: ["debility", "reason"]
      }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "modify_hp",
        description: "Change HP from damage or healing",
        parameters: {
        type: "object",
        properties: {
          change: { type: "number", description: "HP change (negative = damage, positive = healing)" },
          reason: { type: "string", description: "Source of HP change" }
        },
        required: ["change", "reason"]
      }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "add_gear",
        description: "Add equipment/items found during adventures",
        parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Item name" },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "Tags like: hand, close, reach, near, far, messy, forceful, precise, reload, thrown, etc."
          },
          weight: { type: "number", description: "Item weight (0 for weightless)" },
          description: { type: "string", description: "Item description" },
          uses: { type: "number", description: "Limited uses (optional)" }
        },
        required: ["name", "description"]
      }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "spend_resource",
        description: "Spend limited resources (ammo, rations, etc.)",
        parameters: {
        type: "object",
        properties: {
          resource: { type: "string", description: "Resource name" },
          amount: { type: "number", description: "Amount spent" },
          reason: { type: "string", description: "Why resource was spent" }
        },
        required: ["resource", "amount", "reason"]
      }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "gain_xp",
        description: "Award XP for learning from failure or discovery",
        parameters: {
        type: "object",
        properties: {
          amount: { type: "number", description: "XP gained (usually 1)" },
          trigger: {
            type: "string",
            enum: ["failure", "alignment", "end_session", "discovery"],
            description: "What triggered XP gain"
          },
          description: { type: "string", description: "What was learned" }
        },
        required: ["amount", "trigger", "description"]
      }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "update_bonds",
        description: "Modify character bonds with other PCs",
        parameters: {
        type: "object",
        properties: {
          character: { type: "string", description: "Other PC name" },
          new_bond: { type: "string", description: "New or updated bond text" },
          action: {
            type: "string",
            enum: ["create", "resolve", "update"],
            description: "Bond modification type"
          }
        },
        required: ["character", "new_bond", "action"]
      }
      }
    }
  ];

  private getVibeSystemPrompt(vibe: CampaignVibe): string {
    const vibePrompts = {
      fantasy: "You are an expert Dungeon World storyteller specializing in high fantasy adventures. Transform shorthand notes into immersive epic fantasy prose with mystical atmosphere, heroic language, and vivid magical imagery.",
      scifi: "You are an expert Dungeon World storyteller specializing in science fiction adventures. Convert notes into compelling futuristic narratives with advanced technology, space exploration themes, and hard sci-fi atmosphere.",
      cyberpunk: "You are an expert Dungeon World storyteller specializing in cyberpunk adventures. Enhance notes with gritty noir atmosphere, high-tech low-life themes, corporate dystopia, and street-level urban storytelling.",
      horror: "You are an expert Dungeon World storyteller specializing in horror adventures. Transform notes with creeping atmospheric dread, psychological tension, cosmic terror, and dark supernatural elements that unsettle the soul.",
      western: "You are an expert Dungeon World storyteller specializing in western frontier adventures. Style notes as authentic frontier narratives with rugged landscapes, moral ambiguity, and classic Old West atmosphere.",
      modern: "You are an expert Dungeon World storyteller specializing in contemporary adventures. Convert notes into engaging modern narratives with realistic urban settings, current technology, and contemporary social dynamics."
    };

    return `<system>
${vibePrompts[vibe]}

## CRITICAL DUAL OUTPUT REQUIREMENT:
You MUST always provide BOTH:
1. **Enhanced Narrative Text**: Rich, immersive storytelling that transforms shorthand into engaging prose
2. **Function Calls**: When story events trigger game mechanics, call the appropriate functions

## Core Responsibilities:
1. **Narrative Enhancement**: Transform shorthand notes into rich, engaging prose that maintains all essential information while dramatically improving readability and immersion
2. **Mechanical Integration**: Detect story events that should trigger Dungeon World game mechanics and call appropriate functions
3. **Character Voice**: Maintain consistent narrative voice that matches the campaign's tone and atmosphere

## Function Calling Guidelines:
You have access to these Dungeon World integration functions - use them wisely:

- **apply_debility**: Use when story clearly indicates physical/mental impairment (poison, disease, exhaustion, mental trauma, curses)
- **modify_hp**: Apply for obvious damage (combat wounds, falling, environmental hazards) or healing (magic, rest, medical treatment)
- **add_gear**: Only for items explicitly found, crafted, purchased, or gifted in the narrative
- **spend_resource**: When consumables are clearly used (arrows shot, rations eaten, rope consumed)
- **gain_xp**: For meaningful learning experiences, discoveries, or failures that teach lessons
- **update_bonds**: When relationships with other player characters are significantly affected

## JSON Format Requirements:
- Always use proper JSON syntax in function calls
- Use double quotes for all strings
- Ensure all brackets and braces are properly closed
- Test JSON validity before submitting

## Quality Standards:
- ALWAYS enhance the narrative text, never return input unchanged
- Be conservative with function calls - only apply effects clearly supported by the narrative
- Prioritize story enhancement over mechanical changes
- Maintain narrative coherence and character consistency
- Use vivid, immersive language appropriate to the campaign setting

## Examples:
Input: "I was poisoned by a frog"
Output: Enhanced narrative PLUS apply_debility function call for poison

Input: "Found a magic sword"
Output: Enhanced narrative PLUS add_gear function call for the sword
</system>`;
  }

  async initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.doInitialize();
    return this.initializationPromise;
  }

  private async doInitialize(): Promise<void> {
    const startTime = Date.now();
    let progressInterval: NodeJS.Timeout | null = null;

    try {
      console.log("Starting AI initialization - downloading Hermes 3 model (q4f32_1 - ~5.8GB)...");
      this.onProgress?.({ progress: 0, text: "Initializing AI engine..." });

      // Enhanced progress callback with WebLLM cache loading format parsing
      const progressCallback = (report: any) => {
        console.log("AI Loading Progress:", JSON.stringify(report, null, 2));

        let progress = 0;
        let text = "Loading AI model...";
        let isRealProgress = false;

        if (report && typeof report === 'object') {
          console.log("Progress report keys:", Object.keys(report));

          // Parse WebLLM's cache loading format: "Loading model from cache[48/108]: 2048MB loaded. 44% completed, 30 secs elapsed."
          if (typeof report.text === 'string') {
            const cacheMatch = report.text.match(/Loading model from cache\[(\d+)\/(\d+)\].*?(\d+)% completed/);
            if (cacheMatch) {
              const [, current, total, percentage] = cacheMatch;
              progress = parseInt(percentage);
              text = `Loading model parts (${current}/${total})`;
              isRealProgress = true;
              console.log(`📦 Cache loading: ${current}/${total} parts, ${progress}%`);
            } else {
              // Try other progress patterns
              const percentMatch = report.text.match(/(\d+)%/);
              if (percentMatch) {
                progress = parseInt(percentMatch[1]);
                text = report.text.replace(/Loading model from cache\[\d+\/\d+\]:\s*/, '');
                isRealProgress = true;
              } else {
                // Use the raw text but clean it up
                text = report.text.replace(/Loading model from cache\[\d+\/\d+\]:\s*/, 'Loading model: ');
              }
            }
          }

          // Fallback to other progress formats
          if (!isRealProgress) {
            if (typeof report.progress === 'number') {
              progress = Math.round(report.progress * 100);
              isRealProgress = true;
            } else if (typeof report.loaded === 'number' && typeof report.total === 'number' && report.total > 0) {
              progress = Math.round((report.loaded / report.total) * 100);
              isRealProgress = true;
            }
          }

          // Extract other text sources
          if (!text || text === "Loading AI model...") {
            if (typeof report.message === 'string') {
              text = report.message;
            } else if (typeof report.status === 'string') {
              text = report.status;
            } else if (typeof report.task === 'string') {
              text = report.task;
            }
          }

          if (isRealProgress) {
            console.log(`✅ Real progress detected: ${progress}% - ${text}`);

            // Calculate time remaining for real progress
            let timeRemaining;
            if (progress > 5 && progress < 95) {
              const elapsed = Date.now() - startTime;
              const estimated = (elapsed / progress) * (100 - progress);
              if (estimated > 2000) {
                timeRemaining = `${Math.round(estimated / 1000)}s remaining`;
              }
            }

            this.onProgress?.({ progress, text, timeRemaining });
          } else {
            console.log("❌ No progress data found in report");
            // Show indeterminate progress with cleaned up text
            this.onProgress?.({ progress: 0, text: text.length < 100 ? text : "Loading model..." });
          }
        }
      };

      // Use CreateMLCEngine with progress callback instead of reload
      console.log("🚀 Creating WebLLM engine with progress tracking (q4f32_1)...");
      console.log("📊 Model specs: Hermes-3-Llama-3.1-8B-q4f32_1-MLC (~5.8GB, 32-bit precision)");
      this.engine = await webllm.CreateMLCEngine("Hermes-3-Llama-3.1-8B-q4f32_1-MLC", {
        initProgressCallback: progressCallback
      });

      this.isReady = true;
      this.onProgress?.({ progress: 100, text: "AI ready!" });
      console.log("✅ AI Note Enhancer ready! Hermes 3 model loaded successfully.");
    } catch (error) {
      console.error("❌ Failed to initialize AI Note Enhancer:", error);

      // Fallback to manual engine creation without progress
      try {
        console.log("🔄 Retrying with manual engine creation...");
        this.onProgress?.({ progress: 50, text: "Retrying without progress tracking..." });

        this.engine = new webllm.MLCEngine();
        await this.engine.reload("Hermes-3-Llama-3.1-8B-q4f32_1-MLC");

        this.isReady = true;
        this.onProgress?.({ progress: 100, text: "AI ready!" });
        console.log("✅ AI Note Enhancer ready! (fallback successful)");
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError);
        this.onProgress?.({ progress: 0, text: "AI failed to load" });
        throw fallbackError;
      }
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }
  }

  // JSON repair utility for malformed function call arguments
  private repairJSON(jsonStr: string): string {
    try {
      // First try parsing as-is
      JSON.parse(jsonStr);
      return jsonStr;
    } catch {
      // Common fixes for malformed JSON
      let repaired = jsonStr;

      // Fix single quotes to double quotes
      repaired = repaired.replace(/'/g, '"');

      // Fix unquoted keys
      repaired = repaired.replace(/(\w+):/g, '"$1":');

      // Fix trailing commas
      repaired = repaired.replace(/,\s*}/g, '}');
      repaired = repaired.replace(/,\s*]/g, ']');

      // Try parsing again
      try {
        JSON.parse(repaired);
        console.log("🔧 JSON repaired successfully:", { original: jsonStr, repaired });
        return repaired;
      } catch {
        console.warn("❌ Could not repair JSON:", jsonStr);
        return jsonStr; // Return original if repair fails
      }
    }
  }

  async enhance(note: string, vibe: CampaignVibe = 'fantasy'): Promise<EnhancementResult> {
    if (!this.isReady || !this.engine) {
      throw new Error("AI not ready - call initialize() first");
    }

    console.log(`🎭 Enhancing note with ${vibe} vibe:`, note);
    const startTime = Date.now();

    try {
      const response = await this.engine.chat.completions.create({
        messages: [
          {
            role: "system",
            content: this.getVibeSystemPrompt(vibe)
          },
          {
            role: "user",
            content: `Process this story note: "${note}"`
          }
        ],
        tools: this.dungeonWorldTools,
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 300 // Increased for better narrative enhancement
      });

      const processingTime = Date.now() - startTime;
      console.log(`⚡ AI processing completed in ${processingTime}ms`);

      const message = response.choices[0].message;
      const enhancedText = message.content?.trim() || note;
      const actions: CharacterAction[] = [];

      console.log("📝 Raw AI response:", {
        content: message.content,
        toolCalls: message.tool_calls?.length || 0
      });

      // Process tool calls with JSON validation and repair
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log(`🔧 Processing ${message.tool_calls.length} tool calls...`);

        for (const toolCall of message.tool_calls) {
          if (toolCall.type === 'function') {
            try {
              console.log(`🛠️ Processing function: ${toolCall.function.name}`);
              console.log(`📋 Raw arguments: ${toolCall.function.arguments}`);

              // Attempt to repair JSON if needed
              const repairedArgs = this.repairJSON(toolCall.function.arguments);
              const params = JSON.parse(repairedArgs);

              actions.push({
                type: toolCall.function.name as CharacterAction['type'],
                params
              });

              console.log(`✅ Successfully parsed function call: ${toolCall.function.name}`, params);
            } catch (parseError) {
              console.error(`❌ Failed to parse tool call ${toolCall.function.name}:`, {
                error: parseError,
                arguments: toolCall.function.arguments
              });

              // Attempt retry with minimal params based on function type
              try {
                const fallbackParams = this.createFallbackParams(toolCall.function.name, note);
                if (fallbackParams) {
                  actions.push({
                    type: toolCall.function.name as CharacterAction['type'],
                    params: fallbackParams
                  });
                  console.log(`🔄 Created fallback params for ${toolCall.function.name}`, fallbackParams);
                }
              } catch (fallbackError) {
                console.error(`❌ Fallback creation failed for ${toolCall.function.name}:`, fallbackError);
              }
            }
          }
        }
      }

      // Validate that narrative was actually enhanced
      if (enhancedText === note) {
        console.warn("⚠️ AI returned unchanged text - narrative enhancement may have failed");
      }

      console.log(`🎉 Enhancement complete:`, {
        originalLength: note.length,
        enhancedLength: enhancedText.length,
        actionsCount: actions.length,
        processingTime: `${processingTime}ms`
      });

      return {
        enhancedText,
        actions
      };
    } catch (error) {
      console.error("❌ AI enhancement failed:", {
        error,
        note,
        vibe,
        processingTime: `${Date.now() - startTime}ms`
      });
      throw error;
    }
  }

  // Create fallback parameters when JSON parsing fails
  private createFallbackParams(functionName: string, originalNote: string): any {
    switch (functionName) {
      case 'apply_debility':
        return {
          debility: 'sick', // Default safe debility
          reason: `From: ${originalNote}`
        };
      case 'modify_hp':
        return {
          change: -1, // Conservative damage
          reason: `From: ${originalNote}`
        };
      case 'gain_xp':
        return {
          amount: 1,
          trigger: 'discovery',
          description: `From: ${originalNote}`
        };
      default:
        return null; // No safe fallback available
    }
  }

  isInitialized(): boolean {
    return this.isReady;
  }

  async dispose(): Promise<void> {
    if (this.engine) {
      await this.engine.unload();
      this.engine = undefined;
      this.isReady = false;
    }
  }
}