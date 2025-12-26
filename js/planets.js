/* ============================================
   Hrimkar Astro - 3D Planets (Navagraha)
   Three.js Implementation
   ============================================ */

// Planet Data
const planetsData = {
    sun: {
        name: 'The Sun',
        sanskrit: 'सूर्य (Surya)',
        symbol: '☉',
        color: 0xfdb813,
        emissive: 0xff6600,
        significance: 'The Sun is the king of all planets and represents the soul (Atma). It governs our core identity, self-expression, and vitality. A strong Sun brings leadership qualities, authority, and recognition in society.',
        effects: 'When well-placed: Confidence, success, government favors, good health. When afflicted: Ego issues, conflicts with authority, heart problems, vision issues, troubled relations with father.',
        remedies: [
            'Chant Surya Mantra: "Om Hraam Hreem Hraum Sah Suryaya Namah" 108 times daily',
            'Offer water to the rising Sun every morning',
            'Wear Ruby gemstone on Sunday during Shukla Paksha',
            'Donate wheat, jaggery, and copper on Sundays',
            'Fast on Sundays and take only one meal'
        ],
        gemstone: 'Ruby (Manik)',
        day: 'Sunday',
        direction: 'East',
        planetColor: 'Copper Red'
    },
    moon: {
        name: 'The Moon',
        sanskrit: 'चन्द्र (Chandra)',
        symbol: '☽',
        color: 0xc0c0c0,
        emissive: 0x888888,
        significance: 'The Moon governs our mind, emotions, and subconscious. It represents the mother, nurturing qualities, and our emotional responses. The Moon sign is crucial in Vedic astrology for understanding one\'s mental framework.',
        effects: 'When well-placed: Emotional stability, good memory, creative imagination, harmonious relationships. When afflicted: Depression, anxiety, mental instability, sleep disorders, troubled relationship with mother.',
        remedies: [
            'Chant Chandra Mantra: "Om Shram Shreem Shraum Sah Chandraya Namah" 108 times',
            'Wear Pearl on Monday during Shukla Paksha',
            'Offer milk to Shiva Lingam on Mondays',
            'Keep fast on Mondays (Somvar Vrat)',
            'Donate white items like rice, milk, silver on Mondays'
        ],
        gemstone: 'Pearl (Moti)',
        day: 'Monday',
        direction: 'Northwest',
        planetColor: 'White'
    },
    mars: {
        name: 'Mars',
        sanskrit: 'मंगल (Mangal)',
        symbol: '♂',
        color: 0xcf3721,
        emissive: 0x8b0000,
        significance: 'Mars is the planet of energy, courage, and action. It represents our physical strength, competitive spirit, and ability to fight for what we believe in. Mars governs brothers, property, and military/police professions.',
        effects: 'When well-placed: Courage, leadership, physical strength, success in competitions. When afflicted: Anger issues, accidents, conflicts, blood-related diseases, Manglik Dosha affecting marriage.',
        remedies: [
            'Chant Mangal Mantra: "Om Kraam Kreem Kraum Sah Bhaumaya Namah" 108 times',
            'Wear Red Coral on Tuesday during Shukla Paksha',
            'Hanuman Chalisa recitation on Tuesdays',
            'Donate red lentils, jaggery, and red cloth on Tuesdays',
            'Observe Mangal Dosha remedies for marriage prospects'
        ],
        gemstone: 'Red Coral (Moonga)',
        day: 'Tuesday',
        direction: 'South',
        planetColor: 'Red'
    },
    mercury: {
        name: 'Mercury',
        sanskrit: 'बुध (Budh)',
        symbol: '☿',
        color: 0x4caf50,
        emissive: 0x2e7d32,
        significance: 'Mercury governs intelligence, communication, and analytical abilities. It represents education, business acumen, and the ability to express oneself. Mercury is the prince among planets.',
        effects: 'When well-placed: Sharp intellect, excellent communication skills, business success, writing abilities. When afflicted: Speech problems, learning difficulties, nervous disorders, skin issues.',
        remedies: [
            'Chant Budh Mantra: "Om Braam Breem Braum Sah Budhaya Namah" 108 times',
            'Wear Emerald on Wednesday during Shukla Paksha',
            'Feed green vegetables to cows on Wednesdays',
            'Donate green items, moong dal on Wednesdays',
            'Worship Lord Vishnu on Wednesdays'
        ],
        gemstone: 'Emerald (Panna)',
        day: 'Wednesday',
        direction: 'North',
        planetColor: 'Green'
    },
    jupiter: {
        name: 'Jupiter',
        sanskrit: 'बृहस्पति (Guru)',
        symbol: '♃',
        color: 0xff9800,
        emissive: 0xe65100,
        significance: 'Jupiter is the most benefic planet, known as the great teacher. It represents wisdom, spirituality, fortune, and expansion. Jupiter governs children, higher education, and spiritual growth.',
        effects: 'When well-placed: Wisdom, wealth, good children, spiritual progress, fortune in life. When afflicted: Financial troubles, problems with children, liver issues, lack of guidance.',
        remedies: [
            'Chant Guru Mantra: "Om Graam Greem Graum Sah Gurave Namah" 108 times',
            'Wear Yellow Sapphire on Thursday during Shukla Paksha',
            'Donate turmeric, yellow cloth, gold on Thursdays',
            'Feed bananas to Brahmins on Thursdays',
            'Observe Thursday fasts for Jupiter\'s blessings'
        ],
        gemstone: 'Yellow Sapphire (Pukhraj)',
        day: 'Thursday',
        direction: 'Northeast',
        planetColor: 'Yellow'
    },
    venus: {
        name: 'Venus',
        sanskrit: 'शुक्र (Shukra)',
        symbol: '♀',
        color: 0xe91e63,
        emissive: 0xad1457,
        significance: 'Venus represents love, beauty, luxury, and artistic expression. It governs marriage, romance, creative arts, and material comforts. Venus is the teacher of demons and brings worldly pleasures.',
        effects: 'When well-placed: Attractive personality, artistic talents, luxurious life, happy marriage. When afflicted: Relationship problems, diabetes, reproductive issues, lack of luxury.',
        remedies: [
            'Chant Shukra Mantra: "Om Draam Dreem Draum Sah Shukraya Namah" 108 times',
            'Wear Diamond or White Sapphire on Friday',
            'Donate white items like rice, white clothes on Fridays',
            'Worship Goddess Lakshmi on Fridays',
            'Feed white sweets to young girls on Fridays'
        ],
        gemstone: 'Diamond (Heera)',
        day: 'Friday',
        direction: 'Southeast',
        planetColor: 'White/Pink'
    },
    saturn: {
        name: 'Saturn',
        sanskrit: 'शनि (Shani)',
        symbol: '♄',
        color: 0x3f51b5,
        emissive: 0x1a237e,
        significance: 'Saturn is the lord of karma and discipline. It represents hard work, longevity, and lessons through challenges. Saturn\'s influence teaches patience and rewards those who persevere.',
        effects: 'When well-placed: Success through hard work, longevity, spiritual growth. When afflicted: Delays, obstacles, chronic diseases, depression, Sade Sati effects, karmic challenges.',
        remedies: [
            'Chant Shani Mantra: "Om Praam Preem Praum Sah Shanaischaraya Namah" 108 times',
            'Wear Blue Sapphire only after proper consultation',
            'Feed crows and donate black sesame seeds on Saturdays',
            'Light mustard oil lamp under Peepal tree on Saturdays',
            'Hanuman worship is highly effective for Saturn appeasement'
        ],
        gemstone: 'Blue Sapphire (Neelam)',
        day: 'Saturday',
        direction: 'West',
        planetColor: 'Blue/Black'
    },
    rahu: {
        name: 'Rahu (North Node)',
        sanskrit: 'राहु',
        symbol: '☊',
        color: 0x607d8b,
        emissive: 0x37474f,
        significance: 'Rahu is a shadow planet representing worldly desires, obsession, and unconventional paths. It creates illusion but can also bring sudden rise in status and foreign connections.',
        effects: 'When well-placed: Sudden success, foreign travels, technological abilities. When afflicted: Confusion, addictions, fear, skin diseases, mental unrest, legal issues.',
        remedies: [
            'Chant Rahu Mantra: "Om Bhram Bhreem Bhraum Sah Rahave Namah" 108 times',
            'Wear Hessonite (Gomed) after proper consultation',
            'Donate blue/black clothes and mustard oil on Saturdays',
            'Feed birds and worship Goddess Durga',
            'Keep a piece of sandalwood in wallet'
        ],
        gemstone: 'Hessonite (Gomed)',
        day: 'Saturday',
        direction: 'Southwest',
        planetColor: 'Blue/Smoke'
    },
    ketu: {
        name: 'Ketu (South Node)',
        sanskrit: 'केतु',
        symbol: '☋',
        color: 0x795548,
        emissive: 0x4e342e,
        significance: 'Ketu is the shadow planet of spirituality and detachment. It represents liberation (moksha), psychic abilities, and past life karmas. Ketu gives intuitive and spiritual insights.',
        effects: 'When well-placed: Spiritual progress, intuition, liberation, hidden knowledge. When afflicted: Confusion, skin problems, accidents, viral infections, lack of direction.',
        remedies: [
            'Chant Ketu Mantra: "Om Sraam Sreem Sraum Sah Ketave Namah" 108 times',
            'Wear Cat\'s Eye (Lahsuniya) after consultation',
            'Donate blankets to the needy',
            'Worship Lord Ganesha for Ketu appeasement',
            'Keep a dog as pet or feed stray dogs'
        ],
        gemstone: 'Cat\'s Eye (Lahsuniya)',
        day: 'Tuesday',
        direction: 'Northwest',
        planetColor: 'Grey/Multi'
    }
};

