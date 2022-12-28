// Make an instance of two and place it on the page.
var params = {
  fullscreen: true
};
var elem = document.body;
var two = new Two(params).appendTo(elem);

var side = 20;
var iterations = 100;
const pi = Math.PI;
const pi2 = pi / 2;
const pi3 = pi / 3;

var x0 = two.width / 2;
var y0 = two.height / 2;


nodeMap = {};

function euclideanRadius(x) {
    var dx = x[0] + Math.sqrt(3) * x[1];
    var dy = x[2] + Math.sqrt(3) * x[3];
    return Math.sqrt(dx * dx + dy * dy);
}

function remainingAngle(n) {
    return 12 - n.squares * 3 - n.triangles * 2;
}

const comparator = (a, b) => euclideanRadius(a.x) - euclideanRadius(b.x);
nodeHeap = new MinHeap(comparator);
forcedHeap = new MinHeap(comparator);

// random int r: a <= r < b
function randomInt(a, b) {
    var r = a + Math.floor(Math.random() * (b - a));
    return r;
}

// shuffle an array
function shuffle(a) {
    for (var i = 0;i < a.length;i++) {
        var j = randomInt(i, a.length);
        t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
}

const direction = [
    [2, 0, 0, 0],
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 0, 2, 0],
    [-1, 0, 0, 1],
    [0, -1, 1, 0],
    [-2, 0, 0, 0],
    [0, -1, -1, 0],
    [-1, 0, 0, -1],
    [0, 0, -2, 0],
    [1, 0, 0, -1],
    [0, 1, -1, 0]
];

function move(x, angle) {
    var d = direction[angle];
    return [x[0] + d[0], x[1] + d[1], x[2] + d[2], x[3] + d[3]];
}


function drawText(t, x) {
    p = two.makeText(t,
        x0 + side * (x[0] + x[1] * Math.sqrt(3)),
        y0 - side * (x[2] + x[3] * Math.sqrt(3)));
}

function drawLine(x1, x2) {
    p = two.makeLine(
        x0 + side * (x1[0] + x1[1] * Math.sqrt(3)),
        y0 - side * (x1[2] + x1[3] * Math.sqrt(3)),
        x0 + side * (x2[0] + x2[1] * Math.sqrt(3)),
        y0 - side * (x2[2] + x2[3] * Math.sqrt(3)));
}

function drawCircle(x, color) {
    p = two.makeCircle(
        x0 + side * (x[0] + x[1] * Math.sqrt(3)),
        y0 - side * (x[2] + x[3] * Math.sqrt(3)),
        side/8);
    p.fill = color;
    p.stroke = color;
}

uuid = 1;
label = 1;
class Node {
    constructor(x, angle) {
        this.id = uuid++;
        this.x = x;
        this.angle = angle;
        this.squares = 0;
        this.triangles = 0;
    }

    makeGuidedShapes(shapes) {
        console.log("show", this);
        var angle = this.angle;
        for (var i = 0;i < shapes.length;i++) {
            this.makePolygon(angle, shapes[i]);
            angle = (angle + shapes[i]) % 12;
        }
    }

    makeShapes() {
        if (this.squares >= 2 && this.triangles >= 3) {
            return true;
        }

        console.log("finish", this);

        var firstShape = [];
        for (var i = 2;i <= 3;i++) {
            if (this.tryPolygon(this.angle, i)) {
                firstShape.push(i);
            }
        }
        var lastShape = [];
        if (this.squares + this.triangles < 4) {
            for (var i = 2;i <= 3;i++) {
                if (this.tryPolygon((this.angle  + 24 - 3 * this.squares - 2 * this.triangles - i) % 12, i)) {
                    lastShape.push(i);
                }
            }
        }
        else {
            lastShape = [2, 3];
        }
        console.log("check", firstShape, lastShape);
        if (firstShape.length == 1) {
            if (firstShape[0] == 2) {
                this.triangles++;
            }
            else {
                this.squares++;
            }
        }
        if (lastShape.length == 1) {
            if (lastShape[0] == 2) {
                this.triangles++;
            }
            else {
                this.squares++;
            }
        }

        if (this.squares > 2 || this.triangles > 3 || firstShape.length == 0 || lastShape.length == 0) {
            console.log("Fault", this);
            drawCircle(this.x, "red");
            return false;
        }

        var shapes = [];
        for (var i = 0;i < 2 - this.squares;i++) {
            shapes.push(3);
        }
        for (var i = 0;i < 3 - this.triangles;i++) {
            shapes.push(2);
        }
        shuffle(shapes);
        if (firstShape.length == 1) {
            shapes.unshift(firstShape[0]);
        }
        if (lastShape.length == 1) {
            shapes.push(lastShape[0]);
        }
        this.squares = 2;
        this.triangles = 3;

        var angle = this.angle;
        for (var i = 0;i < shapes.length;i++) {
            this.makePolygon(angle, shapes[i]);
            angle = (angle + shapes[i]) % 12;
        }
        drawText(label++ + '-' + this.id, this.x);
        return true;
    }

