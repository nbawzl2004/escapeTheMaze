var canvas;
var gl;
var program;
var vPosition;
var vNormal;


// CubeObject
var myCube = {
    ambient : vec4(1.0, 1.0, 1.0, 1.0),
    diffuse : vec4(1.0, 1.0, 1.0, 1.0),
    specular : vec4(1.0, 1.0, 1.0, 1.0),
    shininess : 30.0,
    center : 1,
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
    pointsArray : [],
    normalsArray : [],
    ambientProduct : vec4(),
    diffuseProduct : vec4(),
    specularProduct : vec4(),
    modelMatrix : mat4(),
    modelViewMatrix : mat4(),

}

//functions
myCube.init = function() {
            //call helper function to generate cube
            drawCube();

            //create buffers for sphere
            myCube.vBuffer = gl.createBuffer();
            myCube.nBuffer = gl.createBuffer();

            //-----------------------------------------push sphere vertices in buffer--------------------------------------

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
        };

myCube.draw = function() {
                // bind ball's buffer
                gl.bindBuffer( gl.ARRAY_BUFFER, myCube.vBuffer );
                gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
                gl.bindBuffer( gl.ARRAY_BUFFER, myCube.nBuffer );
                gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );

                 //transfer values
                gl.uniform4fv( loc.ambientProductLoc,flatten(myCube.ambientProduct) );
                gl.uniform4fv( loc.diffuseProductLoc,flatten(myCube.diffuseProduct) );
                gl.uniform4fv( loc.specularProductLoc,flatten(myCube.specularProduct) );
                gl.uniform4fv( loc.lightPositionLoc, flatten(light.position) );
                gl.uniform1f( loc.shininessLoc, mySphere.shininess );
                gl.uniform1i( loc.isPhongLoc, mySphere.isPhong );


                //intergrate modelview matrix
                myCube.modelViewMatrix = mult(camera.viewMatrix, myCube.modelMatrix);
                myCube.normalMatrix =  transpose(invert4(myCube.modelViewMatrix));
                light.modelViewMatrix = mult(camera.viewMatrix, light.modelMatrix);

                // transfer data
                //sphere
                gl.uniformMatrix4fv(loc.modelViewMatrixLoc, false, flatten(myCube.modelViewMatrix) );
                gl.uniformMatrix4fv(loc.normalMatrixLoc, false, flatten(myCube.normalMatrix) );

                //light
                gl.uniformMatrix4fv(loc.lightModelViewMatrixLoc, false, flatten(light.modelViewMatrix));
                gl.uniform4fv(loc.lightPositionLoc, flatten(light.position));

                //projection matrix
                gl.uniformMatrix4fv(loc.projectionMatrixLoc, false, flatten(camera.projectionMatrix) );

                //draw cube
                gl.drawArrays( gl.TRIANGLES, 0, myCube.vertexNum );

            };

// Sphere Object

var mySphere = {
    ambient : vec4(1.0, 1.0, 1.0, 1.0),
    diffuse : vec4(1.0, 1.0, 1.0, 1.0),
    specular : vec4(1.0, 1.0, 1.0, 1.0),
    shininess : 30.0,
    position : vec4(0,0,-3,1),
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

    complexity : 5,
    radius : 2


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
        }

