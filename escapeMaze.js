var canvas;
var gl;
var program;
var vPosition;
var vNormal;
var vTexCoord;
var isDebugMode = false;
var isTopMode = false;
var image;
var image_world;

//cube Position should be a vec4 and relative to the center
var cubePosition = [];

//maze is a 2d array
var maze = [
                    ['#','#','#','#','#','#','#','#','#','#'],
                    ['#',' ',' ',' ',' ',' ',' ','#',' ','#'],
                    ['#',' ','#',' ','#','#',' ','#',' ','#'],
                    ['#',' ','#',' ','#','#',' ','#',' ','#'],
                    ['#','#','#',' ','#','#',' ',' ',' ','#'],
                    ['#','#','#',' ','#','#','#','#',' ','#'],
                    ['#',' ',' ',' ','#',' ','#','#',' ','#'],
                    ['#',' ','#','#','#',' ','#','#',' ','#'],
                    ['#',' ',' ',' ',' ',' ','#','#',' ',' '],
                    ['#','#','#','#','#','#','#','#','#','#']
                    ];
//maze translation function
var translateMaze = function (maze) {
    //translate a 10*10 maze

    for (var i = 0; i < 10; i++)
        for (var j = 0; j < 10; j++)
        {
            if (maze[i][j] == '#')
            {
                //cubePosition.push([i-4.5, 0, j-4.5 ]);
                cubePosition.push(vec4(i, 0, j,1));

            }
        }
}

// CubeObject
var myCube = {
    ambient : vec4(0.0, 0.5, 0.5, 1.0),
    diffuse : vec4(1.0, 1.0, 1.0, 1.0),
    specular : vec4(1.0, 1.0, 1.0, 1.0),
    shininess : 30.0,
    isPhong : false,
    center : 1,
    side : 1,
    vertices :
    [
    vec4( -0.5, -0.5,  0.5, 1.0 ), //left bot front 0
    vec4( -0.5,  0.5,  0.5, 1.0 ), //left top front 1
    vec4( 0.5,  0.5,  0.5, 1.0 ), //right top front 2
    vec4( 0.5, -0.5,  0.5, 1.0 ), //right bot front 3
    vec4( -0.5, -0.5, -0.5, 1.0 ), //left bot back 4
    vec4( -0.5,  0.5, -0.5, 1.0 ), //left top back 5
    vec4( 0.5,  0.5, -0.5, 1.0 ), //right top back 6
    vec4( 0.5, -0.5, -0.5, 1.0 ) //right bot back 7
    ],
    vertexNum: 36,
    texCoord: [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ],
    pointsArray : [],
    normalsArray : [],
    texCoordsArray: [],
    ambientProduct : vec4(),
    diffuseProduct : vec4(),
    specularProduct : vec4(),
    modelMatrix : mat4(),
    modelViewMatrix : mat4(),
    tempModelMatrix: mat4()

}

//functions
myCube.init = function() {
                //call helper function to generate cube
                drawCube();

                //define vTexCoord
                vTexCoord = gl.getAttribLocation( program, "vTexCoord" );

                //create buffers for cube
                myCube.vBuffer = gl.createBuffer();
                myCube.nBuffer = gl.createBuffer();

                //texture buffer
                myCube.tBuffer = gl.createBuffer();


                //-----------------------------------------push cube vertices in buffer--------------------------------------

                gl.bindBuffer(gl.ARRAY_BUFFER,myCube.vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER,flatten(myCube.pointsArray),gl.STATIC_DRAW);

                //link and enable position attribute

                gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
                gl.enableVertexAttribArray( vPosition );
                //unlink buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,null);

                ////-----------------------------------------push normal vector in buffer--------------------------------------
                gl.bindBuffer(gl.ARRAY_BUFFER,myCube.nBuffer);
                gl.bufferData(gl.ARRAY_BUFFER,flatten(myCube.normalsArray),gl.STATIC_DRAW);

                //link and enable normal attribute

                gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
                gl.enableVertexAttribArray( vNormal);
                //unlink buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,null);

                ////-----------------------------------------push texture Coords in buffer--------------------------------------
                gl.bindBuffer( gl.ARRAY_BUFFER, myCube.tBuffer );
                gl.bufferData( gl.ARRAY_BUFFER, flatten(myCube.texCoordsArray), gl.STATIC_DRAW );


                gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
                gl.enableVertexAttribArray( vTexCoord);
                //unlink buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,null);



                myCube.ambientProduct = mult(myCube.ambient, light.ambient);
                myCube.diffuseProduct = mult(myCube.diffuse, light.diffuse);
                myCube.specularProduct = mult(myCube.specular, light.specular);

                //setup texture
                image = document.getElementById("texImage");
                image_world = document.getElementById("texImage2");

                myCube.texture = gl.createTexture();
                gl.bindTexture( gl.TEXTURE_2D, myCube.texture );
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
                gl.RGB, gl.UNSIGNED_BYTE, image );
                gl.generateMipmap( gl.TEXTURE_2D );
                gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                                  gl.LINEAR_MIPMAP_LINEAR );
                gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); //Prevents s-coordinate wrapping (repeating).
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); //Prevents t-coordinate wrapping (repeating).

                myCube.texture_world = gl.createTexture();
                gl.bindTexture( gl.TEXTURE_2D, myCube.texture_world );
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
                gl.RGB, gl.UNSIGNED_BYTE, image_world );
                gl.generateMipmap( gl.TEXTURE_2D );
                gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                                  gl.LINEAR_MIPMAP_LINEAR );
                gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); //Prevents s-coordinate wrapping (repeating).
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); //Prevents t-coordinate wrapping (repeating).

        };