// Three.js Scene Setup
let scene, camera, renderer, controls;
let planets = {};
let selectedPlanet = null;
let animationId;

function initPlanets3D() {
    const container = document.getElementById('planetsContainer');
    if (!container) {
        console.error('Planets container not found');
        return;
    }

    // Ensure container has dimensions - use getBoundingClientRect for accuracy
    const rect = container.getBoundingClientRect();
    const width = rect.width || container.offsetWidth || 800;
    const height = rect.height || container.offsetHeight || 500;
    
    console.log('Container dimensions:', width, 'x', height);
    console.log('THREE version:', THREE.REVISION);

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1628);

    // Camera
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 15;

    // Renderer - with fallback for WebGL issues
    try {
        renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
    } catch (e) {
        console.error('WebGL not supported:', e);
        showFallback(container);
        return;
    }
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a1628, 1);
    
    // Clear container and add canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    
    console.log('Renderer created, canvas added');

    // Create star field background
    createStarField();

    // Create planets
    createPlanets();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 100);
    pointLight.position.set(0, 0, 20);
    scene.add(pointLight);

    // Add glow effect
    const glowLight = new THREE.PointLight(0xd4af37, 0.5, 50);
    glowLight.position.set(0, 0, 10);
    scene.add(glowLight);

    // Mouse interaction
    addMouseInteraction(container);

    // Handle resize
    window.addEventListener('resize', () => onWindowResize(container));

    // Start animation
    animate();

    // Add instructions
    addInstructions(container);

    // Initialize planet selector buttons
    initPlanetSelector();
}

