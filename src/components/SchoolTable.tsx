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
                    // IMPORTANT:
                    // oldBooks + newBooks
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

    // =========================================
    // REMOVE SAME BOOK INDEX
    // FROM ALL FOUR TYPE BRANCHES
    // =========================================

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
  // =====================================================

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
  // GET BOOK TOTAL
  // =====================================================

 
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
      <div className="flex justify-between items-center mb-5">
        <input
          type="text"
          placeholder="Search School Code / School Name"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="border rounded px-3 py-2 w-80"
        />

        {/* SUBJECT FILTER */}
        <select
          value={selectedSubject}
          onChange={(e) =>
            setSelectedSubject(
              e.target.value
            )
          }
          className="border rounded px-3 py-2 ml-3"
        >
          <option value="All">
            All Subjects
          </option>

          {subjects.map(
            (subject) => (
              <option
                key={subject.id}
                value={subject.name}
              >
                {subject.name}
              </option>
            )
          )}
        </select>

        {/* MEDIUM FILTER */}
        <select
          value={selectedMedium}
          onChange={(e) =>
            setSelectedMedium(
              e.target.value
            )
          }
          className="border rounded px-3 py-2 ml-3"
        >
          <option value="All">
            All Mediums
          </option>

          <option value="English Medium">
            English Medium
          </option>

          <option value="Hindi Medium">
            Hindi Medium
          </option>
        </select>

        {/* TYPE FILTER */}
       <select
  value={selectedType}
  onChange={(e) => setSelectedType(e.target.value)}
  className="border rounded px-3 py-2 ml-3"
>
  <option value="All">
    All Types
  </option>

  <option value="Textbook">
    Textbook
  </option>

  <option value="Parikshabodh">
    Parikshabodh
  </option>

  <option value="Practical">
    Practical
  </option>

  <option value="Project">
    Project
  </option>

  <option value="Guide">
    Guide
  </option>
