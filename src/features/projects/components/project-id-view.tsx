"use client";

import { useState } from "react";
import { FaGithub } from "react-icons/fa";

import { cn } from "@/lib/utils";

import { Id } from "../../../../convex/_generated/dataModel";
import { Allotment } from "allotment";
import { FileExplorer } from "./file-explorer";
import { EditorView } from "@/features/editor/components/editor-view";
import { PreviewView } from "./preview-view";
import { ExportPopover } from "./file-explorer/export-popover";
import { UMLPanel } from "@/components/uml/UMLPanel";

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 800;
const DEFAULT_SIDEBAR_WIDTH = 350;
const DEFAULT_MAIN_SIZE = 1000;


const Tab = ({
  label,
  isActive,
  onClick
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 h-full px-3 cursor-pointer text-muted-foreground border-r hover:bg-accent/30",
        isActive && "bg-background text-foreground"
      )}
    >
      <span className="text-sm">{label}</span>
    </div>
  );
};

export const ProjectIdView = ({ 
  projectId
}: { 
  projectId: Id<"projects">
}) => {
  const [activeView, setActiveView] = useState<"editor" | "preview" | "uml">("editor");

  return (
    <div className="h-full flex flex-col">
      <nav className="h-10 flex items-center bg-sidebar border-b">
        <Tab
          label="Code"
          isActive={activeView === "editor"}
          onClick={() => setActiveView("editor")}
        />
        <Tab
          label="Preview"
          isActive={activeView === "preview"}
          onClick={() => setActiveView("preview")}
        />
        <Tab
          label="Diagrams"
          isActive={activeView === "uml"}
          onClick={() => setActiveView("uml")}
        />
        <div className="flex-1 flex justify-end h-full">
          <ExportPopover projectId={projectId}/>
        </div>
      </nav>
      <div className="flex-1 relative">
        <div className={cn(
          "absolute inset-0",
          activeView === "editor" ? "visible z-10" : "invisible z-0"
        )}>
           <Allotment defaultSizes={[DEFAULT_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}>
            <Allotment.Pane
              snap
              minSize={MIN_SIDEBAR_WIDTH}
              maxSize={MAX_SIDEBAR_WIDTH}
              preferredSize={DEFAULT_SIDEBAR_WIDTH}
            >
              
              <FileExplorer projectId={projectId} />
            </Allotment.Pane>
            <Allotment.Pane>
              <EditorView projectId={projectId} />
              <p>Editor view</p>
            </Allotment.Pane>
          </Allotment>
        </div>
        <div className={cn(
          "absolute inset-0",
          activeView === "preview" ? "visible z-10" : "invisible z-0"
        )}>
          <PreviewView projectId={projectId}/>
        </div>
        <div className={cn(
          "absolute inset-0 bg-background",
          activeView === "uml" ? "visible z-10" : "invisible z-0"
        )}>
          <UMLPanel projectId={projectId} />
        </div>
      </div>
    </div>
  );
};