    mark(angle, shape) {
        if (this.angle == angle) {
            this.angle = (this.angle + shape) % 12;
        }
        if (shape == 3) {
            this.squares += 1;
        }
        else {
            this.triangles += 1;
        }
        if (this.squares >= 2 || this.triangles >= 3) {
            forcedHeap.push(this);
            drawCircle(this.x, "orange");
        }
    }

    checkLine(x, angle, n) {
        var fwd = x;
        var bwd = x;
        var points = 1;
        for (var i = 0;i < n;i++) {
            fwd = move(fwd, angle);
            if (i > 0 && !nodeMap[fwd]) {
                break;
            }
            points++;
        }
        for (var i = 0;i < n;i++) {
            bwd = move(bwd, (angle + 6) % 12);
            if (!nodeMap[bwd]) {
                break;
            }
            points++;
        }
        return points <= n;
    }

    tryPolygon(angle, shape) {
        var x = this.x;
        for (var i = 0;i <= shape;i++) {
            if (!this.checkLine(x, angle, 3)) {
                return false;
            }
            var n = nodeMap[x];
            if (n && shape == 2 && n.triangles >= 3) {
                return false;
            }
            if (n && shape == 3 && n.squares >= 2) {
                return false;
            }
            x = move(x, angle);
            angle = (angle + 6 - shape) % 12;
        }
        //console.log("allow", angle, shape);
        return true;
    }

    makePolygon(angle, shape) {
        var x1 = this.x;
        for (var i = 0;i < shape;i++) {
            var x2 = move(x1, angle);
            if (nodeMap[x2] == undefined) {
                nodeMap[x2] = new Node(x2, (angle + 6) % 12);
                nodeHeap.push(nodeMap[x2]);
            }
            angle = (angle + 6 - shape) % 12;
            nodeMap[x2].mark(angle, shape);
            drawLine(x1, x2);
            x1 = x2;
            console.log("touch", nodeMap[x2]);
        }
    }

}

nodeHeap.push(new Node([0, 0, 0, 0], 0));
for (var i = 0;i < iterations;i++) {
    var node = forcedHeap.length > 0 ? forcedHeap.pop() : nodeHeap.pop();
    if (!node.makeShapes()) {
        break;
    }
}

var pieces = [
    [
        [[0, 0, 0, 0], [2, 2, 3, 2, 3]],
    ],
    [
        [[0, 0, 0, 0], [2, 2, 2, 3, 3]],
        [[0, 0, -2, 0], [2, 2, 2]],
        [[2, 0, 0, 0], [2, 2, 3]],
        [[1, 0, 0, 1], [2, 3]],
        [[-1, 0, 0, 1], [2, 3]],
        [[-2, 0, 0, 0], [2, 2]],
        [[-2, 0, -2, 0], [2, 3]],
        [[-1, 0, -2, -1], [2, 3]],
        [[1, 0, -2, -1], [2, 3]],
        [[2, 0, -2, 0], [2]],
        [[2, 1, -1, 0], [3, 3]],
        [[-2, -1, -1, 0], [3, 3]],
        [[2, 1, 1, 0], [2, 2]],
        [[-2, -1, 1, 0], [2, 2]],
        [[-2, -1, -3, 0], [2, 2]],
        [[2, 1, -3, 0], [2, 2]],
        [[4, 1, -1, 0], [2, 2, 2]],
        [[-4, -1, -1, 0], [2, 2, 2]],
    ],
    [
        [[0, 0, 0, 0], [2, 2, 2, 3, 3]],
        [[0, 0, -2, 0], [2, 2, 2]],
        [[2, 0, 0, 0], [2, 3, 2]],
        [[2, 0, -2, 0], [2, 3]],
        [[-2, 0, 0, 0], [3, 2, 2]],
        [[-2, 0, -2, 0], [2, 3]],
        [[1, 0, 0, 1], [3, 3]],
        [[1, 0, -2, -1], [3, 3]],
        [[-2, -1, -1, 0], [3, 3]],
        [[3, 0, 0, 1], [2, 2]],
        [[1, 0, 2, 1], [2, 2, 2]],
        [[-1, 0, 0, 1], [2]],
        [[-2, -1, 1, 0], [2, 2]],
        [[-4, -1, -1, 0], [2, 2, 2]],
        [[-2, -1, -3, 0], [2, 2]],
        [[-1, 0, -2, -1], [2]],
        [[1, 0, -4, -1], [2, 2, 2]],
        [[3, 0, -2, -1], [2, 2]],
        [[2, 1, -1, 0], [2, 2]],
    ],
];

/*
for (var i = 0;i < pieces.length;i++) {
    x0 = (i % 4) * two.width / 4 + two.width / 8;
    y0 = Math.floor(i / 4) * two.height / 4 + two.height / 8;
    nodeMap = {};
    nodeMap[pieces[i][0][0]] = new Node(pieces[i][0][0], 0);
    for (var j = 0;j < pieces[i].length;j++) {
        nodeMap[pieces[i][j][0]].makeGuidedShapes(pieces[i][j][1]);
    }
}*/

// Don’t forget to tell two to draw everything to the screen
two.update();
