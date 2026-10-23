
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
    <thead className="sticky top-0 z-40 bg-gray-100">

      {/* =================================================
          ROW 1
          Subject
      ================================================= */}

      <tr>

        <th
          rowSpan={4}
          className="border p-2"
        >
          S.No
        </th>

        <th
          rowSpan={4}
          className="border p-2 min-w-[150px]"
        >
          School Code
        </th>

        <th
          rowSpan={4}
          className="
            sticky
            left-0
            z-30
            min-w-[250px]
            border
            bg-gray-100
            p-2
          "
        >
          School Name
        </th>

        <th
          rowSpan={4}
          className="
            min-w-[80px]
            border
            p-2
          "
        >
          Class
        </th>

        {/* ================= SUBJECT ================= */}

        {subjects.map((subject) => {

          const visibleMediums =
            getVisibleMediums(subject);

          const subjectColumnCount =
            visibleMediums.reduce(
              (total, medium) =>
                total +
                medium.books.length * 2,
              0
            );

          // Selected type change hone par subject
          // remove nahi hoga.
          if (subjectColumnCount === 0) {
            return null;
          }

          return (
            <th
              key={subject.id}
              colSpan={subjectColumnCount}
              className="border p-2"
            >

              <div className="flex items-center justify-center gap-2">

                {/* Subject Name */}

                <input
                  value={subject.name}
                  onChange={(e) =>
                    updateSubjectName(
                      subject.name,
                      e.target.value
                    )
                  }
                  className="
                    w-24
                    bg-transparent
                    text-center
                    outline-none
                  "
                />

                {/* Delete Subject */}

                <button
                  type="button"
                  onClick={() =>
                    deleteSubject(
                      subject.name
                    )
                  }
                  className="hover:scale-110"
                >
                  <FiTrash2
                    className="text-red-600"
                  />
                </button>

              </div>

            </th>
          );
        })}

        {/* ================= REMARK ================= */}

        <th
          rowSpan={4}
          className="
            min-w-[180px]
            border
            p-2
            bg-gray-100
            text-center
          "
        >
          Remark
        </th>

      </tr>

      {/* =================================================
          ROW 2
          Medium
      ================================================= */}

      <tr>

        {subjects.map((subject) =>
          getVisibleMediums(subject).map(
            (medium) => {

              const mediumColumnCount =
                medium.books.length * 2;

              return (
                <th
                  key={`${subject.id}-${medium.id}`}
                  colSpan={mediumColumnCount}
                  className="border p-2"
                >

                  <div className="flex justify-center gap-2">

                    {/* Medium Name */}

                    <input
                      value={medium.name}
                      onChange={(e) =>
                        updateMediumName(
                          subject.name,
                          medium.name,
                          e.target.value
                        )
                      }
                      className="
                        w-32
                        bg-transparent
                        text-center
                        outline-none
                      "
                    />

                    {/* Delete Medium */}

                    <button
                      type="button"
                      onClick={() =>
                        deleteMedium(
                          subject.name,
                          medium.name
                        )
                      }
                      className="hover:scale-110"
                    >
                      <FiTrash2
                        className="text-red-500"
                      />
                    </button>

                  </div>

                </th>
              );
            }
          )
        )}

      </tr>

      {/* =================================================
          ROW 3
          Book
      ================================================= */}

      <tr>

        {subjects.map((subject) =>
          getVisibleMediums(subject).map(
            (medium) =>
              medium.books.map(
                (book: Book) => (

                  <th
                    key={book.id}
                    colSpan={2}
                    className="border p-2"
                  >

                    <div className="flex justify-center gap-2">

                      {/* Book Name */}

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
                        className="
                          w-24
                          bg-transparent
                          text-center
                          outline-none
                        "
                      />

                      {/* Delete Book */}

                      <button
                        type="button"
                        onClick={() =>
                          deleteBook(
                            subject.name,
                            medium.name,
                            book.id
                          )
                        }
                        className="hover:scale-110"
                      >
                        <FiTrash2
                          className="text-red-500"
                        />
                      </button>

                    </div>

                  </th>

                )
              )
          )
        )}

      </tr>

      {/* =================================================
          ROW 4
          Date / Qty
      ================================================= */}

      <tr>

        {subjects.map((subject) =>
          getVisibleMediums(subject).map(
            (medium) =>
              medium.books.map((book) => (

                <React.Fragment
                  key={`${subject.id}-${medium.id}-${book.id}`}
                >

                  <th className="border p-2">
                    Date
                  </th>

                  <th className="border p-2">
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

