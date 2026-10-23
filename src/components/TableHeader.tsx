
import React from "react";
import { FiTrash2 } from "react-icons/fi";
import type { Subject, Book } from "../types";


interface TableHeaderProps {
  subjects: Subject[];
  selectedType: string;

  setSubjects: React.Dispatch<
    React.SetStateAction<Subject[]>
  >;

  deleteSubject: (subjectName: string) => void;

  deleteMedium: (
    subjectName: string,
    mediumName: string
  ) => void;

  deleteBook: (
    subjectName: string,
    mediumName: string,
    bookId: number
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


export default function TableHeader({
  subjects,
  setSubjects,
  deleteSubject,
  deleteMedium,
  deleteBook,
  getBookName,
  
}: TableHeaderProps) {
  // =====================================================
  // GET VISIBLE BOOKS
  // =====================================================
  // IMPORTANT:
  // Book ke andar ab "type" nahi hai.
  //
  // Type ab school.books ke andar separate branch hai:
  //
  // Textbook
  // Parikshabodh
  // Practical
  // Project
  //
  // Isliye yahan books ko selectedType ke basis par
  // filter NAHI karna hai.
  //
  // Selected type ka actual data SchoolTable se aayega.
  // =====================================================

  const getVisibleBooks = (medium: {
    books: Book[];
  }) => {
    return medium.books;
  };

  // =====================================================
  // GET VISIBLE MEDIUMS
  // =====================================================

  const getVisibleMediums = (subject: Subject) => {
    return subject.mediums
      .map((medium) => ({
        ...medium,
        books: getVisibleBooks(medium),
      }))
      .filter(
        (medium) => medium.books.length > 0
      );
  };

  // =====================================================
  // UPDATE SUBJECT NAME
  // =====================================================

  const updateSubjectName = (
    oldName: string,
    value: string
  ) => {
    setSubjects((prev) =>
      prev.map((subject) =>
        subject.name === oldName
          ? {
              ...subject,
              name: value,
            }
          : subject
      )
    );
  };

  // =====================================================
  // UPDATE MEDIUM NAME
  // =====================================================

  const updateMediumName = (
    subjectName: string,
    oldMedium: string,
    value: string
  ) => {
    setSubjects((prev) =>
      prev.map((subject) => {

        if (subject.name !== subjectName) {
          return subject;
        }

        return {
          ...subject,

          mediums: subject.mediums.map(
            (medium) =>
              medium.name === oldMedium
                ? {
                    ...medium,
                    name: value,
                  }
                : medium
          ),
        };
      })
    );
  };

  // =====================================================
  // UPDATE BOOK NAME
  // =====================================================

  const updateBookName = (
    subjectName: string,
    mediumName: string,
    bookId: number,
    value: string
  ) => {
    setSubjects((prev) =>
      prev.map((subject) => {

        if (subject.name !== subjectName) {
          return subject;
        }

        return {
          ...subject,

          mediums: subject.mediums.map(
            (medium) => {

              if (medium.name !== mediumName) {
                return medium;
              }

              return {
                ...medium,

                books: medium.books.map(
                  (book) =>
                    book.id === bookId
                      ? {
                          ...book,
                          name: value,
                        }
                      : book
                ),
              };
            }
          ),
        };
      })
    );
  };

  // =====================================================
  // HEADER
  // =====================================================

  return (
   <thead className="bg-gray-100">

  {/* ROW 1: SUBJECT */}
  <tr>
    {/* ACTION */}
    <th
      rowSpan={4}
      className="sticky left-0 top-0 z-[80] box-border
        min-w-[50px] w-[50px]
        border border-black bg-gray-100 p-2 text-center
        shadow-[1px_0_0_#000,0_1px_0_#000]"
    >
      Action
    </th>

    {/* S.NO */}
    <th
      rowSpan={4}
      className="sticky left-[50px] top-0 z-[80] box-border
        min-w-[70px] w-[70px]
        border border-black bg-gray-100 p-2 text-center
        shadow-[1px_0_0_#000,0_1px_0_#000]"
    >
      S.No
    </th>

    {/* SCHOOL CODE */}
    <th
      rowSpan={4}
      className="sticky left-[120px] top-0 z-[80] box-border
        min-w-[140px] w-[140px]
        border border-black bg-gray-100 p-2 text-center
        shadow-[1px_0_0_#000,0_1px_0_#000]"
    >
      School Code
    </th>

    {/* SCHOOL NAME */}
    <th
      rowSpan={4}
      className="sticky left-[260px] top-0 z-[80] box-border
        min-w-[250px] w-[250px]
        border border-black bg-gray-100 p-2 text-center
        shadow-[1px_0_0_#000,0_1px_0_#000]"
    >
      School Name
    </th>

    {/* CLASS */}
    <th
      rowSpan={4}
      className="sticky left-[510px] top-0 z-[80] box-border
        min-w-[80px] w-[80px]
        border border-black bg-gray-100 p-2 text-center
        shadow-[1px_0_0_#000,0_1px_0_#000]"
    >
      Class
    </th>

    {/* SUBJECT */}
    {subjects.map((subject) => {
      const visibleMediums = getVisibleMediums(subject);

      const subjectColumnCount = visibleMediums.reduce(
        (total, medium) => total + medium.books.length * 2,
        0
      );

      if (subjectColumnCount === 0) return null;

      return (
        <th
          key={subject.id}
          colSpan={subjectColumnCount}
        className="sticky top-0 z-[60] border border-black bg-gray-100 p-2 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <input
              value={subject.name}
              onChange={(e) =>
                updateSubjectName(subject.name, e.target.value)
              }
              className="w-24 min-w-0 bg-transparent text-center outline-none"
            />

            <button
              type="button"
              onClick={() => deleteSubject(subject.name)}
              className="shrink-0 hover:scale-110"
            >
              <FiTrash2 className="text-red-600" />
            </button>
          </div>
        </th>
      );
    })}

    {/* REMARK */}
    <th
      rowSpan={4}
      className="min-w-[180px] border border-black
        bg-gray-100 p-2 text-center"
    >
      Remark
    </th>
  </tr>

  {/* ROW 2: MEDIUM */}
  <tr>
    {subjects.map((subject) =>
      getVisibleMediums(subject).map((medium) => (
        <th
          key={`${subject.id}-${medium.id}`}
          colSpan={medium.books.length * 2}
         className="sticky top-[40px] z-[60] border border-black bg-gray-100 p-2 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <input
              value={medium.name}
              onChange={(e) =>
                updateMediumName(
                  subject.name,
                  medium.name,
                  e.target.value
                )
              }
              className="w-32 min-w-0 bg-transparent text-center outline-none"
            />

            <button
              type="button"
              onClick={() =>
                deleteMedium(subject.name, medium.name)
              }
              className="shrink-0 hover:scale-110"
            >
              <FiTrash2 className="text-red-500" />
            </button>
          </div>
        </th>
      ))
    )}
  </tr>

  {/* ROW 3: BOOK / SUB SUBJECT */}
  <tr>
    {subjects.map((subject) =>
      getVisibleMediums(subject).map((medium) =>
        medium.books.map((book: Book) => (
          <th
            key={`${subject.id}-${medium.id}-${book.id}`}
            colSpan={2}
            className="sticky top-[40px] z-[60] border border-black bg-gray-100 p-2 text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <input
                value={getBookName(book.name, medium.name)}
                onChange={(e) =>
                  updateBookName(
                    subject.name,
                    medium.name,
                    book.id,
                    e.target.value
                  )
                }
                className="w-24 min-w-0 bg-transparent text-center outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  deleteBook(subject.name, medium.name, book.id)
                }
                className="shrink-0 hover:scale-110"
              >
                <FiTrash2 className="text-red-500" />
              </button>
            </div>
          </th>
        ))
      )
    )}
  </tr>

  {/* ROW 4: DATE / QTY */}
  <tr>
    {subjects.map((subject) =>
      getVisibleMediums(subject).map((medium) =>
        medium.books.map((book) => (
          <React.Fragment
            key={`${subject.id}-${medium.id}-${book.id}`}
          >
            <th className="sticky top-[80px] z-[60] border border-black bg-gray-100 p-2 text-center">
              Date
            </th>

            <th className="sticky top-[80px] z-[60] border border-black bg-gray-100 p-2 text-center">
              Qty
            </th>
          </React.Fragment>
        ))
      )
    )}
  </tr>
</thead>
  );
}

