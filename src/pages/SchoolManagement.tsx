import { useEffect, useState } from "react";
import SchoolTable from "../components/SchoolTable";
import type { Subject, School, BookType } from "../types.ts";

export default function SchoolManagement() {
  const BOOK_TYPES: BookType[] = [
    "Textbook",
    "Parikshabodh",
    "Practical",
    "Project",
    "Guide",
  ];

  // Default subjects and books
  const defaultSubjects: Subject[] = [
    {
      id: 1,
      name: "Science",
      mediums: [
        {
          id: 1,
          name: "English Medium",
          books: [
            { id: 1, name: "Physics" },
            { id: 2, name: "Chemistry" },
            { id: 3, name: "Biology" },
            { id: 4, name: "Mathematics" },
          ],
        },
        {
          id: 2,
          name: "Hindi Medium",
          books: [
            { id: 1, name: "भौतिक विज्ञान" },
            { id: 2, name: "रसायन विज्ञान" },
            { id: 3, name: "जीव विज्ञान" },
            { id: 4, name: "गणित" },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Commerce",
      mediums: [
        {
          id: 3,
          name: "English Medium",
          books: [
            { id: 1, name: "Business Studies" },
            { id: 2, name: "Accountancy" },
            { id: 3, name: "Economics" },
          ],
        },
        {
          id: 4,
          name: "Hindi Medium",
          books: [
            { id: 1, name: "व्यवसाय अध्ययन" },
            { id: 2, name: "लेखाशास्त्र" },
            { id: 3, name: "अर्थशास्त्र" },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Arts",
      mediums: [
        {
          id: 5,
          name: "English Medium",
          books: [
            { id: 1, name: "Political Science" },
            { id: 2, name: "Geography" },
            { id: 3, name: "History" },
            { id: 4, name: "Economics" },
            { id: 5, name: "Sociology" },
          ],
        },
        {
          id: 6,
          name: "Hindi Medium",
          books: [
            { id: 1, name: "राजनीति विज्ञान" },
            { id: 2, name: "भूगोल" },
            { id: 3, name: "इतिहास" },
            { id: 4, name: "अर्थशास्त्र" },
            { id: 5, name: "समाजशास्त्र" },
          ],
        },
      ],
    },
    {
      id: 4,
      name: "Agriculture",
      mediums: [
        {
          id: 7,
          name: "English Medium",
          books: [
            { id: 1, name: "Horticulture" },
            { id: 2, name: "Animal Husbandry" },
            { id: 3, name: "Crop Production" },
          ],
        },
        {
          id: 8,
          name: "Hindi Medium",
          books: [
            { id: 1, name: "कृषि विज्ञान" },
            { id: 2, name: "पशु विज्ञान" },
            { id: 3, name: "फसल विज्ञान" },
          ],
        },
      ],
    },
    {
      id: 5,
      name: "Bharati",
      mediums: [
        {
          id: 9,
          name: "English Medium",
          books: [
            { id: 1, name: "Hindi" },
            { id: 2, name: "English" },
            { id: 3, name: "Sanskrit" },
          ],
        },
        {
          id: 10,
          name: "Hindi Medium",
          books: [
            { id: 1, name: "हिंदी" },
            { id: 2, name: "अंग्रेज़ी" },
            { id: 3, name: "संस्कृत" },
          ],
        },
      ],
    },
  ];

  // Hindi subject names
  const hindiSubjectNames: Record<string, string> = {
    Science: "विज्ञान",
    Commerce: "वाणिज्य",
    Arts: "कला",
    Agriculture: "कृषि",
    Bharati: "भारती",
  };

  // Hindi book names
 const hindiBookNames: Record<string, string> = {
  // Existing English names
  Physics: "भौतिक विज्ञान",
  Chemistry: "रसायन विज्ञान",
  Biology: "जीव विज्ञान",
  Mathematics: "गणित",

  // Alternative names saved in your data
  Bhautik: "भौतिक विज्ञान",
  Rashayan: "रसायन विज्ञान",
  Rasayan: "रसायन विज्ञान",
  "Jeev Vigyan": "जीव विज्ञान",
  Ganit: "गणित",

  // Commerce
  "Business Studies": "व्यवसाय अध्ययन",
  Accountancy: "लेखाशास्त्र",
  Economics: "अर्थशास्त्र",
  

  // Arts
  "Political Science": "राजनीति विज्ञान",
  Geography: "भूगोल",
  History: "इतिहास",
  Sociology: "समाजशास्त्र",

  // Agriculture
  Horticulture: "कृषि विज्ञान",
  "Animal Husbandry": "पशु विज्ञान",
  "Crop Production": "फसल विज्ञान",

  // Bharti
  Hindi: "हिंदी",
  English: "अंग्रेज़ी",
  Sanskrit: "संस्कृत",
};
  

  // Display subject name according to medium
  const getSubjectName = (
    subjectName: string,
    mediumName: string
  ): string => {
    if (mediumName !== "Hindi Medium") {
      return subjectName;
    }

    return hindiSubjectNames[subjectName] ?? subjectName;
  };

const getBookName = (
  bookName: string,
  mediumName: string
): string => {
  if (mediumName.trim() !== "Hindi Medium") {
    return bookName;
  }

  const key = Object.keys(hindiBookNames).find(
    (name) => name.toLowerCase() === bookName.trim().toLowerCase()
  );

  return hindiBookNames[key ?? ""] ?? bookName;
};

  // Load saved subjects or use defaults
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const savedSubjects = localStorage.getItem("subjects");

    if (savedSubjects) {
      try {
        const parsedSubjects = JSON.parse(savedSubjects);

        if (Array.isArray(parsedSubjects)) {
          return normalizeSubjects(parsedSubjects);
        }

        return defaultSubjects;
      } catch {
        return defaultSubjects;
      }
    }

    return defaultSubjects;
  });

  // Keep your existing code below this point.

function normalizeSubjects(subjects: Subject[]): Subject[] {
  return subjects.map((subject) => ({
    ...subject,
    mediums: subject.mediums.map((medium) => ({
      ...medium,
      books:
        medium.name === "Hindi Medium"
          ? medium.books.map((book) => ({
              ...book,
              name:
                hindiBookNames[book.name.trim()] ??
                book.name,
            }))
          : medium.books,
    })),
  }));
}



  // =====================================================
  // SAVE SUBJECTS
  // =====================================================

  useEffect(() => {
    localStorage.setItem(
      "subjects",
      JSON.stringify(subjects)
    );
  }, [subjects]);

  // =====================================================
  // CREATE EMPTY BOOK ENTRY
  // =====================================================

  const createEmptyEntry = (type: BookType) => ({
    date: "",
    qty: "",
    type,
  });

  
  const createTypeBooks = (bookCount: number) => {
    const typeBooks: Record<string, any> = {};

    BOOK_TYPES.forEach((type) => {
      typeBooks[type] = Array.from(
        { length: bookCount },
        () => [createEmptyEntry(type)]
      );
    });

    return typeBooks;
  };

  // =====================================================
  // CREATE GRADE BOOKS
  // =====================================================

  const createGradeBooks = (subjectList: Subject[]) => {
    const books: Record<string, any> = {};

    subjectList.forEach((subject) => {
      books[subject.name] = {};

      subject.mediums.forEach((medium) => {
        books[subject.name][medium.name] =
          createTypeBooks(medium.books.length);
      });
    });

    return books;
  };

  // =====================================================
  // CREATE COMPLETE SCHOOL BOOK DATA
  // =====================================================

  const createSchoolBooks = (subjectList: Subject[]) => {
    return {
      "11": createGradeBooks(subjectList),
      "12": createGradeBooks(subjectList),
    };
  };

  

  const normalizeSchools = (
    schoolList: School[]
  ): School[] => {
    if (!Array.isArray(schoolList)) {
      return [];
    }

    return schoolList.map((school) => {
      const updatedBooks: any = structuredClone(
        school.books || {}
      );

      Object.keys(updatedBooks).forEach((grade) => {
        const gradeData = updatedBooks[grade];

        if (!gradeData || typeof gradeData !== "object") {
          return;
        }

        Object.keys(gradeData).forEach((subjectName) => {
          const subjectData = gradeData[subjectName];

          if (
            !subjectData ||
            typeof subjectData !== "object"
          ) {
            return;
          }

          Object.keys(subjectData).forEach((mediumName) => {
            const mediumData =
              subjectData[mediumName];

          
            if (Array.isArray(mediumData)) {
              const textbookData =
                mediumData.map(
                  (bookEntries: any[]) => {
                    if (!Array.isArray(bookEntries)) {
                      return [
                        createEmptyEntry("Textbook"),
                      ];
                    }

                    return bookEntries.map(
                      (entry: any) => ({
                        date: entry?.date || "",
                        qty: entry?.qty || "",
                        type: "Textbook",
                      })
                    );
                  }
                );

           subjectData[mediumName] = {
  Textbook: textbookData,

  Parikshabodh: mediumData.map(
    () => [
      createEmptyEntry("Parikshabodh"),
    ]
  ),

  Practical: mediumData.map(
    () => [
      createEmptyEntry("Practical"),
    ]
  ),

  Project: mediumData.map(
    () => [
      createEmptyEntry("Project"),
    ]
  ),

  Guide: mediumData.map(
    () => [
      createEmptyEntry("Guide"),
    ]
  ),
};

              return;
            }

            // =================================================
            // NEW DATA FORMAT
            // =================================================

            if (
              typeof mediumData === "object" &&
              mediumData !== null
            ) {
              BOOK_TYPES.forEach((type) => {
                if (
                  !Array.isArray(
                    mediumData[type]
                  )
                ) {
                  mediumData[type] = [];
                }

                mediumData[type] =
                  mediumData[type].map(
                    (bookEntries: any[]) => {
                      if (!Array.isArray(bookEntries)) {
                        return [
                          createEmptyEntry(type),
                        ];
                      }

                      return bookEntries.map(
                        (entry: any) => ({
                          date: entry?.date || "",
                          qty: entry?.qty || "",
                          type,
                        })
                      );
                    }
                  );
              });
            }
          });
        });
      });

      return {
        ...school,
        books: updatedBooks,
      };
    });
  };

  // =====================================================
  // SCHOOLS
  // =====================================================

  const [schools, setSchools] = useState<School[]>(() => {
    const savedSchools =
      localStorage.getItem("schools");

    if (savedSchools) {
      try {
        const parsedSchools =
          JSON.parse(savedSchools);

        if (Array.isArray(parsedSchools)) {
          return normalizeSchools(parsedSchools);
        }
      } catch {
        // Corrupted localStorage data
        // will be replaced with default data.
      }
    }

    return [
      {
        id: 1,
        code: "SC001",
        schoolName: "ABC Public School",
        grade: "11",

        books: createSchoolBooks(
          defaultSubjects
        ),
      },
    ];
  });

  // =====================================================
  // SAVE SCHOOLS
  // =====================================================

  useEffect(() => {
    localStorage.setItem(
      "schools",
      JSON.stringify(schools)
    );
  }, [schools]);

  
  

  const handleInputChange = (
    schoolId: number,
    grade: string,
    subjectName: string,
    mediumName: string,
    bookIndex: number,
    entryIndex: number,
    field: "date" | "qty",
    value: string,
    type: BookType
  ) => {
    setSchools((prevSchools) =>
      prevSchools.map((school) => {
        if (school.id !== schoolId) {
          return school;
        }

        const updatedBooks: any = structuredClone(
          school.books || {}
        );

        // =================================================
        // GRADE
        // =================================================

        if (!updatedBooks[grade]) {
          updatedBooks[grade] = {};
        }

        // =================================================
        // SUBJECT
        // =================================================

        if (
          !updatedBooks[grade][subjectName]
        ) {
          updatedBooks[grade][subjectName] = {};
        }

        // =================================================
        // MEDIUM
        // =================================================

        if (
          !updatedBooks[grade][subjectName][
            mediumName
          ]
        ) {
          updatedBooks[grade][subjectName][
            mediumName
          ] = {};
        }

        // =================================================
        // TYPE
        // =================================================

        if (
          !updatedBooks[grade][subjectName][
            mediumName
          ][type]
        ) {
          updatedBooks[grade][subjectName][
            mediumName
          ][type] = [];
        }

        const typeBooks =
          updatedBooks[grade][subjectName][
            mediumName
          ][type];

        // =================================================
        // BOOK
        // =================================================

        if (!typeBooks[bookIndex]) {
          typeBooks[bookIndex] = [];
        }

        // =================================================
        // ENTRY
        // =================================================

        if (
          !typeBooks[bookIndex][entryIndex]
        ) {
          typeBooks[bookIndex][entryIndex] =
            createEmptyEntry(type);
        }

        // =================================================
        // UPDATE
        // =================================================

        typeBooks[bookIndex][entryIndex] = {
          ...typeBooks[bookIndex][entryIndex],
          [field]: value,
          type,
        };

        // =================================================
        // RETURN UPDATED SCHOOL
        // =================================================

        return {
          ...school,
          books: updatedBooks,
        };
      })
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
   <SchoolTable
  subjects={subjects}
  setSubjects={setSubjects}
  schools={schools}
  setSchools={setSchools}
  handleInputChange={handleInputChange}
  getBookName={getBookName}
  getSubjectName={getSubjectName}
/>
  );
}