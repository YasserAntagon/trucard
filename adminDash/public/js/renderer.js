var options = {
    value: 1.0,
    size: 200,
    startAngle: -Math.PI, 
    startColor: '#dd2c00',
    endColor: '#d84315',
    animation: {
        duration: 3000,
        easing: 'circleProgressEase'
    }
};

$.easing.circleProgressEase = function(x, t, b, c, d) {
    if ((t /= d / 2) < 1)
        return c / 2 * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t + 2) + b;
};

var s = options.size,  // square size
    v = options.value, // current value: from 0.0 to 1.0
    r = s / 2,         // radius
    t = s / 14;        // thickness

// Prepare canvas
var canvas = $('#canvas')[0];

canvas.width = s;
canvas.height = s;
var ctx = canvas.getContext('2d');
var lg = ctx.createLinearGradient(0, 0, s, 0);
lg.addColorStop(0, options.startColor);
lg.addColorStop(1, options.endColor);
ctx.fillStyle = "rgba(0, 0, 0, .1)";

// Draw circle
if (options.animation)
    _drawAnimated(v);
else
    _draw(v);

/* $('.number').click(function() {
    if (options.animation)
        _drawAnimated(v);
    else
        _draw(v);
}); */

function _draw(p) {
    // Clear frame
    ctx.clearRect(0, 0, s, s);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(r, r, r, -Math.PI, Math.PI);
    ctx.arc(r, r, r - t, Math.PI, -Math.PI, true);
    ctx.closePath();
    ctx.fill(); // gray fill

    // Draw progress arc
    ctx.beginPath();
    ctx.arc(r, r, r, -Math.PI, -Math.PI + Math.PI * 2 * p);
    ctx.arc(r, r, r - t, -Math.PI + Math.PI * 2 * p, -Math.PI, true);
    ctx.closePath();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, s, s); // gradient fill
    ctx.restore();
}

function _drawAnimated(v) {
  $(canvas).stop(true, true).css({ value: 0 }).animate({ value: v }, $.extend({}, options.animation, {
        step: function(p) {
            _draw(p);
            $(canvas).trigger('circle-animation-progress', [p / v, p]);
        },

        complete: function() {
            $(canvas).trigger('circle-animation-end');
        }
    }));
}

// now let's animate numbers
/* var valEl = $('.value');
valEl.data('origVal', valEl.text());
$(canvas).on('circle-animation-progress', function(e, progress) {
  valEl.text(parseInt(valEl.data('origVal') * progress))
}); */