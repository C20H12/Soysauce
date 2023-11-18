const htmlToInsert = `
<style>
  #sauce-666 {
    position: absolute;
    right: 5vw;
    top: 10vh;
    background-color: #7b3d3d;
    padding: 1em;
    border: 3px solid black;
    border-radius: 15px;
  }
  #sauce-666:hover {
    background-color: #008989;
  }
</style>
<button id="sauce-666" onclick="const a=document.querySelector('form[name=Pass]');a.insertAdjacentHTML('beforeend',\`<input id='annotate_it' name='it' type='hidden' value='0'><input id='more_ts' name='more_ts' type='hidden' value='ostentatious'>\`);a.submit()">
  Pour some sauce
</button>
`;

// display the button if a storage item exists and is true
const enabledStatus = localStorage.getItem("ss-ctl-enabled");
if (enabledStatus === "true") {
  document.body.insertAdjacentHTML("beforeend", htmlToInsert);
}

let intervalId;

chrome.runtime.onMessage.addListener((msg, _sender, respond) => {

  if (msg === "enable-ctl") {
    try {
      document.body.insertAdjacentHTML("beforeend", htmlToInsert);
    } 
    catch {
      alert("Current page not supported.")
    }
  
    localStorage.setItem("ss-ctl-enabled", "true");

    respond(true);
  }
  
  else if (msg === "disable-ctl") {
    document.getElementById("sauce-666").remove();

    localStorage.setItem("ss-ctl-enabled", "false");

    respond(true);
  }

  else if (msg === "enable-stall") {
    // stall time by scrolling so it doesn't detect as inactivity
    let y = 100
    intervalId = setInterval(() => {
      y = -y;
      window.scroll(0, y);
    }, 2000);

    respond(true);
  }

  else if (msg === "disable-stall") {
    clearInterval(intervalId);

    respond(true);
  }
  
  else{
    respond(false);
  }

});


window.addEventListener("keydown", (e) => {
  if (e.key === "\\") {
    const a=document.querySelector("form[name=Pass]")
    a.insertAdjacentHTML("beforeend",'<input id="annotate_it" name="it" type="hidden" value="0"><input id="more_ts" name="more_ts" type="hidden" value="ostentatious">')
    a.submit()
  }
  e.stopImmediatePropagation();
})

