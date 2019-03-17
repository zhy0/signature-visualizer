const core = require('mathjs/core');
const math = core.create();
math.import(require('mathjs/lib/header'));
math.import(require('mathjs/lib/type/matrix'));
math.import(require('mathjs/lib/function/arithmetic/add'));
math.import(require('mathjs/lib/function/arithmetic/subtract'));
math.import(require('mathjs/lib/function/arithmetic/multiply'));
math.import(require('mathjs/lib/function/arithmetic/divide'));
math.import(require('mathjs/lib/function/arithmetic/norm'));
math.import(require('mathjs/lib/function/matrix/size'));
math.import(require('mathjs/lib/function/matrix/zeros'));
math.import(require('mathjs/lib/function/matrix/map'));
math.import(require('mathjs/lib/function/matrix/flatten'));
math.import(require('mathjs/lib/function/probability/factorial'));
math.import(require('mathjs/lib/function/statistics/prod'));


/**
 * Compute the tensor product of two tensors.
 *
 * @param {Array | number} A
 * @param {Array | number} B
 * @returns {Array | number}
 */
function tensorProduct(A, B) {
    if (!Array.isArray(A)) {
        return math.multiply(A, B);
    }
    return math.map(A, function(x) {
        return math.multiply(B, x);
    })
}

/**
 * Compute the nth tensor power of a tensor.
 *
 * @param {Array | number} A - The tensor
 * @param {number} n - The exponent
 * @returns {Array | number}
 */
function tensorPow(A, n) {
    if (n == 0) {
        return 1;
    }
    return tensorProduct(A, tensorPow(A, n-1));
}


/**
 * Convert flat (1D) index to index array, given a tensor shape.
 *
 * @param {number} m - A nonnegative integer
 * @param {Array} shape - The shape of the target tensor
 * @returns {Array} An array of same length as shape
 */
function intToIndex(m, shape) {
    var p = math.prod(shape);
    if (m >= p) {
        throw new RangeError('Integer '+ m +' is out of bounds with size ' + p);
    }
    if (shape.length == 1) {
        return m;
    }
    var n = shape[shape.length - 1];
    return math.flatten([intToIndex(Math.floor(m/n), shape.slice(0,-1)), m % n]);
}

/**
 * Convert index array of a tensor to its flat index.
 *
 * @param {Array} index - Indices to convert
 * @param {Array} shape - The shape of the tensor
 * @returns {number} A nonnegative integer
 */
function indexToInt(index, shape) {
    if (index.length != shape.length) {
        throw new RangeError('Index must have same length as shape');
    }

    if (index.length == 1) {
        return index[0];
    }
    var i = index[index.length-1];
    var n = shape[shape.length-1];
    return indexToInt(index.slice(0,-1), shape.slice(0,-1)) * n + i;
}

/**
 * Convert index array of a tensor.
 *
 * @param {Array} index - Indices to convert
 * @param {Array} shape1 - The shape of the input tensor
 * @param {Array} shape2 - The shape of the target tensor
 * @returns {Array} An index array representing the index of the target tensor
 */
function reindex(index, shape1, shape2) {
    if (index.length != shape1.length) {
        throw new RangeError('Dimensions do not match');
    }
    var p1 = math.prod(shape1);
    var p2 = math.prod(shape2);
    if (p1 != p2) {
        throw new RangeError('Shape ('+shape1+') is not compatible with ('+shape2+')');
    }
    return intToIndex(indexToInt(index, shape1), shape2);
}

/**
 * Compute the length of a piecewise linear path.
 *
 * @param {Array} X - A two-dimensional (N * d) array, a list of points
 * @returns {number} The length of the path
 */
function pathLength(X) {
    var r = 0;
    var N = X.length;
    for (var i = 0; i < N-1; i++) {
        var dX = math.subtract(X[i+1], X[i]);
        r += math.norm(dX);
    }
    return r;
}

/**
 * Compute the signature of a piecewise linear path.
 *
 * @param {Array} X - A two-dimensional (N * d) array, a list of points
 * @param {number} n - The truncation level
 * @returns {Array} An array of arrays of shape [1, d, d*d, d*d*d, ... ]
 */
function sig(X, n) {
    var shape = math.size(X);
    if (shape.length != 2) {
        throw new RangeError('Path must be an N by d matrix');
    }

    var N = shape[0]; // number of points
    var d = shape[1]; // dimension of path
    if (d <= 0) {
        throw new RangeError('Path must have positive dimension');
    }

    if (N == 1) {
        return sig([X[0], X[0]], n); } var A = math.zeros([N-1, n + 1]);

    // compute signature of increments
    for (var i = 0; i < N-1; i++) {
        var dX = math.subtract(X[i+1], X[i]);
        for (var k = 0; k < n + 1; k++) {
            A[i][k] = math.divide(
                tensorPow(dX, k),
                math.factorial(k)
            );
        }
    }

    // accumulate signature of path using Chen's identity
    var B = math.zeros([N-1, n + 1]);
    B[0] = A[0];
    for (var i = 1; i < N-1; i++) {
        B[i][0] = 1;
        for (var k = 1; k < n + 1; k++) {
            var temp = math.zeros(math.size(B[i-1][k]));
            for (var l = 0; l <= k; l++) {
                temp = math.add(temp,
                    tensorProduct(B[i-1][l], A[i][k-l])
                )
            }
            B[i][k] = temp;
        }
    }
    return B[N-2];
}

exports.tensorProduct = tensorProduct
exports.tensorPow = tensorPow
exports.sig = sig
exports.pathLength = pathLength
exports.indexToInt = indexToInt
exports.intToIndex = intToIndex
exports.reindex = reindex
