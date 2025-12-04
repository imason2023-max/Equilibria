from typing import Optional, Dict


def _clamp(value: float, min_value: float, max_value: float) -> float:
    """Clamp a value between min_value and max_value."""
    return max(min_value, min(max_value, value))


def calculate_recovery_score(
    recovery_data: Dict,
    wearable_data: Optional[Dict] = None
) -> float:
    """
    Calculate a 1–10 recovery score based on:
    - subjective inputs (sleep_quality, soreness_level, energy_level, stress_level)
    - optional wearable data (HRV, resting HR, sleep duration)
    """
    
    sleep_quality = _clamp(float(recovery_data.get("sleep_quality", 5)), 1, 10)
    soreness = _clamp(float(recovery_data.get("soreness_level", 5)), 1, 10)
    energy = _clamp(float(recovery_data.get("energy_level", 5)), 1, 10)
    stress = _clamp(float(recovery_data.get("stress_level", 5)), 1, 10)

    # Invert soreness and stress so that higher = better
    soreness_inverted = 11 - soreness
    stress_inverted = 11 - stress

    # Weights sum to 1.0
    base_score = (
        0.30 * sleep_quality +
        0.25 * soreness_inverted +
        0.20 * energy +
        0.15 * stress_inverted
    )

    #Sleep quantity modifier 
    if wearable_data and wearable_data.get("sleep_duration_minutes"):
        sleep_hours = wearable_data["sleep_duration_minutes"] / 60.0
    else:
        sleep_hours = float(recovery_data.get("sleep_hours") or 0)

    if sleep_hours <= 0:
        sleep_factor = 1.0
    elif sleep_hours < 5:
        sleep_factor = 0.8
    elif sleep_hours < 6:
        sleep_factor = 0.9
    elif sleep_hours <= 8.5:
        sleep_factor = 1.0
    else:
        sleep_factor = 1.05

    score = base_score * sleep_factor

    #Wearable contributions (HRV + resting HR)
    if wearable_data:
        hrv = wearable_data.get("hrv_rmssd")
        rhr = wearable_data.get("resting_heart_rate")

        if hrv is not None:
            try:
                hrv = float(hrv)
                if hrv >= 80:
                    score += 0.7
                elif hrv >= 60:
                    score += 0.4
                elif hrv >= 40:
                    score += 0.2
                elif hrv >= 20:
                    score += 0.0
                else:
                    score -= 0.3
            except (TypeError, ValueError):
                pass

        if rhr is not None:
            try:
                rhr = float(rhr)
                if rhr <= 50:
                    score += 0.3
                elif rhr <= 60:
                    score += 0.15
                elif rhr <= 70:
                    score += 0.0
                elif rhr <= 80:
                    score -= 0.2
                else:
                    score -= 0.4
            except (TypeError, ValueError):
                pass

    score = _clamp(score, 1.0, 10.0)
    return round(score, 1)
