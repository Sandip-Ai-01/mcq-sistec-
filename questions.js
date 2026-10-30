/* ==========================================================
   SISTec MST – Advanced Question Bank
   PART A : 50 MCQs (1 mark each, auto-graded)  – top-student level
   PART B : 5 theory questions (10 marks each, faculty-evaluated)
   MCQ `answer` = index in the ORIGINAL options array (options are
   shuffled per student at runtime and mapped back).
   ========================================================== */
const G1 = "OOP Concepts", G2 = "POP vs OOP", G3 = "C++ Basics", G4 = "Precedence & Associativity",
      G5 = "Program Structure", G6 = "Data Types & Variables", G7 = "Operators & Expressions", G8 = "Control & I/O";
const q = (unit, topic, question, options, answer, explanation) =>
  ({ unit, topic, question, options, answer, explanation });

const QUESTIONS = [
  /* ---- OOP concepts ---- */
  q(G1, "Polymorphism", "Which mechanism lets a base-class pointer invoke the derived-class version of a function at run time?", ["Function overloading", "Virtual function dispatch", "Operator overloading", "Default arguments"], 1, "Virtual functions enable run-time (dynamic) polymorphism through late binding."),
  q(G1, "Encapsulation vs Abstraction", "Which statement distinguishes encapsulation from abstraction most accurately?", ["Encapsulation bundles data with operations and restricts access; abstraction exposes only essential behaviour and hides complexity", "Encapsulation is achieved by inheritance; abstraction by function overloading", "They are exact synonyms", "Abstraction is possible only in procedural programs"], 0, "Encapsulation is about bundling and access control; abstraction is about presenting a simplified interface."),
  q(G1, "Compile-time Polymorphism", "Which pair are examples of compile-time (static) polymorphism?", ["Virtual functions and abstract classes", "Function overloading and operator overloading", "Inheritance and encapsulation", "Dynamic binding and RTTI"], 1, "Overloads are resolved by the compiler, so they are static polymorphism."),
  q(G1, "Access Specifiers", "In C++, the default access of members of a class and of a struct respectively is", ["public, public", "private, private", "private, public", "public, private"], 2, "class members default to private; struct members default to public."),
  q(G1, "Data Hiding", "Which OOP principle is violated when a class declares all its data members public?", ["Encapsulation / data hiding", "Inheritance", "Polymorphism", "Recursion"], 0, "Public data lets any code modify the object's state directly."),
  q(G1, "Binding", "Resolving a function call to its code at run time is called", ["Early binding", "Static binding", "Dynamic (late) binding", "Lexical binding"], 2, "Run-time resolution is dynamic or late binding."),
  q(G1, "Inheritance", "Which of the following is NOT a form of inheritance supported by C++?", ["Multiple", "Multilevel", "Hybrid", "Cyclic"], 3, "Cyclic inheritance (A derives from B, B from A) is impossible."),
  q(G1, "Maintainability", "Why does OOP generally ease maintenance compared with POP?", ["Data and the functions acting on it are localised in objects, limiting the impact of changes", "OOP programs always execute faster", "OOP has no functions", "OOP removes the need for design"], 0, "Localisation of state and behaviour confines the effect of modifications."),
  q(G1, "Data Hiding", "Which C++ feature implements data hiding?", ["Access specifiers (private / protected)", "Header files", "Comments", "Macros"], 0, "private and protected restrict access to members."),

  /* ---- POP vs OOP ---- */
  q(G2, "Global Data", "In POP, many functions share global data. The chief risk is", ["Unintended modification of that data by any function", "Faster execution", "Compile errors only", "Lack of loops"], 0, "Global data has no protection, so any function can change it."),
  q(G2, "POP Basics", "Which statement about Procedure Oriented Programming is TRUE?", ["Programs are divided into functions and data is secondary", "Programs are divided into objects", "It natively supports inheritance", "It natively supports virtual functions"], 0, "POP is function-centric."),
  q(G2, "Approach", "Typically, POP follows a ___ approach and OOP follows a ___ approach.", ["top-down, bottom-up", "bottom-up, top-down", "bottom-up, bottom-up", "top-down, top-down"], 0, "POP decomposes top-down; OOP builds up from objects."),
  q(G2, "Modelling", "What gives OOP its advantage over POP in modelling real-world problems?", ["Entities are modelled as objects with state and behaviour", "Use of goto", "Use of macros", "Fewer data types"], 0, "Objects bundle attributes and operations like real entities."),
  q(G2, "Reuse", "Code reuse in POP is mainly through ___, whereas OOP additionally offers ___.", ["functions; inheritance and composition", "classes; functions", "macros; pointers", "loops; recursion"], 0, "OOP adds class-level reuse through inheritance and composition."),
  q(G2, "Security", "Which statement about data security is correct?", ["OOP provides data hiding; globals in POP are exposed to all functions", "POP provides data hiding via objects", "Neither paradigm offers any protection", "OOP has no data security"], 0, "Access specifiers give OOP controlled access."),
  q(G2, "C++ Paradigm", "C++ is best described as", ["a multi-paradigm language supporting procedural and object-oriented styles", "a purely object-oriented language", "a purely procedural language", "a purely functional language"], 0, "C++ allows free functions as well as classes."),
  q(G2, "Language Features", "Which feature is absent from pure POP languages such as C?", ["Function overloading", "Function definition", "Loops", "Variables"], 0, "C does not allow two functions with the same name; C++ does."),

  /* ---- Intro to C++, character set, tokens ---- */
  q(G3, "Tokens", "How many tokens are in the statement: int x = 5 + y;", ["5", "6", "7", "8"], 2, "Tokens: int, x, =, 5, +, y, ; = 7."),
  q(G3, "Identifiers", "Which of the following identifiers is invalid?", ["_total", "Total2", "goto", "total_2"], 2, "goto is a reserved keyword."),
  q(G3, "Literals", "Which is a valid floating-point literal in C++?", ["1.5e3", "1.5e", "e3", "1..5"], 0, "1.5e3 = 1500.0; the others are malformed."),
  q(G3, "Character Literal", "In C++, sizeof('A') evaluates to", ["1", "2", "4", "Implementation-defined size of int"], 0, "A character literal has type char in C++ (it is int in C)."),
  q(G3, "Comments", "Which is correct about comments in C++?", ["They are removed before tokenisation and are not tokens", "They are tokens", "They are executed", "They allocate memory"], 0, "Comments are replaced by whitespace during translation."),
  q(G3, "Keywords", "Which of the following is NOT a C++ keyword?", ["typename", "register", "main", "explicit"], 2, "main is a function name, not a keyword."),
  q(G3, "Constants", "The integer literal 012 in C++ represents", ["decimal 12", "decimal 10 (octal literal)", "hexadecimal 12", "a syntax error"], 1, "A leading 0 denotes an octal literal: 012 = 10."),

  /* ---- Precedence & associativity ---- */
  q(G4, "Precedence", "What is printed?\nint a=2,b=3,c=4;\ncout << a + b * c - a / b;", ["14", "13", "20", "9"], 0, "2 + 12 − 0 = 14 (a/b is integer division = 0)."),
  q(G4, "Associativity", "What is printed?\ncout << (5 > 3 > 1);", ["1", "0", "Compile error", "3"], 1, "Relational operators are left-associative: (5>3)=1, then 1>1 = 0."),
  q(G4, "Evaluation", "What is printed?\nint a=3,b=4;\ncout << a / b * b + a % b;", ["3", "0", "6", "4"], 0, "3/4=0, 0*4=0, 3%4=3, so 0+3 = 3."),
  q(G4, "Associativity", "Which operator group has right-to-left associativity?", ["Arithmetic +, -", "Relational <, >", "Conditional ?:", "Logical &&"], 2, "?:, assignment and unary operators are right-associative."),
  q(G4, "Precedence", "What is the value of !0 + !1 ?", ["0", "1", "2", "-1"], 1, "! binds tighter than +: 1 + 0 = 1."),
  q(G4, "Precedence", "In the expression a || b && c, which sub-expression is grouped first?", ["a || b", "b && c", "a && c", "Both together"], 1, "&& has higher precedence than ||."),

  /* ---- Program structure ---- */
  q(G5, "main()", "Which is a valid standard C++ signature for main?", ["void main()", "int main()", "float main()", "char main()"], 1, "The standard requires main to return int."),
  q(G5, "main()", "If control reaches the closing brace of main() without a return statement, the program", ["returns 0 implicitly", "returns an undefined value", "fails to compile", "loops forever"], 0, "C++ specifies an implicit return 0 for main."),
  q(G5, "Namespaces", "The directive 'using namespace std;' allows", ["names such as cout, cin and endl to be used without the std:: prefix", "the iostream header to be loaded", "main to be hidden", "errors to be suppressed"], 0, "It makes std names visible in the current scope."),

  /* ---- Data types, variables ---- */
  q(G6, "Type Conversion", "What is printed?\nint x = 7; double y = x / 2;\ncout << y;", ["3.5", "3", "4", "3.0"], 1, "x/2 is integer division (3) before assignment; cout prints 3."),
  q(G6, "Mixed Arithmetic", "What is printed?\ncout << 7 / 2.0 + 7 / 2;", ["6.5", "7", "6", "7.5"], 0, "3.5 + 3 = 6.5."),
  q(G6, "char Arithmetic", "What is printed?\nchar c = 'A';\ncout << c + 1;", ["B", "66", "A1", "67"], 1, "c + 1 is an int (65 + 1 = 66)."),
  q(G6, "Overflow", "What is printed?\nunsigned char u = 255; u++;\ncout << (int)u;", ["256", "0", "-1", "255"], 1, "Unsigned arithmetic wraps modulo 256."),
  q(G6, "bool", "What is printed?\nbool b = 5;\ncout << b;", ["5", "1", "0", "true"], 1, "Any non-zero value converts to true, which prints as 1."),
  q(G6, "const", "Given const int N = 5; which statement is invalid?", ["cout << N;", "int a[N];", "N = 10;", "int b = N * 2;"], 2, "A const variable cannot be assigned after initialisation."),
  q(G6, "Scope", "What is printed?\nint a = 5;\n{ int a = 10; }\ncout << a;", ["10", "5", "15", "Compile error"], 1, "The inner a is destroyed at the closing brace."),

  /* ---- Operators & expressions ---- */
  q(G7, "Shift", "What is printed?\nint a = 5; a <<= 2;\ncout << a;", ["10", "20", "25", "7"], 1, "5 << 2 = 5 × 4 = 20."),
  q(G7, "Bitwise", "What is printed?\ncout << (7 & 3) << (7 | 8) << (6 ^ 3);", ["3155", "3145", "31510", "2155"], 0, "7&3=3, 7|8=15, 6^3=5, so 3,15,5 → 3155."),
  q(G7, "Short-circuit", "What is printed?\nint i = 0; bool r = (i++ && 1);\ncout << r << i;", ["00", "01", "10", "11"], 1, "i++ yields 0, so && short-circuits to false; i is now 1."),
  q(G7, "Casting", "What is printed?\nint a = 5, b = 2;\ncout << a / b << ' ' << (float)a / b;", ["2 2", "2 2.5", "2.5 2.5", "3 2.5"], 1, "Integer division gives 2; the cast makes the second division floating-point."),

  /* ---- Control structures & I/O ---- */
  q(G8, "continue", "What is printed?\nint s = 0;\nfor (int i = 1; i <= 10; i++) { if (i % 2) continue; s += i; }\ncout << s;", ["25", "30", "55", "15"], 1, "Only even numbers are added: 2+4+6+8+10 = 30."),
  q(G8, "do-while", "What is printed?\nint n = 0;\ndo { n += 3; } while (n < 10);\ncout << n;", ["9", "10", "12", "15"], 2, "n takes 3, 6, 9, 12 and stops when n ≥ 10."),
  q(G8, "switch", "What is printed?\nint x = 2;\nswitch (x) { case 1: cout << 'A'; case 2: cout << 'B'; case 3: cout << 'C'; break; default: cout << 'D'; }", ["B", "BC", "BCD", "C"], 1, "Execution enters at case 2 and falls through to case 3 until break."),
  q(G8, "cin", "Which statement about cin >> is TRUE?", ["It skips leading whitespace and stops at the next whitespace when reading a word", "It reads a full line including spaces", "It requires endl", "It produces output"], 0, "Use getline() to read an entire line."),
  q(G8, "Manipulators", "Which manipulator inserts a newline and flushes the output buffer?", ["\\n", "endl", "flush only", "setw"], 1, "endl = '\\n' + flush."),
  q(G8, "Formatting", "Using setw() requires which header?", ["<iomanip>", "<cmath>", "<string>", "<cstdio>"], 0, "setw and other parametrised manipulators live in <iomanip>.")
].map((item, i) => ({ id: i + 1, ...item }));

