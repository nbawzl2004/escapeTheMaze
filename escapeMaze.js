var canvas;
var gl;
var program;
var vPosition;
var vNormal;

// Sphere Object

var mySphere = {
    ambient : vec4(1.0, 1.0, 1.0, 1.0),
    diffuse : vec4(1.0, 1.0, 1.0, 1.0),
    specular : vec4(1.0, 1.0, 1.0, 1.0),
    shininess : 30.0,
    position : vec4(0,0,-3,1),
    vertexNum : 0,
    complexity : 5,
    shadingStyle : 3,  //0:no shading, 1:flat,  2:Gouraud, 3:Phong
    radius : 2,
    isPhong : true,


};

    mySphere.pointsArray = [];
    mySphere.normalsArray = [];
    mySphere.ambientProduct = vec4();
    mySphere.diffuseProduct = vec4();
    mySphere.specularProduct = vec4();
    mySphere.modelMatrix = mat4();
    mySphere.modelViewMatrix = mat4();


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
    viewMatrix : mat4(),
    projectionMatrix : mat4()
};


// loc Object, storing locations for everything need to be passed to shader
var loc = new Object();

//sphere generator information
    var va = vec4(0.0, 0.0, -1.0,1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333,1);


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

    tetrahedron(va,vb,vc,vd,0);

    mySphere.ambientProduct = mult(mySphere.ambient, light.ambient);
    mySphere.diffuseProduct = mult(mySphere.diffuse, light.diffuse);
    mySphere.specularProduct = mult(mySphere.specular, light.specular);

}


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

    //create buffers for sphere
    mySphere.vBuffer = gl.createBuffer();
    mySphere.nBuffer = gl.createBuffer();

    generateSpheres();



        //-----------------------------------------push sphere vertices in buffer--------------------------------------

        gl.bindBuffer(gl.ARRAY_BUFFER,mySphere.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,flatten(mySphere.pointsArray),gl.STATIC_DRAW);

        //link and enable position attribute
        vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );
        //unlink buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,null);

        ////-----------------------------------------push normal vector in buffer--------------------------------------
        gl.bindBuffer(gl.ARRAY_BUFFER,mySphere.nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,flatten(mySphere.normalsArray),gl.STATIC_DRAW);

        //link and enable normal attribute
        vNormal = gl.getAttribLocation( program, "vNormal" );
        gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vNormal);
        //unlink buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,null);




    // link varialbe in shader to variable in js
    //This is done here because they are only need to be called once. They will
    //be used in render
    loc.modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    loc.projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    loc.normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    loc.lightModelViewMatrixLoc = gl.getUniformLocation(program, "lightModelViewMatrix");
    loc.sphereAmbientProductLoc =  gl.getUniformLocation(program, "sphereAmbientProduct");
    loc.sphereDiffuseProductLoc =  gl.getUniformLocation(program, "sphereDiffuseProduct");
    loc.sphereSpecularProductLoc =  gl.getUniformLocation(program, "sphereSpecularProduct");
    loc.positionLoc = gl.getUniformLocation(program, "lightPosition");
    loc.shininessLoc =  gl.getUniformLocation(program, "shininess");
    loc.isPhongLoc =  gl.getUniformLocation(program, "isPhong");

    // setup projection matrix
     camera.projectionMatrix = perspective(camera.fovy, camera.aspect, camera.near, camera.far);

     testFun();

    render();

}

function render(){
    //clean canvas
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // bind ball's buffer
    gl.bindBuffer( gl.ARRAY_BUFFER, mySphere.vBuffer );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer( gl.ARRAY_BUFFER, mySphere.nBuffer );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );

     //transfer values
        gl.uniform4fv( loc.sphereAmbientProductLoc,flatten(mySphere.ambientProduct) );
        gl.uniform4fv( loc.sphereDiffuseProductLoc,flatten(mySphere.diffuseProduct) );
        gl.uniform4fv( loc.sphereSpecularProductLoc,flatten(mySphere.specularProduct) );
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


        for(var j=0; j < mySphere.vertexNum; j+=3){
            gl.drawArrays(gl.TRIANGLES, j, 3);
        }
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
}