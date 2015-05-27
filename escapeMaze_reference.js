var canvas;
var gl;
var modelViewMatrix;
var modelMatrix = [];
var viewMatrix;
var projectionMatrix;
var normalMatrix;
var program;
var vPosition;
var vNormal;
var  sunModelViewMatrix;

var viewMatrixCopy;



//helper
var count = 0;
var theta = 0;
var gamma = 0;


var eye;
var at;
var up;

var initEye;
var initAt;
var initUp;

var isAttatched = false;
var relativeDegree = 0;



//projectionMatrix attributes
var  fovy = 45;  // Field-of-view in Y direction angle (in degrees)
var  aspect;
var near = 0.3;
var far = 300.0;



//identifier
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var sunModelViewMatrixLoc;


// light attributes
var lightPosition = vec4(0.0, 0.0, 0.0, 1.0 ); //sun's location
var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

// Sphere color attributes
var materialAmbient =  vec4(0.3, 0.3, 0.3, 1.0);
var materialDiffuse = vec4(0.8, 0.0, 0.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var shininess = 30.0;

var ambientProduct = [];
var diffuseProduct = [];
var specularProduct = [];


// Ohter sphere properties
var vBuffer = [];
var nBuffer = [];

var  pointsArray = new Array();

var normalsArray = new Array();

var sphereNum = 1;
var complexity = 4
var shadingStyle = 3;  //0:no shading, 1:flat,  2:Gouraud, 3:Phong
var sphereVertexNum = 0;
var sphereSize = 2;
var isPhong = true;


//sphere generator information
var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);



function triangle(a, b, c, n) {

    //push vertices first
    pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);

     //record vertices number for each sphere
     sphereVertexNum[n] += 3;

    switch(shadingStyle[n]){
    case 0:
    case 2:
    case 3:
    //push vector in, calculate them in shader
     normalsArray.push(vec4(a[0],a[1], a[2], 0.0));
     normalsArray.push(vec4(b[0],b[1], b[2], 0.0));
     normalsArray.push(vec4(c[0],c[1], c[2], 0.0));

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

     normalsArray.push(normal);
     normalsArray.push(normal);
     normalsArray.push(normal);

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
    divideTriangle(a, b, c, complexity[n], n);
    divideTriangle(d, c, b, complexity[n],n);
    divideTriangle(a, d, b, complexity[n],n);
    divideTriangle(a, c, d, complexity[n],n);


}




function generateSpheres(){
    for(var i =0; i <sphereNum; i++)
    {
    tetrahedron(va,vb,vc,vd,i);


    //get a modelMatrix for each sphere
    modelMatrix.push(mat4());

    ambientProduct.push(mult(materialAmbient[i],lightAmbient));
    diffuseProduct.push(mult(materialDiffuse[i],lightDiffuse));
    specularProduct.push(mult(materialSpecular[i],lightSpecular));

    }

}




window.onload = function init() {
    //web GL setup
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //basic setup
    gl.viewport( 0, 0, canvas.width, canvas.height );
    aspect =  canvas.width/canvas.height;
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    //Load shaders
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    generateSpheres();



    for(var i=0; i<sphereNum;i++)
    {


        //-----------------------------------------push vertices in buffer--------------------------------------
        vBuffer[i] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer[i]);
        gl.bufferData(gl.ARRAY_BUFFER,flatten(pointsArray),gl.STATIC_DRAW);

        //link and enable position attribute
        vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );
        //unlink buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,null);

        ////-----------------------------------------push normal vector in buffer--------------------------------------
        nBuffer[i] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,nBuffer[i]);
        gl.bufferData(gl.ARRAY_BUFFER,flatten(normalsArray),gl.STATIC_DRAW);

        //link and enable normal attribute
        vNormal = gl.getAttribLocation( program, "vNormal" );
        gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vNormal);
        //unlink buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,null);

    }


    // link varialbe in shader to variable in js
    //This is done here because they are only need to be called once. They will
    //be used in render
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    sunModelViewMatrixLoc = gl.getUniformLocation( program, "sunModelViewMatrix" );


    // setup projection matrix
     projectionMatrix = perspective(fovy, aspect, near, far);

     //setup view matrix
    viewMatrix = mat4();


    render();

}

function render(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);




    for(var i =0; i < sphereNum;i++){

        //bind to its buffer
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer[i] );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer[i] );
        gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );


        //transfer values
        gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct[i]) );
        gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct[i]) );
        gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct[i]) );
        gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );
        gl.uniform1f( gl.getUniformLocation(program, "shininess"),shininess[i] );
        gl.uniform1i( gl.getUniformLocation(program, "isPhong"), isPhong[i] );


       modelViewMatrix = mult(viewMatrix, currentModleMatrix);


        if(i == 0)
        {
            sunModelViewMatrix = modelViewMatrix;
        }


         gl.uniformMatrix4fv(sunModelViewMatrixLoc, false, flatten(sunModelViewMatrix));

        normalMatrix = transpose(invert4(modelViewMatrix));

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
        gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
      }


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