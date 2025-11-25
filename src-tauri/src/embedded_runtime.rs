use chrono::Utc;
use futures_util::StreamExt;
use hex::encode as hex_encode;
use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::HashMap,
    fs, io,
    path::{Path, PathBuf},
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc,
    },
    time::Instant,
};
use tauri::{AppHandle, Emitter};
use thiserror::Error;
use tokio::{
    fs as tokio_fs,
    io::{AsyncReadExt, AsyncWriteExt, BufReader},
    sync::{Mutex, OwnedSemaphorePermit, RwLock, Semaphore, TryAcquireError},
};

const EVENT_DOWNLOAD_STARTED: &str = "embedded_runtime::download_started";
const EVENT_DOWNLOAD_PROGRESS: &str = "embedded_runtime::download_progress";
const EVENT_DOWNLOAD_VERIFYING: &str = "embedded_runtime::download_verifying";
const EVENT_DOWNLOAD_COMPLETE: &str = "embedded_runtime::download_complete";
const EVENT_DOWNLOAD_ERROR: &str = "embedded_runtime::download_error";
const EVENT_DOWNLOAD_CANCELLED: &str = "embedded_runtime::download_cancelled";
const EVENT_DOWNLOAD_TELEMETRY: &str = "embedded_runtime::download_telemetry";