function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = (Math.random() - 0.5) * 100;
        positions[i + 2] = (Math.random() - 0.5) * 100 - 20;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.8
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

function createPlanets() {
    const planetKeys = Object.keys(planetsData);
    const radius = 6;

    planetKeys.forEach((key, index) => {
        const data = planetsData[key];
        const angle = (index / planetKeys.length) * Math.PI * 2;

        // Planet mesh
        const geometry = new THREE.SphereGeometry(0.6, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: data.color,
            emissive: data.emissive,
            emissiveIntensity: 0.3,
            shininess: 30
        });

        const planet = new THREE.Mesh(geometry, material);
        planet.position.x = Math.cos(angle) * radius;
        planet.position.y = Math.sin(angle) * radius;
        planet.position.z = 0;
        planet.userData = { key, ...data };

        // Glow effect
        const glowGeometry = new THREE.SphereGeometry(0.75, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        planet.add(glow);

        // Label
        const label = createPlanetLabel(data.name);
        label.position.y = 1;
        planet.add(label);

        planets[key] = planet;
        scene.add(planet);
    });
}

function createPlanetLabel(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 32;

    context.fillStyle = 'transparent';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'bold 20px Raleway, sans-serif';
    context.textAlign = 'center';
    context.fillStyle = '#d4af37';
    context.fillText(text, canvas.width / 2, 22);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2, 0.5, 1);

    return sprite;
}

