let currentsong = new Audio();
let songs;
let currFolder;

function formatSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  //Show all the songs in the playlist

  let songul = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songul.innerHTML = "";
  for (const song of songs) {
    songul.innerHTML =
      songul.innerHTML +
      `<li>
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                <div> ${song.replaceAll("%20", " ")} </div>
            <div></div>
        </div>
            <div class="playnow">
            <span>Play now</span>
    <img class="invert " src="img/play.svg" alt="">
        </div>
        </li>`;
  }
  // Event listner to each song

  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

const playMusic = (track, pause = false) => {
  currentsong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentsong.play();
  }
  play.src = "img/pause.svg";
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayalbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let allas = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");
  let array = Array.from(allas);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];

      //Get the metadata of the folder

      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response);
      cardcontainer.innerHTML =
        cardcontainer.innerHTML +
        ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="100" height="100">
                    <circle cx="25" cy="25" r="22" fill="#00ff00" />
                    <polygon points="18,15 35,25 18,35" fill="#000" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.Discription}</p>
        </div>`;
    }
  }

  //Load the playlist whenever the card is clicked

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}
async function main() {
  await getSongs("songs/ncs");
  await getSongs("songs/Pritam");
  await getSongs("songs/ArijitSongs");

  playMusic(songs[0], true);

  //Display all the albums on the page

  displayalbums();

  //Event listner for play,pause,previous

  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "img/pause.svg";
    } else {
      currentsong.pause();
      play.src = "img/play.svg";
    }
  });
  // Listen for time update Event

  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatSeconds(
      currentsong.currentTime
    )}/${formatSeconds(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  //Eventlistner for hamburger

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  //Eventlistner for Closebutton

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  //Eventlistner for Previous

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  //Eventlistner for Next Buttons

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //Eventlistner for volume range

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentsong.volume = parseInt(e.target.value) / 100;
      if (currentsong.volume > 0) {
        let icon = document.querySelector(".volume > img");
        let src = icon.getAttribute("src"); // Get the src attribute
        console.log(src); // Print the current src attribute

        // Modify the src attribute
        src = "img/volume.svg";
        icon.setAttribute("src", src); // Set the modified src attribute
      }
      if (currentsong.volume == 0) {
        let icon = document.querySelector(".volume > img");
        let src = icon.getAttribute("src"); // Get the src attribute
        console.log(src); // Print the current src attribute

        // Modify the src attribute
        src = "img/mute.svg";
        icon.setAttribute("src", src);
      }
    });

  //Eventlistner to mute the current Song
  function muteMusic(e) {
    if (currentsong.volume > 0) {
      // If volume is not already muted, mute it
      e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
      currentsong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      // If volume is muted, unmute it and adjust volume level
      e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
      currentsong.volume = 0.1; // Set your desired volume level here
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10; // Set corresponding volume range value
    }
  }

  document
    .querySelector(".volume>img")
    .addEventListener("click", (e) => muteMusic(e));
}
main();
