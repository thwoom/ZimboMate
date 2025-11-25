use crate::{
    embedded_engine::{
        EmbeddedEngine, EmbeddedEngineError, EmbeddedToolRunRequest, EmbeddedToolRunResponse,
    },
    embedded_runtime::{
        EmbeddedModelDescriptor, EmbeddedModelKind, EmbeddedRuntimeDownloadError,
        EmbeddedRuntimeError, EmbeddedRuntimeHost, EmbeddedRuntimeManifest,
    },
    llm_service::{
        CampaignVibe, ChronicleProposeRequest, ChronicleProposeResponse, EnhancementResult,
        LlmService, ModelInfo,
    },
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{env, process::Command, sync::Arc};
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

#[derive(Debug, Serialize)]
pub struct PortProcessInfo {
    #[serde(rename = "localAddress")]
    pub local_address: String,
    #[serde(rename = "localPort")]
    pub local_port: u16,
    #[serde(rename = "remoteAddress")]
    pub remote_address: String,
    #[serde(rename = "remotePort")]
    pub remote_port: u16,
    pub state: String,
    #[serde(rename = "pid")]
    pub pid: u32,
    #[serde(rename = "processName")]
    pub process_name: Option<String>,
    #[serde(rename = "commandLine")]
    pub command_line: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct AdminPathsResponse {
    #[serde(rename = "credentialsFile")]
    pub credentials_file: Option<String>,
    #[serde(rename = "logsDirectory")]
    pub logs_directory: String,
    #[serde(rename = "workspaceRoot")]
    pub workspace_root: String,
}

#[derive(Debug, Serialize)]
pub struct LlmCredentialsResponse {
    #[serde(rename = "apiKey")]
    pub api_key: Option<String>,
    #[serde(rename = "apiKeySource")]
    pub api_key_source: Option<String>,
    #[serde(rename = "baseUrl")]
    pub base_url: String,
    #[serde(rename = "baseUrlSource")]
    pub base_url_source: String,
    pub model: String,
    #[serde(rename = "modelSource")]
    pub model_source: String,
    #[serde(rename = "projectId")]
    pub project_id: Option<String>,
    #[serde(rename = "projectIdSource")]
    pub project_id_source: Option<String>,
    #[serde(rename = "hasOverride")]
    pub has_override: bool,
}

#[derive(Debug, Deserialize)]
pub struct UpdateLlmCredentialsPayload {
    #[serde(rename = "apiKey")]
    pub api_key: Option<String>,
    #[serde(rename = "baseUrl")]
    pub base_url: Option<String>,
    pub model: Option<String>,
    #[serde(rename = "projectId")]
    pub project_id: Option<String>,
}

// Global state for the LLM service
pub struct AppState {
    pub llm_service: Arc<Mutex<LlmService>>,
    pub embedded_runtime: Arc<EmbeddedRuntimeHost>,
    pub embedded_engine: Arc<EmbeddedEngine>,
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

fn parse_runtime_kind(kind: Option<String>) -> Result<EmbeddedModelKind, String> {
    match kind
        .as_deref()
        .map(|value| value.trim().to_lowercase())
        .as_deref()
    {
        Some("rules") | Some("tool") | Some("tools") | Some("qwen") => Ok(EmbeddedModelKind::Rules),
        Some("narration") | Some("voice") | Some("mistral") | Some("writer") => {
            Ok(EmbeddedModelKind::Narration)
        }
        Some(other) => Err(format!("Unknown embedded model kind '{other}'")),
        None => Err("Model kind is required (rules|narration)".to_string()),
    }
}

#[tauri::command]
pub async fn embedded_runtime_list_models(
    state: State<'_, AppState>,
) -> Result<Vec<EmbeddedModelDescriptor>, String> {
    Ok(state.embedded_runtime.describe_models().await)
}

#[tauri::command]
pub fn embedded_runtime_get_manifest(
    state: State<'_, AppState>,
) -> Result<EmbeddedRuntimeManifest, String> {
    Ok(state.embedded_runtime.manifest().clone())
}

#[tauri::command]
pub async fn embedded_runtime_ensure_model(
    kind: Option<String>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let parsed_kind = parse_runtime_kind(kind)?;
    state
        .embedded_runtime
        .ensure_ready(parsed_kind)
        .await
        .map_err(|error| match error {
            EmbeddedRuntimeError::MissingModel(path) => {
                format!("Model file missing: {path}")
            }
            EmbeddedRuntimeError::UnknownModelKind => "Unknown embedded model kind".to_string(),
        })
}

#[tauri::command]
pub async fn embedded_runtime_download_model(
    kind: Option<String>,
    app_handle: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let parsed_kind = parse_runtime_kind(kind)?;
    state
        .embedded_runtime
        .download_model(parsed_kind, &app_handle)
        .await
        .map_err(|error| match error {
            EmbeddedRuntimeDownloadError::Busy => {
                "Another embedded model download is already running".to_string()
            }
            other => other.to_string(),
        })
}

#[tauri::command]
pub async fn embedded_runtime_cancel_download(
    kind: Option<String>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let parsed_kind = parse_runtime_kind(kind)?;
    state
        .embedded_runtime
        .cancel_download(parsed_kind)
        .await
        .map_err(|error| match error {
            EmbeddedRuntimeDownloadError::NoActiveDownload => {
                "No embedded download is currently running for this model".to_string()
            }
            other => other.to_string(),
        })
}

#[tauri::command]
pub fn embedded_runtime_models_dir(state: State<'_, AppState>) -> Result<String, String> {
    Ok(state.embedded_runtime.models_dir().display().to_string())
}

#[tauri::command]
pub async fn embedded_runtime_load_model(
    kind: Option<String>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let parsed_kind = parse_runtime_kind(kind)?;
    state
        .embedded_engine
        .ensure_model_loaded(parsed_kind)
        .await
        .map_err(|error| match error {
            EmbeddedEngineError::Host(message) => message,
            other => other.to_string(),
        })
}

#[tauri::command]
pub async fn embedded_runtime_run_tools(
    kind: Option<String>,
    prompt: String,
    state: State<'_, AppState>,
) -> Result<EmbeddedToolRunResponse, String> {
    let parsed_kind = parse_runtime_kind(kind)?;
    let request = EmbeddedToolRunRequest { prompt };
    state
        .embedded_engine
        .run_tools(parsed_kind, request)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn embedded_runtime_run_narration(
    kind: Option<String>,
    prompt: String,
    state: State<'_, AppState>,
) -> Result<EmbeddedToolRunResponse, String> {
    let parsed_kind = parse_runtime_kind(kind)?;
    let request = EmbeddedToolRunRequest { prompt };
    state
        .embedded_engine
        .run_narration(parsed_kind, request)
        .await
        .map_err(|error| error.to_string())
}

fn build_credentials_response(service: &LlmService) -> LlmCredentialsResponse {
    let (api_key, api_key_source) = service
        .effective_api_key()
        .map(|(value, src)| (Some(value), Some(src.to_string())))
        .unwrap_or((None, None));
    let (base_url, base_url_source) = service.effective_base_url();
    let (model, model_source) = service.effective_model();
    let project = service.effective_project_id();

    LlmCredentialsResponse {
        api_key,
        api_key_source,
        base_url,
        base_url_source: base_url_source.to_string(),
        model,
        model_source: model_source.to_string(),
        project_id: project.as_ref().map(|(value, _)| value.clone()),
        project_id_source: project.as_ref().map(|(_, src)| src.to_string()),
        has_override: service.has_any_override(),
    }
}

#[tauri::command]
pub async fn get_llm_credentials(
    state: State<'_, AppState>,
) -> Result<LlmCredentialsResponse, String> {
    let service = state.llm_service.lock().await;
    Ok(build_credentials_response(&service))
}

#[tauri::command]
pub async fn set_llm_credentials(
    app_handle: AppHandle,
    payload: UpdateLlmCredentialsPayload,
    state: State<'_, AppState>,
) -> Result<LlmCredentialsResponse, String> {
    let mut service = state.llm_service.lock().await;
    let UpdateLlmCredentialsPayload {
        api_key,
        base_url,
        model,
        project_id,
    } = payload;
    let changed = service
        .update_overrides(api_key, base_url, model, project_id)
        .await?;
    let snapshot = if changed {
        Some(service.snapshot_credentials())
    } else {
        None
    };
    let response = build_credentials_response(&service);
    drop(service);

    if let Some(credentials) = snapshot {
        LlmService::persist_credentials_snapshot(credentials, &app_handle).await?;
    }

    Ok(response)
}

#[tauri::command]
pub async fn fetch_llm_usage(
    date: Option<String>,
    state: State<'_, AppState>,
) -> Result<Value, String> {
    let service = state.llm_service.lock().await;
    service.fetch_usage(date).await
}

#[tauri::command]
pub async fn get_admin_paths() -> Result<AdminPathsResponse, String> {
    let workspace_root =
        env::current_dir().map_err(|error| format!("Failed to resolve workspace root: {error}"))?;
    let logs_directory = workspace_root.join("logs");

    Ok(AdminPathsResponse {
        credentials_file: None,
        logs_directory: logs_directory.to_string_lossy().to_string(),
        workspace_root: workspace_root.to_string_lossy().to_string(),
    })
}

#[tauri::command]
pub async fn diagnose_dev_port(port: Option<u16>) -> Result<Vec<PortProcessInfo>, String> {
    diagnose_port_impl(port.unwrap_or(1420))
}

#[tauri::command]
pub async fn terminate_process(pid: u32) -> Result<(), String> {
    terminate_process_impl(pid)
}

#[cfg(target_os = "windows")]
fn value_to_u16(value: &Value) -> Option<u16> {
    match value {
        Value::Number(number) => number.as_u64().map(|v| v as u16),
        Value::String(text) => text.parse::<u16>().ok(),
        _ => None,
    }
}

#[cfg(target_os = "windows")]
fn value_to_u32(value: &Value) -> Option<u32> {
    match value {
        Value::Number(number) => number.as_u64().map(|v| v as u32),
        Value::String(text) => text.parse::<u32>().ok(),
        _ => None,
    }
}

#[cfg(target_os = "windows")]
fn diagnose_port_impl(port: u16) -> Result<Vec<PortProcessInfo>, String> {
    let script = format!(
        "$entries = Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue | Select-Object LocalAddress,LocalPort,RemoteAddress,RemotePort,State,OwningProcess; if ($entries) {{ $entries | ForEach-Object {{ $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue; $cmd = Get-CimInstance Win32_Process -Filter \\\"ProcessId=$($_.OwningProcess)\\\" -ErrorAction SilentlyContinue; $_ | Add-Member -NotePropertyName ProcessName -NotePropertyValue ($proc.ProcessName) -Force; $_ | Add-Member -NotePropertyName CommandLine -NotePropertyValue ($cmd.CommandLine) -Force }}; $entries | ConvertTo-Json -Depth 4 -Compress }} else {{ '[]' }}"
    );

    let output = Command::new("powershell")
        .args(["-NoLogo", "-NoProfile", "-Command", &script])
        .output()
        .map_err(|error| format!("Failed to run PowerShell: {error}"))?;

    if !output.status.success() {
        return Err(format!(
            "PowerShell exited with status {}",
            output.status.code().unwrap_or(-1)
        ));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let trimmed = stdout.trim();
    let json_text = if trimmed.is_empty() {
        "[]".to_string()
    } else {
        trimmed.to_string()
    };

    let parsed: Value = serde_json::from_str(&json_text)
        .map_err(|error| format!("Failed to parse port diagnostics output: {error}"))?;

    let entries: Vec<Value> = match parsed {
        Value::Array(items) => items,
        Value::Null => Vec::new(),
        other => vec![other],
    };

    let mut results: Vec<PortProcessInfo> = Vec::new();

    for entry in entries {
        let map = match entry {
            Value::Object(map) => map,
            _ => continue,
        };

        let local_address = map
            .get("LocalAddress")
            .and_then(Value::as_str)
            .unwrap_or("0.0.0.0")
            .to_string();
        let local_port = map.get("LocalPort").and_then(value_to_u16).unwrap_or(0);
        if local_port == 0 {
            continue;
        }

        let remote_address = map
            .get("RemoteAddress")
            .and_then(Value::as_str)
            .unwrap_or("0.0.0.0")
            .to_string();
        let remote_port = map.get("RemotePort").and_then(value_to_u16).unwrap_or(0);
        let state = map
            .get("State")
            .and_then(Value::as_str)
            .unwrap_or("Unknown")
            .to_string();
        let pid = map.get("OwningProcess").and_then(value_to_u32).unwrap_or(0);

        let process_name = map
            .get("ProcessName")
            .and_then(Value::as_str)
            .map(|value| value.to_string());
        let command_line = map
            .get("CommandLine")
            .and_then(Value::as_str)
            .map(|value| value.to_string());

        results.push(PortProcessInfo {
            local_address,
            local_port,
            remote_address,
            remote_port,
            state,
            pid,
            process_name,
            command_line,
        });
    }

    Ok(results)
}

#[cfg(not(target_os = "windows"))]
fn diagnose_port_impl(_port: u16) -> Result<Vec<PortProcessInfo>, String> {
    Err("Port diagnostics are not supported on this platform yet.".to_string())
}

#[cfg(target_os = "windows")]
fn terminate_process_impl(pid: u32) -> Result<(), String> {
    let status = Command::new("taskkill")
        .args(["/PID", &pid.to_string(), "/F"])
        .status()
        .map_err(|error| format!("Failed to run taskkill: {error}"))?;

    if !status.success() {
        return Err(format!(
            "taskkill exited with status {}",
            status.code().unwrap_or(-1)
        ));
    }

    Ok(())
}

#[cfg(not(target_os = "windows"))]
fn terminate_process_impl(pid: u32) -> Result<(), String> {
    let status = Command::new("kill")
        .args(["-9", &pid.to_string()])
        .status()
        .map_err(|error| format!("Failed to run kill: {error}"))?;

    if !status.success() {
        return Err(format!(
            "kill exited with status {}",
            status.code().unwrap_or(-1)
        ));
    }

    Ok(())
}
