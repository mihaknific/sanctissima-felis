const canvas = document.querySelector("canvas");
const secondsCount = document.querySelector(".seconds");
const secondsLabel = document.querySelector(".seconds-label");
const level = document.querySelector(".grade");
const lore = document.querySelector(".lore");
const context = canvas.getContext("2d");
const catDimensions = { width: 568, height: 426 }; // privzeto razmerje Shiva.webp (1448x1086), točno se nastavi ob nalaganju slike


const levels = {
  5: "radovednega",
  10: "pozornega",
  15: "čakajočega",
  20: "zvedavega",
  25: "potrpežljivega",
  30: "vztrajnega",
  35: "mirnega",
  40: "spoštljivega",
  45: "zvestega",
  50: "vdanega",
  55: "predanega",
  60: "gorečega",
  65: "neomajnega",
  70: "posvečenega",
  75: "blaženega",
  80: "razsvetljenega",
  85: "preroškega",
  90: "svetega"
}

// Kratka prizora spremljata obiskovalca od prvega pogleda do čaščenja.
const lores = {
  5: "Samo za hip si se ustavil. Tako si si rekel.",
  10: "Pogledaš Mačko. Mačka pogleda drugam.",
  15: "Počakaš še malo. Morda se bo zgodilo kaj zanimivega.",
  20: "Mačka si umije taco. Morda je to znamenje.",
  25: "Čakaš na nadaljevanje. Mačka nima pripomb.",
  30: "Premakne uho. Ne veš, ali je bilo namenoma.",
  35: "Uho miruje. Ti še vedno čakaš.",
  40: "Mačka vstane. Končno se nekaj dogaja.",
  45: "Odpravi se do sklede. Razlaga se ponuja sama.",
  50: "Skleda je prazna. Preiskava je zaključena.",
  55: "Mačka se vrne na svoje mesto. Tudi ti ostaneš.",
  60: "Njen izraz ti je že znan. Verjetno.",
  65: "Zapre oči. Tudi to bi lahko bilo znamenje.",
  70: "Ne premakneš se. Nočeš zamuditi naslednjega.",
  75: "Odpre eno oko. Ve, da si še tu.",
  80: "Nič se ni zgodilo. Čakanje je postalo glavni dogodek.",
  85: "Zdaj veš: tudi tišina nekaj pomeni. Verjetno.",
  90: "Mačka še vedno molči. Ti temu že praviš čaščenje."
}

// Začetna vloga in prizor za prvih pet sekund sta nastavljena v HTML-ju.

// Pravilna slovenska sklanjatev: 1 sekundo, 2 sekundi, 3 sekunde, 4 sekunde, 5+ sekund
// (z izjemo 11–14, ki imajo vedno "sekund": 11 sekund, 12 sekund, 111 sekund ...)
function sekundeBeseda(n) {
  const zadnjiDve = n % 100;
  if (zadnjiDve >= 11 && zadnjiDve <= 14) {
    return "sekund";
  }
  const zadnja = n % 10;
  if (zadnja === 1) {
    return "sekundo";
  }
  if (zadnja === 2) {
    return "sekundi";
  }
  if (zadnja === 3 || zadnja === 4) {
    return "sekunde";
  }
  return "sekund";
}

const startTime = Date.now();
let zadnjiMejnik = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
context.translate(window.innerWidth / 2, window.innerHeight / 2);

const image = new Image();
image.src = "./assets/Shiva.webp";
let offsetDistance = 120;
const fadeLayers = 5;
const movementRange = 200
let loopingCats = plastiZaEkran();
let currentOffset = 0;

