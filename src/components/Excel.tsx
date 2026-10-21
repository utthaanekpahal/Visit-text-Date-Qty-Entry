import React from "react";
import * as XLSX from "xlsx-js-style";
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
  exportType: "filled" | "empty",
  gradeFilter: "11" | "12" | "all" = "all"
) => {
  type ExportGrade = "11" | "12";

 const gradesToExport: ("11" | "12")[] =
  gradeFilter === "all"
    ? ["11", "12"]
    : [gradeFilter];

  // All subject, medium and book columns
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

  // Check if a school has any filled data for this grade
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

  // Select records separately for each class
  const exportedRecords: {
    school: School;
    grade: ExportGrade;
  }[] = [];

  schools.forEach((school) => {
    gradesToExport.forEach((grade) => {
      const filled = hasFilledData(school, grade);

      if (
        (exportType === "filled" && filled) ||
        (exportType === "empty" && !filled)
      ) {
        exportedRecords.push({ school, grade });
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

  // Filled export: only book columns with data.
  // Empty export: all available book columns.
  const exportColumns =
    exportType === "empty"
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

  // S.No | Code | School Name | Grade | Type
  const FIXED_COLUMNS = 5;
  const rows: any[][] = [];
  const merges: XLSX.Range[] = [];

  // ------------------------------------------
  // FOUR HEADER ROWS
  // ------------------------------------------

  const row1: any[] = [
    "S.No",
    "Code",
    "School Name",
    "Grade",
    "Type",
  ];

  const row2: any[] = ["", "", "", "", ""];
  const row3: any[] = ["", "", "", "", ""];
  const row4: any[] = ["", "", "", "", ""];

  exportColumns.forEach((item, index) => {
    const { subject, medium, book } = item;
    const previous = exportColumns[index - 1];

    const isNewSubject =
      !previous || previous.subject.id !== subject.id;

    const isNewMedium =
      !previous ||
      previous.subject.id !== subject.id ||
      previous.medium.id !== medium.id;

    // Subject and medium names appear only at group starts.
    row1.push(isNewSubject ? subject.name : "", "");
    row2.push(isNewMedium ? medium.name : "", "");
    row3.push(book.name, "");
    row4.push("Date", "Qty");

    const bookStartColumn = FIXED_COLUMNS + index * 2;

    // Merge book name over Date and Qty columns.
    merges.push({
      s: { r: 2, c: bookStartColumn },
      e: { r: 2, c: bookStartColumn + 1 },
    });

    const next = exportColumns[index + 1];

    const isLastInSubject =
      !next || next.subject.id !== subject.id;

    const isLastInMedium =
      !next ||
      next.subject.id !== subject.id ||
      next.medium.id !== medium.id;

    if (isLastInSubject) {
      const firstSubjectIndex = exportColumns.findIndex(
        (entry) => entry.subject.id === subject.id
      );

      const subjectStart =
        FIXED_COLUMNS + firstSubjectIndex * 2;

      merges.push({
        s: { r: 0, c: subjectStart },
        e: { r: 0, c: bookStartColumn + 1 },
      });
    }

    if (isLastInMedium) {
      const firstMediumIndex = exportColumns.findIndex(
        (entry) =>
          entry.subject.id === subject.id &&
          entry.medium.id === medium.id
      );

      const mediumStart =
        FIXED_COLUMNS + firstMediumIndex * 2;

      merges.push({
        s: { r: 1, c: mediumStart },
        e: { r: 1, c: bookStartColumn + 1 },
      });
    }
  });

  // Remark column
  const remarkColumn =
    FIXED_COLUMNS + exportColumns.length * 2;

  row1.push("Remark");
  row2.push("");
  row3.push("");
  row4.push("");

  // Merge fixed columns vertically across the four headers.
  for (let column = 0; column < FIXED_COLUMNS; column++) {
    merges.push({
      s: { r: 0, c: column },
      e: { r: 3, c: column },
    });
  }

  // Merge Remark vertically.
  merges.push({
    s: { r: 0, c: remarkColumn },
    e: { r: 3, c: remarkColumn },
  });

  rows.push(row1, row2, row3, row4);

  // ------------------------------------------
  // DATA ROWS AND CLASS TOTALS
  // ------------------------------------------

  let serialNo = 1;

  gradesToExport.forEach((grade) => {
    const classRecords = exportedRecords.filter(
      (record) => record.grade === grade
    );

    classRecords.forEach(({ school }) => {
      const row: any[] = [
        serialNo++,
        school.code ?? "",
        school.schoolName ?? "",
        grade,
        selectedType,
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
            qty !== "" && Number.isFinite(Number(qty))
              ? Number(qty)
              : qty;

          row.push(date, numericQty);
        }
      );

      row.push(getRemark(school, grade) ?? "");
      rows.push(row);
    });

    // Separate total row for each class
    if (classRecords.length > 0) {
      const totalRow: any[] = [
        "",
        "",
        `CLASS ${grade} TOTAL`,
        grade,
        selectedType,
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

            if (qty !== "" && Number.isFinite(Number(qty))) {
              totalQty += Number(qty);
            }
          });

          totalRow.push("Total", totalQty);
        }
      );

      totalRow.push("");
      rows.push(totalRow);
    }
  });

  // ------------------------------------------
  // CREATE WORKSHEET
  // ------------------------------------------

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  worksheet["!merges"] = merges;

  const totalColumns =
    FIXED_COLUMNS + exportColumns.length * 2 + 1;

 
worksheet["!cols"] = [
  { wch: 8 },   // S.No
  { wch: 14 },  // Code
  { wch: 40 },  // School Name - wider column
  { wch: 10 },  // Grade
  { wch: 18 },  // Type
  ...exportColumns.flatMap(() => [
    { wch: 15 }, // Date
    { wch: 10 }, // Qty
  ]),
  { wch: 25 },  // Remark
];


  worksheet["!freeze"] = {
    xSplit: FIXED_COLUMNS,
    ySplit: 4,
    topLeftCell: "F5",
    activePane: "bottomRight",
    state: "frozen",
  };

  worksheet["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { r: 3, c: 0 },
      e: {
        r: Math.max(3, rows.length - 1),
        c: totalColumns - 1,
      },
    }),
  };

 
