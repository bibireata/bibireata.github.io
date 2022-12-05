// Make an instance of two and place it on the page.
var params = {
  fullscreen: true
};
var elem = document.body;
var two = new Two(params).appendTo(elem);

var side = 20;
var iterations = 20;
const pi = Math.PI;
const pi2 = pi / 2;
const pi3 = pi / 3;

nodeMap = {};
border = [];
border2 = [];

function euclideanRadius(x) {
    var dx = x[0] + Math.sqrt(3) * x[1];
    var dy = x[2] + Math.sqrt(3) * x[3];
    return Math.sqrt(dx * dx + dy * dy);
}

function remainingAngle(n) {
    return 12 - n.squares * 3 - n.triangles * 2;
}

const nodeComparator = (a, b) => remainingAngle(a) - remainingAngle(b);
nodeHeap = new heap.Heap();

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

function drawLine(x1, x2) {
    var x0 = two.width / 2;
    var y0 = two.height / 2;
    p = two.makeLine(
        x0 + side * (x1[0] + x1[1] * Math.sqrt(3)),
        y0 + side * (x1[2] + x1[3] * Math.sqrt(3)),
        x0 + side * (x2[0] + x2[1] * Math.sqrt(3)),
        y0 + side * (x2[2] + x2[3] * Math.sqrt(3)));
}

class Node {
    constructor(x, angle) {
        this.x = x;
        this.angle = angle;
        this.squares = 0;
        this.triangles = 0;
    }

    makeShapes() {
        var shapes = [];
        if (this.squares > 2) {
            for (var i = 0;i < 4 - this.squares;i++) {
                shapes.push(3);
            }
            this.squares = 4;
        }
        else if (this.triangles > 3) {
            for (var i = 0;i < 6 - this.squares;i++) {
                shapes.push(2);
            }
            this.triangles = 6;
        } 
        else {
            for (var i = 0;i < 2 - this.squares;i++) {
                shapes.push(3);
            }
            for (var i = 0;i < 3 - this.triangles;i++) {
                shapes.push(2);
            }
            this.squares = 2;
            this.triangles = 3;
        }
        if (this.squares*3+this.triangles*2 > 12) {
            console.log("Fault", this);
        }
        shuffle(shapes);
        var angle = this.angle;
        for (var i = 0;i < shapes.length;i++) {
            this.makePolygon(angle, shapes[i]);
            angle = (angle + shapes[i]) % 12;
        }
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
        }
    }

}

nodeHeap.push(new Node([0, 0, 0, 0], 0));
for (var i = 0;i < iterations;i++) {
    var node = nodeHeap.pop();
    console.log(remainingAngle(node));
    node.makeShapes();
}


/*var s_radius = side * Math.sqrt(2) / 2;
var t_radius = side * (Math.sqrt(3) - 1 / Math.sqrt(3)) / 2;
var t_offset = side * (1 + 1 / Math.sqrt(3)) / 2;

var s = two.makePolygon(0, 0, s_radius, 4);
var t1 = two.makePolygon(t_offset, 0, t_radius, 3);
var t2 = two.makePolygon(0, t_offset, t_radius, 3);
var t3 = two.makePolygon(-t_offset, 0, t_radius, 3);
var t4 = two.makePolygon(0, -t_offset, t_radius, 3);

t1.rotation = pi / 2;
t3.rotation = -pi / 2;
t2.rotation = pi;


var star = two.makeGroup(s, t1, t2, t3, t4)

var net = two.makeGroup(star);
net.position.set(two.width / 2, two.height / 2);

var star2 = star.clone(net);
star2.position.set(side * (3 + Math.sqrt(3)) / 4, -side * (1 + Math.sqrt(3)) / 4);
star2.rotation = pi / 6;

var star3 = star.clone(net);
star3.position.set(side * (3 + Math.sqrt(3)) / 4, side * (1 + Math.sqrt(3)) / 4);
star3.rotation = -pi / 6;

var star4 = star.clone(net);
star4.position.set(-side * (1 + Math.sqrt(3)) / 4, -side * (3 + Math.sqrt(3)) / 4);
star4.rotation = pi / 2 + pi / 6;

var star4 = star.clone(net);
star4.position.set(-side * (1 + Math.sqrt(3)) / 4, side * (3 + Math.sqrt(3)) / 4);
star4.rotation = - pi / 2 - pi / 6;

var star5 = star.clone(net);
star5.position.set(side / 2, side * (2 + Math.sqrt(3)) / 2);

var star6 = star.clone(net);
star6.position.set(side / 2, -side * (2 + Math.sqrt(3)) / 2);*/

/*var x0 = 400;
var y0 = 300;
for (var i = 0;i < 12;i++) {
    var x1 = x0 + side * Math.cos(i * pi / 6);
    var y1 = y0 + side * Math.sin(i * pi / 6);
    two.makeLine(x0, y0, x1, y1);
    for (var j = 0;j < 12;j++) {
        var x2 = x1 + side * Math.cos(j * pi / 6);
        var y2 = y1 + side * Math.sin(j * pi / 6);
        two.makeLine(x1, y1, x2, y2);
        for (var k = 0;k < 12;k++) {
            var x3 = x2 + side * Math.cos(k * pi / 6);
            var y3 = y2 + side * Math.sin(k * pi / 6);
            two.makeLine(x2, y2, x3, y3);
            for (var l = 0;l < 12;l++) {
                var x4 = x3 + side * Math.cos(l * pi / 6);
                var y4 = y3 + side * Math.sin(l * pi / 6);
                two.makeLine(x3, y3, x4, y4);
                for (var m = 0;m < 12;m++) {
                    var x5 = x4 + side * Math.cos(m * pi / 6);
                    var y5 = y4 + side * Math.sin(m * pi / 6);
                    two.makeLine(x4, y4, x5, y5);
                }
            }
        }
    }
}*/

// Don’t forget to tell two to draw everything to the screen
two.update();
