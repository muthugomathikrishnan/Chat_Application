import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Text } from 'troika-three-text'; // For 3D text rendering

const ChatGraph = ({ users = [], activeUserId }) => {
  const animationRef = useRef(); // Store the animation reference
  const isMouseOver = useRef(false); // Track if the mouse is over the canvas

  useEffect(() => {
    const width = 800;
    const height = 600;

    // Remove any existing canvases before creating a new one
    const existingCanvas = document.getElementById('three-canvas');
    if (existingCanvas) {
      existingCanvas.remove(); // Remove previous canvas if it exists
    }

    // Set up the scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.domElement.id = 'three-canvas'; // Assign an ID to the canvas
    document.getElementById('chat-graph').appendChild(renderer.domElement);

    // Create OrbitControls for user interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 2;

    // Ensure users is an array before mapping
    const nodes = Array.isArray(users)
      ? users.map(user => ({ id: user.id, name: user.name, friends: user.friends }))
      : [];
    const links = [];

    // Create links (edges between nodes)
    nodes.forEach(node => {
      node.friends.forEach(friendId => {
        links.push({ source: node.id, target: friendId });
      });
    });

    // Create spheres and text for each node
    const nodeSpheres = {};
    const firstNodeId = nodes[0]?.id; // Get the ID of the first node

    nodes.forEach((node) => {
      const geometry = new THREE.SphereGeometry(0.05, 32, 32);
      let color;

      // Set the color based on the node's position and if it's the active user
      if (node.id === activeUserId) {
        color = 0x00ff00; // Green for the active user
      } else if (node.id === firstNodeId) {
        color = 0x00ff00; // Green for the first node
      } else if (node.friends.includes(firstNodeId)) {
        color = 0xffa500; // Orange for adjacent nodes
      } else {
        color = 0xff0000; // Red for all other nodes
      }

      const material = new THREE.MeshBasicMaterial({ color });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
      scene.add(sphere);
      nodeSpheres[node.id] = sphere;

      // Create text for the user's name
      const textMesh = new Text();
      textMesh.text = node.name;
      textMesh.fontSize = 0.1; // Set a base font size
      textMesh.color = 0xffffff;
      textMesh.anchorX = 'center';
      textMesh.anchorY = 'bottom'; // Anchor at the bottom for proper alignment
      textMesh.position.set(0, 0.05, 0); // Position the text above the sphere

      scene.add(textMesh);
      nodeSpheres[node.id].add(textMesh); // Attach the text to the sphere
    });

    // Create links (edges between nodes) and make the edges connected to the first node green
    links.forEach(link => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(2 * 3); // Two vertices (x, y, z)
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Check if the link is connected to the first node
      const isLinkToFirstNode = link.source === firstNodeId || link.target === firstNodeId;

      // If the link is to the first node, set the color to green
      const lineMaterial = new THREE.LineBasicMaterial({ color: isLinkToFirstNode ? 0x00ff00 : 0x999999 });
      const line = new THREE.Line(geometry, lineMaterial);
      scene.add(line);

      // Link the positions to the spheres
      link.line = line;
      link.source = nodeSpheres[link.source];
      link.target = nodeSpheres[link.target];
    });

    // Function to update the rotation of the scene
    const animate = () => {
      // Rotate the scene when the mouse is not over the canvas
      if (!isMouseOver.current) {
        scene.rotation.y += 0.001; // Slow rotation on the Y-axis
      }

      // Rotate the spheres
      nodes.forEach(node => {
        const sphere = nodeSpheres[node.id];
        sphere.rotation.y += 0.01; // Rotate the sphere around the Y-axis
      });

      // Update line positions
      links.forEach(link => {
        const positions = link.line.geometry.attributes.position.array;
        positions[0] = link.source.position.x;
        positions[1] = link.source.position.y;
        positions[2] = link.source.position.z;
        positions[3] = link.target.position.x;
        positions[4] = link.target.position.y;
        positions[5] = link.target.position.z;
        link.line.geometry.attributes.position.needsUpdate = true;
      });

      // Render the scene
      controls.update();
      renderer.render(scene, camera);

      // Request the next animation frame
      animationRef.current = requestAnimationFrame(animate);
    };

    animate(); // Start the animation

    // Event listeners to detect mouse over and leave
    const handleMouseEnter = () => { isMouseOver.current = true; };
    const handleMouseLeave = () => { isMouseOver.current = false; };

    // Add event listeners for mouse enter and leave
    renderer.domElement.addEventListener('mouseenter', handleMouseEnter);
    renderer.domElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      // Clean up Three.js resources on unmount
      cancelAnimationFrame(animationRef.current); // Stop the animation loop
      renderer.dispose();
      scene.clear();
      renderer.domElement.removeEventListener('mouseenter', handleMouseEnter);
      renderer.domElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [users, activeUserId]);

  return <div id="chat-graph"></div>;
};

export default ChatGraph;
