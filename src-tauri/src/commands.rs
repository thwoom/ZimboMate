use crate::llm_service::{CampaignVibe, EnhancementResult, LlmService, ModelInfo};
use std::sync::Arc;
use tauri::{AppHandle, State};
use tokio::sync::Mutex;

// Global state for the LLM service
pub struct AppState {
    pub llm_service: Arc<Mutex<LlmService>>,
}

#[tauri::command]
pub async fn check_llm_status(
    model_name: Option<String>,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let service = state.llm_service.lock().await;
    service.check_service_status(model_name.as_deref()).await
}

#[tauri::command]
pub async fn list_models(state: State<'_, AppState>) -> Result<Vec<ModelInfo>, String> {
    let service = state.llm_service.lock().await;
    service.list_models().await
}

#[tauri::command]
pub async fn initialize_llm(
    model_name: Option<String>,
    app_handle: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let service = state.llm_service.lock().await;
    let model = model_name.unwrap_or_default();
    service.initialize(&model, app_handle).await
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
pub async fn is_llm_ready(state: State<'_, AppState>) -> Result<bool, String> {
    let service = state.llm_service.lock().await;
    Ok(service.is_initialized().await)
}