#[derive(Clone, Copy, Debug, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum EmbeddedModelKind {
    Rules,
    Narration,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EmbeddedModelManifestEntry {
    pub kind: EmbeddedModelKind,
    pub model_id: String,
    pub display_name: String,
    pub filename: String,
    pub quantization: String,
    pub parameter_count: u32,
    pub description: String,
    pub download_url: String,
    pub sha256: String,
    pub size_bytes: u64,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EmbeddedModelDescriptor {
    pub kind: EmbeddedModelKind,
    pub model_id: String,
    pub display_name: String,
    pub quantization: String,
    pub parameter_count: u32,
    pub description: String,
    pub size_bytes: u64,
    pub expected_path: String,
    pub status: EmbeddedModelStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resume_bytes: Option<u64>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(tag = "state", rename_all = "snake_case")]
pub enum EmbeddedModelStatus {
    Missing,
    Ready { loaded_at: String },
    Loading { progress: f32 },
    Error { message: String },
}

#[derive(Debug, Error)]
pub enum EmbeddedRuntimeError {
    #[error("model file missing: {0}")]
    MissingModel(String),
    #[error("unknown model kind")]
    UnknownModelKind,
}

#[derive(Debug, Error)]
pub enum EmbeddedRuntimeDownloadError {
    #[error("unknown model kind")]
    UnknownModelKind,
    #[error("a model download is already in progress")]
    Busy,
    #[error("no active download for this model")]
    NoActiveDownload,
    #[error("network error: {0}")]
    Network(String),
    #[error("download failed with status {0}")]
    Http(u16),
    #[error("unable to write model file: {0}")]
    Io(String),
    #[error("checksum mismatch (expected {expected}, got {actual})")]
    ChecksumMismatch { expected: String, actual: String },
    #[error("download cancelled")]
    Cancelled,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EmbeddedRuntimeManifest {
    pub models: Vec<EmbeddedModelManifestEntry>,
}

impl EmbeddedRuntimeManifest {
    pub fn entry(&self, kind: EmbeddedModelKind) -> Option<&EmbeddedModelManifestEntry> {
        self.models.iter().find(|entry| entry.kind == kind)
    }

    pub fn all(&self) -> &[EmbeddedModelManifestEntry] {
        &self.models
    }

    pub fn from_bundled_json() -> Self {
        let raw = include_str!("../assets/embedded_manifest.json");
        match serde_json::from_str(raw) {
            Ok(manifest) => manifest,
            Err(error) => {
                log::error!(
                    "[embedded-llm] failed to parse embedded manifest JSON, falling back to defaults: {error}"
                );
                Self::fallback()
            }
        }
    }

    fn fallback() -> Self {
        Self {
            models: vec![
                EmbeddedModelManifestEntry {
                    kind: EmbeddedModelKind::Rules,
                    model_id: "qwen2.5-7b-tools".to_string(),
                    display_name: "Qwen 2.5 7B (Tools)".to_string(),
                    filename: "qwen2.5-7b-instruct-q4_k_m.gguf".to_string(),
                    quantization: "Q4_K_M".to_string(),
                    parameter_count: 7,
                    description: "Deterministic Dungeon World tooling model.".to_string(),
                    download_url: "https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF/resolve/main/Qwen2.5-7B-Instruct-Q4_K_M.gguf".to_string(),
                    sha256: "65b8fcd92af6b4fefa935c625d1ac27ea29dcb6ee14589c55a8f115ceaaa1423"
                        .to_string(),
                    size_bytes: 4_683_074_240,
                },
                EmbeddedModelManifestEntry {
                    kind: EmbeddedModelKind::Narration,
                    model_id: "mistral-7b-narrator".to_string(),
                    display_name: "Mistral 7B (Narration)".to_string(),
                    filename: "mistral-7b-instruct-v0.2-q4_k_m.gguf".to_string(),
                    quantization: "Q4_K_M".to_string(),
                    parameter_count: 7,
                    description: "Creative narrator model for Chronicle prose.".to_string(),
                    download_url: "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf".to_string(),
                    sha256: "3e0039fd0273fcbebb49228943b17831aadd55cbcbf56f0af00499be2040ccf9"
                        .to_string(),
                    size_bytes: 4_368_439_584,
                },
            ],
        }
    }
}

#[derive(Serialize)]
struct DownloadStartedEvent {
    kind: EmbeddedModelKind,
    #[serde(skip_serializing_if = "Option::is_none")]
    total_bytes: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    resumed_from_bytes: Option<u64>,
}

#[derive(Serialize)]
struct DownloadProgressEvent {
    kind: EmbeddedModelKind,
    received_bytes: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    total_bytes: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    percent: Option<f32>,
}

#[derive(Serialize)]
struct DownloadVerifyingEvent {
    kind: EmbeddedModelKind,
}

#[derive(Serialize)]
struct DownloadCompleteEvent {
    kind: EmbeddedModelKind,
}

#[derive(Serialize)]
struct DownloadErrorEvent {
    kind: EmbeddedModelKind,
    message: String,
}

#[derive(Serialize)]
struct DownloadCancelledEvent {
    kind: EmbeddedModelKind,
}

#[derive(Serialize)]
#[serde(rename_all = "snake_case")]
enum DownloadTelemetryOutcome {
    Success,
    Cancelled,
    Error,
}

#[derive(Serialize)]
struct DownloadTelemetryEvent {
    kind: EmbeddedModelKind,
    #[serde(skip_serializing_if = "Option::is_none")]
    resumed_from_bytes: Option<u64>,
    received_bytes: u64,
    downloaded_bytes: u64,
    duration_ms: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    verify_duration_ms: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    total_bytes: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error_message: Option<String>,
    outcome: DownloadTelemetryOutcome,
}

struct DownloadMetrics {
    resumed_from_bytes: Option<u64>,
    received_bytes: u64,
    downloaded_bytes: u64,
    verify_duration_ms: Option<u128>,
}

impl Default for EmbeddedRuntimeManifest {
    fn default() -> Self {
        Self::from_bundled_json()
    }
}

pub struct EmbeddedRuntimeHost {
    manifest: EmbeddedRuntimeManifest,
    models_dir: PathBuf,
    statuses: RwLock<HashMap<EmbeddedModelKind, EmbeddedModelStatus>>,
    download_gate: Arc<Semaphore>,
    http_client: Client,
    cancel_tokens: Mutex<HashMap<EmbeddedModelKind, Arc<AtomicBool>>>,
}

impl EmbeddedRuntimeHost {
    pub fn new(models_dir: PathBuf, manifest: EmbeddedRuntimeManifest) -> Self {
        if let Err(error) = fs::create_dir_all(&models_dir) {
            log::warn!("[embedded-llm] failed to create models directory {models_dir:?}: {error}");
        }

        let mut statuses = HashMap::new();
        for entry in manifest.all() {
            statuses.insert(entry.kind, EmbeddedModelStatus::Missing);
        }

        Self {
            manifest,
            models_dir,
            statuses: RwLock::new(statuses),
            download_gate: Arc::new(Semaphore::new(1)),
            http_client: Client::new(),
            cancel_tokens: Mutex::new(HashMap::new()),
        }
    }

    pub fn models_dir(&self) -> &Path {
        &self.models_dir
    }

    pub fn manifest(&self) -> &EmbeddedRuntimeManifest {
        &self.manifest
    }

    pub async fn describe_models(&self) -> Vec<EmbeddedModelDescriptor> {
        let mut descriptors = Vec::new();
        for entry in self.manifest.all() {
            let status = self.refresh_status(entry.kind).await;
            let expected_path = self.expected_path(entry);
            let resume_bytes = if matches!(status, EmbeddedModelStatus::Ready { .. }) {
                None
            } else {
                self.partial_file_size(&expected_path).await
            };
            let expected_path_string = expected_path.display().to_string();
            descriptors.push(EmbeddedModelDescriptor {
                kind: entry.kind,
                model_id: entry.model_id.clone(),
                display_name: entry.display_name.clone(),
                quantization: entry.quantization.clone(),
                parameter_count: entry.parameter_count,
                description: entry.description.clone(),
                size_bytes: entry.size_bytes,
                expected_path: expected_path_string,
                status,
                resume_bytes,
            });
        }
        descriptors
    }

    pub async fn ensure_ready(&self, kind: EmbeddedModelKind) -> Result<(), EmbeddedRuntimeError> {
        let entry = self
            .manifest()
            .entry(kind)
            .ok_or(EmbeddedRuntimeError::UnknownModelKind)?;
        let expected = self.expected_path(entry);
        if !expected.exists() {
            self.set_status(
                kind,
                EmbeddedModelStatus::Error {
                    message: "Model file missing".to_string(),
                },
            )
            .await;
            return Err(EmbeddedRuntimeError::MissingModel(
                expected.display().to_string(),
            ));
        }

        self.set_status(
            kind,
            EmbeddedModelStatus::Ready {
                loaded_at: Utc::now().to_rfc3339(),
            },
        )
        .await;
        Ok(())
    }

    pub async fn refresh_all(&self) {
        for entry in self.manifest.all() {
            self.refresh_status(entry.kind).await;
        }
    }

    pub async fn download_model(
        &self,
        kind: EmbeddedModelKind,
        app_handle: &AppHandle,
    ) -> Result<(), EmbeddedRuntimeDownloadError> {
        let entry = self
            .manifest()
            .entry(kind)
            .ok_or(EmbeddedRuntimeDownloadError::UnknownModelKind)?;

        let permit = self.try_acquire_download_permit()?;
        self.set_status(kind, EmbeddedModelStatus::Loading { progress: 0.0 })
            .await;

        let cancel_flag = self.register_cancel_token(kind).await;

        let expected_path = self.expected_path(entry);
        let resume_bytes = if expected_path.exists() {
            None
        } else {
            self.partial_file_size(&expected_path).await
        };

        let total_hint = self.total_bytes_hint(entry.size_bytes);
        self.emit_download_event(
            app_handle,
            EVENT_DOWNLOAD_STARTED,
            &DownloadStartedEvent {
                kind,
                total_bytes: total_hint,
                resumed_from_bytes: resume_bytes,
            },
        );

        let download_began_at = Instant::now();
        let (result, metrics) = self
            .perform_download(
                entry,
                &expected_path,
                kind,
                app_handle,
                total_hint,
                resume_bytes,
                cancel_flag.clone(),
            )
            .await;

        self.unregister_cancel_token(kind).await;
        drop(permit);

        let duration_ms = download_began_at.elapsed().as_millis();

        match result {
            Ok(()) => {
                self.set_status(
                    kind,
                    EmbeddedModelStatus::Ready {
                        loaded_at: Utc::now().to_rfc3339(),
                    },
                )
                .await;
                self.emit_download_event(
                    app_handle,
                    EVENT_DOWNLOAD_COMPLETE,
                    &DownloadCompleteEvent { kind },
                );
                self.emit_download_telemetry(
                    app_handle,
                    kind,
                    total_hint,
                    &metrics,
                    duration_ms,
                    DownloadTelemetryOutcome::Success,
                    None,
                );
                Ok(())
            }
            Err(EmbeddedRuntimeDownloadError::Cancelled) => {
                self.set_status(kind, EmbeddedModelStatus::Missing).await;
                self.emit_download_event(
                    app_handle,
                    EVENT_DOWNLOAD_CANCELLED,
                    &DownloadCancelledEvent { kind },
                );
                self.emit_download_telemetry(
                    app_handle,
                    kind,
                    total_hint,
                    &metrics,
                    duration_ms,
                    DownloadTelemetryOutcome::Cancelled,
                    None,
                );
                Ok(())
            }
            Err(error) => {
                let message = error.to_string();
                self.set_status(
                    kind,
                    EmbeddedModelStatus::Error {
                        message: message.clone(),
                    },
                )
                .await;
                self.emit_download_event(
                    app_handle,
                    EVENT_DOWNLOAD_ERROR,
                    &DownloadErrorEvent { kind, message },
                );
                self.emit_download_telemetry(
                    app_handle,
                    kind,
                    total_hint,
                    &metrics,
                    duration_ms,
                    DownloadTelemetryOutcome::Error,
                    Some(message),
                );
                Err(error)
            }
        }
    }

    async fn refresh_status(&self, kind: EmbeddedModelKind) -> EmbeddedModelStatus {
        {
            let guard = self.statuses.read().await;
            if let Some(existing @ EmbeddedModelStatus::Loading { .. }) = guard.get(&kind) {
                return existing.clone();
            }
        }

        let entry = match self.manifest.entry(kind) {
            Some(entry) => entry,
            None => {
                let status = EmbeddedModelStatus::Error {
                    message: "Unknown model kind".to_string(),
                };
                self.set_status(kind, status.clone()).await;
                return status;
            }
        };

        let expected = self.expected_path(entry);
        let status = if expected.exists() {
            EmbeddedModelStatus::Ready {
                loaded_at: Utc::now().to_rfc3339(),
            }
        } else {
            EmbeddedModelStatus::Missing
        };
        self.set_status(kind, status.clone()).await;
        status
    }

    async fn set_status(&self, kind: EmbeddedModelKind, status: EmbeddedModelStatus) {
        let mut guard = self.statuses.write().await;
        guard.insert(kind, status);
    }

    fn expected_path(&self, entry: &EmbeddedModelManifestEntry) -> PathBuf {
        self.models_dir.join(&entry.filename)
    }

    fn partial_path(expected_path: &Path) -> PathBuf {
        let mut path = expected_path.to_path_buf();
        path.set_extension("part");
        path
    }

    async fn partial_file_size(&self, expected_path: &Path) -> Option<u64> {
        let temp_path = Self::partial_path(expected_path);
        match tokio_fs::metadata(&temp_path).await {
            Ok(metadata) if metadata.len() > 0 => Some(metadata.len()),
            Ok(_) => None,
            Err(error) if error.kind() == io::ErrorKind::NotFound => None,
            Err(error) => {
                log::debug!(
                    "[embedded-llm] failed to inspect partial file {}: {error}",
                    temp_path.display()
                );
                None
            }
        }
    }

    fn total_bytes_hint(&self, size_bytes: u64) -> Option<u64> {
        if size_bytes == 0 {
            None
        } else {
            Some(size_bytes)
        }
    }

    fn try_acquire_download_permit(
        &self,
    ) -> Result<OwnedSemaphorePermit, EmbeddedRuntimeDownloadError> {
        self.download_gate
            .clone()
            .try_acquire_owned()
            .map_err(|error| match error {
                TryAcquireError::NoPermits | TryAcquireError::Closed => {
                    EmbeddedRuntimeDownloadError::Busy
                }
            })
    }

    async fn register_cancel_token(&self, kind: EmbeddedModelKind) -> Arc<AtomicBool> {
        let token = Arc::new(AtomicBool::new(false));
        let mut guard = self.cancel_tokens.lock().await;
        guard.insert(kind, token.clone());
        token
    }

    async fn unregister_cancel_token(&self, kind: EmbeddedModelKind) {
        let mut guard = self.cancel_tokens.lock().await;
        guard.remove(&kind);
    }

    pub async fn cancel_download(
        &self,
        kind: EmbeddedModelKind,
    ) -> Result<(), EmbeddedRuntimeDownloadError> {
        let flag = {
            let guard = self.cancel_tokens.lock().await;
            guard.get(&kind).cloned()
        };
        if let Some(flag) = flag {
            flag.store(true, Ordering::SeqCst);
            Ok(())
        } else {
            Err(EmbeddedRuntimeDownloadError::NoActiveDownload)
        }
    }

    async fn perform_download(
        &self,
        entry: &EmbeddedModelManifestEntry,
        expected_path: &Path,
        kind: EmbeddedModelKind,
        app_handle: &AppHandle,
        manifest_size_hint: Option<u64>,
        resume_bytes: Option<u64>,
        cancel_flag: Arc<AtomicBool>,
    ) -> (Result<(), EmbeddedRuntimeDownloadError>, DownloadMetrics) {
        let temp_path = Self::partial_path(expected_path);
        let temp_path_for_download = temp_path.clone();

        let (result, received_bytes, downloaded_bytes, verify_duration_ms, resume_state) = {
            let mut hasher = Sha256::new();
            let mut received: u64 = 0;
            let mut downloaded_bytes: u64 = 0;
            let mut verify_duration_ms: Option<u128> = None;
            let mut effective_resume_bytes = resume_bytes;

            async {
                if cancel_flag.load(Ordering::SeqCst) {
                    return (
                        Err(EmbeddedRuntimeDownloadError::Cancelled),
                        received,
                        downloaded_bytes,
                        verify_duration_ms,
                        effective_resume_bytes,
                    );
                }

                if temp_path_for_download.exists() {
                    let mut existing_file = tokio_fs::File::open(&temp_path_for_download)
                        .await
                        .map_err(|error| EmbeddedRuntimeDownloadError::Io(error.to_string()))?;
                    let mut reader = BufReader::new(existing_file);
                    let mut buffer = vec![0u8; 64 * 1024];

                    loop {
                        if cancel_flag.load(Ordering::SeqCst) {
                            return (
                                Err(EmbeddedRuntimeDownloadError::Cancelled),
                                received,
                                downloaded_bytes,
                                verify_duration_ms,
                                effective_resume_bytes,
                            );
                        }

                        let read = reader
                            .read(&mut buffer)
                            .await
                            .map_err(|error| EmbeddedRuntimeDownloadError::Io(error.to_string()))?;
                        if read == 0 {
                            break;
                        }
                        hasher.update(&buffer[..read]);
                        received += read as u64;
                    }
                }

                let mut request = self.http_client.get(entry.download_url.clone());
                if received > 0 {
                    request = request.header(reqwest::header::RANGE, format!("bytes={received}-"));
                }

                let response = request
                    .send()
                    .await
                    .map_err(|error| EmbeddedRuntimeDownloadError::Network(error.to_string()))?;

                if !response.status().is_success() {
                    return (
                        Err(EmbeddedRuntimeDownloadError::Http(
                            response.status().as_u16(),
                        )),
                        received,
                        downloaded_bytes,
                        verify_duration_ms,
                        effective_resume_bytes,
                    );
                }

                let mut file = tokio::fs::OpenOptions::new()
                    .create(true)
                    .append(true)
                    .open(&temp_path_for_download)
                    .await
                    .map_err(|error| EmbeddedRuntimeDownloadError::Io(error.to_string()))?;

                let response_content_length = response.content_length();
                if received > 0 && response.status() != StatusCode::PARTIAL_CONTENT {
                    drop(file);
                    tokio_fs::File::create(&temp_path_for_download)
                        .await
                        .map_err(|error| EmbeddedRuntimeDownloadError::Io(error.to_string()))?;
                    file = tokio::fs::OpenOptions::new()
                        .create(true)
                        .append(true)
                        .open(&temp_path_for_download)
                        .await
                        .map_err(|error| EmbeddedRuntimeDownloadError::Io(error.to_string()))?;
                    hasher = Sha256::new();
                    received = 0;
                    downloaded_bytes = 0;
                    effective_resume_bytes = None;
                }

                let mut total_bytes = manifest_size_hint
                    .or_else(|| response_content_length.map(|remaining| remaining + received));
                if received == 0 && effective_resume_bytes.is_none() && manifest_size_hint.is_none()
                {
                    total_bytes = response_content_length;
                }

                if received > 0 {
                    let percent = total_bytes
                        .map(|total| ((received as f64 / total as f64).clamp(0.0, 1.0)) as f32);
                    if let Some(value) = percent {
                        self.set_status(kind, EmbeddedModelStatus::Loading { progress: value })
                            .await;
                    }
                    self.emit_download_event(
                        app_handle,
                        EVENT_DOWNLOAD_PROGRESS,
                        &DownloadProgressEvent {
                            kind,
                            received_bytes: received,
                            total_bytes,
                            percent,
                        },
                    );
                }

                let mut stream = response.bytes_stream();

                while let Some(chunk_result) = stream.next().await {
                    if cancel_flag.load(Ordering::SeqCst) {
                        return (
                            Err(EmbeddedRuntimeDownloadError::Cancelled),
                            received,
                            downloaded_bytes,
                            verify_duration_ms,
                            effective_resume_bytes,
                        );
                    }

                    let chunk = chunk_result.map_err(|error| {
                        EmbeddedRuntimeDownloadError::Network(error.to_string())
                    })?;
                    file.write_all(&chunk)
                        .await
                        .map_err(|error| EmbeddedRuntimeDownloadError::Io(error.to_string()))?;
                    hasher.update(&chunk);
                    received += chunk.len() as u64;
                    downloaded_bytes += chunk.len() as u64;

                    let percent = total_bytes
                        .map(|total| ((received as f64 / total as f64).clamp(0.0, 1.0)) as f32);

                    if let Some(value) = percent {
                        self.set_status(kind, EmbeddedModelStatus::Loading { progress: value })
                            .await;
                    }

                    self.emit_download_event(
                        app_handle,
                        EVENT_DOWNLOAD_PROGRESS,
                        &DownloadProgressEvent {
                            kind,
                            received_bytes: received,
                            total_bytes,
                            percent,
                        },
                    );
                }

                file.flush()
                    .await
                    .map_err(|error| EmbeddedRuntimeDownloadError::Io(error.to_string()))?;
                file.sync_all()
                    .await
                    .map_err(|error| EmbeddedRuntimeDownloadError::Io(error.to_string()))?;

                if cancel_flag.load(Ordering::SeqCst) {
                    return (
                        Err(EmbeddedRuntimeDownloadError::Cancelled),
                        received,
                        downloaded_bytes,
                        verify_duration_ms,
                        effective_resume_bytes,
                    );
                }

                self.emit_download_event(
                    app_handle,
                    EVENT_DOWNLOAD_VERIFYING,
                    &DownloadVerifyingEvent { kind },
                );

                let verify_started = Instant::now();
                let actual_hash = hex_encode(hasher.finalize());
                let expected_hash = entry.sha256.trim();
                if !expected_hash.is_empty() && !actual_hash.eq_ignore_ascii_case(expected_hash) {
                    return (
                        Err(EmbeddedRuntimeDownloadError::ChecksumMismatch {
                            expected: expected_hash.to_string(),
                            actual: actual_hash,
                        }),
                        received,
                        downloaded_bytes,
                        verify_duration_ms,
                        effective_resume_bytes,
                    );
                }

                tokio_fs::rename(&temp_path_for_download, expected_path)
                    .await
                    .map_err(|error| EmbeddedRuntimeDownloadError::Io(error.to_string()))?;
                verify_duration_ms = Some(verify_started.elapsed().as_millis());

                (
                    Ok(()),
                    received,
                    downloaded_bytes,
                    verify_duration_ms,
                    effective_resume_bytes,
                )
            }
            .await
        };

        if matches!(
            result,
            Err(EmbeddedRuntimeDownloadError::Network(_)
                | EmbeddedRuntimeDownloadError::Http(_)
                | EmbeddedRuntimeDownloadError::Io(_)
                | EmbeddedRuntimeDownloadError::ChecksumMismatch { .. })
        ) {
            self.cleanup_partial(&temp_path).await;
        }

        (
            result,
            DownloadMetrics {
                resumed_from_bytes: resume_state,
                received_bytes,
                downloaded_bytes,
                verify_duration_ms,
            },
        )
    }

    async fn cleanup_partial(&self, path: &Path) {
        match tokio_fs::remove_file(path).await {
            Ok(_) => {}
            Err(error) if error.kind() == io::ErrorKind::NotFound => {}
            Err(error) => {
                log::warn!(
                    "[embedded-llm] failed to remove partial model file {}: {error}",
                    path.display()
                );
            }
        }
    }

    fn emit_download_event<T: Serialize>(&self, app_handle: &AppHandle, event: &str, payload: &T) {
        if let Err(error) = app_handle.emit(event, payload) {
            log::warn!("[embedded-llm] failed to emit embedded runtime event {event}: {error}");
        }
    }

    fn emit_download_telemetry(
        &self,
        app_handle: &AppHandle,
        kind: EmbeddedModelKind,
        total_bytes: Option<u64>,
        metrics: &DownloadMetrics,
        duration_ms: u128,
        outcome: DownloadTelemetryOutcome,
        error_message: Option<String>,
    ) {
        let duration_ms = duration_ms.min(u128::from(u64::MAX)) as u64;
        let verify_duration_ms = metrics
            .verify_duration_ms
            .map(|value| value.min(u128::from(u64::MAX)) as u64);

        let telemetry = DownloadTelemetryEvent {
            kind,
            resumed_from_bytes: metrics.resumed_from_bytes,
            received_bytes: metrics.received_bytes,
            downloaded_bytes: metrics.downloaded_bytes,
            duration_ms,
            verify_duration_ms,
            total_bytes,
            error_message,
            outcome,
        };
        self.emit_download_event(app_handle, EVENT_DOWNLOAD_TELEMETRY, &telemetry);
    }
}
