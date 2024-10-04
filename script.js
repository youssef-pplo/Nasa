let scene, camera, renderer, controls;
let stats;
let planets = [];
let dayCounter = 0;
let speedFactor = 0.01;
let sunLight, ambientLight;
let initialCameraPosition = new THREE.Vector3(150, 50, 150);
let initialControlsSettings = {};
let cameraTransitionDuration = 1.5;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let tooltip = document.createElement("div");
let gui;
let activeModal = null;
let earthGroup;
let controlParams = {
  speed: speedFactor,
  orbitVisibility: 0.5,
  rotationSpeed: 1.0,
  sunlightIntensity: 2,
  starlightIntensity: 1,
  cameraDistance: 150,
  asteroidBeltDensity: 5000,
  showNEOs: false,
};
const apiKey = "3bHNEVcdpokviJJZmZGBCWePLJUgQnIdb8sP3M1M";
const apiBaseUrl = "https://en.wikipedia.org/w/api.php";
const neoApiBaseUrl = "https://api.nasa.gov/neo/rest/v1/";
const celestialBodies = [
  {
    name: "Sun",
    radius: 20,
    distance: 0,
    color: 0xffff00,
    orbitSpeed: 0,
    size: "1,392,684 km",
    distanceFromSun: "0 km",
    textureUrl: "https://pplo010.sirv.com/2k_sun.jpg",
    initialAngle: 0,
    description:
      "The Sun is a yellow dwarf star, a hot ball of glowing gases at the heart of our solar system. Its gravity holds everything from the biggest planets to the smallest particles of debris in its orbit.",
    shortDescription: "The Sun is a star, a hot ball of glowing gases.",
    moons: [],
  },
  {
    name: "Mercury",
    radius: 2,
    distance: 30,
    color: 0xaaaaaa,
    orbitSpeed: 0.02,
    size: "4,880 km",
    distanceFromSun: "57.9 million km",
    textureUrl: "https://pplo010.sirv.com/2k_mercury.jpg",
    initialAngle: 0,
    description:
      "Mercury is the smallest planet in our solar system and the closest to the Sun. It is only slightly larger than Earth’s Moon. Mercury is a rocky planet, also known as a terrestrial planet.",
    shortDescription: "Mercury is the smallest planet in our solar system.",
    moons: [],
    keplerianElements: {
      semiMajorAxis: 0.3871,
      eccentricity: 0.2056,
      inclination: 7.005,
      longitudeOfAscendingNode: 48.331,
      argumentOfPerihelion: 29.124,
    },
  },
  {
    name: "Venus",
    radius: 3,
    distance: 45,
    color: 0xffcc99,
    orbitSpeed: 0.015,
    size: "12,104 km",
    distanceFromSun: "108.2 million km",
    textureUrl: "https://pplo010.sirv.com/2k_venus_atmosphere.jpg",
    initialAngle: Math.PI / 3,
    description:
      "Venus is the second planet from the Sun and is Earth’s closest planetary neighbor. It’s often called Earth’s twin because it’s similar in size and density to our planet.",
    shortDescription: "Venus, Earth's twin, is the second planet from the Sun.",
    moons: [],
    keplerianElements: {
      semiMajorAxis: 0.7233,
      eccentricity: 0.0068,
      inclination: 3.39458,
      longitudeOfAscendingNode: 76.68,
      argumentOfPerihelion: 54.884,
    },
  },
  {
    name: "Earth",
    radius: 4,
    distance: 60,
    color: 0x3399ff,
    orbitSpeed: 0.01,
    size: "12,742 km",
    distanceFromSun: "149.6 million km",
    textureUrl: "https://pplo010.sirv.com/2k_earth_daymap.jpg",
    initialAngle: Math.PI / 2,
    description:
      "Earth is the third planet from the Sun, and the only place we know of so far that’s inhabited by living things. While Earth is only the fifth largest planet in the solar system, it is the only world in our solar system with liquid water on the surface.",
    shortDescription:
      "Earth is the only planet in our solar system with liquid water on the surface..",
    moons: [
      {
        name: "Moon",
        radius: 1,
        distance: 6,
        color: 0xcccccc,
        orbitSpeed: 0.05,
        textureUrl: "https://pplo010.sirv.com/2k_moon.jpg",
      },
    ],
    keplerianElements: {
      semiMajorAxis: 1.00000011,
      eccentricity: 0.01671022,
      inclination: 0.00005,
      longitudeOfAscendingNode: -11.26064,
      argumentOfPerihelion: 102.94719,
    },
  },
  {
    name: "Mars",
    radius: 3,
    distance: 80,
    color: 0xff3300,
    orbitSpeed: 0.008,
    size: "6,779 km",
    distanceFromSun: "227.9 million km",
    textureUrl: "https://pplo010.sirv.com/2k_mars.jpg",
    initialAngle: Math.PI,
    description:
      "Mars is the fourth planet from the Sun and the second-smallest planet in our solar system, being larger than only Mercury. Mars is often called the “Red Planet” because of its rusty color.",
    shortDescription:
      "Mars is often called the “Red Planet” because of its rusty color.",
    moons: [],
    keplerianElements: {
      semiMajorAxis: 1.52366231,
      eccentricity: 0.09341233,
      inclination: 1.85061,
      longitudeOfAscendingNode: 49.57854,
      argumentOfPerihelion: 286.50162,
    },
  },
  {
    name: "Jupiter",
    radius: 7,
    distance: 110,
    color: 0xffcc66,
    orbitSpeed: 0.005,
    size: "139,820 km",
    distanceFromSun: "778.3 million km",
    textureUrl: "https://pplo010.sirv.com/2k_jupiter.jpg",
    initialAngle: (4 * Math.PI) / 3,
    description:
      "Jupiter is the fifth planet from our Sun and is, by far, the largest planet in the solar system. Jupiter is more than twice as massive as all the other planets combined.",
    shortDescription: "Jupiter is the largest planet in the solar system",
    moons: [],
    keplerianElements: {
      semiMajorAxis: 5.20336301,
      eccentricity: 0.04839266,
      inclination: 1.3053,
      longitudeOfAscendingNode: 100.55615,
      argumentOfPerihelion: 273.87773,
    },
  },
  {
    name: "Saturn",
    radius: 6,
    distance: 140,
    color: 0xffcc33,
    orbitSpeed: 0.003,
    size: "116,460 km",
    distanceFromSun: "1.4 billion km",
    textureUrl: "https://pplo010.sirv.com/2k_saturn.jpg",
    initialAngle: (3 * Math.PI) / 2,
    description:
      "Saturn is the sixth planet from the Sun and the second largest planet in our solar system. Like fellow gas giant Jupiter, Saturn is a massive ball made mostly of hydrogen and helium.",
    shortDescription:
      "Adorned with a dazzling system of icy rings, Saturn is unique among the planets.",
    moons: [],
    keplerianElements: {
      semiMajorAxis: 9.53707032,
      eccentricity: 0.0541506,
      inclination: 2.48446,
      longitudeOfAscendingNode: 113.71504,
      argumentOfPerihelion: 339.392,
    },
  },
  {
    name: "Uranus",
    radius: 5,
    distance: 170,
    color: 0x66ccff,
    orbitSpeed: 0.002,
    size: "50,724 km",
    distanceFromSun: "2.9 billion km",
    textureUrl: "https://pplo010.sirv.com/2k_uranus.jpg",
    initialAngle: (5 * Math.PI) / 3,
    description:
      "Uranus is the seventh planet from the Sun, and has the third-largest diameter in our solar system. It was discovered in 1781, and visible to the naked eye under certain conditions.",
    shortDescription:
      "Uranus spins on its side, making it different from all the other planets.",
    moons: [],
    keplerianElements: {
      semiMajorAxis: 19.19126393,
      eccentricity: 0.04716771,
      inclination: 0.76986,
      longitudeOfAscendingNode: 74.22988,
      argumentOfPerihelion: 96.998857,
    },
  },
  {
    name: "Neptune",
    radius: 5,
    distance: 200,
    color: 0x3333cc,
    orbitSpeed: 0.001,
    size: "49,244 km",
    distanceFromSun: "4.5 billion km",
    textureUrl: "https://pplo010.sirv.com/2k_neptune.jpg",
    initialAngle: 2 * Math.PI,
    description:
      "Neptune is the eighth planet from the Sun and is dark, cold and whipped by supersonic winds. It was the first planet located through mathematical calculations, rather than by telescope",
    shortDescription:
      "Neptune is our solar system's farthest planet from the Sun..",
    moons: [],
    keplerianElements: {
      semiMajorAxis: 30.06896348,
      eccentricity: 0.00858587,
      inclination: 1.76917,
      longitudeOfAscendingNode: 131.72169,
      argumentOfPerihelion: 272.8461,
    },
  },
];
let neoObjects = [];
const neoTextures = [
  "https://pplo010.sirv.com/m1.jpg",
  "https://pplo010.sirv.com/m2.jpg",
  "https://pplo010.sirv.com/m3.jpg",
  "https://pplo010.sirv.com/m4.jpg",
];
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    5000
  );
  camera.position.copy(initialCameraPosition);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.minDistance = 50;
  controls.maxDistance = 400;
  controls.rotateSpeed = 0.3;
  initialControlsSettings = {
    position: camera.position.clone(),
    rotation: camera.rotation.clone(),
    target: controls.target.clone(),
    zoom: controls.zoom,
  };
  earthGroup = new THREE.Group();
  scene.add(earthGroup);
  celestialBodies.forEach((body) => {
    createCelestialBody(body);
  });
  sunLight = new THREE.PointLight(
    0xffffff,
    controlParams.sunlightIntensity,
    1000
  );
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);
  ambientLight = new THREE.AmbientLight(
    0xffffff,
    controlParams.starlightIntensity
  );
  scene.add(ambientLight);
  createStarfield(10000, 5000);
  createAsteroidBelt(controlParams.asteroidBeltDensity);
  window.addEventListener("resize", onWindowResize, false);
  window.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("click", onClick, false);
  controls.addEventListener("change", () => {
    controls.update();
  });
  tooltip.style.position = "absolute";
  tooltip.style.display = "none";
  tooltip.style.padding = "8px";
  tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  tooltip.style.color = "#fff";
  tooltip.style.borderRadius = "5px";
  tooltip.style.pointerEvents = "none";
  document.body.appendChild(tooltip);
  initGUI();
  initStats();
  animate();
  const preloader = document.getElementById("preloader");
  if (preloader) {
    preloader.style.display = "none";
  }
}
function animate() {
  requestAnimationFrame(animate);
  if (stats) {
    stats.update();
  }
  planets.forEach((planet) => {
    planet.rotation.y += (speedFactor * controlParams.rotationSpeed) / 500;
    const angle = planet.orbitSpeed * dayCounter + planet.initialAngle;
    planet.position.set(
      planet.orbitDistance * Math.cos(angle),
      0,
      planet.orbitDistance * Math.sin(angle)
    );
  });
  earthGroup.rotation.y += (speedFactor * controlParams.rotationSpeed) / 500;
  dayCounter += speedFactor;
  document.getElementById("dayCounter").innerText = `Day: ${Math.floor(
    dayCounter
  )}`;
  updateDateCounter(dayCounter);
  neoObjects.forEach((neo) => {
    const angle = neo.orbitSpeed * dayCounter + neo.initialAngle;
    neo.position.set(
      neo.orbitDistance * Math.cos(angle),
      0,
      neo.orbitDistance * Math.sin(angle)
    );
  });
  renderer.render(scene, camera);
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
let prevIntersected = null;
function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(
    planets.concat(neoObjects),
    true
  );
  if (intersects.length > 0) {
    const intersected = intersects[0].object;
    if (intersected.userData && intersected.userData.name) {
      showTooltip(intersected, event);
      if (intersected !== prevIntersected) {
        if (prevIntersected) {
          gsap.to(prevIntersected.scale, {
            duration: 0.5,
            x: 1,
            y: 1,
            z: 1,
            ease: "power2.out",
          });
        }
        gsap.to(intersected.scale, {
          duration: 0.5,
          x: 1.1,
          y: 1.1,
          z: 1.1,
          ease: "power2.out",
        });
        prevIntersected = intersected;
      }
    }
  } else {
    hideTooltip();
    if (prevIntersected) {
      gsap.to(prevIntersected.scale, {
        duration: 0.5,
        x: 1,
        y: 1,
        z: 1,
        ease: "power2.out",
      });
      prevIntersected = null;
    }
  }
}
function onClick(event) {
  if (activeModal) return;
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(
    planets.concat(neoObjects),
    true
  );
  if (intersects.length > 0) {
    const object = intersects[0].object;
    if (object.userData.name !== "Sun") {
      fetchObjectInfo(object);
    }
  }
}
function focusOnEarth() {
  const earthPosition = earthGroup.position.clone();
  gsap.to(controls.target, {
    duration: 1.5,
    x: earthPosition.x,
    y: earthPosition.y,
    z: earthPosition.z,
    ease: "power2.inOut",
    onUpdate: function () {
      controls.update();
    },
  });
  gsap.to(camera.position, {
    duration: 1.5,
    x: earthPosition.x + 30,
    y: earthPosition.y + 10,
    z: earthPosition.z + 30,
    ease: "power2.inOut",
    onUpdate: function () {
      controls.update();
    },
  });
}
function showTooltip(object, event) {
  tooltip.innerHTML = object.userData.name;
  tooltip.style.display = "block";
  tooltip.style.left = `${event.clientX + 15}px`;
  tooltip.style.top = `${event.clientY + 15}px`;
}
function hideTooltip() {
  tooltip.style.display = "none";
}
function fetchObjectInfo(object) {
  if (object.userData.isNEO) {
    showNeoModal(object);
  } else {
    fetchPlanetInfo(object);
  }
}
function showNeoModal(neo) {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.style.position = "fixed";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.backgroundColor = "rgba(30, 30, 30, 0.95)";
  modal.style.borderRadius = "10px";
  modal.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
  modal.style.zIndex = "1000";
  modal.style.color = "#f5f5f5";
  modal.style.maxWidth = "500px";
  modal.style.fontFamily = "Arial, sans-serif";
  const modalHeader = document.createElement("div");
  modalHeader.classList.add("modal-header");
  modalHeader.id = "modalHeader";
  modalHeader.style.display = "flex";
  modalHeader.style.alignItems = "center";
  modalHeader.style.padding = "10px";
  modalHeader.style.backgroundColor = "rgba(40, 40, 40, 0.9)";
  modalHeader.style.borderTopLeftRadius = "8px";
  modalHeader.style.borderTopRightRadius = "8px";
  modalHeader.style.cursor = "move";
  const headerText = document.createElement("h2");
  headerText.innerText = neo.userData.name;
  headerText.style.margin = "0";
  headerText.style.fontSize = "18px";
  headerText.style.color = "#f5f5f5";
  modalHeader.appendChild(headerText);
  const closeButton = document.createElement("button");
  closeButton.innerText = "Close";
  closeButton.style.marginLeft = "auto";
  closeButton.style.padding = "8px 12px";
  closeButton.style.backgroundColor = "rgba(60, 60, 60, 0.8)";
  closeButton.style.color = "#fff";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "3px";
  closeButton.style.cursor = "pointer";
  closeButton.onclick = () => {
    document.body.removeChild(modal);
    activeModal = null;
  };
  modalHeader.appendChild(closeButton);
  modal.appendChild(modalHeader);
  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");
  modalContent.style.padding = "15px";
  modalContent.style.maxHeight = "300px";
  modalContent.style.overflowY = "auto";
  let content = `
  <img src="${neo.userData.textureUrl}" alt="${neo.userData.name}" style="max-width: 100%; margin-bottom: 10px;">
  <p><strong>Close Approach Date:</strong> ${neo.userData.closeApproachDate}</p>
  <p><strong>Relative Velocity (km/s):</strong> ${neo.userData.relativeVelocity}</p>
  <p><strong>Miss Distance (km):</strong> ${neo.userData.missDistance}</p>
  <p><strong>Potentially Hazardous:</strong> ${neo.userData.isPotentiallyHazardousAsteroid}</p>
  <a href="${neo.userData.nasaJplUrl}" target="_blank" rel="noopener noreferrer">View on NASA JPL Website</a>
  <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(neo.userData.name)}" target="_blank" rel="noopener noreferrer">Find videos about ${neo.userData.name} on YouTube</a>

  `;
  modalContent.innerHTML = content;
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  activeModal = modal;
  dragElement(modal);
}
function fetchPlanetInfo(planet) {
  const apiUrl = `${apiBaseUrl}?origin=*&action=query&prop=pageimages|extracts&exintro&explaintext&pilicense=any&pithumbsize=100&redirects=1&format=json&titles=${planet.userData.wikiPage}`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      const page = pages[pageId];
      const imageUrl = page.thumbnail
        ? page.thumbnail.source
        : planet.userData.textureUrl;
      const description = page.extract;
      const modal = document.createElement("div");
      modal.classList.add("modal");
      modal.style.position = "fixed";
      modal.style.top = "50%";
      modal.style.left = "50%";
      modal.style.transform = "translate(-50%, -50%)";
      modal.style.backgroundColor = "rgba(30, 30, 30, 0.95)";
      modal.style.borderRadius = "10px";
      modal.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
      modal.style.zIndex = "1000";
      modal.style.color = "#f5f5f5";
      modal.style.maxWidth = "500px";
      modal.style.fontFamily = "Arial, sans-serif";
      const modalHeader = document.createElement("div");
      modalHeader.classList.add("modal-header");
      modalHeader.id = "modalHeader";
      modalHeader.style.display = "flex";
      modalHeader.style.alignItems = "center";
      modalHeader.style.padding = "10px";
      modalHeader.style.backgroundColor = "rgba(40, 40, 40, 0.9)";
      modalHeader.style.borderTopLeftRadius = "8px";
      modalHeader.style.borderTopRightRadius = "8px";
      modalHeader.style.cursor = "move";
      const planetImage = document.createElement("img");
      planetImage.src = imageUrl;
      planetImage.alt = planet.userData.name;
      planetImage.style.maxWidth = "50px";
      planetImage.style.maxHeight = "50px";
      planetImage.style.marginRight = "10px";
      modalHeader.appendChild(planetImage);
      const headerText = document.createElement("h2");
      headerText.innerText = planet.userData.name;
      headerText.style.margin = "0";
      headerText.style.fontSize = "18px";
      headerText.style.color = "#f5f5f5";
      modalHeader.appendChild(headerText);
      const closeButton = document.createElement("button");
      closeButton.innerText = "Close";
      closeButton.style.marginLeft = "auto";
      closeButton.style.padding = "8px 12px";
      closeButton.style.backgroundColor = "rgba(60, 60, 60, 0.8)";
      closeButton.style.color = "#fff";
      closeButton.style.border = "none";
      closeButton.style.borderRadius = "3px";
      closeButton.style.cursor = "pointer";
      closeButton.onclick = () => {
        document.body.removeChild(modal);
        activeModal = null;
      };
      modalHeader.appendChild(closeButton);
      modal.appendChild(modalHeader);
      const modalContent = document.createElement("div");
      modalContent.classList.add("modal-content");
      modalContent.style.padding = "15px";
      modalContent.style.maxHeight = "300px";
      modalContent.style.overflowY = "auto";
      let keplerianElements = planet.userData.keplerianElements || {};
      let keplerianContent = "";
      for (const [key, value] of Object.entries(keplerianElements)) {
        keplerianContent += `<p><strong>${key}:</strong> ${value}</p>`;
      }
      let content = `
      <p><strong>Size:</strong> ${planet.userData.size}</p>
      <p><strong>Distance from Sun:</strong> ${planet.userData.distanceFromSun}</p>
      ${keplerianContent}
      <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(planet.userData.name)}" target="_blank" ">Find videos about ${planet.userData.name} on YouTube</a>
      <p>${description} </p>
      
      `;

      modalContent.innerHTML = content;
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
      activeModal = modal;
      dragElement(modal);
    })
    .catch((error) => {
      console.error("Error fetching data from Wikipedia:", error);
      alert("Error loading planet information.");
    });
}
function dragElement(elmnt) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    elmnt.onmousedown = dragMouseDown;
  }
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
function createCelestialBody(body) {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(body.textureUrl, (texture) => {
    const geometry = new THREE.SphereGeometry(body.radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.2,
    });
    const celestialBody = new THREE.Mesh(geometry, material);
    celestialBody.userData = {
      name: body.name,
      size: body.size,
      distanceFromSun: body.distanceFromSun,
      textureUrl: body.textureUrl,
      wikiPage: body.name,
      description: body.description,
      shortDescription: body.shortDescription,
      keplerianElements: body.keplerianElements || {},
    };
    if (body.name === "Sun") {
      scene.add(celestialBody);
    } else if (body.name === "Earth") {
      earthGroup.add(celestialBody);
      planets.push(celestialBody);
      celestialBody.orbitDistance = body.distance;
      celestialBody.orbitSpeed = body.orbitSpeed;
      celestialBody.initialAngle = body.initialAngle;
      celestialBody.rotation.y = Math.random() * Math.PI * 2;
      const angle =
        celestialBody.orbitSpeed * dayCounter + celestialBody.initialAngle;
      celestialBody.position.set(
        celestialBody.orbitDistance * Math.cos(angle),
        0,
        celestialBody.orbitDistance * Math.sin(angle)
      );
      createOrbitLine(body.distance);
      body.moons.forEach((moonData) => {
        createMoon(celestialBody, moonData);
      });
    } else {
      celestialBody.orbitDistance = body.distance;
      celestialBody.orbitSpeed = body.orbitSpeed;
      celestialBody.initialAngle = body.initialAngle;
      celestialBody.rotation.y = Math.random() * Math.PI * 2;
      scene.add(celestialBody);
      planets.push(celestialBody);
      const angle =
        celestialBody.orbitSpeed * dayCounter + celestialBody.initialAngle;
      celestialBody.position.set(
        celestialBody.orbitDistance * Math.cos(angle),
        0,
        celestialBody.orbitDistance * Math.sin(angle)
      );
      if (body.name === "Saturn") {
        addSaturnRings(celestialBody);
      }
      createOrbitLine(body.distance);
    }
  });
}
function createMoon(parentPlanet, moonData) {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(moonData.textureUrl, (texture) => {
    const moonGeometry = new THREE.SphereGeometry(moonData.radius, 32, 32);
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.2,
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.userData = {
      name: moonData.name,
      shortDescription: `${moonData.name} is a moon of ${parentPlanet.userData.name}.`,
    };
    moon.orbitDistance = moonData.distance;
    moon.orbitSpeed = moonData.orbitSpeed;
    moon.initialAngle = Math.random() * Math.PI * 2;
    moon.rotation.y = Math.random() * Math.PI * 2;
    parentPlanet.add(moon);
    planets.push(moon);
    const angle = moon.orbitSpeed * dayCounter + moon.initialAngle;
    moon.position.set(
      moon.orbitDistance * Math.cos(angle),
      0,
      moon.orbitDistance * Math.sin(angle)
    );
  });
}
function createOrbitLine(distance) {
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0x555555,
    opacity: controlParams.orbitVisibility,
    transparent: true,
  });
  const orbitPoints = generateOrbitPoints(distance, 128);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
  scene.add(orbitLine);
}
function addSaturnRings(saturn) {
  const ringGeometry = new THREE.RingGeometry(9, 15, 64);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xc0c0c0,
    side: THREE.DoubleSide,
    opacity: 0.7,
    transparent: true,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  saturn.add(ring);
}
function generateOrbitPoints(radius, segments) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);
    points.push(new THREE.Vector3(x, 0, z));
  }
  return points;
}
function createStarfield(numStars, radius) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  for (let i = 0; i < numStars; i++) {
    const phi = Math.acos(-1 + (2 * i) / numStars);
    const theta = Math.sqrt(numStars * Math.PI) * phi;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    positions.push(x, y, z);
    const color = new THREE.Color();
    const colorValue = Math.random() * 0.5 + 0.5;
    color.setHSL(0.65, 1, colorValue);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: false,
    opacity: 1,
  });
  const starField = new THREE.Points(geometry, material);
  scene.add(starField);
  return starField;
}
function createAsteroidBelt(density) {
  const asteroidGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const asteroidMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,
    roughness: 1,
    metalness: 0,
  });
  for (let i = 0; i < density; i++) {
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    const distance = 90 + Math.random() * 30;
    const angle = Math.random() * Math.PI * 2;
    const x = distance * Math.cos(angle);
    const z = distance * Math.sin(angle);
    asteroid.position.set(
      x + (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      z + (Math.random() - 0.5) * 2
    );
    asteroid.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );
    scene.add(asteroid);
  }
}
function initGUI() {
  gui = new dat.GUI();
  const visualFolder = gui.addFolder("Visual Controls");
  visualFolder
    .add(controlParams, "speed", 0.01, 1, 0.01)
    .name("Simulation Speed")
    .onChange((value) => {
      speedFactor = value;
    });
  visualFolder
    .add(controlParams, "orbitVisibility", 0, 1, 0.1)
    .name("Orbit Visibility")
    .onChange((value) => {
      scene.traverse((object) => {
        if (object.isLine) {
          object.material.opacity = value;
        }
      });
    });
  visualFolder
    .add(controlParams, "sunlightIntensity", 0, 5, 0.1)
    .name("Sunlight Intensity")
    .onChange((value) => {
      sunLight.intensity = value;
    });
  visualFolder
    .add(controlParams, "starlightIntensity", 0, 2, 0.1)
    .name("Starlight Intensity")
    .onChange((value) => {
      ambientLight.intensity = value;
    });
  visualFolder
    .add(controlParams, "cameraDistance", 50, 400, 10)
    .name("Camera Distance")
    .onChange((value) => {
      updateCameraDistance();
    });
  visualFolder
    .add(controlParams, "showNEOs")
    .name("Show NEOs")
    .onChange((value) => {
      if (value) {
        fetchNeoData();
      } else {
        clearNeoObjects();
      }
    });
  visualFolder.open();
}
function fetchNeoData() {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 7);
  const formattedToday = today.toISOString().slice(0, 10);
  const formattedEndDate = endDate.toISOString().slice(0, 10);
  const apiUrl = `${neoApiBaseUrl}feed?start_date=${formattedToday}&end_date=${formattedEndDate}&detailed=false&api_key=${apiKey}`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const neoData = data["near_earth_objects"];
      for (const date in neoData) {
        neoData[date].forEach((neo) => {
          createNeoObject(neo);
        });
      }
    })
    .catch((error) => console.error("Error fetching NEO data:", error));
}
function clearNeoObjects() {
  neoObjects.forEach((neo) => {
    scene.remove(neo);
  });
  neoObjects = [];
}
function createNeoObject(neo) {
  const textureIndex = Math.floor(Math.random() * neoTextures.length);
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(neoTextures[textureIndex], (texture) => {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const neoObject = new THREE.Mesh(geometry, material);
    const distance = 60 + Math.random() * 50;
    const angle = Math.random() * Math.PI * 2;
    neoObject.orbitDistance = distance;
    neoObject.orbitSpeed = 0.01;
    neoObject.initialAngle = angle;
    neoObject.userData = {
      name: neo.name,
      closeApproachDate: neo.close_approach_data[0].close_approach_date,
      relativeVelocity:
        neo.close_approach_data[0].relative_velocity.kilometers_per_second,
      missDistance: neo.close_approach_data[0].miss_distance.kilometers,
      isPotentiallyHazardousAsteroid: neo.is_potentially_hazardous_asteroid,
      isNEO: true,
      shortDescription: `${neo.name} is a near-Earth object.`,
      nasaJplUrl: neo.nasa_jpl_url,
      textureUrl: neoTextures[textureIndex],
    };
    neoObjects.push(neoObject);
    scene.add(neoObject);
  });
}
function initStats() {
  stats = new Stats();
  stats.domElement.style.position = "absolute";
  stats.domElement.style.top = "0px";
  document.body.appendChild(stats.domElement);
}
document.getElementById("resetView").addEventListener("click", () => {
  gsap.to(camera.position, {
    duration: cameraTransitionDuration,
    x: initialControlsSettings.position.x,
    y: initialControlsSettings.position.y,
    z: initialControlsSettings.position.z,
    ease: "power2.inOut",
  });
  gsap.to(camera.rotation, {
    duration: cameraTransitionDuration,
    x: initialControlsSettings.rotation.x,
    y: initialControlsSettings.rotation.y,
    z: initialControlsSettings.rotation.z,
    ease: "power2.inOut",
  });
  gsap.to(controls.target, {
    duration: cameraTransitionDuration,
    x: initialControlsSettings.target.x,
    y: initialControlsSettings.target.y,
    z: initialControlsSettings.target.z,
    ease: "power2.inOut",
  });
});
function updateCameraDistance() {
  camera.position.set(
    controlParams.cameraDistance,
    initialCameraPosition.y,
    controlParams.cameraDistance
  );
  controls.update();
}
function updateDateCounter(days) {
  const startDate = new Date();
  const futureDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  document.getElementById("dateCounter").innerText =
    futureDate.toLocaleDateString(undefined, dateOptions);
}
init();
