// ===============================
// VARIABLES
// ===============================

let habits = JSON.parse(localStorage.getItem("habits")) || [];

let editingId = null;


// ===============================
// ELEMENTS
// ===============================

const habitForm = document.getElementById("habitForm");

const habitName = document.getElementById("habitName");
const category = document.getElementById("category");
const priority = document.getElementById("priority");
const weeklyGoal = document.getElementById("weeklyGoal");

const habitList = document.getElementById("habitList");

const search = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");
const categoryFilter = document.getElementById("categoryFilter");
const sortBy = document.getElementById("sortBy");

const totalHabits = document.getElementById("totalHabits");
const doneToday = document.getElementById("doneToday");
const topStreak = document.getElementById("topStreak");
const sevenDayCompletion = document.getElementById("sevenDayCompletion");

const todayProgress = document.getElementById("todayProgress");
const progressText = document.getElementById("progressText");

const habitCount = document.getElementById("habitCount");

const toast = document.getElementById("toast");


// ===============================
// DATE
// ===============================

function getDateString(date = new Date()) {

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function displayDate() {

    const today = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    document.getElementById("currentDate").textContent =
        today.toLocaleDateString("en-US", options);
}


displayDate();


// ===============================
// SAVE DATA
// ===============================

function saveHabits() {

    localStorage.setItem(
        "habits",
        JSON.stringify(habits)
    );
}


// ===============================
// TOAST
// ===============================

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
}


// ===============================
// ADD HABIT
// ===============================

habitForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = habitName.value.trim();

    if (name === "") {

        alert("Please enter a habit name.");

        return;
    }


    if (category.value === "") {

        alert("Please select a category.");

        return;
    }


    // Editing existing habit
    if (editingId !== null) {

        const habit = habits.find(
            item => item.id === editingId
        );

        habit.name = name;
        habit.category = category.value;
        habit.priority = priority.value;
        habit.weeklyGoal = Number(weeklyGoal.value);

        editingId = null;

        document.querySelector(".add-btn").textContent =
            "Add Habit";

        showToast("Habit updated");

    }

    // Adding new habit
    else {

        const newHabit = {

            id: Date.now(),

            name: name,

            category: category.value,

            priority: priority.value,

            weeklyGoal: Number(weeklyGoal.value),

            completedDates: [],

            createdAt: Date.now()

        };


        habits.push(newHabit);

        showToast("Habit added");
    }


    saveHabits();

    habitForm.reset();

    priority.value = "Medium";
    weeklyGoal.value = "7";

    renderHabits();

});


// ===============================
// CHECK HABIT
// ===============================

function toggleToday(id) {

    const habit = habits.find(
        item => item.id === id
    );

    const today = getDateString();

    const index = habit.completedDates.indexOf(today);


    if (index === -1) {

        habit.completedDates.push(today);

        showToast("Habit completed");

    } else {

        habit.completedDates.splice(index, 1);

        showToast("Habit marked incomplete");
    }


    saveHabits();

    renderHabits();
}


// ===============================
// CALCULATE CURRENT STREAK
// ===============================

function getCurrentStreak(habit) {

    let streak = 0;

    let date = new Date();


    while (true) {

        const dateString = getDateString(date);

        if (habit.completedDates.includes(dateString)) {

            streak++;

            date.setDate(date.getDate() - 1);

        } else {

            break;
        }
    }


    return streak;
}


// ===============================
// BEST STREAK
// ===============================

function getBestStreak(habit) {

    if (habit.completedDates.length === 0) {
        return 0;
    }


    const dates = [...habit.completedDates]
        .sort();


    let best = 1;
    let current = 1;


    for (let i = 1; i < dates.length; i++) {

        const previous = new Date(dates[i - 1]);
        const currentDate = new Date(dates[i]);


        const difference =
            (currentDate - previous) /
            (1000 * 60 * 60 * 24);


        if (difference === 1) {

            current++;

            best = Math.max(best, current);

        } else {

            current = 1;
        }
    }


    return best;
}


// ===============================
// GET LAST 7 DAYS
// ===============================

function getLastSevenDays() {

    const days = [];

    for (let i = 6; i >= 0; i--) {

        const date = new Date();

        date.setDate(
            date.getDate() - i
        );

        days.push(date);
    }

    return days;
}


// ===============================
// WEEK COMPLETION
// ===============================

function getWeeklyCompleted(habit) {

    const days = getLastSevenDays();

    let count = 0;


    days.forEach(day => {

        const dateString = getDateString(day);

        if (habit.completedDates.includes(dateString)) {
            count++;
        }

    });


    return count;
}


