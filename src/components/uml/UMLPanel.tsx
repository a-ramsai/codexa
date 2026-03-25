"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, Plus, Minus, Download } from "lucide-react";

import { UMLViewer, UMLViewerRef } from "./UMLViewer";

export type DiagramType = "class" | "sequence";

interface UMLPanelProps {
  projectId: string;
}

export function UMLPanel({ projectId }: UMLPanelProps) {
  const [diagramType, setDiagramType] = useState<DiagramType>("class");
  const [diagram, setDiagram] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const cache = useRef<Record<string, string>>({});
  const viewerRef = useRef<UMLViewerRef>(null);

  const handleRefresh = () => {
    // Clear cache for current type and force refetch
    const cacheKey = `${projectId}-${diagramType}`;
    delete cache.current[cacheKey];
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const fetchDiagram = async () => {
      const cacheKey = `${projectId}-${diagramType}`;
      if (cache.current[cacheKey]) {
        setDiagram(cache.current[cacheKey]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/generate-uml", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectId, type: diagramType }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate UML");
        }

        const data = await response.json();
        cache.current[cacheKey] = data.diagram;
        setDiagram(data.diagram);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagram();
  }, [projectId, diagramType, refreshKey]);

  return (
    <div className="h-full w-full flex flex-col bg-background text-foreground">
      {/* Top Bar for selecting diagram type */}
      <div className="h-12 border-b flex items-center px-4 shrink-0 bg-sidebar/50">
        <label className="text-sm font-medium mr-3">Diagram Type:</label>
        <select
          className="bg-background border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring mr-auto"
          value={diagramType}
          onChange={(e) => setDiagramType(e.target.value as DiagramType)}
          disabled={isLoading}
        >
          <option value="class">Class Diagram</option>
          <option value="sequence">Sequence Diagram</option>
        </select>

        <div className="flex items-center gap-2 mr-4">
          <div className="relative flex items-center">
            <Download className="w-4 h-4 absolute left-3 pointer-events-none text-muted-foreground" />
            <select
             defaultValue="" 
              onChange={(e) => {
                if(e.target.value) {
                  viewerRef.current?.download(e.target.value as any);
                  e.target.value = "";
                }
              }}
              disabled={!diagram || isLoading}
              className="pl-9 pr-6 py-1.5 text-sm bg-background border rounded outline-none focus:ring-1 focus:ring-ring cursor-pointer disabled:opacity-50 appearance-none"
            >

              <option value="" disabled hidden >Download</option>
              <option value="png">PNG</option>
              
              <option value="jpeg">JPEG</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Main viewer area */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">Generating {diagramType} diagram...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-destructive/10 text-destructive px-6 py-4 rounded font-medium border border-destructive/20">
              {error}
            </div>
          </div>
        ) : diagram ? (
          <UMLViewer ref={viewerRef} diagram={diagram} />
        ) : null}

        {/* Floating Zoom Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
          <button 
            onClick={() => viewerRef.current?.zoomIn()} 
            disabled={!diagram || isLoading} 
            className="p-2 hover:bg-muted rounded-full border bg-background shadow-md disabled:opacity-50 transition-colors" 
            title="Zoom In"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={() => viewerRef.current?.zoomOut()} 
            disabled={!diagram || isLoading} 
            className="p-2 hover:bg-muted rounded-full border bg-background shadow-md disabled:opacity-50 transition-colors" 
            title="Zoom Out"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}