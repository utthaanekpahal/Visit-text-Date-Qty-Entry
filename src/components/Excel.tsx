
import React from "react";
import * as XLSX from "xlsx-js-style";
import { FiUpload } from "react-icons/fi";
import type {
  School,
  Subject,
  BookEntry,
  BookType,
} from "../types.ts";

// =====================================================
// LOCATION TYPE
// =====================================================

interface SelectedLocation {
  state?: string;
  division?: string;
  area?: string;
  agent?: string;
}

// =====================================================
// IMPORT EXCEL
// =====================================================

interface ImportProps {
  setSchools: React.Dispatch<React.SetStateAction<School[]>>;
  subjects: Subject[];
  selectedType: BookType;
}

export default function ImportExcel({
  setSchools,
  subjects,
  selectedType,
}: ImportProps) {

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

        // First row = location details
        // Next four rows = table headers
        // Data starts from row index 5
        const dataRows = rows.slice(5);

        const importedSchools: School[] = dataRows
          .filter(
            (row) =>
              (row[1] !== undefined && row[1] !== "") ||
              (row[2] !== undefined && row[2] !== "")
          )
          .map((row, index) => {
            const books = createBooksData();

            const gradeValue = String(
              row[3] ?? ""
            ).trim();

            const grade: "11" | "12" =
              gradeValue.includes("12") ? "12" : "11";

            // Four fixed columns:
            // S.No, Code, School Name, Class
            let col = 4;

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

                  books[grade][subject.name][medium.name][
                    selectedType
                  ][bookIndex] = [
                    {
                      date,
                      qty,
                      type: selectedType,
                    },
                  ];

                  col += 2;
                });
              });
            });

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
          `${importedSchools.length} school(s) imported successfully for ${selectedType}.`
        );
      } catch (error) {
        console.error("Excel import error:", error);

        alert("Failed to import Excel file.");
      }
    };

    reader.readAsArrayBuffer(file);

    // Allow same file to be selected again
    e.target.value = "";
  };

  return (
    <label
      className="
        flex
        cursor-pointer
        items-center
        gap-2
        rounded-xl
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

interface ExportProps {
  schools: School[];
  subjects: Subject[];
  selectedType: BookType;
  selectedLocation?: SelectedLocation | null;
}

export function ExportExcel({
  schools,
  subjects,
  selectedType,
  selectedLocation,
}: ExportProps) {

  const [exportGrade, setExportGrade] = React.useState<
    "11" | "12" | "all"
  >("all");

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
    exportType: "filled" | "empty" | "all",
    gradeFilter: "11" | "12" | "all" = "all"
  ) => {

    type ExportGrade = "11" | "12";

    // ------------------------------------------
    // LOCATION DETAILS - SINGLE LINE
    // ------------------------------------------

    const locationDetails = selectedLocation ?? {};

    const locationInfo = [
      `State: ${locationDetails.state ?? ""}`,
      `Division: ${locationDetails.division ?? ""}`,
      `Area: ${locationDetails.area ?? ""}`,
      `Agent: ${locationDetails.agent ?? ""}`,
      `Type: ${selectedType}`,
    ].join("   |   ");

    const gradesToExport: ExportGrade[] =
      gradeFilter === "all"
        ? ["11", "12"]
        : [gradeFilter];

    // ------------------------------------------
    // ALL SUBJECT, MEDIUM AND BOOK COLUMNS
    // ------------------------------------------

    const allColumns = subjects.flatMap((subject) =>
      subject.mediums.flatMap((medium) =>
        medium.books.map((book, bookIndex) => ({
          subject,
          medium,
          book,
          bookIndex,
        }))
      )
    );

    const getText = (
      school: School,
      grade: ExportGrade,
      subjectName: string,
      mediumName: string,
      bookIndex: number,
      field: "date" | "qty"
    ): string =>
      String(
        getFieldValue(
          school,
          grade,
          subjectName,
          mediumName,
          bookIndex,
          field
        ) ?? ""
      ).trim();

    // ------------------------------------------
    // CHECK FILLED DATA
    // ------------------------------------------

    const hasFilledData = (
      school: School,
      grade: ExportGrade
    ): boolean => {

      const hasBookData = allColumns.some(
        ({ subject, medium, bookIndex }) => {

          const date = getText(
            school,
            grade,
            subject.name,
            medium.name,
            bookIndex,
            "date"
          );

          const qty = getText(
            school,
            grade,
            subject.name,
            medium.name,
            bookIndex,
            "qty"
          );

          return date !== "" || qty !== "";
        }
      );

      return (
        hasBookData ||
        String(getRemark(school, grade) ?? "").trim() !== ""
      );
    };

    // ------------------------------------------
    // SELECT RECORDS
    // ------------------------------------------

    const exportedRecords: {
      school: School;
      grade: ExportGrade;
    }[] = [];

    schools.forEach((school) => {
      gradesToExport.forEach((grade) => {

        const filled = hasFilledData(school, grade);

        if (
          exportType === "all" ||
          (exportType === "filled" && filled) ||
          (exportType === "empty" && !filled)
        ) {
          exportedRecords.push({
            school,
            grade,
          });
        }
      });
    });

    if (exportedRecords.length === 0) {
      alert(
        exportType === "filled"
          ? `No filled ${selectedType} records found.`
          : `No empty ${selectedType} records found.`
      );

      return;
    }

    // ------------------------------------------
    // EXPORT COLUMNS
    // ------------------------------------------

    const exportColumns =
      exportType === "empty" || exportType === "all"
        ? allColumns
        : allColumns.filter(
            ({ subject, medium, bookIndex }) =>
              exportedRecords.some(({ school, grade }) => {

                const date = getText(
                  school,
                  grade,
                  subject.name,
                  medium.name,
                  bookIndex,
                  "date"
                );

                const qty = getText(
                  school,
                  grade,
                  subject.name,
                  medium.name,
                  bookIndex,
                  "qty"
                );

                return date !== "" || qty !== "";
              })
          );

    // ------------------------------------------
    // ROW SETTINGS
    // ------------------------------------------

    const FIXED_COLUMNS = 4;

    // Row 0 = Location information
    // Rows 1 to 4 = Existing table headers
    // Row 5 onwards = Data

    const HEADER_START_ROW = 1;
    const DATA_START_ROW = 5;

    const remarkColumn =
      FIXED_COLUMNS + exportColumns.length * 2;

    const totalColumns = remarkColumn + 1;

    const rows: any[][] = [];
    const merges: XLSX.Range[] = [];

    // ------------------------------------------
    // FIRST ROW - LOCATION INFORMATION
    // ------------------------------------------

    rows.push([locationInfo]);

    // Merge location information across full width
    merges.push({
      s: { r: 0, c: 0 },
      e: {
        r: 0,
        c: totalColumns - 1,
      },
    });

    // ------------------------------------------
    // FOUR EXISTING HEADER ROWS
    // ------------------------------------------

    const row1: any[] = [
      "S.No",
      "Code",
      "School Name",
      "Class",
    ];

    const row2: any[] = ["", "", "", ""];
    const row3: any[] = ["", "", "", ""];
    const row4: any[] = ["", "", "", ""];

    exportColumns.forEach((item, index) => {

      const { subject, medium, book } = item;

      const previous = exportColumns[index - 1];

      const isNewSubject =
        !previous ||
        previous.subject.id !== subject.id;

      const isNewMedium =
        !previous ||
        previous.subject.id !== subject.id ||
        previous.medium.id !== medium.id;

      row1.push(
        isNewSubject ? subject.name : "",
        ""
      );

      row2.push(
        isNewMedium ? medium.name : "",
        ""
      );

      row3.push(book.name, "");

      row4.push("Date", "Qty");

      const bookStartColumn =
        FIXED_COLUMNS + index * 2;

      // Book name merge
      merges.push({
        s: {
          r: HEADER_START_ROW + 2,
          c: bookStartColumn,
        },
        e: {
          r: HEADER_START_ROW + 2,
          c: bookStartColumn + 1,
        },
      });

      const next = exportColumns[index + 1];

      const isLastInSubject =
        !next ||
        next.subject.id !== subject.id;

      const isLastInMedium =
        !next ||
        next.subject.id !== subject.id ||
        next.medium.id !== medium.id;

      // Subject merge
      if (isLastInSubject) {

        const firstSubjectIndex =
          exportColumns.findIndex(
            (entry) =>
              entry.subject.id === subject.id
          );

        const subjectStart =
          FIXED_COLUMNS + firstSubjectIndex * 2;

        merges.push({
          s: {
            r: HEADER_START_ROW,
            c: subjectStart,
          },
          e: {
            r: HEADER_START_ROW,
            c: bookStartColumn + 1,
          },
        });
      }

      // Medium merge
      if (isLastInMedium) {

        const firstMediumIndex =
          exportColumns.findIndex(
            (entry) =>
              entry.subject.id === subject.id &&
              entry.medium.id === medium.id
          );

        const mediumStart =
          FIXED_COLUMNS + firstMediumIndex * 2;

        merges.push({
          s: {
            r: HEADER_START_ROW + 1,
            c: mediumStart,
          },
          e: {
            r: HEADER_START_ROW + 1,
            c: bookStartColumn + 1,
          },
        });
      }
    });

    // ------------------------------------------
    // REMARK COLUMN
    // ------------------------------------------

    row1.push("Remark");
    row2.push("");
    row3.push("");
    row4.push("");

    // Fixed columns vertically merged across four header rows
    for (
      let column = 0;
      column < FIXED_COLUMNS;
      column++
    ) {
      merges.push({
        s: {
          r: HEADER_START_ROW,
          c: column,
        },
        e: {
          r: HEADER_START_ROW + 3,
          c: column,
        },
      });
    }

    // Remark vertically merged
    merges.push({
      s: {
        r: HEADER_START_ROW,
        c: remarkColumn,
      },
      e: {
        r: HEADER_START_ROW + 3,
        c: remarkColumn,
      },
    });

    // Add four table header rows
    rows.push(
      row1,
      row2,
      row3,
      row4
    );

    // ------------------------------------------
    // DATA ROWS
    // ------------------------------------------

    let serialNo = 1;

    schools.forEach((school) => {

      gradesToExport.forEach((grade) => {

        const record = exportedRecords.find(
          (item) =>
            item.school === school &&
            item.grade === grade
        );

        if (!record) return;

        const row: any[] = [
          serialNo++,
          school.code ?? "",
          school.schoolName ?? "",
          `Class ${grade}`,
        ];

        exportColumns.forEach(
          ({ subject, medium, bookIndex }) => {

            const date = getText(
              school,
              grade,
              subject.name,
              medium.name,
              bookIndex,
              "date"
            );

            const qty = getText(
              school,
              grade,
              subject.name,
              medium.name,
              bookIndex,
              "qty"
            );

            const numericQty =
              qty !== "" &&
              Number.isFinite(Number(qty))
                ? Number(qty)
                : qty;

            row.push(date, numericQty);
          }
        );

        row.push(
          getRemark(school, grade) ?? ""
        );

        rows.push(row);
      });
    });

    // ------------------------------------------
    // CLASS-WISE TOTAL ROWS
    // ------------------------------------------

    gradesToExport.forEach((grade) => {

      const classRecords = exportedRecords.filter(
        (record) => record.grade === grade
      );

      if (classRecords.length === 0) return;

      const totalRow: any[] = [
        "",
        "",
        `CLASS ${grade} TOTAL`,
        `Class ${grade}`,
      ];

      exportColumns.forEach(
        ({ subject, medium, bookIndex }) => {

          let totalQty = 0;

          classRecords.forEach(({ school }) => {

            const qty = getText(
              school,
              grade,
              subject.name,
              medium.name,
              bookIndex,
              "qty"
            );

            if (
              qty !== "" &&
              Number.isFinite(Number(qty))
            ) {
              totalQty += Number(qty);
            }
          });

          totalRow.push("Total", totalQty);
        }
      );

      totalRow.push("");

      rows.push(totalRow);
    });

    // ------------------------------------------
    // CREATE WORKSHEET
    // ------------------------------------------

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    worksheet["!merges"] = merges;

    // ------------------------------------------
    // COLUMN WIDTHS
    // ------------------------------------------

    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 14 },
      { wch: 40 },
      { wch: 12 },

      ...exportColumns.flatMap(() => [
        { wch: 15 },
        { wch: 10 },
      ]),

      { wch: 25 },
    ];

    // ------------------------------------------
    // FREEZE PANES
    // ------------------------------------------

    worksheet["!freeze"] = {
      xSplit: FIXED_COLUMNS,
      ySplit: DATA_START_ROW,
      topLeftCell: "E6",
      activePane: "bottomRight",
      state: "frozen",
    };

    // ------------------------------------------
    // AUTOFILTER
    // ------------------------------------------

    worksheet["!autofilter"] = {
      ref: XLSX.utils.encode_range({
        s: {
          r: 4,
          c: 0,
        },
        e: {
          r: Math.max(4, rows.length - 1),
          c: totalColumns - 1,
        },
      }),
    };

    // ------------------------------------------
    // ROW HEIGHTS
    // ------------------------------------------

    worksheet["!rows"] = rows.map(
      (row, rowIndex) => ({
        hpt:
          rowIndex === 0
            ? 30
            : rowIndex < DATA_START_ROW
              ? 28
              : String(row[2] ?? "").length > 35
                ? 40
                : 25,
      })
    );

    // ------------------------------------------
    // STYLES
    // ------------------------------------------

    const borderStyle = {
      top: {
        style: "thin" as const,
        color: { rgb: "B7C9D6" },
      },
      bottom: {
        style: "thin" as const,
        color: { rgb: "B7C9D6" },
      },
      left: {
        style: "thin" as const,
        color: { rgb: "B7C9D6" },
      },
      right: {
        style: "thin" as const,
        color: { rgb: "B7C9D6" },
      },
    };

    const locationStyle = {
      fill: {
        fgColor: { rgb: "EAF2F8" },
      },
      font: {
        bold: true,
        color: { rgb: "17365D" },
        sz: 12,
      },
      alignment: {
        horizontal: "left" as const,
        vertical: "center" as const,
        wrapText: false,
      },
      border: borderStyle,
    };

    const headerStyle = {
      fill: {
        fgColor: { rgb: "1F4E78" },
      },
      font: {
        bold: true,
        color: { rgb: "FFFFFF" },
        sz: 11,
      },
      alignment: {
        horizontal: "center" as const,
        vertical: "center" as const,
        wrapText: true,
      },
      border: borderStyle,
    };

    const subHeaderStyle = {
      fill: {
        fgColor: { rgb: "D9EAF7" },
      },
      font: {
        bold: true,
        color: { rgb: "17365D" },
      },
      alignment: {
        horizontal: "center" as const,
        vertical: "center" as const,
        wrapText: true,
      },
      border: borderStyle,
    };

    const cellStyle = {
      alignment: {
        horizontal: "center" as const,
        vertical: "center" as const,
        wrapText: true,
      },
      border: {
        top: {
          style: "thin" as const,
          color: { rgb: "D9E1F2" },
        },
        bottom: {
          style: "thin" as const,
          color: { rgb: "D9E1F2" },
        },
        left: {
          style: "thin" as const,
          color: { rgb: "D9E1F2" },
        },
        right: {
          style: "thin" as const,
          color: { rgb: "D9E1F2" },
        },
      },
    };

    // ------------------------------------------
    // APPLY CELL STYLES
    // ------------------------------------------

    for (
      let r = 0;
      r < rows.length;
      r++
    ) {
      for (
        let c = 0;
        c < totalColumns;
        c++
      ) {

        const address = XLSX.utils.encode_cell({
          r,
          c,
        });

        if (!worksheet[address]) {
          worksheet[address] = {
            t: "s",
            v: "",
          };
        }

        if (r === 0) {
          worksheet[address].s = locationStyle;
        } else if (r === HEADER_START_ROW) {
          worksheet[address].s = headerStyle;
        } else if (r < DATA_START_ROW) {
          worksheet[address].s = subHeaderStyle;
        } else {
          worksheet[address].s = cellStyle;
        }
      }
    }

    // ------------------------------------------
    // HIGHLIGHT CLASS TOTAL ROWS
    // ------------------------------------------

    rows.forEach((row, rowIndex) => {

      if (
        rowIndex >= DATA_START_ROW &&
        String(row[2] ?? "").startsWith("CLASS ")
      ) {

        for (
          let c = 0;
          c < totalColumns;
          c++
        ) {

          const address = XLSX.utils.encode_cell({
            r: rowIndex,
            c,
          });

          worksheet[address].s = {
            fill: {
              fgColor: { rgb: "E2F0D9" },
            },
            font: {
              bold: true,
              color: { rgb: "375623" },
            },
            alignment: {
              horizontal: "center",
              vertical: "center",
              wrapText: true,
            },
            border: {
              top: {
                style: "thin",
                color: { rgb: "A9D18E" },
              },
              bottom: {
                style: "thin",
                color: { rgb: "A9D18E" },
              },
              left: {
                style: "thin",
                color: { rgb: "A9D18E" },
              },
              right: {
                style: "thin",
                color: { rgb: "A9D18E" },
              },
            },
          };
        }
      }
    });

    // ------------------------------------------
    // CENTER MERGED CELLS
    // ------------------------------------------

    merges.forEach(({ s }) => {

      const address = XLSX.utils.encode_cell(s);

      if (!worksheet[address]) {
        worksheet[address] = {
          t: "s",
          v: "",
        };
      }

      const currentStyle = worksheet[address].s ?? {};

      worksheet[address].s = {
        ...currentStyle,
        alignment: {
          ...(currentStyle.alignment ?? {}),
          vertical: "center",
          wrapText: false,
        },
      };
    });

    // ------------------------------------------
    // DOWNLOAD EXCEL
    // ------------------------------------------

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "School Data"
    );

    const className =
      gradeFilter === "all"
        ? "Both_Classes"
        : `Class_${gradeFilter}`;

    const fileName =
      `${selectedType}_${exportType}_${className}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="flex flex-wrap items-end gap-3">

      <div className="flex flex-col gap-1">

        <select
          id="exportGrade"
          value={exportGrade}
          onChange={(e) =>
            setExportGrade(
              e.target.value as "11" | "12" | "all"
            )
          }
          className="rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-800"
        >
          <option value="11">Class 11</option>
          <option value="12">Class 12</option>
          <option value="all">Both Classes</option>
        </select>

      </div>

      <button
        type="button"
        onClick={() =>
          handleExport("filled", exportGrade)
        }
        className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-green-700"
      >
        Export Filled
      </button>

      <button
        type="button"
        onClick={() =>
          handleExport("all", exportGrade)
        }
        className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-green-700"
      >
        Export All
      </button>

    </div>
  );
}
