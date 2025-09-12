use crate::models::{Class, Constraint, ConstraintType, Department, GradeLevel, Subject, Teacher};
use uuid::Uuid;

pub fn create_test_data() -> (Class, Vec<Teacher>, Vec<Subject>, Vec<Constraint>) {
    // إنشاء مواد افتراضية
    let math = Subject::new(
        "رياضيات".to_string(),
        5,
        GradeLevel::MiddleSchool,
        Some(Department::Scientific),
    );
    let science = Subject::new(
        "علوم".to_string(),
        4,
        GradeLevel::MiddleSchool,
        Some(Department::Scientific),
    );
    let arabic = Subject::new(
        "لغة عربية".to_string(),
        6,
        GradeLevel::MiddleSchool,
        Some(Department::Literary),
    );
    let english = Subject::new(
        "لغة إنجليزية".to_string(),
        4,
        GradeLevel::MiddleSchool,
        Some(Department::Literary),
    );
    let history = Subject::new(
        "تاريخ".to_string(),
        2,
        GradeLevel::MiddleSchool,
        Some(Department::Literary),
    );
    let geography = Subject::new(
        "جغرافيا".to_string(),
        2,
        GradeLevel::MiddleSchool,
        Some(Department::Literary),
    );
    let islamic = Subject::new(
        "تربية إسلامية".to_string(),
        2,
        GradeLevel::MiddleSchool,
        None,
    );

    let subjects = vec![
        math.clone(),
        science.clone(),
        arabic.clone(),
        english.clone(),
        history.clone(),
        geography.clone(),
        islamic.clone(),
    ];

    // إنشاء مدرسين افتراضيين
    let teacher1 = Teacher::new(
        "أحمد محمد".to_string(),
        vec![math.id, science.id],
        vec![
            (1, 1),
            (1, 2),
            (1, 3),
            (1, 4),
            (1, 5),
            (1, 6),
            (2, 1),
            (2, 2),
            (2, 3),
            (2, 4),
            (2, 5),
            (2, 6),
            (3, 1),
            (3, 2),
            (3, 3),
            (3, 4),
            (3, 5),
            (3, 6),
            (4, 1),
            (4, 2),
            (4, 3),
            (4, 4),
            (4, 5),
            (4, 6),
            (5, 1),
            (5, 2),
            (5, 3),
            (5, 4),
            (5, 5),
            (5, 6),
        ],
    );

    let teacher2 = Teacher::new(
        "فاطمة عبدالله".to_string(),
        vec![arabic.id, islamic.id],
        vec![
            (1, 1),
            (1, 2),
            (1, 3),
            (1, 4),
            (1, 5),
            (2, 1),
            (2, 2),
            (2, 3),
            (2, 4),
            (2, 5),
            (3, 1),
            (3, 2),
            (3, 3),
            (3, 4),
            (3, 5),
            (4, 1),
            (4, 2),
            (4, 3),
            (4, 4),
            (4, 5),
            (5, 1),
            (5, 2),
            (5, 3),
            (5, 4),
            (5, 5),
        ],
    );

    let teacher3 = Teacher::new(
        "خالد إبراهيم".to_string(),
        vec![english.id],
        vec![
            (1, 3),
            (1, 4),
            (1, 5),
            (1, 6),
            (2, 3),
            (2, 4),
            (2, 5),
            (2, 6),
            (3, 3),
            (3, 4),
            (3, 5),
            (3, 6),
            (4, 3),
            (4, 4),
            (4, 5),
            (4, 6),
            (5, 3),
            (5, 4),
            (5, 5),
            (5, 6),
        ],
    );

    let teacher4 = Teacher::new(
        "سارة علي".to_string(),
        vec![history.id, geography.id],
        vec![
            (1, 1),
            (1, 2),
            (1, 6),
            (2, 1),
            (2, 2),
            (2, 6),
            (3, 1),
            (3, 2),
            (3, 6),
            (4, 1),
            (4, 2),
            (4, 6),
            (5, 1),
            (5, 2),
            (5, 6),
        ],
    );

    let teachers = vec![
        teacher1.clone(),
        teacher2.clone(),
        teacher3.clone(),
        teacher4.clone(),
    ];

    // إنشاء فصل افتراضي
    let class = Class::new(
        7,
        "أ".to_string(),
        Department::Scientific.to_string(),
        vec![
            (math.id, 5),
            (science.id, 4),
            (arabic.id, 6),
            (english.id, 4),
            (history.id, 2),
            (geography.id, 2),
            (islamic.id, 2),
        ],
    );

    // إنشاء قيود افتراضية
    let constraints = vec![
        Constraint::new_forbidden(math.id, 5, 6), // لا رياضيات يوم الخميس الحصة السادسة
        Constraint::new_required(islamic.id, 1, 1), // التربية الإسلامية يجب أن تكون يوم الأحد الحصة الأولى
        Constraint::new_sequence(english.id, "لا تظهر مرتين متتاليتين".to_string()),
    ];

    (class, teachers, subjects, constraints)
}

pub fn get_teacher_by_name(teachers: &[Teacher], name: &str) -> Option<&Teacher> {
    teachers.iter().find(|t| t.name == name)
}

pub fn get_subject_by_name(subjects: &[Subject], name: &str) -> Option<&Subject> {
    subjects.iter().find(|s| s.name == name)
}
