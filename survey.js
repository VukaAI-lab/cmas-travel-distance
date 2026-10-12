/* Delegate Travel Survey: our own front end for the Google Form.
   The questions, entry ids and branching come from survey-data.js (generated from the form itself).
   Answers are posted to the same Google Form, so responses arrive in the form owner's Responses / Sheet.
   Add ?dryrun=1 to the page address to see what would be sent without sending anything. */
(() => {
  "use strict";
  const F = window.CMAS_FORM;
  const root = document.getElementById("survey");
  const dryRun = new URLSearchParams(location.search).has("dryrun");
  const KCC = "Kigali Convention Centre, Rwanda";
  const KGL = "Kigali International Airport, Rwanda";

  const answers = {};          // entry id -> text
  let email = "";
  let history = [];            // pages already passed, in order
  let cur = 0;
  let sending = false;
  const fbzx = String(Math.floor(Math.random() * 9e18) + 1e18).slice(0, 19);

  /* ---------- small helpers ---------- */
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === false || v == null) continue;
      if (k === "class") n.className = v; else if (k === "text") n.textContent = v; else n.setAttribute(k, v === true ? "" : v);
    }
    kids.flat().forEach(c => c != null && n.append(c.nodeType ? c : document.createTextNode(c)));
    return n;
  };
  const allItems = () => F.pages.flatMap(p => p.items);
  const findItem = re => allItems().find(i => re.test(i.label));
  const fixHelp = s => (s || "").replace(/Google Maps will give you the road distance\./, "Use the calculator under each distance question to work out the road distance.");

  /* ---------- where the calculator can help ---------- */
  const CALC = [
    { re: /^Home → Kigali Convention Centre: distance/, from: "@home", to: KCC },
    { re: /^Home → departure airport: distance/, from: "@home", to: "" },
    { re: /flight distance/, air: true },
    { re: /^Kigali International Airport → your accommodation: distance/, from: KGL, to: "" },
    { re: /^Accommodation → Kigali Convention Centre: distance/, from: "", to: KCC },
    { re: /^Kigali Convention Centre → home: distance/, from: KCC, to: "@home" },
    { re: /^Accommodation → Kigali International Airport: distance/, from: "", to: KGL },
    { re: /^Final airport → home: distance/, from: "", to: "@home" }
  ];
  const homeText = () => {
    const c = findItem(/^City you're travelling from/), k = findItem(/^Country you're travelling from/);
    return [answers[c.entry], answers[k.entry]].filter(Boolean).join(", ");
  };
  const modeFromAnswer = label => /train/i.test(label || "") ? "rail" : /ferry/i.test(label || "") ? "ferry" : "vehicle";
  function calcContext(page, idx) {
    const item = page.items[idx];
    const spec = CALC.find(s => s.re.test(item.label));
    if (!spec || item.type !== "number") return null;
    const sub = t => t === "@home" ? homeText() : t;
    let mode = spec.air ? "air" : "vehicle";
    const prev = page.items[idx - 1];
    if (!spec.air && prev && prev.type === "radio") mode = modeFromAnswer(answers[prev.entry]);
    return { from: sub(spec.from || ""), to: sub(spec.to || ""), mode };
  }

  /* One calculator frame, moved under whichever question asked for it */
  let calcFrame = null, calcReady = false, calcTarget = null, pendingPrefill = null;
  function openCalc(box, input, ctx) {
    document.querySelectorAll(".calcbox").forEach(b => { if (b !== box) { b.hidden = true; } });
    if (!calcFrame) {
      calcFrame = el("iframe", { title: "Travel distance calculator", src: "calculator.html?embed=1&pick=1&v=9", class: "calcframe" });
      calcFrame.style.height = "340px";
    }
    box.hidden = false;
    calcReady = false;            // moving a frame reloads it; wait for its "ready" message before prefilling
    box.append(calcFrame);
    calcTarget = input;
    pendingPrefill = { type: "cmas-prefill", ...ctx };
    setTimeout(() => box.scrollIntoView({ block: "nearest", behavior: "smooth" }), 50);
  }
  function closeCalc() { document.querySelectorAll(".calcbox").forEach(b => b.hidden = true); }
  window.addEventListener("message", e => {
    if (e.origin !== location.origin) return;
    const m = e.data || {};
    if (calcFrame && e.source === calcFrame.contentWindow) {
      if (m.type === "cmas-ready") { calcReady = true; if (pendingPrefill) calcFrame.contentWindow.postMessage(pendingPrefill, location.origin); }
      else if (m.type === "cmas-height") calcFrame.style.height = Math.max(230, Math.min(900, m.height + 6)) + "px";
      else if (m.type === "cmas-distance" && calcTarget) {
        calcTarget.value = String(m.km); calcTarget.dispatchEvent(new Event("input", { bubbles: true }));
        closeCalc(); calcTarget.focus();
      }
    }
  });

  /* ---------- building a page ---------- */
  function buildField(page, idx) {
    const item = page.items[idx];
    const id = "q" + item.entry;
    const q = el("div", { class: "q", "data-entry": item.entry });
    const star = item.required ? el("span", { class: "req", "aria-hidden": "true", text: " *" }) : null;
    const help = fixHelp(item.help) ? el("div", { class: "help", id: id + "h", text: fixHelp(item.help) }) : null;
    const err = el("div", { class: "err", id: id + "e", role: "alert" });
    let control;

    if (item.type === "radio") {
      const fs = el("fieldset", { class: "radios", "aria-describedby": help ? id + "h" : false });
      fs.append(el("legend", {}, item.label, star));
      if (help) fs.append(help);
      item.options.forEach((o, i) => {
        const rid = id + "_" + i;
        const inp = el("input", { type: "radio", name: id, id: rid, value: o.label });
        if (answers[item.entry] === o.label) inp.checked = true;
        inp.addEventListener("change", () => { answers[item.entry] = o.label; q.classList.remove("bad"); err.textContent = ""; });
        fs.append(el("label", { class: "opt", for: rid }, inp, el("span", { text: o.label })));
      });
      q.append(fs, err);
      return q;
    }

    q.append(el("label", { for: id }, item.label, star));
    if (help) q.append(help);
    if (item.type === "select") {
      control = el("select", { id, "aria-describedby": help ? id + "h" : false }, el("option", { value: "", text: "Choose…" }),
        item.options.map(o => el("option", { value: o.label, text: o.label })));
      control.value = answers[item.entry] || "";
    } else {
      control = el("input", { type: "text", id, autocomplete: "off", "aria-describedby": help ? id + "h" : false,
        inputmode: item.type === "number" ? "decimal" : false, placeholder: item.type === "number" ? "e.g. 25" : false });
      control.value = answers[item.entry] || "";
    }
    control.addEventListener("input", () => { answers[item.entry] = control.value; q.classList.remove("bad"); err.textContent = ""; });
    control.addEventListener("change", () => { answers[item.entry] = control.value; });
    q.append(control);

    const ctx = calcContext(page, idx);
    if (ctx) {
      const box = el("div", { class: "calcbox", hidden: true });
      const btn = el("button", { type: "button", class: "calcbtn", "aria-expanded": "false" }, "Calculate for me");
      btn.addEventListener("click", () => {
        if (!box.hidden) { box.hidden = true; btn.setAttribute("aria-expanded", "false"); return; }
        document.querySelectorAll(".calcbtn").forEach(b => b.setAttribute("aria-expanded", "false"));
        btn.setAttribute("aria-expanded", "true");
        openCalc(box, control, calcContext(page, idx));
      });
      q.append(btn, box);
    }
    q.append(err);
    return q;
  }

  function render(scroll) {
    const page = F.pages[cur];
    calcFrame && calcFrame.remove();
    root.innerHTML = "";
    const card = el("form", { class: "card", novalidate: true });
    card.addEventListener("submit", e => { e.preventDefault(); next(); });

    card.append(el("div", { class: "step", text: "Step " + (history.length + 1) }));
    if (cur === 0) {
      card.append(el("p", { class: "intro", text: F.intro }));
      const q = el("div", { class: "q", "data-entry": "email" });
      q.append(el("label", { for: "qemail" }, "Email address", el("span", { class: "req", "aria-hidden": "true", text: " *" })));
      const inp = el("input", { type: "email", id: "qemail", autocomplete: "email", inputmode: "email", placeholder: "you@example.com" });
      inp.value = email;
      inp.addEventListener("input", () => { email = inp.value; q.classList.remove("bad"); $err(q, ""); });
      q.append(inp, el("div", { class: "err", role: "alert" }));
      card.append(q);
    } else {
      if (page.title) card.append(el("h2", { class: "ptitle", text: page.title }));
      if (fixHelp(page.help)) card.append(el("p", { class: "phelp", text: fixHelp(page.help) }));
    }
    page.items.forEach((_, i) => card.append(buildField(page, i)));

    const nav = el("div", { class: "nav" });
    if (history.length) nav.append(el("button", { type: "button", class: "btn ghost", id: "back" }, "Back"));
    const last = nextTarget(page) === "submit";
    nav.append(el("button", { type: "submit", class: "btn primary", id: "next" }, last ? "Submit" : "Next"));
    card.append(nav);
    root.append(card);
    $("back") && $("back").addEventListener("click", back);
    // the label of the main button depends on the answers on this page
    card.addEventListener("input", () => { $("next").textContent = nextTarget(page) === "submit" ? "Submit" : "Next"; });
    card.addEventListener("change", () => { $("next").textContent = nextTarget(page) === "submit" ? "Submit" : "Next"; });
    if (scroll) card.scrollIntoView({ block: "start", behavior: "smooth" });
  }
  const $ = id => document.getElementById(id);
  const $err = (q, msg) => { const e = q.querySelector(".err"); if (e) e.textContent = msg; };

  /* ---------- flow ---------- */
  function nextTarget(page) {
    for (const it of page.items) {
      if (it.type !== "radio") continue;
      const o = it.options.find(o => o.label === answers[it.entry]);
      if (o && o.goto !== undefined) return o.goto;
    }
    return page.next;
  }

  function validate(page) {
    let firstBad = null;
    const fail = (q, msg) => { q.classList.add("bad"); $err(q, msg); firstBad = firstBad || q; };
    if (cur === 0) {
      const q = root.querySelector('[data-entry="email"]');
      if (!email.trim()) fail(q, "This is a required question");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) fail(q, "Please enter a valid email address");
    }
    for (const it of page.items) {
      const q = root.querySelector(`[data-entry="${it.entry}"]`);
      const v = (answers[it.entry] || "").trim();
      if (it.required && !v) { fail(q, "This is a required question"); continue; }
      if (it.type === "number" && v && !(/^\d+([.,]\d+)?$/.test(v))) fail(q, it.error || "Please enter a number, e.g. 25");
    }
    if (firstBad) { const f = firstBad.querySelector("input,select"); f && f.focus(); firstBad.scrollIntoView({ block: "center", behavior: "smooth" }); }
    return !firstBad;
  }

  function next() {
    const page = F.pages[cur];
    if (!validate(page)) return;
    const t = nextTarget(page);
    if (t === "submit") return submit();
    history.push(cur); cur = t; render(true);
  }
  function back() { cur = history.pop(); render(true); }

  /* ---------- sending ---------- */
  function buildPayload() {
    const path = history.concat([cur]);
    const p = new URLSearchParams();
    p.append("emailAddress", email.trim());
    path.forEach(pi => F.pages[pi].items.forEach(it => {
      let v = (answers[it.entry] || "").trim();
      if (it.type === "number") v = v.replace(",", ".");
      if (it.type === "radio") p.append(`entry.${it.entry}_sentinel`, "");
      if (v || it.required) p.append(`entry.${it.entry}`, v);
    }));
    p.append("fvv", "1");
    p.append("partialResponse", `[null,null,"${fbzx}"]`);
    p.append("pageHistory", path.join(","));
    p.append("fbzx", fbzx);
    p.append("submissionTimestamp", "-1");
    return p;
  }

  async function submit() {
    if (sending) return;
    const btn = $("next"); const body = buildPayload();
    window.__lastPayload = body.toString();
    if (dryRun) return thanks(body);
    sending = true; btn.disabled = true; btn.textContent = "Sending…";
    try {
      // Google replies without cross-site headers, so the reply can't be read ("no-cors"); a network failure is still caught
      await fetch(F.action, { method: "POST", mode: "no-cors", body, headers: { "Content-Type": "application/x-www-form-urlencoded" } });
      thanks();
    } catch (e) {
      sending = false; btn.disabled = false; btn.textContent = "Submit";
      let box = root.querySelector(".sendfail");
      if (!box) { box = el("div", { class: "sendfail", role: "alert" }); root.querySelector(".nav").before(box); }
      box.textContent = "We couldn't send your answers. Please check your internet connection and press Submit again. Your answers are still here.";
    }
  }

  function thanks(dry) {
    root.innerHTML = "";
    const card = el("div", { class: "card done" },
      el("div", { class: "tick", "aria-hidden": "true", text: "✓" }),
      el("h2", { class: "ptitle", text: "Thank you!" }),
      el("p", { text: F.thanks.replace(/^Thank you!\s*/, "") }));
    if (dry) {
      card.append(el("p", { class: "dry", text: "Test mode: nothing was sent. This is what would be sent to the form:" }),
        el("pre", { class: "dry", text: decodeURIComponent(dry.toString()).split("&").join("\n") }));
    }
    root.append(card);
    root.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  /* ---------- tell a surrounding page how tall we are (optional, used when this page is framed) ---------- */
  if (window.parent !== window) {
    let last = 0;
    setInterval(() => {
      const h = document.documentElement.scrollHeight;
      if (h !== last) { last = h; try { parent.postMessage({ type: "cmas-survey-height", height: h }, "*"); } catch (e) {} }
    }, 400);
  }

  render(false);
})();
