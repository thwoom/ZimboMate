use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::time::Duration;
use tauri::Emitter;
use tokio::sync::RwLock;

const DEFAULT_BASE_URL: &str = "https://api.openai.com/v1";
const DEFAULT_MODEL: &str = "gpt-5-chat-latest";
const INITIALIZING_STAGE: &str = "initializing";
const READY_STAGE: &str = "ready";
const ERROR_STAGE: &str = "error";

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
    #[serde(rename = "type")]
    pub r#type: String,
    #[serde(default)]
    pub params: Value,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EnhancementResult {
    #[serde(default)]
    pub enhanced_text: String,
    #[serde(default)]
    pub actions: Vec<CharacterAction>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AIProgress {
    pub progress: f64, // 0.0 - 100.0
    pub text: String,
    pub time_remaining: Option<String>,
    pub stage: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ModelInfo {
    pub name: String,
    pub size_gb: f64,
    pub is_available: bool,
    pub is_loaded: bool,
}

pub struct LlmService {
    client: Client,
    base_url: String,
    default_model: String,
    prompt_cache_key: Option<String>,
    current_model: RwLock<Option<String>>,
    is_ready: RwLock<bool>,
}

impl LlmService {
    pub fn new() -> Self {
        LlmService::load_env_file();
        let base_url = LlmService::read_env_var("OPENAI_BASE_URL")
            .unwrap_or_else(|| DEFAULT_BASE_URL.to_string());
        let default_model = LlmService::read_env_var("OPENAI_RESPONSES_MODEL")
            .unwrap_or_else(|| DEFAULT_MODEL.to_string());

        let prompt_cache_key = LlmService::read_env_var("OPENAI_PROMPT_CACHE_KEY");

        let client = Client::builder()
            .timeout(Duration::from_secs(120))
            .build()
            .expect("failed to build HTTP client for OpenAI Responses API");

        Self {
            client,
            base_url,
            default_model,
            prompt_cache_key,
            current_model: RwLock::new(None),
            is_ready: RwLock::new(false),
        }
    }

    fn load_env_file() {
        if let Ok(contents) = std::fs::read_to_string(".env") {
            for raw_line in contents.lines() {
                let trimmed = raw_line.trim();
                if trimmed.is_empty() || trimmed.starts_with('#') {
                    continue;
                }

                let without_export = trimmed.strip_prefix("export ").unwrap_or(trimmed).trim();
                let mut parts = without_export.splitn(2, '=');
                if let (Some(key_part), Some(value_part)) = (parts.next(), parts.next()) {
                    let key = key_part.trim();
                    if key.is_empty() {
                        continue;
                    }
                    let value = value_part.trim().trim_matches(|c| c == '"' || c == '\'');
                    if std::env::var(key).is_err() {
                        std::env::set_var(key, value);
                    }
                }
            }
        }
    }

    fn read_env_var(key: &str) -> Option<String> {
        std::env::var(key)
            .ok()
            .map(|value| value.trim().to_string())
            .filter(|value| !value.is_empty())
    }

    fn require_api_key(&self) -> Result<String, String> {
        LlmService::read_env_var("OPENAI_API_KEY")
            .ok_or_else(|| "OPENAI_API_KEY is not configured".to_string())
    }

    fn has_api_key(&self) -> bool {
        LlmService::read_env_var("OPENAI_API_KEY").is_some()
    }

    fn normalize_base_url(&self) -> String {
        self.base_url.trim_end_matches('/').to_string()
    }

    pub async fn check_service_status(&self, model_name: Option<&str>) -> Result<bool, String> {
        let key = self.require_api_key()?;
        let requested = model_name
            .map(|name| name.trim())
            .filter(|name| !name.is_empty())
            .unwrap_or_else(|| self.default_model.as_str());
        let url = format!("{}/models/{}", self.normalize_base_url(), requested);
        let response = self
            .client
            .get(&url)
            .bearer_auth(&key)
            .send()
            .await
            .map_err(|e| format!("Failed to reach OpenAI for model {}: {}", requested, e))?;

        if response.status().is_success() {
            Ok(true)
        } else {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            Err(format!(
                "OpenAI responded with {} for {}: {}",
                status, requested, body
            ))
        }
    }

    pub async fn list_models(&self) -> Result<Vec<ModelInfo>, String> {
        let is_available = self.has_api_key();
        let is_loaded = *self.is_ready.read().await;
        Ok(vec![ModelInfo {
            name: self.default_model.clone(),
            size_gb: 0.0,
            is_available,
            is_loaded,
        }])
    }

    async fn emit_progress(&self, app_handle: &tauri::AppHandle, progress: AIProgress) {
        let _ = app_handle.emit("llm_progress", progress);
    }

    pub async fn initialize(
        &self,
        model_name: &str,
        app_handle: tauri::AppHandle,
    ) -> Result<(), String> {
        let target_model = if model_name.trim().is_empty() {
            self.default_model.clone()
        } else {
            model_name.trim().to_string()
        };

        self.emit_progress(
            &app_handle,
            AIProgress {
                progress: 10.0,
                text: format!("Connecting to ChatGPT (model: {})", target_model),
                time_remaining: None,
                stage: INITIALIZING_STAGE.to_string(),
            },
        )
        .await;

        self.emit_progress(
            &app_handle,
            AIProgress {
                progress: 40.0,
                text: format!("Verifying model access for {}", target_model),
                time_remaining: None,
                stage: INITIALIZING_STAGE.to_string(),
            },
        )
        .await;

        if let Err(error) = self.check_service_status(Some(target_model.as_str())).await {
            self.blocking_emit_error(&app_handle, error.clone());
            return Err(error);
        }

        {
            let mut current_model = self.current_model.write().await;
            *current_model = Some(target_model.clone());
        }

        {
            let mut ready = self.is_ready.write().await;
            *ready = true;
        }

        self.emit_progress(
            &app_handle,
            AIProgress {
                progress: 100.0,
                text: format!("ChatGPT ready (model: {})", target_model),
                time_remaining: None,
                stage: READY_STAGE.to_string(),
            },
        )
        .await;

        Ok(())
    }

    fn blocking_emit_error(&self, app_handle: &tauri::AppHandle, message: String) {
        let _ = app_handle.emit(
            "llm_progress",
            AIProgress {
                progress: 0.0,
                text: message,
                time_remaining: None,
                stage: ERROR_STAGE.to_string(),
            },
        );
    }

    fn vibe_slug(vibe: &CampaignVibe) -> &'static str {
        match vibe {
            CampaignVibe::Fantasy => "fantasy",
            CampaignVibe::SciFi => "scifi",
            CampaignVibe::Cyberpunk => "cyberpunk",
            CampaignVibe::Horror => "horror",
            CampaignVibe::Western => "western",
            CampaignVibe::Modern => "modern",
        }
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

        format!(
            r#"<system>
{    }

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

Return JSON that matches the provided schema exactly. Never omit required fields.
</system>"#,
            vibe_prompt
        )
    }

    pub async fn enhance(
        &self,
        note: &str,
        vibe: CampaignVibe,
    ) -> Result<EnhancementResult, String> {
        {
            let is_ready = self.is_ready.read().await;
            if !*is_ready {
                return Err("LLM not ready - call initialize first".to_string());
            }
        }

        let key = self.require_api_key()?;
        let model_name = {
            let current_model = self.current_model.read().await;
            current_model
                .clone()
                .unwrap_or_else(|| self.default_model.clone())
        };

        let system_prompt = self.get_vibe_system_prompt(&vibe);
        let vibe_slug = Self::vibe_slug(&vibe);
        let trimmed_note = note.trim();
        let reasoning_needed = trimmed_note.chars().filter(|c| !c.is_whitespace()).count() > 320;

        let mut payload = json!({
            "model": model_name,
            "input": [
                    {
                    "role": "system",
                    "content": [
                            {
                            "type": "text",
                            "text": system_prompt,
                        }
                    ]
                },
                    {
                    "role": "user",
                    "content": [
                            {
                            "type": "text",
                            "text": format!(r#"Process this story note: "{}""#, trimmed_note),
                        }
                    ]
                }
            ],
            "temperature": 0.7,
            "max_output_tokens": 650,
            "parallel_tool_calls": true,
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "enhancement_response",
                    "strict": true,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "enhancedText": { "type": "string" },
                            "actions": {
                                "type": "array",
                                "items": {
                                    "oneOf": [
                                            {
                                            "type": "object",
                                            "properties": {
                                                "type": { "const": "apply_debility" },
                                                "params": {
                                                    "type": "object",
                                                    "properties": {
                                                        "debility": { "type": "string" },
                                                        "reason": { "type": "string" }
                                                    },
                                                    "required": ["debility", "reason"],
                                                    "additionalProperties": false
                                                }
                                            },
                                            "required": ["type", "params"],
                                            "additionalProperties": false
                                        },
                                            {
                                            "type": "object",
                                            "properties": {
                                                "type": { "const": "modify_hp" },
                                                "params": {
                                                    "type": "object",
                                                    "properties": {
                                                        "change": { "type": "number" },
                                                        "reason": { "type": "string" }
                                                    },
                                                    "required": ["change", "reason"],
                                                    "additionalProperties": false
                                                }
                                            },
                                            "required": ["type", "params"],
                                            "additionalProperties": false
                                        },
                                            {
                                            "type": "object",
                                            "properties": {
                                                "type": { "const": "add_gear" },
                                                "params": {
                                                    "type": "object",
                                                    "properties": {
                                                        "name": { "type": "string" },
                                                        "description": { "type": "string" },
                                                        "tags": {
                                                            "type": "array",
                                                            "items": { "type": "string" }
                                                        },
                                                        "weight": { "type": "number" },
                                                        "uses": { "type": "number" }
                                                    },
                                                    "required": ["name", "description"],
                                                    "additionalProperties": false
                                                }
                                            },
                                            "required": ["type", "params"],
                                            "additionalProperties": false
                                        },
                                            {
                                            "type": "object",
                                            "properties": {
                                                "type": { "const": "spend_resource" },
                                                "params": {
                                                    "type": "object",
                                                    "properties": {
                                                        "resource": { "type": "string" },
                                                        "amount": { "type": "number" },
                                                        "reason": { "type": "string" }
                                                    },
                                                    "required": ["resource", "amount", "reason"],
                                                    "additionalProperties": false
                                                }
                                            },
                                            "required": ["type", "params"],
                                            "additionalProperties": false
                                        },
                                            {
                                            "type": "object",
                                            "properties": {
                                                "type": { "const": "gain_xp" },
                                                "params": {
                                                    "type": "object",
                                                    "properties": {
                                                        "amount": { "type": "number" },
                                                        "trigger": {
                                                            "type": "string",
                                                            "enum": ["failure", "alignment", "end_session", "discovery"]
                                                        },
                                                        "description": { "type": "string" }
                                                    },
                                                    "required": ["amount", "trigger", "description"],
                                                    "additionalProperties": false
                                                }
                                            },
                                            "required": ["type", "params"],
                                            "additionalProperties": false
                                        },
                                            {
                                            "type": "object",
                                            "properties": {
                                                "type": { "const": "update_bonds" },
                                                "params": {
                                                    "type": "object",
                                                    "properties": {
                                                        "character": { "type": "string" },
                                                        "new_bond": { "type": "string" },
                                                        "action": {
                                                            "type": "string",
                                                            "enum": ["create", "resolve", "update"]
                                                        }
                                                    },
                                                    "required": ["character", "new_bond", "action"],
                                                    "additionalProperties": false
                                                }
                                            },
                                            "required": ["type", "params"],
                                            "additionalProperties": false
                                        }
                                    ]
                                },
                                "default": []
                            }
                        },
                        "required": ["enhancedText", "actions"],
                        "additionalProperties": false
                    }
                }
            },
            "metadata": {
                "source": "chronicle-note-enhancer",
                "vibe": vibe_slug,
            }
        });

        if let Some(cache_key) = &self.prompt_cache_key {
            if let Some(obj) = payload.as_object_mut() {
                obj.insert(
                    "prompt_cache_key".to_string(),
                    Value::String(format!("{}::{}", cache_key, vibe_slug)),
                );
            }
        }

        if reasoning_needed {
            if let Some(obj) = payload.as_object_mut() {
                obj.insert(
                    "reasoning".to_string(),
                    json!({
                        "effort": "medium",
                        "summary": "concise"
                    }),
                );
            }
        }

        let url = format!("{}/responses", self.normalize_base_url());
        let response = self
            .client
            .post(&url)
            .bearer_auth(&key)
            .json(&payload)
            .send()
            .await
            .map_err(|e| format!("Failed to call OpenAI Responses API: {}", e))?;

        let status = response.status();
        let raw_body = response.text().await.unwrap_or_default();

        if !status.is_success() {
            return Err(format!("OpenAI API error ({}): {}", status, raw_body));
        }

        let value: Value = serde_json::from_str(&raw_body)
            .map_err(|e| format!("Failed to parse OpenAI response JSON: {}", e))?;

        if let Some(error) = value.get("error") {
            let serialized =
                serde_json::to_string(error).unwrap_or_else(|_| "unknown error".to_string());
            return Err(format!("OpenAI returned an error payload: {}", serialized));
        }

        if let Some(reason) = value
            .get("incomplete_details")
            .and_then(|details| details.get("reason"))
            .and_then(Value::as_str)
        {
            return Err(format!("OpenAI response incomplete: {}", reason));
        }

        if let Some(usage) = value.get("usage") {
            let input_tokens = usage
                .get("input_tokens")
                .and_then(Value::as_i64)
                .unwrap_or(0);
            let output_tokens = usage
                .get("output_tokens")
                .and_then(Value::as_i64)
                .unwrap_or(0);
            let total_tokens = usage
                .get("total_tokens")
                .and_then(Value::as_i64)
                .unwrap_or(0);
            eprintln!(
                "[ChatGPT] Responses usage - input: {}, output: {}, total: {}",
                input_tokens, output_tokens, total_tokens
            );
        }

        let structured_json = extract_structured_json(&value).ok_or_else(|| {
            "Unable to extract structured enhancement payload from OpenAI response".to_string()
        })?;

        let result: EnhancementResult = serde_json::from_value(structured_json)
            .map_err(|e| format!("Unable to deserialize enhancement payload: {}", e))?;

        Ok(result)
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

