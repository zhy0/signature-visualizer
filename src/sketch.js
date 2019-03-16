const plot = require('./plotter');

var sketch = function(p) {
    p.mouseData = [];
    p.renew = false;
    p.bgColor = 240;
    p.xmax = Math.min(p.displayWidth-64, 768);
    p.ymax = Math.min(p.displayHeight/2, 480);

    p.setup = function() {
        p.canvas = p.createCanvas(p.xmax, p.ymax);
        p.frameRate(24);
        p.reset();
    }

    p.mouseDragged = function() {
        // prevent scrolling
        if (p.isInside()) {
            return false;
        }
    }

    p.isInside = function() {
        return p.mouseX >= 0 && p.mouseX <= p.xmax &&
               p.mouseY >= 0 && p.mouseY <= p.ymax;
    }

    p.draw = function() {
        if (p.mouseIsPressed && p.isInside()) {
            if (p.renew) {
                p.reset()
            }
            p.line(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
            p.renew = false;
            p.mouseData.push(p.transformCoordinates(p.mouseX, p.mouseY));
        }
    }

    p.reset = function() {
        p.background(p.bgColor);
        p.mouseData = [];
    }

    p.mouseReleased = function() {
        p.renew = true;
        plot.plotSig(p.mouseData, level=5);
    }

    p.transformCoordinates = function(x, y) {
        // scale numbers and rotate to usual coordinate chart
        return [x/100, (p.ymax - y)/100];
    }
}

new p5(sketch, 'canvasContainer');
