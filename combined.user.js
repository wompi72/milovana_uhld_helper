// ==UserScript==
// @name        Milovana: Combination of both Ultimate Hentai Lottery of Denial
// @namespace   Violentmonkey Scripts
// @match       https://milovana.com/webteases/showtease.php?id=41749*
// @match       https://milovana.com/webteases/showtease.php?id=37913*
// @grant       none
// @version     1.0
// @author      -
// @description All help utilities and stat tracking for both versions of Ultimate Hentai Lottery of Denial on Milovana.com. It combines both teases into one, with redirecting automatically.
// ==/UserScript==


(function () {
    // START SCRIPT DIFFERENCE BETWEEN 1 and 2: 33333333333333333333333333333333333333
    const STORAGE_PREFIX = 'hentai_denial_combined_';
    const PANEL_TITLE = "Hentai Denial Helper Combi ";
    const BASE_URL = "https://milovana.com/webteases/showtease.php?id=41749";
    const PAGES_START = 3;
    const PAGES_END =  113 + (206 - 4) + 1; // Tease1End + (Tease2End - Tease1Start) + 1 (so that start from Tease1Can be reached)
    const DEFAULT_DIFFICULTY = 'Moderate';

    const DIFFICULTY_CONSTS = {
        Weak: {
            CHASTITY_MAX_DEFAULT: 5,
            PAUSE_AFTER_EDGE: 50,
            PAUSE_AFTER_UNAUTHORIZED_EDGE: 60,
            PAGES_UNTIL_PAUSE: 4,
            PAUSE_DURATION_HOURS: 12,
            PENALTY_FOR_RO: "MAX",
            POINTS_PENALTY_FOR_RO: 500,
            POINTS_PENALTY_FOR_LEAVING: 0,
            CHASTITY_PENALTY_FOR_LEAVING: 0,
        },
        Moderate: {
            CHASTITY_MAX_DEFAULT: 14,
            PAUSE_AFTER_EDGE: 40,
            PAUSE_AFTER_UNAUTHORIZED_EDGE: 40,
            PAGES_UNTIL_PAUSE: 6,
            PAUSE_DURATION_HOURS: 12,
            PENALTY_FOR_RO: "MAX",
            POINTS_PENALTY_FOR_RO: 500,
            POINTS_PENALTY_FOR_LEAVING: 150,
            CHASTITY_PENALTY_FOR_LEAVING: 7,
        },
        Hard: {
            CHASTITY_MAX_DEFAULT: 28,
            PAUSE_AFTER_EDGE: 30,
            PAUSE_AFTER_UNAUTHORIZED_EDGE: 30,
            PAGES_UNTIL_PAUSE: 8,
            PAUSE_DURATION_HOURS: 12,
            PENALTY_FOR_RO: "MAX",
            POINTS_PENALTY_FOR_RO: 500,
            POINTS_PENALTY_FOR_LEAVING: 300,
            CHASTITY_PENALTY_FOR_LEAVING: 14,
        },
        Extreme: {
            CHASTITY_MAX_DEFAULT: 50,
            PAUSE_AFTER_EDGE: 20,
            PAUSE_AFTER_UNAUTHORIZED_EDGE: 20,
            PAGES_UNTIL_PAUSE: 10,
            PAUSE_DURATION_HOURS: 12,
            PENALTY_FOR_RO: "MAX",
            POINTS_PENALTY_FOR_RO: 500,
            POINTS_PENALTY_FOR_LEAVING: 500,
            CHASTITY_PENALTY_FOR_LEAVING: 30,
        },
        Custom_Hard: {
            CHASTITY_MAX_DEFAULT: 7,
            PAUSE_AFTER_EDGE: 40,
            PAUSE_AFTER_UNAUTHORIZED_EDGE: 45,
            PAGES_UNTIL_PAUSE: 8,
            PAUSE_DURATION_HOURS: 12,
            PENALTY_FOR_RO: 1, // "Max",
            POINTS_PENALTY_FOR_RO: 500,
            POINTS_PENALTY_FOR_LEAVING: 300,
            CHASTITY_PENALTY_FOR_LEAVING: 5,
        },
    }
    // END SCRIPT DIFFERENCE BETWEEN 1 and 2: 33333333333333333333333333333333333333

    const STORAGE = {
        SESSION_ACTIVE: STORAGE_PREFIX + 'session_active',
        CURRENT_DIFFICULTY: STORAGE_PREFIX + 'current_difficulty',
        POINTS: STORAGE_PREFIX + 'points',
        EDGES: STORAGE_PREFIX + 'edges',
        UNAUTHORIZED: STORAGE_PREFIX + 'unauthorized',
        TOTAL_PAGES: STORAGE_PREFIX + 'total_pages',
        PAGES_SINCE_PAUSE: STORAGE_PREFIX + 'pages_since_pause',
        PAUSE_ACTIVE: STORAGE_PREFIX + 'pause_active',
        PAUSE_END_TIMESTAMP: STORAGE_PREFIX + 'pause_end_timestamp',
        PANEL_VISIBLE: STORAGE_PREFIX + 'panel_visible',
        CHASTITY_VALUE: `${STORAGE_PREFIX}chastity_value`,
        CHASTITY_MAX: `${STORAGE_PREFIX}chastity_max`,
        CHASTITY_EXTRA: `${STORAGE_PREFIX}chastity_extra`,
        REVISITED_SITES: `${STORAGE_PREFIX}revisited_pages`,
        GODDESS_VISITED: `${STORAGE_PREFIX}goddess_visited_count`,
        LAST_PAGE: `${STORAGE_PREFIX}last_page`,
        MODIFIERS: `${STORAGE_PREFIX}modifiers`,
        BETWEEN_SESSION_DATA: `${STORAGE_PREFIX}between_session_data`,
        METRONOME_VOLUME: `${STORAGE_PREFIX}metronome_volume`,
        RNG_MIN: `${STORAGE_PREFIX}rng_min`,
        RNG_MAX: `${STORAGE_PREFIX}rng_max`,
        METRONOME_BPM: `${STORAGE_PREFIX}metronome_bpm`,
        NOTES: `${STORAGE_PREFIX}notes`,
    };

    const currentDifficultyKey = localStorage.getItem(STORAGE.CURRENT_DIFFICULTY) || DEFAULT_DIFFICULTY;
    const CONSTS = DIFFICULTY_CONSTS[currentDifficultyKey] || DIFFICULTY_CONSTS[DEFAULT_DIFFICULTY];

    // START SCRIPT DIFFERENCE BETWEEN NORMAL AND COMBI: 33333333333333333333333333333333333333
    const TEASE_ID_OLD = 37913;
    const TEASE_ID_NEW = 41749;
    const _BASE_URL = "https://milovana.com/webteases/showtease.php?id="

    function getRandomURL() {
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        const randomPage = getRandomInt(PAGES_START, PAGES_END);

        function mapPageToTease(pageNumber) {
            let teaseId = TEASE_ID_OLD
            if (pageNumber > 113) {
                teaseId = TEASE_ID_NEW;
                pageNumber = pageNumber - 113 + 4 - 1; // - Tease1End + Tease1Start - 1 (To start at 4 instead of 5)
            }
            return [teaseId, pageNumber];
        }

        const [_teaseId, _randomNumber] = mapPageToTease(randomPage);
        return generateTeaseUrl(_randomNumber, _teaseId);
    }

    function replacePageWithAnchors(node) {
        if (!node || !(node instanceof Node)) return;
        const teaseId = getCurrentTeaseId();
        node.innerHTML = node.innerHTML.replace(/page (\d+)/g, (match, num) => {
            return `<a href="${generateTeaseUrl(num, teaseId)}">${match}</a>`;
        });
    }

    function generateTeaseUrl(pageNumber, teaseId=null) {
        let baseUrl;
        if (teaseId === null) {
            baseUrl = `${_BASE_URL}${TEASE_ID_NEW}`;
        } else {
            baseUrl = `${_BASE_URL}${teaseId}`;
        }
        return `${baseUrl}&p=${pageNumber}#t`;
    }

    let currentTeaseId = null;
    let currentPageNumber = null;

    function getCurrentTeaseId() {
        if (currentTeaseId !== null) {
            return currentTeaseId;
        }
        const match = window.location.href.match(/[?&]id=(\d+)/);
        currentTeaseId = match ? parseInt(match[1], 10) : 0;
        return currentTeaseId;
    }


    function getCurrentPageNumber() {
        if (currentPageNumber !== null) {
            return currentPageNumber;
        }
        const match = window.location.href.match(/[?&]p=(\d+)/);
        currentPageNumber = match ? parseInt(match[1], 10) : 0;
        return currentPageNumber;
    }

    function getTeaseAndPageNumber() {
        return `${getCurrentTeaseId()}_${getCurrentPageNumber()}`
    }

    function isPageReload() {
        const isVersion1 = getCurrentTeaseId() === TEASE_ID_OLD;
        const _currentPageNumber = getTeaseAndPageNumber();
        if ((isVersion1 && _currentPageNumber < 3) || _currentPageNumber < 4) {
            return true
        }
        return _currentPageNumber == localStorage.getItem(STORAGE.LAST_PAGE);
    }
    // END SCRIPT DIFFERENCE BETWEEN NORMAL AND COMBI: 33333333333333333333333333333333333333

    // === UI CSS ===
    function addCSS() {
        const style = document.createElement('style');
        style.textContent = `
      #my-extension-panel {
        position: fixed;
        bottom: 10px;
        right: 10px;
        width: 420px;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        z-index: 999999;
        font-family: sans-serif;
      }
      #my-extension-header {
        background: #f1f1f1;
        padding: 10px;
        cursor: pointer;
        font-weight: bold;
        border-bottom: 1px solid #ccc;
      }
      #my-extension-content {
        padding: 10px;
        display: block;
      }
      .stat-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        font-size: 14px;
      }
      .stat-group {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .stat-label {
        font-weight: bold;
      }
      .stat-value {
        min-width: 20px;
        text-align: right;
      }
      .stat-controls {
        display: flex;
        flex-direction: column;
      }
      .stat-controls button {
        width: 14px;
        height: 14px;
        font-size: 5px;
        line-height: 12px;
        padding: 0;
        margin: 0;
        text-align: center;
        border: 1px solid #aaa;
        border-radius: 2px;
        background-color: #f9f9f9;
        cursor: pointer;
      }
      .stat-row input {
        font-size: 12px;
        padding: 2px;
      }
      .stat-row button {
        font-size: 10px;
        height: auto;
      }
      #pause-countdown-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0,0,0,0.9);
        color: #fff;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 5rem;
        z-index: 1000000;
      }
      #pause-timer-text {
        margin-bottom: 2rem;
      }
      #pause-countdown-overlay button {
        font-size: 2rem;
        padding: 1rem 2rem;
        cursor: pointer;
      }
      .three-minute-reminder {
        position: fixed;
        bottom: 200px;
        left: 50%;
        background-color: #f00;
        color: #fff;
        padding: 10px;
        display: none;
        z-index: 99999;
        font-size: 2rem;
      }
      .fixed-element {
        position: fixed;
        bottom: 200px;
        left: 50%;
        background-color: #f00;
        color: #fff;
        padding: 10px;
        display: none;
        z-index: 99999;
        font-size: 2rem;
        transform: translateX(-50%); /* Center it horizontally */
      }
      .revisited-display {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background-color: #ffeb3b;
        font-size: 1.2rem;
        padding: 10px;
        text-align: center;
        z-index: 100000;
        display: none; /* Initially hidden */
      }

        .dictionary-display {
            position: fixed;
            top: 50px;
            right: 0;
            width: 300px;
            max-height: 400px;
            background-color: #ffffff;
            border: 1px solid #ccc;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 10px;
            overflow-y: auto;
            z-index: 100001;
            display: none; /* Initially hidden */
        }

        .dictionary-close-btn {
            position: absolute;
            top: 5px;
            right: 5px;
            background-color: #ff4d4d;
            color: #fff;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 0.8rem;
            padding: 2px 5px;
        }
      .modifier-dialog {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: #ffffff;
        border-top: 2px solid #ccc;
        box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
        padding: 15px;
        z-index: 999999;
        display: flex;
        flex-direction: column;
      }
      .rng-dialog {
        position: fixed;
        top: 0;
        right: 0;
        width: 500px;
        background-color: #ffffff;
        border-top: 2px solid #ccc;
        box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
        padding: 15px;
        z-index: 999999;
        display: flex;
        flex-direction: column;
      }

      .modifier-close-btn {
        align-self: flex-end;
        background: transparent;
        border: none;
        font-size: 1.5rem;
        font-weight: bold;
        cursor: pointer;
        color: #333;
        margin-right: 25px;
      }

      .modifier-close-btn:hover {
        color: #f44336;
      }

        .modifier-input-row {
            display: flex;
            gap: 10px; /* Space between inputs */
            margin-bottom: 15px;
        }
        .modifier-input-row > p {
            margin-top: auto;
            margin-bottom: auto;
        }

        .modifier-input {
            padding: 5px;
            font-size: 0.9rem;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        .modifier-input[type="text"] {
            flex: 1; /* Description field takes up the remaining space */
        }

        .modifier-input[type="number"] {
            width: 60px; /* Fixed size for 3-digit numbers */
        }

      .modifier-btn {
        padding: 10px;
        font-size: 0.9rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-align: center;
      }

      .modifier-submit-btn {
        align-self: flex-start;
      }

      .modifier-description {
        font-size: 0.9rem;
      }
      .modifiers-list-container {
            margin-top: 10px;
            padding: 10px;
            border: 1px solid #ccc;
            background-color: #f9f9f9;
        }

        .modifier-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 5px;
        }

        .modifier-description {
            flex: 1;
            font-size: 0.9rem;
        }

        .modifier-counter {
            width: 40px;
            text-align: center;
            font-size: 0.9rem;
        }

        .modifier-counter-btn {
            padding: 0 5px;
            font-size: 0.9rem;
            cursor: pointer;
        }

        .modifier-eye-btn {
            margin-left: 10px;
            border: none;
            background: transparent;
            font-size: 1.2rem;
            cursor: pointer;
        }

        .modifier-eye-btn:hover {
            color: #007bff;
        }
        .modifiers-list-container {
            margin-top: 10px;
            padding: 10px;
            border: 1px solid #ccc;
            background-color: #f9f9f9;
            max-height: 300px; /* Set a maximum height */
            overflow-y: auto; /* Enable vertical scrolling */
        }
        .chastity-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 1000000000000;
            color: #fff;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 30px;
        }
        
        /* End Date Styles */
        .end-date-display {
            margin-bottom: 20px;
            font-size: 20px;
        }
        
        /* Countdown Styles */
        .countdown-display {
            margin-bottom: 20px;
            font-size: 18px;
        }
        
        .countdown-display.expired {
            color: #ff4d4d;
            font-weight: bold;
        }
        
        .end-early-button {
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 5px;
            transition: background-color 0.2s ease-in-out;
        }
    `;
        document.head.appendChild(style);
    }

    function createPanel() {
        const panel = document.createElement('div');
        panel.id = 'my-extension-panel';
        const header = document.createElement('div');
        header.id = 'my-extension-header';
        const content = document.createElement('div');
        content.id = 'my-extension-content';

        const savedVisible = localStorage.getItem(STORAGE.PANEL_VISIBLE) !== 'false';
        const isVisible = savedVisible || !SessionActiveManager.is_active();

        content.style.display = isVisible ? 'block' : 'none';

        const currentDifficulty = localStorage.getItem(STORAGE.CURRENT_DIFFICULTY);
        const difficultyLabel = currentDifficulty ? ` - ${currentDifficulty}` : '';

        header.textContent = PANEL_TITLE + difficultyLabel + (isVisible ? '▼' : '▲');

        header.addEventListener('click', () => {
            const visible = content.style.display !== 'none';
            const newVisible = !visible;
            content.style.display = newVisible ? 'block' : 'none';
            header.textContent = PANEL_TITLE + difficultyLabel + (newVisible ? '▼' : '▲');
            localStorage.setItem(STORAGE.PANEL_VISIBLE, newVisible);
        });

        panel.appendChild(header);
        panel.appendChild(content);
        document.body.appendChild(panel);

        return content;
    }

    class PointsManager {
        static valueDisplay = null;

        static addRow() {
            const container = document.getElementById('my-extension-content');
            const row = document.createElement('div');
            row.className = 'stat-row';

            const label = document.createElement('span');
            label.className = 'stat-label';
            label.textContent = 'Points: ';

            this.valueDisplay = document.createElement('span');
            this.valueDisplay.className = 'stat-value points-display';
            this.valueDisplay.textContent = parseInt(localStorage.getItem(STORAGE.POINTS), 10) || 0;

            const input = document.createElement('input');
            input.type = 'number';
            input.step = '1';
            input.style.width = '60px';
            input.style.marginLeft = '10px';

            const button = document.createElement('button');
            button.textContent = 'Update';
            button.title = "Add the points from the input to your points."
            button.style.marginLeft = '5px';
            button.addEventListener('click', () => {
                const delta = parseInt(input.value, 10);
                this.changePoints(delta);
                input.value = '';
            });

            row.appendChild(label);
            row.appendChild(this.valueDisplay);
            row.appendChild(input);
            row.appendChild(button);
            row.appendChild(StorageManager.addStorageButton());
            container.appendChild(row);
        }

        static changePoints(delta) {
            if (!isNaN(delta)) {
                let currentPoints = parseInt(localStorage.getItem(STORAGE.POINTS), 10) || 0;
                currentPoints += delta;
                localStorage.setItem(STORAGE.POINTS, currentPoints);
                this.valueDisplay.textContent = currentPoints;
            }
        }
    }

    function addChastityRow() {
        const row = document.createElement('div');
        row.className = 'stat-row';

        const container = document.getElementById('my-extension-content');

        const groups = [
            {label: 'Chastity', key: STORAGE.CHASTITY_VALUE, defaultValue: 0},
            {label: 'max', key: STORAGE.CHASTITY_MAX, defaultValue: CONSTS.CHASTITY_MAX_DEFAULT},
            {label: 'extra', key: STORAGE.CHASTITY_EXTRA, defaultValue: 0},
        ];

        groups.forEach(({label, key, defaultValue}) => {
            const groupEl = document.createElement('div');
            groupEl.className = 'stat-group';

            const labelEl = document.createElement('span');
            labelEl.className = 'stat-label';
            labelEl.textContent = `${label}: `;

            const valueEl = document.createElement('span');
            valueEl.className = 'stat-value';
            let value = parseInt(localStorage.getItem(key), 10);
            if (isNaN(value)) value = defaultValue;
            valueEl.textContent = value;

            function update(newValue) {
                value = newValue;
                valueEl.textContent = value;
                localStorage.setItem(key, value);
            }

            const controls = document.createElement('div');
            controls.className = 'stat-controls';

            const btnPlus = document.createElement('button');
            btnPlus.textContent = '+';
            btnPlus.title = "Add one day."
            btnPlus.addEventListener('click', () => update(value + 1));

            const btnMinus = document.createElement('button');
            btnMinus.textContent = '−';
            btnPlus.title = "Remove one day"
            btnMinus.addEventListener('click', () => update(value - 1));

            controls.appendChild(btnPlus);
            controls.appendChild(btnMinus);

            groupEl.appendChild(labelEl);
            groupEl.appendChild(valueEl);
            groupEl.appendChild(controls);

            row.appendChild(groupEl);
        });

        container.appendChild(row);
    }

    class EdgeManager {
        static edgeCount = null;
        static edgeCountDisplay = null;

        static unauthorizedCount = null;
        static unauthorizedCountDisplay = null;

        static countdownTimer = null;
        static countdownDisplay = null;

        static addRow() {
            const container = document.getElementById('my-extension-content');
            const row = document.createElement('div');
            row.className = 'stat-row';

            const entries = [
                {label: 'Edges', key: STORAGE.EDGES},
                {label: 'unauthorized', key: STORAGE.UNAUTHORIZED}
            ];

            entries.forEach(({label, key}) => {
                let val = parseInt(localStorage.getItem(key), 10) || 0;

                const group = document.createElement('div');
                group.className = 'stat-group';

                const labelEl = document.createElement('span');
                labelEl.className = 'stat-label';
                labelEl.textContent = `${label}: `;

                const valueEl = document.createElement('span');
                valueEl.className = 'stat-value';
                valueEl.textContent = val;

                const btn = document.createElement('button');
                btn.textContent = '+';

                const controls = document.createElement('div');
                controls.className = 'stat-controls';
                controls.appendChild(btn);
                if (label === "Edges") {
                    this.edgeCount = val;
                    this.edgeCountDisplay = valueEl;

                    btn.addEventListener('click', () => {
                        this.addEdge();
                    });
                    btn.title = "Add an edge and 10 points."

                    const btn2 = document.createElement('button');
                    btn2.textContent = '(+)';
                    btn.title = "Add an edge but no points."
                    btn2.addEventListener('click', () => {
                        this.addEdgeWithoutPoints();
                    });
                    controls.appendChild(btn2);
                } else {
                    this.unauthorizedCount = val;
                    this.unauthorizedCountDisplay = valueEl;

                    btn.title = "Add an unauthorized edge and remove 20 points."
                    btn.addEventListener('click', () => {
                        this.addUnauthorizedEdge();
                    });
                }

                group.appendChild(labelEl);
                group.appendChild(valueEl);
                group.appendChild(controls);

                row.appendChild(group);
            });
            const countdown = document.createElement('span');
            countdown.className = 'stat-countdown';
            countdown.style.display = 'none';
            row.appendChild(countdown);
            this.countdownDisplay = countdown;

            container.appendChild(row);
        }

        static addEdge() {
            this.edgeCount++;
            this.edgeCountDisplay.textContent = this.edgeCount;
            localStorage.setItem(STORAGE.EDGES, this.edgeCount);

            PointsManager.changePoints(10);
            this.startCountdown(CONSTS.PAUSE_AFTER_EDGE);
        }

        static addEdgeWithoutPoints() {
            this.edgeCount++;
            this.edgeCountDisplay.textContent = this.edgeCount;
            localStorage.setItem(STORAGE.EDGES, this.edgeCount);

            this.startCountdown(CONSTS.PAUSE_AFTER_EDGE);
        }

        static addUnauthorizedEdge() {
            this.unauthorizedCount++;
            this.unauthorizedCountDisplay.textContent = this.unauthorizedCount;
            localStorage.setItem(STORAGE.UNAUTHORIZED, this.unauthorizedCount);

            PointsManager.changePoints(-20);
            this.startCountdown(CONSTS.PAUSE_AFTER_UNAUTHORIZED_EDGE);
        }

        static startCountdown(duration) {
            if (this.countdownTimer) {
                clearInterval(this.countdownTimer);
            }

            this.countdownDisplay.style.display = 'inline-block';

            let remainingTime = duration;
            this.countdownDisplay.textContent = `Pausing: ${remainingTime}s`;

            this.countdownTimer = setInterval(() => {
                remainingTime--;

                if (remainingTime <= 0) {
                    clearInterval(this.countdownTimer);
                    this.countdownDisplay.style.display = 'none';
                } else {
                    this.countdownDisplay.textContent = `Pausing: ${remainingTime}s`;
                }
            }, 1000);
        }
    }

    class MetronomeManager {
        static beatCount = 0;
        static bpmIntervalId = null;
        static bpmInput = null;
        static volumeSlider = null; // Add a volume slider property
        static beatCounterDisplay = null;
        static timerDisplay = null;
        static startButton = null;
        static stopButton = null;
        static edgeButton = null;
        static noPointsButton = null;
        static unauthorizedButton = null;
        static audioContext = new (window.AudioContext || window.webkitAudioContext)();
        static timerIntervalId = null;
        static totalTimeElapsed = 0;
        static volumeGainNode = null; // Gain node to control volume

        static addBpmButton() {
            const bpmButton = document.createElement("button");
            bpmButton.textContent = "Metronome";
            bpmButton.className = "modifier-add-btn"; // Reuse existing button class for consistency
            bpmButton.title = "Open Metronome Menu"
            bpmButton.addEventListener("click", () => this.showBpmDialog());
            return bpmButton;
        }

        static showBpmDialog() {
            const existingDialog = document.getElementById("bpm-dialog");
            if (existingDialog) {
                existingDialog.remove();
                return;
            }

            // Create the BPM dialog
            const dialog = document.createElement("div");
            dialog.id = "bpm-dialog";
            dialog.className = "modifier-dialog";

            const closeButton = document.createElement("button");
            closeButton.textContent = "×";
            closeButton.className = "modifier-close-btn";
            closeButton.addEventListener("click", () => {
                this.stopMetronome();
                dialog.remove();
            });

            const inputRow = document.createElement("div");
            inputRow.className = "modifier-input-row";

            const bpmLabel = document.createElement("p");
            bpmLabel.textContent = "Set BPM:";

            this.bpmInput = document.createElement("input");
            this.bpmInput.type = "number";
            this.bpmInput.className = "modifier-input";

            const metronome_bpm = localStorage.getItem(STORAGE.METRONOME_BPM);
            this.bpmInput.value = metronome_bpm ? parseFloat(metronome_bpm) : 120;

            // Create volume slider
            const volumeLabel = document.createElement("p");
            volumeLabel.textContent = "Volume:";

            this.volumeSlider = document.createElement("input");
            this.volumeSlider.type = "range";
            this.volumeSlider.min = 0;
            this.volumeSlider.max = 1;
            this.volumeSlider.step = 0.01;

            // Load previously saved volume from localStorage or set a default value
            const savedVolume = localStorage.getItem(STORAGE.METRONOME_VOLUME);
            this.volumeSlider.value = savedVolume ? parseFloat(savedVolume) : 0.5;

            this.volumeSlider.className = "modifier-slider";
            this.volumeSlider.addEventListener("input", () => {
                this.updateVolume(this.volumeSlider.value);
                localStorage.setItem(STORAGE.METRONOME_VOLUME, this.volumeSlider.value);
            });

            this.startButton = document.createElement("button");
            this.startButton.textContent = "Start";
            this.startButton.className = "modifier-btn modifier-submit-btn";

            this.stopButton = document.createElement("button");
            this.stopButton.textContent = "Stop";
            this.stopButton.className = "modifier-btn modifier-submit-btn";

            this.edgeButton = document.createElement("button");
            this.edgeButton.textContent = "Edge";
            this.edgeButton.title = "Add an edge (+ 10 Points) and pause the metronome";
            this.edgeButton.className = "modifier-btn modifier-submit-btn";

            this.noPointsButton = document.createElement("button");
            this.noPointsButton.textContent = "Edge (No Points)";
            this.noPointsButton.title = "Add an edge and pause the metronome";
            this.noPointsButton.className = "modifier-btn modifier-submit-btn";

            this.unauthorizedButton = document.createElement("button");
            this.unauthorizedButton.textContent = "Unauthorized";
            this.unauthorizedButton.title = "Add an unauthorized edge (- 20 Points) and pause the metronome";
            this.unauthorizedButton.className = "modifier-btn modifier-submit-btn";

            this.beatCounterDisplay = document.createElement("p");
            this.beatCounterDisplay.textContent = "Strokes: 0"; // Initial counter value

            this.timerDisplay = document.createElement("p");
            this.timerDisplay.textContent = "Time Elapsed: 00:00:00"; // Initial timer value

            this.beatCount = 0;
            this.totalTimeElapsed = 0;

            this.startButton.addEventListener("click", () => {
                this.beatCounterDisplay.textContent = `Strokes: ${this.beatCount}`;
                this.startMetronome();
            });

            this.stopButton.addEventListener("click", () => {
                this.stopMetronome();
            });

            this.edgeButton.addEventListener("click", () => {
                EdgeManager.addEdge();
                this.pauseMetronome(CONSTS.PAUSE_AFTER_EDGE);
            });

            this.noPointsButton.addEventListener("click", () => {
                EdgeManager.addEdgeWithoutPoints()
                this.pauseMetronome(CONSTS.PAUSE_AFTER_EDGE);
            });

            this.unauthorizedButton.addEventListener("click", () => {
                EdgeManager.addUnauthorizedEdge();
                this.pauseMetronome(CONSTS.PAUSE_AFTER_UNAUTHORIZED_EDGE);
            });

            inputRow.appendChild(bpmLabel);
            inputRow.appendChild(this.bpmInput);
            inputRow.appendChild(this.startButton);
            inputRow.appendChild(this.stopButton);
            inputRow.appendChild(this.beatCounterDisplay);
            inputRow.appendChild(this.timerDisplay);
            inputRow.appendChild(this.edgeButton);
            inputRow.appendChild(this.noPointsButton);
            inputRow.appendChild(this.unauthorizedButton);
            inputRow.appendChild(volumeLabel);
            inputRow.appendChild(this.volumeSlider); // Append the volume slider

            dialog.appendChild(closeButton);
            dialog.appendChild(inputRow);

            this.setButtonsActive(false);

            document.body.appendChild(dialog);

            // Initialize the volume gain node
            this.volumeGainNode = this.audioContext.createGain();
            this.volumeGainNode.gain.value = this.volumeSlider.value;
            this.volumeGainNode.connect(this.audioContext.destination);
        }

        static updateVolume(value) {
            if (this.volumeGainNode) {
                this.volumeGainNode.gain.value = value;
            }
        }

        static startMetronome() {
            const bpm = this.bpmInput.value;
            localStorage.setItem(STORAGE.METRONOME_BPM, bpm);
            const interval = (60 / bpm) * 1000;

            if (this.bpmIntervalId) {
                // If the metronome is already running, update the BPM
                clearInterval(this.bpmIntervalId); // Clear the previous interval
                this.bpmIntervalId = setInterval(() => {
                    this.beatCount++;
                    this.beatCounterDisplay.textContent = `Strokes: ${this.beatCount}`;
                    this.playClickSound();
                }, interval);
            } else {
                // If the metronome is not running, start it
                this.beatCounterDisplay.textContent = `Strokes: ${this.beatCount}`;
                this.bpmIntervalId = setInterval(() => {
                    this.beatCount++;
                    this.beatCounterDisplay.textContent = `Strokes: ${this.beatCount}`;
                    this.playClickSound();
                }, interval);
                this.startTimer();
                ThreeMinuteReminder.pauseTimer();
                this.setButtonsActive(true);
            }
        }

        static stopMetronome() {
            ThreeMinuteReminder.restartTimer();
            this.setButtonsActive(false);

            if (this.bpmIntervalId) {
                clearInterval(this.bpmIntervalId);
                this.bpmIntervalId = null;
            }
            this.stopTimer();
        }

        static pauseMetronome(duration) {
            ThreeMinuteReminder.pauseTimer();

            this.setButtonsActive(false, false);
            if (this.bpmIntervalId) {
                clearInterval(this.bpmIntervalId);
                this.bpmIntervalId = null;
            }

            setTimeout(() => this.startMetronome(), duration * 1000);
        }

        static startTimer() {
            if (this.timerIntervalId) {
                return;
            }

            this.timerIntervalId = setInterval(() => {
                this.totalTimeElapsed++;
                const hours = String(Math.floor(this.totalTimeElapsed / 3600)).padStart(2, "0");
                const minutes = String(Math.floor((this.totalTimeElapsed % 3600) / 60)).padStart(2, "0");
                const seconds = String(this.totalTimeElapsed % 60).padStart(2, "0");

                this.timerDisplay.textContent = `Time Elapsed: ${hours}:${minutes}:${seconds}`;
            }, 1000);
        }

        static stopTimer() {
            if (this.timerIntervalId) {
                clearInterval(this.timerIntervalId);
                this.timerIntervalId = null;
            }
        }

        static playClickSound() {
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
            oscillator.connect(this.volumeGainNode);
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        }

        static setButtonsActive(allButtons, startButton = true) {
            this.startButton.disabled = !startButton;
            this.stopButton.disabled = !allButtons;
            this.edgeButton.disabled = !allButtons;
            this.noPointsButton.disabled = !allButtons;
            this.unauthorizedButton.disabled = !allButtons;
        }
    }


    class RandomNumberManager {
        static addRNGButton() {
            const rngButton = document.createElement("button");
            rngButton.textContent = "RNG";
            rngButton.className = "modifier-add-btn";
            rngButton.title = "Open Random Number Generator"
            rngButton.addEventListener("click", () => this.showRandomDialog());
            return rngButton;
        }

        static showRandomDialog() {
            const existingDialog = document.getElementById("random-dialog");
            if (existingDialog) {
                existingDialog.remove();
                return;
            }

            // Create the Random Number dialog
            const dialog = document.createElement("div");
            dialog.id = "random-dialog";
            dialog.className = "rng-dialog";

            const closeButton = document.createElement("button");
            closeButton.textContent = "×";
            closeButton.className = "modifier-close-btn";
            closeButton.title = "Close"
            closeButton.addEventListener("click", () => dialog.remove());

            const inputRow = document.createElement("div");
            inputRow.className = "modifier-input-row";

            const minLabel = document.createElement("p");
            minLabel.textContent = "Min:";

            this.minInput = document.createElement("input");
            this.minInput.type = "number";
            this.minInput.className = "modifier-input";

            const maxLabel = document.createElement("p");
            maxLabel.textContent = "Max:";

            this.maxInput = document.createElement("input");
            this.maxInput.type = "number";
            this.maxInput.className = "modifier-input";


            const minValue = localStorage.getItem(STORAGE.RNG_MIN);
            this.minInput.value = minValue ? parseFloat(minValue) : 1;
            const maxValue = localStorage.getItem(STORAGE.RNG_MAX);
            this.maxInput.value = maxValue ? parseFloat(maxValue) : 5;

            this.generateButton = document.createElement("button");
            this.generateButton.textContent = "Generate";
            this.generateButton.title = "Creates random number (including the minimum and maximum)"
            this.generateButton.className = "modifier-btn modifier-submit-btn";

            this.resultDisplay = document.createElement("p");
            this.resultDisplay.textContent = "Random Number: "; // Initial result display
            this.resultDisplay.className = "modifier-result-display";

            this.generateButton.addEventListener("click", () => {
                const min = parseFloat(this.minInput.value);
                const max = parseFloat(this.maxInput.value);

                if (isNaN(min) || isNaN(max) || min > max) {
                    alert("Please enter valid min and max values where min ≤ max.");
                    return;
                }

                const randomNumber = this.generateRandomNumber(min, max);
                this.resultDisplay.textContent = `Random Number: ${randomNumber}`;
            });

            inputRow.appendChild(minLabel);
            inputRow.appendChild(this.minInput);
            inputRow.appendChild(maxLabel);
            inputRow.appendChild(this.maxInput);
            inputRow.appendChild(this.generateButton);
            inputRow.appendChild(this.resultDisplay);

            dialog.appendChild(closeButton);
            dialog.appendChild(inputRow);

            document.body.appendChild(dialog);
        }

        static generateRandomNumber(min, max) {
            // Generates a whole number between min and max (inclusive)
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }

    function addPagesPauseRow() {
        const container = document.getElementById('my-extension-content');
        const row = document.createElement('div');
        row.className = 'stat-row';
        row.id = 'pages-pause-row';

        // Pages label
        const pagesLabel = document.createElement('span');
        pagesLabel.className = 'stat-label';
        pagesLabel.textContent = 'Pages: ';

        // Pages value
        const pagesValue = document.createElement('span');
        pagesValue.className = 'stat-value pages-count';
        // Will be initialized later

        const minusButton = document.createElement('button');
        minusButton.textContent = '-';
        minusButton.title = `Decrease the pages count by once (If a page was counted by accident).`;
        minusButton.addEventListener('click', () => {
            let totalPages = parseInt(localStorage.getItem(STORAGE.TOTAL_PAGES), 10);
            let pagesSincePause = parseInt(localStorage.getItem(STORAGE.PAGES_SINCE_PAUSE), 10);
            totalPages = Math.max(1, totalPages - 1);
            pagesSincePause = Math.max(1, pagesSincePause - 1);

            localStorage.setItem(STORAGE.TOTAL_PAGES, totalPages);
            localStorage.setItem(STORAGE.PAGES_SINCE_PAUSE, pagesSincePause);

            updatePagesPauseRow(totalPages, pagesSincePause)
        });

        // Pause button
        const pauseBtn = document.createElement('button');
        pauseBtn.textContent = 'Pause';
        pauseBtn.title = `Start your pause for up to ${CONSTS.PAUSE_DURATION_HOURS} hours (after you completed the page)`;
        pauseBtn.style.marginLeft = '5px';
        pauseBtn.disabled = true;
        pauseBtn.classList.add('pause-btn');
        pauseBtn.addEventListener('click', () => PauseManager.startPause());

        row.appendChild(pagesLabel);
        row.appendChild(pagesValue);
        row.appendChild(minusButton);
        row.appendChild(pauseBtn);
        row.appendChild(MetronomeManager.addBpmButton());
        row.appendChild(RandomNumberManager.addRNGButton());
        container.appendChild(row);
    }

    function updatePagesPauseRow(totalPages, pagesSincePause) {
        const pagesValue = document.querySelector('.pages-count');
        if (pagesValue) {
            pagesValue.textContent = `${totalPages}, ${pagesSincePause}/${CONSTS.PAGES_UNTIL_PAUSE}`;
        }
    }

    function addRevisitedGoddessRow() {
        const container = document.getElementById('my-extension-content');
        const row = document.createElement('div');
        row.className = 'stat-row';

        function addRevisitedPagesPart() {
            // Create a dictionary in localStorage to store visited pages
            let revisitedPages = JSON.parse(localStorage.getItem(STORAGE.REVISITED_SITES)) || {};

            // Get the current page number
            const currentPageNumber = getCurrentPageNumber();

            if (!isPageReload()) {
                if (currentPageNumber in revisitedPages) {
                    revisitedPages[currentPageNumber] = revisitedPages[currentPageNumber] + 1;
                } else {
                    revisitedPages[currentPageNumber] = 0;
                }
            }

            localStorage.setItem(STORAGE.REVISITED_SITES, JSON.stringify(revisitedPages));

            // Add the "Revisited" part to the display
            const revisitedGroup = document.createElement('div');
            revisitedGroup.className = 'stat-group';

            const revisitedLabel = document.createElement('span');
            revisitedLabel.className = 'stat-label';
            revisitedLabel.textContent = `Revisited:`;

            const revisitedValue = document.createElement('span'); // Separate span for the value
            revisitedValue.className = 'stat-value'; // Add a class to style this span
            revisitedValue.textContent = `${revisitedPages[currentPageNumber]} time(s)`;

            revisitedGroup.appendChild(revisitedLabel);
            revisitedGroup.appendChild(revisitedValue);
            row.appendChild(revisitedGroup); // Assuming `row` is defined in your context
        }

        addRevisitedPagesPart();

        function addGoddessessPart() {
            const goddessGroup = document.createElement('div');
            goddessGroup.className = 'stat-group';

            const goddessLabel = document.createElement('span');
            goddessLabel.className = 'stat-label';
            goddessLabel.textContent = 'Goddess: ';

            // Get the current goddess page array from storage
            let goddessPages = JSON.parse(localStorage.getItem(STORAGE.GODDESS_VISITED)) || [];

            // Get the current page number
            const currentPageNumber = getCurrentPageNumber();

            const goddessPlusBtn = document.createElement('button');
            goddessPlusBtn.textContent = '+';
            goddessPlusBtn.title = "Register that you visited the current Goddess. Only counts each goddess once."

            const teaseContentDiv = document.getElementById('tease_content');
            const isGoddessInContent =
                teaseContentDiv &&
                teaseContentDiv.innerHTML.substring(0, 300).toLowerCase().includes('goddess');

            const isDisabled =
                goddessPages.includes(currentPageNumber) || !isGoddessInContent;

            goddessPlusBtn.disabled = isDisabled;
            goddessPlusBtn.style.backgroundColor = isDisabled ? 'gray' : 'blue'; // Set button color
            goddessPlusBtn.style.color = 'white';
            goddessPlusBtn.style.cursor = isDisabled ? 'not-allowed' : 'pointer';

            const goddessCounter = document.createElement('span');
            goddessCounter.className = 'stat-value';
            goddessCounter.textContent = goddessPages.length

            goddessPlusBtn.addEventListener('click', () => {
                if (!goddessPages.includes(currentPageNumber)) {
                    // Add the page number to the array
                    goddessPages.push(currentPageNumber);

                    // Save the updated array to localStorage
                    localStorage.setItem(STORAGE.GODDESS_VISITED, JSON.stringify(goddessPages));

                    // Update the displayed array
                    goddessCounter.textContent = goddessPages.length;

                    // Disable the button since this page has been added
                    goddessPlusBtn.disabled = true;
                    goddessPlusBtn.style.backgroundColor = 'gray';
                    goddessPlusBtn.style.cursor = 'not-allowed';
                }
            });

            goddessGroup.appendChild(goddessLabel);
            goddessGroup.appendChild(goddessCounter);
            goddessGroup.appendChild(goddessPlusBtn);
            row.appendChild(goddessGroup);
        }

        addGoddessessPart();


        container.appendChild(row);
    }

    function countPageView() {
        const isPaused = localStorage.getItem(STORAGE.PAUSE_ACTIVE) === 'true';
        if (isPaused) {
            return; // Skip counting if pause is active
        }


        let totalPages = parseInt(localStorage.getItem(STORAGE.TOTAL_PAGES), 10);
        let pagesSincePause = parseInt(localStorage.getItem(STORAGE.PAGES_SINCE_PAUSE), 10);

        if (isNaN(totalPages)) totalPages = 0;
        if (isNaN(pagesSincePause)) pagesSincePause = 0;

        if (!isPageReload()) {
            totalPages++;
            pagesSincePause++;
        }

        localStorage.setItem(STORAGE.TOTAL_PAGES, totalPages);
        localStorage.setItem(STORAGE.PAGES_SINCE_PAUSE, pagesSincePause);

        updatePagesPauseRow(totalPages, pagesSincePause);

        const pauseBtn = document.querySelector('#pages-pause-row .pause-btn');
        if (pauseBtn) pauseBtn.disabled = pagesSincePause < CONSTS.PAGES_UNTIL_PAUSE;
    }

    class StorageManager {
        static addStorageButton() {
            const storageButton = document.createElement("button");
            storageButton.textContent = "Edit Variables";
            storageButton.className = "modifier-add-btn";
            storageButton.title = "Open Variable Editor";
            storageButton.addEventListener("click", () => this.showStorageDialog());
            return storageButton;
        }

        static showStorageDialog() {
            const existingDialog = document.getElementById("storage-dialog");

            // Remove existing dialog if already open
            if (existingDialog) {
                existingDialog.remove();
                return;
            }

            // Create storage modal dialog
            const dialog = document.createElement("div");
            dialog.id = "storage-dialog";
            dialog.className = "modifier-dialog";

            const closeButton = document.createElement("button");
            closeButton.textContent = "×";
            closeButton.className = "modifier-close-btn";
            closeButton.title = "Close";
            closeButton.addEventListener("click", () => dialog.remove());

            // Add a title for the dialog
            const title = document.createElement("h3");
            title.textContent = "Edit Variables";
            title.style.marginBottom = "10px";

            // Add a warning text
            const warning = document.createElement("p");
            warning.textContent =
                "⚠ Warning: Editing variables manually can break the plugin if incorrect values are input. Proceed with caution!";
            warning.style.color = "#f44336";
            warning.style.fontWeight = "bold";
            warning.style.marginBottom = "15px";

            dialog.appendChild(closeButton);
            dialog.appendChild(title);
            dialog.appendChild(warning);

            // Dynamically build the list of storage variables
            const storageList = document.createElement("div");
            storageList.className = "modifiers-list-container";

            Object.keys(STORAGE).forEach((key) => {
                const storageKey = STORAGE[key];
                const currentValue = localStorage.getItem(storageKey) || "";

                // Create a row for each storage variable
                const row = document.createElement("div");
                row.className = "modifier-row";

                // Label for the storage variable
                const label = document.createElement("span");
                label.className = "modifier-description";
                label.textContent = key;

                // Input for editing the value
                const input = document.createElement("input");
                input.className = "modifier-input";
                input.type = "text";
                input.value = currentValue;

                // Button to save the value
                const saveButton = document.createElement("button");
                saveButton.className = "modifier-btn";
                saveButton.textContent = "Save";
                saveButton.title = "Save changes for this variable";

                saveButton.addEventListener("click", () => {
                    localStorage.setItem(storageKey, input.value);
                    alert(`Value for "${key}" successfully saved!`);
                });

                row.appendChild(label);
                row.appendChild(input);
                row.appendChild(saveButton);

                storageList.appendChild(row);
            });

            // Add the list of variables to the dialog
            dialog.appendChild(storageList);

            // Append the dialog to the body
            document.body.appendChild(dialog);
        }
    }

    class NotesManager {
        static addNotesButton() {
            const notesButton = document.createElement("button");
            notesButton.textContent = "Notes";
            notesButton.className = "modifier-add-btn";
            notesButton.title = "Open Notes Editor";
            notesButton.addEventListener("click", () => this.showNotesDialog());
            return notesButton;
        }

        static showNotesDialog() {
            const existingDialog = document.getElementById("notes-dialog");

            if (existingDialog) {
                existingDialog.remove();
                return;
            }

            const dialog = document.createElement("div");
            dialog.id = "notes-dialog";
            dialog.className = "modifier-dialog";

            const closeButton = document.createElement("button");
            closeButton.textContent = "×";
            closeButton.className = "modifier-close-btn";
            closeButton.title = "Close";
            closeButton.addEventListener("click", () => dialog.remove());

            const title = document.createElement("h3");
            title.textContent = "Add/Edit Notes";
            title.style.marginBottom = "10px";

            const textArea = document.createElement("textarea");
            textArea.id = "notes-textarea";
            textArea.className = "modifier-input";
            textArea.style.height = "150px";
            textArea.style.resize = "vertical";
            textArea.value = localStorage.getItem(STORAGE.NOTES) || "";

            const saveButton = document.createElement("button");
            saveButton.textContent = "Save Notes";
            saveButton.className = "modifier-btn modifier-submit-btn";
            saveButton.style.marginTop = "10px";
            saveButton.addEventListener("click", () => {
                const notes = textArea.value;
                localStorage.setItem(STORAGE.NOTES, notes);
            });

            dialog.appendChild(closeButton);
            dialog.appendChild(title);
            dialog.appendChild(textArea);
            dialog.appendChild(saveButton);

            document.body.appendChild(dialog);
        }
    }

    function getParameterByName(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, "\\$&");
        const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
        const results = regex.exec(url);
        if (!results) return null;
        return decodeURIComponent(results[2] || '');
    }

    class ThreeMinuteReminder {
        static timeoutId = null;
        static overlay = null;
        static disabled = false;
        static startDate = null;

        static init() {
            const isPaused = localStorage.getItem(STORAGE.PAUSE_ACTIVE) === 'true';
            if (isPaused) {
                this.disabled = true;
                return;
            }

            this.startDate = new Date();
            this.createOverlay();
            this.startTimeout();
            this.attachEventListeners();
        }

        static createOverlay() {
            this.overlay = document.createElement('div');
            this.overlay.className = 'chastity-overlay';

            const message = document.createElement('div');
            message.className = 'reminder-message';
            message.innerText = 'You have not interacted for more than 3 minutes.';
            this.overlay.appendChild(message);

            const buttonDoingSomething = document.createElement('button');
            buttonDoingSomething.className = 'end-early-button';
            buttonDoingSomething.innerText = 'I was doing something for the tease';
            buttonDoingSomething.addEventListener('click', () => {
                this.overlay.style.display = 'none';
                this.startTimeout();
            });
            this.overlay.appendChild(buttonDoingSomething);

            const pauseButton = document.createElement('button');
            pauseButton.className = 'end-early-button'; // Reuse the same button style
            pauseButton.innerText = 'It was a mistake, and I need to start my pause now.';
            pauseButton.addEventListener('click', () => {
                this.overlay.style.display = 'none';
                PauseManager.startPause();
                this.pauseTimer();
            });

            const pagesSincePause = parseInt(localStorage.getItem(STORAGE.PAGES_SINCE_PAUSE), 10) || 0;
            pauseButton.disabled = pagesSincePause < CONSTS.PAGES_UNTIL_PAUSE;
            this.overlay.appendChild(pauseButton);

            const endSessionButton = document.createElement('button');
            endSessionButton.className = 'end-early-button';
            endSessionButton.innerText = 'End this session without permission.';
            endSessionButton.addEventListener('click', () => SessionEndManager.endSessionWP(this.startDate));
            this.overlay.appendChild(endSessionButton);

            document.body.appendChild(this.overlay);
            this.overlay.style.display = 'none';
        }

        static showOverlay() {
            this.overlay.style.display = 'flex'; // Display overlay
        }

        static startTimeout() {
            this.disabled = false;
            this._startTimeout();
        }

        static _startTimeout() {
            if (this.disabled === true) {
                return;
            }
            this.clearTimer();
            this.timeoutId = setTimeout(() => this.showOverlay(), 180000); // 3 minutes
        }

        static pauseTimer() {
            this.disabled = false;
            if (this.timeoutId !== null) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
        }

        static restartTimer() {
            this.disabled = false;
            if (this.timeoutId === null) {
                this.startTimeout();
            }
        }

        static clearTimer() {
            if (this.timeoutId !== null) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
        }

        static attachEventListeners() {
            // Restart timeout on any body click
            document.body.addEventListener('click', this._startTimeout.bind(this), true);
        }
    }

    // --- Pause UI ---
    let pauseIntervalId = null;

    class PauseManager {
        static startPause(isResume = false) {
            if (!isResume) {
                // If no resume, initialize pause settings
                ThreeMinuteReminder.pauseTimer();
                localStorage.setItem(STORAGE.PAGES_SINCE_PAUSE, 0);
                localStorage.setItem(STORAGE.PAUSE_ACTIVE, 'true');
                const pauseEnd = Date.now() + CONSTS.PAUSE_DURATION_HOURS * 3600 * 1000;
                localStorage.setItem(STORAGE.PAUSE_END_TIMESTAMP, pauseEnd);
            }

            // Hide the main panel UI
            const panelContent = document.getElementById('my-extension-content');
            if (panelContent) panelContent.style.display = 'none';

            // Show the pause overlay
            let countdownOverlay = document.getElementById('pause-countdown-overlay');
            if (!countdownOverlay) {
                countdownOverlay = document.createElement('div');
                countdownOverlay.id = 'pause-countdown-overlay';
                countdownOverlay.innerHTML = `
                    <div id="pause-timer-text" style="margin-bottom:2rem;"></div>
                    <button style="font-size: 2rem; padding: 1rem 2rem; cursor: pointer;">
                      Stop Pause and Roll
                    </button>
                  `;

                countdownOverlay.querySelector('button').addEventListener('click', () => {
                    PauseManager.stopPause(true);
                });

                document.body.appendChild(countdownOverlay);
            }
            countdownOverlay.style.display = 'flex';

            PauseManager.updatePauseTimer(); // Show the initial timer text
            if (!pauseIntervalId) {
                pauseIntervalId = setInterval(PauseManager.updatePauseTimer, 1000); // Keep updating the countdown
            }
        }

        static updatePauseTimer() {
            const timerText = document.getElementById('pause-timer-text');
            if (!timerText) return;

            const pauseEnd = parseInt(localStorage.getItem(STORAGE.PAUSE_END_TIMESTAMP), 10);
            const now = Date.now();
            const diffMs = pauseEnd - now;

            if (diffMs <= 0) {
                PauseManager.stopPause(false);
                return;
            }

            const totalSeconds = Math.floor(diffMs / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            timerText.textContent = `Pause: ${hours.toString().padStart(2, '0')}:${minutes
                .toString()
                .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        static stopPause(redirectAfterStop) {
            clearInterval(pauseIntervalId);
            pauseIntervalId = null;

            // Hide the pause overlay
            const countdownOverlay = document.getElementById('pause-countdown-overlay');
            if (countdownOverlay) countdownOverlay.style.display = 'none';


            // Clear pause-related local storage keys
            localStorage.setItem(STORAGE.PAUSE_ACTIVE, 'false');
            localStorage.removeItem(STORAGE.PAUSE_END_TIMESTAMP);

            if (redirectAfterStop) {
                window.location.href = getRandomURL();
            }
        }

        static checkAndResumePause() {
            const pauseEnd = parseInt(localStorage.getItem(STORAGE.PAUSE_END_TIMESTAMP), 10);
            const now = Date.now();

            if (!isNaN(pauseEnd) && pauseEnd > now) {
                PauseManager.startPause(true); // Resume the pause
            } else {
                PauseManager.stopPause(false); // Cleanup any leftover pause UI or data
            }
        }

        static handlePauseLogic() {
            const isPaused = localStorage.getItem(STORAGE.PAUSE_ACTIVE) === 'true';
            const pauseEnd = parseInt(localStorage.getItem(STORAGE.PAUSE_END_TIMESTAMP), 10) || 0;

            if (isPaused && Date.now() < pauseEnd) {
                PauseManager.startPause(true); // Continue active pause
                return true;
            }

            if (isPaused && Date.now() >= pauseEnd) {
                PauseManager.stopPause(true); // Pause has expired
                return true;
            }

            return false; // No active pause
        }
    }

    class ModifierManager {
        static only_after_session = false;

        static addRow() {
            const container = document.getElementById('my-extension-content'); // Panel container
            const row = document.createElement('div');
            row.className = 'stat-row';

            // Create and append elements to the row
            const label = this.createLabel();
            const modifierCountElement = this.createModifierCountElement();
            const plusButton = this.createPlusButton();
            const eyeButton = this.createEyeButton(container);

            row.appendChild(label);
            row.appendChild(modifierCountElement);
            row.appendChild(plusButton);
            row.appendChild(eyeButton);
            row.appendChild(NotesManager.addNotesButton());
            container.appendChild(row);
        }

        static createLabel() {
            const label = document.createElement('span');
            label.className = 'stat-label';
            label.textContent = 'Modifiers: ';
            return label;
        }

        static createModifierCountElement() {
            const countElement = document.createElement('span');
            countElement.id = 'modifier-count';
            countElement.textContent = this.getModifiersCount(); // Initial count
            countElement.style.fontWeight = 'bold';
            countElement.style.marginRight = '10px'; // Add spacing
            return countElement;
        }

        static getModifiersCount() {
            const modifiers = JSON.parse(localStorage.getItem(STORAGE.MODIFIERS)) || [];
            return modifiers.length; // Return the count of modifiers
        }

        static updateModifierCount() {
            const countElement = document.getElementById('modifier-count');
            if (countElement) {
                countElement.textContent = this.getModifiersCount(); // Update the count dynamically
            }
        }

        static updateModifiersList(listContainer) {
            const modifiers = JSON.parse(localStorage.getItem(STORAGE.MODIFIERS)) || [];

            listContainer.innerHTML = ''; // Clear the current list
            listContainer.style.maxHeight = '300px'; // Set max height
            listContainer.style.overflowY = 'auto'; // Enable vertical scrolling

            // Filter modifiers based on the `only_after_session` flag
            const filteredModifiers = modifiers.filter(modifier => {
                return this.only_after_session ? modifier.appliesAfterSession : true;
            });

            // Create rows for the filtered modifiers
            filteredModifiers.forEach((modifier, index) => {
                const modifierRow = this.createModifierRow(modifier, index, listContainer);
                listContainer.appendChild(modifierRow);
            });
        }

        static createModifierRow(modifier, index, listContainer) {
            const modifierRow = document.createElement('div');
            modifierRow.className = 'modifier-row';
            modifierRow.style.borderBottom = '1px solid #ccc';
            modifierRow.style.padding = '10px 0';

            const description = document.createElement('span');
            description.textContent = `${modifier.pageNumber}: ${modifier.description}` +
                (modifier.appliesAfterSession ? ' (Applies After Session)' : '');
            description.className = 'modifier-description';

            const counter = document.createElement('span');
            counter.textContent = modifier.counter || 0;
            counter.className = 'modifier-counter';

            const buttonContainer = this.createButtonContainer(modifier, index, listContainer);

            modifierRow.appendChild(description);
            modifierRow.appendChild(counter);
            modifierRow.appendChild(buttonContainer);

            return modifierRow;
        }

        static createButtonContainer(modifier, index, listContainer) {
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.flexDirection = 'column';
            buttonContainer.style.gap = '5px';

            const plusButton = this.createCounterButton('+', () => {
                modifier.counter = (modifier.counter || 0) + 1;
                this.updateStorage(modifier, index, listContainer);
            }, "Increase the counter.");

            const minusButton = this.createCounterButton('-', () => {
                modifier.counter = Math.max(0, (modifier.counter || 0) - 1);
                this.updateStorage(modifier, index, listContainer);
            }, "Decrease the counter.");

            const deleteButton = this.createDeleteButton(() => {
                this.deleteModifierFromStorage(index, listContainer);
            });

            buttonContainer.appendChild(plusButton);
            buttonContainer.appendChild(minusButton);
            buttonContainer.appendChild(deleteButton);

            return buttonContainer;
        }

        static createCounterButton(text, onClick, title=null) {
            const button = document.createElement('button');
            button.textContent = text;
            button.className = 'modifier-counter-btn';
            if (title !== null) {
                button.title = title
            }
            button.addEventListener('click', onClick);
            return button;
        }

        static createDeleteButton(onClick) {
            const button = document.createElement('button');
            button.textContent = '🗑️';
            button.className = 'modifier-counter-btn';
            button.style.backgroundColor = '#ff4d4d'; // Red background
            button.style.color = '#fff'; // White text
            button.title = "Delete this Modifier.";
            button.addEventListener('click', onClick);
            return button;
        }

        static updateStorage(modifier, index, listContainer) {
            const modifiers = JSON.parse(localStorage.getItem(STORAGE.MODIFIERS)) || [];
            modifiers[index] = modifier;
            localStorage.setItem(STORAGE.MODIFIERS, JSON.stringify(modifiers));
            this.updateModifiersList(listContainer);
        }

        static deleteModifierFromStorage(index, listContainer) {
            const modifiers = JSON.parse(localStorage.getItem(STORAGE.MODIFIERS)) || [];
            modifiers.splice(index, 1);
            localStorage.setItem(STORAGE.MODIFIERS, JSON.stringify(modifiers));
            this.updateModifiersList(listContainer);
            this.updateModifierCount();
        }

        static createPlusButton() {
            const plusButton = document.createElement('button');
            plusButton.textContent = '+';
            plusButton.className = 'modifier-add-btn';
            plusButton.title = "Open Dialog to add a new Modifier."
            plusButton.addEventListener('click', () => this.showModifierDialog());
            return plusButton;
        }

        static showModifierDialog() {
            const existingDialog = document.getElementById('modifier-dialog');
            if (existingDialog) existingDialog.remove();

            const dialog = document.createElement('div');
            dialog.id = 'modifier-dialog';
            dialog.className = 'modifier-dialog';

            const closeButton = this.createCloseButton(dialog);
            const inputRow = this.createInputRow();
            const submitButton = this.createSubmitButton(dialog, inputRow);

            dialog.appendChild(closeButton);
            dialog.appendChild(inputRow.row);
            dialog.appendChild(inputRow.checkboxContainer);
            dialog.appendChild(submitButton);

            document.body.appendChild(dialog);
        }

        static createCloseButton(dialog) {
            const closeButton = document.createElement('button');
            closeButton.textContent = '×';
            closeButton.className = 'modifier-close-btn';
            closeButton.addEventListener('click', () => dialog.remove());
            return closeButton;
        }

        static createInputRow() {
            const teaseContent = document.getElementById('tease_content');
            let initialDescription = '';

            if (teaseContent) {
                const content = teaseContent.textContent;
                const regex = /\{Modifier}(.+?)\{\/Modifier}/;
                const match = content.match(regex);

                if (match) {
                    initialDescription = match[1] || '';
                }
            }

            const inputRow = document.createElement('div');
            inputRow.className = 'modifier-input-row';

            const descriptionInput = document.createElement('input');
            descriptionInput.type = 'text';
            descriptionInput.placeholder = 'Enter description...';
            descriptionInput.value = initialDescription;
            descriptionInput.className = 'modifier-input';

            const counterInput = document.createElement('input');
            counterInput.type = 'number';
            counterInput.placeholder = '0';
            counterInput.step = '1';
            counterInput.className = 'modifier-input';

            const checkboxContainer = this.createCheckboxContainer();

            inputRow.appendChild(descriptionInput);
            inputRow.appendChild(counterInput);

            return { row: inputRow, checkboxContainer, descriptionInput, counterInput };
        }

        static createCheckboxContainer() {
            const checkboxContainer = document.createElement('div');
            checkboxContainer.style.display = 'flex';
            checkboxContainer.style.alignItems = 'center';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'modifier-checkbox';

            const label = document.createElement('label');
            label.textContent = 'Applies After Session';
            label.style.marginLeft = '5px';

            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);

            return checkboxContainer;
        }

        static createSubmitButton(dialog, inputRow) {
            const submitButton = document.createElement('button');
            submitButton.textContent = 'Add Modifier';
            submitButton.className = 'modifier-btn modifier-submit-btn';
            submitButton.addEventListener('click', () => {
                const description = inputRow.descriptionInput.value.trim();
                const counter = inputRow.counterInput.value ? parseInt(inputRow.counterInput.value, 10) : null;
                const appliesAfterSession = inputRow.checkboxContainer.querySelector('.modifier-checkbox').checked;
                const pageNumber = getCurrentPageNumber();

                if (description) {
                    this.addModifierToStorage(description, counter, appliesAfterSession, pageNumber);
                    this.updateModifierCount();
                    dialog.remove();
                } else {
                    alert('Please enter a valid description.');
                }
            });

            return submitButton;
        }

        static addModifierToStorage(description, counter, appliesAfterSession, pageNumber) {
            const modifiers = JSON.parse(localStorage.getItem(STORAGE.MODIFIERS)) || [];
            modifiers.push({ description, counter, appliesAfterSession, pageNumber });
            localStorage.setItem(STORAGE.MODIFIERS, JSON.stringify(modifiers));

            const modifiersListContainer = document.getElementById('modifiers-list-container');
            if (modifiersListContainer) {
                this.updateModifiersList(modifiersListContainer);
            }
        }

        static createEyeButton(container) {
            const eyeButton = document.createElement('button');
            eyeButton.textContent = '👁️';
            eyeButton.className = 'modifier-eye-btn';
            eyeButton.title = "Toggle display of current modifiers."
            eyeButton.addEventListener('click', () => this.toggleModifiersList(container));
            return eyeButton;
        }

        static toggleModifiersList(container) {
            const modifiersListContainer = document.getElementById('modifiers-list-container');
            if (modifiersListContainer) {
                modifiersListContainer.style.display =
                    modifiersListContainer.style.display === 'none' ? 'block' : 'none';
            } else {
                const listContainer = document.createElement('div');
                listContainer.id = 'modifiers-list-container';
                listContainer.className = 'modifiers-list-container';
                this.updateModifiersList(listContainer);
                container.appendChild(listContainer);
            }
        }
    }

    class SessionEndManager {
        static init() {
            const container = document.getElementById('my-extension-content');
            const endSessionRow = document.createElement('div');
            endSessionRow.className = 'stat-row';

            const endSessionLabel = document.createElement('span');
            endSessionLabel.className = 'stat-label';
            endSessionLabel.textContent = 'End Session:';

            const normalButton = document.createElement('button');
            normalButton.textContent = 'Normal';
            normalButton.title = "The session ended. Start your chastity sentence"
            normalButton.style.marginLeft = '10px';
            normalButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to end the session as Normal?')) {
                    this.endSessionNormal();
                }
            });

            const roButton = document.createElement('button');
            roButton.textContent = 'Ruined O';
            roButton.title = `You had an unauthorized ruined orgasm. End this session with the maximum of chastity possible.`
            roButton.style.marginLeft = '5px';
            roButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to end the session because of a ruined orgasm?')) {
                    this.endSessionRO();
                }
            });

            const wpButton = document.createElement('button');
            wpButton.textContent = 'Without Permission';

            wpButton.title = `End Session without permission. ${CONSTS.CHASTITY_PENALTY_FOR_LEAVING} days of chastity punishment.`
            wpButton.style.marginLeft = '5px';
            wpButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to end the session without permission?')) {
                    this.endSessionWP();
                }
            });

            endSessionRow.appendChild(endSessionLabel);
            endSessionRow.appendChild(normalButton);
            endSessionRow.appendChild(roButton);
            endSessionRow.appendChild(wpButton);
            container.appendChild(endSessionRow);
        }

        static getChastityValues() {
            const chastity = Math.max(parseInt(localStorage.getItem(STORAGE.CHASTITY_VALUE)) || 1, 1);
            const chastity_max = parseInt(localStorage.getItem(STORAGE.CHASTITY_MAX)) || CONSTS.CHASTITY_MAX_DEFAULT;
            const extra_chastity = parseInt(localStorage.getItem(STORAGE.CHASTITY_EXTRA)) || 0;

            return {chastity, chastity_max, extra_chastity};
        }

        static endSessionNormal() {
            const {chastity, chastity_max, extra_chastity} = this.getChastityValues();
            this._endSession(
                Math.min(chastity, chastity_max) + extra_chastity,
                0
            );
        }

        static endSessionRO() {
            const {chastity, chastity_max, extra_chastity} = this.getChastityValues();
            let actual_chastity = Math.min(chastity, chastity_max);
            if (Number.isFinite(CONSTS.PENALTY_FOR_RO)) {
                actual_chastity += CONSTS.PENALTY_FOR_RO;
            } else if (CONSTS.PENALTY_FOR_RO === "MAX") {
                actual_chastity = chastity_max;
            }

            this._endSession(
                actual_chastity + extra_chastity,
                CONSTS.POINTS_PENALTY_FOR_RO
            );
        }

        static endSessionWP(start_date = null) {
            const {chastity, chastity_max, extra_chastity} = this.getChastityValues();
            let actual_chastity = chastity;

            if (Number.isFinite(CONSTS.CHASTITY_PENALTY_FOR_LEAVING)) {
                actual_chastity += CONSTS.CHASTITY_PENALTY_FOR_LEAVING;
            } else if (CONSTS.CHASTITY_PENALTY_FOR_LEAVING === "AT_LEAST_HALF") {
                const halfChastity = Math.ceil(chastity_max / 2);
                actual_chastity = Math.max(actual_chastity, halfChastity);
            }

            this._endSession(
                Math.min(actual_chastity, chastity_max) + extra_chastity,
                CONSTS.POINTS_PENALTY_FOR_LEAVING, start_date
            );
        }

        static _endSession(chastity_duration_in_days, penalty_points, start_date = null) {
            const startDateTime = start_date ? new Date(start_date) : new Date();

            const endDateTime = new Date(startDateTime);
            endDateTime.setDate(endDateTime.getDate() + chastity_duration_in_days);
            endDateTime.setHours(endDateTime.getHours() - 2);

            const sessionEndData = {
                can_restart_now: false,
                end_date: endDateTime.toISOString(),
                penalty_points: penalty_points,
            };
            localStorage.setItem(STORAGE.BETWEEN_SESSION_DATA, JSON.stringify(sessionEndData));
            localStorage.setItem(STORAGE.SESSION_ACTIVE, false);

            window.location.href = BASE_URL;
        }
    }

    class ChastityBetweenSessionManager {
        static init() {
            const chastity_data = JSON.parse(localStorage.getItem(STORAGE.BETWEEN_SESSION_DATA)) || null;
            if (!chastity_data || chastity_data.can_restart_now) return false;

            const overlay = document.createElement('div');
            overlay.className = 'chastity-overlay';

            let end_date = new Date(chastity_data.end_date);

            // Container for the next session date and the "+1 Day" button
            const endDateDisplayContainer = document.createElement('div');
            endDateDisplayContainer.className = 'end-date-display-container';

            const endDateDisplay = document.createElement('span'); // Use a span for the date text
            endDateDisplay.className = 'end-date-display';

            // Update the date display text
            const updateEndDateDisplay = () => {
                endDateDisplay.textContent = `Next Session Date: ${end_date.toLocaleString()}`;
            };
            updateEndDateDisplay();

            // "+1 Day" button
            const addOneDayButton = document.createElement('button');
            addOneDayButton.className = 'add-one-day-button';
            addOneDayButton.textContent = '+1 Day';
            addOneDayButton.title = "Add a day more to you chastity sentence"
            addOneDayButton.addEventListener('click', () => {
                // Add 1 day to the end_date
                end_date.setDate(end_date.getDate() + 1);

                // Update the storage with the new end_date
                chastity_data.end_date = end_date.toISOString();
                localStorage.setItem(STORAGE.BETWEEN_SESSION_DATA, JSON.stringify(chastity_data));

                updateEndDateDisplay(); // Refresh the displayed date
            });

            // Append the span and button together in the container
            endDateDisplayContainer.appendChild(endDateDisplay);
            endDateDisplayContainer.appendChild(addOneDayButton);

            // Countdown display
            const countdownDisplay = document.createElement('div');
            countdownDisplay.className = 'countdown-display';

            const updateCountdown = () => {
                const now = new Date();
                const timeRemaining = end_date - now;

                // If the remaining time is 0 or less, end the session
                if (timeRemaining <= 0) {
                    chastity_data.can_restart_now = true;
                    localStorage.setItem(STORAGE.BETWEEN_SESSION_DATA, JSON.stringify(chastity_data));
                    localStorage.setItem(STORAGE.SESSION_ACTIVE, false);
                    window.location.href = BASE_URL;
                    return true;
                }

                // Calculate remaining time in days, hours, minutes, and seconds
                const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                // Update the countdown display text
                countdownDisplay.textContent = `Time Remaining: ${days}d ${hours}h ${minutes}m ${seconds}s`;
            };

            updateCountdown();
            const countdownInterval = setInterval(updateCountdown, 1000);

            const endEarlyButton = document.createElement('button');
            endEarlyButton.className = 'end-early-button';
            endEarlyButton.textContent = 'End Chastity Sentence Early';
            endEarlyButton.addEventListener('click', () => {
                // Confirm the action with the user
                const confirmEnd = confirm('Are you a little weakling that really wants to end your chastity sentence early?');
                if (confirmEnd) {
                    chastity_data.can_restart_now = true;
                    localStorage.setItem(STORAGE.BETWEEN_SESSION_DATA, JSON.stringify(chastity_data));
                    localStorage.setItem(STORAGE.SESSION_ACTIVE, false);
                    window.location.href = BASE_URL;
                }
            });

            // Modifiers section using ModifierManager
            const modifiersTitle = document.createElement('h3');
            modifiersTitle.textContent = 'Modifiers';
            modifiersTitle.className = 'modifiers-title';

            const modifiersContainer = document.createElement('div');
            modifiersContainer.className = 'modifiers-container';

            ModifierManager.only_after_session = true;
            ModifierManager.updateModifiersList(modifiersContainer);

            overlay.appendChild(endDateDisplayContainer);
            overlay.appendChild(countdownDisplay);
            overlay.appendChild(endEarlyButton);
            overlay.appendChild(modifiersTitle);
            overlay.appendChild(modifiersContainer);
            document.body.appendChild(overlay);

            return true;
        }
    }

    class SessionActiveManager {
        static last_session_data = null;

        static is_active() {
            this.last_session_data = JSON.parse(localStorage.getItem(STORAGE.BETWEEN_SESSION_DATA)) || null;
            return localStorage.getItem(STORAGE.SESSION_ACTIVE) === "true" || false;
        }

        static addSessionStartRow() {
            const container = document.getElementById('my-extension-content');
            const row = document.createElement('div');
            row.className = 'session-row';

            const dropdown = document.createElement('select');
            Object.keys(DIFFICULTY_CONSTS).forEach(key => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = key;
                dropdown.appendChild(option);
            });


            const currentDifficulty = localStorage.getItem(STORAGE.CURRENT_DIFFICULTY);
            if (currentDifficulty && DIFFICULTY_CONSTS[currentDifficulty]) {
                dropdown.value = currentDifficulty;
            } else {
                dropdown.selectedIndex = 0;
            }

            const dropdownLabel = document.createElement('span');
            dropdownLabel.className = 'session-label';
            dropdownLabel.textContent = 'Select Difficulty: ';

            const startButton = document.createElement('button');
            startButton.textContent = 'Start Session';
            startButton.addEventListener('click', () => {
                this.startSession(dropdown);
            });

            row.appendChild(dropdownLabel);
            row.appendChild(dropdown);
            row.appendChild(startButton);

            container.appendChild(row);
        }

        static startSession(dropdown) {
            const selectedDifficulty = dropdown.value;

            this.resetSessionValues(selectedDifficulty);

            localStorage.setItem(STORAGE.CURRENT_DIFFICULTY, selectedDifficulty);
            localStorage.setItem(STORAGE.SESSION_ACTIVE, true);

            window.location.href = getRandomURL();
        }

        static resetSessionValues(difficultyKey) {
            Object.values(STORAGE).forEach(key => {
                if (key === STORAGE.MODIFIERS) {
                    const modifiers = JSON.parse(localStorage.getItem(key)) || [];
                    const filteredModifiers = modifiers.filter(modifier => {
                        return modifier.appliesAfterSession !== false; // Keep only those where appliesAfterSession is true or undefined
                    });

                    localStorage.setItem(key, JSON.stringify(filteredModifiers));
                } else if (key === STORAGE.NOTES) {
                  // dont reset notes
                } else {
                    localStorage.removeItem(key);
                }
            });

            const difficultyDefaults = DIFFICULTY_CONSTS[difficultyKey];

            if (difficultyDefaults) {
                // Set the default values from the chosen difficulty
                Object.keys(difficultyDefaults).forEach(constKey => {
                    const storageKey = STORAGE[constKey.replace('_DEFAULT', '').toUpperCase()]; // Match corresponding STORAGE key (ignoring "_DEFAULT" suffix)
                    if (storageKey) {
                        localStorage.setItem(storageKey, difficultyDefaults[constKey]);
                    }
                });
            }

            if (this.last_session_data && this.last_session_data.penalty_points) {
                localStorage.setItem(STORAGE.POINTS, -this.last_session_data.penalty_points);
            }

            localStorage.removeItem(STORAGE.BETWEEN_SESSION_DATA);
        }
    }

    // --- Main function to roll new page, increment counters ---
    function setRandomUrl() {
        const randomUrl = getRandomURL()

        const original = document.getElementsByClassName("link")[0];
        const clone = original.cloneNode(true);
        clone.children[0].innerHTML = "Roll";
        clone.children[0].href = randomUrl;

        original.parentElement.appendChild(clone);

        const element = document.querySelector('.tease_pic');

        if (element) {
            element.parentElement.href = randomUrl;
        }
    }

    // --- Initialization ---
    addCSS();

    PauseManager.handlePauseLogic();
    replacePageWithAnchors(document.querySelector("#tease_content > p.text"));


    if (ChastityBetweenSessionManager.init()) {
        return;
    }
    const panelContent = createPanel();
    if (!SessionActiveManager.is_active()) {
        SessionActiveManager.addSessionStartRow();
        return;
    }
    PauseManager.checkAndResumePause();
    PointsManager.addRow();
    addChastityRow();
    EdgeManager.addRow();
    addPagesPauseRow();
    addRevisitedGoddessRow();
    ModifierManager.addRow();
    SessionEndManager.init();
    countPageView();
    ThreeMinuteReminder.init();

    setRandomUrl();
    localStorage.setItem(STORAGE.LAST_PAGE, getTeaseAndPageNumber());
})();

function disableRedirectOnSpacebar() {
    'use strict';

    function isEditable(el) {
        return el && (
            el.tagName === 'INPUT' ||
            el.tagName === 'TEXTAREA' ||
            el.isContentEditable
        );
    }

    const handleKey = function(e) {
        if ((e.code === 'Space' || e.key === ' ' || e.keyCode === 32)) {
            const target = e.target;

            if (isEditable(target)) {
                // Allow spacebar behavior inside inputs by manually dispatching
                e.stopImmediatePropagation();
                e.preventDefault();

                // Create and dispatch a new event to simulate a space input
                const evt = new InputEvent("input", {
                    bubbles: true,
                    cancelable: true,
                    inputType: "insertText",
                    data: " ",
                    dataTransfer: null
                });

                if (target.setRangeText) {
                    target.setRangeText(" ", target.selectionStart, target.selectionEnd, "end");
                    target.dispatchEvent(evt);
                } else {
                    // Fallback for contenteditable
                    document.execCommand("insertText", false, " ");
                }

            } else {
                e.stopImmediatePropagation();
                e.preventDefault();
            }
        }
    };

    window.addEventListener('keydown', handleKey, true);
    window.addEventListener('keypress', handleKey, true);
}

disableRedirectOnSpacebar();
