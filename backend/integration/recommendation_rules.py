def get_workout_recommendation(recovery_score: float) -> str:
    if recovery_score >= 8.0:
        return "Heavy"
    elif recovery_score >= 5.0:
        return "Moderate"
    else:
        return "Light/Rest"
