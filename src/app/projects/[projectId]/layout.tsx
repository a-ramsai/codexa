import ProjectIdLayout from "@/features/projects/components/ProjectIdLayout";
import { Id } from "../../../../convex/_generated/dataModel";


async function layout ({children,params}:{children: React.ReactNode;
    params:Promise<{projectId:string}>
}) {
    const {projectId} = await params; const pid = projectId as Id<"projects">;
  return (
    <ProjectIdLayout projectId={pid as Id<"projects">}>
        {children}
    </ProjectIdLayout>
  )
}
export default layout
