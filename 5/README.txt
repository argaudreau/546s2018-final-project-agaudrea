Progress Report Week 5
Graphics 1 Spring 2018
Programmer: Adam Gaudreau
Due: 25 April 2018

==========
 Overview
==========
This is the progress report for week 5 of the final project.

=========
 Sources
=========
I am using the three.js third party library to render everything. I only used the documentation for reference, located here: https://threejs.org/docs/index.html#manual/introduction/Creating-a-scene.
This is the best option for this project for me because it handles the complicated math behind rendering the actual shapes, so I can focus on transforming, spawning, and manipulating shapes.

All of the files in js/third-party have not been written by me or manipulated in any way. I'll explain each of their uses below:
- dat.gui.min.js: This is for the menu on the top-right of the page. The source code can be found here (https://github.com/dataarts/dat.gui).
- OrbitControls.js: This is a part of the three.js library. It handles all of the mouse controls for moving the camera. Check it out here (https://threejs.org/docs/#examples/controls/OrbitControls).
- three.min.js: This is where most of the rendering magic happens. It handles the math behind the scenes, lighting, rendering, etc. It can be found here (https://threejs.org).
Everything else was written soley by me.