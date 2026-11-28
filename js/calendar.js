const doors = document.querySelector("#doors");
const reveal = document.querySelector("dialog");
const limit = Object.keys(RELEASED_DOORS).filter(day => SEALED_RIDDLES[day]).length;
for (const name of ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]) {
  const label = document.createElement("span");
  label.className = "weekday";
  label.textContent = name;
  doors.append(label);
}
document.querySelector("#status").textContent = limit ? limit + " of 31 doors unlocked" : "All doors are locked · First reveal December 1";
for (let day = 1; day <= 31; day++) {
  const door = document.createElement("button");
  door.className = "door";
  door.textContent = day;
  door.disabled = !RELEASED_DOORS[day];
  const key = "loansharks-coxmas-2026-riddle-opened-" + day;
  function label(opened) {
    door.classList.toggle("seen", opened);
    door.setAttribute("aria-label", "December " + day + (door.disabled ? ", locked" : opened ? ", open again" : ", open door"));
  }
  label(false);
  if (!door.disabled) {
    try { label(localStorage.getItem(key) === "1"); } catch {}
    door.addEventListener("click", async () => {
      document.querySelector("#date").textContent = "December " + day;
      const message = document.querySelector("#message");
      try {
        const decode = value => Uint8Array.from(atob(value), char => char.charCodeAt(0));
        const sealed = decode(SEALED_RIDDLES[day]);
        const releaseKey = await crypto.subtle.importKey("raw", decode(RELEASED_DOORS[day]), "AES-GCM", false, ["decrypt"]);
        const plain = await crypto.subtle.decrypt({name: "AES-GCM", iv: sealed.slice(0, 12)}, releaseKey, sealed.slice(12));
        message.textContent = new TextDecoder().decode(plain);
      } catch {
        message.textContent = "This riddle could not be opened. Refresh the calendar or let Astroferrous know.";
        if (!reveal.open) reveal.showModal();
        return;
      }
      if (!reveal.open) reveal.showModal();
      label(true);
      try { localStorage.setItem(key, "1"); } catch {}
    });
  }
  doors.append(door);
}
