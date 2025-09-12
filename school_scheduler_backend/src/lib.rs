//! School Schedule Generator Backend
//! Built with Rust and Tauri for efficient schedule generation

// Module declarations
pub mod models;
pub mod database;
pub mod algorithm;
pub mod api;
pub mod error;

// Re-exports for easy access
pub use models::*;
pub use database::*;
pub use algorithm::*;
pub use api::*;
pub use error::ScheduleError;

// Main library exports