mySphere.draw = function() {
                // bind ball's buffer
                gl.bindBuffer( gl.ARRAY_BUFFER, mySphere.vBuffer );
                gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
                gl.bindBuffer( gl.ARRAY_BUFFER, mySphere.nBuffer );
                gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );

                 //transfer values
                gl.uniform4fv( loc.ambientProductLoc,flatten(mySphere.ambientProduct) );
                gl.uniform4fv( loc.diffuseProductLoc,flatten(mySphere.diffuseProduct) );
                gl.uniform4fv( loc.specularProductLoc,flatten(mySphere.specularProduct) );
                gl.uniform4fv( loc.lightPositionLoc, flatten(light.position) );
                gl.uniform1f( loc.shininessLoc, mySphere.shininess );
                gl.uniform1i( loc.isPhongLoc, mySphere.isPhong );


                //intergrate modelview matrix
                mySphere.modelViewMatrix = mult(camera.viewMatrix, mySphere.modelMatrix);
                mySphere.normalMatrix =  transpose(invert4(mySphere.modelViewMatrix));
                light.modelViewMatrix = mult(camera.viewMatrix, light.modelMatrix);

                // transfer data
                //sphere
                gl.uniformMatrix4fv(loc.modelViewMatrixLoc, false, flatten(mySphere.modelViewMatrix) );
                gl.uniformMatrix4fv(loc.normalMatrixLoc, false, flatten(mySphere.normalMatrix) );

                //light
                gl.uniformMatrix4fv(loc.lightModelViewMatrixLoc, false, flatten(light.modelViewMatrix));
                gl.uniform4fv(loc.lightPositionLoc, flatten(light.position));

                //projection matrix
                gl.uniformMatrix4fv(loc.projectionMatrixLoc, false, flatten(camera.projectionMatrix) );

                //draw sphere
                    for(var j=0; j < mySphere.vertexNum; j+=3){
                    gl.drawArrays(gl.TRIANGLES, j, 3);
                }
            }


var basePlane = {

    limit : 30,
    pointsArray : [],
    normalsArray : [],
    ambient : vec4(1.0, 1.0, 0.0, 1.0),
    diffuse : vec4(1.0, 1.0, 1.0, 1.0),
    specular : vec4(1.0, 1.0, 1.0, 1.0),
    shininess : 30.0,
    ambientProduct : vec4(),
    diffuseProduct : vec4(),
    specularProduct : vec4(),
    modelMatrix : mat4(),
    modelViewMatrix : mat4(),
    position : vec4(0,0,0,1),
    vertexNum : 6,
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
    basePlane.pointsArray = [  vec4( this.limit,0,this.limit,1),
                                                vec4(this.limit,0,-this.limit,1),
                                                vec4(-this.limit,0,this.limit,1),
                                                vec4(-this.limit,0,-this.limit,1),
                                                vec4(-this.limit,0,this.limit,1),
                                                vec4(this.limit,0,-this.limit,1) ];
    basePlane.normalsArray = [   vec4(0,1,0,0),
                                                    vec4(0,1,0,0),
                                                    vec4(0,1,0,0),
                                                    vec4(0,1,0,0),
                                                    vec4(0,1,0,0),
                                                    vec4(0,1,0,0) ];


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
}

basePlane.draw = function() {
    gl.bindBuffer( gl.ARRAY_BUFFER, basePlane.vBuffer );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer( gl.ARRAY_BUFFER, basePlane.nBuffer );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );

    //*************
    gl.uniform4fv( loc.lightPositionLoc, flatten(light.position) );

    gl.uniform4fv( loc.ambientProductLoc,flatten(basePlane.ambientProduct) );
    gl.uniform4fv( loc.diffuseProductLoc,flatten(basePlane.diffuseProduct) );
    gl.uniform4fv( loc.specularProductLoc,flatten(basePlane.specularProduct) );
    gl.uniform1f( loc.shininessLoc, basePlane.shininess );
    gl.uniform1i( loc.isPhongLoc, basePlane.isPhong );

    basePlane.modelViewMatrix = mult(camera.viewMatrix, basePlane.modelMatrix);
    basePlane.normalMatrix =  transpose(invert4(basePlane.modelViewMatrix));

    //*************
    light.modelViewMatrix = mult(camera.viewMatrix, light.modelMatrix);

    gl.uniformMatrix4fv(loc.modelViewMatrixLoc, false, flatten(basePlane.modelViewMatrix) );
    gl.uniformMatrix4fv(loc.normalMatrixLoc, false, flatten(basePlane.normalMatrix) );

    //*************
    gl.uniformMatrix4fv(loc.lightModelViewMatrixLoc, false, flatten(light.modelViewMatrix));
    gl.uniform4fv(loc.lightPositionLoc, flatten(light.position));

    //projection matrix
    gl.uniformMatrix4fv(loc.projectionMatrixLoc, false, flatten(camera.projectionMatrix) );

    for(var j=0; j < basePlane.vertexNum; j+=3){
                    gl.drawArrays(gl.TRIANGLES, j, 3);
                }

}




