import streamlit as st
import pandas as pd
from datetime import date

st.set_page_config(page_title="Tracking sportif - 2 phases", layout="wide")

DATA_FILE = "tracking.csv"
KCAL_PER_KG = 7700  # approximation courante pour projection


def met_kcal(minutes: float, met: float, weight_kg: float) -> float:
    # kcal/min = MET * 3.5 * poids(kg) / 200
    return float(minutes) * met * 3.5 * float(weight_kg) / 200.0


def load_data() -> pd.DataFrame:
    try:
        df = pd.read_csv(DATA_FILE, parse_dates=["date"])
        df["date"] = df["date"].dt.date
        return df
    except Exception:
        return pd.DataFrame(
            columns=[
                "date",
                "phase",
                "weight_kg",
                "kcal_in",
                "mins_calis",
                "mins_plyo",
                "mins_stairs",
                "run_km",
                "run_mins",
                "kcal_out_gym",
                "kcal_out_run",
                "kcal_out_total",
                "tdee",
                "deficit",
                "deficit_cum",
                "weight_est",
                "deficit_7d_avg",
                "proj_weight_19apr",
            ]
        )


st.title("Tracking sportif (poids, calories, kms, projections)")

# --- Profil ---
with st.sidebar:
    st.header("Profil & réglages")
    start_weight = st.number_input("Poids de départ (kg)", value=85.0, step=0.1)
    tdee = st.number_input("TDEE estimé (kcal/j)", value=2600, step=50)
    target_date = st.date_input("Date cible phase 1", value=date(2026, 4, 19))

    st.subheader("MET (modifiable)")
    met_calis = st.number_input("MET calisthenics", value=7.5, step=0.5)
    met_plyo = st.number_input("MET plyométrie", value=8.0, step=0.5)
    met_stairs = st.number_input("MET stairmaster", value=9.0, step=0.5)
    met_running = st.number_input("MET running (moyen)", value=9.8, step=0.5)

df = load_data()

# --- Saisie du jour ---
st.header("Entrée du jour")
c1, c2, c3, c4 = st.columns(4)

with c1:
    d = st.date_input("Date", value=date.today())
    phase = st.selectbox("Phase", ["Phase 1 (22/02–18/04)", "Phase 2 (29/04–10/06)"])
with c2:
    weight_kg = st.number_input("Poids du matin (kg)", value=float(start_weight), step=0.1)
    kcal_in = st.number_input("Calories mangées (kcal)", value=2000, step=50)
with c3:
    mins_calis = st.number_input("Minutes calisthenics", value=30, step=5)
    mins_plyo = st.number_input("Minutes plyométrie", value=15, step=5)
with c4:
    mins_stairs = st.number_input("StairMaster (min)", value=10, step=1)
    run_km = st.number_input("Running (km)", value=0.0, step=0.5)
    run_mins = st.number_input("Running (min)", value=0.0, step=5.0)

if st.button("Ajouter / Mettre à jour la journée"):
    kcal_out_gym = (
        met_kcal(mins_calis, met_calis, weight_kg)
        + met_kcal(mins_plyo, met_plyo, weight_kg)
        + met_kcal(mins_stairs, met_stairs, weight_kg)
    )
    kcal_out_run = met_kcal(run_mins, met_running, weight_kg)
    kcal_out_total = kcal_out_gym + kcal_out_run

    # Hypothèse: ton TDEE n'inclut pas l'exercice saisi ci-dessus.
    deficit = (tdee - kcal_in) + kcal_out_total
    row = {
        "date": d,
        "phase": phase,
        "weight_kg": weight_kg,
        "kcal_in": kcal_in,
        "mins_calis": mins_calis,
        "mins_plyo": mins_plyo,
        "mins_stairs": mins_stairs,
        "run_km": run_km,
        "run_mins": run_mins,
        "kcal_out_gym": round(kcal_out_gym, 0),
        "kcal_out_run": round(kcal_out_run, 0),
        "kcal_out_total": round(kcal_out_total, 0),
        "tdee": tdee,
        "deficit": round(deficit, 0),
    }

    # Upsert par date
    df = df[df["date"] != d]
    df = pd.concat([df, pd.DataFrame([row])], ignore_index=True)
    df = df.sort_values("date").reset_index(drop=True)

    # Cumul + estimation poids
    df["deficit_cum"] = df["deficit"].cumsum()
    df["weight_est"] = float(start_weight) - (df["deficit_cum"] / KCAL_PER_KG)

    # Projection sur la date cible selon la moyenne du déficit 7 derniers jours
    df["deficit_7d_avg"] = df["deficit"].rolling(7, min_periods=1).mean()
    last_def7 = float(df.iloc[-1]["deficit_7d_avg"])
    days_left = (target_date - df.iloc[-1]["date"]).days
    proj = float(df.iloc[-1]["weight_est"]) - (last_def7 * max(days_left, 0) / KCAL_PER_KG)
    df.loc[df.index[-1], "proj_weight_19apr"] = round(proj, 2)

    df.to_csv(DATA_FILE, index=False)
    st.success("Enregistré.")

st.header("Historique & export")
st.dataframe(df, use_container_width=True)

csv_bytes = df.to_csv(index=False).encode("utf-8")
st.download_button(
    label="Télécharger CSV",
    data=csv_bytes,
    file_name="tracking.csv",
    mime="text/csv",
)
