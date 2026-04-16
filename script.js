/**
 * ГОЛОВНИЙ ФАЙЛ СКРИПТІВ
 * Тут зібрана вся логіка платформи: меню, теми, прогрес та авторизація.
 */

// Глобальні змінні для збереження стану користувача
let currentUser = "";
let progressKey = "";

// ==========================================
// === 1. ГОЛОВНИЙ ЗАПУСК (ENTRY POINT) ===
// ==========================================
// Чекаємо, поки весь HTML завантажиться, і лише тоді запускаємо скрипти
document.addEventListener("DOMContentLoaded", () => {
    initAccordion();
    initNavigation();
    initTheme();
    initLoginSystem(); // Ця функція перевірить користувача і запустить систему прогресу
    initScrollToTop();
    initLessonNavigation();
    initStartCourseButton();
    initCopyButtons();
});

// ==========================================
// === 2. ЛОГІКА ІНТЕРФЕЙСУ (UI) ===
// ==========================================

// Акордеон (бокове меню)
function initAccordion() {
    const blockToggles = document.querySelectorAll(".block-toggle");
    // Кешуємо елементи один раз, щоб не шукати їх при кожному кліку
    const allBlockLists = document.querySelectorAll(".block-list");
    const allArrows = document.querySelectorAll(".block-toggle .arrow");

    blockToggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
            const currentList = toggle.nextElementSibling;
            const currentArrow = toggle.querySelector(".arrow");
            const isOpen = currentList?.classList.contains("open");

            // Закриваємо всі блоки
            allBlockLists.forEach((list) => list.classList.remove("open"));
            allArrows.forEach((arrow) => arrow.textContent = "▶");

            // Відкриваємо клікнутий, якщо він був закритий
            if (!isOpen && currentList && currentArrow) {
                currentList.classList.add("open");
                currentArrow.textContent = "▼";
            }
        });
    });
}

// Навігація між уроками
function initNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();

            // Оптимізація: шукаємо та вимикаємо тільки активні елементи
            const currentActiveLink = document.querySelector(".nav-link.active");
            const currentActiveSection = document.querySelector(".lesson-section.active");

            if (currentActiveLink) currentActiveLink.classList.remove("active");
            if (currentActiveSection) currentActiveSection.classList.remove("active");

            // Активуємо новий пункт меню
            link.classList.add("active");

            // Використовуємо .dataset для отримання атрибута data-target
            const targetId = link.dataset.target;
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.classList.add("active");
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    });
}

// Темна/Світла тема
function initTheme() {
    const themeBtn = document.getElementById("theme-toggle");
    const body = document.body;

    // Відновлюємо тему при завантаженні
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        body.dataset.theme = savedTheme;
    }

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const newTheme = body.dataset.theme === "light" ? "dark" : "light";
            body.dataset.theme = newTheme;
            localStorage.setItem("theme", newTheme);
        });
    }
}

// Кнопки копіювання коду
function initCopyButtons() {
    const codeBlocks = document.querySelectorAll("pre");

    codeBlocks.forEach((block) => {
        const copyButton = document.createElement("button");
        copyButton.innerText = "Копіювати";
        copyButton.className = "copy-btn";
        block.appendChild(copyButton);

        copyButton.addEventListener("click", () => {
            const codeElement = block.querySelector("code");
            const textToCopy = codeElement ? codeElement.innerText : "";

            navigator.clipboard.writeText(textToCopy).then(() => {
                copyButton.innerText = "Скопійовано! ✅";
                copyButton.classList.add("copied");

                setTimeout(() => {
                    copyButton.innerText = "Копіювати";
                    copyButton.classList.remove("copied");
                }, 2000);
            }).catch((err) => {
                console.error("Помилка копіювання: ", err);
                copyButton.innerText = "Помилка ❌";
            });
        });
    });
}