function addMouseInteraction(container) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };

            // Rotate all planets around center
            Object.values(planets).forEach(planet => {
                planet.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaMove.x * 0.005);
                planet.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), deltaMove.y * 0.005);
            });

            previousMousePosition = { x: e.clientX, y: e.clientY };
        } else {
            // Hover effect
            const rect = container.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(Object.values(planets));

            Object.values(planets).forEach(planet => {
                planet.scale.set(1, 1, 1);
            });

            if (intersects.length > 0) {
                const hovered = intersects[0].object;
                hovered.scale.set(1.2, 1.2, 1.2);
                container.style.cursor = 'pointer';
            } else {
                container.style.cursor = 'grab';
            }
        }
    });

    container.addEventListener('mouseup', () => {
        isDragging = false;
    });

    container.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    container.addEventListener('click', (e) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(Object.values(planets));

        if (intersects.length > 0) {
            const clicked = intersects[0].object;
            selectPlanet(clicked.userData.key);
        }
    });

    // Touch support
    let touchStart = { x: 0, y: 0 };

    container.addEventListener('touchstart', (e) => {
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const deltaMove = {
            x: touch.clientX - touchStart.x,
            y: touch.clientY - touchStart.y
        };

        Object.values(planets).forEach(planet => {
            planet.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaMove.x * 0.005);
            planet.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), deltaMove.y * 0.005);
        });

        touchStart = { x: touch.clientX, y: touch.clientY };
    }, { passive: false });

    container.addEventListener('touchend', (e) => {
        // Check for tap (not drag)
        const touch = e.changedTouches[0];
        const rect = container.getBoundingClientRect();
        mouse.x = ((touch.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((touch.clientY - rect.top) / container.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(Object.values(planets));

        if (intersects.length > 0) {
            const clicked = intersects[0].object;
            selectPlanet(clicked.userData.key);
        }
    });
}

function selectPlanet(planetKey) {
    const data = planetsData[planetKey];
    if (!data) return;

    // Highlight planet in 3D
    Object.entries(planets).forEach(([key, planet]) => {
        if (key === planetKey) {
            planet.scale.set(1.5, 1.5, 1.5);
            selectedPlanet = planet;
        } else {
            planet.scale.set(1, 1, 1);
        }
    });

    // Open the modal with planet info
    openPlanetModal(planetKey);
}

function initPlanetSelector() {
    document.querySelectorAll('.planet-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectPlanet(btn.dataset.planet);
        });
    });
}

function addInstructions(container) {
    const instructions = document.createElement('div');
    instructions.className = 'planets-instructions';
    instructions.innerHTML = `
        <span><i class="fas fa-mouse"></i> Drag to rotate</span>
        <span><i class="fas fa-hand-pointer"></i> Click planet for details</span>
    `;
    container.appendChild(instructions);
}

function onWindowResize(container) {
    if (!camera || !renderer || !container) return;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function animate() {
    if (!renderer || !scene || !camera) return;
    
    animationId = requestAnimationFrame(animate);

    // Rotate planets slowly
    Object.values(planets).forEach(planet => {
        if (planet) planet.rotation.y += 0.005;
    });

    // Pulse selected planet
    if (selectedPlanet) {
        const scale = 1.5 + Math.sin(Date.now() * 0.003) * 0.1;
        selectedPlanet.scale.set(scale, scale, scale);
    }

    renderer.render(scene, camera);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add small delay to ensure CSS is applied
    setTimeout(initPlanetsScene, 100);
});