myCube.draw = function(position) {

                //make sure vTexCoord is enabled
                gl.enableVertexAttribArray( vTexCoord);

                gl.bindTexture( gl.TEXTURE_2D, myCube.texture );

                // bind cube's buffer
                gl.bindBuffer( gl.ARRAY_BUFFER, myCube.vBuffer );
                gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
                gl.bindBuffer( gl.ARRAY_BUFFER, myCube.nBuffer );
                gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );

                //texture buffer
                gl.bindBuffer( gl.ARRAY_BUFFER, myCube.tBuffer);
                gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );


                 //transfer values
                gl.uniform4fv( loc.ambientProductLoc,flatten(myCube.ambientProduct) );
                gl.uniform4fv( loc.diffuseProductLoc,flatten(myCube.diffuseProduct) );
                gl.uniform4fv( loc.specularProductLoc,flatten(myCube.specularProduct) );
                gl.uniform4fv( loc.lightPositionLoc, flatten(light.position) );
                gl.uniform1f( loc.shininessLoc, myCube.shininess );
                gl.uniform1i( loc.isPhongLoc, myCube.isPhong );


                //transfer texture value
                gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);


                //intergrate modelview matrix
                //calculate cube's modelMatrix based on position

                myCube.tempModelMatrix = mult(translate(position[0], position[1], position[2]), myCube.modelMatrix);
                myCube.modelViewMatrix = mult(camera.viewMatrix, myCube.tempModelMatrix);
                myCube.normalMatrix =  transpose(invert4(myCube.modelViewMatrix));
                light.modelViewMatrix = mult(camera.viewMatrix, light.modelMatrix);

                // transfer data
                //cube
                gl.uniformMatrix4fv(loc.modelViewMatrixLoc, false, flatten(myCube.modelViewMatrix) );
                gl.uniformMatrix4fv(loc.normalMatrixLoc, false, flatten(myCube.normalMatrix) );
                gl.uniformMatrix4fv(loc.modelMatrixLoc, false, flatten(myCube.tempModelMatrix));
                gl.uniform4fv(loc.spherePositionLoc, flatten(mySphere.position));

                //light
                //gl.uniformMatrix4fv(loc.sphereModelMatrixLoc,false,flatten(mySphere.modelMatrix));
                gl.uniformMatrix4fv(loc.lightModelViewMatrixLoc, false, flatten(mySphere.modelViewMatrix));
                gl.uniform4fv(loc.lightPositionLoc, flatten(light.position));

                //projection matrix
                gl.uniformMatrix4fv(loc.projectionMatrixLoc, false, flatten(camera.projectionMatrix) );

                //draw cube
                gl.drawArrays( gl.TRIANGLES, 0, myCube.pointsArray.length );

            };

myCube.drawBig = function() {

                var position = vec4(0,0,0,1);

                //make sure vTexCoord is enabled
                gl.enableVertexAttribArray( vTexCoord);

                gl.bindTexture( gl.TEXTURE_2D, myCube.texture_world );


                // bind cube's buffer
                gl.bindBuffer( gl.ARRAY_BUFFER, myCube.vBuffer );
                gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
                gl.bindBuffer( gl.ARRAY_BUFFER, myCube.nBuffer );
                gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );

                //texture buffer
                gl.bindBuffer( gl.ARRAY_BUFFER, myCube.tBuffer);
                gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );


                 //transfer values
                gl.uniform4fv( loc.ambientProductLoc,flatten(myCube.ambientProduct) );
                gl.uniform4fv( loc.diffuseProductLoc,flatten(myCube.diffuseProduct) );
                gl.uniform4fv( loc.specularProductLoc,flatten(myCube.specularProduct) );
                gl.uniform4fv( loc.lightPositionLoc, flatten(light.position) );
                gl.uniform1f( loc.shininessLoc, myCube.shininess );
                gl.uniform1i( loc.isPhongLoc, myCube.isPhong );


                //transfer texture value
                gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);


                //intergrate modelview matrix
                //calculate cube's modelMatrix based on position

                myCube.tempModelMatrix = mult(translate(position[0], position[1], position[2]), myCube.modelMatrix);
                myCube.tempModelMatrix = mult(scale(100, 100, 100), myCube.tempModelMatrix);
                myCube.modelViewMatrix = mult(camera.viewMatrix, myCube.tempModelMatrix);
                myCube.normalMatrix =  transpose(invert4(myCube.modelViewMatrix));
                light.modelViewMatrix = mult(camera.viewMatrix, light.modelMatrix);

                // transfer data
                //cube
                gl.uniformMatrix4fv(loc.modelViewMatrixLoc, false, flatten(myCube.modelViewMatrix) );
                gl.uniformMatrix4fv(loc.normalMatrixLoc, false, flatten(myCube.normalMatrix) );
                gl.uniformMatrix4fv(loc.modelMatrixLoc, false, flatten(myCube.tempModelMatrix));
                gl.uniform4fv(loc.spherePositionLoc, flatten(mySphere.position));

                //light
                //gl.uniformMatrix4fv(loc.sphereModelMatrixLoc,false,flatten(mySphere.modelMatrix));
                gl.uniformMatrix4fv(loc.lightModelViewMatrixLoc, false, flatten(mySphere.modelViewMatrix));
                gl.uniform4fv(loc.lightPositionLoc, flatten(light.position));

                //projection matrix
                gl.uniformMatrix4fv(loc.projectionMatrixLoc, false, flatten(camera.projectionMatrix) );

                //draw cube
                gl.drawArrays( gl.TRIANGLES, 0, myCube.pointsArray.length );

};

