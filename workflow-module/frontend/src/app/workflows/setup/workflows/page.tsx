import { redirect } from "next/navigation";

export default function WorkflowsSetupRedirect() {
  redirect("/workflows/definitions");
}
