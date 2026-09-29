// ================================
// HABIT TRACKER - simple version
// ================================

// ---------- 1. Get elements from the page ----------
const habitForm = document.getElementById("habitForm");
const habitName = document.getElementById("habitName");
const habitCategory = document.getElementById("habitCategory");
const errorMessage = document.getElementById("errorMessage");
const formTitle = document.getElementById("formTitle");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const categoryFilter = document.getElementById("categoryFilter");

const habitList = document.getElementById("habitList");
const emptyMessage = document.getElementById("emptyMessage");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

// ---------- 2. Data ----------
// Each habit looks like:
// { id: 123, name: "Drink water", category: "Health", dates: ["2026-09-29"] }
// "dates" stores every day the habit was completed.
let habits = [];

// If this is a number, we are editing that habit. If null, we are adding.
let editingId = null;

// ---------- 3. Local Storage ----------
function saveHabits() {
  // Local Storage can only store text, so we convert the array to JSON text
  localStorage.setItem("habits", JSON.stringify(habits));
}

function loadHabits() {
  const saved = localStorage.getItem("habits");
  if (saved) {
    habits = JSON.parse(saved); // convert text back to an array
  }
}

// ---------- 4. Date helper ----------
// Returns a date as text like "2026-09-29"
function getDateText(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function getToday() {
  return getDateText(new Date());
}

// ---------- 5. Streak ----------
// Streak = how many days in a row the habit was completed
function getStreak(habit) {
  let streak = 0;
  let day = new Date(); // start from today

  // If today is not done yet, start counting from yesterday
  if (!habit.dates.includes(getDateText(day))) {
    day.setDate(day.getDate() - 1);
  }

  // Keep going back one day while the day is in the list
  while (habit.dates.includes(getDateText(day))) {
    streak++;
    day.setDate(day.getDate() - 1);
  }

  return streak;
}

// ---------- 6. Validation ----------
// Returns an error message, or "" if everything is OK
function validate(name, category) {
  if (name === "") {
    return "Please enter a habit name.";
  }
  if (name.length < 2) {
    return "Habit name must be at least 2 characters.";
  }
  if (name.length > 40) {
    return "Habit name must be 40 characters or less.";
  }
  if (category === "") {
    return "Please select a category.";
  }

  // Check for duplicate names (ignore the habit we are editing)
  for (let i = 0; i < habits.length; i++) {
    const sameName = habits[i].name.toLowerCase() === name.toLowerCase();
    const isOtherHabit = habits[i].id !== editingId;
    if (sameName && isOtherHabit) {
      return "This habit already exists.";
    }
  }

  return "";
}

// ---------- 7. Add habit ----------
function addHabit(name, category) {
  const newHabit = {
    id: Date.now(), // a unique number
    name: name,
    category: category,
    dates: []
  };
  habits.push(newHabit);
  saveHabits();
  showHabits();
}

// ---------- 8. Edit habit ----------
// Step 1: put the habit's data into the form
function startEdit(id) {
  const habit = habits.find(function (h) {
    return h.id === id;
  });

  editingId = id;
  habitName.value = habit.name;
  habitCategory.value = habit.category;

  formTitle.textContent = "Edit Habit";
  saveButton.textContent = "Save Changes";
  cancelButton.hidden = false;
  habitName.focus();
}

// Step 2: save the new values
function updateHabit(name, category) {
  const habit = habits.find(function (h) {
    return h.id === editingId;
  });

  habit.name = name;
  habit.category = category;

  saveHabits();
  stopEdit();
  showHabits();
}

// Go back to "Add" mode
function stopEdit() {
  editingId = null;
  habitForm.reset();
  formTitle.textContent = "Add Habit";
  saveButton.textContent = "Add Habit";
  cancelButton.hidden = true;
  errorMessage.textContent = "";
}

// ---------- 9. Delete habit ----------
function deleteHabit(id) {
  const ok = confirm("Are you sure you want to delete this habit?");
  if (!ok) {
    return;
  }

  // Keep every habit except the one we are deleting
  habits = habits.filter(function (h) {
    return h.id !== id;
  });

  saveHabits();
  showHabits();
}

// ---------- 10. Daily check ----------
function toggleToday(id) {
  const habit = habits.find(function (h) {
    return h.id === id;
  });

  const today = getToday();

  if (habit.dates.includes(today)) {
    // already done -> undo it
    habit.dates = habit.dates.filter(function (d) {
      return d !== today;
    });
  } else {
    // not done -> mark as done
    habit.dates.push(today);
  }

  saveHabits();
  showHabits();
}

// ---------- 11. Search + Filter ----------
// Returns only the habits that match the search box and the filters
function getFilteredHabits() {
  const searchText = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  const category = categoryFilter.value;
  const today = getToday();

  return habits.filter(function (habit) {
    const doneToday = habit.dates.includes(today);

    // search by name
    if (!habit.name.toLowerCase().includes(searchText)) {
      return false;
    }
    // filter by status
    if (status === "done" && !doneToday) {
      return false;
    }
    if (status === "notdone" && doneToday) {
      return false;
    }
    // filter by category
    if (category !== "all" && habit.category !== category) {
      return false;
    }

    return true; // habit passed every check
  });
}

// ---------- 12. Progress ----------
function showProgress() {
  const today = getToday();
  const total = habits.length;

  let doneCount = 0;
  habits.forEach(function (habit) {
    if (habit.dates.includes(today)) {
      doneCount++;
    }
  });

  let percent = 0;
  if (total > 0) {
    percent = Math.round((doneCount / total) * 100);
  }

  progressText.textContent = doneCount + " of " + total + " habits done (" + percent + "%)";
  progressFill.style.width = percent + "%";
}

// Prevents user text from being treated as HTML
function safeText(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---------- 13. Show habits on the page ----------
function showHabits() {
  const list = getFilteredHabits();
  const today = getToday();

  habitList.innerHTML = ""; // clear old list

  // Empty state
  if (habits.length === 0) {
    emptyMessage.textContent = "No habits yet. Add your first habit!";
  } else if (list.length === 0) {
    emptyMessage.textContent = "No habits match your search or filter.";
  } else {
    emptyMessage.textContent = "";
  }

  // Create one <li> for each habit
  list.forEach(function (habit) {
    const doneToday = habit.dates.includes(today);
    const streak = getStreak(habit);

    const li = document.createElement("li");
    li.className = doneToday ? "habit done" : "habit";

    li.innerHTML =
      '<div class="habit-info">' +
        '<div class="habit-name">' + safeText(habit.name) + '</div>' +
        '<p>' + habit.category + ' | Streak: ' + streak + ' day(s) | ' +
        (doneToday ? 'Done today' : 'Not done today') + '</p>' +
      '</div>' +
      '<div class="buttons">' +
        '<button class="check-btn">' + (doneToday ? 'Undo' : 'Done') + '</button>' +
        '<button class="edit-btn grey">Edit</button>' +
        '<button class="delete-btn red">Delete</button>' +
      '</div>';

    // Connect the buttons inside this habit
    li.querySelector(".check-btn").addEventListener("click", function () {
      toggleToday(habit.id);
    });
    li.querySelector(".edit-btn").addEventListener("click", function () {
      startEdit(habit.id);
    });
    li.querySelector(".delete-btn").addEventListener("click", function () {
      deleteHabit(habit.id);
    });

    habitList.appendChild(li);
  });

  showProgress();
}

// ---------- 14. Events ----------
// When the form is submitted
habitForm.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  const name = habitName.value.trim();
  const category = habitCategory.value;

  const error = validate(name, category);
  if (error !== "") {
    errorMessage.textContent = error;
    return; // stop here, do not save
  }

  errorMessage.textContent = "";

  if (editingId === null) {
    addHabit(name, category);
    habitForm.reset();
  } else {
    updateHabit(name, category);
  }
});

cancelButton.addEventListener("click", stopEdit);

// Update the list whenever the user types or changes a filter
searchInput.addEventListener("input", showHabits);
statusFilter.addEventListener("change", showHabits);
categoryFilter.addEventListener("change", showHabits);

// ---------- 15. Start the app ----------
document.getElementById("todayDate").textContent = new Date().toDateString();
loadHabits();
showHabits();