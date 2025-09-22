use crate::llm_service::{LlmService, CampaignVibe, EnhancementResult, ModelInfo};
use std::sync::Arc;
use tauri::{State, AppHandle};
use tokio::sync::Mutex;

// Global state for the LLM service
pub struct AppState {
    pub llm_service: Arc<Mutex<LlmService>>,
}

#[tauri::command]
pub async fn check_ollama_status(
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let service = state.llm_service.lock().await;
    service.check_ollama_status().await
}

#[tauri::command]
pub async fn list_models(
    state: State<'_, AppState>,
) -> Result<Vec<ModelInfo>, String> {
    let service = state.llm_service.lock().await;
    service.list_models().await
}

#[tauri::command]
pub async fn initialize_llm(
    model_name: String,
    app_handle: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let service = state.llm_service.lock().await;
    service.initialize(&model_name, app_handle).await
}

#[tauri::command]
pub async fn enhance_note(
    note: String,
    vibe: CampaignVibe,
    state: State<'_, AppState>,
) -> Result<EnhancementResult, String> {
    let service = state.llm_service.lock().await;
    service.enhance(&note, vibe).await
}

#[tauri::command]
pub async fn is_llm_ready(
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let service = state.llm_service.lock().await;
    Ok(service.is_initialized().await)
}

#[tauri::command]
pub async fn ensure_model(
    model_name: String,
    app_handle: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let service = state.llm_service.lock().await;
    service.ensure_model(&model_name, app_handle).await
}