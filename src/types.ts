import type React from "react";

export type BookType =
  | "Textbook"
  | "Parikshabodh"
  | "Practical"
  | "Project"
  | "Guide";

export interface Book {
  id: number;
  name: string;
}

export interface Medium {
  id: number;
  name: string;
  books: Book[];
}

export interface Subject {
  id: number;
  name: string;
  mediums: Medium[];
}

export type Grade = "11" | "12";

export interface BookEntry {
  date: string;
  qty: string;
  type: BookType;
}

export type TypeBooks = {
  [type in BookType]: BookEntry[][];
};

export interface GradeBooks {
  [subjectName: string]: {
    [mediumName: string]: TypeBooks;
  };
}

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

  books: {
    [grade: string]: GradeBooks;
  };
}

export interface SchoolTableProps {
  subjects: Subject[];

  schools: School[];

  setSchools: React.Dispatch<
    React.SetStateAction<School[]>
  >;

  setSubjects: React.Dispatch<
    React.SetStateAction<Subject[]>
  >;

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