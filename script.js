// ===============================
// HABIT TRACKER PRO - JAVASCRIPT
// ===============================


// ===============================
// VARIABLES
// ===============================

let habits = [];

let editingId = null;


// ===============================
// HTML ELEMENTS
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
const sevenDayCompletion =
    document.getElementById("sevenDayCompletion");

const todayProgress =
    document.getElementById("todayProgress");

const progressText =
    document.getElementById("progressText");

const habitCount =
    document.getElementById("habitCount");

const toast =
    document.getElementById("toast");

const darkModeBtn =
    document.getElementById("darkModeBtn");


// ===============================
// LOAD HABITS FROM LOCAL STORAGE
// ===============================

function loadHabits() {

    try {

        const savedHabits =
            localStorage.getItem("habits");

        if (savedHabits) {

            const data =
                JSON.parse(savedHabits);

            if (Array.isArray(data)) {

                habits = data.map(function(habit) {

                    return {
                        id: habit.id,
                        name: habit.name || "",
                        category: habit.category || "Personal",
                        priority: habit.priority || "Medium",
                        weeklyGoal:
                            Number(habit.weeklyGoal) || 7,

                        completedDates:
                            Array.isArray(habit.completedDates)
                                ? habit.completedDates
                                : [],

                        createdAt:
                            habit.createdAt || Date.now()
                    };

                });

            }

        }

    } catch (error) {

        console.log("Could not load habits.");

        habits = [];
    }
}


loadHabits();


// ===============================
// DATE FUNCTION
// ===============================

function getDateString(date = new Date()) {

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ===============================
// DISPLAY CURRENT DATE
// ===============================

function displayDate() {

    const today =
        new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    document.getElementById("currentDate")
        .textContent =
        today.toLocaleDateString(
            "en-US",
            options
        );
}


displayDate();


// ===============================
// SAVE HABITS
// ===============================

function saveHabits() {

    localStorage.setItem(
        "habits",
        JSON.stringify(habits)
    );
}


// ===============================
// SHOW MESSAGE
// ===============================

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(function() {

        toast.classList.remove("show");

    }, 1800);
}


// ===============================
// ADD / UPDATE HABIT
// ===============================

habitForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const name =
            habitName.value.trim();


        // Validation
        if (name === "") {

            alert("Please enter a habit name.");

            habitName.focus();

            return;
        }


        if (category.value === "") {

            alert("Please select a category.");

            category.focus();

            return;
        }


        // ===========================
        // UPDATE EXISTING HABIT
        // ===========================

        if (editingId !== null) {

            const habit =
                habits.find(function(item) {

                    return item.id === editingId;

                });


            if (habit) {

                habit.name = name;

                habit.category =
                    category.value;

                habit.priority =
                    priority.value;

                habit.weeklyGoal =
                    Number(weeklyGoal.value);

                showToast("Habit updated");
            }


            editingId = null;

            document.querySelector(".add-btn")
                .textContent = "Add Habit";

        }


        // ===========================
        // ADD NEW HABIT
        // ===========================

        else {

            const newHabit = {

                id: Date.now(),

                name: name,

                category:
                    category.value,

                priority:
                    priority.value,

                weeklyGoal:
                    Number(weeklyGoal.value),

                completedDates: [],

                createdAt:
                    Date.now()
            };


            habits.push(newHabit);

            showToast("Habit added");
        }


        // Save
        saveHabits();


        // Reset form
        habitForm.reset();

        priority.value = "Medium";

        weeklyGoal.value = "7";


        // Refresh screen
        renderHabits();

    }
);


// ===============================
// COMPLETE / UNCOMPLETE TODAY
// ===============================

function toggleToday(id) {

    const habit =
        habits.find(function(item) {

            return item.id === id;

        });


    if (!habit) {

        return;
    }


    // Make sure completedDates exists
    if (!Array.isArray(habit.completedDates)) {

        habit.completedDates = [];
    }


    const today =
        getDateString();


    const index =
        habit.completedDates.indexOf(today);


    // Complete
    if (index === -1) {

        habit.completedDates.push(today);

        showToast("Habit completed");

    }

    // Uncomplete
    else {

        habit.completedDates.splice(
            index,
            1
        );

        showToast("Habit marked incomplete");
    }


    // Save changes
    saveHabits();


    // Refresh habit cards + progress
    renderHabits();
}


// ===============================
// CURRENT STREAK
// ===============================

