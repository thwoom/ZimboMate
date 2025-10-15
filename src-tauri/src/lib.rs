mod commands;
mod llm_service;

use commands::AppState;
use llm_service::LlmService;
use std::sync::Arc;
use tokio::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize the LLM service
    let llm_service = Arc::new(Mutex::new(LlmService::new()));

    // Create app state
    let app_state = AppState { llm_service };

    tauri::Builder::default()
        .manage(app_state)
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
            commands::get_admin_paths,
            commands::diagnose_dev_port,
            commands::terminate_process,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