// Sphere Object

var mySphere = {
    ambient : vec4(0.8, 0.1, 0.1, 1.0),
    diffuse : vec4(1.0, 1.0, 1.0, 1.0),
    specular : vec4(1.0, 1.0, 1.0, 1.0),
    shininess : 30.0,
    position : vec4(0,-0.45,-3,1),
    vertexNum : 0,
    shadingStyle : 3,  //0:no shading, 1:flat,  2:Gouraud, 3:Phong
    isPhong : true,
    pointsArray : [],
    normalsArray : [],
    ambientProduct : vec4(),
    diffuseProduct : vec4(),
    specularProduct : vec4(),
    modelMatrix : mat4(),
    modelViewMatrix : mat4(),
    rollMatrix : mat4(),

    complexity : 5,
    radius : 0.05,
    velocity : vec4(0,0,0,0),
    fractionConstant : 1/3000,
    topSpeed : 1/30


    /* object and functions
    vBuffer
    nBuffer
    init
    draw
    */

};


//functions
mySphere.init = function() {
            //call helper function to generate sphere
            generateSpheres();

            //create buffers for sphere
            mySphere.vBuffer = gl.createBuffer();
            mySphere.nBuffer = gl.createBuffer();

            //-----------------------------------------push sphere vertices in buffer--------------------------------------

                gl.bindBuffer(gl.ARRAY_BUFFER,mySphere.vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER,flatten(mySphere.pointsArray),gl.STATIC_DRAW);

                //link and enable position attribute

                gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
                gl.enableVertexAttribArray( vPosition );
                //unlink buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,null);

                ////-----------------------------------------push normal vector in buffer--------------------------------------
                gl.bindBuffer(gl.ARRAY_BUFFER,mySphere.nBuffer);
                gl.bufferData(gl.ARRAY_BUFFER,flatten(mySphere.normalsArray),gl.STATIC_DRAW);

                //link and enable normal attribute

                gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
                gl.enableVertexAttribArray( vNormal);
                //unlink buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,null);

                mySphere.modelMatrix = mult(scale(mySphere.radius,mySphere.radius,mySphere.radius),mat4());

                mySphere.modelMatrix = mult(translate(2.7,-0.45,1.0), mySphere.modelMatrix);
                mySphere.position = vec4(2.7,-0.45,1.0);

                camera.position = add(mySphere.position, vec4(camera.distanceToSphere,0,0,0));
                camera.eye = v4ToV3(camera.position);
                camera.at = v4ToV3(mySphere.position);
                camera.up = vec3(0,1,0);
                camera.gameTopViewMatrix = lookAt([4,20,4],[4,0,4],[0,0,1]);



        }

mySphere.draw = function() {

                //make sure vTexCoord is turned off
                gl.disableVertexAttribArray( vTexCoord);

                // bind ball's buffer
                gl.bindBuffer( gl.ARRAY_BUFFER, mySphere.vBuffer );
                gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
                gl.bindBuffer( gl.ARRAY_BUFFER, mySphere.nBuffer );
                gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );

                //move The ball
                mySphere.move();

                 //transfer values
                gl.uniform4fv( loc.ambientProductLoc,flatten(mySphere.ambientProduct) );
                gl.uniform4fv( loc.diffuseProductLoc,flatten(mySphere.diffuseProduct) );
                gl.uniform4fv( loc.specularProductLoc,flatten(mySphere.specularProduct) );
                gl.uniform4fv( loc.lightPositionLoc, flatten(light.position) );
                gl.uniform1f( loc.shininessLoc, mySphere.shininess );
                gl.uniform1i( loc.isPhongLoc, mySphere.isPhong );


                //intergrate modelview matrix
                mySphere.modelViewMatrix = mult(mySphere.modelMatrix, mySphere.rollMatrix);
                mySphere.modelViewMatrix = mult(camera.viewMatrix, mySphere.modelViewMatrix);
                mySphere.normalMatrix =  transpose(invert4(mySphere.modelViewMatrix));
                light.modelViewMatrix = mult(camera.viewMatrix, light.modelMatrix);

                // transfer data
                //sphere
                gl.uniformMatrix4fv(loc.modelViewMatrixLoc, false, flatten(mySphere.modelViewMatrix) );
                gl.uniformMatrix4fv(loc.normalMatrixLoc, false, flatten(mySphere.normalMatrix) );
                gl.uniformMatrix4fv(loc.modelMatrixLoc, false, flatten(mySphere.modelMatrix));
                gl.uniform4fv(loc.spherePositionLoc, flatten(mySphere.position));

                //light
                gl.uniformMatrix4fv(loc.lightModelViewMatrixLoc, false, flatten(mySphere.modelViewMatrix));
                gl.uniform4fv(loc.lightPositionLoc, flatten(light.position));

                //projection matrix
                gl.uniformMatrix4fv(loc.projectionMatrixLoc, false, flatten(camera.projectionMatrix) );

                var tempAmbientProduct = mySphere.ambientProduct.slice();

                //draw sphere
                    for(var j=0; j < mySphere.vertexNum; j+=3){
                    //for(var j=0; j < 3; j+=3){
                        //change color of vertices
                        tempAmbientProduct[0] -= 1/mySphere.vertexNum;
                        gl.uniform4fv( loc.ambientProductLoc,flatten(tempAmbientProduct) );
                        //
                        gl.drawArrays(gl.TRIANGLES, j, 3);
                }
            }

