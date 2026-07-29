/**
 * explanation_link.ts — Maps internal change-type codes to human-readable
 * explanations for workout plan version history entries.
 *
 * Extend the `EXPLANATION_TEMPLATES` map when new change sources are added
 * (e.g. AI-driven suggestions from 01_adaptive_planning_engine).
 */

/** Internal change-type codes used when recording version history entries. */
export type ChangeType =
  | "manual_edit"
  | "rollback"
  | "deletion"
  | "creation"
  | "ai_suggestion" // TODO: enable when 01_adaptive_planning_engine is ready
  | string; // allow future extension

/**
 * Template map from change-type code → user-facing explanation string.
 */
const EXPLANATION_TEMPLATES: Record<string, string> = {
  manual_edit: "This version was created by a manual edit from the user.",
  rollback: "This version was created by rolling back to a previous snapshot.",
  deletion: "The plan was soft-deleted at this version; it is no longer active.",
  creation: "This is the initial version of the plan, created manually by the user.",
  // TODO: Uncomment when 01_adaptive_planning_engine is integrated:
  // ai_suggestion: "This version was suggested by the AI planning engine based on your recent performance data.",
};

const FALLBACK_EXPLANATION =
  "The plan was modified. No additional explanation is available.";

/**
 * Returns a human-readable explanation for a version history entry.
 *
 * @param changeType    Internal code describing the category of change.
 * @param changeSummary Raw change summary stored with the history record
 *                      (used as fallback context when type is unknown).
 * @returns             User-facing explanation string.
 */
export function getExplanation(changeType: ChangeType, changeSummary: string): string {
  const template = EXPLANATION_TEMPLATES[changeType];
  if (template) return template;
  return `${FALLBACK_EXPLANATION} Detail: ${changeSummary}`;
}
