// Global variable to track the current timestamp
let currentTimestamp = null;

// =====================================================================
//  UI INITIALISATION
// =====================================================================
window.addEventListener("DOMContentLoaded", () => {
    // Populate hour dropdowns for Start Hour and End Hour (0‑23)
    const startHourSel = document.getElementById("startHour");
    const endHourSel = document.getElementById("endHour");
    for (let h = 0; h < 24; h++) {
      const opt1 = document.createElement("option");
      opt1.value = h;
      opt1.textContent = `${h}:00`;
      startHourSel.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = h;
      opt2.textContent = `${h}:00`;
      endHourSel.appendChild(opt2);
    }
  
    // Set default dates (optional)
    document.getElementById("startDate").value = "2025-03-29";
    document.getElementById("endDate").value = "2025-03-30";
  
    // Initialize the current timestamp using Start Date and Start Hour
    resetCurrentTimestamp();
  
    // Auto‑load on page load
    fetchHeatmaps();
});
  
// =====================================================================
//  HELPER: Reset the current timestamp from the start date and hour
// =====================================================================
function resetCurrentTimestamp() {
    const startDate = document.getElementById("startDate").value;
    let startHour = document.getElementById("startHour").value;
    if (!startDate) {
      alert("Please select a Start Date");
      return;
    }
    // If "all" is selected, default to 00 hour
    if (startHour === "all") {
      startHour = "00";
    } else {
      // Pad single-digit hours with a leading zero
      startHour = startHour.toString().padStart(2, "0");
    }
    // Set the currentTimestamp at the start (minute defaults to 00)
    currentTimestamp = new Date(`${startDate}T${startHour}:00:00`);
}
  
// =====================================================================
//  MAIN FETCH HANDLER: fetch data and render three heatmaps using currentTimestamp
// =====================================================================
async function fetchHeatmaps() {
    if (!currentTimestamp) {
      alert("Current timestamp is not set.");
      return;
    }
  
    const dataset   = document.getElementById("dataset").value;
    const interval  = document.getElementById("interval").value;
    const endDate   = document.getElementById("endDate").value;
    const endHour   = document.getElementById("endHour").value;
  
    // Format current timestamp parts including minutes
    const currentDate = currentTimestamp.toISOString().split("T")[0];
    const currentHour = currentTimestamp.getHours();
    const currentMinutes = currentTimestamp.getMinutes();
    const timeStr = `${currentHour}:${currentMinutes.toString().padStart(2, "0")}`;
  
    console.log("📅 Current time:", { currentDate, currentHour, currentMinutes, dataset, interval });
  
    // Build query string using currentTimestamp (including minute parameter)
    const qs  = `?dataset=${dataset}&date=${currentDate}&hour=${currentHour}&minute=${currentMinutes}&endDate=${endDate}&endHour=${endHour}&interval=${interval}`;
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
  
      // Draw the same heatmap into three separate containers
      drawPlot("heatmap1", fig);
      drawPlot("heatmap2", fig);
      drawPlot("heatmap3", fig);
  
      // Update the chart title with the full time (including minutes)
      document.getElementById("chartTitle").textContent = `Heatmaps – ${dataset} on ${currentDate} at ${timeStr}`;
  
    } catch (err) {
      console.error("🔥 Fetch error:", err);
      alert("Failed to fetch data");
    }
}
  
// =====================================================================
//  NEXT BUTTON HANDLER: increment currentTimestamp by the selected interval
// =====================================================================
function handleNext() {
    const interval = document.getElementById("interval").value;
    let minutesToAdd = 0;
    if (interval === "10min") {
        minutesToAdd = 10;
    } else if (interval === "30min") {
        minutesToAdd = 30;
    } else if (interval === "1h") {
        minutesToAdd = 60;
    }
  
    // Increment the currentTimestamp by the calculated minutes
    currentTimestamp = new Date(currentTimestamp.getTime() + minutesToAdd * 60 * 1000);
  
    // Optionally, check if currentTimestamp exceeds the end date/time
    const endDate = document.getElementById("endDate").value;
    let endHour = document.getElementById("endHour").value;
    if (endHour === "all") {
      endHour = "00";
    } else {
      endHour = endHour.toString().padStart(2, "0");
    }
    const endTimestamp = new Date(`${endDate}T${endHour}:00:00`);
    if (currentTimestamp > endTimestamp) {
         alert("Reached the end of the range.");
         currentTimestamp = endTimestamp; // Clamp to the end time
    }
  
    // Fetch heatmaps for the new currentTimestamp
    fetchHeatmaps();
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
//  BUTTON HANDLERS
// =====================================================================
// Apply Filter button resets the current time and fetches data
document.getElementById("applyBtn").addEventListener("click", () => {
    resetCurrentTimestamp();
    fetchHeatmaps();
});
  
// Next button advances currentTimestamp by the interval
document.getElementById("nextBtn").addEventListener("click", handleNext);