mySphere.move = function(){

    mySphere.collisionDetection();

    mySphere.roll();
    mySphere.position = add(mySphere.position,mySphere.velocity);

    var vx = mySphere.velocity[0], vy = mySphere.velocity[1], vz = mySphere.velocity[2];
    mySphere.modelMatrix = mult(translate(vx,vy,vz), mySphere.modelMatrix);

    camera.position = add(camera.position, mySphere.velocity);
    camera.eye = v4ToV3(camera.position);
    camera.at = v4ToV3(mySphere.position);
    camera.gameSphereViewMatrix = lookAt(camera.eye,camera.at,camera.up);

    //apply fraction
    var speed = length(mySphere.velocity);
    if(speed < mySphere.fractionConstant)
        mySphere.velocity = vec4(0,0,0,0);
    else{
        var oppositeVec = negate(mySphere.velocity);
        oppositeVec = normalize(oppositeVec);
        oppositeVec = vscale(mySphere.fractionConstant, oppositeVec);
        mySphere.velocity = add(mySphere.velocity, oppositeVec);
    }

    if(isDebugMode)
        camera.viewMatrix = camera.debugViewMatrix;
    else if(isTopMode)
        camera.viewMatrix = camera.gameTopViewMatrix;
    else{
        var adjustedSphereViewMatrix = mult(translate(0,-0.1,0),camera.gameSphereViewMatrix);
        camera.viewMatrix = adjustedSphereViewMatrix;
    }
}

mySphere.collisionDetection = function(){
    // test1 : Whether cube and ball close enough
    var cubeHalfDiagonal = (myCube.side / 2) * Math.sqrt(2);
    var a = cubeHalfDiagonal, b = mySphere.radius;
    var alfa = b/Math.sqrt(2);
    var c = Math.sqrt(a*a + alfa*alfa) + alfa; // c is LargestDistanceToCollde
    //test
    c = a + b + mySphere.radius;
    //
    var halfSide = myCube.side / 2;
    var isCollided = false;


    var sphereFuturePosition = add(mySphere.position, mySphere.velocity);

    for (var k=0;k<cubePosition.length;k++) {
        var cPosition = cubePosition[k].slice();
        cPosition[1] = -0.45;


        if(distance(cPosition, sphereFuturePosition) < c){

            var frontPoint = add(cPosition , vec4(0,0,halfSide,0));
            var backPoint = add(cPosition , vec4(0,0,-halfSide,0));
            var leftPoint = add(cPosition , vec4(-halfSide,0,0,0));
            var rightPoint = add(cPosition , vec4(halfSide,0,0,0));

            var sToFront = distance(sphereFuturePosition, frontPoint);
            var sToBack = distance(sphereFuturePosition, backPoint);
            var sToLeft = distance(sphereFuturePosition, leftPoint);
            var sToRight = distance(sphereFuturePosition, rightPoint);

            if(sToFront <= sToBack && sToFront <= sToLeft && sToFront <= sToRight ){
                if((sphereFuturePosition[2] - frontPoint[2] ) <= mySphere.radius){
                    //find Collision!
                    mySphere.velocity[2] = -mySphere.velocity[2];
                    isCollided =  true;
                }
            }

            if(sToBack <= sToFront && sToBack <= sToLeft && sToBack <= sToRight ){
                if((backPoint[2] - sphereFuturePosition[2] ) <= mySphere.radius){
                    //find Collision!
                    mySphere.velocity[2] = -mySphere.velocity[2];
                    isCollided =  true;
                }
            }

            if(sToLeft <= sToBack && sToLeft <= sToFront && sToLeft <= sToRight ){
                if((leftPoint[0] - sphereFuturePosition[0] ) <= mySphere.radius){
                    //find Collision!
                    mySphere.velocity[0] = -mySphere.velocity[0];
                    isCollided =  true;
                }
            }

            if(sToRight < sToBack && sToRight < sToFront && sToRight < sToLeft ){
                if((sphereFuturePosition[0] - rightPoint[0] ) <= mySphere.radius){
                    //find Collision!
                    mySphere.velocity[0] = -mySphere.velocity[0];
                    isCollided =  true;
                }
            }

        }
    }

    return isCollided;
}
mySphere.roll = function(){
    /*
    var xRollMatrix =  rotate(mySphere.velocity[0] / mySphere.radius *360/Math.PI, [0,1,0]);
    var zRollMatrix = rotate(mySphere.velocity[2] / mySphere.radius * 360/Math.PI, [1,0,0]);
    var rollMatrix = mult(xRollMatrix, zRollMatrix);
    mySphere.modelMatrix = mult(mySphere.modelMatrix, rollMatrix);
    */

    var axis = cross(mySphere.velocity, vec4(0,-1,0,0));
    var speed = length(mySphere.velocity);
    var angleSpeed = speed / mySphere.radius *360/Math.PI;
    if(angleSpeed != 0)
    var rollMatrix = rotate(angleSpeed, axis);
    else
    var rollMatrix = mat4();

    mySphere.rollMatrix = mult(rollMatrix, mySphere.rollMatrix);

}


