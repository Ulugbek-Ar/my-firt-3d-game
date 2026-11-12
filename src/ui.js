export class UI {
  constructor(actions) {
    this.actions = actions;
    this.overlay = document.querySelector("#overlay");
    this.hud = document.querySelector("#hud");
    this.toastTimer = 0;
    this.refs = Object.fromEntries(
      [
        "stamina",
        "stamina-value",
        "memory",
        "memory-value",
        "health",
        "objective-label",
        "objective-text",
        "distance",
        "prompt",
        "fps",
        "quality-label",
      ].map((id) => [id, document.getElementById(id)]),
    );
    document.querySelector("#pause-button").onclick = actions.pause;
  }
  panel(content, kind = "") {
    this.hud.hidden = true;
    this.overlay.dataset.kind = kind || "menu";
    this.overlay.innerHTML = `<section class="panel ${kind}">${content}</section>`;
    this.overlay.querySelectorAll("[data-action]").forEach((button) => {
      button.onclick = () => this.actions[button.dataset.action]?.();
    });
    this.overlay.querySelector("button:not(:disabled)")?.focus();
  }
  loading(progress) {
    this.panel(
      `<div class="loading-sigil">◇</div><div class="eyebrow">Elyndra solnomalari</div><h1>Xotiralar<br>uyg‘onmoqda</h1><p class="lede">Asterfall sari yo‘l ochilmoqda…</p><progress aria-label="Yuklanmoqda" value="${progress}" max="1"></progress><small class="footnote">${Math.round(progress * 100)}% · Olam tayyorlanmoqda</small>`,
      "loading",
    );
  }
  menu(hasSave) {
    this.panel(
      `<div class="eyebrow"><span class="line"></span> Elyndra solnomalari / I</div><h1>SO‘NGGI<br><em>DAVR</em></h1><div class="rule"></div><p class="lede">Dunyo hammasini unutadi.<br>Sen esa eslaysan.</p><div class="menu"><button class="primary" data-action="newGame"><small>01</small> Yangi o‘yin <span>↗</span></button><button data-action="continueGame" ${hasSave ? "" : "disabled"}><small>02</small> Davom etish <span>→</span></button><button data-action="settings"><small>03</small> Sozlamalar <span>+</span></button><button data-action="credits"><small>04</small> Mualliflar <span>+</span></button></div><div class="footnote">◈ &nbsp; ASTERFALL — UNUTILGAN CHEGARA<br><span>Har yuz yilda tarix qayta yoziladi.</span></div><aside class="menu-world-caption"><small>I · UYG‘ONISH</small><p>Hamma unutgan dunyoda,<br>xotira — sening yagona yo‘ling.</p><span>ELYNDRA · SO‘NGGI KUNLAR</span></aside>`,
    );
  }
  intro() {
    this.panel(
      `<div class="eyebrow">I · Uyg‘onish</div><h1>Yuz yil.<br>Yana bir sukut.</h1><p>Elyndra navbatdagi Buyuk Yangilanish arafasida. Tez orada shaharlar, ismlar va kechagi haqiqatlar tarixdan o‘chadi.</p><p>Ammo Kael eslaydi. U Asterfall chekkasida uyg‘onadi. Qishloq ortidan tanish bir sado keladi…</p><div class="menu"><button class="primary" data-action="begin">Xotiraga ergashish →</button></div>`,
      "story",
    );
  }
  play() {
    this.overlay.innerHTML = "";
    this.hud.hidden = false;
  }
  pause() {
    this.panel(
      `<div class="eyebrow">Vaqt to‘xtadi</div><h1>Tanaffus</h1><div class="menu"><button class="primary" data-action="resume">Qaytish →</button><button data-action="save">Saqlash</button><button data-action="settings">Sozlamalar</button><button data-action="mainMenu">Bosh menyu</button></div><p class="footnote">Xotiralar avtomatik saqlanadi.</p>`,
    );
  }
  settings(quality, back, resolution = null) {
    this.panel(
      `<div class="eyebrow">Dunyo ko‘rinishi</div><h1>Sozlamalar</h1><div class="settings-row"><label for="quality">Grafika sifati</label><select id="quality"><option value="low">Past</option><option value="medium">O‘rta</option></select></div><div class="settings-row"><label for="resolution">Tasvir aniqligi</label><select id="resolution"><option value="0.6">60% · Tezroq</option><option value="0.8">80% · Muvozanatli</option><option value="1">100% · Aniqroq</option></select></div><p class="lede">Past: 30 kadr/s chegarasi va pastroq aniqlik. Eski qurilmalar uchun tavsiya etiladi.<br>O‘rta: 60 kadr/s chegarasi va yuqoriroq aniqlik.</p><div class="menu"><button data-action="back">← Qaytish</button></div>`,
    );
    const select = document.querySelector("#quality");
    select.value = quality;
    select.onchange = () => this.actions.quality(select.value);
    const scale = document.querySelector("#resolution");
    scale.value = String(resolution ?? (quality === "low" ? 0.8 : 1));
    scale.onchange = () => this.actions.resolution(Number(scale.value));
    this.actions.back = back;
  }
  credits(back) {
    this.actions.back = back;
    this.panel(
      `<div class="eyebrow">I · Ibtido</div><h1>Mualliflar</h1><p class="credit">SO‘NGGI DAVR<br>Elyndra olamidagi ilk sarguzasht.<br><br>G‘oya va loyiha: Ulugbek-Ar<br>Dasturlash: OpenAI Codex<br>Uch o‘lchamli tasvir: Three.js (MIT)<br>Modellar: ushbu loyiha uchun protsedurali yaratilgan.<br><br>Bu — katta sayohatning boshlanishi.</p><div class="menu"><button data-action="back">← Qaytish</button></div>`,
    );
  }
  memory() {
    this.panel(
      `<div class="eyebrow">Xotira uyg‘ondi</div><h1>Toshlar eslaydi.</h1><p>«Sen bu yerda avval ham bo‘lgansan, Kael. O‘sha davrda Asterfall hali kulga aylanmagan edi…»</p><p>Begona xotira emas. Bu sening xotirang.</p><div class="rule"></div><div class="eyebrow">✓ Qadimiy xotira maskani topildi</div><div class="menu"><button class="primary" data-action="resume">Yo‘lni davom ettirish →</button></div>`,
      "story",
    );
  }
  update(state, interaction, fps) {
    this.refs.health.value = state.health;
    this.refs.stamina.value = state.stamina;
    this.refs["stamina-value"].textContent =
      `${Math.round(state.stamina)} / 100`;
    this.refs["memory"].value = state.memory;
    this.refs["memory-value"].textContent = `${state.memory} / 100`;
    this.refs["objective-label"].textContent = state.objectiveComplete
      ? "✓ XOTIRA UYG‘ONDI"
      : "BIRINCHI XOTIRA";
    this.refs["objective-text"].textContent = state.objectiveComplete
      ? "Maskan topildi. Asterfallni o‘rganing."
      : "Qadimiy xotira maskanini toping.";
    this.refs["distance"].textContent = state.objectiveComplete
      ? "Birinchi bob yakunlandi"
      : `◇ ${Math.round(interaction.distance)} m · Qishloq ortida`;
    this.refs["prompt"].hidden =
      !interaction.available || state.mode !== "playing";
    this.refs["fps"].textContent = `${fps} FPS`;
    this.refs["quality-label"].textContent =
      state.graphics === "low" ? "PAST" : "O‘RTA";
  }
  toast(message) {
    const element = document.querySelector("#toast");
    element.textContent = message;
    element.hidden = false;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      element.hidden = true;
    }, 3500);
  }
  fatal() {
    this.panel(
      `<div class="eyebrow">Tasvirni ishga tushirib bo‘lmadi</div><h1>Grafika mavjud emas</h1><p class="lede">O‘yin uchun WebGL imkoniyatlarini qo‘llaydigan qurilma kerak. Brauzerda apparat tezlashtirishini yoqing, grafik drayverni yangilang yoki boshqa brauzerda qayta urinib ko‘ring.</p><p class="lede">Agar tasvir yo‘qolgan bo‘lsa, sahifani qayta yuklang. Oxirgi saqlangan xotira saqlanib qoladi.</p>`,
    );
  }
}
