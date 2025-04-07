from flask import Flask, render_template, request, jsonify
import pandas as pd
import plotly.express as px

app = Flask(__name__)

# ------------------------------------------------------------------
# 1.  CONFIG: list your datasets and their datetime column names
# ------------------------------------------------------------------
DATASET_CONFIG = {
    "congestion":  {"file": "data/ucongestion.csv",  "dt_col": "Toll 10 Minute Block"},
    "collisions":  {"file": "data/ucollisions.csv",  "dt_col": "CRASH DATE"},
    "complaints":        {"file": "data/ucomplaints.csv",        "dt_col": "Created Date"},
    "construction":      {"file": "data/uconstruction.csv",      "dt_col": "WORK_START_DATE"},
    "air_quality":      {"file": "data/uair.csv",      "dt_col": "ObservationTimeUTC"},
    "citibike":      {"file": "data/ucitibikes.csv",      "dt_col": "started_at"},
}

# ------------------------------------------------------------------
# 2.  LOAD EACH CSV ONCE  ------------------------------------------
# ------------------------------------------------------------------
DATASETS = {}
for key, cfg in DATASET_CONFIG.items():
    df = pd.read_csv(cfg["file"]).rename(columns={cfg["dt_col"]: "timestamp"})
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    DATASETS[key] = df.dropna(subset=["timestamp", "dlatitude", "dlongitude"])

# ------------------------------------------------------------------
# 3.  HOME PAGE  ----------------------------------------------------
# ------------------------------------------------------------------
@app.route("/")
def index():
    dataset_keys=list(DATASETS.keys())
    return render_template("index3.html", dataset_keys=dataset_keys)

# ------------------------------------------------------------------
# 4.  GENERIC HEAT‑MAP ROUTE  --------------------------------------
# ------------------------------------------------------------------
@app.route("/callback/heatmap")

def heatmap():
    ds_key   = request.args.get("dataset")
    print(ds_key)
    date_str = request.args.get("date")            # YYYY‑MM‑DD
    hour_str = request.args.get("hour", "all")     # "all" or 0‑23
    interval = request.args.get("interval", "10min")

    if ds_key not in DATASETS:
        ds_key = "congestion"
        #return jsonify({"error": f"unknown dataset '{ds_key}'"}), 400
    if not date_str:
        return jsonify({"error": "date is required"}), 400

    df = DATASETS[ds_key]
    print(f"📅 hello: {len(df)} rows")
    selected_date = pd.to_datetime(date_str).date()
    df = df[df["timestamp"].dt.date == selected_date]
    
    print(f"📅 Filtered by date ({selected_date}): {len(df)} rows")

    if hour_str != "all":
        df = df[df["timestamp"].dt.hour == int(hour_str)]

    minute = df["timestamp"].dt.minute
    if interval == "30min":
        df = df[minute % 30 == 0]
    elif interval == "1h":
        df = df[minute == 0]

    if df.empty:
        return jsonify({"data": [], "layout": {"title": "No data"}})
    
    if ds_key == "congestion": 
        grouped = df.groupby(["dlatitude", "dlongitude"])['value'].sum().reset_index(name="count")
        fig = px.density_mapbox(
            grouped,          # use the grouped DataFrame
            lat="dlatitude",
            lon="dlongitude",
            z="count",        # use the 'count' column as the weight
            radius=25,
            center=dict(lat=40.7128, lon=-74.0060),
            zoom=10,
            mapbox_style="open-street-map",
            title=f"{ds_key} – {date_str} {hour_str}",
            range_color = [0,1500]
        )
    else:
        fig = px.density_mapbox(
            df,          # use the grouped DataFrame
            lat="dlatitude",
            lon="dlongitude",
            z="value",        # use the 'count' column as the weight
            radius=25,
            center=dict(lat=40.7128, lon=-74.0060),
            zoom=10,
            mapbox_style="open-street-map",
            title=f"{ds_key} – {date_str} {hour_str}",
            range_color = [0,500]
        )
        
    try:
        return fig.to_json()
        #return jsonify(fig.to_dict())
    except Exception as e:
        print("Error in jsonify:", e)
        return fig.to_json()
    

# ------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)