/**
 * Hrimkar Astro - Realistic 3D Solar System
 * NASA-Inspired Astronomical Visualization
 * Using Three.js with PBR Materials
 */

class SolarSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Solar system container not found');
            return;
        }

        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Solar system objects
        this.sun = null;
        this.planets = {};
        this.orbits = {};
        this.moon = null;

        // Animation state
        this.clock = new THREE.Clock();
        this.animationId = null;
        this.isPaused = false;
        this.timeScale = 1;

        // Interaction state
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredPlanet = null;
        this.selectedPlanet = null;

        // Tooltip element
        this.tooltip = null;

        // Planet data with realistic properties
        this.planetData = {
            mercury: {
                name: 'Mercury',
                radius: 0.38,
                distance: 5.8,
                orbitalPeriod: 88,
                rotationPeriod: 58.6,
                axialTilt: 0.034,
                color: 0x8c8c8c,
                description: 'The smallest planet, closest to the Sun',
                facts: {
                    diameter: '4,879 km',
                    dayLength: '58.6 Earth days',
                    yearLength: '88 Earth days',
                    moons: '0'
                }
            },
            venus: {
                name: 'Venus',
                radius: 0.95,
                distance: 10.8,
                orbitalPeriod: 225,
                rotationPeriod: -243, // Retrograde rotation
                axialTilt: 177.4,
                color: 0xe6c87a,
                atmosphere: true,
                atmosphereColor: 0xffe4b5,
                description: 'Earth\'s "sister planet" with thick toxic atmosphere',
                facts: {
                    diameter: '12,104 km',
                    dayLength: '243 Earth days',
                    yearLength: '225 Earth days',
                    moons: '0'
                }
            },
            earth: {
                name: 'Earth',
                radius: 1,
                distance: 15,
                orbitalPeriod: 365,
                rotationPeriod: 1,
                axialTilt: 23.4,
                color: 0x6b93d6,
                atmosphere: true,
                atmosphereColor: 0x87ceeb,
                hasMoon: true,
                description: 'Our home planet, the only known world with life',
                facts: {
                    diameter: '12,742 km',
                    dayLength: '24 hours',
                    yearLength: '365.25 days',
                    moons: '1'
                }
            },
            mars: {
                name: 'Mars',
                radius: 0.53,
                distance: 22.8,
                orbitalPeriod: 687,
                rotationPeriod: 1.03,
                axialTilt: 25.2,
                color: 0xc1440e,
                description: 'The Red Planet, target of human exploration',
                facts: {
                    diameter: '6,779 km',
                    dayLength: '24.6 hours',
                    yearLength: '687 Earth days',
                    moons: '2'
                }
            },
            jupiter: {
                name: 'Jupiter',
                radius: 3.5, // Scaled down for visibility
                distance: 35,
                orbitalPeriod: 4333,
                rotationPeriod: 0.41,
                axialTilt: 3.1,
                color: 0xd8ca9d,
                description: 'The largest planet with the Great Red Spot',
                facts: {
                    diameter: '139,820 km',
                    dayLength: '9.9 hours',
                    yearLength: '11.9 Earth years',
                    moons: '95'
                }
            },
            saturn: {
                name: 'Saturn',
                radius: 2.9, // Scaled down
                distance: 50,
                orbitalPeriod: 10759,
                rotationPeriod: 0.45,
                axialTilt: 26.7,
                color: 0xead6b8,
                hasRings: true,
                description: 'Famous for its spectacular ring system',
                facts: {
                    diameter: '116,460 km',
                    dayLength: '10.7 hours',
                    yearLength: '29.4 Earth years',
                    moons: '146'
                }
            },
            uranus: {
                name: 'Uranus',
                radius: 1.6,
                distance: 65,
                orbitalPeriod: 30687,
                rotationPeriod: -0.72, // Retrograde
                axialTilt: 97.8, // Extreme tilt
                color: 0xd1e7e7,
                description: 'The "ice giant" tilted on its side',
                facts: {
                    diameter: '50,724 km',
                    dayLength: '17.2 hours',
                    yearLength: '84 Earth years',
                    moons: '28'
                }
            },
            neptune: {
                name: 'Neptune',
                radius: 1.5,
                distance: 80,
                orbitalPeriod: 60190,
                rotationPeriod: 0.67,
                axialTilt: 28.3,
                color: 0x5b5ddf,
                description: 'The windiest planet in our solar system',
                facts: {
                    diameter: '49,244 km',
                    dayLength: '16.1 hours',
                    yearLength: '164.8 Earth years',
                    moons: '16'
                }
            }
        };

        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createControls();
        this.createLighting();
        this.createStarfield();
        this.createNebula();
        this.createSun();
        this.createPlanets();
        this.createTooltip();
        this.setupEventListeners();
        this.animate();

        console.log('Solar System initialized successfully');
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000008);
    }

    createCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 2000);
        this.camera.position.set(0, 40, 80);
        this.camera.lookAt(0, 0, 0);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
    }

    createControls() {
        // Simple orbit controls implementation
        this.controls = {
            isDragging: false,
            previousMousePosition: { x: 0, y: 0 },
            spherical: new THREE.Spherical(100, Math.PI / 3, 0),
            target: new THREE.Vector3(0, 0, 0),
            minDistance: 20,
            maxDistance: 200,
            rotateSpeed: 0.005,
            zoomSpeed: 0.1
        };

        this.updateCameraFromSpherical();
    }

    updateCameraFromSpherical() {
        const { spherical, target } = this.controls;
        this.camera.position.setFromSpherical(spherical);
        this.camera.position.add(target);
        this.camera.lookAt(target);
    }

    createLighting() {
        // Ambient light for minimal visibility in shadows
        const ambientLight = new THREE.AmbientLight(0x111122, 0.1);
        this.scene.add(ambientLight);

        // Sun point light - main light source
        this.sunLight = new THREE.PointLight(0xffffff, 2, 300, 1);
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 200;
        this.scene.add(this.sunLight);

        // Secondary fill light
        const fillLight = new THREE.PointLight(0xfff5e6, 0.3, 500);
        fillLight.position.set(0, 0, 0);
        this.scene.add(fillLight);
    }

    createStarfield() {
        // Create multiple layers of stars for depth
        const starLayers = [
            { count: 3000, size: 0.5, distance: 500 },
            { count: 2000, size: 0.8, distance: 700 },
            { count: 1000, size: 1.2, distance: 900 }
        ];

        starLayers.forEach(layer => {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(layer.count * 3);
            const colors = new Float32Array(layer.count * 3);

            for (let i = 0; i < layer.count; i++) {
                // Distribute stars on a sphere
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = layer.distance + (Math.random() - 0.5) * 100;

                positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = r * Math.cos(phi);

                // Vary star colors slightly (white to blue-white to yellow-white)
                const colorVariation = Math.random();
                if (colorVariation < 0.7) {
                    // White stars
                    colors[i * 3] = 1;
                    colors[i * 3 + 1] = 1;
                    colors[i * 3 + 2] = 1;
                } else if (colorVariation < 0.85) {
                    // Blue-white stars
                    colors[i * 3] = 0.8;
                    colors[i * 3 + 1] = 0.9;
                    colors[i * 3 + 2] = 1;
                } else {
                    // Yellow-white stars
                    colors[i * 3] = 1;
                    colors[i * 3 + 1] = 0.95;
                    colors[i * 3 + 2] = 0.8;
                }
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: layer.size,
                vertexColors: true,
                transparent: true,
                opacity: 0.9,
                sizeAttenuation: true
            });

            const stars = new THREE.Points(geometry, material);
            this.scene.add(stars);
        });
    }

    createNebula() {
        // Subtle nebula clouds using particle system
        const nebulaGeometry = new THREE.BufferGeometry();
        const nebulaCount = 500;
        const positions = new Float32Array(nebulaCount * 3);
        const colors = new Float32Array(nebulaCount * 3);

        // Nebula colors - subtle blues and purples
        const nebulaColors = [
            { r: 0.1, g: 0.05, b: 0.2 },  // Deep purple
            { r: 0.05, g: 0.1, b: 0.2 },  // Deep blue
            { r: 0.15, g: 0.05, b: 0.15 } // Dark magenta
        ];

        for (let i = 0; i < nebulaCount; i++) {
            // Cluster nebula particles in certain regions
            const cluster = Math.floor(Math.random() * 3);
            const baseX = (cluster - 1) * 300;
            const baseY = (Math.random() - 0.5) * 200;
            const baseZ = -400 - Math.random() * 200;

            positions[i * 3] = baseX + (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = baseY + (Math.random() - 0.5) * 150;
            positions[i * 3 + 2] = baseZ;

            const color = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        nebulaGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const nebulaMaterial = new THREE.PointsMaterial({
            size: 15,
            vertexColors: true,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const nebula = new THREE.Points(nebulaGeometry, nebulaMaterial);
        this.scene.add(nebula);
    }

    createSun() {
        const sunGroup = new THREE.Group();

        // Sun core with procedural texture
        const sunGeometry = new THREE.SphereGeometry(4, 64, 64);
        
        // Create procedural sun texture
        const sunCanvas = document.createElement('canvas');
        sunCanvas.width = 1024;
        sunCanvas.height = 512;
        const ctx = sunCanvas.getContext('2d');

        // Base gradient
        const gradient = ctx.createRadialGradient(512, 256, 0, 512, 256, 512);
        gradient.addColorStop(0, '#fff5e6');
        gradient.addColorStop(0.3, '#ffcc66');
        gradient.addColorStop(0.6, '#ff9933');
        gradient.addColorStop(1, '#ff6600');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 512);

        // Add granulation texture
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const size = Math.random() * 8 + 2;
            const brightness = Math.random() * 40 - 20;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${255 + brightness}, ${200 + brightness}, ${100 + brightness}, 0.3)`;
            ctx.fill();
        }

        // Add solar flares/prominences suggestion
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 30 + 10, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 150, 50, 0.2)';
            ctx.fill();
        }

        const sunTexture = new THREE.CanvasTexture(sunCanvas);

        const sunMaterial = new THREE.MeshBasicMaterial({
            map: sunTexture,
            emissive: 0xffaa33,
            emissiveIntensity: 0.5
        });

        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sunGroup.add(this.sun);

        // Corona effect - multiple layers
        const coronaLayers = [
            { scale: 1.05, opacity: 0.15, color: 0xffdd88 },
            { scale: 1.1, opacity: 0.1, color: 0xffcc66 },
            { scale: 1.2, opacity: 0.05, color: 0xffaa44 }
        ];

        coronaLayers.forEach(layer => {
            const coronaGeometry = new THREE.SphereGeometry(4 * layer.scale, 32, 32);
            const coronaMaterial = new THREE.MeshBasicMaterial({
                color: layer.color,
                transparent: true,
                opacity: layer.opacity,
                side: THREE.BackSide
            });
            const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
            sunGroup.add(corona);
        });

        // Subtle glow sprite
        const glowCanvas = document.createElement('canvas');
        glowCanvas.width = 256;
        glowCanvas.height = 256;
        const glowCtx = glowCanvas.getContext('2d');
        
        const glowGradient = glowCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
        glowGradient.addColorStop(0, 'rgba(255, 200, 100, 0.4)');
        glowGradient.addColorStop(0.4, 'rgba(255, 150, 50, 0.2)');
        glowGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        glowCtx.fillStyle = glowGradient;
        glowCtx.fillRect(0, 0, 256, 256);

        const glowTexture = new THREE.CanvasTexture(glowCanvas);
        const glowMaterial = new THREE.SpriteMaterial({
            map: glowTexture,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        const glowSprite = new THREE.Sprite(glowMaterial);
        glowSprite.scale.set(20, 20, 1);
        sunGroup.add(glowSprite);

        this.scene.add(sunGroup);
        this.sunGroup = sunGroup;
    }

    createPlanets() {
        Object.entries(this.planetData).forEach(([key, data]) => {
            const planetGroup = new THREE.Group();

            // Create planet mesh with realistic material
            const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
            const material = this.createPlanetMaterial(key, data);
            const planet = new THREE.Mesh(geometry, material);
            
            planet.castShadow = true;
            planet.receiveShadow = true;
            planet.userData = { key, ...data };

            // Apply axial tilt
            planet.rotation.z = THREE.MathUtils.degToRad(data.axialTilt);

            planetGroup.add(planet);

            // Add atmosphere if applicable
            if (data.atmosphere) {
                const atmosphere = this.createAtmosphere(data);
                planetGroup.add(atmosphere);
            }

            // Add rings for Saturn
            if (data.hasRings) {
                const rings = this.createSaturnRings(data);
                planetGroup.add(rings);
            }

            // Add moon for Earth
            if (data.hasMoon) {
                const moonGroup = this.createMoon();
                planetGroup.add(moonGroup);
                this.moon = moonGroup;
            }

            // Create orbital path
            const orbit = this.createOrbit(data.distance);
            this.scene.add(orbit);
            this.orbits[key] = orbit;

            // Position planet on orbit
            const angle = Math.random() * Math.PI * 2;
            planetGroup.position.x = Math.cos(angle) * data.distance;
            planetGroup.position.z = Math.sin(angle) * data.distance;
            planetGroup.userData.orbitAngle = angle;

            this.planets[key] = planetGroup;
            this.scene.add(planetGroup);
        });
    }

    createPlanetMaterial(key, data) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        switch (key) {
            case 'mercury':
                this.drawMercuryTexture(ctx, canvas);
                break;
            case 'venus':
                this.drawVenusTexture(ctx, canvas);
                break;
            case 'earth':
                this.drawEarthTexture(ctx, canvas);
                break;
            case 'mars':
                this.drawMarsTexture(ctx, canvas);
                break;
            case 'jupiter':
                this.drawJupiterTexture(ctx, canvas);
                break;
            case 'saturn':
                this.drawSaturnTexture(ctx, canvas);
                break;
            case 'uranus':
                this.drawUranusTexture(ctx, canvas);
                break;
            case 'neptune':
                this.drawNeptuneTexture(ctx, canvas);
                break;
            default:
                ctx.fillStyle = `#${data.color.toString(16).padStart(6, '0')}`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        return new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.8,
            metalness: 0.1
        });
    }

    drawMercuryTexture(ctx, canvas) {
        // Gray rocky surface with craters
        const baseColor = '#8c8c8c';
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add surface variation
        for (let i = 0; i < 3000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const brightness = Math.random() * 60 - 30;
            const size = Math.random() * 3 + 1;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgb(${140 + brightness}, ${140 + brightness}, ${140 + brightness})`;
            ctx.fill();
        }

        // Add craters
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 30 + 5;
            
            // Crater rim (lighter)
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(180, 180, 180, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Crater floor (darker)
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(60, 60, 60, 0.3)';
            ctx.fill();
        }
    }

    drawVenusTexture(ctx, canvas) {
        // Thick cloudy atmosphere - yellowish white
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#f5e6c8');
        gradient.addColorStop(0.5, '#e6d4a8');
        gradient.addColorStop(1, '#d9c896');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cloud bands
        for (let i = 0; i < 20; i++) {
            const y = (i / 20) * canvas.height;
            const opacity = 0.1 + Math.random() * 0.2;
            
            ctx.beginPath();
            ctx.moveTo(0, y);
            
            for (let x = 0; x < canvas.width; x += 20) {
                const wave = Math.sin(x * 0.01 + i) * 10;
                ctx.lineTo(x, y + wave);
            }
            
            ctx.strokeStyle = `rgba(200, 180, 150, ${opacity})`;
            ctx.lineWidth = 8 + Math.random() * 12;
            ctx.stroke();
        }

        // Swirling cloud patterns
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 80 + 20;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(230, 220, 200, ${Math.random() * 0.2})`;
            ctx.fill();
        }
    }

    drawEarthTexture(ctx, canvas) {
        // Ocean base
        ctx.fillStyle = '#1a4a7a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Continents (simplified shapes)
        ctx.fillStyle = '#3d6b3d';
        
        // North America
        this.drawContinent(ctx, 150, 100, 200, 150);
        
        // South America
        this.drawContinent(ctx, 250, 280, 100, 180);
        
        // Europe/Africa
        this.drawContinent(ctx, 480, 80, 80, 120);
        this.drawContinent(ctx, 500, 200, 120, 200);
        
        // Asia
        this.drawContinent(ctx, 600, 80, 300, 200);
        
        // Australia
        this.drawContinent(ctx, 800, 320, 100, 80);

        // Add terrain variation
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const isLand = ctx.getImageData(x, y, 1, 1).data[1] > 100;
            
            if (isLand) {
                const shade = Math.random() * 40 - 20;
                ctx.beginPath();
                ctx.arc(x, y, Math.random() * 5 + 1, 0, Math.PI * 2);
                ctx.fillStyle = `rgb(${61 + shade}, ${107 + shade}, ${61 + shade})`;
                ctx.fill();
            }
        }

        // Cloud overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const width = Math.random() * 150 + 50;
            const height = Math.random() * 30 + 10;
            
            ctx.beginPath();
            ctx.ellipse(x, y, width, height, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        // Polar ice caps
        ctx.fillStyle = 'rgba(240, 248, 255, 0.8)';
        ctx.fillRect(0, 0, canvas.width, 30);
        ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    }

    drawContinent(ctx, x, y, width, height) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        const points = 12;
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const rx = width / 2 + (Math.random() - 0.5) * width * 0.3;
            const ry = height / 2 + (Math.random() - 0.5) * height * 0.3;
            const px = x + Math.cos(angle) * rx;
            const py = y + Math.sin(angle) * ry;
            
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        
        ctx.closePath();
        ctx.fill();
    }

    drawMarsTexture(ctx, canvas) {
        // Rust red base
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#c1440e');
        gradient.addColorStop(0.5, '#a03a0c');
        gradient.addColorStop(1, '#8b3208');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Surface features
        for (let i = 0; i < 3000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const brightness = Math.random() * 50 - 25;
            
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 4 + 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgb(${193 + brightness}, ${68 + brightness * 0.3}, ${14 + brightness * 0.1})`;
            ctx.fill();
        }

        // Dark regions (maria)
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * canvas.width;
            const y = 100 + Math.random() * (canvas.height - 200);
            const radius = Math.random() * 100 + 30;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(80, 30, 10, 0.3)';
            ctx.fill();
        }

        // Polar ice caps
        ctx.fillStyle = 'rgba(255, 250, 245, 0.7)';
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, 15, 150, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height - 15, 120, 20, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawJupiterTexture(ctx, canvas) {
        // Base tan/cream color
        ctx.fillStyle = '#d8ca9d';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cloud bands
        const bands = [
            { y: 0.1, color: '#c4a882', width: 0.08 },
            { y: 0.2, color: '#e8dcc0', width: 0.06 },
            { y: 0.3, color: '#b89d78', width: 0.1 },
            { y: 0.42, color: '#d4c4a0', width: 0.06 },
            { y: 0.5, color: '#a08868', width: 0.08 },
            { y: 0.6, color: '#e0d4b8', width: 0.07 },
            { y: 0.7, color: '#c8b898', width: 0.09 },
            { y: 0.82, color: '#d8c8a8', width: 0.06 },
            { y: 0.92, color: '#b8a078', width: 0.08 }
        ];

        bands.forEach(band => {
            const y = band.y * canvas.height;
            const height = band.width * canvas.height;
            
            // Main band
            ctx.fillStyle = band.color;
            ctx.fillRect(0, y, canvas.width, height);
            
            // Turbulence
            for (let x = 0; x < canvas.width; x += 5) {
                const wave = Math.sin(x * 0.02) * 5 + Math.sin(x * 0.05) * 3;
                ctx.beginPath();
                ctx.arc(x, y + height / 2 + wave, 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 200 : 160}, ${Math.random() > 0.5 ? 180 : 140}, ${Math.random() > 0.5 ? 140 : 100}, 0.3)`;
                ctx.fill();
            }
        });

        // Great Red Spot
        const spotX = canvas.width * 0.7;
        const spotY = canvas.height * 0.55;
        
        ctx.beginPath();
        ctx.ellipse(spotX, spotY, 60, 35, 0, 0, Math.PI * 2);
        const spotGradient = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, 60);
        spotGradient.addColorStop(0, '#d87050');
        spotGradient.addColorStop(0.5, '#c86040');
        spotGradient.addColorStop(1, '#b85030');
        ctx.fillStyle = spotGradient;
        ctx.fill();

        // Spot swirl
        ctx.strokeStyle = 'rgba(180, 70, 40, 0.5)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(spotX, spotY, 40 - i * 10, 25 - i * 6, i * 0.3, 0, Math.PI * 1.5);
            ctx.stroke();
        }
    }

    drawSaturnTexture(ctx, canvas) {
        // Pale yellow/tan base
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#ead6b8');
        gradient.addColorStop(0.3, '#e0c8a0');
        gradient.addColorStop(0.5, '#d8c098');
        gradient.addColorStop(0.7, '#e8d4b0');
        gradient.addColorStop(1, '#f0e0c0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Subtle bands
        for (let i = 0; i < 15; i++) {
            const y = (i / 15) * canvas.height;
            const opacity = 0.05 + Math.random() * 0.1;
            
            ctx.fillStyle = `rgba(180, 160, 130, ${opacity})`;
            ctx.fillRect(0, y, canvas.width, canvas.height / 20);
        }

        // Surface texture
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 180, 150, ${Math.random() * 0.2})`;
            ctx.fill();
        }
    }

    drawUranusTexture(ctx, canvas) {
        // Pale cyan/blue-green
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#d1e7e7');
        gradient.addColorStop(0.3, '#b8d8d8');
        gradient.addColorStop(0.5, '#a8d0d0');
        gradient.addColorStop(0.7, '#b8d8d8');
        gradient.addColorStop(1, '#c8e0e0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Very subtle banding
        for (let i = 0; i < 8; i++) {
            const y = (i / 8) * canvas.height;
            ctx.fillStyle = `rgba(150, 200, 200, ${Math.random() * 0.1})`;
            ctx.fillRect(0, y, canvas.width, canvas.height / 10);
        }

        // Smooth icy texture
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 5 + 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220, 240, 240, ${Math.random() * 0.15})`;
            ctx.fill();
        }
    }

    drawNeptuneTexture(ctx, canvas) {
        // Deep blue base
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#4169e1');
        gradient.addColorStop(0.3, '#3a5cd0');
        gradient.addColorStop(0.5, '#3050c0');
        gradient.addColorStop(0.7, '#3a5cd0');
        gradient.addColorStop(1, '#4878e8');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cloud bands
        for (let i = 0; i < 10; i++) {
            const y = (i / 10) * canvas.height;
            
            ctx.beginPath();
            for (let x = 0; x < canvas.width; x += 10) {
                const wave = Math.sin(x * 0.015 + i * 2) * 8;
                if (x === 0) ctx.moveTo(x, y + wave);
                else ctx.lineTo(x, y + wave);
            }
            ctx.strokeStyle = `rgba(100, 140, 220, ${0.2 + Math.random() * 0.2})`;
            ctx.lineWidth = 5 + Math.random() * 10;
            ctx.stroke();
        }

        // Storm features (like Great Dark Spot)
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.3, canvas.height * 0.4, 40, 25, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(30, 50, 120, 0.4)';
        ctx.fill();

        // White cloud features
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            
            ctx.beginPath();
            ctx.ellipse(x, y, 30 + Math.random() * 20, 8 + Math.random() * 8, Math.random(), 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(200, 220, 255, 0.2)';
            ctx.fill();
        }
    }

    createAtmosphere(data) {
        const atmosphereGeometry = new THREE.SphereGeometry(data.radius * 1.02, 32, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: data.atmosphereColor,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        return new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    }

    createSaturnRings(data) {
        const ringsGroup = new THREE.Group();
        
        // Create ring texture
        const ringCanvas = document.createElement('canvas');
        ringCanvas.width = 1024;
        ringCanvas.height = 64;
        const ctx = ringCanvas.getContext('2d');

        // Ring bands with gaps
        const ringBands = [
            { start: 0, end: 0.1, opacity: 0 }, // Gap
            { start: 0.1, end: 0.25, opacity: 0.6, color: '#c8b898' }, // D Ring
            { start: 0.25, end: 0.28, opacity: 0.1 }, // Gap
            { start: 0.28, end: 0.45, opacity: 0.8, color: '#d8c8a8' }, // C Ring
            { start: 0.45, end: 0.48, opacity: 0.2 }, // Gap
            { start: 0.48, end: 0.7, opacity: 0.9, color: '#e8d8b8' }, // B Ring
            { start: 0.7, end: 0.75, opacity: 0.05 }, // Cassini Division
            { start: 0.75, end: 0.95, opacity: 0.7, color: '#d0c0a0' }, // A Ring
            { start: 0.95, end: 1, opacity: 0 } // Gap
        ];

        ringBands.forEach(band => {
            const startX = band.start * ringCanvas.width;
            const width = (band.end - band.start) * ringCanvas.width;
            
            if (band.color) {
                ctx.fillStyle = band.color;
                ctx.globalAlpha = band.opacity;
                ctx.fillRect(startX, 0, width, ringCanvas.height);
                
                // Add texture
                for (let i = 0; i < width * 2; i++) {
                    const x = startX + Math.random() * width;
                    const y = Math.random() * ringCanvas.height;
                    ctx.beginPath();
                    ctx.arc(x, y, 1, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
                    ctx.fill();
                }
            }
        });

        const ringTexture = new THREE.CanvasTexture(ringCanvas);

        // Inner ring
        const innerRing = new THREE.RingGeometry(data.radius * 1.3, data.radius * 2.3, 128);
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: ringTexture,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(innerRing, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ringsGroup.add(ring);

        return ringsGroup;
    }

    createMoon() {
        const moonGroup = new THREE.Group();

        // Moon mesh
        const moonGeometry = new THREE.SphereGeometry(0.27, 32, 32);
        
        // Create lunar texture
        const moonCanvas = document.createElement('canvas');
        moonCanvas.width = 512;
        moonCanvas.height = 256;
        const ctx = moonCanvas.getContext('2d');

        // Gray base
        ctx.fillStyle = '#a0a0a0';
        ctx.fillRect(0, 0, moonCanvas.width, moonCanvas.height);

        // Surface variation
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * moonCanvas.width;
            const y = Math.random() * moonCanvas.height;
            const brightness = Math.random() * 60 - 30;
            
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgb(${160 + brightness}, ${160 + brightness}, ${160 + brightness})`;
            ctx.fill();
        }

        // Craters
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * moonCanvas.width;
            const y = Math.random() * moonCanvas.height;
            const radius = Math.random() * 20 + 3;
            
            // Crater shadow
            ctx.beginPath();
            ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(80, 80, 80, 0.4)';
            ctx.fill();
            
            // Crater rim
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(180, 180, 180, 0.6)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Crater floor
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
            ctx.fill();
        }

        // Maria (dark patches)
        const maria = [
            { x: 150, y: 100, rx: 80, ry: 60 },
            { x: 350, y: 130, rx: 100, ry: 70 },
            { x: 250, y: 180, rx: 60, ry: 40 }
        ];

        maria.forEach(m => {
            ctx.beginPath();
            ctx.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(80, 80, 90, 0.3)';
            ctx.fill();
        });

        const moonTexture = new THREE.CanvasTexture(moonCanvas);
        const moonMaterial = new THREE.MeshStandardMaterial({
            map: moonTexture,
            roughness: 0.9,
            metalness: 0.0
        });

        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.castShadow = true;
        moon.receiveShadow = true;
        moon.userData = {
            key: 'moon',
            name: 'The Moon',
            description: 'Earth\'s only natural satellite'
        };
        
        moonGroup.add(moon);
        moonGroup.position.x = 2.5;
        moonGroup.userData.orbitAngle = 0;
        moonGroup.userData.orbitRadius = 2.5;

        return moonGroup;
    }

    createOrbit(distance) {
        const curve = new THREE.EllipseCurve(
            0, 0,
            distance, distance * 0.98, // Slight ellipse
            0, 2 * Math.PI,
            false,
            0
        );

        const points = curve.getPoints(128);
        const geometry = new THREE.BufferGeometry().setFromPoints(
            points.map(p => new THREE.Vector3(p.x, 0, p.y))
        );

        const material = new THREE.LineBasicMaterial({
            color: 0x334455,
            transparent: true,
            opacity: 0.3
        });

        return new THREE.Line(geometry, material);
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'planet-tooltip';
        this.tooltip.style.cssText = `
            position: absolute;
            padding: 8px 16px;
            background: rgba(10, 15, 30, 0.9);
            border: 1px solid rgba(100, 150, 200, 0.3);
            border-radius: 4px;
            color: #fff;
            font-family: 'Raleway', sans-serif;
            font-size: 14px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
            z-index: 1000;
            backdrop-filter: blur(5px);
        `;
        this.container.appendChild(this.tooltip);
    }

    setupEventListeners() {
        const canvas = this.renderer.domElement;

        // Mouse controls
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', () => this.onMouseUp());
        canvas.addEventListener('mouseleave', () => this.onMouseUp());
        canvas.addEventListener('wheel', (e) => this.onWheel(e));
        canvas.addEventListener('click', (e) => this.onClick(e));

        // Touch controls
        canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        canvas.addEventListener('touchend', () => this.onTouchEnd());

        // Window resize
        window.addEventListener('resize', () => this.onResize());
    }

    onMouseDown(e) {
        this.controls.isDragging = true;
        this.controls.previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    onMouseMove(e) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        if (this.controls.isDragging) {
            const deltaX = e.clientX - this.controls.previousMousePosition.x;
            const deltaY = e.clientY - this.controls.previousMousePosition.y;

            this.controls.spherical.theta -= deltaX * this.controls.rotateSpeed;
            this.controls.spherical.phi = Math.max(
                0.1,
                Math.min(Math.PI - 0.1, this.controls.spherical.phi + deltaY * this.controls.rotateSpeed)
            );

            this.updateCameraFromSpherical();
            this.controls.previousMousePosition = { x: e.clientX, y: e.clientY };
        } else {
            this.checkHover(e);
        }
    }

    onMouseUp() {
        this.controls.isDragging = false;
    }

    onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 1.1 : 0.9;
        this.controls.spherical.radius = Math.max(
            this.controls.minDistance,
            Math.min(this.controls.maxDistance, this.controls.spherical.radius * delta)
        );
        this.updateCameraFromSpherical();
    }

    onTouchStart(e) {
        if (e.touches.length === 1) {
            this.controls.isDragging = true;
            this.controls.previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    }

    onTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1 && this.controls.isDragging) {
            const deltaX = e.touches[0].clientX - this.controls.previousMousePosition.x;
            const deltaY = e.touches[0].clientY - this.controls.previousMousePosition.y;

            this.controls.spherical.theta -= deltaX * this.controls.rotateSpeed;
            this.controls.spherical.phi = Math.max(
                0.1,
                Math.min(Math.PI - 0.1, this.controls.spherical.phi + deltaY * this.controls.rotateSpeed)
            );

            this.updateCameraFromSpherical();
            this.controls.previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        } else if (e.touches.length === 2) {
            // Pinch zoom
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            
            if (this.lastPinchDist) {
                const delta = this.lastPinchDist > dist ? 1.05 : 0.95;
                this.controls.spherical.radius = Math.max(
                    this.controls.minDistance,
                    Math.min(this.controls.maxDistance, this.controls.spherical.radius * delta)
                );
                this.updateCameraFromSpherical();
            }
            this.lastPinchDist = dist;
        }
    }

    onTouchEnd() {
        this.controls.isDragging = false;
        this.lastPinchDist = null;
    }

    onClick(e) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const planetMeshes = Object.values(this.planets).map(g => g.children[0]);
        const intersects = this.raycaster.intersectObjects(planetMeshes);

        if (intersects.length > 0) {
            const clicked = intersects[0].object;
            if (clicked.userData && clicked.userData.key) {
                this.selectPlanet(clicked.userData.key);
            }
        }
    }

    checkHover(e) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const planetMeshes = Object.values(this.planets).map(g => g.children[0]);
        const intersects = this.raycaster.intersectObjects(planetMeshes);

        if (intersects.length > 0) {
            const hovered = intersects[0].object;
            if (hovered.userData && hovered.userData.name) {
                this.showTooltip(hovered.userData.name, e.clientX, e.clientY);
                this.renderer.domElement.style.cursor = 'pointer';
            }
        } else {
            this.hideTooltip();
            this.renderer.domElement.style.cursor = 'grab';
        }
    }

    showTooltip(text, x, y) {
        const rect = this.container.getBoundingClientRect();
        this.tooltip.textContent = text;
        this.tooltip.style.left = (x - rect.left + 15) + 'px';
        this.tooltip.style.top = (y - rect.top - 10) + 'px';
        this.tooltip.style.opacity = '1';
    }

    hideTooltip() {
        this.tooltip.style.opacity = '0';
    }

    selectPlanet(planetKey) {
        this.selectedPlanet = planetKey;
        const data = this.planetData[planetKey];
        
        // Dispatch custom event for external handling
        const event = new CustomEvent('planetSelected', {
            detail: { key: planetKey, data }
        });
        this.container.dispatchEvent(event);

        // Optionally focus camera on planet
        // this.focusOnPlanet(planetKey);
    }

    focusOnPlanet(planetKey) {
        const planet = this.planets[planetKey];
        if (!planet) return;

        const targetPosition = planet.position.clone();
        this.controls.target.copy(targetPosition);
        this.controls.spherical.radius = 20;
        this.updateCameraFromSpherical();
    }

    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        if (this.isPaused) return;

        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        // Rotate Sun
        if (this.sun) {
            this.sun.rotation.y += 0.001;
        }

        // Animate planets
        Object.entries(this.planets).forEach(([key, planetGroup]) => {
            const data = this.planetData[key];
            const planet = planetGroup.children[0];

            // Orbital motion (slower - multiplied by 0.1 for gentler movement)
            const orbitalSpeed = (2 * Math.PI) / (data.orbitalPeriod * 0.1) * this.timeScale;
            planetGroup.userData.orbitAngle += orbitalSpeed * delta;

            const angle = planetGroup.userData.orbitAngle;
            const distance = data.distance;
            
            // Elliptical orbit
            planetGroup.position.x = Math.cos(angle) * distance;
            planetGroup.position.z = Math.sin(angle) * distance * 0.98;

            // Axial rotation (slower - multiplied by 50 instead of 10)
            const rotationSpeed = (2 * Math.PI) / (Math.abs(data.rotationPeriod) * 50);
            planet.rotation.y += rotationSpeed * delta * Math.sign(data.rotationPeriod);
        });

        // Animate Moon around Earth
        if (this.moon && this.planets.earth) {
            this.moon.userData.orbitAngle += 0.005 * delta * this.timeScale;
            const moonAngle = this.moon.userData.orbitAngle;
            const moonRadius = this.moon.userData.orbitRadius;
            
            this.moon.position.x = Math.cos(moonAngle) * moonRadius;
            this.moon.position.z = Math.sin(moonAngle) * moonRadius;
        }

        this.renderer.render(this.scene, this.camera);
    }

    setTimeScale(scale) {
        this.timeScale = scale;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }

    resetView() {
        this.controls.spherical.set(100, Math.PI / 3, 0);
        this.controls.target.set(0, 0, 0);
        this.updateCameraFromSpherical();
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Dispose geometries and materials
        this.scene.traverse(object => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });

        this.renderer.dispose();
    }
}

// Export for use
window.SolarSystem = SolarSystem;