var basePlane = {

    limit : 0.5,
    coverRange : 20,
    pointsArray : [],
    normalsArray : [],
    ambient : vec4(0.8, 0.8, 0.8, 1.0),
    diffuse : vec4(1.0, 1.0, 1.0, 1.0),
    specular : vec4(1.0, 1.0, 1.0, 1.0),
    shininess : 30.0,
    ambientProduct : vec4(),
    diffuseProduct : vec4(),
    specularProduct : vec4(),
    modelMatrix : mat4(),
    modelViewMatrix : mat4(),
    position : vec4(0,0,0,1),
    vertexNum : 0,
    shadingStyle : 3,  //0:no shading, 1:flat,  2:Gouraud, 3:Phong
    isPhong : true,

    /*
    vBuffer,
    nBuffer,
    init,
    draw
    */

    };
//function
basePlane.init = function(){
    basePlane.modelPointsArray = [  vec4( this.limit,0,this.limit,1),
                                                vec4(this.limit,0,-this.limit,1),
                                                vec4(-this.limit,0,this.limit,1),
                                                vec4(-this.limit,0,-this.limit,1),
                                                vec4(-this.limit,0,this.limit,1),
                                                vec4(this.limit,0,-this.limit,1) ];
    basePlane.modelNormalsArray = [   vec4(0,1,0,0),
                                                    vec4(0,1,0,0),
                                                    vec4(0,1,0,0),
                                                    vec4(0,1,0,0),
                                                    vec4(0,1,0,0),
                                                    vec4(0,1,0,0) ];

    basePlane.transPoints();


    basePlane.vBuffer = gl.createBuffer();
    basePlane.nBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, basePlane.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(basePlane.pointsArray), gl.STATIC_DRAW);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    gl.bindBuffer(gl.ARRAY_BUFFER,null);

    gl.bindBuffer(gl.ARRAY_BUFFER,basePlane.nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(basePlane.normalsArray),gl.STATIC_DRAW);
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);

    basePlane.ambientProduct = mult(basePlane.ambient, light.ambient);
    basePlane.diffuseProduct = mult(basePlane.diffuse, light.diffuse);
    basePlane.specularProduct = mult(basePlane.specular, light.specular);

    basePlane.modelMatrix = mult(translate(0,-0.5,0), basePlane.modelMatrix);
}

basePlane.draw = function() {

    //make sure vTexCoord is turned off
    gl.disableVertexAttribArray( vTexCoord);

    gl.bindBuffer( gl.ARRAY_BUFFER, basePlane.vBuffer );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer( gl.ARRAY_BUFFER, basePlane.nBuffer );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );

    //*************

    gl.uniform4fv( loc.ambientProductLoc,flatten(basePlane.ambientProduct) );
    gl.uniform4fv( loc.diffuseProductLoc,flatten(basePlane.diffuseProduct) );
    gl.uniform4fv( loc.specularProductLoc,flatten(basePlane.specularProduct) );
    gl.uniform1f( loc.shininessLoc, basePlane.shininess );
    gl.uniform1i( loc.isPhongLoc, basePlane.isPhong );

    basePlane.modelViewMatrix = mult(camera.viewMatrix, basePlane.modelMatrix);
    basePlane.normalMatrix =  transpose(invert4(basePlane.modelViewMatrix));

    //*************
    gl.uniform4fv(loc.spherePositionLoc, flatten(mySphere.position));
    gl.uniformMatrix4fv(loc.modelMatrixLoc, false, flatten(basePlane.modelMatrix));
    gl.uniformMatrix4fv(loc.modelViewMatrixLoc, false, flatten(basePlane.modelViewMatrix) );
    gl.uniformMatrix4fv(loc.normalMatrixLoc, false, flatten(basePlane.normalMatrix) );

    //*************
    gl.uniformMatrix4fv(loc.lightModelViewMatrixLoc, false, flatten(mySphere.modelViewMatrix));
    gl.uniform4fv(loc.lightPositionLoc, flatten(light.position));

    //projection matrix
    gl.uniformMatrix4fv(loc.projectionMatrixLoc, false, flatten(camera.projectionMatrix) );

    for(var j=0; j < basePlane.pointsArray.length; j+=3){
                    gl.drawArrays(gl.TRIANGLES, j, 3);
                }
}

