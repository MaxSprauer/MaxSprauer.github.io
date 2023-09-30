// Copyright 2023 Max Sprauer

let gFrames = [];
let gCanvas;
let gCtx;
let gPlaying = false;
let gStartTimeStamp, gPreviousTimeStamp;
let gWordDiv;

function draw(id) {
  if (gCtx) {
    const img = document.getElementById(id);
    gCtx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

function drawWord(word) {
  if (gWordDiv === undefined) {
    gWordDiv = document.getElementById("currentWord");
  }
  gWordDiv.textContent = word;
}

function getCurrentAudioTime() {
  const audio = document.querySelector("audio");
  return audio.currentTime;
}

function drawFrame(timeStamp) {
  if (gStartTimeStamp === undefined) {
    gStartTimeStamp = timeStamp;
  }

  if (gPreviousTimeStamp !== timeStamp) {
    gPreviousTimeStamp = timeStamp;

    // Find the current frame to draw
    const frame = gFrames.findLast(
      // (f) => f.offset * 1000.0 <= timeStamp - gStartTimeStamp
      (f) => f.offset + FUDGE_SEC <= getCurrentAudioTime()
    );
    draw(frame.frame);
    drawWord(frame.word);
  }

  if (gPlaying) {
    window.requestAnimationFrame(drawFrame);
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
function adjustForHiRes() {
  // Get the DPR and size of the canvas
  const dpr = window.devicePixelRatio;
  const rect = gCanvas.getBoundingClientRect();

  // Set the "actual" size of the canvas
  gCanvas.width = rect.width * dpr;
  gCanvas.height = rect.height * dpr;

  // Scale the context to ensure correct drawing operations
  gCtx.scale(dpr, dpr);

  // Set the "drawn" size of the canvas
  gCanvas.style.width = `${rect.width}px`;
  gCanvas.style.height = `${rect.height}px`;
}

async function init() {
  gCanvas = document.getElementById("talking");
  gCtx = gCanvas.getContext ? gCanvas.getContext("2d") : null;

  adjustForHiRes(gCanvas);
  await loadImages(IMAGES, gCanvas);

  draw(FACE_ONLOAD);
  const speechData = await populateSpeech();
  gFrames = parseWords(speechData.results.channels[0].alternatives[0].words);

  console.log(gFrames);

  const audio = document.querySelector("audio");

  const playHandler = (event) => {
    console.log("Starting animation");
    gPlaying = true;
    window.requestAnimationFrame(drawFrame);
  };

  const stopHandler = (event) => {
    console.log("Stopping animation");
    gPlaying = false;
  };

  audio.onplay = playHandler;
  audio.onplaying = playHandler;
  audio.onended = stopHandler;
  audio.onpause = stopHandler;
}

window.addEventListener("load", init);
