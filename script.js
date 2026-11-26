console.log("F1 PIT WALL — Full Strategy Integration Ready!");

// 1. Compound Specifications (baseTime in seconds)
const tyreCompounds = {
    SOFT: { wearRate: 12, baseTime: 73.6, label: "S · COMPOUND", textClass: "soft-text" },
    MEDIUM: { wearRate: 8, baseTime: 74.3, label: "M · COMPOUND", textClass: "medium-text" },
    HARD: { wearRate: 5, baseTime: 75.0, label: "H · COMPOUND", textClass: "hard-text" }
};

// 2. Race State
const raceState = {
    currentLap: 1,
    totalLaps: 50,
    tyre: "MEDIUM",
    selectedTyre: "MEDIUM",
    tyreWear: 0,
    pitStops: 0,
    bestLap: 74.320,
    lastLap: 74.320,
    gapToP2: 2.450
};

// 3. Connect to Dashboard Elements
const lapValue = document.getElementById("lapValue");
const tyreValue = document.getElementById("tyreValue");
const tyreSubtext = document.getElementById("tyreSubtext");
const wearValue = document.getElementById("wearValue");
const wearFill = document.getElementById("wearFill");
const wearCondition = document.getElementById("wearCondition");
const bestLapValue = document.getElementById("bestLapValue");
const lapPaceNote = document.getElementById("lapPaceNote");
const gapValue = document.getElementById("gapValue");
const nextLapButton = document.getElementById("nextLapButton");
const pitButton = document.getElementById("pitButton");
const raceStatus = document.querySelector(".race-status");
const tyreOptions = document.querySelectorAll(".tyre-option");
const strategyTag = document.querySelector(".strategy-tag");
const oneStopCard = document.getElementById("oneStopCard");
const twoStopCard = document.getElementById("twoStopCard");
const oneStopStatus = document.getElementById("oneStopStatus");
const twoStopStatus = document.getElementById("twoStopStatus");

// Format seconds into M:SS.mmm (e.g., 74.32 -> "1:14.320")
function formatLapTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3).padStart(6, "0");
    return `${mins}:${secs}`;
}

// 4. Update Dashboard Display
function updateDashboard() {
    const formattedLap = String(raceState.currentLap).padStart(2, "0");
    lapValue.innerHTML = `${formattedLap} <span>/ ${raceState.totalLaps}</span>`;

    // Tyre & Compound
    const currentSpec = tyreCompounds[raceState.tyre];
    tyreValue.textContent = raceState.tyre;
    tyreSubtext.textContent = currentSpec.label;
    tyreSubtext.className = currentSpec.textClass;

    // Tyre Wear & Alert States
    wearValue.textContent = raceState.tyreWear + "%";
    wearFill.style.width = raceState.tyreWear + "%";

    if (raceState.tyreWear < 40) {
        wearFill.style.background = "#20cf80";
        wearCondition.textContent = "Tyre condition: Good";
        wearCondition.className = "";
        raceStatus.classList.remove("critical-alert");
        raceStatus.innerHTML = `<span class="online-dot"></span>SIMULATION ACTIVE`;
    } else if (raceState.tyreWear < 75) {
        wearFill.style.background = "#ffd45c";
        wearCondition.textContent = "Tyre condition: Warning";
        wearCondition.className = "status-warning";
        raceStatus.classList.remove("critical-alert");
        raceStatus.innerHTML = `<span class="online-dot"></span>TYRE WEAR WARNING`;
    } else {
        wearFill.style.background = "#e52b35";
        wearCondition.textContent = "Tyre condition: Critical — BOX NOW";
        wearCondition.className = "status-critical";
        raceStatus.classList.add("critical-alert");
        raceStatus.innerHTML = `<span class="online-dot"></span>CRITICAL: BOX THIS LAP`;
    }

    // Lap Times & Gap to P2
    bestLapValue.textContent = formatLapTime(raceState.bestLap);
    lapPaceNote.textContent = `Last lap: ${formatLapTime(raceState.lastLap)}`;

    const sign = raceState.gapToP2 >= 0 ? "+" : "";
    gapValue.textContent = `${sign}${raceState.gapToP2.toFixed(3)}s`;
    gapValue.style.color = raceState.gapToP2 >= 0 ? "#20cf80" : "#e52b35";

    // Highlight active pit strategy plan
    oneStopCard.classList.toggle("active-plan", raceState.pitStops <= 1);
    twoStopCard.classList.toggle("active-plan", raceState.pitStops >= 2);

    if (raceState.pitStops === 0) {
        oneStopStatus.textContent = "Active pace · Pit around Lap 25 for Hard tyres";
    } else if (raceState.pitStops === 1) {
        oneStopStatus.textContent = "EXECUTING 1-STOP · Manage tyres to Lap 50";
    } else {
        twoStopStatus.textContent = `EXECUTING ${raceState.pitStops}-STOP · Push hard to recover pit loss`;
    }

    // Race Finish Check
    if (raceState.currentLap >= raceState.totalLaps) {
        nextLapButton.textContent = "RACE FINISHED";
        nextLapButton.disabled = true;
        pitButton.disabled = true;
        const resultText = raceState.gapToP2 >= 0 ? "P1 VICTORY!" : "FINISHED BEHIND P2";
        strategyTag.textContent = `${resultText} (${raceState.pitStops} STOPS)`;
    }
}

// 5. Select Tyre Compound
tyreOptions.forEach(function (option) {
    option.addEventListener("click", function () {
        tyreOptions.forEach(function (item) {
            item.classList.remove("selected");
        });
        this.classList.add("selected");
        raceState.selectedTyre = this.getAttribute("data-tyre");
        strategyTag.textContent = `NEXT TYRE: ${raceState.selectedTyre}`;
    });
});

// 6. Next Lap Button Logic
nextLapButton.addEventListener("click", function () {
    if (raceState.currentLap < raceState.totalLaps) {
        raceState.currentLap++;

        const spec = tyreCompounds[raceState.tyre];
        const wearPenalty = (raceState.tyreWear / 100) * 2.5;
        raceState.lastLap = spec.baseTime + wearPenalty;

        if (raceState.lastLap < raceState.bestLap) {
            raceState.bestLap = raceState.lastLap;
        }

        raceState.gapToP2 += (74.5 - raceState.lastLap);
        raceState.tyreWear = Math.min(100, raceState.tyreWear + spec.wearRate);
        updateDashboard();
    }
});

// 7. Pit Stop Button Logic
pitButton.addEventListener("click", function () {
    if (raceState.currentLap < raceState.totalLaps) {
        raceState.currentLap++;
        raceState.tyre = raceState.selectedTyre;
        raceState.tyreWear = 0;
        raceState.pitStops++;

        raceState.gapToP2 -= 22.0;
        raceState.lastLap = tyreCompounds[raceState.tyre].baseTime + 22.0;

        strategyTag.textContent = `BOXED · ${raceState.pitStops} STOP(S)`;
        updateDashboard();
    }
});

// 8. Sidebar Navigation
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        navLinks.forEach(function (item) {
            item.classList.remove("active");
        });
        this.classList.add("active");
    });
});

// Initialize dashboard
updateDashboard();
