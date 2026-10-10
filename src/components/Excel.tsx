import React from "react";
import * as XLSX from "xlsx";
import { FiUpload } from "react-icons/fi";
import type {
  School,
  Subject,
  BookEntry,
  BookType,
} from "../types.ts";

interface Props {
  setSchools: React.Dispatch<React.SetStateAction<School[]>>;
  subjects: Subject[];
  selectedType: BookType;
}

// =====================================================
// IMPORT EXCEL
// =====================================================

export default function ImportExcel({
  setSchools,
  subjects,
  selectedType,
}: Props) {
  // ===================================================
  // CREATE EMPTY BOOK STRUCTURE
  // ===================================================
const createBooksData = (): School["books"] => {
  const books: School["books"] = {};

  const BOOK_TYPES: BookType[] = [
    "Textbook",
    "Parikshabodh",
    "Practical",
    "Project",
    "Guide",
  ];

  (["11", "12"] as const).forEach((grade) => {
    books[grade] = {};

    subjects.forEach((subject) => {
      books[grade][subject.name] = {};

      subject.mediums.forEach((medium) => {
        books[grade][subject.name][medium.name] =
          {} as School["books"][string][string][string];

        BOOK_TYPES.forEach((type) => {
          books[grade][subject.name][medium.name][type] =
            medium.books.map(() => [
              {
                date: "",
                qty: "",
                type,
              },
            ]);
        });
      });
    });
  });

  return books;
};

  // ===================================================
  // FILE UPLOAD
  // ===================================================

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(
          event.target?.result as ArrayBuffer
        );

        const workbook = XLSX.read(data, {
          type: "array",
        });

        const sheetName = workbook.SheetNames[0];

        if (!sheetName) {
          alert("Excel sheet not found.");
          return;
        }

        const worksheet = workbook.Sheets[sheetName];

        const rows: any[][] = XLSX.utils.sheet_to_json(
          worksheet,
          {
            header: 1,
            defval: "",
          }
        );

        // ===============================================
        // SKIP 4 HEADER ROWS
        // ===============================================

        const dataRows = rows.slice(4);

        const importedSchools: School[] = dataRows
          .filter(
            (row) =>
              (row[1] !== undefined && row[1] !== "") ||
              (row[2] !== undefined && row[2] !== "")
          )
          .map((row, index) => {
            const books = createBooksData();

            // ==========================================
            // EXCEL FIXED COLUMNS
            // 0 = S.No
            // 1 = Code
            // 2 = School Name
            // 3 = Grade
            // 4 = Type
            // ==========================================

            const gradeValue = String(row[3] ?? "").trim();
            const excelType = String(row[4] ?? "").trim();

            const grade: "11" | "12" =
              gradeValue === "12" ? "12" : "11";

            // ==========================================
            // START BOOK DATA AFTER TYPE COLUMN
            // ==========================================

            let col = 5;

            // ==========================================
            // ONLY STORE SELECTED TYPE
            // ==========================================

            subjects.forEach((subject) => {
              subject.mediums.forEach((medium) => {
                medium.books.forEach((_, bookIndex) => {
                  const date =
                    row[col] !== undefined
                      ? String(row[col])
                      : "";

                  const qty =
                    row[col + 1] !== undefined
                      ? String(row[col + 1])
                      : "";

                  // If Excel contains a Type column,
                  // use selectedType. This keeps data
                  // separated between the 4 types.
                  const typeToStore: BookType =
                    excelType === selectedType
                      ? selectedType
                      : selectedType;

                  books[grade][subject.name][medium.name][
                    typeToStore
                  ][bookIndex] = [
                    {
                      date,
                      qty,
                      type: typeToStore,
                    },
                  ];

                  col += 2;
                });
              });
            });

            // ==========================================
            // RETURN SCHOOL
            // ==========================================

            return {
              id: Date.now() + index,

              code:
                row[1] !== undefined
                  ? String(row[1])
                  : "",

              schoolName:
                row[2] !== undefined
                  ? String(row[2])
                  : "",

              books,

              remarks: {
                "11": "",
                "12": "",
              },
            };
          });

        // ===============================================
        // SET IMPORTED SCHOOLS
        // ===============================================

        setSchools(importedSchools);

        alert(
          `${importedSchools.length} school(s) imported successfully for ${selectedType}.`
        );
      } catch (error) {
        console.error(
          "Excel import error:",
          error
        );

        alert(
          "Failed to import Excel file."
        );
      }
    };

    reader.readAsArrayBuffer(file);

    // Allow same file to be selected again
    e.target.value = "";
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <label
      className="
        flex
        cursor-pointer
        items-center
        gap-2
        rounded-
        text-xl
        bg-blue-600
        px-6
        py-3
        font-bold
        text-white
        shadow-lg
        hover:bg-emerald-700
      "
    >
      <FiUpload size={20} />

      Import Excel

      <input
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileUpload}
      />
    </label>
  );
}

