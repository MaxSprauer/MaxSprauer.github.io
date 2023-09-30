// Copyright 2023 Max Sprauer

async function loadImages(images, parentElem) {
  await Promise.all(
    images.map((image) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        parentElem.appendChild(img);
        img.onload = () => resolve(img);
        img.onerror = () => reject;
        img.id = image;
        img.src = "images/" + image + ".png";
      });
    })
  );
}

async function populateSpeech() {
  const request = new Request("speech/nova_2_life_moves_pretty_fast.json");

  const response = await fetch(request);
  console.log(response);

  const speechData = await response.json();

  console.log(speechData.results.channels[0].alternatives[0].words[0]);
  return speechData;
}

function parseWords(words) {
  const sounds = [];
  const frames = [];

  for (const face of FACES) {
    const results = face.substring(5).split("_");
    for (const result of results) {
      sounds.push({
        sound: result,
        id: face,
      });
    }
  }

  // Add frame before words are spoken
  frames.push({
    offset: 0.0,
    frame: FACE_START,
    word: "",
  });

  for (const wordObj of words) {
    const duration = wordObj.end - wordObj.start;

    // Find number of sounds in word
    let count = 0,
      offset = 0;

    do {
      let found = false;
      for (const soundObj of sounds) {
        if (wordObj.word.startsWith(soundObj.sound, offset)) {
          count++;
          offset += soundObj.sound.length;
          found = true;
          break;
        }
      }

      // If we didn't find a match, assume the default face
      if (!found) {
        count++;
        offset += 1;
      }
    } while (offset < wordObj.word.length);

    // Now create frames with equal duration for each sound, plus one for closed mouth.
    // This is because the end of one word and start of the next are often the same value.
    const faceDuration = duration / (count + 1);
    i = 0;
    offset = 0;
    do {
      let found = false;
      for (const soundObj of sounds) {
        if (wordObj.word.startsWith(soundObj.sound, offset)) {
          frames.push({
            offset: i * faceDuration + wordObj.start,
            frame: soundObj.id,
            word: wordObj.word,
          });

          offset += soundObj.sound.length;
          found = true;
          break;
        }
      }

      // If we didn't find a match, assume the default face
      if (!found) {
        frames.push({
          offset: i * faceDuration + wordObj.start,
          frame: FACE_DEFAULT_SOUND,
          word: wordObj.word,
        });
        offset += 1;
      }

      i++;
    } while (offset < wordObj.word.length);

    frames.push({
      offset: i * faceDuration + wordObj.start,
      frame: FACE_END_OF_WORD,
      word: "",
    });
  }

  // Add frame after all words are spoken
  frames.push({
    offset: frames[frames.length - 1].offset,
    frame: FACE_END,
    word: "",
  });

  return frames;
}
