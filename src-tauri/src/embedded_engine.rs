use crate::embedded_runtime::{EmbeddedModelKind, EmbeddedRuntimeHost};
use serde::{Deserialize, Serialize};
use std::{path::PathBuf, process::Command, sync::Arc};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum EmbeddedEngineError {
    #[error("embedded runtime host error: {0}")]
    Host(String),
    #[error("model kind is unknown")]
    UnknownModel,
    #[error("embedded llama binary not found at {0}")]
    BinaryMissing(String),
    #[error("failed to run llama binary: {0}")]
    SpawnFailed(String),
    #[error("llama runtime exited with non-zero status")]
    NonZeroExit,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EmbeddedToolRunRequest {
    pub prompt: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EmbeddedToolRunResponse {
    pub message: String,
}

#[derive(Clone)]
struct EmbeddedEngineConfig {
    binary_path: PathBuf,
    max_tokens: usize,
}

impl EmbeddedEngineConfig {
    fn resolve_binary_path() -> PathBuf {
        std::env::var("LLAMA_CPP_BIN")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("llama"))
    }

    fn resolve_max_tokens() -> usize {
        std::env::var("LLAMA_CPP_MAX_TOKENS")
            .ok()
            .and_then(|value| value.parse::<usize>().ok())
            .filter(|value| *value > 0)
            .unwrap_or(256)
    }
}

impl Default for EmbeddedEngineConfig {
    fn default() -> Self {
        Self {
            binary_path: Self::resolve_binary_path(),
            max_tokens: Self::resolve_max_tokens(),
        }
    }
}

pub struct EmbeddedEngine {
    host: Arc<EmbeddedRuntimeHost>,
    config: EmbeddedEngineConfig,
}

impl EmbeddedEngine {
    pub fn new(host: Arc<EmbeddedRuntimeHost>) -> Self {
        Self {
            host,
            config: EmbeddedEngineConfig::default(),
        }
    }

    pub async fn ensure_model_loaded(
        &self,
        kind: EmbeddedModelKind,
    ) -> Result<(), EmbeddedEngineError> {
        self.host
            .ensure_ready(kind)
            .await
            .map_err(|error| EmbeddedEngineError::Host(error.to_string()))
    }

    pub async fn run_tools(
        &self,
        kind: EmbeddedModelKind,
        request: EmbeddedToolRunRequest,
    ) -> Result<EmbeddedToolRunResponse, EmbeddedEngineError> {
        self.ensure_model_loaded(kind).await?;
        self.run_llama_inference(kind, request).await
    }

    pub async fn run_narration(
        &self,
        kind: EmbeddedModelKind,
        request: EmbeddedToolRunRequest,
    ) -> Result<EmbeddedToolRunResponse, EmbeddedEngineError> {
        self.ensure_model_loaded(kind).await?;
        self.run_llama_inference(kind, request).await
    }

    async fn run_llama_inference(
        &self,
        kind: EmbeddedModelKind,
        request: EmbeddedToolRunRequest,
    ) -> Result<EmbeddedToolRunResponse, EmbeddedEngineError> {
        let manifest_entry = self
            .host
            .manifest()
            .entry(kind)
            .cloned()
            .ok_or(EmbeddedEngineError::UnknownModel)?;
        let model_path = self.host.models_dir().join(&manifest_entry.filename);
        if !model_path.exists() {
            return Err(EmbeddedEngineError::Host(format!(
                "model file missing at {}",
                model_path.display()
            )));
        }

        let binary = &self.config.binary_path;
        if !binary.exists() {
            return Err(EmbeddedEngineError::BinaryMissing(
                binary.display().to_string(),
            ));
        }

        let mut command = Command::new(binary);
        command
            .arg("-m")
            .arg(model_path.as_os_str())
            .arg("-p")
            .arg(request.prompt)
            .arg("-n")
            .arg(self.config.max_tokens.to_string())
            .arg("--temp")
            .arg("0.7");

        let output = command.output().map_err(|error| {
            EmbeddedEngineError::SpawnFailed(format!(
                "failed to launch {}: {error}",
                binary.display()
            ))
        })?;

        if !output.status.success() {
            return Err(EmbeddedEngineError::NonZeroExit);
        }

        let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
        Ok(EmbeddedToolRunResponse { message: stdout })
    }
}
