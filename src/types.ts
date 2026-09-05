import type React from "react";

// =====================================================
// BOOK TYPE
// =====================================================

export type BookType =
  | "Textbook"
  | "Parikshabodh"
  | "Practical"
  | "Project";

// =====================================================
// BOOK
// =====================================================

export interface Book {
  id: number;
  name: string;
}

// =====================================================
// MEDIUM
// =====================================================

export interface Medium {
  id: number;
  name: string;
  books: Book[];
}

// =====================================================
// SUBJECT
// =====================================================

export interface Subject {
  id: number;
  name: string;
  mediums: Medium[];
}

// =====================================================
// GRADE
// =====================================================

export type Grade = "11" | "12";

// =====================================================
// DATE + QTY ENTRY
// =====================================================

export interface BookEntry {
  date: string;
  qty: string;
  type: BookType;
}

// =====================================================
// TYPE BOOKS
// =====================================================
//
// Each medium has separate data for:
// Textbook
// Parikshabodh
// Practical
// Project
//
// Example:
//
// Physics
//   English Medium
//      Textbook
//      Parikshabodh
//      Practical
//      Project
//
// =====================================================

export type TypeBooks = {
  [type in BookType]: BookEntry[][];
};

// =====================================================
// GRADE BOOKS
// =====================================================
//
// Structure:
//
// grade
//   -> subject
//      -> medium
//         -> type
//            -> books
//
// =====================================================

export interface GradeBooks {
  [subjectName: string]: {
    [mediumName: string]: TypeBooks;
  };
}

// =====================================================
// SCHOOL
// =====================================================

export interface School {
  id: number;

  // School Code
  code?: string;

  // School Name
  schoolName: string;

  // Grade
  grade?: Grade;

  // Remarks for Class 11 and 12
  remarks?: {
    "11"?: string;
    "12"?: string;
  };

  // Books
  //
  // Structure:
  //
  // books
  //   -> "11" | "12"
  //      -> Subject
  //         -> Medium
  //            -> Textbook
  //            -> Parikshabodh
  //            -> Practical
  //            -> Project
  //
  books: {
    [grade: string]: GradeBooks;
  };
}

// =====================================================
// SCHOOL TABLE PROPS
// =====================================================

export interface SchoolTableProps {
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