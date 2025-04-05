// =====================================================================
//  UI INITIALIZATION
// =====================================================================
window.addEventListener("DOMContentLoaded", () => {
    // Populate startHour and endHour dropdowns
    const startHourSel = document.getElementById("startHour");
    const endHourSel = document.getElementById("endHour");
  
    for (let h = 0; h < 24; h++) {
      const label = `${h.toString().padStart(2, "0")}:00`;
  
      const opt1 = document.createElement("option");
      opt1.value = h;
      opt1.textContent = label;
      startHourSel.appendChild(opt1);
  
      const opt2 = document.createElement("option");
      opt2.value = h;
      opt2.textContent = label;
      endHourSel.appendChild(opt2);
    }
  
    // Set default date
    document.getElementById("startDate").value = "2025-03-29";
    document.getElementById("endDate").value = "2025-03-30";
  
    // Set up event listeners
    document.getElementById("applyBtn").addEventListener("click", fetchHeatmap);
    document.getElementById("nextBtn").addEventListener("click", advanceTime);
  
    // Initial load
    fetchHeatmap();
  });
  
  // =====================================================================
  //  MAIN FETCH HANDLER
  // =====================================================================
  async function fetchHeatmap() {
    const startDate = document.getElementById("startDate").value;
    const startHour = document.getElementById("startHour").value;
    const interval = document.getElementById("interval").value;
    const dataset = document.getElementById("dataset").value;
  
    console.log("📅 Selected filters:", { startDate, startHour, interval, dataset });
  
    if (!startDate) {
      alert("Pick a date first");
      return;
    }
  
    const qs = `?dataset=${dataset}&date=${startDate}&hour=${startHour}&interval=${interval}`;
    const url = "/callback/heatmap" + qs;
  
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const txt = await res.text();
        console.error("Server error", res.status, txt.slice(0, 200));
        alert("Server error " + res.status);
        return;
      }
  
      const fig = await res.json();
      console.log("🌡️  Heatmap JSON:", fig);
  
      // Draw into all 3 heatmap divs
      drawPlot("heatmap1", fig);
      drawPlot("heatmap2", fig);
      drawPlot("heatmap3", fig);
  
      document.getElementById("chartTitle").textContent = `Heatmaps – ${dataset} on ${startDate} at ${startHour}:00`;
    } catch (err) {
      console.error("🔥 Fetch error:", err);
      alert("Failed to fetch data");
    }
  }
  
  // =====================================================================
  //  NEXT BUTTON: Advance time by interval
  // =====================================================================
  function advanceTime() {
    const startDateEl = document.getElementById("startDate");
    const startHourEl = document.getElementById("startHour");
    const intervalVal = document.getElementById("interval").value;
  
    let startDate = new Date(startDateEl.value);
    let hour = startHourEl.value === "all" ? 0 : parseInt(startHourEl.value);
    startDate.setHours(hour);
  
    // Add interval
    let stepMinutes = 10;
    if (intervalVal === "30min") stepMinutes = 30;
    else if (intervalVal === "1h") stepMinutes = 60;
  
    startDate.setMinutes(startDate.getMinutes() + stepMinutes);
  
    // Update form inputs
    const yyyy = startDate.getFullYear();
    const mm = String(startDate.getMonth() + 1).padStart(2, "0");
    const dd = String(startDate.getDate()).padStart(2, "0");
    const hh = startDate.getHours();
  
    startDateEl.value = `${yyyy}-${mm}-${dd}`;
    startHourEl.value = hh;
  
    // Re-fetch
    fetchHeatmap();
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
  