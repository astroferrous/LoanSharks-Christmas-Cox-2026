const board = document.querySelector(".board");
const statusLine = document.querySelector("#rule");
for (const tile of tiles) {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", tile.name + " rules");
  button.setAttribute("aria-pressed", "false");

  const card = document.createElement("span");
  card.className = "card";
  const front = new Image();
  front.src = tile.image;
  front.alt = "";
  const back = document.createElement("span");
  back.className = "back";
  const ruleImage = new Image();
  ruleImage.src = tile.back;
  ruleImage.alt = "";
  back.append(ruleImage);
  card.append(front, back);
  button.append(card);
  button.addEventListener("click", () => {
    const showRule = button.getAttribute("aria-pressed") === "false";
    button.setAttribute("aria-pressed", String(showRule));
    statusLine.textContent = showRule ? tile.rule : "";
  });
  board.append(button);
}