function getCurrentStreak(habit) {

    if (
        !habit ||
        !Array.isArray(habit.completedDates)
    ) {

        return 0;
    }


    let streak = 0;

    let date = new Date();


    while (true) {

        const dateString =
            getDateString(date);


        if (
            habit.completedDates
                .includes(dateString)
        ) {

            streak++;

            date.setDate(
                date.getDate() - 1
            );

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

    if (
        !habit ||
        !Array.isArray(habit.completedDates) ||
        habit.completedDates.length === 0
    ) {

        return 0;
    }


    const dates =
        [...habit.completedDates]
            .sort();


    let best = 1;

    let current = 1;


    for (
        let i = 1;
        i < dates.length;
        i++
    ) {

        const previous =
            new Date(dates[i - 1]);

        const currentDate =
            new Date(dates[i]);


        const difference =
            Math.round(
                (currentDate - previous) /
                (1000 * 60 * 60 * 24)
            );


        if (difference === 1) {

            current++;

            best =
                Math.max(
                    best,
                    current
                );

        } else {

            current = 1;
        }
    }


    return best;
}


// ===============================
// LAST 7 DAYS
// ===============================

function getLastSevenDays() {

    const days = [];


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date();


        date.setDate(
            date.getDate() - i
        );


        days.push(date);
    }


    return days;
}


// ===============================
// WEEKLY COMPLETION
// ===============================

function getWeeklyCompleted(habit) {

    if (
        !habit ||
        !Array.isArray(habit.completedDates)
    ) {

        return 0;
    }


    const days =
        getLastSevenDays();


    let count = 0;


    days.forEach(function(day) {

        const dateString =
            getDateString(day);


        if (
            habit.completedDates
                .includes(dateString)
        ) {

            count++;
        }

    });


    return count;
}


// ===============================
// CREATE 7-DAY VIEW
// ===============================

function createWeekHTML(habit) {

    const days =
        getLastSevenDays();


    const today =
        getDateString();


    let html =
        '<div class="week">';


    days.forEach(function(day) {

        const dateString =
            getDateString(day);


        const dayName =
            day.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );


        const dayNumber =
            day.getDate();


        const completed =
            habit.completedDates
                .includes(dateString);


        const isToday =
            dateString === today;


        html += `

            <div
                class="day
                ${completed ? "completed" : ""}
                ${isToday ? "today" : ""}"
                onclick="toggleDate(
                    ${habit.id},
                    '${dateString}'
                )"
            >

                <div>${dayName}</div>

                <strong>${dayNumber}</strong>

            </div>

        `;

    });


    html += "</div>";


    const completed =
        getWeeklyCompleted(habit);


    const percentage =
        Math.min(
            (completed / 7) * 100,
            100
        );


    html += `

        <div class="week-progress">

            <div
                class="week-progress-fill"
                style="width:${percentage}%"
            ></div>

        </div>


        <div class="week-info">

            <span></span>

            <span>
                ${completed}/7 this week
            </span>

        </div>

    `;


    return html;
}


// ===============================
// TOGGLE ANY DAY
// ===============================

function toggleDate(
    id,
    dateString
) {

    const habit =
        habits.find(function(item) {

            return item.id === id;

        });


    if (!habit) {

        return;
    }


    if (!Array.isArray(habit.completedDates)) {

        habit.completedDates = [];
    }


    const index =
        habit.completedDates
            .indexOf(dateString);


    if (index === -1) {

        habit.completedDates
            .push(dateString);

    } else {

        habit.completedDates
            .splice(index, 1);
    }


    saveHabits();

    renderHabits();
}


// ===============================
// EDIT HABIT
// ===============================

function editHabit(id) {

    const habit =
        habits.find(function(item) {

            return item.id === id;

        });


    if (!habit) {

        return;
    }


    habitName.value =
        habit.name;

    category.value =
        habit.category;

    priority.value =
        habit.priority;

    weeklyGoal.value =
        habit.weeklyGoal;


    editingId = id;


    document.querySelector(".add-btn")
        .textContent =
        "Update Habit";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    habitName.focus();
}


// ===============================
// DELETE HABIT
// ===============================

function deleteHabit(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this habit?"
        );


    if (!confirmDelete) {

        return;
    }


    habits =
        habits.filter(function(item) {

            return item.id !== id;

        });


    saveHabits();

    renderHabits();

    showToast("Habit deleted");
}


// ===============================
// CREATE HABIT CARD
// ===============================

