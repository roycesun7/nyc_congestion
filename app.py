from flask import Flask, render_template, request, jsonify
import pandas as pd
import plotly.express as px
from datetime import datetime, timedelta

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index3.html')

@app.route('/callback/getStaticData')
def get_static_data():
    try:
        # Read query params
        date_str = request.args.get("date")         # e.g., "2025-04-04"
        hour = int(request.args.get("hour", 0))     # e.g., 14
        interval = int(request.args.get("interval", 60))  # in minutes

        # Parse datetime bounds
        start_dt = datetime.strptime(date_str, "%Y-%m-%d") + timedelta(hours=hour)
        end_dt = start_dt + timedelta(minutes=interval)

        # Load dataset
        df = pd.read_csv("static_data.csv")  # adjust path as needed

        # Convert to datetime
        df["timestamp"] = pd.to_datetime(df["timestamp"])

        # Filter
        mask = (df["timestamp"] >= start_dt) & (df["timestamp"] <= end_dt)
        filtered = df.loc[mask].copy()

        if filtered.empty:
            return jsonify({"data": [], "layout": {"title": "No data in selected range"}})

        # Create plot
        fig = px.line(
            filtered,
            x="timestamp",
            y="Open",  # or adjust to another column
            title=f"Data from {start_dt.strftime('%Y-%m-%d %H:%M')} to {end_dt.strftime('%H:%M')}",
            template="plotly_white",
        )

        return fig.to_json()

    except Exception as e:
        return jsonify({"error": str(e)})
    

@app.route('/callback/heatmap')
def heatmap():
    return heatmap_graph()

def heatmap_graph():
    df_map = pd.DataFrame({
        'lat': [40.7128, 40.730610],
        'lon': [-74.0060, -73.935242],
        'value': [1, 1]
    })

    fig = px.density_mapbox(
        df_map,
        lat='lat',
        lon='lon',
        z='value',
        radius=30,
        center={"lat": 40.7128, "lon": -74.0060},
        zoom=10,
        mapbox_style="open-street-map",
        title="Heatmap of New York"
    )

    return fig.to_json()


if __name__ == "__main__":
    app.run(debug=True)
