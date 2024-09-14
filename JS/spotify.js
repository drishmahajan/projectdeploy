let currentsong = new Audio();
let songs = [];
let index = 0;
let currfolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const roundedSeconds = Math.round(seconds);
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currfolder = folder;
    try {
        let response = await fetch(`http://127.0.0.1:3000/${folder}/`);
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let as = div.getElementsByTagName("a");
        let songsList = [];
        let artistData = {};

        try {
            let infoResponse = await fetch(`http://127.0.0.1:3000/${folder}/info.json`);
            artistData = await infoResponse.json();
        } catch (infoError) {
            console.error('Error fetching info.json:', infoError);
        }

        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                let songPath = element.href.split(`/${folder}/`)[1];
                let songName = songPath.split('.mp3')[0];
                songsList.push({ path: songPath, name: decodeURIComponent(songName) });
            }
        }

        let songul = document.querySelector(".songlist ul");
        songul.innerHTML = ''; 
        for (const song of songsList) {
            songul.innerHTML += `<li>
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.name}</div>
                    <div> ${artistData.title || ''}</div>
                </div>
                <div class="playnow">
                    <span>play now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
        }
        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((li, i) => {
            li.addEventListener("click", () => {
                playmusic(songsList[i]);
            });
        });

        return songsList;
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

const playmusic = (song, pause = false) => {
    currentsong.src = `/${currfolder}/` + song.path;
    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = song.name; 
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};






async function displayalbum(){
    let response = await fetch(`http://127.0.0.1:3000/songs/`);
        let text = await response.text();
           let div = document.createElement("div");
        div.innerHTML = text;
        let anchors=div.getElementsByTagName("a")
        let cardcontainer=document.querySelector(".cardcontainer")
        let array=Array.from(anchors)
            for (let index = 0; index < array.length; index++) {
                const e = array[index];
                
                if(e.href.includes("/songs")){
                    let folder=e.href.split("/").slice(-2)[0]  
                    let songresponse = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
                    let songdata = await songresponse.json();   
                    cardcontainer.innerHTML=cardcontainer.innerHTML+`<div data-folder=
                    "${folder}" class="card">
                    <div class="circle">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox=" 0 24 24" fill="black"><path d="M3 22V2l18 10L3 22z"/></svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpeg" alt="">
                    <h3>${songdata.title}</h3>
                    <p>${songdata.description}</p>
                    </div>`
                }
            } 
        Array.from(document.getElementsByClassName("card")).forEach((e) => {
            e.addEventListener("click",async (item) => {
              songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
              playmusic(songs[0])
              
            }
            )
            
          }
          )
        
   }


async function main() {
    songs = await getsongs("songs/liked");
    if (songs.length > 0) {
        playmusic(songs[0], true);
        
    }

displayalbum()

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        } else {
            currentsong.pause();
            play.src = "img/play.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`;
        document.querySelector(".circle1").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle1").style.left = percent + "px";
        currentsong.currentTime = (currentsong.duration) * percent / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        index = (index > 0) ? index - 1 : songs.length - 1;
        playmusic(songs[index]);
    });

    next.addEventListener("click", () => {
        currentsong.pause();
        index = (index < songs.length - 1) ? index + 1 : 0;
        playmusic(songs[index]);
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log('Setting volume', e.target.value, "/100");
        currentsong.volume = parseInt(e.target.value) / 100;
    });
let lastvolume = 1;
let wasPlaying = false;
document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("img/volume.svg")) {
         lastvolume = currentsong.volume;
        e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
        currentsong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value=0
        
       } else {
        e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
        currentsong.volume = lastvolume; 
        document.querySelector(".range").getElementsByTagName("input")[0].value=lastvolume*1
        
    }
});

}

main();
