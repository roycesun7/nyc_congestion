// ----------------------  UI INITIALISATION  ------------------------------
window.addEventListener("DOMContentLoaded", () => {
    // populate hour dropdown (0‑23)
    const hourSel = document.getElementById("hour");
    for (let h = 0; h < 24; h++) {
      const opt = document.createElement("option");
      opt.value = h;
      opt.textContent = `${h}:00`;
      hourSel.appendChild(opt);
    }
  
    // auto‑load default data on first page load
    fetchAll();
  });
  document.getElementById("date").value = "2025-03-29";
  
  // ----------------------  MAIN FETCH HANDLER  ------------------------------
  async function fetchAll() {
    const date     = document.getElementById("date").value;
    const hour     = document.getElementById("hour").value;
    const interval = document.getElementById("interval").value;
  
    // 🔍  LOG selected filter values
    console.log("📅 Selected filters:", { date, hour, interval });
  
    if (!date) {
      alert("Pick a date first"); 
      return;
    }
  
    // build common query‑string
    const qs = `?date=${date}&hour=${hour}&interval=${interval}`;
  
    try {
      // run API calls in parallel
      const [heatRes, lineRes] = await Promise.all([
        fetch("/callback/getFiltered"   + qs),
        fetch("/callback/getCongestionData" + qs)
      ]);
  
      const heatJSON = await heatRes.text();
      const lineJSON = await lineRes.text();
  
      // 🔍  LOG raw JSON returned
      console.log("🌡️  Heatmap JSON:", heatJSON.slice(0, 200) + "…");
      console.log("📈  Line JSON:",    lineJSON.slice(0, 200)  + "…");
  
      drawPlot("heatmap",  JSON.parse(heatJSON));
      drawPlot("lineChart", JSON.parse(lineJSON));
  
    } catch (err) {
      console.error("🔥 Fetch error:", err);
      alert("Failed to fetch data");
    }
  }
  
  // ----------------------  PLOT HELPER  -------------------------------------
  function drawPlot(divId, fig) {
    if (!fig.data || fig.data.length === 0) {
      document.getElementById(divId).innerHTML = "<p class='text-muted'>No data for this range.</p>";
      return;
    }
    Plotly.newPlot(divId, fig.data, fig.layout || {}, {responsive:true});
  }
  
  // ----------------------  BUTTON HANDLER  ----------------------------------
  document.getElementById("applyBtn").addEventListener("click", fetchAll);
  