// Posodobi osnovno velikost Mačke in razmik med plastmi glede na velikost zaslona.
// Na telefonih želimo manjšo začetno sliko (da jo je mogoče videti celo med obema pasicama),
// na velikih zaslonih pa ostane lepa velika (do 568x426).
function posodobiDimenzijeInRazmik() {
  const sirina = window.innerWidth;
  const visina = window.innerHeight;

  if (sirina <= 900) {
    // Mobilne naprave in tablice: manjši razmik in dinamično pomanjšana mačka
    offsetDistance = Math.max(70, Math.min(120, Math.round(sirina * 0.16)));

    if (image.naturalWidth && image.naturalHeight) {
      const aspectRatio = image.naturalWidth / image.naturalHeight;
      // Cilj na mobilnih: približno 50% širine ali 35% višine (kar je manjše)
      const maxW = sirina * 0.52;
      const maxH = visina * 0.36;

      let w = maxW;
      let h = w / aspectRatio;

      if (h > maxH) {
        h = maxH;
        w = h * aspectRatio;
      }

      w = Math.max(160, Math.min(568, Math.round(w)));
      h = Math.round(w / aspectRatio);

      catDimensions.width = w;
      catDimensions.height = h;
    }
  } else {
    // Računalniki / laptopi: ohrani točno originalno polno velikost in razmik 120
    offsetDistance = 120;
    if (image.naturalWidth && image.naturalHeight) {
      const baseHeight = 426;
      catDimensions.height = baseHeight;
      catDimensions.width = Math.round(baseHeight * image.naturalWidth / image.naturalHeight);
    }
  }
}

// Izračun podvojimo, da ostane več globine za oddaljene plasti.
function plastiZaEkran() {
  const aspect = catDimensions.height / catDimensions.width;
  const firstLayerWidth = catDimensions.width + offsetDistance;
  const firstLayerHeight = catDimensions.height + offsetDistance * aspect;
  let count = fadeLayers + 1;

  while (true) {
    const lastOpaqueLayer = count - fadeLayers;
    const additionalLayers = lastOpaqueLayer - 1;
    const maxShift = (movementRange / 2) * fadeLayers / count;
    const width = firstLayerWidth + additionalLayers * offsetDistance;
    const height = firstLayerHeight + additionalLayers * offsetDistance * aspect;

    if (
      width >= window.innerWidth + maxShift * 2 &&
      height >= window.innerHeight + maxShift * 2
    ) {
      const screenDepth = 40 + Math.ceil(Math.hypot(window.innerWidth, window.innerHeight) / 200);
      return Math.max(count * 2, screenDepth);
    }

    count++;
  }
}

// Uporabniki, ki v sistemu izklopijo animacije, dobijo mirno sliko (čas teče dalje).
const zmanjsanoGibanje = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const mouseOffset = {
  x: 0,
  y: 0
}

const movementOffset = {
  x: 0,
  y: 0
}

let loopingStarted = false;

image.onload = () => {
  posodobiDimenzijeInRazmik();
  loopingCats = plastiZaEkran();
  startLooping();
};

// Če se slika ne naloži (napačna pot, pokvarjena datoteka), vseeno zaženi
// vsaj čas, da stran ne ostane mrtva.
image.onerror = () => {
  startLooping();
};

// Varnostna mreža: če se ne sproži ne onload ne onerror, zaženi po 5 s.
setTimeout(() => {
  startLooping();
}, 5000);

window.onresize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  context.setTransform(1, 0, 0, 1, 0, 0); //Reset the canvas context
  context.translate(window.innerWidth / 2, window.innerHeight / 2);
  posodobiDimenzijeInRazmik();
  loopingCats = plastiZaEkran();
};

window.addEventListener('mousemove', onMouseMove)

// Telefon/tablica: prst deluje kot miška.
window.addEventListener('touchmove', (e) => {
  const dotik = e.touches[0];
  if (dotik) {
    onMouseMove({ clientX: dotik.clientX, clientY: dotik.clientY });
  }
}, { passive: true });

