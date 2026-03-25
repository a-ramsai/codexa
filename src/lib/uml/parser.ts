import ts from "typescript";

export interface ClassModel {
  name: string;
  extends?: string;
  implements: string[];
  properties: { name: string; type: string; visibility?: string }[];
  methods: { name: string; returnType: string; visibility?: string }[];
  jsxDependencies: string[]; // Strict nested elements in JSX
  importDependencies: string[]; // Imports at top of file
}

export interface SequenceCall {
  from: string;
  to: string;
  method: string;
}

export interface UMLModel {
  classes: ClassModel[];
  sequences: SequenceCall[];
}

export function parseFiles(files: { path: string; content: string }[]): UMLModel {
  // 1. Create a virtual file system / Compiler Host
  const fileMap = new Map<string, string>();
  files.forEach(f => fileMap.set(f.path, f.content));

  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.CommonJS,
    allowJs: true,
    jsx: ts.JsxEmit.ReactJSX,
  };

  const compilerHost: ts.CompilerHost = {
    getSourceFile: (fileName, languageVersion) => {
      const sourceText = fileMap.get(fileName);
      return sourceText !== undefined
        ? ts.createSourceFile(fileName, sourceText, languageVersion, true, ts.ScriptKind.TSX)
        : undefined;
    },
    getDefaultLibFileName: () => "lib.d.ts",
    writeFile: () => {},
    getCurrentDirectory: () => "/",
    getDirectories: () => [],
    fileExists: (fileName) => fileMap.has(fileName),
    readFile: (fileName) => fileMap.get(fileName),
    getCanonicalFileName: (fileName) => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => "\n",
  };

  const program = ts.createProgram(Array.from(fileMap.keys()), options, compilerHost);
  const typeChecker = program.getTypeChecker();

  const classes: ClassModel[] = [];
  const sequences: SequenceCall[] = [];

  // 2. Transverse AST
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      // Find global imports first if needed
      const fileImports: string[] = [];
      ts.forEachChild(sourceFile, (node) => {
        if (ts.isImportDeclaration(node)) {
          if (node.importClause?.namedBindings) {
            const bindings = node.importClause.namedBindings;
            if (ts.isNamedImports(bindings)) {
              bindings.elements.forEach(e => fileImports.push(e.name.text));
            } else if (ts.isNamespaceImport(bindings)) {
              fileImports.push(bindings.name.text);
            }
          }
          if (node.importClause?.name) {
            fileImports.push(node.importClause.name.text);
          }
        }
      });

      ts.forEachChild(sourceFile, (node) => visitNode(node, sourceFile, typeChecker, classes, sequences, fileImports));
    }
  }

  return { classes, sequences };
}

function isCapitalized(name: string): boolean {
  return /^[A-Z]/.test(name);
}

function visitNode(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  typeChecker: ts.TypeChecker,
  classes: ClassModel[],
  sequences: SequenceCall[],
  fileImports: string[],
) {
  // --- Class Diagram Parsing ---
  if (ts.isClassDeclaration(node) && node.name) {
    const classModel: ClassModel = {
      name: node.name.text,
      implements: [],
      properties: [],
      methods: [],
      jsxDependencies: [],
      importDependencies: [...fileImports],
    };

    if (node.heritageClauses) {
      for (const clause of node.heritageClauses) {
        if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
          classModel.extends = clause.types[0].expression.getText(sourceFile);
        } else if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
          classModel.implements = clause.types.map(t => t.expression.getText(sourceFile));
        }
      }
    }

    for (const member of node.members) {
      const visibility = getVisibility(member);
      
      if (ts.isPropertyDeclaration(member) && member.name) {
        classModel.properties.push({
          name: member.name.getText(sourceFile),
          type: member.type ? member.type.getText(sourceFile) : "any",
          visibility,
        });
      } else if (ts.isMethodDeclaration(member) && member.name) {
        classModel.methods.push({
          name: member.name.getText(sourceFile),
          returnType: member.type ? member.type.getText(sourceFile) : "void",
          visibility,
        });

        // --- Sequence Diagram Parsing (Method Calls) ---
        ts.forEachChild(member, (child) => visitMethodBody(child, classModel.name, sourceFile, sequences));
      }
    }

    classes.push(classModel);
  } else if (ts.isFunctionDeclaration(node) && node.name) {
    const funcName = node.name.text;
    
    // Treat capitalized functions as React Components (Classes)
    if (isCapitalized(funcName)) {
      const compModel: ClassModel = {
        name: funcName,
        implements: [],
        properties: [],
        methods: [],
        jsxDependencies: [],
        importDependencies: [...fileImports], // start with file imports
      };
      
      extractProps(node.parameters, compModel, sourceFile);

      ts.forEachChild(node, (child) => visitComponentBody(child, funcName, sourceFile, compModel, sequences));
      classes.push(compModel);
    } else {
      // Top level functions act as actors in sequence diagrams
      ts.forEachChild(node, (child) => visitMethodBody(child, funcName, sourceFile, sequences));
    }
  } else if (ts.isVariableStatement(node)) {
    // Check for Arrow Functions representing React Components: const Navbar = () => {}
    for (const declaration of node.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        const varName = declaration.name.text;
        if (isCapitalized(varName) && (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer))) {
          const compModel: ClassModel = {
            name: varName,
            implements: [],
            properties: [],
            methods: [],
            jsxDependencies: [],
            importDependencies: [...fileImports],
          };
          
          if (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer)) {
            extractProps(declaration.initializer.parameters, compModel, sourceFile);
          }

          ts.forEachChild(declaration.initializer, (child) => visitComponentBody(child, varName, sourceFile, compModel, sequences));
          classes.push(compModel);
        }
      }
    }
  }

  ts.forEachChild(node, (child) => visitNode(child, sourceFile, typeChecker, classes, sequences, fileImports));
}

