import { parseFiles } from "./src/lib/uml/parser";
import { generateSequenceDiagram } from "./src/lib/uml/generator";

const content = `import React, { useState, useEffect } from 'react';
import api from './api';
import auth from './auth';

export default function App() {
  const [data, setData] = useState();

  useEffect(() => {
    api.fetchData().then(res => {
      setData(res);
      console.log(res);
      Math.random();
    })
  }, [])
  
  const login = () => {
    auth.login(data);
  }
  
  return <div onClick={login} />
}
`

const r = parseFiles([{ path: "App.tsx", content }]);
// Simulate some valid classes since api and auth aren't technically parsed as App components:
r.classes.push({ name: "api", implements: [], properties: [], methods: [], jsxDependencies: [], importDependencies: [] });
r.classes.push({ name: "auth", implements: [], properties: [], methods: [], jsxDependencies: [], importDependencies: [] });

console.log(generateSequenceDiagram(r));
