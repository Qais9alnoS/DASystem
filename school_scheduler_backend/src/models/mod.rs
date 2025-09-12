pub mod subject;
pub mod teacher;
pub mod class;
pub mod schedule;
pub mod constraint;

// Re-exports for easier access
pub use subject::{Subject, GradeLevel, Department};
pub use teacher::Teacher;
pub use class::Class;
pub use schedule::{Schedule, ScheduleSlot, TeacherSchedule};
pub use constraint::{Constraint, ConstraintType};