// ===============================
// CREATE WEEK HTML
// ===============================

function createWeekHTML(habit) {

    const days = getLastSevenDays();

    const today = getDateString();

    let html = '<div class="week">';


    days.forEach(day => {

        const dateString = getDateString(day);

        const dayName = day.toLocaleDateString(
            "en-US",
            { weekday: "short" }
        );

        const dayNumber = day.getDate();


        const completed =
            habit.completedDates.includes(dateString);


        const isToday =
            dateString === today;


        html += `
            <div
                class="day
                ${completed ? "completed" : ""}
                ${isToday ? "today" : ""}"
                onclick="toggleDate(${habit.id}, '${dateString}')"
            >
                <div>${dayName}</div>
                <strong>${dayNumber}</strong>
            </div>
        `;
    });


    html += "</div>";


    const completed = getWeeklyCompleted(habit);

    const percentage =
        Math.min((completed / 7) * 100, 100);


    html += `
        <div class="week-progress">
            <div
                class="week-progress-fill"
                style="width:${percentage}%"
            ></div>
        </div>

        <div class="week-info">
            <span></span>
            <span>${completed}/7 this week</span>
        </div>
    `;


    return html;
}


// ===============================
// TOGGLE ANY DATE
// ===============================

function toggleDate(id, dateString) {

    const habit = habits.find(
        item => item.id === id
    );


    const index =
        habit.completedDates.indexOf(dateString);


    if (index === -1) {

        habit.completedDates.push(dateString);

    } else {

        habit.completedDates.splice(index, 1);

    }


    saveHabits();

    renderHabits();
}


// ===============================
// EDIT HABIT
// ===============================

