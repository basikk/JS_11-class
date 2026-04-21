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
            const firstLessonLink = document.querySelector('.nav-link[data-target="h-01"]');
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

function getRankName(percent) {
    if (percent === 100) return "Адмірал Оріону 👑";
    if (percent >= 90)  return "Капітан корабля 👨‍✈️";
    if (percent >= 75)  return "Старший офіцер 🎖";
    if (percent >= 50)  return "Лейтенант флоту ⚔️";
    if (percent >= 25)  return "Пілот-навігатор 🚀";
    if (percent >= 10)  return "Спеціаліст збірки 🔧";
    if (percent > 0)    return "Кадет-стажер 👨‍🚀";
    return "Цивільний";
}

function updateProgress() {
    // 1. Отримуємо всі кнопки на сторінці
    const allButtons = document.querySelectorAll(".complete-btn");
    const completedButtons = document.querySelectorAll(".complete-btn.completed");
    
    // Рахуємо загальний прогрес
    const total = allButtons.length;
    const completed = completedButtons.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 2. Знаходимо елементи нової панелі за їх ID
    const percentText = document.getElementById("progress-percent-text"); // Великі відсотки справа
    const statsText = document.getElementById("progress-stats-text");     // Текст "Х з Y етапів" знизу
    const rankElement = document.getElementById("progress-rank");         // Ранг зліва зверху

    // Оновлюємо великі відсотки
    if (percentText) percentText.innerText = percentage + "%";

    // Оновлюємо статистику знизу
    if (statsText) statsText.innerText = `${completed} з ${total} етапів збірки`;

    // Оновлюємо статус командира
    if (rankElement) {
        rankElement.innerText = getRankName(percentage);

        // Бонус: якщо це Капітан (100%), додаємо золотий клас, який ми прописали в CSS
        if (percentage >= 100) {
            rankElement.classList.add("gold-rank");
        } else {
            rankElement.classList.remove("gold-rank");
        }
    }

// 2. Оновлюємо ім'я та ранг (з твоєї функції getRankName)
    const nameEl = document.getElementById("commander-name");
    const rankEl = document.getElementById("progress-rank");

    if (nameEl) nameEl.textContent = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : "Командир Orion";
    if (rankEl) rankEl.textContent = getRankName(percentage);

    // 2. ВИКЛИК НОВОЇ ФУНКЦІЇ ДЛЯ КОЛЬОРОВИХ ШКАЛ
    updateOrionStatusPanel();
}

// НАДІЙНА ФУНКЦІЯ ПІДРАХУНКУ (Шукаємо по кнопках, а не по секціях)
function updateOrionStatusPanel() {
    // Збираємо ВСІ кнопки проходження на сторінці
    const allButtons = document.querySelectorAll('.complete-btn');
    if (allButtons.length === 0) return;

    let htmlTotal = 0, htmlCompleted = 0;
    let cssTotal = 0, cssCompleted = 0;
    let jsTotal = 0, jsCompleted = 0;

    // Проходимось по кожній кнопці
    allButtons.forEach(btn => {
        const isCompleted = btn.classList.contains('completed');
        const lessonId = btn.getAttribute('data-lesson') || ""; // Отримуємо ID (наприклад, "l-01")

        // 1. Корпус (HTML)
        if (lessonId.startsWith('h-') || lessonId.startsWith('p-h')) {
            htmlTotal++;
            if (isCompleted) htmlCompleted++;
        } 
        // 2. Енергія (CSS)
        else if (lessonId.startsWith('c-') || lessonId.startsWith('p-c')) {
            cssTotal++;
            if (isCompleted) cssCompleted++;
        } 
        // 3. Ядро (JS) - всі інші уроки (l-01, p-01 і т.д.)
        else {
            jsTotal++;
            if (isCompleted) jsCompleted++;
        }
    });

    const totalLessons = htmlTotal + cssTotal + jsTotal;
    if (totalLessons === 0) return;

    console.log(`Знайдено уроків JS: ${jsTotal}, з них пройдено: ${jsCompleted}`);

    // Оновлюємо ширину кольорових шкал (повзунки)
    const barHtml = document.getElementById('bar-html');
    const barCss  = document.getElementById('bar-css');
    const barJs   = document.getElementById('bar-js'); // Переконайся, що в HTML є <div id="bar-js">

    if (barHtml) barHtml.style.width = ((htmlCompleted / totalLessons) * 100) + '%';
    if (barCss)  barCss.style.width = ((cssCompleted / totalLessons) * 100) + '%';
    if (barJs)   barJs.style.width = ((jsCompleted / totalLessons) * 100) + '%';

    // Оновлюємо текст відсотків (той самий <span id="text-js">)
    const textHtml = document.getElementById('text-html');
    const textCss  = document.getElementById('text-css');
    const textJs   = document.getElementById('text-js');

    if (textHtml) textHtml.textContent = (htmlTotal > 0 ? Math.round((htmlCompleted / htmlTotal) * 100) : 0) + '%';
    if (textCss)  textCss.textContent = (cssTotal > 0 ? Math.round((cssCompleted / cssTotal) * 100) : 0) + '%';
    if (textJs)   textJs.textContent = (jsTotal > 0 ? Math.round((jsCompleted / jsTotal) * 100) : 0) + '%';
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
    button.innerHTML = "🎉 Етап успішно завершено!";
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