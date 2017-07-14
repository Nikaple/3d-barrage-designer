(function() {

"use strict";

const PI = Math.PI,
    NUM_TO_RAD = PI / 180,
    cos = Math.cos,
    sin = Math.sin,
    sqrt = Math.sqrt,
    abs = Math.abs,
    CANVAS_WIDTH = 1200,
    CANVAS_HEIGHT = 800,
    ANGLE_OFFSET = -90;


/**
 * create a vector
 * @class
 */
class Vector {
    /**
     * create a vector
     * @param {Number} x - x component of vector
     * @param {Number} y - y component of vector
     * @param {Number} z - z component of vector
     */
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        // the magnitude of vector
        this.magnitude = sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    // return true if current vector is zero vector
    isZeroVector() {
        return this.x === 0 && this.y === 0 && this.z === 0;
    }

    // normalize the current vector to magnitude = 1
    normalize() {
        if (this.isZeroVector() === false) {
            let mag = this.magnitude;
            this.x /= mag;
            this.y /= mag;
            this.z /= mag;
            this.magnitude = 1;
        }
        return this;
    }

    // increase the size of vector by num
    multiplyByNumber(num) {
        this.x *= num;
        this.y *= num;
        this.z *= num;
        this.magnitude *= num;
    }

    /**
     * 
     * @param {Vector} vect - the vector to calculate
     * @returns 
     * @memberof Vector
     */
    cross(vect) {
        return new Vector(this.y * vect.z - this.z * vect.y, this.z * vect.x - this.x * vect.z,
            this.x * vect.y - this.y * vect.x);
    }

    /**
     * 
     * rotate the current vector with respect to the normal vector
     * @param {Vector} normalVector - normal vector for rotating reference
     * @param {Number} angle - amount to rotate in degrees
     */
    rotate(normalVector, angle) {
        if (!(normalVector instanceof Vector)) {
            throw new TypeError(`Cannot rotate the ${typeof normalVector}`);
        }
        const mag = normalVector.magnitude;
        normalVector.normalize();
        const x = normalVector.x,
            y = normalVector.y,
            z = normalVector.z,
            res = new Vector();
        if (this.isZeroVector()) {
            throw new RangeError("Cannot rotate zero vector");
        }
        // the rotation matrix
        let cosAngle = cos(angle * NUM_TO_RAD),
            sinAngle = sin(angle * NUM_TO_RAD),
            matrix = [
                [cosAngle + x * x * (1 - cosAngle), x * y * (1 - cosAngle) - z * sinAngle, x * z * (1 - cosAngle) + y * sinAngle],
                [y * x * (1 - cosAngle) + z * sinAngle, cosAngle + y * y * (1 - cosAngle), y * z * (1 - cosAngle) - x * sinAngle],
                [z * x * (1 - cosAngle) - y * sinAngle, z * y * (1 - cosAngle) + x * sinAngle, cosAngle + z * z * (1 - cosAngle)]
            ];
        //matrix multiplication
        res.x = (this.x * matrix[0][0] + this.y * matrix[1][0] + this.z * matrix[2][0]);
        res.y = (this.x * matrix[0][1] + this.y * matrix[1][1] + this.z * matrix[2][1]);
        res.z = (this.x * matrix[0][2] + this.y * matrix[1][2] + this.z * matrix[2][2]);
        return res;
    }

    /* create two unit vectors both perpendicular to given vector
     * @returns {Vector[2]} An array of 2 perpendicular unit vectors
     */
    getUnitVectors() {
        let units = [];
        units[0] = this.cross(new Vector(1, 0, 0));
        if (units[0].isZeroVector() === true) {
            units[0] = this.cross(new Vector(0, 1, 0));
        }
        units[1] = this.cross(units[0]).normalize();
        units[0].normalize();
        return units;
    }

    /** 
     * @memberof Vector
     *
     * converts the current vector to string
     * @returns {String} - Format : (x, y, z)
     */
    toString() {
        return `(${this.x}, ${this.y}, ${this.z})`;
    }

    /**
     * 
     * 
     * @returns 
     * @memberof Vector
     */
    valueOf() {
        return this.magnitude;
    }
}

/**
 * create a dot
 * @class
 */
class Dot {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /* translate the dot by (x, y, z)
     * @param {Number} x - x component of translation
     * @param {Number} y - y component of translation
     * @param {Number} z - z component of translation
     * @returns {Dot} Dot after translation
     */
    translateByXYZ(x = 0, y = 0, z = 0) {
        this.x += x;
        this.y += y;
        this.z += z;
    }

    /* translate the dot by vector
     * @params {Vector} vector - the vector for translation
     * @returns {Dot} Dot after translation
     */
    translateByVector(vector) {
        let res = new Dot();
        res.x = this.x + vector.x;
        res.y = this.y + vector.y;
        res.z = this.z + vector.z;
        return res;
    }

    /* translate by unit vectors [vector, vector]
     * @params {Vector[2]} unitVectors - Two unit vectors for calculation
     * @params {Number} radius - Radius for translation
     * @params {Number} angle - Angle for translation in degrees
     * @returns {Dot} Dot after translation
     */
    translateByUnitVectors(unitVectors, radius, angle) {
        let res = new Dot(),
            cosAngle = cos(angle),
            sinAngle = sin(angle);
        res.x = this.x - radius * (unitVectors[0].x * cosAngle + unitVectors[1].x * sinAngle);
        res.y = this.y - radius * (unitVectors[0].y * cosAngle + unitVectors[1].y * sinAngle);
        res.z = this.z + radius * (unitVectors[0].z * cosAngle + unitVectors[1].z * sinAngle);
        return res;
    }

    /* return the m-th n-division point
     * @params {Dot} dot - the end point of calculation
     * @params {Number} serial - serial number of the point
     * @params {Number} total - total number of division
     */
    nthDivDot(dot, serial, total) {
        let res = new Dot();
        res.x = this.x + (dot.x - this.x) / total * serial;
        res.y = this.y + (dot.y - this.y) / total * serial;
        res.z = this.z + (dot.z - this.z) / total * serial;
        return res;
    }
}

//canvas manipulation
let canvas = document.getElementById('canvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
let ctx = canvas.getContext('2d');

//set the default value of given object's given property with given value
function setDefaultValue(obj, propName, value) {
    obj[propName] = obj.hasOwnProperty(propName) ? obj[propName] : value;
}

//returns the angle of serialNum-th in totalNum dots distributed on a circle
function getAngleDistribution(serialNum, totalNum, offset) {
    return serialNum / totalNum * 2 * PI + (offset + ANGLE_OFFSET) * NUM_TO_RAD;
}

//process image properties
function imagePreloadProcess(img, callback) {
    img.offsetX = img.width / 2;
    img.offsetY = img.height / 2;
    callback.call(img);
}

//preload functions
function imagePreload(url, callback) {
    let img = new Image();
    img.src = url;
    // if cached, call the callback function immediately
    if (img.complete) {
        imagePreloadProcess(img, callback);
        return;
    }
    //call the callback function when onload
    img.onload = function() {
        imagePreloadProcess(img, callback);
    };
}

/**
 * create a pattern
 * @class
 */
class Pattern {
    /**
     * create a bullet with given parameters
     * @param {HTMLImageElement} img - Image to draw
     * @param {Dot} pos - Position to draw
     * @param {Number} initScale - Scale of bullet
     */
    createDot(img, pos, initScale = 1) {
        let scale = 1;
        ctx.drawImage(img, pos.x - img.offsetX, pos.y - img.offsetY, img.width * scale * initScale, img.height * scale * initScale);
    }

    /**
     * create a line with given parameters
     * @param {HTMLImageElement} img - Image to draw
     * @param {Object} paramObj - Drawing parameter
     * @param {String} paramObj.type - 'line'
     * @param {Dot} paramObj.startPos - Starting position of the line
     * @param {Dot} paramObj.endPos - Ending position of the line
     * @param {Number} paramObj.number - Total dots in the line
     */
    createLine(img, paramObj) {
        this.setDefaultParameter(paramObj);
        let drawPos = new Dot();
        for (let i = 0; i < paramObj.number; i++) {
            drawPos = paramObj.startPos.nthDivDot(paramObj.endPos, i, paramObj.number - paramObj.includeEnd);
            this.createDot(img, drawPos, paramObj.scale);
        }
        this.spin(paramObj, paramObj.spin);
    }

    /**
     * create a circle with given parameters
     * @param {HTMLImageElement} img - Image to draw
     * @param {Object} paramObj - Drawing parameter
     * @param {Dot} paramObj.centerPos - Center position of the star
     * @param {String} paramObj.type - 'circle'
     * @param {Number} paramObj.number - Total number of dots
     * @param {Number} paramObj.radius - Radius of the circle
     * @param {Number} paramObj.angle - Initial angle of rotation
     * @param {Number} [paramObj.scale = 1] - Scale of bullet
     * @param {Vector} [paramObj.normalVector = new Vector(0, 0, 1)] - the normal vector of circle, determines the direction
     */
    createCircle(img, paramObj) {
        this.setDefaultParameter(paramObj);
        let units = paramObj.normalVector.getUnitVectors();
        for (let i = 0; i < paramObj.number; i++) {
            let theta = getAngleDistribution(i, paramObj.number, paramObj.angle),
                drawPos = paramObj.centerPos.translateByUnitVectors(units, paramObj.radius, theta);
            this.createDot(img, drawPos, paramObj.scale);
        }
        this.spin(paramObj, paramObj.spin);
    }

    /**
     * create a polygon with given parameters
     * @param {HTMLImageElement} img - Image to draw
     * @param {Object} paramObj - Drawing parameter
     * @param {String} paramObj.type - 'polygon'
     * @param {Dot} paramObj.centerPos - Center position of the polygon
     * @param {Number} paramObj.side - Side number of the polygon
     * @param {Number} paramObj.numPerSide - Number of dots per side
     * @param {Number} paramObj.radius - Distance from center to vertex
     * @param {Number} paramObj.angle - Initial angle of rotation
     * @param {Number} [paramObj.scale = 1] - Scale of dots
     * @param {Boolean} [paramObj.isStar = false] - Change the polygon to star or not
     */
    createPolygon(img, paramObj) {
        this.setDefaultParameter(paramObj);
        let number; // number of dots in the line
        if (typeof paramObj.numPerSide === 'number') {
            number = paramObj.numPerSide - 1;
        } else if (paramObj.numPerSide instanceof Array){
            if (paramObj.numPerSide.length === paramObj.side) {
                number = paramObj.numPerSide.map(n => n - 1);
            } else {
                throw Error('Length of numPerSide should be exact same with side number');
            }
        } else {
            throw Error(`The value of numPerSide is ${paramObj.numPerSide}`)
        }
        let pos = [],
            paramLine = {
                scale: paramObj.scale,
                includeEnd: false
            };
        let units = paramObj.normalVector.getUnitVectors();
        // store all the vertexes in array pos
        for (let i = 0; i < paramObj.side; i++) {
            let theta = getAngleDistribution(i, paramObj.side, paramObj.angle),
                drawPos = paramObj.centerPos.translateByUnitVectors(units, paramObj.radius, theta);
            pos.push(drawPos);
        }
        //draw every line of polygon
        for (let i = 0; i < paramObj.side; i++) {
            paramLine.number = typeof number === 'number'
                ? number - 1
                : number[i];
            //the length and direction of vector
            paramLine.startPos = pos[i];
            paramLine.endPos = pos[(i + 1 + paramObj.isStar) % paramObj.side];
            this.createLine(img, paramLine);
        }
        this.spin(paramObj, paramObj.spin);
    }

    /**
     * create a star with given parameters
     * @param {HTMLImageElement} img - Image to draw
     * @param {Object} paramObj - Drawing parameter
     * @param {String} paramObj.type - 'star'
     * @param {Dot} paramObj.centerPos - Center position of the star
     * @param {Number} paramObj.side - Side number of the star
     * @param {Number} paramObj.numPerSide - Number of dots per side
     * @param {Number} paramObj.radius - Distance from center to vertex
     * @param {Number} paramObj.angle - Initial angle of rotation
     * @param {Number} [paramObj.scale = 1] - Scale of dots
     * @param {Boolean} [paramObj.fillInner = false] - Fill inner area of star or not
     * @param {Number} [paramObj.concave = 0.5] - Level of concave, from 0 to 1, only valid when fillInner equals false
     */
    createStar(img, paramObj) {
        this.setDefaultParameter(paramObj);
        //if fillInner, call createPolygon
        if (paramObj.fillInner) {
            paramObj.isStar = true;
            this.createPolygon(img, paramObj);
        } else {
            setDefaultValue(paramObj, 'concave', 0.5);
            let //vertex positions
                vertex = [],
                //valley positions
                valley = [],
                //the height from center point to the side of polygon
                valleyRadius = paramObj.radius * cos(PI / paramObj.side) * paramObj.concave,
                //parameters for generating lines
                paramLine = {
                    number: paramObj.numPerSide - 1,
                    scale: paramObj.scale,
                    includeEnd: false
                };
            let units = paramObj.normalVector.getUnitVectors();
            // store all the vertexes and valleys in arrays
            for (let i = 0; i < paramObj.side; i++) {
                let theta = getAngleDistribution(i, paramObj.side, paramObj.angle),
                    vertexDot = paramObj.centerPos.translateByUnitVectors(units, paramObj.radius, theta),
                    valleyTheta = theta + (180 / paramObj.side + paramObj.skew * 360) * NUM_TO_RAD,
                    valleyDot = paramObj.centerPos.translateByUnitVectors(units, valleyRadius, valleyTheta);
                vertex.push(vertexDot);
                valley.push(valleyDot);
            }
            // draw every side of the star
            for (let i = 0; i < paramObj.side; i++) {
                // connect vertex[i] and valley[i]
                paramLine.startPos = vertex[i];
                paramLine.endPos = valley[i];
                this.createLine(img, paramLine);
                // connect valley[i] and vertex[i+1]
                paramLine.startPos = valley[i];
                paramLine.endPos = vertex[(i + 1) % paramObj.side];
                this.createLine(img, paramLine);
            }
            this.spin(paramObj, paramObj.spin);
        }
    }

    /**
     * create a parallelepiped with given center and 3 direction vectors
     * @param {HTMLImageElement} img - Image to draw
     * @param {Object} paramObj - Drawing parameter
     * @param {String} paramObj.type - 'parallelepiped'
     * @param {Dot} paramObj.centerPos - Center coordinate of parallelepiped
     * @param {Number|Array[3]} paramObj.number - Number of dots per side
     * @param {Vector[3]} paramObj.vectors - The direction vectors
     *
     */
    createParallelepiped(img, paramObj) {
        this.setDefaultParameter(paramObj);
        let tokens = [
            [1, 1, 1],
            [-1, 1, 1],
            [-1, -1, 1],
            [1, -1, 1],
            [1, 1, -1],
            [-1, 1, -1],
            [-1, -1, -1],
            [1, -1, -1]
        ];
        let vertexes = [],
            paramLine = [],
            number = paramObj.number instanceof Array ? paramObj.number : [paramObj.number, paramObj.number, paramObj.number],
            vectors = paramObj.vectors;
        for (let i = 0; i < 12; i++) {
            paramLine.push({type: 'line', scale: paramObj.scale});
        }
        //get the coordicates of vertexes
        for (let i = 0; i < 8; i++) {
            vertexes[i] = new Vector();
            vertexes[i].x = vectors[0].x * tokens[i][0] + vectors[1].x * tokens[i][1] + vectors[2].x * tokens[i][2];
            vertexes[i].y = vectors[0].y * tokens[i][0] + vectors[1].y * tokens[i][1] + vectors[2].y * tokens[i][2];
            vertexes[i].z = vectors[0].z * tokens[i][0] + vectors[1].z * tokens[i][1] + vectors[2].z * tokens[i][2];
        }
        //draw two squares
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 2; j += 1) {
                paramLine[i + 4 * j].startPos = paramObj.centerPos.translateByVector(vertexes[i + 4 * j]);
                paramLine[i + 4 * j].endPos = paramObj.centerPos.translateByVector(vertexes[(i + 1) % 4 + 4 * j]);
                if (i % 2 === 0) {
                    paramLine[i + 4 * j].number = number[0] - 1;
                } else {
                    paramLine[i + 4 * j].number = number[1] - 1;
                }
                this.createLine(img, paramLine[i + 4 * j]);
            }
            paramLine[i + 8].startPos = paramObj.centerPos.translateByVector(vertexes[i]);
            paramLine[i + 8].endPos = paramObj.centerPos.translateByVector(vertexes[i + 4]);
            paramLine[i + 8].number = number[2] - 1;
            this.createLine(img, paramLine[i + 8]);
        }
        this.spin(paramObj, paramObj.spin);
    }

    /**
     * change the angle in 3d space
     * @param {Object} - The target shape to be rotated
    //  * @param {(Vector|Number)} - A normal vector for rotation in 3d, or simple number for rotation in 2d.
     */
    spin(paramObj, rotation) {
        //rotate the vectorSrc by vector
        let getRotationVector = function(vectorSrc, vector) {
            return vectorSrc
                .rotate(new Vector(vector.x, 0, 0), abs(vector.x))
                .rotate(new Vector(0, vector.y, 0), abs(vector.y))
                .rotate(new Vector(0, 0, vector.z), abs(vector.z));
        };
        if (arguments[1] instanceof Vector) {
            // 3d rotation
            if (paramObj.hasOwnProperty('vectors')) {
                // for parallelepipeds
                paramObj.vectors = paramObj.vectors.map(item => getRotationVector(item, rotation));
            } else {
                //for simple 3d shapes
                paramObj.normalVector = getRotationVector(paramObj.normalVector, rotation);
                paramObj.angle = (paramObj.angle + rotation.z) % 360;
            }
        } else {
            // 2d rotation
            paramObj.angle = (paramObj.angle + rotation) % 360;
        }
    }

    /**
     * set default parameters
     * @param {Object} - the parameter object
     */
    setDefaultParameter(paramObj) {
        setDefaultValue(paramObj, 'scale', 1);
        setDefaultValue(paramObj, 'spin', 0);
        setDefaultValue(paramObj, 'normalVector', new Vector(0, 0, 1));
        switch(paramObj.type) {
            case 'line':
                setDefaultValue(paramObj, 'includeEnd', false);
                break;
            case 'circle':
                setDefaultValue(paramObj, 'angle', 0);
                break;
            case 'polygon':
                setDefaultValue(paramObj, 'angle', 0);
                setDefaultValue(paramObj, 'isStar', 0);
                break;
            case 'star':
                setDefaultValue(paramObj, 'angle', 0);
                setDefaultValue(paramObj, 'fillInner', false);
                setDefaultValue(paramObj, 'concave', 0.5);
                setDefaultValue(paramObj, 'skew', 0);
                break;
            case 'parallelepiped':
                break;
            default:
                break;
        }
    }
}


const data = {
    circle: [
        {
            type: 'circle',
            centerPos: new Dot(200, 200),
            number: 20,
            radius: 100,
            angle: 0,
            spin: new Vector(0, 0, 1)
        },
        {
            type: 'circle',
            centerPos: new Dot(600, 200),
            number: 24,
            radius: 120,
            angle: 0,
            // normalVector: new Vector(0, 0, 1),
            spin: new Vector(2, 0, 0)
        },
        {
            type: 'circle',
            centerPos: new Dot(1000, 200),
            number: 20,
            radius: 100,
            angle: 0,
            // normalVector: new Vector(0, 0, 1),
            spin: new Vector(0, 1.5, 0)
        },
        {
            type: 'circle',
            centerPos: new Dot(200, 600),
            number: 20,
            radius: 100,
            angle: 0,
            normalVector: new Vector(0, 1, 0.2),
            spin: new Vector(0, 2, 0.4)
        },
        {
            type: 'circle',
            centerPos: new Dot(200, 600),
            number: 20,
            radius: 100,
            angle: 0,
            normalVector: new Vector(1, 0, 0.2),
            spin: new Vector(2, 0, 0.4)
        },
        {
            type: 'circle',
            centerPos: new Dot(600, 600),
            number: 20,
            radius: 100,
            angle: 0,
            scale: 2,
            spin: new Vector(0, 0.7, 1)
        },
        {
            type: 'circle',
            centerPos: new Dot(1000, 600),
            number: 40,
            radius: 100,
            angle: 0,
            scale: 0.5,
            normalVector: new Vector(-0.5, 1, 0.2),
            spin: new Vector(-1, 2, 1.4)
        },
        {
            type: 'circle',
            centerPos: new Dot(1000, 600),
            number: 40,
            radius: 100,
            angle: 0,
            scale: 0.5,
            normalVector: new Vector(1, 0.5, 0.2),
            spin: new Vector(2, 1, 1.4)
        },
    ],
    polygon: [
        {
            type: 'polygon',
            centerPos: new Dot(200, 200),
            side: 4,
            numPerSide: 8,
            radius: 100,
            angle: 0,
            spin: new Vector(0, 0, 1)
        },
        {
            type: 'polygon',
            centerPos: new Dot(600, 200),
            side: 5,
            numPerSide: 8,
            radius: 100,
            angle: 0,
            spin: new Vector(0, 0, -1)
        },
        {
            type: 'polygon',
            centerPos: new Dot(1000, 200),
            side: 3,
            numPerSide: [5, 10, 10],
            radius: 100,
            angle: 30,
            spin: new Vector(0, 0, 1)
        },
        {
            type: 'polygon',
            centerPos: new Dot(200, 600),
            side: 5,
            numPerSide: 8,
            radius: 100,
            angle: 0,
            spin: new Vector(0, 0, 1)
        },
        {
            type: 'polygon',
            centerPos: new Dot(600, 600),
            side: 6,
            numPerSide: 15,
            radius: 200 / sqrt(3),
            angle: 30,
            scale: 0.5,
            spin: new Vector(1, 0, 1)
        },
        {
            type: 'polygon',
            centerPos: new Dot(600, 600),
            side: 6,
            numPerSide: 15,
            radius: 100,
            angle: 0,
            scale: 0.5,
            spin: new Vector(1, 0, 1)
        },
        {
            type: 'polygon',
            centerPos: new Dot(600, 600),
            side: 6,
            numPerSide: 15,
            radius: 50 * sqrt(3),
            angle: 30,
            scale: 0.5,
            spin: new Vector(1, 0, 1)
        },
        {
            type: 'polygon',
            centerPos: new Dot(1000, 600),
            side: 12,
            numPerSide: 16,
            scale: 0.3,
            radius: 160,
            angle: 0,
            spin: new Vector(0, 0, 1)
        }
    ],
    star: [
        {
            type: 'star',
            centerPos: new Dot(200, 200),
            side: 6,
            numPerSide: 16,
            radius: 100,
            angle: 30,
            fillInner: true,
            spin: new Vector(0, 2, 0)
        },
        {
            type: 'star',
            centerPos: new Dot(600, 200),
            side: 5,
            numPerSide: 5,
            concave: 0.8,
            radius: 100,
            angle: 0,
            spin: new Vector(0, 0, 2)
        },
        {
            type: 'star',
            centerPos: new Dot(1000, 200),
            side: 5,
            numPerSide: 5,
            concave: 0.3,
            radius: 100,
            angle: 0,
            spin: new Vector(0, 0, 2)
        },
        {
            type: 'star',
            centerPos: new Dot(200, 600),
            side: 5,
            numPerSide: 5,
            skew: 1.1,
            radius: 100,
            angle: 0,
            spin: new Vector(0, 0, 2)
        },
        {
            type: 'star',
            centerPos: new Dot(600, 600),
            side: 6,
            concave: 0.707,
            numPerSide: 6,
            radius: 100,
            angle: 0,
            scale: 0.5,
            spin: new Vector(0, 0, 2)
        },
        {
            type: 'star',
            centerPos: new Dot(1000, 600),
            side: 4,
            numPerSide: 5,
            radius: 100,
            angle: 0,
            spin: new Vector(2, 0, 2)
        },
    ],
    parallelepiped: [
        {
            type: 'parallelepiped',
            centerPos: new Dot(200, 200, 0),
            number: [10, 10, 10],
            vectors: [new Vector(70, 0, 0), new Vector(0, 70, 0), new Vector(0, 0, 70)],
            spin: new Vector(1, 1, 1)
        },
        {
            type: 'parallelepiped',
            centerPos: new Dot(600, 200, 0),
            number: [10, 10, 10],
            vectors: [new Vector(50, 0, 0), new Vector(0, 100, 0), new Vector(0, 0, 100)],
            spin: new Vector(1, 1, 1)
        },
        {
            type: 'parallelepiped',
            centerPos: new Dot(1000, 200, 0),
            number: [10, 10, 10],
            vectors: [new Vector(40, 30, 0), new Vector(-30, 70, 0), new Vector(0, 0, 70)],
            spin: new Vector(1, 1, 1)
        },
        {
            type: 'parallelepiped',
            centerPos: new Dot(200, 600, 0),
            number: [10, 16, 10],
            vectors: [new Vector(50, 0, 0), new Vector(0, 80, 0), new Vector(0, 0, 50)],
            spin: new Vector(1, 1, 1)
        },
        {
            type: 'parallelepiped',
            centerPos: new Dot(600, 600, 0),
            number: [10, 20, 24],
            scale: 0.5,
            vectors: [new Vector(30, 40, 0), new Vector(-60, 80, 0), new Vector(0, 0, 120)],
            spin: new Vector(1, 1, 1)
        },
        {
            type: 'parallelepiped',
            centerPos: new Dot(1000, 600, 0),
            number: [10, 10, 10],
            vectors: [new Vector(70, 0, 0), new Vector(0, 70, 0), new Vector(0, 0, 70)],
            spin: new Vector(-1, -1, -1)
        },
    ]
};

window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

const keys = Object.keys(data);
let currentIndex = 3;
let currentData = data[keys[currentIndex]];
canvas.addEventListener('click', function(){
    currentIndex = (currentIndex + 1) % keys.length;
    currentData = data[keys[currentIndex]];
});

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalCompositeOperation = 'lighter';
    imagePreload("./img/sprBullet.png", function() {
        const pat = new Pattern();
        currentData.forEach((data) => {
            switch(data.type) {
                case 'line':
                    pat.createLine(this, data);
                    break;
                case 'circle':
                    pat.createCircle(this, data);
                    break;
                case 'polygon':
                    pat.createPolygon(this, data);
                    break;
                case 'star':
                    pat.createStar(this, data);
                    break;
                case 'parallelepiped':
                    pat.createParallelepiped(this, data);
                    break;
                default:
                    break;
            }
        });
    });
    window.requestAnimFrame(draw);
}

draw();

})(this);