function extractProps(parameters: ts.NodeArray<ts.ParameterDeclaration>, classModel: ClassModel, sourceFile: ts.SourceFile) {
  if (parameters.length > 0) {
    const firstParam = parameters[0];
    if (ts.isObjectBindingPattern(firstParam.name)) {
      for (const element of firstParam.name.elements) {
        if (ts.isBindingElement(element) && ts.isIdentifier(element.name)) {
          classModel.properties.push({ name: element.name.text, type: 'prop', visibility: '+' });
        }
      }
    } else if (ts.isIdentifier(firstParam.name)) {
      classModel.properties.push({ name: firstParam.name.text, type: 'props', visibility: '+' });
    }
  }
}

function visitComponentBody(
  node: ts.Node,
  componentName: string,
  sourceFile: ts.SourceFile,
  compModel: ClassModel,
  sequences: SequenceCall[]
) {
  // Deep traverse to extract all JSX components (handles elements like <Route element={<AdminUsers />} />)
  if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
    let tagName = node.tagName.getText(sourceFile);
    if (tagName.includes('.')) {
      tagName = tagName.split('.')[0];
    }
    // Ignore native HTML tags (lowercase like div, span) and only add Captialized component names
    if (isCapitalized(tagName)) {
      compModel.jsxDependencies.push(tagName);
    }
  }

  // Detect Hooks and inner state/methods
  if (ts.isVariableStatement(node) || ts.isVariableDeclaration(node)) {
    const decls = ts.isVariableStatement(node) ? node.declarationList.declarations : [node as ts.VariableDeclaration];
    for (const decl of decls) {
      if (decl.initializer) {
        // Detect inner functions (methods)
        if (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer)) {
          if (ts.isIdentifier(decl.name)) {
            compModel.methods.push({ name: decl.name.text, returnType: 'void', visibility: '+' });
          }
        }
        
        // Detect hooks like useState
        if (ts.isCallExpression(decl.initializer) && ts.isIdentifier(decl.initializer.expression)) {
          const fnName = decl.initializer.expression.text;
          if (fnName === "useState" && ts.isArrayBindingPattern(decl.name)) {
             const stateName = decl.name.elements[0];
             if (ts.isBindingElement(stateName) && ts.isIdentifier(stateName.name)) {
               compModel.properties.push({ name: stateName.name.text, type: 'state', visibility: '+' });
             }
          } else if (fnName === "useContext") {
            const args = decl.initializer.arguments;
            if (args.length > 0 && ts.isIdentifier(args[0])) {
              compModel.jsxDependencies.push(args[0].text); // Count hooks dependency conceptually similar to composition
            }
          }
        }
      }
    }
  } else if (ts.isFunctionDeclaration(node) && node.name) {
    compModel.methods.push({ name: node.name.text, returnType: 'void', visibility: '+' });
  }

  // Also traverse using standard method body visitor for sequence diagrams and nested callbacks
  visitMethodBody(node, componentName, sourceFile, sequences);
  
  ts.forEachChild(node, (child) => visitComponentBody(child, componentName, sourceFile, compModel, sequences));
}

function visitMethodBody(
  node: ts.Node,
  callerName: string,
  sourceFile: ts.SourceFile,
  sequences: SequenceCall[]
) {
  if (ts.isCallExpression(node)) {
    const expr = node.expression;
    if (ts.isPropertyAccessExpression(expr)) {
      const callee = expr.expression.getText(sourceFile);
      const method = expr.name.getText(sourceFile);
      
      // Basic heuristic for Sequence diagram: Caller -> Callee : Method
      // e.g. "this.userService.getUser()" -> callerName -> userService : getUser
      sequences.push({
        from: callerName,
        to: callee === 'this' ? callerName : callee,
        method: method,
      });
    } else if (ts.isIdentifier(expr)) {
      sequences.push({
        from: callerName,
        to: "Global",
        method: expr.getText(sourceFile),
      });
    }
  }

  ts.forEachChild(node, (child) => visitMethodBody(child, callerName, sourceFile, sequences));
}

function getVisibility(node: ts.Node): string {
  const flags = ts.getCombinedModifierFlags(node as ts.Declaration);
  if (flags & ts.ModifierFlags.Private) return "-";
  if (flags & ts.ModifierFlags.Protected) return "#";
  return "+"; // Default to public
}