// light Object
var light = {
    ambient : vec4(1.0, 1.0, 1.0, 1.0 ),
    diffuse :  vec4( 1.0, 1.0, 1.0, 1.0 ),
    specular : vec4( 1.0, 1.0, 1.0, 1.0 ),
    position : vec4(0,2,-300,1), //point light
    modelMatrix : mat4(),
    modelViewMatrix : mat4()
};



//camera Object
var camera = {
    fovy : 45,  // Field-of-view in Y direction angle (in degrees)
    aspect : 0 ,  // will be overwritten in init
    near : 0.3,
    far : 300.0,
    viewMatrix : mult(rotate(90, [1,0,0]), translate(0, -10, 0)),
    projectionMatrix : mat4()
};


// loc Object, storing locations for everything need to be passed to shader
var loc = new Object();
loc.getAllUniformLoc = function(){
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
     // texCoordsArray.push(texCoord[0]);

     myCube.pointsArray.push(myCube.vertices[b]); 
     // myCube.colorsArray.push(myCube.color);
     // texCoordsArray.push(texCoord[1]); 

     myCube.pointsArray.push(myCube.vertices[c]); 
     // myCube.colorsArray.push(myCube.color);
     // texCoordsArray.push(texCoord[2]); 
   
     myCube.pointsArray.push(myCube.vertices[a]); 
     // myCube.colorsArray.push(myCube.color);
     // texCoordsArray.push(texCoord[0]); 

     myCube.pointsArray.push(myCube.vertices[c]); 
     // myCube.colorsArray.push(myCube.color);
     // texCoordsArray.push(texCoord[2]); 

     myCube.pointsArray.push(myCube.vertices[d]); 
     // myCube.colorsArray.push(myCube.color);
     // texCoordsArray.push(texCoord[3]);   
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
    // vColor = gl.getAttribLocation(program, "vColor");

    //init all objects
    myCube.init();
    mySphere.init();
    basePlane.init();



    //get Locs
    loc.getAllUniformLoc();




    // setup projection matrix
     camera.projectionMatrix = perspective(camera.fovy, camera.aspect, camera.near, camera.far);

     testFun();

    render();

}

function render(){
    //clean canvas
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mySphere.draw();
    basePlane.draw();
    myCube.draw();

    setTimeout(
        function (){requestAnimFrame(render);}, 1000/60
    );
}


//===============================  key pressed events  ===============================

window.onkeydown = function(event){
        // subject to chage
        if(true ){
            switch(event.keyCode){

            case 38:   //up arrow
            break;

            case 40:   //down arrow
            break;

            case 73:        //key i
            break;

            case 77:        //key m
            break;

            case 74:  //key j
            break;

            case 75:  //key k
            break;

            case 82:    //key r

            break;


            case 78: //key n
            break;

            case 87: //key w
            break;

            case 65:
            break;

            case 37:  // left arrow
            break;
            case 39:  // right arrow
            break;
         }
        }
        else{
            switch(event.keyCode){
            case 65:      //key a
            break;
             case 37:  // left arrow
            break;
            case 39:  // right arrow
            break;

            }
        }

}



function testFun(){
    mySphere.modelMatrix = mult(translate(0,0,-3), mySphere.modelMatrix);
    basePlane.modelMatrix = mult(translate(0,-3,0), basePlane.modelMatrix);
}