function createHabitHTML(habit) {

    const today =
        getDateString();


    const completedToday =
        habit.completedDates
            .includes(today);


    const currentStreak =
        getCurrentStreak(habit);


    const bestStreak =
        getBestStreak(habit);


    return `

        <div class="habit-card
            ${completedToday ? "completed" : ""}"
        >

            <div class="habit-top">


                <!-- Check Button -->

                <button
                    class="check-btn
                    ${completedToday ? "done" : ""}"

                    onclick="
                        toggleToday(${habit.id})
                    "
                >

                    ${
                        completedToday
                            ? "✓"
                            : ""
                    }

                </button>


                <!-- Habit Information -->

                <div class="habit-info">

                    <h3>
                        ${escapeHTML(habit.name)}
                    </h3>


                    <div class="badges">


                        <span class="badge">
                            ${escapeHTML(
                                habit.category
                            )}
                        </span>


                        <span class="badge">
                            ${escapeHTML(
                                habit.priority
                            )}
                            priority
                        </span>


                        <span class="badge streak-badge">
                            Streak:
                            ${currentStreak}
                        </span>


                        <span class="badge">
                            Best:
                            ${bestStreak}
                        </span>


                        ${
                            completedToday

                            ?

                            `
                            <span
                                class="badge status-badge"
                            >
                                Done today
                            </span>
                            `

                            :

                            `
                            <span
                                class="badge notdone-badge"
                            >
                                Not done
                            </span>
                            `
                        }


                    </div>

                </div>


                <!-- Buttons -->

                <div class="card-buttons">


                    <button
                        class="edit-btn"
                        onclick="
                            editHabit(${habit.id})
                        "
                    >
                        Edit
                    </button>


                    <button
                        class="delete-btn"
                        onclick="
                            deleteHabit(${habit.id})
                        "
                    >
                        Delete
                    </button>


                </div>

            </div>


            <!-- Seven Day Tracking -->

            ${createWeekHTML(habit)}


        </div>

    `;
}


// ===============================
// RENDER HABITS
// ===============================

function renderHabits() {

    let filteredHabits =
        [...habits];


    // ===========================
    // SEARCH
    // ===========================

    const searchText =
        search.value
            .toLowerCase()
            .trim();


    if (searchText !== "") {

        filteredHabits =
            filteredHabits.filter(
                function(habit) {

                    return habit.name
                        .toLowerCase()
                        .includes(searchText);

                }
            );
    }


    // ===========================
    // STATUS FILTER
    // ===========================

    const today =
        getDateString();


    if (
        statusFilter.value === "done"
    ) {

        filteredHabits =
            filteredHabits.filter(
                function(habit) {

                    return habit.completedDates
                        .includes(today);

                }
            );

    }


    else if (
        statusFilter.value === "notdone"
    ) {

        filteredHabits =
            filteredHabits.filter(
                function(habit) {

                    return !habit.completedDates
                        .includes(today);

                }
            );
    }


    // ===========================
    // CATEGORY FILTER
    // ===========================

    if (
        categoryFilter.value !== "all"
    ) {

        filteredHabits =
            filteredHabits.filter(
                function(habit) {

                    return habit.category ===
                        categoryFilter.value;

                }
            );
    }


    // ===========================
    // SORT
    // ===========================

    if (
        sortBy.value === "newest"
    ) {

        filteredHabits.sort(
            function(a, b) {

                return b.createdAt -
                    a.createdAt;

            }
        );

    }


    else if (
        sortBy.value === "oldest"
    ) {

        filteredHabits.sort(
            function(a, b) {

                return a.createdAt -
                    b.createdAt;

            }
        );

    }


    else if (
        sortBy.value === "name"
    ) {

        filteredHabits.sort(
            function(a, b) {

                return a.name
                    .localeCompare(b.name);

            }
        );

    }


    else if (
        sortBy.value === "streak"
    ) {

        filteredHabits.sort(
            function(a, b) {

                return getCurrentStreak(b) -
                    getCurrentStreak(a);

            }
        );
    }


    // ===========================
    // HABIT COUNT
    // ===========================

    habitCount.textContent =
        `Showing ${filteredHabits.length} of ${habits.length} habit(s)`;


    // ===========================
    // DISPLAY HABITS
    // ===========================

    if (
        filteredHabits.length === 0
    ) {

        habitList.innerHTML = `

            <div class="empty">

                No habits found.

            </div>

        `;

    }

    else {

        habitList.innerHTML =
            filteredHabits
                .map(createHabitHTML)
                .join("");
    }


    // ===========================
    // UPDATE PROGRESS
    // ===========================

    updateProgress();
}


// ===============================
// UPDATE ALL PROGRESS
// ===============================