// Кнопка "Вгору"
function initScrollToTop() {
    const topBtn = document.getElementById("scrollToTop");
    if (!topBtn) return;

    window.addEventListener("scroll", () => {
        topBtn.style.display = window.scrollY > 300 ? "block" : "none";
    });

    topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// Кнопки "Попередній / Наступний урок"
function initLessonNavigation() {
    const allLessons = document.querySelectorAll(".lesson-section");

    allLessons.forEach((section, index) => {
        const prevBtn = section.querySelector(".prev-btn");
        const nextBtn = section.querySelector(".next-btn");

        if (prevBtn) {
            if (index === 0) {
                prevBtn.disabled = true;
            } else {
                prevBtn.addEventListener("click", () => {
                    const targetId = allLessons[index - 1].getAttribute("id");
                    const link = document.querySelector(`.nav-link[data-target="${targetId}"]`);
                    if (link) link.click();
                });
            }
        }

        if (nextBtn) {
            if (index === allLessons.length - 1) {
                nextBtn.disabled = true;
            } else {
                nextBtn.addEventListener("click", () => {
                    const targetId = allLessons[index + 1].getAttribute("id");
                    const link = document.querySelector(`.nav-link[data-target="${targetId}"]`);
                    if (link) link.click();
                });
            }
        }
    });
}

// Кнопка "Старт" на головному екрані
function initStartCourseButton() {
    const startCourseBtn = document.getElementById("start-course-btn");
    if (startCourseBtn) {
        startCourseBtn.addEventListener("click", () => {
            const firstLessonLink = document.querySelector('.nav-link[data-target="l-01"]');
            if (firstLessonLink) firstLessonLink.click();
        });
    }
}

// ==========================================
// === 3. СИСТЕМА АВТОРИЗАЦІЇ ===
// ==========================================

function initLoginSystem() {
    const loginBtn = document.getElementById("login-submit-btn");
    const usernameInput = document.getElementById("username-input");
    const switchUserBtn = document.getElementById("switch-user-btn");

    if (loginBtn) loginBtn.addEventListener("click", processLogin);
    
    if (usernameInput) {
        usernameInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") processLogin();
        });
    }

    if (switchUserBtn) {
        switchUserBtn.addEventListener("click", () => {
            if (confirm("Ви впевнені, що хочете змінити користувача?")) {
                sessionStorage.removeItem("activeUser");
                location.reload();
            }
        });
    }

    checkUser();
}

function checkUser() {
    currentUser = sessionStorage.getItem("activeUser");

    if (!currentUser) {
        const modal = document.getElementById("login-modal");
        const input = document.getElementById("username-input");
        if (modal) modal.classList.add("active");
        if (input) input.focus();
    } else {
        setupUserProfile(currentUser);
    }
}

function processLogin() {
    const input = document.getElementById("username-input");
    if (!input) return;

    const name = input.value.trim();

    if (name.length > 0) {
        sessionStorage.setItem("activeUser", name);
        currentUser = name;
        
        const modal = document.getElementById("login-modal");
        if (modal) modal.classList.remove("active");
        
        setupUserProfile(name);
    } else {
        input.style.borderColor = "#e74c3c";
        input.classList.add("shake-animation");
        setTimeout(() => {
            input.style.borderColor = "var(--border-color)";
            input.classList.remove("shake-animation");
        }, 1000);
    }
}

function setupUserProfile(name) {
    const display = document.getElementById("user-display");
    if (display) display.innerText = name;
    
    progressKey = "progress_" + name;
    
    // Запускаємо відслідковування прогресу для конкретного користувача
    initProgressSystem(); 
    initProjectHub();
}

// ==========================================
// === 4. СИСТЕМА ПРОГРЕСУ УРОКІВ ===
// ==========================================

function getRankName(percentage) {
    if (percentage >= 100) return "👨‍✈️ СТАТУС: Капітан Orion";
    if (percentage >= 80)  return "👨‍🚀 СТАТУС: Старший помічник";
    if (percentage >= 60)  return "🛰️ СТАТУС: Навігатор";
    if (percentage >= 40)  return "🔧 СТАТУС: Бортовий інженер";
    if (percentage >= 20)  return "🎖️ СТАТУС: Молодший офіцер";
    return "🌑 СТАТУС: Кадет флоту";
}

