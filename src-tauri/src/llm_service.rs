use serde::{Deserialize, Serialize};
use ollama_rs::{
    generation::{
        chat::{ChatMessage, request::ChatMessageRequest},
    },
    Ollama,
};
use tauri::Emitter;
use tokio::sync::RwLock;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum CampaignVibe {
    #[serde(rename = "fantasy")]
    Fantasy,
    #[serde(rename = "scifi")]
    SciFi,
    #[serde(rename = "cyberpunk")]
    Cyberpunk,
    #[serde(rename = "horror")]
    Horror,
    #[serde(rename = "western")]
    Western,
    #[serde(rename = "modern")]
    Modern,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CharacterAction {
    pub r#type: String, // Using raw string literal for 'type' keyword
    pub params: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EnhancementResult {
    pub enhanced_text: String,
    pub actions: Vec<CharacterAction>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AIProgress {
    pub progress: f64, // 0.0 - 100.0
    pub text: String,
    pub time_remaining: Option<String>,
    pub stage: String, // "downloading", "loading", "ready", "error"
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ModelInfo {
    pub name: String,
    pub size_gb: f64,
    pub is_available: bool,
    pub is_loaded: bool,
}

pub struct LlmService {
    ollama: Ollama,
    current_model: RwLock<Option<String>>,
    is_ready: RwLock<bool>,
}

impl LlmService {
    pub fn new() -> Self {
        Self {
            ollama: Ollama::default(), // Uses default localhost:11434
            current_model: RwLock::new(None),
            is_ready: RwLock::new(false),
        }
    }

    pub async fn check_ollama_status(&self) -> Result<bool, String> {
        match self.ollama.list_local_models().await {
            Ok(_) => Ok(true),
            Err(e) => Err(format!("Ollama not running or not accessible: {}", e)),
        }
    }

    pub async fn list_models(&self) -> Result<Vec<ModelInfo>, String> {
        let local_models = self.ollama.list_local_models()
            .await
            .map_err(|e| format!("Failed to list models: {}", e))?;

        let mut models = Vec::new();

        // Add Natural Functions model info
        let natural_functions_available = local_models
            .iter()
            .any(|model| model.name.contains("natural-functions") || model.name.contains("calebfahlgren"));

        models.push(ModelInfo {
            name: "calebfahlgren/natural-functions".to_string(),
            size_gb: 4.0,
            is_available: natural_functions_available,
            is_loaded: false, // We'll update this when we actually check
        });

        // Add other common function-calling models
        models.push(ModelInfo {
            name: "mistral:7b-instruct-v0.3-q4_K_M".to_string(),
            size_gb: 4.4,
            is_available: local_models.iter().any(|m| m.name.contains("mistral") && m.name.contains("instruct")),
            is_loaded: false,
        });

        Ok(models)
    }

    pub async fn ensure_model(&self, model_name: &str, app_handle: tauri::AppHandle) -> Result<(), String> {
        // Check if model is already available
        let local_models = self.ollama.list_local_models()
            .await
            .map_err(|e| format!("Failed to check local models: {}", e))?;

        let model_exists = local_models
            .iter()
            .any(|model| model.name == model_name || model.name.starts_with(&format!("{}:", model_name)));

        if model_exists {
            self.emit_progress(&app_handle, AIProgress {
                progress: 100.0,
                text: format!("Model {} already available", model_name),
                time_remaining: None,
                stage: "ready".to_string(),
            }).await;
            return Ok(());
        }

        // Emit download started
        self.emit_progress(&app_handle, AIProgress {
            progress: 0.0,
            text: format!("Starting download of {}", model_name),
            time_remaining: None,
            stage: "downloading".to_string(),
        }).await;

        // Pull the model (this is a blocking operation in ollama-rs)
        // In a real implementation, you'd want to track progress here
        match self.ollama.pull_model(model_name.to_string(), false).await {
            Ok(_) => {
                self.emit_progress(&app_handle, AIProgress {
                    progress: 100.0,
                    text: format!("Successfully downloaded {}", model_name),
                    time_remaining: None,
                    stage: "ready".to_string(),
                }).await;
                Ok(())
            }
            Err(e) => {
                self.emit_progress(&app_handle, AIProgress {
                    progress: 0.0,
                    text: format!("Failed to download {}: {}", model_name, e),
                    time_remaining: None,
                    stage: "error".to_string(),
                }).await;
                Err(format!("Failed to pull model: {}", e))
            }
        }
    }

    async fn emit_progress(&self, app_handle: &tauri::AppHandle, progress: AIProgress) {
        let _ = app_handle.emit("llm_progress", progress);
    }

    pub async fn initialize(&self, model_name: &str, app_handle: tauri::AppHandle) -> Result<(), String> {
        // First ensure Ollama is running
        self.check_ollama_status().await?;

        // Ensure the model is available
        self.ensure_model(model_name, app_handle.clone()).await?;

        // Update state
        {
            let mut current_model = self.current_model.write().await;
            *current_model = Some(model_name.to_string());
        }

        {
            let mut is_ready = self.is_ready.write().await;
            *is_ready = true;
        }

        self.emit_progress(&app_handle, AIProgress {
            progress: 100.0,
            text: format!("AI ready with {}", model_name),
            time_remaining: None,
            stage: "ready".to_string(),
        }).await;

        Ok(())
    }

    fn get_vibe_system_prompt(&self, vibe: &CampaignVibe) -> String {
        let vibe_prompt = match vibe {
            CampaignVibe::Fantasy => "You are an expert Dungeon World storyteller specializing in high fantasy adventures. Transform shorthand notes into immersive epic fantasy prose with mystical atmosphere, heroic language, and vivid magical imagery.",
            CampaignVibe::SciFi => "You are an expert Dungeon World storyteller specializing in science fiction adventures. Convert notes into compelling futuristic narratives with advanced technology, space exploration themes, and hard sci-fi atmosphere.",
            CampaignVibe::Cyberpunk => "You are an expert Dungeon World storyteller specializing in cyberpunk adventures. Enhance notes with gritty noir atmosphere, high-tech low-life themes, corporate dystopia, and street-level urban storytelling.",
            CampaignVibe::Horror => "You are an expert Dungeon World storyteller specializing in horror adventures. Transform notes with creeping atmospheric dread, psychological tension, cosmic terror, and dark supernatural elements that unsettle the soul.",
            CampaignVibe::Western => "You are an expert Dungeon World storyteller specializing in western frontier adventures. Style notes as authentic frontier narratives with rugged landscapes, moral ambiguity, and classic Old West atmosphere.",
            CampaignVibe::Modern => "You are an expert Dungeon World storyteller specializing in contemporary adventures. Convert notes into engaging modern narratives with realistic urban settings, current technology, and contemporary social dynamics.",
        };

        format!(r#"<system>
{}

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
</system>"#, vibe_prompt)
    }

    // TODO: Implement function calling tools for Dungeon World mechanics
    // This would require defining the functions in a format ollama-rs understands
    // For now, we'll rely on the Natural Functions model understanding function calls from the system prompt

    pub async fn enhance(&self, note: &str, vibe: CampaignVibe) -> Result<EnhancementResult, String> {
        // Check if ready
        {
            let is_ready = self.is_ready.read().await;
            if !*is_ready {
                return Err("LLM not ready - call initialize first".to_string());
            }
        }

        let model_name = {
            let current_model = self.current_model.read().await;
            current_model.clone().ok_or("No model loaded")?
        };

        let system_prompt = self.get_vibe_system_prompt(&vibe);

        let messages = vec![
            ChatMessage::system(system_prompt),
            ChatMessage::user(format!(r#"Process this story note: "{}""#, note)),
        ];

        let chat_request = ChatMessageRequest::new(
            model_name,
            messages,
        );

        // For now, we'll make a simple request without function calling
        // The Natural Functions model should understand function calls from context
        let response = self.ollama
            .send_chat_messages(chat_request)
            .await
            .map_err(|e| format!("Failed to generate response: {}", e))?;

        let enhanced_text = response.message.content;

        // TODO: Parse function calls from the response
        // Natural Functions model might return function calls in a structured format
        // For now, return empty actions array
        let actions = vec![];

        // Validate that text was actually enhanced
        if enhanced_text.trim() == note.trim() {
            eprintln!("Warning: AI returned unchanged text - enhancement may have failed");
        }

        Ok(EnhancementResult {
            enhanced_text,
            actions,
        })
    }

    pub async fn is_initialized(&self) -> bool {
        let is_ready = self.is_ready.read().await;
        *is_ready
    }
}

impl Default for LlmService {
    fn default() -> Self {
        Self::new()
    }
}