basePlane.transPoints = function(){
    for(var i = 0 - basePlane.coverRange; i < basePlane.coverRange;i+= 2*basePlane.limit){
        for(var j = 0 - basePlane.coverRange; j < basePlane.coverRange; j+=2*basePlane.limit){
            for(var k=0; k < 6; k++){
                basePlane.pointsArray.push(multv(translate(i,0,j),basePlane.modelPointsArray[k]));
                basePlane.normalsArray.push(vec4(0,1,0,0));
            }
        }
    }
}


// light Object
var light = {
    ambient : vec4(1.0, 1.0, 1.0, 1.0 ),
    diffuse :  vec4( 0.0, 0.0, 0.0, 1.0 ),
    specular : vec4(0.0, 0.0, 0.0, 1.0 ),
    //position : vec4(0,-0.45,-3,1), //point light
    position : vec4(0,0,1,1),
    modelMatrix : mat4(),
    modelViewMatrix : mat4()
};

//camera Object
var camera = {
    fovy : 45,  // Field-of-view in Y direction angle (in degrees)
    aspect : 0 ,  // will be overwritten in init
    near : 0.3,
    far : 300.0,
    position : vec4(0,0,0,1),
    viewMatrix : mat4(),
    projectionMatrix : mat4(),
    gameSphereViewMatrix : mat4(),
    gameTopViewMatrix : mat4(),
    debugViewMatrix : mat4(),
    distanceToSphere : 0.5,

    //only for gameSphereView
    eye : vec3(),
    at : vec3(),
    up : vec3()
};


// loc Object, storing locations for everything need to be passed to shader
var loc = new Object();
loc.getAllUniformLoc = function(){
    loc.sphereModelMatrixLoc = gl.getUniformLocation(program, "sphereModelMatrix");
    loc.modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    loc.projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    loc.normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    loc.lightModelViewMatrixLoc = gl.getUniformLocation(program, "lightModelViewMatrix");
    loc.ambientProductLoc =  gl.getUniformLocation(program, "ambientProduct");
    loc.diffuseProductLoc =  gl.getUniformLocation(program, "diffuseProduct");
    loc.specularProductLoc =  gl.getUniformLocation(program, "specularProduct");
    loc.positionLoc = gl.getUniformLocation(program, "lightPosition");
    loc.shininessLoc =  gl.getUniformLocation(program, "shininess");
    loc.isPhongLoc =  gl.getUniformLocation(program, "isPhong");
    loc.spherePositionLoc = gl.getUniformLocation(program, "spherePosition");
    loc.modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");

}

/**** Sphere Related Drawing Funcitons ****/


function triangle(a, b, c, n) {

    //push vertices first
    mySphere.pointsArray.push(a);
     mySphere.pointsArray.push(b);
     mySphere.pointsArray.push(c);

     //record vertices number for each sphere
     mySphere.vertexNum += 3;

    switch(mySphere.shadingStyle){
    case 0:
    case 2:
    case 3:
    //push vector in, calculate them in shader
     mySphere.normalsArray.push(vec4(a[0],a[1], a[2], 0.0));
     mySphere.normalsArray.push(vec4(b[0],b[1], b[2], 0.0));
     mySphere.normalsArray.push(vec4(c[0],c[1], c[2], 0.0));

    break;

    case 1:
     var t1 = subtract(b, c);
     var t2 = subtract(a, c);
     var normal = normalize(cross(t2, t1));
     normal = vec4(normal[0],normal[1],normal[2],0.0);

     if(length(vec3(add(c,normal))) <  length(vec3(c)))
     {
        normal = negate(normal);
     }

     mySphere.normalsArray.push(normal);
     mySphere.normalsArray.push(normal);
     mySphere.normalsArray.push(normal);

    break;
    }
}

function divideTriangle(a, b, c, count, n) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1, n);
        divideTriangle( ab, b, bc, count - 1, n );
        divideTriangle( bc, c, ac, count - 1, n );
        divideTriangle( ab, bc, ac, count - 1, n );
    }
    else {
        triangle( a, b, c, n );
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, mySphere.complexity,n);
    divideTriangle(d, c, b, mySphere.complexity,n);
    divideTriangle(a, d, b, mySphere.complexity,n);
    divideTriangle(a, c, d, mySphere.complexity,n);
}

function generateSpheres(){

    //sphere generator information
    var va = vec4(0.0, 0.0, -1.0,1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333,1);

    tetrahedron(va,vb,vc,vd,0);

    mySphere.ambientProduct = mult(mySphere.ambient, light.ambient);
    mySphere.diffuseProduct = mult(mySphere.diffuse, light.diffuse);
    mySphere.specularProduct = mult(mySphere.specular, light.specular);
}

