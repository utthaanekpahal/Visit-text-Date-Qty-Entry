import React from "react";
import * as XLSX from "xlsx";
import { FiUpload } from "react-icons/fi";
import type { School, Subject, BookEntry } from "../types.ts";

interface Props {
  setSchools: React.Dispatch<React.SetStateAction<School[]>>;
  subjects: Subject[];
}

// =====================================================
// IMPORT EXCEL
// =====================================================

export default function ImportExcel({
  setSchools,
  subjects,
}: Props) {
  // ===================================================
  // CREATE EMPTY BOOK STRUCTURE
  // ===================================================

  const createBooksData = (): School["books"] => {
    const books: School["books"] = {};

    (["11", "12"] as const).forEach((grade) => {
      books[grade] = {};

      subjects.forEach((subject) => {
        books[grade][subject.name] = {};

        subject.mediums.forEach((medium) => {
          /*
            One book = BookEntry[]
            
            Example:
            [
              { date: "", qty: "" }
            ]

            Therefore all books =
            [
              [
                { date: "", qty: "" }
              ],
              [
                { date: "", qty: "" }
              ]
            ]
          */

          books[grade][subject.name][medium.name] =
            medium.books.map(() => [
              {
                date: "",
                qty: "",
              },
            ]);
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
              row[1] !== undefined &&
              row[1] !== "" ||
              row[2] !== undefined &&
              row[2] !== ""
          )
          .map((row, index) => {
            const books = createBooksData();

            let col = 4;

            // ==========================================
            // CLASS 11 + CLASS 12
            // ==========================================

            (["11", "12"] as const).forEach((grade) => {
              subjects.forEach((subject) => {
                subject.mediums.forEach((medium) => {
                  medium.books.forEach(
                    (_, bookIndex) => {
                      const date =
                        row[col] !== undefined
                          ? String(row[col])
                          : "";

                      const qty =
                        row[col + 1] !== undefined
                          ? String(row[col + 1])
                          : "";

                      // ==================================
                      // IMPORTANT
                      // BookEntry[] required here
                      // ==================================

                      books[grade][subject.name][
                        medium.name
                      ][bookIndex] = [
                        {
                          date,
                          qty,
                        },
                      ];

                      col += 2;
                    }
                  );
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

        setSchools(importedSchools);

        alert(
          `${importedSchools.length} school(s) imported successfully.`
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
        rounded-xl
        bg-emerald-600
        px-6
        py-3
        font-semibold
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
}: {
  schools: School[];
  subjects: Subject[];
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
  // GET DATE / QTY
  // ===================================================

const getFieldValue = (
  school: School,
  grade: "11" | "12",
  subjectName: string,
  mediumName: string,
  bookIndex: number,
  field: "date" | "qty"
): string => {

  const data =
    school.books?.[grade]?.[subjectName]?.[
      mediumName
    ]?.[bookIndex];

  const entries = getEntries(data);

  return entries
    .map((entry) =>
      String(entry[field] ?? "").trim()
    )
    .filter((value) => value !== "")
    .join("\n");
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
  type: "filled" | "empty"
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
  // IMPORTANT:
  // CLASS 11 AND CLASS 12 EXPORTED SCHOOLS
  // ALAG-ALAG STORE HONGE
  // =================================================

  const exportedSchools: Record<"11" | "12", School[]> = {
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
      // CHECK DATE / QTY
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
        type === "filled" &&
        !hasFilledData
      ) {
        return;
      }

      // =============================================
      // EMPTY FILTER
      // =============================================

      if (
        type === "empty" &&
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

    // -----------------------------------------------
    // TOTAL ROW
    // -----------------------------------------------

    const totalRow: any[] = [
      "",
      "",
      `CLASS ${grade} TOTAL`,
      grade,
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

            // -----------------------------------------
            // QTY TOTAL
            // -----------------------------------------

            let totalQty = 0;

            classSchools.forEach((school) => {

              const bookEntries =
                school.books?.[
                  grade
                ]?.[
                  subject.name
                ]?.[
                  medium.name
                ]?.[
                  bookIndex
                ];

              if (!Array.isArray(bookEntries)) {
                return;
              }

              bookEntries.forEach(
                (entry: any) => {

                  const qty =
                    Number(
                      entry?.qty || 0
                    );

                  if (!isNaN(qty)) {
                    totalQty += qty;
                  }
                }
              );
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
      type === "filled"
        ? "No filled Date, Qty or Remark records were found."
        : "No empty records were found."
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

  let col = 4;

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

  const totalColumns =
    4 +
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
  ];

  for (
    let i = 4;
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
    type === "filled"
      ? "School_Filled_Report.xlsx"
      : "School_Empty_Report.xlsx";

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
          bg-green-600
          px-6
          py-3
          font-semibold
          text-white
          shadow-lg
          hover:bg-green-700
        "
      >
        Export Filled
      </button>

      <button
        type="button"
        onClick={() =>
          handleExport("empty")
        }
        className="
          rounded-xl
          bg-yellow-500
          px-6
          py-3
          font-semibold
          text-white
          shadow-lg
          hover:bg-yellow-600
        "
      >
        Export Empty
      </button>
    </div>
  );
}