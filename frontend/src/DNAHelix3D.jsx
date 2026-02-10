import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function DNAHelix3D() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [isFormed, setIsFormed] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      45, 
      mountRef.current.clientWidth / mountRef.current.clientHeight, 
      0.1, 
      100
    );
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 6;
    controls.maxDistance = 20;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x00d9ff, 1.5);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7c3aed, 0.8);
    fillLight.position.set(-5, 2, 2);
    scene.add(fillLight);

    // DNA Helix Parameters
    const helixHeight = 8;
    const helixRadius = 1.2;
    const turns = 3;
    const basePairsPerTurn = 10;
    const totalBasePairs = turns * basePairsPerTurn;

    // Create DNA structure
    const dnaGroup = new THREE.Group();
    const particlesGroup = new THREE.Group();
    
    // Arrays to store positions
    const targetPositions = [];
    const particles = [];

    // Create DNA base pairs and backbones
    for (let i = 0; i < totalBasePairs; i++) {
      const t = i / totalBasePairs;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * helixHeight;

      // Strand 1 position
      const x1 = Math.cos(angle) * helixRadius;
      const z1 = Math.sin(angle) * helixRadius;
      
      // Strand 2 position (opposite side)
      const x2 = Math.cos(angle + Math.PI) * helixRadius;
      const z2 = Math.sin(angle + Math.PI) * helixRadius;

      // Backbone spheres (phosphate groups)
      const sphere1Geo = new THREE.SphereGeometry(0.12, 8, 8);
      const sphere1Mat = new THREE.MeshPhysicalMaterial({ 
        color: 0x00d9ff,
        metalness: 0.3,
        roughness: 0.4,
        emissive: 0x00d9ff,
        emissiveIntensity: 0.3
      });
      const sphere1 = new THREE.Mesh(sphere1Geo, sphere1Mat);
      sphere1.position.set(x1, y, z1);
      dnaGroup.add(sphere1);
      targetPositions.push({ x: x1, y: y, z: z1 });

      const sphere2Mat = new THREE.MeshPhysicalMaterial({ 
        color: 0x7c3aed,
        metalness: 0.3,
        roughness: 0.4,
        emissive: 0x7c3aed,
        emissiveIntensity: 0.3
      });
      const sphere2 = new THREE.Mesh(sphere1Geo, sphere2Mat);
      sphere2.position.set(x2, y, z2);
      dnaGroup.add(sphere2);
      targetPositions.push({ x: x2, y: y, z: z2 });

      // Base pair connecting line (hydrogen bonds)
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x1, y, z1),
        new THREE.Vector3(x2, y, z2)
      ]);
      const lineMat = new THREE.LineBasicMaterial({ 
        color: 0x10b981,
        transparent: true,
        opacity: 0.6
      });
      const line = new THREE.Line(lineGeo, lineMat);
      dnaGroup.add(line);

      // Backbone connections
      if (i > 0) {
        const prevT = (i - 1) / totalBasePairs;
        const prevAngle = prevT * Math.PI * 2 * turns;
        const prevY = (prevT - 0.5) * helixHeight;
        
        const prevX1 = Math.cos(prevAngle) * helixRadius;
        const prevZ1 = Math.sin(prevAngle) * helixRadius;
        const prevX2 = Math.cos(prevAngle + Math.PI) * helixRadius;
        const prevZ2 = Math.sin(prevAngle + Math.PI) * helixRadius;

        // Connect strand 1
        const backbone1Geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(prevX1, prevY, prevZ1),
          new THREE.Vector3(x1, y, z1)
        ]);
        const backbone1Mat = new THREE.LineBasicMaterial({ 
          color: 0x00d9ff,
          transparent: true,
          opacity: 0.8
        });
        const backbone1 = new THREE.Line(backbone1Geo, backbone1Mat);
        dnaGroup.add(backbone1);

        // Connect strand 2
        const backbone2Geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(prevX2, prevY, prevZ2),
          new THREE.Vector3(x2, y, z2)
        ]);
        const backbone2Mat = new THREE.LineBasicMaterial({ 
          color: 0x7c3aed,
          transparent: true,
          opacity: 0.8
        });
        const backbone2 = new THREE.Line(backbone2Geo, backbone2Mat);
        dnaGroup.add(backbone2);
      }
    }

    // Create particle system
    const particleCount = targetPositions.length;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const randomTargets = [];

    for (let i = 0; i < particleCount; i++) {
      // Start particles in random positions
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      randomTargets.push({
        x: positions[i * 3],
        y: positions[i * 3 + 1],
        z: positions[i * 3 + 2]
      });

      // Alternate colors
      const color = i % 2 === 0 ? new THREE.Color(0x00d9ff) : new THREE.Color(0x7c3aed);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      particles.push({
        current: { ...randomTargets[i] },
        target: targetPositions[i],
        random: randomTargets[i]
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particlesGroup.add(particleSystem);
    scene.add(particlesGroup);

    // Hide DNA structure initially
    dnaGroup.visible = false;
    scene.add(dnaGroup);

    // Animation state
    const state = {
      isForming: false,
      formTime: 0,
      gatherDuration: 3.0,
      transitionDuration: 1.0
    };

    // Auto-start formation after 1 second
    setTimeout(() => {
      state.isForming = true;
      state.formTime = performance.now() / 1000;
      setIsFormed(true);
    }, 1000);

    // Animation loop
    const clock = new THREE.Clock();
    
    function animate() {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const now = performance.now() / 1000;

      // Particle gathering animation
      if (state.isForming) {
        const timeSinceForm = now - state.formTime;
        const positions = particleGeometry.attributes.position.array;
        
        if (timeSinceForm < state.gatherDuration) {
          // Phase 1: Particles gather
          let progress = timeSinceForm / state.gatherDuration;
          progress = 1.0 - Math.pow(1.0 - progress, 3.0); // Ease out

          for (let i = 0; i < particleCount; i++) {
            const particle = particles[i];
            positions[i * 3] = THREE.MathUtils.lerp(particle.random.x, particle.target.x, progress);
            positions[i * 3 + 1] = THREE.MathUtils.lerp(particle.random.y, particle.target.y, progress);
            positions[i * 3 + 2] = THREE.MathUtils.lerp(particle.random.z, particle.target.z, progress);
          }
          
          particleMaterial.opacity = 1.0;
          dnaGroup.visible = false;

        } else if (timeSinceForm < state.gatherDuration + state.transitionDuration) {
          // Phase 2: Transition to solid DNA
          const transProgress = (timeSinceForm - state.gatherDuration) / state.transitionDuration;
          particleMaterial.opacity = 1.0 - transProgress;
          
          dnaGroup.visible = true;
          dnaGroup.traverse((child) => {
            if (child.material) {
              child.material.opacity = transProgress;
              child.material.transparent = true;
            }
          });

        } else {
          // Phase 3: Final state - show only solid DNA
          particleMaterial.opacity = 0;
          dnaGroup.visible = true;
          dnaGroup.traverse((child) => {
            if (child.material) {
              child.material.opacity = 1;
            }
          });
        }

        particleGeometry.attributes.position.needsUpdate = true;
      }

      // Gentle rotation
      if (dnaGroup.visible) {
        dnaGroup.rotation.y = elapsedTime * 0.3;
      }
      if (particleMaterial.opacity > 0) {
        particlesGroup.rotation.y = elapsedTime * 0.2;
      }

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full"
      style={{ cursor: 'grab' }}
    />
  );
}
