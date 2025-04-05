// =====================================================================
//  UI INITIALISATION
// =====================================================================
window.addEventListener("DOMContentLoaded", () => {
    // populate hour dropdown (0‑23)
    const hourSel = document.getElementById("hour");
    for (let h = 0; h < 24; h++) {
      const opt = document.createElement("option");
      opt.value = h;
      opt.textContent = `${h}:00`;
      hourSel.appendChild(opt);
    }
  
    // default date (optional)
    document.getElementById("date").value = "2025-03-29";
  
    // auto‑load once
    fetchHeatmap();
  });
  
  // =====================================================================
  //  MAIN FETCH HANDLER
  // =====================================================================
  async function fetchHeatmap() {
    const date      = document.getElementById("date").value;
    const hour      = document.getElementById("hour").value;
    const interval  = document.getElementById("interval").value;
    const dataset   = document.getElementById("dataset").value;   // new selector
  
    console.log("📅 Selected filters:", { date, hour, interval, dataset });
  
    if (!date) { alert("Pick a date first"); return; }
  
    const qs  = `?dataset=${dataset}&date=${date}&hour=${hour}&interval=${interval}`;
    const url = "/callback/heatmap" + qs;
  
    try {
      const res  = await fetch(url);
      if (!res.ok) {
        const txt = await res.text();
        console.error("Server error", res.status, txt.slice(0, 200));
        alert("Server error " + res.status);
        return;
      }
  
      const fig = await res.json();
      console.log("🌡️  Heatmap JSON:", fig);
  
      drawPlot("heatmap", fig);
      document.getElementById("chartTitle").textContent = `Heatmap – ${dataset}`;
  
    } catch (err) {
      console.error("🔥 Fetch error:", err);
      alert("Failed to fetch data");
    }
  }
  
  // =====================================================================
  //  PLOT HELPER
  // =====================================================================
  function drawPlot(divId, fig) {
    const div = document.getElementById(divId);
    if (!fig.data || fig.data.length === 0) {
      div.innerHTML = "<p class='text-muted'>No data for this range.</p>";
      return;
    }
    Plotly.newPlot(divId, fig.data, fig.layout || {}, { responsive: true });
  }
  
  // =====================================================================
  //  BUTTON HANDLER
  // =====================================================================
  document.getElementById("applyBtn").addEventListener("click", fetchHeatmap);
  