import React, { useState } from "react";
import TableHeader from "./TableHeader";
import ImportExcel, { ExportExcel } from "./Excel";
import type {
  Subject,
  School,
  Book,
  Medium,
  BookType,
  Grade,
} from "../types";
import { FiTrash2 } from "react-icons/fi";
import Pagination from "./Pagination";

interface SchoolTableProps {
  subjects: Subject[];
  schools: School[];
  setSchools: React.Dispatch<React.SetStateAction<School[]>>;
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
handleInputChange: (
  schoolId: number,
  grade: string,
  subjectName: string,
  mediumName: string,
  bookIndex: number,
  entryIndex: number,
  field: "date" | "qty",
  value: string,
  type: BookType
) => void;

getBookName: (
  bookName: string,
  mediumName: string
) => string;

getSubjectName: (
  subjectName: string,
  mediumName: string
) => string;
}

const BOOK_TYPES: BookType[] = [
  "Textbook",
  "Parikshabodh",
  "Practical",
  "Project",
  "Guide"
];
export default function SchoolTable({
  subjects,
  schools,
  setSchools,
  setSubjects,
  handleInputChange,
  getBookName,
  getSubjectName,
}: SchoolTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const [selectedSubject, setSelectedSubject] =
    useState("All");

  const [selectedMedium, setSelectedMedium] =
    useState("All");

  const [selectedType, setSelectedType] =
    useState("All");
const [selectedSchools, setSelectedSchools] = useState<number[]>([]);
  const [selectedClass, setSelectedClass] =
    useState("All");

  React.useEffect(() => {
    if (
      selectedSubject !== "All" &&
      subjects.length &&
      !subjects.find(
        (s) => s.name === selectedSubject
      )
    ) {
      setSelectedSubject("All");
    }
  }, [subjects, selectedSubject]);



  const activeType: BookType =
    selectedType === "All"
      ? "Textbook"
      : (selectedType as BookType);

  // =====================================================
  // VISIBLE SUBJECTS
  // =====================================================

  const visibleSubjects = subjects
    .filter((subject) =>
      selectedSubject === "All"
        ? true
        : subject.name === selectedSubject
    )
    .map((subject) => ({
      ...subject,
      mediums:
        selectedMedium === "All"
          ? subject.mediums
          : subject.mediums.filter(
              (medium) =>
                medium.name === selectedMedium
            ),
    }))
    .filter(
      (subject) => subject.mediums.length > 0
    );

  // =====================================================
  // SEARCH
  // =====================================================

  const searchText = search.trim().toLowerCase();

  const filteredSchools = schools.filter(
    (school) => {
      const code = (
        school.code ?? ""
      ).toLowerCase();

      const schoolName = (
        school.schoolName ?? ""
      ).toLowerCase();

      const grade = (
        school.grade ?? ""
      ).toLowerCase();

      const booksText = JSON.stringify(
        school.books ?? ""
      ).toLowerCase();

      return (
        code.includes(searchText) ||
        schoolName.includes(searchText) ||
        grade.includes(searchText) ||
        booksText.includes(searchText)
      );
    }
  );

  // =====================================================
  // PAGINATION
  // =====================================================

  const indexOfLast =
    currentPage * itemsPerPage;

  const indexOfFirst =
    indexOfLast - itemsPerPage;

  const currentSchools =
    filteredSchools.slice(
      indexOfFirst,
      indexOfLast
    );

  // =====================================================
  // VISIBLE GRADES
  // =====================================================

  const visibleGrades: Grade[] =
    selectedClass === "All"
      ? (["11", "12"] as const)
      : ([selectedClass as Grade] as const);

  // =====================================================
  // CREATE TYPE DATA FOR A MEDIUM
  // =====================================================

  const createTypeBooks = (
    books: Book[]
  ) => {
    const result = {} as Record<
      BookType,
      Array<
        Array<{
          date: string;
          qty: string;
          type: BookType;
        }>
      >
    >;

    BOOK_TYPES.forEach((type) => {
      result[type] = books.map(() => [
        {
          date: "",
          qty: "",
          type,
        },
      ]);
    });

    return result;
  };

  
  // =====================================================
  // ADD SCHOOL
  // =====================================================

  const addSchool = () => {
    // =========================================
    // SCHOOL CODE - OPTIONAL
    // =========================================

    const codeInput = prompt(
      "Enter School Code (Optional)"
    );

    const code =
      codeInput?.trim() || "";

    // =========================================
    // SCHOOL NAME - REQUIRED
    // =========================================

    const schoolNameInput =
      prompt("Enter School Name");

    if (!schoolNameInput?.trim()) {
      return;
    }

    const schoolName =
      schoolNameInput.trim();

    // =========================================
    // CREATE BOOK DATA
    // =========================================

    const books =
      {} as School["books"];

    (["11", "12"] as const).forEach(
      (grade) => {
        books[grade] = {};

        subjects.forEach((subject) => {
          books[grade][subject.name] =
            {};

          subject.mediums.forEach(
            (medium) => {
              books[grade][subject.name][
                medium.name
              ] = createTypeBooks(
                medium.books
              );
            }
          );
        });
      }
    );

    // =========================================
    // CREATE NEW SCHOOL
    // =========================================

    const newSchool: School = {
      id: Date.now(),
      code,
      schoolName,
      grade: "11",

      remarks: {
        "11": "",
        "12": "",
      },

      books,
    };

    // =========================================
    // ADD SCHOOL
    // =========================================

    setSchools((prev) => [
      ...prev,
      newSchool,
    ]);
  };

  // =====================================================
  // ADD SUBJECT
  // =====================================================

 const addSubject = () => {
  // =====================================================
  // STEP 1: MAIN SUBJECT
  // =====================================================

  const subjectNameInput =
    prompt("Enter Main Subject");

  if (subjectNameInput === null) {
    return;
  }

  const subjectName =
    subjectNameInput.trim();

  if (!subjectName) {
    alert("Subject name is required.");
    return;
  }

  // =====================================================
  // STEP 2: ENGLISH MEDIUM SUB SUBJECTS
  // =====================================================

  const englishInput = prompt(
    "Enter English Medium Sub Subjects\n\n" +
      "Example: Physics, Chemistry, Biology\n\n" +
      "Click Cancel if you don't want English Medium."
  );

  let englishBooks: string[] = [];

  if (englishInput !== null) {
    englishBooks = englishInput
      .split(",")
      .map((name: string) => name.trim())
      .filter(
        (name: string) => name !== ""
      );
  }

  // =====================================================
  // STEP 3: HINDI MEDIUM SUB SUBJECTS
  // =====================================================

  const hindiInput = prompt(
    "Enter Hindi Medium Sub Subjects\n\n" +
      "Example: Bhautik, Rasayan, Jeev Vigyan\n\n" +
      "Click Cancel if you don't want Hindi Medium."
  );

  let hindiBooks: string[] = [];

  if (hindiInput !== null) {
    hindiBooks = hindiInput
      .split(",")
      .map((name: string) => name.trim())
      .filter(
        (name: string) => name !== ""
      );
  }

  // =====================================================
  // AT LEAST ONE MEDIUM REQUIRED
  // =====================================================

  if (
    englishBooks.length === 0 &&
    hindiBooks.length === 0
  ) {
    alert(
      "Please enter at least one medium sub subject."
    );
    return;
  }

  // =====================================================
  // CREATE MEDIUM DATA
  // =====================================================

  const mediumData: Medium[] = [];

  // =====================================================
  // ENGLISH MEDIUM
  // =====================================================

  if (englishBooks.length > 0) {
    const books: Book[] =
      englishBooks.map(
        (
          bookName: string,
          index: number
        ) => ({
          id:
            Date.now() +
            index,

          name: bookName,
        })
      );

    mediumData.push({
      id: Date.now(),

      name: "English Medium",

      books,
    });
  }

  // =====================================================
  // HINDI MEDIUM
  // =====================================================

  if (hindiBooks.length > 0) {
    const books: Book[] =
      hindiBooks.map(
        (
          bookName: string,
          index: number
        ) => ({
          id:
            Date.now() +
            1000 +
            index,

          name: bookName,
        })
      );

    mediumData.push({
      id:
        Date.now() +
        1000,

      name: "Hindi Medium",

      books,
    });
  }

  // =====================================================
  // CHECK EXISTING SUBJECT
  // =====================================================

  const existingSubject =
    subjects.find(
      (subject) =>
        subject.name.toLowerCase() ===
        subjectName.toLowerCase()
    );

  // =====================================================
  // EXISTING SUBJECT
  // =====================================================

  if (existingSubject) {

    // ===================================================
    // UPDATE SUBJECT STRUCTURE
    // ===================================================

    setSubjects((prev) =>
      prev.map((subject) => {

        if (
          subject.name !==
          existingSubject.name
        ) {
          return subject;
        }

        const updatedMediums = [
          ...subject.mediums,
        ];

        mediumData.forEach(
          (newMedium) => {

            const mediumIndex =
              updatedMediums.findIndex(
                (medium) =>
                  medium.name.toLowerCase() ===
                  newMedium.name.toLowerCase()
              );

            // =========================================
            // MEDIUM ALREADY EXISTS
            // =========================================

            if (mediumIndex >= 0) {

              updatedMediums[
                mediumIndex
              ] = {
                ...updatedMediums[
                  mediumIndex
                ],

                books: [
                  ...updatedMediums[
                    mediumIndex
                  ].books,

                  ...newMedium.books,
                ],
              };

            }

            // =========================================
            // NEW MEDIUM
            // =========================================

            else {

              updatedMediums.push({
                id: newMedium.id,

                name: newMedium.name,

                books: [
                  ...newMedium.books,
                ],
              });

            }
          }
        );

        return {
          ...subject,

          mediums:
            updatedMediums,
        };
      })
    );

    // ===================================================
    // UPDATE SCHOOL BOOK DATA
    // ===================================================

    setSchools((prev) =>
      prev.map((school) => {

        const updatedBooks =
          structuredClone(
            school.books || {}
          );

        // =================================================
        // CLASS 11 AND CLASS 12
        // =================================================

        (["11", "12"] as const).forEach(
          (grade) => {

            // =============================================
            // CREATE GRADE
            // =============================================

            if (
              !updatedBooks[grade]
            ) {
              updatedBooks[grade] =
                {};
            }

            // =============================================
            // ORIGINAL SUBJECT NAME
            // =============================================

            const schoolSubjectName =
              existingSubject.name;

            // =============================================
            // CREATE SUBJECT
            // =============================================

            if (
              !updatedBooks[
                grade
              ][schoolSubjectName]
            ) {
              updatedBooks[
                grade
              ][schoolSubjectName] =
                {};
            }

            // =============================================
            // EACH MEDIUM
            // =============================================

            mediumData.forEach(
              (medium) => {

                const mediumName =
                  medium.name;

                const books =
                  medium.books;

                // =======================================
                // CREATE MEDIUM
                // =======================================

                if (
                  !updatedBooks[
                    grade
                  ][
                    schoolSubjectName
                  ][mediumName]
                ) {
                  updatedBooks[
                    grade
                  ][
                    schoolSubjectName
                  ][mediumName] =
                    createTypeBooks([]);
                }

                // =======================================
                // ADD BOOKS TO ALL BOOK TYPES
                // =======================================

                BOOK_TYPES.forEach(
                  (type) => {

                    const oldBooks =
                      updatedBooks[
                        grade
                      ][
                        schoolSubjectName
                      ][
                        mediumName
                      ][type] || [];

                    // BookEntry[]
                 const newBooks = books.map(() => [
  {
    date: "",
    qty: "",
    type,
  },
]);
                   
                    updatedBooks[
                      grade
                    ][
                      schoolSubjectName
                    ][
                      mediumName
                    ][type] = [
                      ...oldBooks,
                      ...newBooks,
                    ];
                  }
                );
              }
            );
          }
        );

        return {
          ...school,

          books:
            updatedBooks,
        };
      })
    );
  }

  // =====================================================
  // NEW SUBJECT
  // =====================================================

  else {

    // ===================================================
    // CREATE NEW SUBJECT
    // ===================================================

    const newSubject: Subject = {
      id: Date.now(),

      name: subjectName,

      mediums: mediumData,
    };

    // ===================================================
    // ADD SUBJECT
    // ===================================================

    setSubjects((prev) => [
      ...prev,

      newSubject,
    ]);

    // ===================================================
    // UPDATE SCHOOL DATA
    // ===================================================

    setSchools((prev) =>
      prev.map((school) => {

        const updatedBooks =
          structuredClone(
            school.books || {}
          );

        // =================================================
        // CLASS 11 + CLASS 12
        // =================================================

        (["11", "12"] as const).forEach(
          (grade) => {

            // =============================================
            // CREATE GRADE
            // =============================================

            if (
              !updatedBooks[grade]
            ) {
              updatedBooks[grade] =
                {};
            }

            // =============================================
            // CREATE SUBJECT
            // =============================================

            if (
              !updatedBooks[
                grade
              ][subjectName]
            ) {
              updatedBooks[
                grade
              ][subjectName] =
                {};
            }

            // =============================================
            // CREATE MEDIUM DATA
            // =============================================

            mediumData.forEach(
              (medium) => {

                updatedBooks[
                  grade
                ][subjectName][
                  medium.name
                ] = createTypeBooks(
                  medium.books
                );
              }
            );
          }
        );

        return {
          ...school,

          books:
            updatedBooks,
        };
      })
    );
  }
};

  // =====================================================
  // DELETE BOOK
  // =====================================================

  const deleteBook = (
    subjectName: string,
    mediumName: string,
    bookId: number
  ) => {
    if (
      !window.confirm(
        "Delete this book?"
      )
    ) {
      return;
    }

    // =========================================
    // FIND BOOK INDEX
    // =========================================

    const subject =
      subjects.find(
        (s) =>
          s.name === subjectName
      );

    const medium =
      subject?.mediums.find(
        (m) =>
          m.name === mediumName
      );

    const bookIndex =
      medium?.books.findIndex(
        (b) => b.id === bookId
      ) ?? -1;

    // =========================================
    // REMOVE FROM SUBJECTS
    // =========================================

    setSubjects((prev) =>
      prev.map((subject) => {
        if (
          subject.name !==
          subjectName
        ) {
          return subject;
        }

        return {
          ...subject,

          mediums:
            subject.mediums.map(
              (medium) => {
                if (
                  medium.name !==
                  mediumName
                ) {
                  return medium;
                }

                return {
                  ...medium,

                  books:
                    medium.books.filter(
                      (book) =>
                        book.id !==
                        bookId
                    ),
                };
              }
            ),
        };
      })
    );


    if (bookIndex !== -1) {
      setSchools((prev) =>
        prev.map((school) => {
          const updatedBooks =
            structuredClone(
              school.books || {}
            );

          (["11", "12"] as const).forEach(
            (grade) => {
              const mediumData =
                updatedBooks[
                  grade
                ]?.[subjectName]?.[
                  mediumName
                ];

              if (
                !mediumData ||
                typeof mediumData !==
                  "object"
              ) {
                return;
              }

              BOOK_TYPES.forEach(
                (type) => {
                  const typeBooks =
                    mediumData[type];

                  if (
                    Array.isArray(
                      typeBooks
                    )
                  ) {
                    mediumData[type] =
                      typeBooks.filter(
                        (
                          _,
                          index
                        ) =>
                          index !==
                          bookIndex
                      );
                  }
                }
              );
            }
          );

          return {
            ...school,
            books: updatedBooks,
          };
        })
      );
    }
  };

  // =====================================================
  // DELETE SCHOOL
  // =====================================================

  const deleteSchool = (
    schoolId: number
  ) => {
    if (
      !window.confirm(
        "Delete this school?"
      )
    ) {
      return;
    }

    setSchools((prev) =>
      prev.filter(
        (school) =>
          school.id !== schoolId
      )
    );
  };

  const deleteSelectedSchools = () => {
  if (selectedSchools.length === 0) {
    alert("Please select at least one school.");
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete ${selectedSchools.length} school(s)?`
  );

  if (!confirmed) return;

  setSchools((prev) =>
    prev.filter(
      (school) => !selectedSchools.includes(school.id)
    )
  );

  setSelectedSchools([]);
};

  // =====================================================
  // DELETE SUBJECT
  // =====================================================

  const deleteSubject = (
    subjectName: string
  ) => {
    if (
      !window.confirm(
        "Delete this subject?"
      )
    ) {
      return;
    }

    setSubjects((prev) =>
      prev.filter(
        (subject) =>
          subject.name !==
          subjectName
      )
    );

    setSchools((prev) =>
      prev.map((school) => {
        const updatedBooks =
          structuredClone(
            school.books || {}
          );

        (["11", "12"] as const).forEach(
          (grade) => {
            if (
              updatedBooks[grade]
            ) {
              delete updatedBooks[
                grade
              ][subjectName];
            }
          }
        );

        return {
          ...school,
          books: updatedBooks,
        };
      })
    );
  };

  // =====================================================
  // DELETE MEDIUM
  // ====================================================22

  const deleteMedium = (
    subjectName: string,
    mediumName: string
  ) => {
    if (
      !window.confirm(
        "Delete this medium?"
      )
    ) {
      return;
    }

    setSubjects((prev) =>
      prev.map((subject) => {
        if (
          subject.name !==
          subjectName
        ) {
          return subject;
        }

        return {
          ...subject,

          mediums:
            subject.mediums.filter(
              (medium) =>
                medium.name !==
                mediumName
            ),
        };
      })
    );

    setSchools((prev) =>
      prev.map((school) => {
        const updatedBooks =
          structuredClone(
            school.books || {}
          );

        (["11", "12"] as const).forEach(
          (grade) => {
            if (
              updatedBooks[
                grade
              ]?.[subjectName]
            ) {
              delete updatedBooks[
                grade
              ][subjectName][
                mediumName
              ];
            }
          }
        );

        return {
          ...school,
          books: updatedBooks,
        };
      })
    );
  };

  // =====================================================
  // HANDLE TEXTAREA
  // =====================================================

  const handleTextareaChange = (
    schoolId: number,
    grade: string,
    subjectName: string,
    mediumName: string,
    bookIndex: number,
    field: "date" | "qty",
    value: string,
    type: BookType
  ) => {
    const values =
      value.split("\n");

    values.forEach(
      (item, entryIndex) => {
        handleInputChange(
          schoolId,
          grade,
          subjectName,
          mediumName,
          bookIndex,
          entryIndex,
          field,
          item.trim(),
          type
        );
      }
    );
  };

  
  // =====================================================
  // GRAND TOTAL
  // =====================================================

  const getGrandTotalQty = (
    grade: Grade,
    subjectName: string,
    mediumName: string,
    bookIndex: number,
    type: BookType
  ) => {
    return schools.reduce(
      (
        grandTotal,
        school
      ) => {
        const bookEntries =
          school.books?.[
            grade
          ]?.[subjectName]?.[
            mediumName
          ]?.[type]?.[bookIndex];

        if (
          !Array.isArray(
            bookEntries
          )
        ) {
          return grandTotal;
        }

        return (
          grandTotal +
          bookEntries.reduce(
            (
              total: number,
              entry: any
            ) => {
              const qty =
                Number(
                  entry?.qty || 0
                );

              return (
                total +
                (isNaN(qty)
                  ? 0
                  : qty)
              );
            },
            0
          )
        );
      },
      0
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="p-5">
    
<div className="sticky top-0 z-[80] mb-5 rounded-lg border border-gray-300 bg-white p-4 shadow-md">

  {/* SEARCH AND FILTERS */}
  <div className="flex flex-wrap items-center gap-3">

    <input
      type="text"
      placeholder="Search School Code / School Name"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="h-10 w-full min-w-[220px] rounded border border-gray-300 px-3 sm:w-80"
    />

    {/* SUBJECT FILTER */}
    <select
      value={selectedSubject}
      onChange={(e) => setSelectedSubject(e.target.value)}
      className="h-10 min-w-[150px] rounded border border-gray-300 px-3"
    >
      <option value="All">All Subjects</option>
      {subjects.map((subject) => (
        <option key={subject.id} value={subject.name}>
          {subject.name}
        </option>
      ))}
    </select>

    {/* MEDIUM FILTER */}
    <select
      value={selectedMedium}
      onChange={(e) => setSelectedMedium(e.target.value)}
      className="h-10 min-w-[160px] rounded border border-gray-300 px-3"
    >
      <option value="All">All Mediums</option>
      <option value="English Medium">English Medium</option>
      <option value="Hindi Medium">Hindi Medium</option>
    </select>

    {/* TYPE FILTER */}
    <select
      value={selectedType}
      onChange={(e) => setSelectedType(e.target.value)}
      className="h-10 min-w-[150px] rounded border border-gray-300 px-3"
    >
      <option value="All">All Types</option>
      <option value="Textbook">Textbook</option>
      <option value="Parikshabodh">Parikshabodh</option>
      <option value="Practical">Practical</option>
      <option value="Project">Project</option>
      <option value="Guide">Guide</option>
    </select>

    {/* CLASS FILTER */}
    <select
      value={selectedClass}
      onChange={(e) => setSelectedClass(e.target.value)}
      className="h-10 min-w-[130px] rounded border border-gray-300 px-3"
    >
      <option value="All">All Classes</option>
      <option value="11">Class 11</option>
      <option value="12">Class 12</option>
    </select>

  </div>

  {/* ACTION BUTTONS */}
  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4">

    <button
      type="button"
      onClick={addSchool}
      className="rounded bg-pink-600 px-4 py-2 font-bold text-white hover:bg-pink-700"
    >
      + Add School
    </button>

    <button
      type="button"
      onClick={addSubject}
      className="rounded bg-pink-600 px-4 py-2 font-bold text-white hover:bg-pink-700"
    >
      + Add Subject
    </button>

    <ImportExcel
      setSchools={setSchools}
      subjects={subjects}
      selectedType={activeType}
    />

    <ExportExcel
      schools={schools}
      subjects={subjects}
      selectedType={activeType}
    />

    <button
      type="button"
      disabled={selectedSchools.length === 0}
      onClick={deleteSelectedSchools}
      className="rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Delete Selected ({selectedSchools.length})
    </button>

  </div>
</div>


      {/* =====================================================
          TABLE
      ===================================================== */}
<div className="relative w-full max-h-[70vh] overflow-auto rounded-lg border border-gray-300">
  <table className="min-w-[1800px] border-separate border-spacing-0">
      
<TableHeader
  subjects={visibleSubjects}
  selectedType={selectedType}
  setSubjects={setSubjects}
  deleteSubject={deleteSubject}
  deleteMedium={deleteMedium}
  deleteBook={deleteBook}
  getBookName={getBookName}
  getSubjectName={getSubjectName}
/>


          

<tbody>
  {currentSchools.map((school, index) => (
    <React.Fragment key={school.id}>
      {visibleGrades.map((grade, rowIndex) => (
        <tr key={`${school.id}-${grade}`} className="bg-white">

          {/* ACTION / SELECT */}
        {rowIndex === 0 && (
  <td
    rowSpan={visibleGrades.length}
    className="
      sticky left-0 z-30
      box-border
      min-w-[50px] w-[50px]
      border border-black
      bg-white
      p-0
      text-center align-middle
      [background-clip:padding-box]
      shadow-[1px_0_0_#000]
    "
  >
    <div className="flex h-full min-h-[60px] w-full items-center justify-center">
      <input
        type="checkbox"
        className="m-0 h-4 w-4 cursor-pointer"
        checked={selectedSchools.includes(school.id)}
        onChange={(e) => {
          setSelectedSchools((prev) =>
            e.target.checked
              ? [...new Set([...prev, school.id])]
              : prev.filter((id) => id !== school.id)
          );
        }}
      />
    </div>
  </td>
)}

          {/* S.NO */}
          {rowIndex === 0 && (
            <td
              rowSpan={visibleGrades.length}
              className="sticky left-[50px] z-30 box-border
                min-w-[70px] w-[70px]
                border border-black bg-white p-2 text-center
                shadow-[1px_0_0_#000,0_1px_0_#000]"
            >
              {indexOfFirst + index + 1}
            </td>
          )}

          {/* SCHOOL CODE */}
          {rowIndex === 0 && (
            <td
              rowSpan={visibleGrades.length}
              className="sticky left-[120px] z-30 box-border
                min-w-[140px] w-[140px]
                border border-black bg-white p-2
                shadow-[1px_0_0_#000,0_1px_0_#000]"
            >
              <input
                value={school.code || ""}
                onChange={(e) =>
                  setSchools((prev) =>
                    prev.map((s) =>
                      s.id === school.id
                        ? { ...s, code: e.target.value }
                        : s
                    )
                  )
                }
                className="w-full min-w-0 bg-transparent outline-none"
              />
            </td>
          )}

          {/* SCHOOL NAME */}
          {rowIndex === 0 && (
            <td
              rowSpan={visibleGrades.length}
              className="sticky left-[260px] z-30 box-border
                min-w-[250px] w-[250px]
                border border-black bg-white p-2
                shadow-[1px_0_0_#000,0_1px_0_#000]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 break-words">
                  {school.schoolName}
                </span>

                <button
                  type="button"
                  onClick={() => deleteSchool(school.id)}
                  className="shrink-0"
                >
                  <FiTrash2 className="text-red-600" />
                </button>
              </div>
            </td>
          )}

          {/* CLASS */}
          <td
            className="sticky left-[510px] z-30 box-border
              min-w-[80px] w-[80px]
              border border-black bg-white p-2 text-center
              shadow-[1px_0_0_#000,0_1px_0_#000]"
          >
            {grade}
          </td>

          {/* SUBJECT DATA */}
          {visibleSubjects.map((subject) =>
            subject.mediums.map((medium) =>
              medium.books.map((book, bookIndex) => {
                const rawBookEntries =
                  school.books?.[grade]?.[subject.name]?.[medium.name]?.[
                    activeType
                  ]?.[bookIndex];

                const bookEntries = Array.isArray(rawBookEntries)
                  ? rawBookEntries
                  : [{ date: "", qty: "", type: activeType }];

                return (
                  <React.Fragment
                    key={`${school.id}-${grade}-${subject.id}-${medium.id}-${book.id}`}
                  >
                    {/* DATE */}
                    <td className="border border-black p-1 align-top">
                      <textarea
                        value={bookEntries
                          .map((entry: any) => entry?.date || "")
                          .join("\n")}
                        onChange={(e) => {
                          handleTextareaChange(
                            school.id,
                            grade,
                            subject.name,
                            medium.name,
                            bookIndex,
                            "date",
                            e.target.value,
                            activeType
                          );

                          e.target.style.height = "auto";
                          e.target.style.height =
                            `${e.target.scrollHeight}px`;
                        }}
                        onFocus={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height =
                            `${e.target.scrollHeight}px`;
                        }}
                        rows={1}
                        className="block min-h-[24px] w-full min-w-[120px]
                          resize-none overflow-hidden bg-transparent
                          text-center text-xl font-semibold leading-6
                          outline-none whitespace-pre-wrap"
                      />
                    </td>

                    {/* QTY */}
                    <td className="border border-black p-1 align-top">
                      <textarea
                        value={bookEntries
                          .map((entry: any) =>
                            typeof entry === "object" && entry !== null
                              ? entry.qty || ""
                              : ""
                          )
                          .join("\n")}
                        onChange={(e) => {
                          handleTextareaChange(
                            school.id,
                            grade,
                            subject.name,
                            medium.name,
                            bookIndex,
                            "qty",
                            e.target.value,
                            activeType
                          );

                          e.target.style.height = "auto";
                          e.target.style.height =
                            `${e.target.scrollHeight}px`;
                        }}
                        onFocus={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height =
                            `${e.target.scrollHeight}px`;
                        }}
                        rows={1}
                        className="block min-h-[24px] w-20 resize-none
                          overflow-hidden bg-transparent text-center
                          text-xl font-semibold leading-6 outline-none
                          whitespace-pre-wrap"
                      />
                    </td>
                  </React.Fragment>
                );
              })
            )
          )}

          {/* REMARK */}
          <td className="min-w-[180px] border border-black p-1 align-top">
            <textarea
              value={school.remarks?.[grade] ?? ""}
              onChange={(e) =>
                setSchools((prev) =>
                  prev.map((s) =>
                    s.id === school.id
                      ? {
                          ...s,
                          remarks: {
                            ...s.remarks,
                            [grade]: e.target.value,
                          },
                        }
                      : s
                  )
                )
              }
              placeholder={`Remark for Class ${grade}`}
              rows={2}
              className="min-h-[50px] w-full resize-none overflow-hidden
                bg-transparent text-left text-xl font-semibold
                leading-6 outline-none"
            />
          </td>
        </tr>
      ))}
    </React.Fragment>
  ))}

  {/* CLASS 11 GRAND TOTAL */}
  {/* ================= CLASS 11 GRAND TOTAL ================= */}

{(selectedClass === "All" || selectedClass === "11") && (
  <tr className="bg-gray-100 font-bold">

    {/* Checkbox column */}
    <td
      className="sticky left-0 z-30 box-border
        w-[50px] min-w-[50px]
        border border-black bg-gray-100 p-0
        shadow-[1px_0_0_#000]"
    />

    {/* S.No column */}
    <td
      className="sticky left-[50px] z-30 box-border
        w-[70px] min-w-[70px]
        border border-black bg-gray-100 p-0
        shadow-[1px_0_0_#000]"
    />

    {/* School Code column */}
    <td
      className="sticky left-[120px] z-30 box-border
        w-[140px] min-w-[140px]
        border border-black bg-gray-100 p-0
        shadow-[1px_0_0_#000]"
    />

    {/* School Name / Grand Total label */}
    <td
      className="sticky left-[260px] z-30 box-border
        w-[250px] min-w-[250px]
        border border-black bg-gray-100
        p-2 text-center
        shadow-[1px_0_0_#000]"
    >
      CLASS 11 GRAND TOTAL
    </td>

    {/* Class column */}
    <td
      className="sticky left-[510px] z-30 box-border
        w-[80px] min-w-[80px]
        border border-black bg-gray-100 p-0
        shadow-[1px_0_0_#000]"
    />

    {/* Subject / Medium / Book totals */}
    {visibleSubjects.map((subject) =>
      subject.mediums.map((medium) =>
        medium.books.map((book, bookIndex) => (
          <React.Fragment
            key={`grand-total-11-${subject.id}-${medium.id}-${book.id}`}
          >
            <td className="box-border border border-black bg-gray-100 p-2 text-center">
              Total
            </td>

            <td className="box-border border border-black bg-gray-100 p-2 text-center">
              {getGrandTotalQty(
                "11",
                subject.name,
                medium.name,
                bookIndex,
                activeType
              )}
            </td>
          </React.Fragment>
        ))
      )
    )}

    {/* Remark column */}
    <td className="border border-black bg-gray-100 p-2 text-center">
      -
    </td>
  </tr>
)}

{/* ================= CLASS 12 GRAND TOTAL ================= */}

{(selectedClass === "All" || selectedClass === "12") && (
  <tr className="bg-gray-100 font-bold">

    {/* Checkbox column */}
    <td
      className="sticky left-0 z-30 box-border
        w-[50px] min-w-[50px]
        border border-black bg-gray-100 p-0
        shadow-[1px_0_0_#000]"
    />

    {/* S.No column */}
    <td
      className="sticky left-[50px] z-30 box-border
        w-[70px] min-w-[70px]
        border border-black bg-gray-100 p-0
        shadow-[1px_0_0_#000]"
    />

    {/* School Code column */}
    <td
      className="sticky left-[120px] z-30 box-border
        w-[140px] min-w-[140px]
        border border-black bg-gray-100 p-0
        shadow-[1px_0_0_#000]"
    />

    {/* School Name / Grand Total label */}
    <td
      className="sticky left-[260px] z-30 box-border
        w-[250px] min-w-[250px]
        border border-black bg-gray-100
        p-2 text-center
        shadow-[1px_0_0_#000]"
    >
      CLASS 12 GRAND TOTAL
    </td>

    {/* Class column */}
    <td
      className="sticky left-[510px] z-30 box-border
        w-[80px] min-w-[80px]
        border border-black bg-gray-100 p-0
        shadow-[1px_0_0_#000]"
    />

    {/* Subject / Medium / Book totals */}
    {visibleSubjects.map((subject) =>
      subject.mediums.map((medium) =>
        medium.books.map((book, bookIndex) => (
          <React.Fragment
            key={`grand-total-12-${subject.id}-${medium.id}-${book.id}`}
          >
            <td className="box-border border border-black bg-gray-100 p-2 text-center">
              Total
            </td>

            <td className="box-border border border-black bg-gray-100 p-2 text-center">
              {getGrandTotalQty(
                "12",
                subject.name,
                medium.name,
                bookIndex,
                activeType
              )}
            </td>
          </React.Fragment>
        ))
      )
    )}

    {/* Remark column */}
    <td className="border border-black bg-gray-100 p-2 text-center">
      -
    </td>
  </tr>
)}
</tbody>


        </table>

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        <Pagination
          currentPage={currentPage}
          totalItems={
            filteredSchools.length
          }
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}