function editHabit(id) {

    const habit = habits.find(
        item => item.id === id
    );


    habitName.value = habit.name;
    category.value = habit.category;
    priority.value = habit.priority;
    weeklyGoal.value = habit.weeklyGoal;


    editingId = id;


    document.querySelector(".add-btn").textContent =
        "Update Habit";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ===============================
// DELETE HABIT
// ===============================

function deleteHabit(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this habit?");


    if (!confirmDelete) {
        return;
    }


    habits = habits.filter(
        item => item.id !== id
    );


    saveHabits();

    renderHabits();

    showToast("Habit deleted");
}


// ===============================
// RENDER HABITS
// ===============================

function renderHabits() {

    let filteredHabits = [...habits];


    // Search
    const searchText =
        search.value.toLowerCase().trim();


    if (searchText !== "") {

        filteredHabits =
            filteredHabits.filter(habit =>
                habit.name
                    .toLowerCase()
                    .includes(searchText)
            );
    }


    // Status
    const today = getDateString();


    if (statusFilter.value === "done") {

        filteredHabits =
            filteredHabits.filter(habit =>
                habit.completedDates.includes(today)
            );

    } else if (statusFilter.value === "notdone") {

        filteredHabits =
            filteredHabits.filter(habit =>
                !habit.completedDates.includes(today)
            );
    }


    // Category
    if (categoryFilter.value !== "all") {

        filteredHabits =
            filteredHabits.filter(habit =>
                habit.category === categoryFilter.value
            );
    }


    // Sorting
    if (sortBy.value === "newest") {

        filteredHabits.sort(
            (a, b) => b.createdAt - a.createdAt
        );

    } else if (sortBy.value === "oldest") {

        filteredHabits.sort(
            (a, b) => a.createdAt - b.createdAt
        );

    } else if (sortBy.value === "name") {

        filteredHabits.sort(
            (a, b) =>
                a.name.localeCompare(b.name)
        );

    } else if (sortBy.value === "streak") {

        filteredHabits.sort(
            (a, b) =>
                getCurrentStreak(b) -
                getCurrentStreak(a)
        );
    }


    // Count
    habitCount.textContent =
        `Showing ${filteredHabits.length} of ${habits.length} habit(s)`;


    // Empty
    if (filteredHabits.length === 0) {

        habitList.innerHTML = `
            <div class="empty">
                No habits found.
            </div>
        `;

    } else {

        habitList.innerHTML =
            filteredHabits
                .map(createHabitHTML)
                .join("");
    }


    updateProgress();
}


// ===============================
// CREATE HABIT CARD
// ===============================

function createHabitHTML(habit) {

    const today = getDateString();

    const completedToday =
        habit.completedDates.includes(today);


    const currentStreak =
        getCurrentStreak(habit);


    const bestStreak =
        getBestStreak(habit);


    return `

        <div class="habit-card
            ${completedToday ? "completed" : ""}"
        >

            <div class="habit-top">

                <button
                    class="check-btn
                    ${completedToday ? "done" : ""}"
                    onclick="toggleToday(${habit.id})"
                >
                    ${completedToday ? "✓" : ""}
                </button>


                <div class="habit-info">

                    <h3>${escapeHTML(habit.name)}</h3>

                    <div class="badges">

                        <span class="badge">
                            ${habit.category}
                        </span>

                        <span class="badge">
                            ${habit.priority} priority
                        </span>

                        <span class="badge streak-badge">
                            Streak: ${currentStreak}
                        </span>

                        <span class="badge">
                            Best: ${bestStreak}
                        </span>

                        ${
                            completedToday
                            ?
                            `<span class="badge status-badge">
                                Done today
                            </span>`
                            :
                            `<span class="badge notdone-badge">
                                Not done
                            </span>`
                        }

                    </div>

                </div>


                <div class="card-buttons">

                    <button
                        class="edit-btn"
                        onclick="editHabit(${habit.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteHabit(${habit.id})"
                    >
                        Delete
                    </button>

                </div>

            </div>


            ${createWeekHTML(habit)}

        </div>
    `;
}


// ===============================
// UPDATE PROGRESS
// ===============================

function updateProgress() {

    const total = habits.length;


    const today = getDateString();


    const completed =
        habits.filter(habit =>
            habit.completedDates.includes(today)
        ).length;


    let percentage = 0;


    if (total > 0) {

        percentage =
            Math.round((completed / total) * 100);
    }


    // Top current streak
    let highestStreak = 0;


    habits.forEach(habit => {

        const streak =
            getCurrentStreak(habit);

        highestStreak =
            Math.max(highestStreak, streak);
    });


    // 7-day completion
    let totalPossible = total * 7;

    let totalCompleted = 0;


    habits.forEach(habit => {

        totalCompleted +=
            getWeeklyCompleted(habit);

    });


    let weeklyPercentage = 0;


    if (totalPossible > 0) {

        weeklyPercentage =
            Math.round(
                (totalCompleted / totalPossible) * 100
            );
    }


    totalHabits.textContent = total;

    doneToday.textContent = completed;

    topStreak.textContent = highestStreak;

    sevenDayCompletion.textContent =
        weeklyPercentage + "%";


    todayProgress.style.width =
        percentage + "%";


    progressText.textContent =
        `${completed} of ${total} habits done (${percentage}%)`;
}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ===============================
// FILTER EVENTS
// ===============================

search.addEventListener(
    "input",
    renderHabits
);


statusFilter.addEventListener(
    "change",
    renderHabits
);


categoryFilter.addEventListener(
    "change",
    renderHabits
);


sortBy.addEventListener(
    "change",
    renderHabits
);


// ===============================
// DARK MODE
// ===============================

const darkModeBtn =
    document.getElementById("darkModeBtn");


darkModeBtn.addEventListener(
    "click",
    function() {

        document.body.classList.toggle("dark");


        if (
            document.body.classList.contains("dark")
        ) {

            darkModeBtn.textContent =
                "Light mode";

            localStorage.setItem(
                "darkMode",
                "true"
            );

        } else {

            darkModeBtn.textContent =
                "Dark mode";

            localStorage.setItem(
                "darkMode",
                "false"
            );
        }
    }
);


// Load dark mode
if (
    localStorage.getItem("darkMode") === "true"
) {

    document.body.classList.add("dark");

    darkModeBtn.textContent =
        "Light mode";
}


// ===============================
// EXPORT
// ===============================

document.getElementById("exportBtn")
    .addEventListener("click", function() {

        const data =
            JSON.stringify(habits, null, 2);


        const blob =
            new Blob([data], {
                type: "application/json"
            });


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "habit-tracker-data.json";


        link.click();


        URL.revokeObjectURL(url);

        showToast("Habits exported");
    });


// ===============================
// IMPORT
// ===============================

document.getElementById("importBtn")
    .addEventListener("click", function() {

        document.getElementById("importFile").click();

    });


document.getElementById("importFile")
    .addEventListener("change", function(event) {

        const file = event.target.files[0];


        if (!file) {
            return;
        }


        const reader = new FileReader();


        reader.onload = function(e) {

            try {

                const imported =
                    JSON.parse(e.target.result);


                if (!Array.isArray(imported)) {

                    alert("Invalid habit data.");

                    return;
                }


                habits = imported;

                saveHabits();

                renderHabits();

                showToast("Habits imported");

            } catch (error) {

                alert("Could not import the file.");

            }
        };


        reader.readAsText(file);
    });


// ===============================
// FIRST LOAD
// ===============================

renderHabits();