function updateProgress() {
    const allButtons = document.querySelectorAll(".complete-btn");
    const completedButtons = document.querySelectorAll(".complete-btn.completed");
    
    const total = allButtons.length;
    const completed = completedButtons.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const bar = document.getElementById("sidebar-progress-fill");
    const text = document.getElementById("progress-percent-text");
    const statsText = document.getElementById("progress-stats-text");

    if (bar) bar.style.width = percentage + "%";
    if (text) text.innerText = percentage + "%";

    if (statsText) {
        const rank = getRankName(percentage);
        statsText.innerHTML = `
             <div>Пройдено: ${completed} з ${total} уроків</div>
             <hr>
             <div class="user-rank">${rank}</div>
        `;
    }
}

function initProgressSystem() {
    if (!progressKey) return; 

    const completeButtons = document.querySelectorAll(".complete-btn");
    let completedLessons = JSON.parse(localStorage.getItem(progressKey)) || [];

    completeButtons.forEach((btn) => {
        let lessonId = btn.dataset.lesson;

        if (completedLessons.includes(lessonId)) {
            markLessonAsDone(btn, lessonId);
        } else {
            unmarkLesson(btn, lessonId); 
        }

        // Клонуємо кнопку, щоб очистити попередні обробники подій (запобігає дублюванню кліків)
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener("click", () => {
            let currentProgress = JSON.parse(localStorage.getItem(progressKey)) || [];

            if (!currentProgress.includes(lessonId)) {
                currentProgress.push(lessonId);
                localStorage.setItem(progressKey, JSON.stringify(currentProgress));
                markLessonAsDone(newBtn, lessonId);
            } else {
                currentProgress = currentProgress.filter((id) => id !== lessonId);
                localStorage.setItem(progressKey, JSON.stringify(currentProgress));
                unmarkLesson(newBtn, lessonId);
            }
            updateProgress();
        });
    });

    updateProgress();
}

function markLessonAsDone(button, lessonId) {
    button.classList.add("completed");
    button.innerHTML = "🎉 Урок успішно пройдено!";
    const navLink = document.querySelector(`.nav-link[data-target="${lessonId}"]`);
    if (navLink && !navLink.innerHTML.includes("✅")) {
        navLink.innerHTML += " ✅";
    }
}

function unmarkLesson(button, lessonId) {
    button.classList.remove("completed");
    button.innerHTML = "✅ Відмітити як пройдений";
    const navLink = document.querySelector(`.nav-link[data-target="${lessonId}"]`);
    if (navLink) {
        navLink.innerHTML = navLink.innerHTML.replace(" ✅", "");
    }
}

// ==========================================
// === 5. ПРОГРЕС ПРОЄКТУ (ORION HUB) ===
// ==========================================

function initProjectHub() {
    const projectCheckboxes = document.querySelectorAll('#project-hub input[type="checkbox"]');
    if (projectCheckboxes.length === 0) return;

    const hubKey = "hub_progress_" + currentUser;

    const updateCardStatus = (cb) => {
        const milestoneId = cb.dataset.m;
        const card = document.getElementById("m" + milestoneId);
        const shipPartGroup = document.getElementById("part-m" + milestoneId); 
        
        if (!card) return;
        
        const all = card.querySelectorAll("input");
        const checked = card.querySelectorAll("input:checked");
        
        if (all.length === checked.length && all.length > 0) {
            card.classList.add("completed");
            if (shipPartGroup) shipPartGroup.classList.add("completed"); 
        } else {
            card.classList.remove("completed");
            if (shipPartGroup) shipPartGroup.classList.remove("completed"); 
        }
    };

    const savedHubData = JSON.parse(localStorage.getItem(hubKey)) || {};
    
    projectCheckboxes.forEach((cb, i) => {
        if (savedHubData[i]) {
            cb.checked = true;
        }
        updateCardStatus(cb);

        cb.addEventListener("change", () => {
            const currentHubData = JSON.parse(localStorage.getItem(hubKey)) || {};
            currentHubData[i] = cb.checked;
            localStorage.setItem(hubKey, JSON.stringify(currentHubData));
            updateCardStatus(cb);
        });
    });
}