function initPlanetsScene() {
    const container = document.getElementById('planetsContainer');
    if (!container) {
        console.log('Planets container not found');
        return;
    }
    
    // Show loading state
    container.innerHTML = '<div class="planets-loading"><i class="fas fa-spinner fa-spin fa-3x"></i><p>Loading 3D visualization...</p></div>';

    // Check if Three.js is loaded
    if (typeof THREE !== 'undefined') {
        console.log('Three.js loaded, initializing 3D planets...');
        setTimeout(() => {
            try {
                initPlanets3D();
                console.log('3D planets initialized successfully');
            } catch (error) {
                console.error('Error initializing 3D planets:', error);
                showFallback(container);
            }
        }, 200);
    } else {
        console.warn('Three.js not loaded. Attempting to load...');
        // Try to load Three.js dynamically
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = function() {
            console.log('Three.js loaded dynamically');
            setTimeout(() => {
                try {
                    initPlanets3D();
                } catch (error) {
                    console.error('Error initializing 3D planets:', error);
                    showFallback(container);
                }
            }, 200);
        };
        script.onerror = function() {
            console.error('Failed to load Three.js');
            showFallback(container);
        };
        document.head.appendChild(script);
    }
}

function showFallback(container) {
    container.innerHTML = `
        <div class="planets-fallback">
            <i class="fas fa-globe fa-4x"></i>
            <h3>Interactive 3D View</h3>
            <p>3D visualization requires WebGL support. Please use a modern browser.</p>
            <p>Scroll down to explore the planets below.</p>
        </div>
    `;
}

// Modal Functions
function openPlanetModal(planetKey) {
    const modal = document.getElementById('planetModal');
    const data = planetsData[planetKey];
    
    if (!modal || !data) return;
    
    // Update modal content
    document.getElementById('modalPlanetName').textContent = data.name;
    document.getElementById('modalPlanetSanskrit').textContent = data.sanskrit;
    
    // Set planet visual background
    const visual = document.getElementById('modalPlanetVisual');
    if (visual) {
        visual.style.background = `radial-gradient(circle at 30% 30%, ${getColorHex(data.color)}, ${getColorHex(data.emissive)})`;
        visual.style.boxShadow = `0 0 40px ${getColorHex(data.color)}66`;
    }
    
    // Populate sections
    const significanceEl = document.getElementById('modalSignificance');
    const effectsEl = document.getElementById('modalEffects');
    const remediesList = document.getElementById('modalRemedies');
    
    if (significanceEl) significanceEl.textContent = data.significance;
    if (effectsEl) effectsEl.textContent = data.effects;
    if (remediesList) {
        remediesList.innerHTML = data.remedies.map(r => `<li>${r}</li>`).join('');
    }
    
    // Populate attributes
    const gemstoneEl = document.getElementById('modalGemstone');
    const dayEl = document.getElementById('modalDay');
    const directionEl = document.getElementById('modalDirection');
    const colorEl = document.getElementById('modalColor');
    
    if (gemstoneEl) gemstoneEl.textContent = data.gemstone || '-';
    if (dayEl) dayEl.textContent = data.day || '-';
    if (directionEl) directionEl.textContent = data.direction || '-';
    if (colorEl) colorEl.textContent = data.planetColor || '-';
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePlanetModal() {
    const modal = document.getElementById('planetModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function getColorHex(color) {
    return '#' + color.toString(16).padStart(6, '0');
}

// Control buttons
document.addEventListener('DOMContentLoaded', function() {
    const rotateToggle = document.getElementById('rotateToggle');
    const resetView = document.getElementById('resetView');
    let isAutoRotating = true;
    
    if (rotateToggle) {
        rotateToggle.addEventListener('click', () => {
            isAutoRotating = !isAutoRotating;
            rotateToggle.querySelector('span').textContent = isAutoRotating ? 'Auto Rotate' : 'Paused';
            rotateToggle.classList.toggle('active', !isAutoRotating);
        });
    }
    
    if (resetView) {
        resetView.addEventListener('click', () => {
            // Reset planet positions
            const planetKeys = Object.keys(planetsData);
            const radius = 6;
            
            planetKeys.forEach((key, index) => {
                const angle = (index / planetKeys.length) * Math.PI * 2;
                if (planets[key]) {
                    planets[key].position.x = Math.cos(angle) * radius;
                    planets[key].position.y = Math.sin(angle) * radius;
                    planets[key].position.z = 0;
                }
            });
        });
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    if (renderer) {
        renderer.dispose();
    }
});
