function buildDiscordMessage() {
  // 人間向けプレビューがある場合はそれを優先（あなたの実装に合わせて調整）
  const game = $("game").value;
  const character = $("character").value;
  const position = $("position").value;
  const difficulty = $("difficulty").value;

  const symbol = steps.length ? steps.join(" > ") : "";
  const human = (typeof stepsToHuman === "function" && steps.length) ? stepsToHuman(steps) : "";

  const damage = $("damage").value ? `Damage: ${$("damage").value}` : "";
  const tags = $("tags").value.trim() ? `Tags: ${$("tags").value.trim()}` : "";
  const notes = $("notes").value.trim() ? `メモ: ${$("notes").value.trim()}` : "";

  // Discord貼りやすい1メッセージにまとめる
  const lines = [
    `【${game} / ${character}】(${position === "corner" ? "端" : "中央"} / 難易度${difficulty})`,
    human ? `入力: ${human}` : "",
    symbol ? `記号: ${symbol}` : "",
    damage,
    tags,
    notes,
  ].filter(Boolean);

  return lines.join("\n");
}

async function sendToDiscord(message) {
  const res = await fetch(DISCORD_RELAY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`send failed: ${res.status}`);
}

$("sendDiscord").addEventListener("click", async () => {
  const statusEl = $("sendStatus");
  try {
    // 送る内容が空だと事故るのでガード
    if (!steps.length) { alert("手順が空です"); return; }

    const msg = buildDiscordMessage();
    statusEl.textContent = "送信中…";

    await sendToDiscord(msg);

    statusEl.textContent = "送信しました";
    setTimeout(() => (statusEl.textContent = ""), 2000);
  } catch (e) {
    statusEl.textContent = "";
    alert("Discord送信に失敗しました（中継URL/Workers設定を確認）");
    console.error(e);
  }
});
