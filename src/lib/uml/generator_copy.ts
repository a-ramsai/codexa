import { ClassModel, SequenceCall, UMLModel } from "./parser";

export function generateClassDiagram(model: UMLModel): string {
  let mermaid = "classDiagram\n";

  // 1. FILTER LOW-VALUE COMPONENTS
  const lowValueRegex = /(Button|Dialog|Card|Avatar|Badge|Input|Select|Toast|Tooltip|Checkbox|Switch|Label|Form|Dropdown|Popover|Spinner|Icon|Menu|Tabs|Accordion|Slider|Progress|Table|Alert|Textarea|Radio|Context|Text|Heading|Title|Link|Image|Logo|Item|Content|Header|Footer)$/i;
  
  const validClasses = model.classes.filter(c => {
    // Keep root App
    if (c.name === "App" || c.name === "Root") return true;
    
    // Explicit whitelist by suffix (high level architecture)
    if (/(Layout|Page|Provider|Screen|Boundary|Routes|Router|App|Container|Wrapper)$/i.test(c.name)) return true;
    
    // Reject low level UI components
    if (lowValueRegex.test(c.name)) return false;

    return true;
  });

  const validClassNames = new Set(validClasses.map(cl => classSanitize(cl.name)));

  for (const c of validClasses) {
    mermaid += `  class ${c.name} {\n`;
    
    // 6. SIMPLIFY ATTRIBUTES Display (Max 3 important properties)
    const uniqueProps = new Set<string>();
    let propCount = 0;
    
    // Sort to prioritize state, data, user, etc.
    const sortedProps = [...c.properties].sort((a,b) => {
      const aScore = /state|data|user|store|context/i.test(a.name) ? -1 : 1;
      const bScore = /state|data|user|store|context/i.test(b.name) ? -1 : 1;
      return aScore - bScore;
    });

    for (const prop of sortedProps) {
      if (propCount >= 3) break; 
      
      const cleanType = prop.type.replace(/[{}]/g, '').replace(/</g, '~').replace(/>/g, '~');
      const cleanName = prop.name.replace(/[^a-zA-Z0-9_]/g, '');
      
      // Simplify internal react types visually
      const displayType = cleanType.length > 20 ? 'Object' : cleanType;

      if (cleanName && !uniqueProps.has(cleanName)) {
        uniqueProps.add(cleanName);
        mermaid += `    ${prop.visibility}${cleanName} : ${displayType}\n`;
        propCount++;
      }
    }
    
    // Max 2 important methods (Skip React lifecycles)
    const uniqueMethods = new Set<string>();
    let methodCount = 0;
    for (const method of c.methods) {
      if (methodCount >= 2) break;
      const cleanType = method.returnType.replace(/[{}]/g, '').replace(/</g, '~').replace(/>/g, '~');
      const cleanName = method.name.replace(/[^a-zA-Z0-9_]/g, '');

      // Skip React defaults
      if (/^(useEffect|useState|useContext|render|componentDidMount)$/.test(cleanName)) continue;

      if (cleanName && !uniqueMethods.has(cleanName)) {
        uniqueMethods.add(cleanName);
        mermaid += `    ${method.visibility}${cleanName}() ${cleanType}\n`;
        methodCount++;
      }
    }
    mermaid += `  }\n`;

    // Ignore Extends/Implements unless the parent is also in the high-level filtered diagram
    if (c.extends && validClassNames.has(classSanitize(c.extends))) {
      mermaid += `  ${c.extends} <|-- ${c.name}\n`;
    }
  }

  // Draw dependencies (e.g. App --> Layout)
  const establishedDeps = new Set<string>();
  
  for (const c of validClasses) {
    const sourceName = classSanitize(c.name);
    
    // 4. PRIORITIZE HIERARCHY
    // Prefer JSX composition for strict parent -> child relation trees (App -> AuthProvider, Page -> Component).
    // If no JSX mappings exist, fall back to Imports to link utility Singletons.
    const depsToUse = (c.jsxDependencies && c.jsxDependencies.length > 0) 
      ? c.jsxDependencies 
      : (c.importDependencies || []);

    const uniqueDeps = new Set(depsToUse.map(d => classSanitize(d)));
    
    let depCount = 0;
    for (const dep of uniqueDeps) {
      // Clean relationships. Max 3 structural outgoing relationships per node to maintain tree.
      if (dep && dep !== sourceName && validClassNames.has(dep)) {
        if (depCount >= 3) break; 

        const relation = `  ${sourceName} --> ${dep}\n`;
        const reverseRelation = `  ${dep} --> ${sourceName}\n`; // 5. REMOVE NOISE (cyclic checks)
        
        if (!establishedDeps.has(relation) && !establishedDeps.has(reverseRelation)) {
          mermaid += relation;
          establishedDeps.add(relation);
          depCount++;
        }
      }
    }
  }

  if (validClasses.length === 0) {
    mermaid += "  class EmptyProject {\n    +noHighLevelComponents()\n  }\n";
  }

  return mermaid;
}

function classSanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9_]/g, '');
}

