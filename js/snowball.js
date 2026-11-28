const snowfall = document.querySelector("#snowfall");
for (let i = 0; i < 28; i++) {
  const flake = document.createElement("span");
  flake.className = "flake";
  const size = 2 + Math.random() * 2;
  const seconds = 9 + Math.random() * 9;
  flake.style.width = flake.style.height = size + "px";
  flake.style.left = Math.random() * 100 + "%";
  flake.style.opacity = .25 + Math.random() * .35;
  flake.style.animationDuration = seconds + "s";
  flake.style.animationDelay = -Math.random() * seconds + "s";
  snowfall.append(flake);
}

// Source footage: OSRS Wiki, “Snowball animation.gif” and
// “2013 Christmas event - Pelting a gublinch.gif”. Game art by Jagex.
const fight = document.querySelector(".snowfight");
const thrower = fight.querySelector(".thrower");
const target = fight.querySelector(".gublinch");
const olm = fight.querySelector(".festive-olm");
const ball = fight.querySelector(".missile");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let waitForThrow, animation;
function pose(actor, frame) {
  actor.style.backgroundPositionX = (100 * frame / 19) + "%";
}
function animateThrow() {
  const start = performance.now();
  function draw(now) {
    const elapsed = now - start;
    const release = 1100, impact = 2100;
    pose(thrower, Math.min(19, Math.floor(elapsed / 100)));
    const travel = (elapsed - release) / (impact - release);
    // Hold the receiving side through impact, then turn back before the next windup.
    const returnStart = impact + 720;
    const gaze = elapsed < returnStart ? travel : 1 - (elapsed - returnStart) / 1200;
    pose(olm, Math.round(19 * Math.max(0, Math.min(1, gaze))));
    if (travel >= 0 && travel < 1) {
      const height = fight.clientHeight;
      const hand = thrower.offsetLeft + thrower.offsetWidth * .95;
      const shoulder = target.offsetLeft + target.offsetWidth * .5;
      const x = hand + (shoulder - hand) * travel;
      const y = height * (.28 + .13 * travel - .94 * travel * (1 - travel));
      ball.style.transform = 'translate(' + (x-4) + 'px,' + (y-5) + 'px)';
      ball.style.opacity = '1';
    } else {
      ball.style.opacity = '0';
    }
    pose(target, elapsed < impact ? 0 : Math.min(19, 1 + Math.floor((elapsed - impact) / 35)));
    if (elapsed < returnStart + 1200) animation = requestAnimationFrame(draw);
    else resetFight(9260);
  }
  animation = requestAnimationFrame(draw);
}
function resetFight(delay) {
  clearTimeout(waitForThrow);
  cancelAnimationFrame(animation);
  pose(olm, 0);
  pose(thrower, 0);
  pose(target, 0);
  ball.style.opacity = '0';
  if (!document.hidden && !reducedMotion.matches) waitForThrow = setTimeout(animateThrow, delay);
}
document.addEventListener("visibilitychange", () => resetFight(1200));
reducedMotion.addEventListener("change", () => resetFight(1200));
resetFight(1200);
