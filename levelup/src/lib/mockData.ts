export interface Topic {
  id: string;
  title: string;
  rank: "E" | "D" | "C" | "B" | "A" | "S";
  description: string;
}

export const topics: Topic[] = [
  { id: "react-hooks", title: "React Hooks", rank: "C", description: "Master the fundamentals of React state and effects." },
  { id: "dbms", title: "DBMS Fundamentals", rank: "B", description: "Understand relational databases and SQL queries." },
  { id: "css-grid", title: "CSS Grid Layouts", rank: "E", description: "Build complex responsive web layouts easily." },
  { id: "system-design", title: "System Architecture", rank: "S", description: "Design scalable, high-availability distributed systems." },
];

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ContentData {
  lesson: string;
  questions: MCQ[];
}

export const content: Record<string, ContentData> = {
  "react-hooks": {
    lesson: "React Hooks allow you to use state and other React features without writing a class. `useState` lets you add React state to function components, while `useEffect` lets you perform side effects in function components.\n\nHooks must always be called at the top level of your component to ensure they run in the exact same order every time the component renders. Never call Hooks inside loops, conditions, or nested functions.",
    questions: [
      { id: "q1", question: "Which Hook is used to manage state in a functional component?", options: ["useContext", "useReducer", "useState", "useMemo"], correctAnswer: 2, explanation: "useState is the primary Hook for managing local component state." },
      { id: "q2", question: "What does useEffect do?", options: ["Renders the DOM", "Performs side effects", "Handles routing", "Caches data forever"], correctAnswer: 1, explanation: "useEffect is used to perform side effects like data fetching or subscriptions." },
      { id: "q3", question: "Can you call a Hook inside a loop?", options: ["Yes", "No", "Only if it's the first loop", "Only in class components"], correctAnswer: 1, explanation: "Hooks must be called at the top level of your component." },
      { id: "q4", question: "Which Hook would you use to reference a DOM element directly?", options: ["useRef", "useDOM", "useLayoutEffect", "useElement"], correctAnswer: 0, explanation: "useRef returns a mutable ref object whose .current property is initialized to the passed argument." },
      { id: "q5", question: "How do you ensure useEffect only runs once on mount?", options: ["Don't pass a dependency array", "Pass an empty array []", "Return false", "Use useMount instead"], correctAnswer: 1, explanation: "Passing an empty dependency array [] tells React that your effect doesn't depend on any values from props or state." }
    ]
  },
  "dbms": {
    lesson: "A Database Management System (DBMS) is software that interacts with end users, applications, and the database itself to capture and analyze the data. SQL is the standard language for relational database management systems.\n\nNormalization is the process of organizing data to minimize redundancy. The First Normal Form (1NF) ensures that each column contains atomic (indivisible) values.",
    questions: [
      { id: "q1", question: "What does SQL stand for?", options: ["Structured Query Language", "Strong Question Language", "System Query Language", "Standard Query Logic"], correctAnswer: 0, explanation: "SQL stands for Structured Query Language." },
      { id: "q2", question: "Which command is used to retrieve data from a database?", options: ["GET", "OPEN", "SELECT", "PULL"], correctAnswer: 2, explanation: "The SELECT statement is used to select data from a database." },
      { id: "q3", question: "What does a Primary Key do?", options: ["Encrypts the table", "Uniquely identifies each record", "Links to another database", "Automatically increments"], correctAnswer: 1, explanation: "A primary key constraint uniquely identifies each record in a table." },
      { id: "q4", question: "Which SQL clause is used to filter records?", options: ["ORDER BY", "GROUP BY", "WHERE", "FILTER"], correctAnswer: 2, explanation: "The WHERE clause is used to filter records based on a specific condition." },
      { id: "q5", question: "What is an inner join?", options: ["Returns all records from both tables", "Returns records that have matching values in both tables", "Returns all records from the left table", "Joins a table to itself"], correctAnswer: 1, explanation: "An INNER JOIN keyword selects records that have matching values in both tables." }
    ]
  }
};

export interface Badge {
  id: string;
  name: string;
  description: string;
  condition: (stats: { xp: number; dailyStreak: number; answerStreak: number; totalAnswered: number }) => boolean;
}

export const badges: Badge[] = [
  {
    id: "first-blood",
    name: "First Blood",
    description: "Answer 1 question correctly.",
    condition: (stats) => stats.totalAnswered >= 1,
  },
  {
    id: "shadow-mage",
    name: "Shadow Mage",
    description: "Achieve a 5 Answer Streak.",
    condition: (stats) => stats.answerStreak >= 5,
  },
  {
    id: "awakened",
    name: "Awakened",
    description: "Reach Level 5 (500 XP).",
    condition: (stats) => stats.xp >= 500,
  }
];

export const mockLeaderboard = [
  { id: "1", name: "Thomas Andre", rank: "S", title: "National Level Hunter", level: 99 },
  { id: "2", name: "Liu Zhigang", rank: "S", title: "National Level Hunter", level: 98 },
  { id: "3", name: "Christopher Reed", rank: "S", title: "National Level Hunter", level: 97 },
  { id: "4", name: "Siddharth Bachchan", rank: "S", title: "National Level Hunter", level: 95 },
  { id: "5", name: "Goto Ryuji", rank: "S", title: "S-Class Hunter", level: 90 },
];