export function generateSequenceDiagram(model: UMLModel): string {
  let mermaid = "sequenceDiagram\n";
  mermaid += "  autonumber\n";
  
  const establishedCalls = new Set<string>();
  const validCallObjects: {from: string, to: string, method: string}[] = [];

  const ignoredMethods = new Set([
    "map", "filter", "reduce", "forEach", "find", "some", "every", "join", "split", "push", "pop", "shift", "unshift",
    "useState", "useEffect", "useContext", "useCallback", "useMemo", "useRef", "useReducer", "useId",
    "console", "log", "warn", "error", "info", "debug", "trace", "dir",
    "parseInt", "parseFloat", "toString", "toLowerCase", "toUpperCase", "trim", "replace",
    "setTimeout", "setInterval", "clearTimeout", "clearInterval", "catch", "finally", "then",
    "addEventListener", "removeEventListener", "getElementById", "querySelector",
    "onMouseMove", "onHover", "onMouseEnter", "onMouseLeave", "stopPropagation", "preventDefault"
  ]);

  const ignoredObjects = new Set([
    "console", "Math", "JSON", "Object", "Array", "String", "Number", "Boolean", "Date", "RegExp", "Promise", 
    "window", "document", "localStorage", "sessionStorage", "React", "process", "env", "this", "e", "event"
  ]);

  for (const seq of model.sequences) {
    let from = seq.from.replace(/[^a-zA-Z0-9_]/g, '');
    let to = seq.to.replace(/[^a-zA-Z0-9_]/g, '');
    const method = seq.method.replace(/[^a-zA-Z0-9_()]/g, '');

    if (!from || !to || !method) continue;

    if (from === "Global") from = "Client";
    if (to === "Global") {
       if (/fetch|get|post|put|delete|api|query|mutation/i.test(method)) {
         to = "API";
       } else {
         to = "System";
       }
    }

    if (from === to) continue; 
    if (ignoredMethods.has(method)) continue; 
    if (ignoredObjects.has(from) || ignoredObjects.has(to)) continue; 
    if (method.match(/^set[A-Z]/)) continue; 

    // Merge small components into parent (e.g. Button -> Page)
    from = from.replace(/(Trigger|Content|Header|Footer|Wrapper|Container|Button|Field|Input|Form|Dialog|Card|Item|List|Group|Panel|Badge|Icon)$/i, '');
    to = to.replace(/(Trigger|Content|Header|Footer|Wrapper|Container|Button|Field|Input|Form|Dialog|Card|Item|List|Group|Panel|Badge|Icon)$/i, '');

    if (from === to) continue;
    
    // Ignore internal pure UI things
    if (/(Tooltip|ScrollArea|Separator|Resize|Menu|Tabs|Accordion)/i.test(from) || /(Tooltip|ScrollArea|Separator|Resize|Menu|Tabs|Accordion)/i.test(to)) continue;

    validCallObjects.push({ from, to, method });
  }

  // 1 & 4. Limit Scope & Participants (Max 6)
  const frequency = new Map<string, number>();
  validCallObjects.forEach(c => {
    frequency.set(c.from, (frequency.get(c.from) || 0) + 1);
    frequency.set(c.to, (frequency.get(c.to) || 0) + 1);
  });

  const essentialActors = ["Client", "App", "API", "System"];
  const sortedActors = Array.from(frequency.keys())
    .sort((a, b) => {
      if (essentialActors.includes(a) && !essentialActors.includes(b)) return -1;
      if (!essentialActors.includes(a) && essentialActors.includes(b)) return 1;
      return (frequency.get(b) || 0) - (frequency.get(a) || 0);
    })
    .slice(0, 6); // Max 6 components for extreme simplicity

  const allowedActors = new Set(sortedActors);
  
  if (allowedActors.has("Client")) mermaid += "  actor Client\n";
  if (allowedActors.has("App")) mermaid += "  participant App\n";
  
  const uiLayer = new Set<string>();
  const serviceLayer = new Set<string>();
  
  sortedActors.forEach(a => {
    if (essentialActors.includes(a)) return;
    if (/(Page|View|Screen|Layout)$/i.test(a)) uiLayer.add(a);
    else serviceLayer.add(a);
  });

  uiLayer.forEach(a => mermaid += `  participant ${a}\n`);
  serviceLayer.forEach(a => mermaid += `  participant ${a}\n`);
  
  if (allowedActors.has("API")) mermaid += "  participant API\n";
  if (allowedActors.has("System")) mermaid += "  participant System\n";

  let generatedCount = 0;
  const MAX_CALLS = 10;

  for (const call of validCallObjects) {
    if (generatedCount >= MAX_CALLS) break;
    if (!allowedActors.has(call.from) || !allowedActors.has(call.to)) continue;

    const { from, to, method } = call;
    
    const isFetch = /fetch|get|login|submit|load|query/i.test(method);
    
    // Convert args to clean string
    const callNode = `  ${from}->>${to}: ${method}()\n`;
    const responseNode = `  ${to}-->>${from}: response\n`;

    // Deduplication
    if (!establishedCalls.has(callNode)) {
      mermaid += callNode;
      establishedCalls.add(callNode);
      generatedCount++;
      
      if (isFetch && to === "API" && !establishedCalls.has(responseNode)) {
        mermaid += responseNode;
        establishedCalls.add(responseNode);
      }
    }
  }

  if (generatedCount === 0) {
    mermaid += "  Client->>App: User Action\n";
    mermaid += "  App->>System: Process\n";
    mermaid += "  System-->>App: Result\n";
  }

  return mermaid;
}

