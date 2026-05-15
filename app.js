const courses = [
  {
    id: "detective",
    title: "偵探、怪物與星際議題",
    description: "用推理故事、科幻困境與奇幻寓言，練習證據、假設、反例與同理心。",
    price: "NT$ 1,680",
    progress: "in_progress",
    progressLabel: "進行中",
    tags: ["推理", "科幻倫理", "哲學討論"],
  },
  {
    id: "philosophy",
    title: "小小哲學家的怪問題",
    description: "從童話與真實童言出發，討論公平、勇氣、自由與責任。",
    price: "NT$ 1,280",
    progress: "open_for_registration",
    progressLabel: "開放報名",
    tags: ["哲學", "童言觀察", "經典寓言"],
  },
  {
    id: "science",
    title: "星球公民與科學邏輯",
    description: "用短篇故事帶孩子辨認因果、分類、機率、證據品質與科學態度。",
    price: "NT$ 980",
    progress: "in_progress",
    progressLabel: "進行中",
    tags: ["科學邏輯", "奇幻", "真實想法"],
  },
];

const audios = [
  { no: "01", title: "失蹤的銀色懷錶", subtitle: "published · ready · 21:35", status: "published" },
  { no: "02", title: "月球上的第一個問題", subtitle: "published · ready · 18:42", status: "published" },
  { no: "03", title: "森林門後的名字", subtitle: "hidden · ready · 24:08", status: "hidden" },
  { no: "04", title: "結局前的反例", subtitle: "draft · admin only", status: "draft" },
];

const screenLinks = document.querySelectorAll("[data-screen-link]");
const screens = document.querySelectorAll(".screen");
const navItems = document.querySelectorAll(".nav-item");

function setScreen(id) {
  screens.forEach((screen) => screen.classList.toggle("active", screen.id === id));
  navItems.forEach((item) => item.classList.toggle("active", item.dataset.screenLink === id));
  history.replaceState(null, "", `#${id}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

screenLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const id = link.dataset.screenLink;
    if (id) setScreen(id);
  });
});

function renderCourses(filter = "all") {
  const grid = document.querySelector("#courseGrid");
  const visibleCourses = filter === "all" ? courses : courses.filter((course) => course.progress === filter);

  grid.innerHTML = visibleCourses
    .map(
      (course) => `
        <article class="course-card">
          <div class="course-thumb">
            <img src="assets/story-worlds-hero.png" alt="${course.title} 課程封面" />
          </div>
          <div class="course-body">
            <span class="status ready">${course.progressLabel}</span>
            <h2>${course.title}</h2>
            <p>${course.description}</p>
            <div class="tag-row">
              ${course.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
            </div>
            <div class="price-row">
              <strong>${course.price}</strong>
              <button class="ghost-button" type="button" data-screen-link="detail">詳情</button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");

  grid.querySelectorAll("[data-screen-link]").forEach((button) => {
    button.addEventListener("click", () => setScreen(button.dataset.screenLink));
  });
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderCourses(button.dataset.filter);
  });
});

function renderAudios() {
  const list = document.querySelector("#audioList");
  list.innerHTML = audios
    .map(
      (audio, index) => `
        <button class="audio-item ${index === 0 ? "active" : ""}" type="button">
          <span class="track-no">${audio.no}</span>
          <span><strong>${audio.title}</strong><small>${audio.subtitle}</small></span>
          <span class="status ${audio.status === "hidden" ? "hidden" : audio.status === "draft" ? "muted-status" : "ready"}">${audio.status}</span>
        </button>
      `,
    )
    .join("");

  list.querySelectorAll(".audio-item").forEach((item) => {
    item.addEventListener("click", () => {
      list.querySelectorAll(".audio-item").forEach((row) => row.classList.remove("active"));
      item.classList.add("active");
      document.querySelector("#player-title").textContent = item.querySelector("strong").textContent;
    });
  });
}

const adminTabButtons = document.querySelectorAll("[data-admin-tab]");
const adminViews = document.querySelectorAll("[data-admin-view]");

adminTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    adminTabButtons.forEach((item) => item.classList.remove("active"));
    adminViews.forEach((view) => view.classList.toggle("active", view.dataset.adminView === button.dataset.adminTab));
    button.classList.add("active");
  });
});

const batchUploadBtn = document.querySelector("#batchUploadBtn");
const uploadQueue = document.querySelector("#uploadQueue");

batchUploadBtn.addEventListener("click", () => {
  uploadQueue.hidden = !uploadQueue.hidden;
  batchUploadBtn.textContent = uploadQueue.hidden ? "批次上傳 MP3" : "收合上傳佇列";
});

document.querySelector("#contentFilters").addEventListener("change", (event) => {
  const form = event.currentTarget;
  const status = form.audioStatus.value;
  const count = status === "all" ? "符合 2 門課程、7 個音檔" : `符合 1 門課程、${status === "draft" ? 1 : 2} 個音檔`;
  document.querySelector("#contentResultCount").textContent = count;
  const url = new URL(window.location.href);
  new FormData(form).forEach((value, key) => url.searchParams.set(key, value));
  history.replaceState(null, "", url);
});

document.querySelector("#contentFilters").addEventListener("reset", () => {
  setTimeout(() => {
    document.querySelector("#contentResultCount").textContent = "符合 2 門課程、7 個音檔";
    history.replaceState(null, "", "#admin");
  }, 0);
});

const playBtn = document.querySelector("#playBtn");
const range = document.querySelector("#progressRange");
const currentTime = document.querySelector("#currentTime");
let playing = false;
let progressTimer;

function updateTime() {
  const totalSeconds = 21 * 60 + 35;
  const current = Math.round((Number(range.value) / 100) * totalSeconds);
  const minutes = String(Math.floor(current / 60)).padStart(2, "0");
  const seconds = String(current % 60).padStart(2, "0");
  currentTime.textContent = `${minutes}:${seconds}`;
}

function tick() {
  range.value = Math.min(100, Number(range.value) + 0.3);
  updateTime();
  if (Number(range.value) >= 100) {
    playing = false;
    playBtn.textContent = "▶";
    clearInterval(progressTimer);
  }
}

playBtn.addEventListener("click", () => {
  playing = !playing;
  playBtn.textContent = playing ? "Ⅱ" : "▶";
  clearInterval(progressTimer);
  if (playing) progressTimer = setInterval(tick, 700);
});

document.querySelector("#rewindBtn").addEventListener("click", () => {
  range.value = Math.max(0, Number(range.value) - 1.2);
  updateTime();
});

document.querySelector("#forwardBtn").addEventListener("click", () => {
  range.value = Math.min(100, Number(range.value) + 1.2);
  updateTime();
});

range.addEventListener("input", updateTime);

const initialHash = window.location.hash.replace("#", "");
if (initialHash && document.getElementById(initialHash)) {
  setScreen(initialHash);
}

renderCourses();
renderAudios();
updateTime();
