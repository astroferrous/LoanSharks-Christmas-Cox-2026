const music = document.querySelector("#music");
const musicToggle = document.querySelector("#music-toggle");
let muted = false;
try { muted = localStorage.getItem("coxmas-music-muted") === "true"; } catch {}
music.autoplay = !muted;
music.muted = muted;
function updateMusicControl() {
  musicToggle.textContent = muted || music.paused ? "Play music" : "Mute music";
}
function playMusic() {
  if (!muted && music.paused) music.play().catch(updateMusicControl);
}
function retryOnInteraction(event) {
  if (!musicToggle.contains(event.target)) playMusic();
}
for (const type of ["click", "pointerup", "touchend", "keydown"]) {
  document.addEventListener(type, retryOnInteraction, true);
}
music.addEventListener("playing", updateMusicControl);
music.addEventListener("pause", updateMusicControl);
musicToggle.addEventListener("click", () => {
  muted = !music.paused && !music.muted;
  music.muted = muted;
  music.autoplay = !muted;
  try { localStorage.setItem("coxmas-music-muted", String(muted)); } catch {}
  if (muted) music.pause();
  else playMusic();
  updateMusicControl();
});
updateMusicControl();
playMusic();
window.addEventListener("pageshow", playMusic);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) playMusic();
});
