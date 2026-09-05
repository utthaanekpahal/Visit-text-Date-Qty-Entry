import React, { useState } from "react";
import TableHeader from "./TableHeader";
import ImportExcel, { ExportExcel } from "./Excel";
import type {
  Subject,
  School,
  Book,
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

  // =====================================================
  // WHEN TYPE = ALL
  // We keep Textbook as the displayed data branch.
  // Because one table cell cannot display 4 independent
  // date/qty datasets at the same time.
  // =====================================================

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
    const subjectNameInput =
      prompt("Enter Subject Name");

    if (!subjectNameInput?.trim()) {
      return;
    }

    const subjectName =
      subjectNameInput.trim();

    const mediumNames = [
      "English Medium",
      "Hindi Medium",
    ];

    const bookInput = prompt(
      "Enter Book Names separated by comma"
    );

    if (!bookInput) return;

    const bookNames = bookInput
      .split(",")
      .map((name) => name.trim())
      .filter(
        (name) => name !== ""
      );

    if (bookNames.length === 0) {
      return;
    }

    const books: Book[] =
      bookNames.map(
        (bookName, index) => ({
          id: Date.now() + index,
          name: bookName,
        })
      );

    // =====================================================
    // CHECK EXISTING SUBJECT
    // =====================================================

    const existingSubject =
      subjects.find(
        (s) =>
          s.name.toLowerCase() ===
          subjectName.toLowerCase()
      );

    // =====================================================
    // EXISTING SUBJECT
    // =====================================================

    if (existingSubject) {
      // =========================================
      // UPDATE SUBJECT STRUCTURE
      // =========================================

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

          mediumNames.forEach(
            (mediumName) => {
              const index =
                updatedMediums.findIndex(
                  (medium) =>
                    medium.name.toLowerCase() ===
                    mediumName.toLowerCase()
                );

              if (index >= 0) {
                updatedMediums[index] = {
                  ...updatedMediums[index],

                  books: [
                    ...updatedMediums[index]
                      .books,
                    ...books,
                  ],
                };
              } else {
                updatedMediums.push({
                  id:
                    Date.now() +
                    Math.random(),

                  name: mediumName,

                  books: [...books],
                });
              }
            }
          );

          return {
            ...subject,
            mediums: updatedMediums,
          };
        })
      );

      // =========================================
      // UPDATE SCHOOL BOOK DATA
      // =========================================

      setSchools((prev) =>
        prev.map((school) => {
          const updatedBooks =
            structuredClone(
              school.books || {}
            );

          (["11", "12"] as const).forEach(
            (grade) => {
              // =================================
              // GRADE
              // =================================

              if (
                !updatedBooks[grade]
              ) {
                updatedBooks[grade] =
                  {};
              }

              // =================================
              // IMPORTANT:
              // USE ORIGINAL SUBJECT NAME
              // =================================

              const schoolSubjectName =
                existingSubject.name;

              if (
                !updatedBooks[grade][
                  schoolSubjectName
                ]
              ) {
                updatedBooks[grade][
                  schoolSubjectName
                ] = {};
              }

              // =================================
              // MEDIUM
              // =================================

              mediumNames.forEach(
                (mediumName) => {
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
                      createTypeBooks(
                        []
                      );
                  }

                  // =================================
                  // ADD NEW BOOKS TO ALL 4 TYPES
                  // =================================

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

                      const newBooks =
                        books.map(
                          () => [
                            {
                              date: "",
                              qty: "",
                              type,
                            },
                          ]
                        );

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
            books: updatedBooks,
          };
        })
      );
    }

    // =====================================================
    // NEW SUBJECT
    // =====================================================

    else {
      const newSubject: Subject = {
        id: Date.now(),

        name: subjectName,

        mediums: mediumNames.map(
          (medium, index) => ({
            id:
              Date.now() + index,

            name: medium,

            books: [...books],
          })
        ),
      };

      // =========================================
      // ADD SUBJECT
      // =========================================

      setSubjects((prev) => [
        ...prev,
        newSubject,
      ]);

      // =========================================
      // UPDATE SCHOOL BOOK DATA
      // =========================================

      setSchools((prev) =>
        prev.map((school) => {
          const updatedBooks =
            structuredClone(
              school.books || {}
            );

          (["11", "12"] as const).forEach(
            (grade) => {
              if (
                !updatedBooks[grade]
              ) {
                updatedBooks[grade] =
                  {};
              }

              if (
                !updatedBooks[grade][
                  subjectName
                ]
              ) {
                updatedBooks[grade][
                  subjectName
                ] = {};
              }

              mediumNames.forEach(
                (mediumName) => {
                  updatedBooks[
                    grade
                  ][subjectName][
                    mediumName
                  ] = createTypeBooks(
                    books
                  );
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

  const getBookTotalQty = (
    school: School,
    grade: Grade,
    subjectName: string,
    mediumName: string,
    bookIndex: number,
    type: BookType
  ) => {
    const bookEntries =
      school.books?.[
        grade
      ]?.[subjectName]?.[
        mediumName
      ]?.[type]?.[bookIndex];

    if (
      !Array.isArray(bookEntries)
    ) {
      return 0;
    }

    return bookEntries.reduce(
      (
        total: number,
        entry: any
      ) => {
        const qty = Number(
          entry?.qty || 0
        );

        return (
          total +
          (isNaN(qty) ? 0 : qty)
        );
      },
      0
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
          onChange={(e) =>
            setSelectedType(
              e.target.value
            )
          }
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
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            + Add School
          </button>

          <button
            onClick={addSubject}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Add Subject
          </button>

          <ImportExcel
            setSchools={setSchools}
            subjects={subjects}
          />

          <ExportExcel
            schools={schools}
            subjects={subjects}
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