</select>

        {/* CLASS FILTER */}
        <select
          value={selectedClass}
          onChange={(e) =>
            setSelectedClass(
              e.target.value
            )
          }
          className="border rounded px-3 py-2 ml-3"
        >
          <option value="All">
            All Classes
          </option>

          <option value="11">
            Class 11
          </option>

          <option value="12">
            Class 12
          </option>
        </select>

        {/* BUTTONS */}
        <div className="flex gap-3">
          <button
            onClick={addSchool}
            className="bg-pink-600 hover:bg-green-700 text-white px-4 py-2 rounded text-xl font-bold"
          >
            + Add School
          </button>

          <button
            onClick={addSubject}
            className="bg-pink-600 text-xl font-bold hover:bg-blue-700 text-white px-4 py-2 rounded"
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
        </div>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="overflow-x-auto border rounded-lg relative">
        <table className="border-collapse w-full">
          <TableHeader
            subjects={visibleSubjects}
            selectedType={selectedType}
            setSubjects={setSubjects}
            deleteSubject={deleteSubject}
            deleteMedium={deleteMedium}
            deleteBook={deleteBook}
          />

          <tbody>
            {currentSchools.map(
              (school, index) => (
                <React.Fragment
                  key={school.id}
                >
                  {visibleGrades.map(
                    (
                      grade,
                      rowIndex
                    ) => (
                      <tr
                        key={`${school.id}-${grade}`}
                      >
                        {/* S.NO */}
                        {rowIndex ===
                          0 && (
                          <td
                            rowSpan={
                              visibleGrades.length
                            }
                            className="border p-2 text-center"
                          >
                            {indexOfFirst +
                              index +
                              1}
                          </td>
                        )}

                        {/* SCHOOL CODE */}
                        {rowIndex ===
                          0 && (
                          <td
                            rowSpan={
                              visibleGrades.length
                            }
                            className="border p-2"
                          >
                            <input
                              value={
                                school.code ||
                                ""
                              }
                              onChange={(
                                e
                              ) =>
                                setSchools(
                                  (
                                    prev
                                  ) =>
                                    prev.map(
                                      (
                                        s
                                      ) =>
                                        s.id ===
                                        school.id
                                          ? {
                                              ...s,
                                              code:
                                                e
                                                  .target
                                                  .value,
                                            }
                                          : s
                                    )
                                )
                              }
                              className="w-24 bg-transparent outline-none"
                            />
                          </td>
                        )}

                        {/* SCHOOL NAME */}
                        {rowIndex ===
                          0 && (
                          <td
                            rowSpan={
                              visibleGrades.length
                            }
                            className="
                              sticky
                              left-0
                              z-20
                              border
                              border-black
                              border-r-2
                              bg-white
                              p-2
                              min-w-[250px]
                            "
                          >
                            <div className="flex items-center justify-between">
                              <span>
                                {
                                  school.schoolName
                                }
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteSchool(
                                    school.id
                                  )
                                }
                              >
                                <FiTrash2 className="text-red-600" />
                              </button>
                            </div>
                          </td>
                        )}

                        {/* CLASS */}
                        <td className="border p-2 text-center">
                          {grade}
                        </td>

                        {/* =================================================
                            SUBJECT DATA
                        ================================================= */}

                        {visibleSubjects.map(
                          (subject) =>
                            subject.mediums.map(
                              (medium) =>
                                medium.books.map(
                                  (
                                    book,
                                    bookIndex
                                  ) => {
                                    // =========================================
                                    // IMPORTANT
                                    // DO NOT FILTER BOOK BY TYPE
                                    //
                                    // Same book is shared by all 4 types.
                                    // selectedType decides which DATA branch
                                    // will be displayed/edited.
                                    // =========================================

                                    const rawBookEntries =
                                      school
                                        .books?.[
                                        grade
                                      ]?.[
                                        subject
                                          .name
                                      ]?.[
                                        medium
                                          .name
                                      ]?.[
                                        activeType
                                      ]?.[
                                        bookIndex
                                      ];

                                    const bookEntries =
                                      Array.isArray(
                                        rawBookEntries
                                      )
                                        ? rawBookEntries
                                        : [
                                            {
                                              date: "",
                                              qty: "",
                                              type:
                                                activeType,
                                            },
                                          ];

                                    return (
                                      <React.Fragment
                                        key={`${school.id}-${grade}-${subject.id}-${medium.id}-${book.id}`}
                                      >
                                        {/* ================= DATE ================= */}
                                        <td className="border p-1 align-top">
                                          <textarea
                                            value={bookEntries
                                              .map(
                                                (
                                                  entry: any
                                                ) =>
                                                  entry?.date ||
                                                  ""
                                              )
                                              .join(
                                                "\n"
                                              )}
                                            onChange={(
                                              e
                                            ) => {
                                              handleTextareaChange(
                                                school.id,
                                                grade,
                                                subject.name,
                                                medium.name,
                                                bookIndex,
                                                "date",
                                                e
                                                  .target
                                                  .value,
                                                activeType
                                              );

                                              e.target.style.height =
                                                "auto";

                                              e.target.style.height = `${e.target.scrollHeight}px`;
                                            }}
                                            onFocus={(
                                              e
                                            ) => {
                                              e.target.style.height =
                                                "auto";

                                              e.target.style.height = `${e.target.scrollHeight}px`;
                                            }}
                                            rows={1}
                                            className="
                                              w-full
                                              min-w-[120px]
                                              min-h-[24px]
                                              resize-none
                                              overflow-hidden
                                              bg-transparent
                                              outline-none
                                              text-center
                                              leading-6
                                              whitespace-pre-wrap
                                              block
                                            "
                                          />
                                        </td>

                                        {/* ================= QTY ================= */}
                                        <td className="border p-1 align-top">
                                          <textarea
                                            value={bookEntries
                                              .map(
                                                (
                                                  entry: any
                                                ) =>
                                                  typeof entry ===
                                                    "object" &&
                                                  entry !==
                                                    null
                                                    ? entry.qty ||
                                                      ""
                                                    : ""
                                              )
                                              .join(
                                                "\n"
                                              )}
                                            onChange={(
                                              e
                                            ) => {
                                              handleTextareaChange(
                                                school.id,
                                                grade,
                                                subject.name,
                                                medium.name,
                                                bookIndex,
                                                "qty",
                                                e
                                                  .target
                                                  .value,
                                                activeType
                                              );

                                              e.target.style.height =
                                                "auto";

                                              e.target.style.height = `${e.target.scrollHeight}px`;
                                            }}
                                            onFocus={(
                                              e
                                            ) => {
                                              e.target.style.height =
                                                "auto";

                                              e.target.style.height = `${e.target.scrollHeight}px`;
                                            }}
                                            rows={1}
                                            className="
                                              w-20
                                              min-h-[24px]
                                              resize-none
                                              overflow-hidden
                                              bg-transparent
                                              outline-none
                                              text-center
                                              leading-6
                                              whitespace-pre-wrap
                                              block
                                            "
                                          />
                                        </td>
                                      </React.Fragment>
                                    );
                                  }
                                )
                            )
                        )}

                        {/* ================= REMARK ================= */}

                        <td className="border p-1 align-top min-w-[180px]">
                          <textarea
                            value={
                              school.remarks?.[
                                grade
                              ] ?? ""
                            }
                            onChange={(e) =>
                              setSchools(
                                (prev) =>
                                  prev.map(
                                    (s) =>
                                      s.id ===
                                      school.id
                                        ? {
                                            ...s,
                                            remarks:
                                              {
                                                ...s.remarks,
                                                [grade]:
                                                  e
                                                    .target
                                                    .value,
                                              },
                                          }
                                        : s
                                  )
                              )
                            }
                            placeholder={`Remark for Class ${grade}`}
                            rows={2}
                            className="
                              w-full
                              min-h-[50px]
                              resize-none
                              overflow-hidden
                              bg-transparent
                              outline-none
                              text-left
                              leading-6
                            "
                          />
                        </td>
                      </tr>
                    )
                  )}
                </React.Fragment>
              )
            )}

            {/* =====================================================
                CLASS 11 GRAND TOTAL
            ===================================================== */}

            {(selectedClass ===
              "All" ||
              selectedClass ===
                "11") && (
              <tr className="font-bold bg-gray-100">
                <td
                  colSpan={4}
                  className="border p-2 text-center"
                >
                  CLASS 11 GRAND TOTAL
                </td>

                {visibleSubjects.map(
                  (subject) =>
                    subject.mediums.map(
                      (medium) =>
                        medium.books.map(
                          (
                            book,
                            bookIndex
                          ) => (
                            <React.Fragment
                              key={`grand-total-11-${subject.id}-${medium.id}-${book.id}`}
                            >
                              {/* DATE */}
                              <td className="border p-2 text-center">
                                Total
                              </td>

                              {/* QTY */}
                              <td className="border p-2 text-center font-bold">
                                {getGrandTotalQty(
                                  "11",
                                  subject.name,
                                  medium.name,
                                  bookIndex,
                                  activeType
                                )}
                              </td>
                            </React.Fragment>
                          )
                        )
                    )
                )}

                <td className="border p-2 text-center">
                  -
                </td>
              </tr>
            )}

            {/* =====================================================
                CLASS 12 GRAND TOTAL
            ===================================================== */}

            {(selectedClass ===
              "All" ||
              selectedClass ===
                "12") && (
              <tr className="font-bold bg-gray-100">
                <td
                  colSpan={4}
                  className="border p-2 text-center"
                >
                  CLASS 12 GRAND TOTAL
                </td>

                {visibleSubjects.map(
                  (subject) =>
                    subject.mediums.map(
                      (medium) =>
                        medium.books.map(
                          (
                            book,
                            bookIndex
                          ) => (
                            <React.Fragment
                              key={`grand-total-12-${subject.id}-${medium.id}-${book.id}`}
                            >
                              {/* DATE */}
                              <td className="border p-2 text-center">
                                Total
                              </td>

                              {/* QTY */}
                              <td className="border p-2 text-center font-bold">
                                {getGrandTotalQty(
                                  "12",
                                  subject.name,
                                  medium.name,
                                  bookIndex,
                                  activeType
                                )}
                              </td>
                            </React.Fragment>
                          )
                        )
                    )
                )}

                <td className="border p-2 text-center">
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