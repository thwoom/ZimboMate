mod commands;
mod embedded_engine;
mod embedded_runtime;
mod llm_service;

use commands::AppState;
use embedded_engine::EmbeddedEngine;
use embedded_runtime::{EmbeddedRuntimeHost, EmbeddedRuntimeManifest};
use llm_service::LlmService;
use log::{warn, LevelFilter};
use std::sync::Arc;
use std::{fs, io};
use tauri::Manager;
use tauri_plugin_log::Builder as LogPluginBuilder;
use tauri_plugin_store::Builder as StorePluginBuilder;
use tauri_plugin_stronghold::Builder as StrongholdPluginBuilder;
use tokio::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize the LLM service
    let llm_service = Arc::new(Mutex::new(LlmService::new()));

    let llm_state_handle = llm_service.clone();

    tauri::Builder::default()
        .plugin(LogPluginBuilder::default().level(LevelFilter::Info).build())
        .plugin(StorePluginBuilder::default().build())
        .setup(move |app| {
            let data_dir = app.path().app_local_data_dir().map_err(|error| {
                io::Error::new(
                    io::ErrorKind::Other,
                    format!("Failed to resolve app data directory: {error}"),
                )
            })?;
            fs::create_dir_all(&data_dir)?;
            let salt_path = data_dir.join("stronghold_salt");

            app.handle()
                .plugin(StrongholdPluginBuilder::with_argon2(&salt_path).build())?;

            let models_dir = data_dir.join("models");
            let manifest = EmbeddedRuntimeManifest::default();
            let embedded_host = Arc::new(EmbeddedRuntimeHost::new(models_dir, manifest));
            let embedded_engine = Arc::new(EmbeddedEngine::new(embedded_host.clone()));
            let app_state = AppState {
                llm_service: llm_state_handle.clone(),
                embedded_runtime: embedded_host.clone(),
                embedded_engine: embedded_engine.clone(),
            };
            app.manage(app_state);

            let embedded_handle = embedded_host.clone();
            tauri::async_runtime::spawn(async move {
                embedded_handle.refresh_all().await;
            });

            let handle = app.handle().clone();
            let service = llm_state_handle.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(error) = LlmService::hydrate_from_stronghold(&service, &handle).await {
                    warn!("[LLM] stronghold hydration failed: {error}");
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::check_llm_status,
            commands::list_models,
            commands::initialize_llm,
            commands::chronicle_propose_deltas,
            commands::chronicle_apply_delta_bundle,
            commands::enhance_note,
            commands::is_llm_ready,
            commands::get_llm_credentials,
            commands::set_llm_credentials,
            commands::fetch_llm_usage,
            commands::embedded_runtime_list_models,
            commands::embedded_runtime_get_manifest,
            commands::embedded_runtime_ensure_model,
            commands::embedded_runtime_download_model,
            commands::embedded_runtime_cancel_download,
            commands::embedded_runtime_models_dir,
            commands::embedded_runtime_load_model,
            commands::embedded_runtime_run_tools,
            commands::embedded_runtime_run_narration,
            commands::get_admin_paths,
            commands::diagnose_dev_port,
            commands::terminate_process,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
