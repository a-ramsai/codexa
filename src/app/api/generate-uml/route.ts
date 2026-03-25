import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { parseFiles } from "@/lib/uml/parser";
import { generateClassDiagram, generateSequenceDiagram } from "@/lib/uml/generator";
import { Id } from "../../../../convex/_generated/dataModel";

const requestSchema = z.object({
  projectId: z.string(),
  type: z.enum(["class", "sequence"]),
});

export async function POST(request: Request) {
  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getToken({ template: "convex" });

    const body = await request.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { projectId, type } = result.data;

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    if (token) {
      convex.setAuth(token);
    }

    // Fetch the raw files for the project
    const files = await convex.query(api.files.getFiles, {
      projectId: projectId as Id<"projects">,
    });

    // Make an in-memory reconstruct matching TS parser format
    const codeFiles: { path: string; content: string }[] = [];

    // Map parentIds to rebuild paths
    const fileIdMap = new Map(files.map(f => [f._id, f]));

    function getFullPath(fileId: string): string {
      const file = fileIdMap.get(fileId as Id<"files">);
      if (!file) return "";
      if (!file.parentId) return file.name;
      const parentPath = getFullPath(file.parentId);
      return parentPath ? `${parentPath}/${file.name}` : file.name;
    }

    for (const file of files) {
      if (file.type === "file" && file.content !== undefined) {
        let fullPath = getFullPath(file._id);
        // Exclude unwanted directories if any somehow made it in
        if (!fullPath.includes("node_modules") && !fullPath.includes(".git")) {
          // Default to .tsx to ensure TS Compiler properly processes JSX/React syntax
          if (!fullPath.includes(".")) {
            fullPath += ".tsx";
          }
          
          codeFiles.push({
            path: fullPath,
            content: file.content
          });
        }
      }
    }

    // Call parser
    const model = parseFiles(codeFiles);
    
    // Generate output string (Mermaid syntax)
    let diagram = "";
    if (type === "class") {
        diagram = generateClassDiagram(model);
    } else {
        diagram = generateSequenceDiagram(model);
    }

    return NextResponse.json({ diagram });
  } catch (error: any) {
    console.error("Failed to generate UML:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
