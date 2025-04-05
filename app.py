from flask import Flask, render_template, request, jsonify
import pandas as pd
import plotly.express as px

app = Flask(__name__)

# ------------------------------------------------------------------
# 1.  CONFIG: list your datasets and their datetime column names
# ------------------------------------------------------------------
DATASET_CONFIG = {
    "congestion":  {"file": "data/congestion.csv",  "dt_col": "Toll 10 Minute Block"},
    # "collisions":  {"file": "data/collisions.csv",  "dt_col": "timestamp"},
    # "complaints":        {"file": "data/complaints.csv",        "dt_col": "pickup_datetime"},
    # "construction":      {"file": "data/construction.csv",      "dt_col": "time"},
    # "air_quality":      {"file": "data/air_quality.csv",      "dt_col": "time"},
    # "citibike":      {"file": "data/citibike.csv",      "dt_col": "time"},
}

# ------------------------------------------------------------------
# 2.  LOAD EACH CSV ONCE  ------------------------------------------
# ------------------------------------------------------------------
DATASETS = {}
for key, cfg in DATASET_CONFIG.items():
    df = pd.read_csv(cfg["file"]).rename(columns={cfg["dt_col"]: "timestamp"})
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    DATASETS[key] = df.dropna(subset=["timestamp", "Latitude", "Longitude"])

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
    
    #HIIIII
    grouped = df.groupby(["Latitude", "Longitude"]).size().reset_index(name="count")
    counts_dict = grouped.to_dict(orient="records")
    print("Counts dictionary:", counts_dict)
    
    fig = px.density_mapbox(
        df,
        lat="Latitude",
        lon="Longitude",
        z=None,                 # or a weight column if present
        radius=25,
        center=dict(lat=40.7128, lon=-74.0060),
        zoom=10,
        mapbox_style="open-street-map",
        title=f"{ds_key} – {date_str} {hour_str}"
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



# from flask import Flask, render_template, request, jsonify
# import pandas as pd
# import plotly.express as px
# from datetime import datetime, timedelta
# import json

# app = Flask(__name__)
# df = pd.read_csv("congestion.csv", parse_dates=["Toll Date", "Toll Hour", "Toll 10 Minute Block"])

# @app.route('/')
# def index():
#     return render_template('index3.html')

# @app.route('/callback/getCongestionData')
# def get_static_data():
#     try:
#         # Read query params
#         date_str = request.args.get("date")         # e.g., "2025-04-04"
#         hour = int(request.args.get("hour", 0))     # e.g., 14
#         interval = int(request.args.get("interval", 60))  # in minutes

#         # Parse datetime bounds
#         start_dt = datetime.strptime(date_str, "%Y-%m-%d") + timedelta(hours=hour)
#         end_dt = start_dt + timedelta(minutes=interval)

#         # Load dataset
#         df = pd.read_csv("congestion.csv", parse_dates=["Toll Date", "Toll Hour", "Toll 10 Minute Block"])
#         df["timestamp"] = pd.to_datetime(df["timestamp"])

#         # Filter
#         mask = (df["timestamp"] >= start_dt) & (df["timestamp"] <= end_dt)
#         filtered = df.loc[mask].copy()

#         if filtered.empty:
#             return jsonify({"data": [], "layout": {"title": "No data in selected range"}})

#         # Create plot
#         fig = px.line(
#             filtered,
#             x="timestamp",
#             y="Open",  # or adjust to another column
#             title=f"Data from {start_dt.strftime('%Y-%m-%d %H:%M')} to {end_dt.strftime('%H:%M')}",
#             template="plotly_white",
#         )

#         return fig.to_json()

#     except Exception as e:
#         return jsonify({"error": str(e)})
    

# @app.route('/callback/heatmap')
# def heatmap():
#     return heatmap_graph()

# def heatmap_graph():
#     df_map = pd.DataFrame({
#         'lat': [40.7128, 40.730610],
#         'lon': [-74.0060, -73.935242],
#         'value': [1, 1]
#     })

#     fig = px.density_mapbox(
#         df_map,
#         lat='lat',
#         lon='lon',
#         z='value',
#         radius=30,
#         center={"lat": 40.7128, "lon": -74.0060},
#         zoom=10,
#         mapbox_style="open-street-map",
#         title="Heatmap of New York"
#     )

#     return fig.to_json()


# @app.route("/callback/getFiltered")
# def get_filtered():
#     selected_date = request.args.get("date")
#     selected_hour = request.args.get("hour")
#     interval = request.args.get("interval")

#     if not selected_date:
#         return jsonify({"error": "Missing date"}), 400

#     filtered = df[df["Toll Date"] == pd.to_datetime(selected_date)]

#     if selected_hour and selected_hour != "all":
#         filtered = filtered[filtered["Hour of Day"] == int(selected_hour)]

#     # Optional: finer time filtering
#     if interval == "10min":
#         pass  # Already fine-grained
#     elif interval == "30min":
#         filtered = filtered[filtered["Minute of Hour"] % 30 == 0]
#     elif interval == "1h":
#         filtered = filtered[filtered["Minute of Hour"] == 0]

#     if filtered.empty:
#         return jsonify({"data": [], "layout": {"title": "No Data"}})

#     fig = px.density_mapbox(
#         filtered,
#         lat="Latitude",
#         lon="Longitude",
#         z="CRZ Entries",
#         radius=30,
#         center={"lat": 40.7128, "lon": -74.0060},
#         zoom=10,
#         mapbox_style="open-street-map",
#         title="Heatmap of Vehicle Entries"
#     )

#     return jsonify(json.loads(fig.to_json()))



# if __name__ == "__main__":
#     app.run(debug=True)



# @app.route('/callback/vehicle_collisions')
# def vehicle_collisions():
#     try:
#         date_str = request.args.get("date")  # Expected format: "YYYY-MM-DD"
#         hour = int(request.args.get("hour", 0))  # Default to 0 if not provided
#         interval = int(request.args.get("interval", 60))  # Interval in minutes
        
#         # Parse start and end datetime based on the inputs
#         start_dt = datetime.strptime(date_str, "%Y-%m-%d") + timedelta(hours=hour)
#         end_dt = start_dt + timedelta(minutes=interval)
    
#         df = pd.read_csv("vehicle_collisions.csv")
#         df["timestamp"] = pd.to_datetime(df["timestamp"])
        
#         # Filter data within the specified time window
#         mask = (df["timestamp"] >= start_dt) & (df["timestamp"] < end_dt)
#         filtered = df.loc[mask].copy()
        
#         if filtered.empty:
#             return jsonify({"data": [], "layout": {"title": "No vehicle collisions in selected range"}})
        
#         # Optional: Aggregate data by resampling based on the interval.
#         # This is useful if you want to show the number of collisions per time bucket.
#         filtered.set_index("timestamp", inplace=True)
#         # For example, to count collisions in each interval, you could use:
#         aggregated = filtered.resample(f'{interval}T').size().reset_index(name='collision_count')
        
#         # Create a map visualization using Plotly Express:
#         # Use the raw filtered data to plot each collision, or use aggregated data if you want to display counts.
#         fig = px.scatter_mapbox(
#             filtered.reset_index(),  # reset index so 'timestamp' becomes a column again
#             lat="latitude", 
#             lon="longitude", 
#             hover_data=["timestamp"],  # Show time info on hover
#             color_discrete_sequence=["red"],
#             zoom=10,
#             mapbox_style="open-street-map",
#             title=f"Vehicle Collisions from {start_dt.strftime('%Y-%m-%d %H:%M')} to {end_dt.strftime('%H:%M')}"
#         )
        
#         return fig.to_json()
    
#     except Exception as e:
#         return jsonify({"error": str(e)})



# if __name__ == "__main__":
#     app.run(debug=True)