fn extract_structured_json(value: &Value) -> Option<Value> {
    if let Some(outputs) = value.get("output").and_then(|o| o.as_array()) {
        for output in outputs {
            if let Some(content_items) = output.get("content").and_then(|c| c.as_array()) {
                for content in content_items {
                    if let Some(content_type) = content.get("type").and_then(|t| t.as_str()) {
                        match content_type {
                            "json_schema" | "json" => {
                                if let Some(json_value) = content.get("json") {
                                    return Some(json_value.clone());
                                }
                            }
                            "output_text" | "text" => {
                                if let Some(text) = content.get("text").and_then(|t| t.as_str()) {
                                    if let Ok(parsed) = serde_json::from_str::<Value>(text) {
                                        return Some(parsed);
                                    }
                                }
                            }
                            _ => {}
                        }
                    }
                }
            }

            if let Some(text) = output.get("text").and_then(|t| t.as_str()) {
                if let Ok(parsed) = serde_json::from_str::<Value>(text) {
                    return Some(parsed);
                }
            }
        }
    }

    if let Some(content_items) = value.get("content").and_then(|c| c.as_array()) {
        for content in content_items {
            if let Some(content_type) = content.get("type").and_then(|t| t.as_str()) {
                match content_type {
                    "json_schema" | "json" => {
                        if let Some(json_value) = content.get("json") {
                            return Some(json_value.clone());
                        }
                    }
                    "output_text" | "text" => {
                        if let Some(text) = content.get("text").and_then(|t| t.as_str()) {
                            if let Ok(parsed) = serde_json::from_str::<Value>(text) {
                                return Some(parsed);
                            }
                        }
                    }
                    _ => {}
                }
            }
        }
    }

    if let Some(text) = value.get("output_text").and_then(|t| t.as_str()) {
        if let Ok(parsed) = serde_json::from_str::<Value>(text) {
            return Some(parsed);
        }
    }

    None
}