// Telefon/tablica: nagibanje naprave premika tunel (giroskop).
window.addEventListener('deviceorientation', (e) => {
  if (e.gamma == null || e.beta == null) {
    return;
  }
  const nagibX = Math.max(-1, Math.min(1, e.gamma / 30));
  const nagibY = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
  mouseOffset.x = nagibX * movementRange / 2;
  mouseOffset.y = nagibY * movementRange / 2;
});

// iOS zahteva dovoljenje za giroskop ob prvem dotiku.
window.addEventListener('touchstart', () => {
  if (typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().catch(() => { });
  }
}, { once: true });

// Info gumb zgoraj desno: tap preklopi oblaček (za naprave brez hoverja).
const credit = document.querySelector(".credit");
const infoBtn = document.querySelector(".info-btn");
if (credit && infoBtn) {
  infoBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const odprto = credit.classList.toggle("open");
    infoBtn.setAttribute("aria-expanded", odprto ? "true" : "false");
  });
  document.addEventListener("click", (e) => {
    if (!credit.contains(e.target)) {
      credit.classList.remove("open");
      infoBtn.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      credit.classList.remove("open");
      infoBtn.setAttribute("aria-expanded", "false");
    }
  });
}

function draw(offset, loopCount) {

  // Širina raste za `offset`, višina pa sorazmerno z razmerjem slike,
  // da se Mačka v nobeni plasti tunela ne raztegne.
  const aspect = catDimensions.height / catDimensions.width;
  const w = catDimensions.width + offset;
  const h = catDimensions.height + offset * aspect;
  const currentPercentage = (loopingCats - loopCount) / loopingCats;
  // Fade the reserve layers completely outside the viewport so the loop
  // can wrap without a visible outer image suddenly disappearing.
  context.globalAlpha = Math.min(1, (loopingCats - loopCount) / fadeLayers);
  context.drawImage(
    image,
    -w / 2 + (movementOffset.x * currentPercentage),
    -h / 2 + (movementOffset.y * currentPercentage),
    w,
    h
  );
  context.globalAlpha = 1;
}

function onMouseMove(e) {
  mouseOffset.x = (e.clientX - window.innerWidth / 2) / window.innerWidth / 2 * movementRange
  mouseOffset.y = (e.clientY - window.innerHeight / 2) / window.innerHeight / 2 * movementRange
}

function lerp(start, end, amount) {
  return start * (1 - amount) + end * amount
}

function loopDraw() {

  if (!zmanjsanoGibanje) {
    movementOffset.x = lerp(movementOffset.x, mouseOffset.x, 0.05)
    movementOffset.y = lerp(movementOffset.y, mouseOffset.y, 0.05)
  }

  // Slika se riše le, ko je res naložena; čas teče vedno.
  if (image.complete && image.naturalWidth) {
    // Počisti platno, da prosojnost zunanjih plasti res pokaže ozadje
    // (brez tega bi se polprosojne plasti skozi frejme nabrale v polno).
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();

    for (let i = loopingCats; i >= 1; i--) {
      draw(i * offsetDistance + currentOffset, i);
    }

    draw(offsetDistance, 1);

    if (!zmanjsanoGibanje) {
      currentOffset++;
      if (currentOffset >= offsetDistance) {
        currentOffset = 0;
      }
    }
  }

  const newTime = Math.floor((Date.now() - startTime) / 1000);

  secondsCount.innerText = newTime;
  if (secondsLabel) {
    secondsLabel.innerText = sekundeBeseda(newTime);
  }

  const mejnik = Math.min(Math.floor(newTime / 5) * 5, 90);
  if (mejnik !== zadnjiMejnik) {
    if (levels[mejnik]) {
      level.innerText = levels[mejnik];
      lore.innerText = lores[mejnik];
    }
    zadnjiMejnik = mejnik;
  }

  requestAnimationFrame(loopDraw);
}

function startLooping() {
  if (loopingStarted) {
    return;
  }
  loopingStarted = true;
  requestAnimationFrame(loopDraw);
}