// =====================================================
// EXPORT EXCEL
// =====================================================

export function ExportExcel({
  schools,
  subjects,
  selectedType,
}: {
  schools: School[];
  subjects: Subject[];
  selectedType: BookType;
}) {
  // ===================================================
  // GET BOOK ENTRIES
  // ===================================================

  const getEntries = (
    data: BookEntry[] | undefined
  ): BookEntry[] => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.filter(
      (entry): entry is BookEntry =>
        typeof entry === "object" &&
        entry !== null &&
        "date" in entry &&
        "qty" in entry
    );
  };

  // ===================================================
  // GET DATE / QTY FOR SELECTED TYPE ONLY
  // ===================================================

  const getFieldValue = (
    school: School,
    grade: "11" | "12",
    subjectName: string,
    mediumName: string,
    bookIndex: number,
    field: "date" | "qty"
  ): string => {
    const mediumData =
      school.books?.[grade]?.[subjectName]?.[mediumName];

    if (!mediumData) {
      return "";
    }

    // IMPORTANT:
    // Only selectedType data is exported.
    const data =
      mediumData[selectedType]?.[bookIndex];

    const entries = getEntries(data);

    const values: string[] = [];

    entries.forEach((entry) => {
      const value = String(
        entry[field] ?? ""
      ).trim();

      if (value !== "") {
        values.push(value);
      }
    });

    return values.join("\n");
  };

  // ===================================================
  // GET REMARK
  // ===================================================

  const getRemark = (
    school: School,
    grade: "11" | "12"
  ): string => {
    return school.remarks?.[grade] ?? "";
  };

  // ===================================================
  // EXPORT
  // ===================================================

  const handleExport = (
    exportType: "filled" | "empty"
  ) => {
    const rows: any[][] = [];

    // =================================================
    // HEADER 1 - SUBJECT
    // =================================================

    const row1: any[] = [
      "S.No",
      "Code",
      "School Name",
      "Grade",
      "Type",
    ];

    subjects.forEach((subject) => {
      row1.push(subject.name);

      let count = 0;

      subject.mediums.forEach((medium) => {
        count += medium.books.length * 2;
      });

      for (let i = 1; i < count; i++) {
        row1.push("");
      }
    });

    row1.push("Remark");

    rows.push(row1);

    // =================================================
    // HEADER 2 - MEDIUM
    // =================================================

    const row2: any[] = [
      "",
      "",
      "",
      "",
      "",
    ];

    subjects.forEach((subject) => {
      subject.mediums.forEach((medium) => {
        row2.push(medium.name);

        for (
          let i = 1;
          i < medium.books.length * 2;
          i++
        ) {
          row2.push("");
        }
      });
    });

    row2.push("");

    rows.push(row2);

    // =================================================
    // HEADER 3 - BOOK
    // =================================================

    const row3: any[] = [
      "",
      "",
      "",
      "",
      "",
    ];

    subjects.forEach((subject) => {
      subject.mediums.forEach((medium) => {
        medium.books.forEach((book) => {
          row3.push(book.name);
          row3.push("");
        });
      });
    });

    row3.push("");

    rows.push(row3);

    // =================================================
    // HEADER 4 - DATE / QTY
    // =================================================

    const row4: any[] = [
      "",
      "",
      "",
      "",
      "",
    ];

    subjects.forEach((subject) => {
      subject.mediums.forEach((medium) => {
        medium.books.forEach(() => {
          row4.push("Date");
          row4.push("Qty");
        });
      });
    });

    row4.push("");

    rows.push(row4);

    // =================================================
    // SERIAL NUMBER
    // =================================================

    let serialNo = 1;

    // =================================================
    // CLASS 11 / CLASS 12 EXPORTED SCHOOLS
    // =================================================

    const exportedSchools: Record<
      "11" | "12",
      School[]
    > = {
      "11": [],
      "12": [],
    };

    // =================================================
    // DATA
    // =================================================

    schools.forEach((school) => {
      (
        ["11", "12"] as const
      ).forEach((grade) => {
        let hasFilledData = false;

        // =============================================
        // CHECK DATE / QTY FOR SELECTED TYPE ONLY
        // =============================================

        subjects.forEach((subject) => {
          subject.mediums.forEach((medium) => {
            medium.books.forEach(
              (_, bookIndex) => {
                const date =
                  getFieldValue(
                    school,
                    grade,
                    subject.name,
                    medium.name,
                    bookIndex,
                    "date"
                  );

                const qty =
                  getFieldValue(
                    school,
                    grade,
                    subject.name,
                    medium.name,
                    bookIndex,
                    "qty"
                  );

                if (
                  date.trim() !== "" ||
                  qty.trim() !== ""
                ) {
                  hasFilledData = true;
                }
              }
            );
          });
        });

        // =============================================
        // CHECK REMARK
        // =============================================

        const remark =
          getRemark(
            school,
            grade
          );

        if (
          remark.trim() !== ""
        ) {
          hasFilledData = true;
        }

        // =============================================
        // FILLED FILTER
        // =============================================

        if (
          exportType === "filled" &&
          !hasFilledData
        ) {
          return;
        }

        // =============================================
        // EMPTY FILTER
        // =============================================

        if (
          exportType === "empty" &&
          hasFilledData
        ) {
          return;
        }

        // =============================================
        // STORE EXPORTED SCHOOL
        // =============================================

        exportedSchools[grade].push(school);

        // =============================================
        // SCHOOL ROW
        // =============================================

        const row: any[] = [
          serialNo++,
          school.code ?? "",
          school.schoolName ?? "",
          grade,
          selectedType,
        ];

        // =============================================
        // SUBJECT DATA
        // =============================================

        subjects.forEach((subject) => {
          subject.mediums.forEach((medium) => {
            medium.books.forEach(
              (_, bookIndex) => {
                const date =
                  getFieldValue(
                    school,
                    grade,
                    subject.name,
                    medium.name,
                    bookIndex,
                    "date"
                  );

                const qty =
                  getFieldValue(
                    school,
                    grade,
                    subject.name,
                    medium.name,
                    bookIndex,
                    "qty"
                  );

                row.push(date);
                row.push(qty);
              }
            );
          });
        });

        // =============================================
        // REMARK
        // =============================================

        row.push(remark);

        rows.push(row);
      });
    });

    // =================================================
    // CLASS TOTAL ROW FUNCTION
    // =================================================

    const addClassTotalRow = (
      grade: "11" | "12"
    ) => {
      const classSchools =
        exportedSchools[grade];

      const totalRow: any[] = [
        "",
        "",
        `CLASS ${grade} TOTAL`,
        grade,
        selectedType,
      ];

      // -----------------------------------------------
      // SUBJECT / MEDIUM / BOOK TOTAL
      // -----------------------------------------------

      subjects.forEach((subject) => {
        subject.mediums.forEach((medium) => {
          medium.books.forEach(
            (_, bookIndex) => {
              // DATE COLUMN
              totalRow.push("Total");

              // QTY TOTAL
              let totalQty = 0;

              classSchools.forEach((school) => {
                const mediumData =
                  school.books?.[
                    grade
                  ]?.[
                    subject.name
                  ]?.[
                    medium.name
                  ];

                if (!mediumData) {
                  return;
                }

                // IMPORTANT:
                // Total only selectedType.
                const bookEntries =
                  mediumData[
                    selectedType
                  ]?.[bookIndex];

                if (!Array.isArray(bookEntries)) {
                  return;
                }

                bookEntries.forEach((entry) => {
                  const qty =
                    Number(
                      entry.qty || 0
                    );

                  if (!isNaN(qty)) {
                    totalQty += qty;
                  }
                });
              });

              totalRow.push(totalQty);
            }
          );
        });
      });

      // -----------------------------------------------
      // REMARK
      // -----------------------------------------------

      totalRow.push("-");

      rows.push(totalRow);
    };

    // =================================================
    // CLASS 11 TOTAL
    // =================================================

    if (
      exportedSchools["11"].length > 0
    ) {
      addClassTotalRow("11");
    }

    // =================================================
    // CLASS 12 TOTAL
    // =================================================

    if (
      exportedSchools["12"].length > 0
    ) {
      addClassTotalRow("12");
    }

    // =================================================
    // NO RECORD
    // =================================================

    if (rows.length === 4) {
      alert(
        exportType === "filled"
          ? `No filled ${selectedType} Date, Qty or Remark records were found.`
          : `No empty ${selectedType} records were found.`
      );

      return;
    }

    // =================================================
    // WORKSHEET
    // =================================================

    const worksheet =
      XLSX.utils.aoa_to_sheet(rows);

    // =================================================
    // MERGES
    // =================================================

    const merges: XLSX.Range[] = [];

    // IMPORTANT:
    // 0 S.No
    // 1 Code
    // 2 School Name
    // 3 Grade
    // 4 Type
    // 5 = first Subject column
    let col = 5;

    subjects.forEach((subject) => {
      let subjectSize = 0;

      subject.mediums.forEach(
        (medium) => {
          subjectSize +=
            medium.books.length * 2;
        }
      );

      // ===============================================
      // SUBJECT MERGE
      // ===============================================

      if (subjectSize > 0) {
        merges.push({
          s: {
            r: 0,
            c: col,
          },
          e: {
            r: 0,
            c:
              col +
              subjectSize -
              1,
          },
        });
      }

      // ===============================================
      // MEDIUM MERGE
      // ===============================================

      let mediumCol = col;

      subject.mediums.forEach(
        (medium) => {
          const mediumSize =
            medium.books.length * 2;

          if (mediumSize > 0) {
            merges.push({
              s: {
                r: 1,
                c: mediumCol,
              },
              e: {
                r: 1,
                c:
                  mediumCol +
                  mediumSize -
                  1,
              },
            });
          }

          mediumCol +=
            mediumSize;
        }
      );

      col += subjectSize;
    });

    // =================================================
    // REMARK MERGE
    // =================================================

    const remarkColumn = col;

    merges.push({
      s: {
        r: 0,
        c: remarkColumn,
      },
      e: {
        r: 3,
        c: remarkColumn,
      },
    });

    worksheet["!merges"] = merges;

    // =================================================
    // TOTAL COLUMNS
    // =================================================

    const totalBookColumns =
      subjects.reduce(
        (total, subject) => {
          return (
            total +
            subject.mediums.reduce(
              (
                mediumTotal,
                medium
              ) => {
                return (
                  mediumTotal +
                  medium.books.length * 2
                );
              },
              0
            )
          );
        },
        0
      );

    // 5 fixed columns + books + remark
    const totalColumns =
      5 +
      totalBookColumns +
      1;

    // =================================================
    // COLUMN WIDTH
    // =================================================

    const columnWidths: XLSX.ColInfo[] = [
      {
        wch: 8,
      },
      {
        wch: 15,
      },
      {
        wch: 30,
      },
      {
        wch: 10,
      },
      {
        wch: 18,
      },
    ];

    for (
      let i = 5;
      i < totalColumns - 1;
      i++
    ) {
      columnWidths.push({
        wch: 18,
      });
    }

    columnWidths.push({
      wch: 30,
    });

    worksheet["!cols"] =
      columnWidths;

    // =================================================
    // ROW HEIGHT
    // =================================================

    worksheet["!rows"] = [];

    for (
      let rowIndex = 4;
      rowIndex < rows.length;
      rowIndex++
    ) {
      const row =
        rows[rowIndex];

      let maxLines = 1;

      row.forEach((value) => {
        if (
          value !== null &&
          value !== undefined
        ) {
          const text =
            String(value);

          const lineCount =
            text.split("\n").length;

          if (
            lineCount > maxLines
          ) {
            maxLines =
              lineCount;
          }
        }
      });

      worksheet["!rows"][
        rowIndex
      ] = {
        hpt: Math.max(
          20,
          maxLines * 18
        ),
      };
    }

    // =================================================
    // WORKBOOK
    // =================================================

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "School Data"
    );

    // =================================================
    // FILE NAME
    // =================================================

    const fileName =
      exportType === "filled"
        ? `${selectedType}_Filled_Report.xlsx`
        : `${selectedType}_Empty_Report.xlsx`;

    // =================================================
    // DOWNLOAD
    // =================================================

    XLSX.writeFile(
      workbook,
      fileName
    );
  };

  // ===================================================
  // BUTTONS
  // ===================================================

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() =>
          handleExport("filled")
        }
        className="
          rounded-xl
          bg-blue-600
          px-6
          py-3
          font-bold
          text-white
          shadow-lg
          text-xl
          hover:bg-green-700
        "
      >
        Export Filled
      </button>
<button
  type="button"
  onClick={() => handleExport("empty")}
  disabled={true}
  className="
    rounded-xl
    bg-blue-600
    px-6
    py-3
    text-xl
    font-bold
    text-white
    shadow-lg
    hover:bg-yellow-600
    disabled:opacity-50
    disabled:cursor-not-allowed
    disabled:hover:bg-yellow-500
  "
>
  Export Empty
</button>
    </div>
  );
}
