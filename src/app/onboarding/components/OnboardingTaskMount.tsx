"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { OnboardingTaskTour } from "./OnboardingTaskTour";
import {
  getOnboardingReturnPath,
  getOnboardingTaskById,
  onboardingTaskPathForStep,
} from "@/lib/onboarding/onboardingTasks";

export function OnboardingTaskMount() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("onboardingTask");
  const task = getOnboardingTaskById(taskId);

  if (!task) return null;

  const taskStep = Math.min(
    Math.max(Number(searchParams.get("taskStep") ?? "0"), 0),
    task.steps.length - 1,
  );
  const expectedPath = onboardingTaskPathForStep(task, taskStep);

  if (pathname !== expectedPath) {
    return null;
  }

  return (
    <OnboardingTaskTour
      taskId={task.id}
      steps={task.steps}
      returnPath={getOnboardingReturnPath(task)}
    />
  );
}
