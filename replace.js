const fs = require('fs');
const p = 'd:/codexa/src/lib/uml/generator.ts';
let code = fs.readFileSync(p, 'utf8');

const classDiagramReplacer = \export function generateClassDiagram(model: UMLModel): string {
  let mermaid = "classDiagram\\n";

  // 1. FILTER LOW-VALUE COMPONENTS
  const lowValueRegex = /(Button|Dialog|Card|Avatar|Badge|Input|Select|Toast|Tooltip|Checkbox|Switch|Label|Form|Dropdown|Popover|Spinner|Icon|Menu|Tabs|Accordion|Slider|Progress|Table|Alert|Textarea|Radio|Context|Text|Heading|Title|Link|Image|Logo|Item|Content|Header|Footer|Group|Panel|Separator|ScrollArea|Trigger|Wrapper|Tooltip|Overlay|Portal|List|Box)$/i;
  
  let validClasses = model.classes.filter(c => {
    // Keep root
    if (c.name === "App" || c.name === "Root") return true;

    // Explicit whitelist by suffix (high level architecture)
    if (/(Layout|Page|Provider|Screen|Boundary|Routes|Router|App|Container|Service|API|Controller|Store)$/i.test(c.name)) return true;

    // Reject low level UI components
    if (lowValueRegex.test(c.name)) return false;

    // Reject completely empty components
    if (c.methods.length === 0 && c.properties.length === 0 && (!c.jsxDependencies || c.jsxDependencies.length === 0) && (!c.importDependencies || c.importDependencies.length === 0)) return false;

    return true;
  });

  // Limit to top 15 most connected classes
  validClasses.sort((a,b) => {
      const aDeps = (a.jsxDependencies ? a.jsxDependencies.length : 0) + (a.importDependencies ? a.importDependencies.length : 0);
      const bDeps = (b.jsxDependencies ? b.jsxDependencies.length : 0) + (b.importDependencies ? b.importDependencies.length : 0);
      return bDeps - aDeps;
  });
  validClasses = validClasses.slice(0, 10);

  const validClassNames = new Set(validClasses.map(cl => classSanitize(cl.name)));
  for (const c of validClasses) {
    mermaid += "  class " + c.name + " {\\n";

    // Extreme Simplification: 1 property, 1 method max
    const uniqueProps = new Set<string>();
    let propCount = 0;

    const sortedProps = [...c.properties].sort((a,b) => {
      const aScore = /state|data|user|store/i.test(a.name) ? -1 : 1;
      const bScore = /state|data|user|store/i.test(b.name) ? -1 : 1;
      return aScore - bScore;
    });

    for (const prop of sortedProps) {
      if (propCount >= 1) break;

      const cleanType = prop.type.replace(/[{}]/g, '').replace(/</g, '~').replace(/>/g, '~');
      const cleanName = prop.name.replace(/[^a-zA-Z0-9_]/g, '');

      const displayType = cleanType.length > 20 ? 'Object' : cleanType;

      if (cleanName && !uniqueProps.has(cleanName)) {
        uniqueProps.add(cleanName);
        mermaid += "    " + prop.visibility + cleanName + " : " + displayType + "\\n";
        propCount++;
      }
    }

    const uniqueMethods = new Set<string>();
    let methodCount = 0;
    
    const sortedMethods = [...c.methods].sort((a,b) => {
      const aScore = /fetch|get|post|submit|save|load|handle/i.test(a.name) ? -1 : 1;
      const bScore = /fetch|get|post|submit|save|load|handle/i.test(b.name) ? -1 : 1;
      return aScore - bScore;
    });

    for (const method of sortedMethods) {
      if (methodCount >= 1) break;
      const cleanType = method.returnType.replace(/[{}]/g, '').replace(/</g, '~').replace(/>/g, '~');
      const cleanName = method.name.replace(/[^a-zA-Z0-9_]/g, '');

      if (/^(useEffect|useState|useContext|render|componentDidMount|constructor)$/.test(cleanName)) continue;
      
      if (cleanName && !uniqueMethods.has(cleanName)) {
        uniqueMethods.add(cleanName);
        mermaid += "    " + method.visibility + cleanName + "() " + cleanType + "\\n";
        methodCount++;
      }
    }
    mermaid += "  }\\n";

    if (c.extends && validClassNames.has(classSanitize(c.extends))) {
      mermaid += "  " + c.extends + " <|-- " + c.name + "\\n";
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
        if (depCount >= 2) break; // Max 2 Relations

        const relation = "  " + sourceName + " --> " + dep + "\\n";
        const reverseRelation = "  " + dep + " --> " + sourceName + "\\n"; 
        if (!establishedDeps.has(relation) && !establishedDeps.has(reverseRelation)) {
          mermaid += relation;
          establishedDeps.add(relation);
          depCount++;
        }
      }
    }
  }

  if (validClasses.length === 0) {
    mermaid += "  class EmptyProject {\\n    +noHighLevelComponents()\\n  }\\n";
  }

  return mermaid;
}\n;

const startIndex = code.indexOf('export function generateClassDiagram');
const endIndex = code.indexOf('function classSanitize');

if (startIndex !== -1 && endIndex !== -1) {
    const newCode = code.substring(0, startIndex) + classDiagramReplacer + code.substring(endIndex);
    fs.writeFileSync(p, newCode, 'utf8');
    console.log('Update Complete');
} else {
    console.log('Could not find indices');
}