worksheet["!rows"] = rows.map((row, rowIndex) => ({
  hpt:
    rowIndex === 0
      ? 30
      : rowIndex < 4
      ? 28
      : String(row[2] ?? "").length > 35
      ? 40
      : 25,
}));


  // ------------------------------------------
  // STYLES
  // ------------------------------------------

  const headerStyle = {
    fill: { fgColor: { rgb: "1F4E78" } },
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
    border: {
      top: { style: "thin" as const, color: { rgb: "B7C9D6" } },
      bottom: { style: "thin" as const, color: { rgb: "B7C9D6" } },
      left: { style: "thin" as const, color: { rgb: "B7C9D6" } },
      right: { style: "thin" as const, color: { rgb: "B7C9D6" } },
    },
  };

  const subHeaderStyle = {
    fill: { fgColor: { rgb: "D9EAF7" } },
    font: {
      bold: true,
      color: { rgb: "17365D" },
    },
    alignment: {
      horizontal: "center" as const,
      vertical: "center" as const,
      wrapText: true,
    },
    border: {
      top: { style: "thin" as const, color: { rgb: "B7C9D6" } },
      bottom: { style: "thin" as const, color: { rgb: "B7C9D6" } },
      left: { style: "thin" as const, color: { rgb: "B7C9D6" } },
      right: { style: "thin" as const, color: { rgb: "B7C9D6" } },
    },
  };

  const cellStyle = {
    alignment: {
      horizontal: "center" as const,
      vertical: "center" as const,
      wrapText: true,
    },
    border: {
      top: { style: "thin" as const, color: { rgb: "D9E1F2" } },
      bottom: { style: "thin" as const, color: { rgb: "D9E1F2" } },
      left: { style: "thin" as const, color: { rgb: "D9E1F2" } },
      right: { style: "thin" as const, color: { rgb: "D9E1F2" } },
    },
  };

  // Style all worksheet cells.
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < totalColumns; c++) {
      const address = XLSX.utils.encode_cell({ r, c });

      if (!worksheet[address]) {
        worksheet[address] = { t: "s", v: "" };
      }

      if (r === 0) {
        worksheet[address].s = headerStyle;
      } else if (r < 4) {
        worksheet[address].s = subHeaderStyle;
      } else {
        worksheet[address].s = cellStyle;
      }
    }
  }

  // Highlight class total rows.
  rows.forEach((row, rowIndex) => {
    if (
      rowIndex >= 4 &&
      String(row[2] ?? "").startsWith("CLASS ")
    ) {
      for (let c = 0; c < totalColumns; c++) {
        const address = XLSX.utils.encode_cell({
          r: rowIndex,
          c,
        });

        worksheet[address].s = {
          fill: { fgColor: { rgb: "E2F0D9" } },
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
            top: { style: "thin", color: { rgb: "A9D18E" } },
            bottom: { style: "thin", color: { rgb: "A9D18E" } },
            left: { style: "thin", color: { rgb: "A9D18E" } },
            right: { style: "thin", color: { rgb: "A9D18E" } },
          },
        };
      }
    }
  });

  // Reapply centered alignment to the top-left cell
  // of every merged range, preserving its existing style.
  merges.forEach(({ s }) => {
    const address = XLSX.utils.encode_cell(s);

    if (!worksheet[address]) {
      worksheet[address] = { t: "s", v: "" };
    }

    const currentStyle = worksheet[address].s ?? {};

    worksheet[address].s = {
      ...currentStyle,
      alignment: {
        ...(currentStyle.alignment ?? {}),
        horizontal: "center",
        vertical: "center",
        wrapText: true,
      },
    };
  });

  // ------------------------------------------
  // DOWNLOAD
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
  // BUTTONS
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
        onClick={() => handleExport("filled", exportGrade)}
        className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-green-700"
      >
        Export Filled
      </button>

    </div>
  );
}