const THEORY = [
  { id: "T1", topic: "OOP Concepts", marks: 10,
    question: "Explain the four main concepts of Object-Oriented Programming (encapsulation, abstraction, inheritance and polymorphism). Give a short C++ code example for any two of them.",
    keyPoints: "Define each concept in 1–2 lines · Encapsulation: class with private data + public methods · Abstraction: hiding implementation, exposing interface · Inheritance: derived class reuses base (e.g. class B : public A) · Polymorphism: overloading (compile-time) and virtual functions (run-time) · Two correct code snippets." },
  { id: "T2", topic: "POP vs OOP", marks: 10,
    question: "Differentiate between Procedure Oriented Programming and Object Oriented Programming. Write at least six points and name one language for each.",
    keyPoints: "Focus: functions vs objects · Approach: top-down vs bottom-up · Data security: global/exposed vs hidden · Reuse: functions vs inheritance · Modelling real world · Maintenance/extensibility · Examples: C / Pascal vs C++ / Java." },
  { id: "T3", topic: "Character Set & Tokens", marks: 10,
    question: "Describe the C++ character set and explain the different types of tokens with one example of each.",
    keyPoints: "Character set: letters, digits, special symbols, white space · Tokens: keywords, identifiers, constants/literals, strings, operators, punctuators · Naming rules for identifiers · One valid example per category." },
  { id: "T4", topic: "Precedence & Associativity", marks: 10,
    question: "Explain operator precedence and associativity in C++. Evaluate step by step: int r = 3 + 4 * 2 % 5 - (6 > 2 ? 1 : 0);",
    keyPoints: "Precedence decides which operator binds first; associativity breaks ties (left-to-right for * / %, right-to-left for = and ?:) · Steps: 4*2=8; 8%5=3; 3+3=6; (6>2?1:0)=1; 6−1 = 5 · Final r = 5." },
  { id: "T5", topic: "Program Structure & I/O", marks: 10,
    question: "Write a C++ program that reads two integers, prints their sum and the larger of the two. Explain each part of the program structure (header, namespace, main, statements).",
    keyPoints: "#include <iostream> · using namespace std · int main() · declarations, cin >> a >> b · sum = a + b · larger via if-else or ?: · cout output · return 0 · One-line explanation of each part." }
];
