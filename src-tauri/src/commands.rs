use serde_json::Value;
use serde::{Deserialize, Serialize};
use crate::llm_service::{CampaignVibe, ChronicleProposeRequest, ChronicleProposeResponse, EnhancementResult, LlmService, ModelInfo};
use std::sync::Arc;
use tauri::{AppHandle, State};
use tokio::sync::Mutex;
#[derive(Debug, Deserialize)]
pub struct ApplyDeltaBundleRequestPayload {
    pub bundle: Value,
    #[serde(rename = "autoApply")]
    pub auto_apply: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct ApplyDeltaBundleResponsePayload {
    #[serde(rename = "bundleId")]
    pub bundle_id: String,
    #[serde(rename = "appliedOps")]
    pub applied_ops: Vec<Value>,
    #[serde(rename = "skippedOps")]
    pub skipped_ops: Vec<Value>,
    #[serde(rename = "undoHandle")]
    pub undo_handle: UndoHandlePayload,
}

#[derive(Debug, Serialize)]
pub struct UndoHandlePayload {
    #[serde(rename = "bundleId")]
    pub bundle_id: String,
    #[serde(rename = "issuedAt")]
    pub issued_at: String,
}


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
pub async fn chronicle_propose_deltas(
    request: ChronicleProposeRequest,
    app_handle: AppHandle,
    state: State<'_, AppState>,
) -> Result<ChronicleProposeResponse, String> {
    let service = state.llm_service.lock().await;
    service.propose_deltas(request, &app_handle).await
}

#[tauri::command]
pub async fn chronicle_apply_delta_bundle(
    request: ApplyDeltaBundleRequestPayload,
) -> Result<ApplyDeltaBundleResponsePayload, String> {
    let bundle = request.bundle;
    let bundle_id = bundle
        .get("idempotencyKey")
        .or_else(|| bundle.get("idempotency_key"))
        .or_else(|| bundle.get("entryId"))
        .and_then(Value::as_str)
        .unwrap_or("unknown_bundle")
        .to_string();
    let applied_ops = bundle
        .get("ops")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();

    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
        .to_string();

    Ok(ApplyDeltaBundleResponsePayload {
        bundle_id: bundle_id.clone(),
        applied_ops,
        skipped_ops: Vec::new(),
        undo_handle: UndoHandlePayload {
            bundle_id,
            issued_at: timestamp,
        },
    })
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
