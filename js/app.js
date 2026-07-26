// Swupを初期化する。
// これ以降、同一サイト内のリンクは通常のページ読み込みではなく、
// Swupがリンク先のHTMLを取得して #swup の中身だけを差し替える。
const swup = new Swup();

// HTMLMediaElement（<audio> または <video>）が再生中かどうかを調べる。
// paused は停止中に true になるため、先頭に ! を付けて結果を反転する。
function isPlaying(media) {
  return !media.paused;
}

// 音声要素と再生ボタンは #swup の外にある。
// そのためSwupでページを切り替えても同じDOM要素が残り、
// 音声の再生位置と再生／停止の状態も維持される。
const audio = document.querySelector("#audio");
const playButton = document.querySelector("#play");

// HTMLの変更などで必要な要素が見つからなかった場合、
// 原因に気付きやすいように明示的なエラーを発生させる。
if (!audio || !playButton) {
  throw new Error("音声要素または再生ボタンが見つかりません。");
}

// 現在の再生状態に合わせて、ボタンに表示するアイコン名を切り替える。
// 文字列がアイコンとして表示されるのは、CSSでMaterial Symbolsを
// アイコンフォントとして指定しているため。
function updatePlayButtonState() {
  const playing = isPlaying(audio);

  playButton.textContent = playing ? "volume_up" : "volume_off";
}

// 最初にHTMLを読み込んだ時点の状態をボタンへ反映する。
updatePlayButtonState();

// play/pauseイベントを監視して、状態が変わるたびに表示を更新する。
audio.addEventListener("play", updatePlayButtonState);
audio.addEventListener("pause", updatePlayButtonState);

// ボタンが押されたとき、音声が再生中なら停止し、
// 停止中なら再生する。
function toggleAudioPlayback() {
  if (isPlaying(audio)) {
    audio.pause();
    return;
  }

  // play()はPromiseを返す。ブラウザの自動再生ポリシーなどで
  // 再生できなかった場合に備え、失敗をコンソールへ表示する。
  audio.play().catch((error) => {
    console.error("音声を再生できませんでした。", error);
  });
}

// クリックのたびに再生と停止を切り替える。
playButton.addEventListener("click", toggleAudioPlayback);

// 現在のページに背景動画があれば再生を開始する。
function startVideo() {
  // 動画は #swup の中にあるため、ページが切り替わるたびに
  // その時点のDOMから改めて取得する必要がある。
  const video = document.querySelector(".hero-video");

  // トップページ以外には動画がないため、何もしない。
  if (!video) {
    return;
  }

  // すでに再生中なら、重ねてplay()を呼ばない。
  if (isPlaying(video)) {
    return;
  }

  // 動画はHTML側で muted にして、自動再生が許可されやすい形にしている。
  // それでもブラウザの設定などで失敗する可能性があるため、
  // play()の失敗を捕捉する。
  video.play().catch((error) => {
    console.error("動画を再生できませんでした。", error);
  });
}

// 通常のアクセスで最初にトップページを表示した場合に実行する。
startVideo();

// Swupではページ切り替え時にJavaScriptファイル自体は再実行されない。
// page:viewは、Swupによる新しいページの表示後に呼ばれるフック。
// AboutなどからHomeへ戻ったときに、新しく挿入された動画を再生する。
swup.hooks.on("page:view", startVideo);
