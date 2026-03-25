const fs = require('fs');
const p = 'd:/codexa/src/lib/uml/generator.ts';
let code = fs.readFileSync(p, 'utf8');

const newFunc = export function generateClassDiagram(model: UMLModel): string {
  let mermaid = "classDiagram\\n";

  // 1. FILTER LOW-VALUE COMPONENTS STRICTLY
  const lowValueRegex = /(Button|Dialog|Card|Avatar|Badge|Input|Select|Toast|Tooltip|Checkbox|Switch|Label|Form|Dropdown|Popover|Spinner|Icon|Menu|Tabs|Accordion|Slider|Progress|Table|Alert|Textarea|Radio|Context|Text|Heading|Title|Link|Image|Logo|Item|Content|Header|Footer|Group|Panel|Separator|ScrollArea|Trigger|Wrapper|Tooltip|Overlay|Portal)$/i;

  let validClasses = model.classes.filter(c => {
    if (c.name === "App" || c.name === "Root") return true;

    // Explicit whitelist for core architecture
    if (/(Layout|Page|Provider|Screen|Boundary|Router|App|Container|Service|API|Controller|Store)$/i.test(c.name)) return true;

    // Reject low level UI components
    if (lowValueRegex.test(c.name)) return false;

    return true;
  });

  // Limit to top 10 most connected classes to avoid massive grids
  validClasses.sort((a,b) => {
      const aDeps = (a.jsxDependencies?.length || 0) + (a.importDependencies?.length || 0);
      const bDeps = (b.jsxDependencies?.length || 0) + (b.importDependencies?.length || 0);
      return bDeps - aDeps;
  });
  validClasses = validClasses.slice(0, 10);

  const validClassNames = new Set(validClasses.map(cl => classSanitize(cl.name)));

  for (const c of validClasses) {
    mermaid += \  class \ {\\n\;

    // Extreme simplification: max 2 properties, 1 method
    const uniqueProps = new Set<string>();
    let propCount = 0;

    const sortedProps = [...c.properties].sort((a,b) => {
      const aScore = /state|data|user|store/i.test(a.name) ? -1 : 1;
      const bScore = /state|data|user|store/i.test(b.name) ? -1 : 1;
      return aScore - bScore;
    });

    for (const prop of sortedProps) {
      if (propCount >= 1) break; // ONLY max 1 property to make it ultra clean

      const cleanType = prop.type.replace(/[{}]/g, '').replace(/</g, '~').replace(/>/g, '~');
      const cleanName = prop.name.replace(/[^a-zA-Z0-9_]/g, '');

      // simplify types visually
      const displayType = cleanType.length > 15 ? 'Object' : cleanType;

      if (cleanName && !uniqueProps.has(cleanName)) {
        uniqueProps.add(cleanName);
        mermaid += \    \\ : \\\n\;
        propCount++;
      }
    }

    const uniqueMethods = new Set<string>();
    let methodCount = 0;

    // Prioritize business logic methods
    const sortedMethods = [...c.methods].sort((a,b) => {
      const aScore = /fetch|get|post|submit|save|load|handle/i.test(a.name) ? -1 : 1;
      const bScore = /fetch|get|post|submit|save|load|handle/i.test(b.name) ? -1 : 1;
      return aScore - bScore;
    });

    for (const method of sortedMethods) {
      if (methodCount >= 1) break; // ONLY max 1 method for ultra clarity

      const cleanType = method.returnType.replace(/[{}]/g, '').replace(/</g, '~').replace(/>/g, '~');
      const cleanName = method.name.replace(/[^a-zA-Z0-9_]/g, '');

      if (/^(useEffect|useState|useContext|render|componentDidMount|constructor)$/.test(cleanName)) continue;

      if (cleanName && !uniqueMethods.has(cleanName)) {
        uniqueMethods.add(cleanName);
        mermaid += \    \\() \\\n\;
        methodCount++;
      }
    }
    mermaid += \  }\\n\;

    if (c.extends && validClassNames.has(classSanitize(c.extends))) {
      mermaid += \  \ <|-- \\\n\;
    }
  }

  const establishedDeps = new Set<string>();

  for (const c of validClasses) {
    const sourceName = classSanitize(c.name);

    const depsToUse = (c.jsxDependencies && c.jsxDependencies.length > 0)
      ? c.jsxDependencies
      : (c.importDependencies || []);

    const uniqueDeps = new Set(depsToUse.map(d => classSanitize(d)));

    let depCount = 0;
    for (const dep of uniqueDeps) {
      if (dep && dep !== sourceName && validClassNames.has(dep)) {
        if (depCount >= 2) break; // Max 2 relations going out keeping the graph super tidy!

        const relation = \  \ --> \\\n\;
        const reverseRelation = \  \ --> \\\n\;
        if (!establishedDeps.has(relation) && !establishedDeps.has(reverseRelation)) {
          mermaid += relation;
          establishedDeps.add(relation);
          depCount++;
        }
      }
    }
  }

  if (validClasses.length === 0) {
    mermaid += \  class EmptyProject {\\n    +noHighLevelComponents()\\n  }\\n\;
  }

  return mermaid;
};

const fullRegex = /export function generateClassDiagram\([\s\S]*?export function generateSequenceDiagram/m;
code = code.replace(fullRegex, newFunc + '\n\nfunction classSanitize(name: string) {\n  return name.replace(/[^a-zA-Z0-9_]/g, \'\');\n}\n\nexport function generateSequenceDiagram');
fs.writeFileSync(p, code, 'utf8');