function updateProgress() {

    const today =
        getDateString();


    // ===========================
    // TOTAL HABITS
    // ===========================

    const total =
        habits.length;


    // ===========================
    // COMPLETED TODAY
    // ===========================

    let completedToday = 0;


    habits.forEach(function(habit) {

        if (
            Array.isArray(
                habit.completedDates
            ) &&
            habit.completedDates
                .includes(today)
        ) {

            completedToday++;
        }

    });


    // ===========================
    // TODAY'S PERCENTAGE
    // ===========================

    let todayPercentage = 0;


    if (total > 0) {

        todayPercentage =
            Math.round(
                (completedToday / total) * 100
            );
    }


    // ===========================
    // HIGHEST CURRENT STREAK
    // ===========================

    let highestStreak = 0;


    habits.forEach(function(habit) {

        const streak =
            getCurrentStreak(habit);


        if (
            streak > highestStreak
        ) {

            highestStreak =
                streak;
        }

    });


    // ===========================
    // 7-DAY COMPLETION
    // ===========================

    let completedLast7Days = 0;


    habits.forEach(function(habit) {

        completedLast7Days +=
            getWeeklyCompleted(habit);

    });


    const totalPossible =
        total * 7;


    let weeklyPercentage = 0;


    if (
        totalPossible > 0
    ) {

        weeklyPercentage =
            Math.round(
                (
                    completedLast7Days /
                    totalPossible
                ) * 100
            );
    }


    // ===========================
    // UPDATE HTML
    // ===========================

    totalHabits.textContent =
        total;


    doneToday.textContent =
        completedToday;


    topStreak.textContent =
        highestStreak;


    sevenDayCompletion.textContent =
        weeklyPercentage + "%";


    // IMPORTANT:
    // Update today's progress bar

    todayProgress.style.width =
        todayPercentage + "%";


    // IMPORTANT:
    // Update progress text

    progressText.textContent =
        `${completedToday} of ${total} habits done (${todayPercentage}%)`;
}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;
}


// ===============================
// SEARCH
// ===============================

search.addEventListener(
    "input",
    function() {

        renderHabits();

    }
);


// ===============================
// STATUS FILTER
// ===============================

statusFilter.addEventListener(
    "change",
    function() {

        renderHabits();

    }
);


// ===============================
// CATEGORY FILTER
// ===============================

categoryFilter.addEventListener(
    "change",
    function() {

        renderHabits();

    }
);


// ===============================
// SORT
// ===============================

sortBy.addEventListener(
    "change",
    function() {

        renderHabits();

    }
);


// ===============================
// DARK MODE
// ===============================

darkModeBtn.addEventListener(
    "click",
    function() {

        document.body.classList.toggle("dark");


        if (
            document.body.classList
                .contains("dark")
        ) {

            darkModeBtn.textContent =
                "Light mode";


            localStorage.setItem(
                "darkMode",
                "true"
            );

        }

        else {

            darkModeBtn.textContent =
                "Dark mode";


            localStorage.setItem(
                "darkMode",
                "false"
            );
        }

    }
);


// ===============================
// LOAD DARK MODE
// ===============================

if (
    localStorage.getItem("darkMode")
    === "true"
) {

    document.body.classList.add("dark");

    darkModeBtn.textContent =
        "Light mode";
}


// ===============================
// EXPORT
// ===============================

document.getElementById("exportBtn")
    .addEventListener(
        "click",
        function() {

            const data =
                JSON.stringify(
                    habits,
                    null,
                    2
                );


            const blob =
                new Blob(
                    [data],
                    {
                        type:
                            "application/json"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href = url;


            link.download =
                "habit-tracker-data.json";


            link.click();


            URL.revokeObjectURL(
                url
            );


            showToast(
                "Habits exported"
            );

        }
    );


// ===============================
// IMPORT BUTTON
// ===============================

document.getElementById("importBtn")
    .addEventListener(
        "click",
        function() {

            document
                .getElementById(
                    "importFile"
                )
                .click();

        }
    );


// ===============================
// IMPORT FILE
// ===============================

document.getElementById("importFile")
    .addEventListener(
        "change",
        function(event) {

            const file =
                event.target.files[0];


            if (!file) {

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function(e) {

                    try {

                        const imported =
                            JSON.parse(
                                e.target.result
                            );


                        if (
                            !Array.isArray(
                                imported
                            )
                        ) {

                            alert(
                                "Invalid habit data."
                            );

                            return;
                        }


                        habits =
                            imported;


                        saveHabits();

                        renderHabits();


                        showToast(
                            "Habits imported"
                        );


                    }

                    catch (error) {

                        alert(
                            "Could not import the file."
                        );
                    }

                };


            reader.readAsText(file);

        }
    );


// ===============================
// FIRST LOAD
// ===============================

renderHabits();