function quad(a, b, c, d) {

    //no texture for now

     myCube.pointsArray.push(myCube.vertices[a]);
     // myCube.colorsArray.push(myCube.color);
     myCube.texCoordsArray.push(myCube.texCoord[0]);

     myCube.pointsArray.push(myCube.vertices[b]);
     // myCube.colorsArray.push(myCube.color);
     myCube.texCoordsArray.push(myCube.texCoord[1]);

     myCube.pointsArray.push(myCube.vertices[c]);
     // myCube.colorsArray.push(myCube.color);
     myCube.texCoordsArray.push(myCube.texCoord[2]);

     myCube.pointsArray.push(myCube.vertices[a]);
     // myCube.colorsArray.push(myCube.color);
     myCube.texCoordsArray.push(myCube.texCoord[0]);

     myCube.pointsArray.push(myCube.vertices[c]);
     // myCube.colorsArray.push(myCube.color);
     myCube.texCoordsArray.push(myCube.texCoord[2]);

     myCube.pointsArray.push(myCube.vertices[d]);
     // myCube.colorsArray.push(myCube.color);
     myCube.texCoordsArray.push(myCube.texCoord[3]);
}

function storeNormal(face) {

    //six points per face
    switch (face)
    {
        case 'front':
        //normal facing upwards
        for (var i = 0; i < 6; i++)
            myCube.normalsArray.push(vec4(0,0,-1,0));

        break;

        case 'back':
        for (var i = 0; i < 6; i++)
            myCube.normalsArray.push(vec4(0,0,1,0));
        break;

        case 'left':
        for (var i = 0; i < 6; i++)
            myCube.normalsArray.push(vec4(-1,0,0,0));
        break;

        case 'right':
        for (var i = 0; i < 6; i++)
            myCube.normalsArray.push(vec4(1,0,0,0));
        break;

        case 'top':
        for (var i = 0; i < 6; i++)
            myCube.normalsArray.push(vec4(0,1,0,0));
        break;

        case 'bottom':
        for (var i = 0; i < 6; i++)
            myCube.normalsArray.push(vec4(0,-1,0,0));
        break;

    }
}

function drawCube() {

    quad( 1, 0, 3, 2 ); //1 0 3 1 3 2 //front face
    storeNormal('front');

    quad( 2, 3, 7, 6 ); // 2 3 7 2 7 6 //right face
    storeNormal('right');

    quad( 4, 0, 3, 7 ); // 3 0 4 3 4 7 //bottom face //4 0 3 4 3 7
    storeNormal('bottom');

    quad( 5, 1, 2, 6 ); // 6 5 1 6 1 2 //top face //5 1 2 5 2 6
    storeNormal('top');

    quad( 6, 7, 4, 5 ); // 4 5 6 4 6 7 //back face //6 7 4 6 4 5
    storeNormal('back');

    quad( 5, 4, 0, 1 ); // 5 4 0 5 0 1 //left face //
    storeNormal('left');

}

/**** init function called when window loads ****/

window.onload = function init() {
    //web GL setup
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //basic setup
    gl.viewport( 0, 0, canvas.width, canvas.height );
    camera.aspect =  canvas.width/canvas.height;
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    //Load shaders
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    vPosition = gl.getAttribLocation( program, "vPosition" );
    vNormal = gl.getAttribLocation( program, "vNormal" );

    //init all objects
    translateMaze(maze);
    myCube.init();
    mySphere.init();
    basePlane.init();

    //get Locs
    loc.getAllUniformLoc();


    // setup projection matrix
     camera.projectionMatrix = perspective(camera.fovy, camera.aspect, camera.near, camera.far);


    render();

}

function render(){
    //clean canvas
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mySphere.draw();
    basePlane.draw();

    for (var i = 0; i < cubePosition.length; i++)
    {
        myCube.draw(cubePosition[i]);
    }
    //draw the large Cube
    myCube.drawBig();



    setTimeout(
        function (){requestAnimFrame(render);}, 1000/60
    );
}


//===============================  key pressed events  ===============================

