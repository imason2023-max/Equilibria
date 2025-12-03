from typing import Dict, List


def update_progression_history(
    history: List[Dict],
    new_session: Dict
) -> List[Dict]:
    history = history or []
    history.append(new_session)
    return history


def get_best_lifts(history: List[Dict]) -> Dict[str, float]:
    bests: Dict[str, float] = {}

    for session in history or []:
        for lift in session.get("lifts", []):
            name = lift.get("name")
            weight = lift.get("weight")
            if not name or weight is None:
                continue

            prev_best = bests.get(name, 0)
            if weight > prev_best:
                bests[name] = weight

    return bests
