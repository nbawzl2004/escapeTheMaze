This repo is for CS174 TermProject  team 27

#Team Members

Zhengliang Wu

Beiqi Guan

#Control

keyEvents:
b: debug mode
r: reset
t: topView

move
w  : forward,
s   : back,
a   : left,
d   : right,

rotate direction
up : up,
down : down,
left : left,
right : right




#How do we draw everything?

	- Everything in this project is object oriented. We have three basic objects: cube, sphere and plane.
	- Every object has one init function: we duplciate these objects in render functions. Cubes are drawn in a for loop with positions passed in.

#Collision Detection
	- Sphere collides with the wall
	- Detection of collision with a cube is more complicated than expected,

#Maze
	- Maze is originally a 2D array
	- we interpret the maze using one function. get the position of every cube, and thus pass it to the draw function of cube

#Texture
	- we have texture on cubes and a big cube that contains the world.

#Ball Movement
	-ball has velocity
	-ball can scroll
	-ball gets friction from the floor

#Lighting
	-Most lighting techniques are done in shader
	-we limit the distance of light, and also set up the coefficient that dimishes light's intensity
	-light tracks the ball by applying ball's modelMatrix


