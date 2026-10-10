import { useEffect, useState } from "react";
import SchoolTable from "../components/SchoolTable";
import type { Subject, School, BookType } from "../types.ts";

export default function SchoolManagement() {


  const BOOK_TYPES: BookType[] = [
    "Textbook",
    "Parikshabodh",
    "Practical",
    "Project",
    "Guide"
  ];

 

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
          { id: 1, name: "Bhautik" },
          { id: 2, name: "Rasayan" },
          { id: 3, name: "Jeev Vigyan" },
          { id: 4, name: "Ganit" },
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
          { id: 1, name: "Vyavsay Adhyayan" },
          { id: 2, name: "Lekhashastra" },
          { id: 3, name: "Arthashastra" },
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
          { id: 1, name: "Rajneeti Vigyan" },
          { id: 2, name: "Bhugol" },
          { id: 3, name: "Itihas" },
          { id: 4, name: "Arthashastra" },
          { id: 5, name: "Samajshastra" },
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
          { id: 1, name: "Udyaniki" },
          { id: 2, name: "Pashupalan" },
          { id: 3, name: "Fasal Utpadan" },
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
          { id: 1, name: "Hindi" },
          { id: 2, name: "Angrezi" },
          { id: 3, name: "Sanskrit" },
        ],
      },
    ],
  },
];
 

  const normalizeSubjects = (
    subjectList: Subject[]
  ): Subject[] => {
    return subjectList.map((subject) => ({
      ...subject,

      mediums: Array.isArray(subject.mediums)
        ? subject.mediums.map((medium) => ({
            ...medium,

            books: Array.isArray(medium.books)
              ? medium.books.map((book) => ({
                  id: book.id,
                  name: book.name,
                }))
              : [],
          }))
        : [],
    }));
  };


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
    />
  );
}