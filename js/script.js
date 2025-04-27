console.log("I am Scripting");
const currSong = new Audio()
let currfolder;
async function getSongs(folder) {
    currfolder = folder
    let encodedFolder = encodeURIComponent(currfolder)
    let a = await fetch(`./songs/${encodedFolder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response

    let aTags = div.getElementsByTagName("a")
    let songs = []
    for (let index = 0; index < aTags.length; index++) {
        const element = aTags[index]
        if (element.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(element.href.split(`${encodedFolder}/`)[1]))
        }
    }
    // playMusic(songs[0], true)

    // Display the list of songs
    let songUL = document.querySelector(".songList ul")
    songUL.innerHTML = ""
    songs.forEach((song) => {
        let li = document.createElement("li")
        li.innerHTML = ` <img src="music-solid.svg" alt="">
                        <div class="song-info">
                        <div>${song}</div>
                        </div>`
        songUL.appendChild(li)
    })

    // Event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(ele => {
        ele.addEventListener("click", () => {
            // console.log(ele.querySelector(".song-info").lastElementChild.innerHTML)
            playMusic(ele.querySelector(".song-info").lastElementChild.innerHTML)
        })
    });

    return songs
}

function convertSecondsToTimeFormat(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60)
    const formattedSeconds = String(remainingSeconds).padStart(2, '0')
    return `${minutes}:${formattedSeconds}`
}

function playMusic(track, pause = false) {
    currSong.src = `/songs/${currfolder}/${track}`
    currSong.load()
    if (pause == false) {
        play.src = "icons/pause-solid.svg"
        currSong.play()
    }
    document.getElementById("song-name").innerHTML = track
}

async function displayFolder() {
    let a = await fetch(`/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(div.getElementsByTagName("a"))
    for (let index = 0; index < array.length; index++) {
        if (array[index].href.includes("/songs/")) {
            let folder = decodeURIComponent(array[index].href.split("/").splice(-1))
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card b1" data-folder="${folder}">
                    <div style="position: absolute;" class="play">

                    </div>
                    <img src="/songs/${folder}/cover.jpg">
                    <h2>${response.title}</h2>    
                    <p>${response.desc}</p>
                    </div>`
        }
    }

    // Add event to load songs from different playlists
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

(async function () {
    // let songs = await getSongs(currfolder)

    displayFolder()


    // Event Listner for play/pause
    const play = document.getElementById("play")
    const prev = document.getElementById("prev")
    const next = document.getElementById("next")

    // Add event to play/pause
    play.addEventListener("click", () => {
        if (currSong.paused && currSong.src != "") {
            currSong.play()
            play.src = "icons/pause-solid.svg"
        } else {
            currSong.pause()
            play.src = "icons/play-solid.svg"
        }
    })

    // Add event to prev
    prev.addEventListener("click", () => {
        console.log("previous is clicked");
        let index = songs.indexOf(decodeURIComponent(currSong.src.split("/").splice(-1)[0]))
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Add event to next
    next.addEventListener("click", () => {
        console.log("next is clicked");
        let index = songs.indexOf(decodeURIComponent(currSong.src.split("/").splice(-1)[0]))
        if (index < songs.length - 1) { // Ensure index doesn't exceed array bounds
            playMusic(songs[index + 1]);
        }
    });

    // Add event listner for circle to move according to song time
    currSong.addEventListener("timeupdate", () => {
        document.querySelector(".circle").style.left = (currSong.currentTime / currSong.duration) * 100 + "%";
        document.querySelector(".song-length").innerHTML = `${convertSecondsToTimeFormat(currSong.currentTime)} / ${convertSecondsToTimeFormat(currSong.duration)}`
    });

    // Add event listner to seek-bar to change songs Current Time
    document.querySelector(".seek-bar").addEventListener("click", e => {
        let circlePosition = (e.offsetX / e.target.getBoundingClientRect().width)
        document.querySelector(".circle").style.left = circlePosition * 100 + "%"
        currSong.currentTime = (currSong.duration * circlePosition)
    })

    // Add event to volume
    document.getElementById("volume").addEventListener("change", e => {
        const volumeValue = e.target.value
        const volImg = document.getElementById("vol-img")

        if (volumeValue == 0) {
            volImg.src = 'icons/volume-xmark-solid.svg'
        } else if (volumeValue == 100) {
            volImg.src = 'icons/volume-high-solid.svg'
        } else {
            volImg.src = 'icons/volume-low-solid.svg'
        }
        currSong.volume = volumeValue / 100
    })

    // Add event for mute/unmute
    document.getElementById("vol-img").addEventListener("click", () => {
        const volImg = document.getElementById("vol-img");
        const volume = document.getElementById("volume");

        if (currSong.volume > 0) {
            volImg.src = "icons/volume-xmark-solid.svg"
            volume.value = 0
            currSong.volume = 0
        } else {
            volImg.src = "icons/volume-low-solid.svg"
            volume.value = 30
            currSong.volume = 0.3
        }
    })


    // Add event listner for bars(make left visible)
    document.getElementById("bars").addEventListener("click", () => {
        document.querySelector(".main-left").style.left = "0%"
        document.querySelector("#close").style.display = "block"
    })

    // Add event listner for close
    document.getElementById("close").addEventListener("click", () => {
        document.querySelector(".main-left").style.left = "-100%"
    })

})()
