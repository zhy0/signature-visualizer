const sig = require('./signature');
const chroma = require('chroma-js');

const core = require('mathjs/core');
const math = core.create();
math.import(require('mathjs/lib/type/matrix'));
math.import(require('mathjs/lib/function/matrix/reshape'));
math.import(require('mathjs/lib/function/probability/factorial'));
math.import(require('mathjs/lib/function/arithmetic/add'));

function round(x, n=3) {
    var e = Math.pow(10, n);
    return Math.round(x*e)/e;
}

function colorFunction(path) {
    function color(x, level) {
        var norm = sig.pathLength(path);
        return 0.5 - math.factorial(level) * x /(2*Math.pow(norm,level));
    }
    return color;
}


function plotSig(data, level=5, container="signature") {
    // clear previous results
    var cont = document.getElementById(container);
    cont.innerHTML = '';

    var grid_mobile = {
        1: "pure-u-1-5",
        2: "pure-u-2-5",
        3: "pure-u-2-5",
        4: "pure-u-1-2",
        5: "pure-u-1-2",
    }

    var grid_desktop = {
        1: "pure-u-lg-1-8",
        2: "pure-u-lg-1-6",
        3: "pure-u-lg-1-6",
        4: "pure-u-lg-1-4",
        5: "pure-u-lg-1-4",
    }

    var S = sig.sig(data, level);
    for (var i = 1; i <= level; i++) {
        var outer = document.createElement('div');
        var inner = document.createElement('div');

        outer.id = "level" + i;
        outer.classList.add(grid_mobile[i]);
        outer.classList.add(grid_desktop[i]);
        inner.classList.add("table-wrap");
        // add title
        var title = document.createElement('h3');
        title.appendChild(document.createTextNode('S'+i));
        inner.appendChild(title);
        outer.appendChild(inner);
        document.getElementById(container).append(outer);
        // matrix dimensions
        var shape = [Math.pow(2, Math.ceil(i/2)),
                     Math.pow(2, Math.floor(i/2))];
        drawTable(math.reshape(S[i], shape), inner, colorFunction(data));
    }
}


function drawTable(data, container, colorfn=function(x){return -x/20 + 0.5}) {
    var table = document.createElement('table');
    var tbody = document.createElement('tbody');

    // current signature level
    var level = Math.log2(data.length * data[0].length);

    var scale = chroma.scale('RdYlBu').padding(-0.15);

    for (var i = 0; i < data.length; i++) {
        var row = document.createElement('tr');
        for (var j = 0; j < data[i].length; j++) {
            var cell = document.createElement('td');
            // set table cell background color
            var bg = scale(colorfn(data[i][j],level));
            cell.style.backgroundColor = bg;
            // determine font color based on contrast
            var fg = chroma.contrast(bg, 'white') > chroma.contrast(bg, 'black') ? 'white' : 'black';
            cell.style.color = fg;

            // add index of original tensor
            var index = math.add(1, sig.reindex(
                [i,j],
                [data.length, data[i].length],
                new Array(level).fill(2, 0, level) // [2,2,2,...]
            ));
            tippy(cell, {content: index, arrow: true});

            // add wrapping div to cell content
            var div = document.createElement('div');
            div.classList.add("sig-entry")
            div.appendChild(document.createTextNode(round(data[i][j],3)));
            cell.appendChild(div);
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }
    table.appendChild(tbody);
    container.appendChild(table);
}


exports.plotSig = plotSig
