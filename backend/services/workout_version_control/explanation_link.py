"""
explanation_link.py — Human-readable explanations for version history entries.

Maps internal ``change_type`` codes to user-facing narrative strings,
providing context for *why* a workout plan changed.  This module is designed
to be extended when the AI planning engine (01_adaptive_planning_engine) is
integrated, at which point AI-driven changes will supply richer explanations.
"""

from __future__ import annotations

# Mapping from internal change_type codes to template explanation strings.
# Keys should match the ``change_type`` values used when calling
# ``history.record_version``.
_EXPLANATION_TEMPLATES: dict[str, str] = {
    "manual_edit": "This version was created by a manual edit from the user.",
    "rollback": "This version was created by rolling back to a previous snapshot.",
    "deletion": "The plan was soft-deleted at this version; it is no longer active.",
    "creation": "This is the initial version of the plan, created manually by the user.",
    # TODO: Add "ai_suggestion" when 01_adaptive_planning_engine is integrated.
    # "ai_suggestion": "This version was suggested by the AI planning engine based on your recent performance data.",
}

_FALLBACK_EXPLANATION = "The plan was modified. No additional explanation is available."


def get_explanation(change_type: str, change_summary: str) -> str:
    """
    Return a human-readable explanation for a version history entry.

    Looks up the ``change_type`` in the template registry.  If the type is
    unknown, falls back to a generic message that incorporates the raw
    ``change_summary`` for context.

    Args:
        change_type:    Internal code describing the category of change
                        (e.g. ``"manual_edit"``, ``"rollback"``).
        change_summary: The raw change summary string stored with the history
                        record; used as a fallback data source.

    Returns:
        A localised, user-facing explanation string.
    """
    template = _EXPLANATION_TEMPLATES.get(change_type)
    if template:
        return template
    return f"{_FALLBACK_EXPLANATION} Detail: {change_summary}"