window.onkeydown = function(event){


        //game mode
        if(!isDebugMode){
                if(!isTopMode ){

                        var currentDirc = subtract(mySphere.position, camera.position);
                        currentDirc = vscale(1/100,normalize(currentDirc));
                        var tempVelocity;
                        switch(event.keyCode){

                            case 87 : //key w
                                tempVelocity = add(mySphere.velocity, currentDirc);
                                if(length(tempVelocity) <= mySphere.topSpeed)
                                mySphere.velocity = tempVelocity;
                            break;
                            case 83 : //key s
                                tempVelocity = add(mySphere.velocity, negate(currentDirc));
                                if(length(tempVelocity) <= mySphere.topSpeed)
                                mySphere.velocity = tempVelocity;
                            break;
                            case 65 : //key a
                                var currentLeft = negate(cross(currentDirc,vec4(0,1,0,0)));
                                tempVelocity = add(mySphere.velocity, vec4(currentLeft,0));
                                if(length(tempVelocity) <= mySphere.topSpeed)
                                mySphere.velocity = tempVelocity;
                            break;
                            case 68 : //key d
                                var currentRight = cross(currentDirc,vec4(0,1,0,0));
                                tempVelocity = add(mySphere.velocity, vec4(currentRight,0));
                                if(length(tempVelocity) <= mySphere.topSpeed)
                                mySphere.velocity = tempVelocity;
                            break;

                            case 37:  // left arrow
                            var v3SpherePosition = v4ToV3(mySphere.position);
                            var v3CameraPosition = v4ToV3(camera.position);
                            var sphereToCameraVec = subtract(v3CameraPosition,v3SpherePosition);
                            var v3Vertical = vec3(0,1,0);
                            var v3Cross = cross(sphereToCameraVec,v3Vertical);
                            v3Cross = normalize(v3Cross);
                            v3Cross = vscale(0.08,v3Cross);
                            var newSphereToCamera = add(sphereToCameraVec, v3Cross);
                            newSphereToCamera = normalize(newSphereToCamera);

                            newSphereToCamera = vscale(camera.distanceToSphere,newSphereToCamera);
                            camera.eye = add(v3SpherePosition, newSphereToCamera);
                            camera.position = vec4(camera.eye, 1);
                            break;
                            case 39:  // right arrow
                            var v3SpherePosition = v4ToV3(mySphere.position);
                            var v3CameraPosition = v4ToV3(camera.position);
                            var sphereToCameraVec = subtract(v3CameraPosition,v3SpherePosition);
                            var v3Vertical = vec3(0,1,0);
                            var v3Cross = cross(sphereToCameraVec,v3Vertical);
                            v3Cross = normalize(v3Cross);
                            v3Cross = negate(vscale(0.08,v3Cross));
                            var newSphereToCamera = add(sphereToCameraVec, v3Cross);
                            newSphereToCamera = normalize(newSphereToCamera);

                            newSphereToCamera = vscale(camera.distanceToSphere,newSphereToCamera);
                            camera.eye = add(v3SpherePosition, newSphereToCamera);
                            camera.position = vec4(camera.eye, 1);
                            break;
                            case 84: //key t
                            isTopMode = true;
                            break;

                            //get into debug mode
                            case 66:
                            isDebugMode = true;
                            break;
                         }

                        camera.gameSphereViewMatrix = lookAt(camera.eye, camera.at, camera.up);


                }
                else{
                            var currentDirc = vec4(0,0,1,0);
                            currentDirc = vscale(1/100,normalize(currentDirc));

                            switch(event.keyCode){
                            case 87 : //key w
                                tempVelocity = add(mySphere.velocity, currentDirc);
                                if(length(tempVelocity) <= mySphere.topSpeed)
                                mySphere.velocity = tempVelocity;
                            break;
                            case 83 : //key s
                                tempVelocity = add(mySphere.velocity, negate(currentDirc));
                                if(length(tempVelocity) <= mySphere.topSpeed)
                                mySphere.velocity = tempVelocity;
                            break;
                            case 65 : //key a
                                var currentLeft = negate(cross(currentDirc,vec4(0,1,0,0)));
                                tempVelocity = add(mySphere.velocity, vec4(currentLeft,0));
                                if(length(tempVelocity) <= mySphere.topSpeed)
                                mySphere.velocity = tempVelocity;
                            break;
                            case 68 : //key d
                                var currentRight = cross(currentDirc,vec4(0,1,0,0));
                                tempVelocity = add(mySphere.velocity, vec4(currentRight,0));
                                if(length(tempVelocity) <= mySphere.topSpeed)
                                mySphere.velocity = tempVelocity;
                            break;
                            case 66: // key t
                                isDebugMode = false;
                            break;
                            case 84: //key t
                                isTopMode = false;
                            break;

                            }

                    }
                }
            else{
             switch(event.keyCode){
                    case 66 : //exit debug mode
                    isDebugMode = false;
                    break;

                    case 87 : //key w
                    camera.debugViewMatrix = mult(translate(0,0,0.5), camera.debugViewMatrix);
                    break;
                    case 83 : //key s
                    camera.debugViewMatrix = mult(translate(0,0,-0.5), camera.debugViewMatrix);
                    break;
                    case 65 : //key a
                    camera.debugViewMatrix = mult(translate(0.5,0,0), camera.debugViewMatrix);
                    break;
                    case 68 : //key d
                    camera.debugViewMatrix = mult(translate(-0.5,0,0), camera.debugViewMatrix);
                    break;

                    case 38:   //up arrow
                    camera.debugViewMatrix = mult(rotate(-2,[1,0,0]), camera.debugViewMatrix);
                    break;
                    case 40:   //down arrow
                    camera.debugViewMatrix = mult(rotate(2,[1,0,0]), camera.debugViewMatrix);
                    break;
                    case 37:  // left arrow
                    camera.debugViewMatrix = mult(rotate(-2,[0,1,0]), camera.debugViewMatrix);
                    break;
                    case 39:  // right arrow
                    camera.debugViewMatrix = mult(rotate(2,[0,1,0]), camera.debugViewMatrix);
                    break;
                }
            }

            //set current camera view base on modes
            if(isDebugMode)
                camera.viewMatrix = camera.debugViewMatrix;
            else if (isTopMode)
                camera.viewMatrix = camera.gameTopViewMatrix;
            else
                {
                    var adjustedSphereViewMatrix = mult(translate(0,-0.1,0),camera.gameSphereViewMatrix);
                    camera.viewMatrix = adjustedSphereViewMatrix;
                }
}



