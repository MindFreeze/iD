iD.util = {};

iD.util._counters = {};

iD.util.id = function(counter) {
    counter = counter || 'default';
    if (!iD.util._counters[counter]) iD.util._counters[counter] = 0;
    return counter[0] + (--iD.util._counters[counter]);
};

iD.util.trueObj = function(arr) {
    var o = {};
    for (var i = 0, l = arr.length; i < l; i++) o[arr[i]] = true;
    return o;
};

iD.util.friendlyName = function(entity) {
    // Generate a string such as 'river' or 'Fred's House' for an entity.
    if (!entity.tags || !Object.keys(entity.tags).length) { return ''; }

    var mainkeys = ['highway','amenity','railway','waterway'],
        n = [];

    if (entity.tags.name) n.push(entity.tags.name);
    if (entity.tags.ref) n.push(entity.tags.ref);

    if (!n.length) {
        for (var k in entity.tags) {
            if (mainkeys.indexOf(k) !== -1) {
                n.push(entity.tags[k]);
                break;
            }
        }
    }

    return n.length === 0 ? 'unknown' : n.join('; ');
};

iD.util.codeWindow = function(content) {
    top.win = window.open('','contentWindow',
        'width=350,height=350,menubar=0' +
        ',toolbar=1,status=0,scrollbars=1,resizable=1');
    top.win.document.writeln('<pre>' + content + '</pre>');
    top.win.document.close();
};

iD.util.tagText = function(entity) {
    return d3.entries(entity.tags).map(function(e) {
        return e.key + ': ' + e.value;
    }).join('\n');
};

iD.util.qsString = function(obj) {
    return Object.keys(obj).sort().map(function(key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
    }).join('&');
};

iD.util.prefix = function() {
    return (function prefixMatch(p) { // via mbostock
        var i = -1, n = p.length, s = document.body.style;
        while (++i < n) if (p[i] + 'Transform' in s) return '-' + p[i].toLowerCase() + '-';
        return '';
    })(['webkit', 'ms', 'Moz', 'O']);
};

iD.util.geo = {};

iD.util.geo.roundCoords = function(c) {
    return [Math.floor(c[0]), Math.floor(c[1])];
};

iD.util.geo.interp = function(p1, p2, t) {
    return {
        lon: p1.lon + (p2.lon - p1.lon) * t,
        lat: p1.lat + (p2.lat - p1.lat) * t
    };
};

iD.util.geo.dist = function(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) +
        Math.pow(a[1] - b[1], 2));
};

iD.util.geo.nodeIntersect = function(entity, extent) {
    return entity.lon > extent[0][0] &&
        entity.lon < extent[1][0] &&
        entity.lat < extent[0][1] &&
        entity.lat > extent[1][1];
};

iD.util.geo.chooseIndex = function(way, point, map) {
    var dist = iD.util.geo.dist;
    var projNodes = way.nodes.map(function(n) {
        return map.projection([n.lon, n.lat]);
    });
    for (var i = 0, changes = []; i < projNodes.length - 1; i++) {
        changes[i] =
            (dist(projNodes[i], point) + dist(point, projNodes[i + 1])) /
            dist(projNodes[i], projNodes[i + 1]);
    }
    return _.indexOf(changes, _.min(changes)) + 1;
};
