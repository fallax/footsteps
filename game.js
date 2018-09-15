var settings =
{
    gridsize: 100,
    mapWidth: 50,
    mapHeight: 50,
    maxDraw: 40,
    soundAnimationLength: 75,
    explosionAnimationLength: 15,
    searchSpeed: 0.015,
    turnSpeed: 0.1,
    walkSpeed: 5,
    walkVolume: 300,
    crawlSpeed: 2,
    crawlVolume: 45,
    backSpeed: -2.5,
    arrowSpread: 0.05,
    arrowVelSpread: 5,
    arrowReload: 50,
    grenadeVelSpread: 2,
    grenadeSpread: 0.25,
    reactionTime: 20,
    entities: 
    {
        grunt: { speed: 3, searchTime: 2500, reload: 100 },
        arrow: { speed: 25 },
        grenade: { speed: 15, timer: 200 },
        rubble: { speed: 15 }
    }
};

var players = 
[
    
];

var enemies = 
[
];

var objects = 
[
];

var map = [];

var dimension = [window.innerWidth, window.innerHeight];
var keys = [];
var viewport = 
{
    x: 0,
    y: 0,
    scale: 1
};

var testLine = [0, 0, 300, 250];

var weapon = "arrow";
var drawTime = 0;


function getCollisions(testLine)
{
    points = squaresHit(
        testLine[0] / settings.gridsize, 
        testLine[1] / settings.gridsize, 
        testLine[2] / settings.gridsize, 
        testLine[3] / settings.gridsize, 
        20
    );
    
    var collisions = [];
    points.forEach (function (point)
        {
            if (map[point[1]][point[0]])
            {
                // Find if there are any intersections
                // LEFT SIDE
                var where = intersect(
                    point[0] * settings.gridsize, 
                    point[1] * settings.gridsize, 
                    point[0] * settings.gridsize, 
                    (point[1] + 1) * settings.gridsize, 
                    testLine[0], testLine[1], testLine[2], testLine[3]);
                if (where)
                {
                    where.side = "l";
                    collisions.push(where);
                }

                // RIGHT SIDE
                var where = intersect(
                    (point[0]+1) * settings.gridsize, 
                    point[1] * settings.gridsize, 
                    (point[0]+1) * settings.gridsize, 
                    (point[1] + 1) * settings.gridsize, 
                    testLine[0], testLine[1], testLine[2], testLine[3]);
                if (where)
                {
                    where.side = "r";
                    collisions.push(where);
                }

                // BOTTOM SIDE
                var where = intersect(
                    point[0] * settings.gridsize, 
                    point[1] * settings.gridsize, 
                    (point[0] + 1) * settings.gridsize, 
                    point[1] * settings.gridsize, 
                    testLine[0], testLine[1], testLine[2], testLine[3]);
                if (where)
                {
                    where.side = "b";
                    collisions.push(where);
                }
                
                // TOP SIDE
                var where = intersect(
                    point[0] * settings.gridsize, 
                    (point[1] + 1) * settings.gridsize, 
                    (point[0] + 1) * settings.gridsize, 
                    (point[1] + 1) * settings.gridsize, 
                    testLine[0], testLine[1], testLine[2], testLine[3]);
                if (where)
                {
                    where.side = "t";
                    collisions.push(where);
                }
            }
        }
    );

    collisions.sort(function (a, b) {
        return distance(a.x, a.y, testLine[0], testLine[1]) - distance(b.x, b.y, testLine[0], testLine[1]);
    });

    if (collisions.length > 0)
    {
        return collisions[0];
    }
    else
    {
        return false;
    }
}

function distance(x1, y1, x2, y2)
{
    var dist = Math.sqrt( ((x2 - x1)*(x2 - x1)) + ((y2 - y1)*(y2 - y1)) );
    return dist;
}

function setupWorld()
{
    objects = [];
    players = [];
    enemies = [];

    // Make a map
    for (var i = 0; i < settings.mapWidth; i++)
    {
        map[i] = [];
        for (var j = 0; j < settings.mapHeight; j++)
        {
            if (Math.random() < 0.25 
                || i == 0 
                || i == settings.mapWidth - 1
                || j == 0 
                || j == settings.mapHeight - 1
            )
            {
                map[i][j] = 1;
            }
            else
            {
                if (Math.random() < 0.02)
                {
                    enemies.push({x: (j + 0.5) * settings.gridsize, y: (i + 0.5) * settings.gridsize, type: "grunt", swing: 0, swingStart: 0, reaction: settings.reactionTime, loading: -1, alert: false, searching: false, patience: settings.entities.grunt.searchTime, health: 100,  angle: Math.PI * 2 * Math.random(), target: null, bleeding: false, bleedtime: 30, bleedrate: 50});
                    objects.push(enemies[enemies.length - 1]);
                }
                map[i][j] = 0;
                if (players.length == 0)
                {
                    players.push({type: "player", health: 100, loading: -1, id: 1, x: (j + 0.5) * settings.gridsize, y: (i + 0.5) * settings.gridsize, angle: 0});
                    objects.push(players[players.length - 1]);
                }
            }
        }
    }
}

function setup()
{
    console.log("fnorg");
    
    var c = document.getElementById("canvas");
    c.width = dimension[0];
    c.height = dimension[1];

    var ctx = c.getContext("2d");
    ctx.moveTo(0, 0);
    ctx.lineTo(dimension[0], dimension[1]);
    ctx.stroke();

    window.canvasContext = ctx;

    window.canvasContext.clearRect(0, 0, 2000, 2000);
    
    setupWorld();

    window.addEventListener('keypress', function (e) {
        if (e.key == "d" && !players[0].dead)
        {
            console.log("grenadez!");
            objects.push({type: "text", x: players[0].x, y: players[0].y, age: 0, text: "grenadez!"});
            weapon = "grenade";
        }
        if (e.key == "a" && !players[0].dead)
        {
            console.log("arros!");
            objects.push({type: "text", x: players[0].x, y: players[0].y, age: 0, text: "arros!"});
            
            weapon = "arrow";
        }
        if (e.key == "s" && !players[0].dead)
        {
            console.log("hitting things!");
            objects.push({type: "text", x: players[0].x, y: players[0].y, age: 0, text: "hitty thing!"});
            
            weapon = "melee";
        }
    });

    window.addEventListener('keydown', function (e) {
        keys = (keys || []);
        keys[e.keyCode] = true;
    });
    window.addEventListener('keyup', function (e) {
        keys[e.keyCode] = false; 
    });

    go();
}

var frames = 0;
var startTime = 0;
function fps()
{
    var elapsed = (performance.now() - startTime) / 1000;
    return frames / elapsed;
}

var footstep = 0;
var footsteptime = 20;

function canSeePlayer(enemy)
{
    if (enemy.dead) { return false; }
    if (players[0].dead) { return false; /* ignore dead players */}
    var angle = angleTo(players[0], enemy);

    // Check if out of field of view
    if (Math.abs(angleDifference(angle, enemy.angle)) > 0.5)
    {
        return false;
    }

    // Check if it's a ridiculous distance
    if (distance(enemy.x, enemy.y, players[0].x, players[0].y) > 1000)
    {
        return false;
    }

    // Check if have a clear view
    var collision = getCollisions([enemy.x, enemy.y, players[0].x, players[0].y]);
    if (!collision)
    {
        
        return true;
    }
    return false;
}

function go()
{
    frames++;
    blankCanvas();


    // Move the player
    if (keys && keys[37] && !players[0].dead) 
    {
        players[0].angle += -settings.turnSpeed;
    }
    if (keys && keys[39] && !players[0].dead) 
    {
        players[0].angle += settings.turnSpeed;
    }
    if (keys && keys[32] && !players[0].dead) 
    {
        drawTime++;
    }
    else
    {
        if (players[0].loading > 0)
        {
            console.log("still reloading");
        }
        else
        {
            if (drawTime > 0)
            {
                console.log("swip " + drawTime);

                switch (weapon)
                {
                    case "arrow":
                        players[0].loading = settings.arrowReload;
                        objects.push(
                            { 
                                type: "arrow",
                                source: players[0], 
                                x: players[0].x, 
                                y: players[0].y, 
                                angle: players[0].angle + Math.random() * settings.arrowSpread, 
                                vel: (Math.min(drawTime, settings.maxDraw)/settings.maxDraw * settings.entities.arrow.speed) + Math.random() * settings.arrowVelSpread
                            }
                        );
        
                        objects.push(
                            { 
                                type: "sound", 
                                source: players[0],
                                x: players[0].x, 
                                y: players[0].y, 
                                age: 0,
                                volume: 400
                            }
                        );
                        break;
                    case "grenade":
                        objects.push(
                            { 
                                type: "grenade",
                                source: players[0], 
                                x: players[0].x, 
                                y: players[0].y,
                                timer: settings.entities.grenade.timer,
                                angle: players[0].angle + (0.5-Math.random()) * settings.grenadeSpread, 
                                vel: (Math.min(drawTime, settings.maxDraw)/settings.maxDraw) * settings.entities.grenade.speed + Math.random() * settings.grenadeVelSpread
                            }
                        );
                        break;
                    case "melee":
                        enemies.forEach(function (enemy) {
                            if (distance(enemy.x, enemy.y, players[0].x, players[0].y) < 80)
                            {
                                enemy.bleeding = true;
                                enemy.health -= 100;
                                enemy.alert = true;
                            
                                for (var i = 0; i < 50; i++)
                                {
                                    objects.push(
                                        { 
                                            type: "blood", 
                                            x: enemy.x, 
                                            y: enemy.y,
                                            age: 0,
                                            vel: 1.5 + Math.random()*4,
                                            angle: Math.PI * 2 * Math.random(), 
                                            size: 1 + Math.random()*4
                                        }
                                    );
                                }
                            }
                        });
                    break;
                }
                

                drawTime = 0;
            }
        }
    }
    if (keys && keys[38] && !players[0].dead) 
    {
        var targetX = players[0].x + Math.sin(players[0].angle) * (keys[17] ? settings.crawlSpeed : settings.walkSpeed);
        var targetY = players[0].y - Math.cos(players[0].angle) * (keys[17] ? settings.crawlSpeed : settings.walkSpeed);
        if (!map[Math.floor(targetY/settings.gridsize)][Math.floor(targetX/settings.gridsize)])
        {
            players[0].x = targetX;
            players[0].y = targetY;
        }

        if (footsteptime < 0)
        {
            objects.push(
                { 
                    type: "sound", 
                    source: players[0],
                    x: players[0].x, 
                    y: players[0].y, 
                    age: 0,
                    volume: keys[17] ? settings.crawlVolume : settings.walkVolume
                }
            );

            footstep = footstep ? 0 : 1;
            footsteptime = 20;
        }
        else
        {
            footsteptime -=1 ;
        }
    }
    if (keys && keys[40] && !players[0].dead) 
    {
        var targetX = players[0].x + Math.sin(players[0].angle) * settings.backSpeed;
        var targetY = players[0].y - Math.cos(players[0].angle) * settings.backSpeed;
        if (!map[Math.floor(targetY/settings.gridsize)][Math.floor(targetX/settings.gridsize)])
        {
            players[0].x = targetX;
            players[0].y = targetY;
        }
        
        if (footsteptime < 0)
        {
            objects.push(
                { 
                    type: "sound", 
                    source: players[0],
                    x: players[0].x, 
                    y: players[0].y, 
                    age: 0,
                    volume: 50
                }
            );

            footstep = footstep ? 0 : 1;
            footsteptime = 20;
        }
        else
        {
            footsteptime -=1 ;
        }
    }

    // Did anything see us - if so, make them target us
    enemies.forEach(function (enemy) {
        if (canSeePlayer(enemy))
        {
            // There's line of sight
            if (!enemy.alert)
            {
                objects.push(
                    { 
                        type: "sound", 
                        source: enemy,
                        x: enemy.x,
                        y: enemy.y,
                        age: 0, 
                        volume: 500
                    }
                );
            }

            enemy.target = {x: players[0].x, y: players[0].y };
            enemy.searching = false;
            enemy.alert = true;
            
            // Enemy tries to kill us!
            if (enemy.loading < 0)
            {
                console.log("Firing");
                objects.push(
                    { 
                        type: "arrow",
                        source: enemy, 
                        x: enemy.x + Math.sin(enemy.angle) * 25, 
                        y: enemy.y - Math.cos(enemy.angle) * 25, 
                        angle: angleTo(players[0], enemy) + (0.5-Math.random()) * settings.arrowSpread, 
                        vel: settings.entities.arrow.speed + Math.random() * settings.arrowVelSpread
                    }
                );

                enemy.loading = settings.entities.grunt.reload;
            }
        }
    });

    // Move everything else
    objects.forEach(function (item) {

        if (item.loading) { item.loading -= 1; }

        switch (item.type)
        {
            case "text":
                item.age += 1;
                if (item.age > 250) { item.expired = true; };
                break;
            case "rubble":
                item.age += 1;
                if (item.age > 250) { item.expired = true; }
                if (item.vel > 0)
                {
                    var targetX = item.x + Math.sin(item.angle) * item.vel;
                    var targetY = item.y + Math.cos(item.angle) * -item.vel;

                    // Check for collisions with walls
                    var collision = getCollisions([item.x, item.y, targetX, targetY]);
                    if (collision)
                    {
                        item.vel = item.vel * 0.75;
                        var wallNormal = 0;
                        switch (collision.side)
                        {
                            case "b": wallNormal = 0; break;
                            case "l": wallNormal = -(Math.PI / 2); break;
                            case "r": wallNormal = (Math.PI / 2); break;
                            case "t": wallNormal = Math.PI; break;
                        }
                        console.log(angleDifference(item.angle, wallNormal - Math.PI));
                        item.angle = wallNormal - angleDifference(item.angle, wallNormal - Math.PI);
                    }
                    else
                    {
                        item.x = targetX;
                        item.y = targetY;
                        item.vel = Math.max(item.vel - .15, 0);
                    }
                }
                break;
            case "grenade":
                item.timer -= 1;
                if (item.timer == 0)
                {
                    item.expired = true;
                    objects.push(
                        { 
                            type: "explosion", 
                            source: null,
                            x: item.x, 
                            y: item.y, 
                            age: 0,
                            volume: 250
                        }
                    );
                    objects.push(
                        { 
                            type: "sound", 
                            source: null,
                            x: item.x, 
                            y: item.y, 
                            age: 0,
                            volume: 1000
                        }
                    );
                    for (var i = 0; i < 20; i++)
                    {
                        objects.push(
                            { 
                                type: "rubble", 
                                x: item.x, 
                                y: item.y,
                                age: 0,
                                vel: 3 + Math.random()*8,
                                angle: Math.PI * 2 * Math.random(), 
                                size: 0.5 + Math.random()*2
                            }
                        );
                    }
                }
                if (item.vel > 0)
                {
                    

                    var targetX = item.x + Math.sin(item.angle) * item.vel;
                    var targetY = item.y + Math.cos(item.angle) * -item.vel;

                    // Check for collisions with walls
                    var collision = getCollisions([item.x, item.y, targetX, targetY]);
                    if (collision)
                    {
                        item.vel = item.vel * 0.75;
                        var wallNormal = 0;
                        switch (collision.side)
                        {
                            case "b": wallNormal = 0; break;
                            case "l": wallNormal = -(Math.PI / 2); break;
                            case "r": wallNormal = (Math.PI / 2); break;
                            case "t": wallNormal = Math.PI; break;
                        }
                        console.log(angleDifference(item.angle, wallNormal - Math.PI));
                        item.angle = wallNormal - angleDifference(item.angle, wallNormal - Math.PI);
                        

                        objects.push(
                            { 
                                type: "sound", 
                                source: players[0],
                                x: item.x, 
                                y: item.y, 
                                age: 0,
                                volume: 200
                            }
                        );
                    }
                    else
                    {
                        item.x = targetX;
                        item.y = targetY;
                        item.vel = Math.max(item.vel - .15, 0);
                    }
                }
                break;
            case "blood":
                if (item.vel > 0)
                {
                    var targetX = item.x + Math.sin(item.angle) * item.vel;
                    var targetY = item.y + Math.cos(item.angle) * -item.vel;

                    // Check for collisions with walls
                    var collision = getCollisions([item.x, item.y, targetX, targetY]);
                    if (collision)
                    {
                        item.x = collision.x;
                        item.y = collision.y;
                        item.vel = 0;
                    }
                    else
                    {
                        item.x = targetX;
                        item.y = targetY;
                        item.vel = Math.max(item.vel - .5, 0);
                    }
                }
                break;
            case "arrow":
                if (item.vel > 0)
                {
                    var targetX = item.x + Math.sin(item.angle) * item.vel;
                    var targetY = item.y + Math.cos(item.angle) * -item.vel;

                    // Check for collisions with walls
                    var collision = getCollisions([item.x, item.y, targetX, targetY]);
                    if (collision)
                    {
                        item.x = collision.x;
                        item.y = collision.y;
                        item.vel = 0;
                    }
                    else
                    {
                        item.x = targetX;
                        item.y = targetY;
                        item.vel = Math.max(item.vel - .5, 0);
                    }

                    // Check for collisions with enemies
                    enemies.forEach(function (enemy) {
                        // Don't let enemies kill themselves with arrows
                        if (item.source == enemy) { return true; }
                        if (distance(item.x, item.y, enemy.x, enemy.y) < 25)
                        {
                            // create some initial blood spatter
                            for (var i = 0; i < 5; i++)
                            {
                                objects.push(
                                    { 
                                        type: "blood", 
                                        x: item.x + Math.random()*10, 
                                        y: item.y + Math.random()*10, 
                                        size: 1.0 + Math.random()*3,
                                        vel: 10 + (-0.5+Math.random()*5),
                                        angle: item.angle + (-0.5+Math.random()*1)
                                    }
                                );
                            }

                            // Stick the arrow permanently in the enemy
                            enemy.bleeding = true;
                            enemy.health -= 25;
                            item.parent = enemy;
                            item.x = item.parent.x - item.x;
                            item.y = item.parent.y - item.y;
                            item.angle = item.angle - item.parent.angle;
                            item.vel = 0;

                            if (!enemy.alert) { enemy.alert = true; }
                        }
                    });

                    // Check for collisions with players
                    players.forEach(function (enemy) {
                        // Don't let enemies kill themselves with arrows
                        if (item.source == enemy) { return true; }
                        if (distance(item.x, item.y, enemy.x, enemy.y) < 25)
                        {
                            // create some initial blood spatter
                            for (var i = 0; i < 5; i++)
                            {
                                objects.push(
                                    { 
                                        type: "blood", 
                                        x: item.x + Math.random()*10, 
                                        y: item.y + Math.random()*10, 
                                        size: 1.0 + Math.random()*3,
                                        vel: 10 + (-0.5+Math.random()*5),
                                        angle: item.angle + (-0.5+Math.random()*1)
                                    }
                                );
                            }

                            // Stick the arrow permanently in the enemy
                            enemy.bleeding = true;
                            enemy.health -= 25;
                            item.parent = enemy;
                            item.x = item.parent.x - item.x;
                            item.y = item.parent.y - item.y;
                            item.angle = item.angle - item.parent.angle;
                            item.vel = 0;
                        }
                    });
                }
                
                break;
            case "grunt":

                if (item.target)
                {
                    var grid = new PF.Grid(map);
                    var finder = new PF.AStarFinder({
                        allowDiagonal: false,
                        dontCrossCorners: true
                    });
                    var currentx = Math.floor(item.x / settings.gridsize);
                    var currenty = Math.floor(item.y / settings.gridsize);
                    var path = finder.findPath(
                        currentx,
                        currenty, 
                        Math.floor(item.target.x / settings.gridsize), 
                        Math.floor(item.target.y / settings.gridsize), 
                        grid);
                    if (path && path.length > 0)
                    {
                        //path = PF.Util.smoothenPath(grid, path);
                        path = path.filter(function (point) {
                            return point[0] != currentx || point[1] != currenty;
                        });
                    }
                }

                if (!item.dead && item.target)
                {
                    if (path && path.length > 0)    
                    {
                        var target = {x: (path[0][0] +0.5) * settings.gridsize, y: (path[0][1] + 0.5) * settings.gridsize};
                        
                        item.angle += angleDifference(angleTo(target, item), item.angle) * 0.1;
                        item.vel = settings.entities.grunt.speed;
                    }
                    else
                    {
                        item.angle = angleTo(item.target, item);
                        item.vel = settings.entities.grunt.speed;
                    }

                    

                    // If we've got to our target
                    if (distance(item.target.x, item.target.y, item.x, item.y) < 50)
                    {
                        // If we can't find the player, start searching
                        if (canSeePlayer(item))
                        {
                            // We can still see the player

                            // Check if we're close enough we should stop
                            if (distance(players[0].x,players[0].y, item.x, item.y) < 50)
                            {
                                item.vel = 0;
                                // melee attack time!
                                players[0].health -= 10;
                            }
                        }
                        else
                        {
                            // Looking the wrong way - start searching
                            console.log("Lost the player!");
                            item.searching = true;
                            item.swingStart = item.angle;
                            item.swing = 0;
                            item.target = null;
                        }
                        
                    }

                    item.x += Math.sin(item.angle) * item.vel;
                    item.y -= Math.cos(item.angle) * item.vel;

                }
                else if (!item.dead && item.searching)
                {
                    // TODO: do this as a sine oscillation
                    item.angle = item.swingStart + (Math.sin(item.swing) * (Math.PI));
                    item.swing += settings.searchSpeed;
                    item.vel = 0;
                    item.patience -= 1;
                    if (item.patience < 1)
                    {
                        item.searching = false;
                        item.patience = settings.entities.grunt.searchTime;
                        item.alert = false;
                    }
                }
                break;
            case "explosion":
                if (item.age == 0)
                {
                    // did it hurt anyone?
                    enemies.forEach(function (enemy) {
                        if (distance(item.x, item.y, enemy.x, enemy.y) < item.volume)
                        {
                            enemy.health -= 200 * (item.volume - distance(item.x, item.y, enemy.x, enemy.y) / item.volume);
                        }
                    });
                    players.forEach(function (enemy) {
                        if (distance(item.x, item.y, enemy.x, enemy.y) < item.volume)
                        {
                            enemy.health -= 50;
                        }
                    });
                }
                item.age += 1;
                if (item.age > settings.explosionAnimationLength)
                {
                    item.expired = true;
                };
                
                
                break;
            case "sound":
                if (item.age == 0)
                {
                    // did anyone hear it?
                    enemies.forEach(function (enemy) {
                        // ignore sounds the enemy made themselves
                        if (enemies.indexOf(item.source) > -1) { return true; } 
                        if (distance(item.x, item.y, enemy.x, enemy.y) < item.volume)
                        {
                            if (!enemy.dead && (!enemy.alert || enemy.searching))
                            {
                                enemy.target = {x: item.x, y: item.y};
                                enemy.searching = false;
                                enemy.alert = true;
                                objects.push(
                                    { 
                                        type: "sound", 
                                        source: enemy,
                                        x: enemy.x,
                                        y: enemy.y,
                                        age: 0, 
                                        volume: 500
                                    }
                                );
                            }
                        }
                    });
                }
            
                item.age += 1;
                if (item.age > settings.soundAnimationLength)
                {
                    item.expired = true;
                }
                
                break;
        }

        if (item.type == "grunt" || item.type == "player")
        {
            if (item.health < 1 && !item.dead)
            {
                item.dead = true;
                for (var i = 0; i < ((item.type == "player") ? 80 : 20); i++)
                {
                    objects.push(
                        { 
                            type: "blood", 
                            x: item.x + (0.5-Math.random())*25, 
                            y: item.y + (0.5-Math.random())*25,
                            vel: 2 + Math.random()*6,
                            angle: Math.PI * 2 * Math.random(), 
                            size: 1 + Math.random()*5
                        }
                    );
                }
                if (item.type == "player") { setTimeout(function () {
                    console.log("Time to go again...");
                    viewport.scale = 1;
                    setupWorld();
                }, 2500);}
            }

            if (item.type == "player" && item.dead)
            {
                viewport.scale *= 0.998;
            }

            if (item.bleeding && !item.dead)
            {
                item.bleedtime -= 1;
                if (item.bleedtime < 0)
                {
                    item.health -= 0.5;
                    objects.push(
                        { 
                            type: "blood", 
                            x: item.x + Math.random()*10, 
                            y: item.y + Math.random()*10, 
                            size: 3 + Math.random()*5
                        }
                    );
                    item.bleedtime = item.bleedrate * Math.random();
                }
            }
        }
    });

    // Remove any dead objects
    objects = objects.filter(function (item) {
        return !item.expired;
    });

    // Recenter the viewport
    viewport.x = players[0].x - (dimension[0]/(2*viewport.scale)) ;
    viewport.y = players[0].y - (dimension[1]/(2*viewport.scale)) ;

    draw();
    window.requestAnimationFrame(go);
}

function blankCanvas()
{
    window.canvasContext.resetTransform();
    window.canvasContext.clearRect(0, 0, 2000, 2000);
}

function draw()
{
    var ctx = window.canvasContext;

    // Scroll the viewport
    ctx.scale(viewport.scale, viewport.scale);
    ctx.translate(-viewport.x, -viewport.y);

    // Draw the map
    for (var i = 0; i < map.length; i++)
    {
        for (var j = 0; j < map[i].length; j++)
        {
            if (map[j][i] == 0)
            {
                ctx.fillStyle="rgba(0,0,0,0.2)";
            }
            if (map[j][i] == 1)
            {
                ctx.fillStyle="rgba(0,0,0,0.5)";
            }            
            ctx.fillRect(i * settings.gridsize,
                (j) * (settings.gridsize),
                settings.gridsize,
                settings.gridsize
            );
        }
    }

    // Draw entities
    objects.forEach(function (item) {
        switch (item.type)
        {
            case "text":
                ctx.fillStyle="rgba(0,0,0," + (250 - item.age)*0.5/250 + ")";
                ctx.font="50px Arial";
                ctx.textAlign = "center";
                ctx.save();
                ctx.translate(item.x, item.y);
                ctx.scale((250 - item.age)*0.5/250, (250 - item.age)*0.5/250);
                ctx.fillText(item.text, 0, 0);
                ctx.restore();
                break;
            case "blob":
                ctx.fillStyle="#0000FF";
                ctx.save();
                ctx.translate(item.x, item.y);
                ctx.beginPath();
                ctx.arc(0, 0, item.size, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.restore();
                break;
            case "rubble":
                ctx.fillStyle="rgba(0,0,0," + (250 - item.age)*0.5/250 + ")";
                ctx.save();
                ctx.translate(item.x, item.y);
                ctx.beginPath();
                ctx.arc(0, 0, item.size, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.restore();
                break; 
            case "grenade":
                ctx.fillStyle = ((item.timer % 50) < 25) ? "#aa6644" : "#444444";
                ctx.save();
                ctx.translate(item.x, item.y);
                ctx.beginPath();
                ctx.arc(0, 0, 5, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.restore();
                break; 
            case "blood":
                ctx.fillStyle="rgba(200,0,0,0.5)";
                ctx.save();
                ctx.translate(item.x, item.y);
                ctx.beginPath();
                ctx.arc(0, 0, item.size, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.restore();
                break; 
            case "explosion":
                var fraction = item.age / settings.explosionAnimationLength;
                ctx.fillStyle="rgba(255,255,0," + (1 - fraction) + ")";
                                
                ctx.save();
                ctx.translate(item.x, item.y);
                ctx.beginPath();
                ctx.arc(0, 0, item.volume * fraction, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.restore();
                break; 
            case "sound":
                var fraction = item.age / settings.soundAnimationLength;
                if (!item.source || item.source != players[0])
                {
                    ctx.fillStyle="rgba(255,0,0," + (1 - fraction)/4 + ")";
                }
                else
                {
                    ctx.fillStyle="rgba(0,0,128," + (1 - fraction)/10 + ")";
                }
                
                ctx.save();
                ctx.translate(item.x, item.y);
                ctx.beginPath();
                ctx.arc(0, 0, item.volume * fraction, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.restore();
                break; 
            case "player":
                ctx.fillStyle="rgba(0,255,0,1)";
                ctx.save();
                ctx.translate(item.x, item.y);
                // health bar
                ctx.fillStyle="rgba(255,0,0,0.25)";
                ctx.fillRect(-25, -50, 50, 10);
                ctx.fillStyle="rgba(255,0,0,1)";
                ctx.fillRect(-25, -50, 50 * Math.max(item.health,0)/100, 10);
                ctx.rotate(item.angle);
                ctx.lineWidth=5;
                ctx.strokeStyle="rgba(0,0,255,0.4)";
                ctx.beginPath();
                ctx.arc(0, 0, 35, 0, (settings.maxDraw - Math.min(settings.maxDraw, drawTime) / settings.maxDraw) * Math.PI * 2, true);
                ctx.stroke();
                drawTriangle();
                ctx.restore();
                break; 
            case "grunt":
/*                 if (item.target)
                {
                    ctx.save();
                    ctx.translate(item.target.x, item.target.y);
                    ctx.fillStyle="rgba(255,0,255,0.5)";
                    ctx.fillRect(-5, -5, 10, 10);
                    ctx.restore();
                } */
                ctx.save();
                ctx.translate(item.x, item.y);
                // health bar
                ctx.fillStyle="rgba(255,0,0,0.25)";
                ctx.fillRect(-25, -50, 50, 10);
                ctx.fillStyle="rgba(255,0,0,1)";
                ctx.fillRect(-25, -50, 50 * Math.max(item.health,0)/100, 10);

                ctx.rotate(item.angle);

                // view angle
                if (!item.dead) {
                    ctx.fillStyle="rgba(255,255,255,0.25)";
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.arc(0, 0, 250, -Math.PI/2 - 0.5, -Math.PI/2 + 0.5);
                    ctx.fill();
                }

                ctx.fillStyle=item.alert ? "rgba(255,255,0,1)" : "rgba(128,192,192,1)";
                if (item.searching) {ctx.fillStyle = "rgba(255,128,0,1)"};
                if (item.dead) { ctx.fillStyle = "rgba(128,128,0,1)"};
                drawTriangle();
                ctx.restore();
                break; 
            case "arrow":
                ctx.strokeStyle="#000000";
                ctx.save();
                if (item.parent)
                {
                    ctx.translate(item.parent.x, item.parent.y);
                    ctx.rotate(item.parent.angle);
                }
                ctx.translate(item.x, item.y);
                ctx.rotate(item.angle);
                window.canvasContext.beginPath();
                window.canvasContext.moveTo(0, -10);
                window.canvasContext.lineTo(0, 10);
                window.canvasContext.stroke();
                ctx.restore();
                break; 
        }
    });
}

function drawTriangle()
{
    window.canvasContext.beginPath();
    window.canvasContext.moveTo(0, -25);
    window.canvasContext.lineTo(-25, 25);
    window.canvasContext.lineTo(25, 25);
    window.canvasContext.lineTo(0, -25);
    window.canvasContext.fill();
}

function angleTo(p1, p2)
{
    var d = {};
    d.x = p2.x - p1.x;
    d.y = p2.y - p1.y;

    return Math.atan2(d.y, d.x) - Math.atan2(1, 0);
}

function angleDifference(x, y)
{
    return Math.atan2(Math.sin(x-y), Math.cos(x-y));
}

/*function angleDifference(b1Rad, b2Rad)
{
	b1y = Math.cos(b1Rad);
	b1x = Math.sin(b1Rad);
	b2y = Math.cos(b2Rad);
	b2x = Math.sin(b2Rad);
	crossp = b1y * b2x - b2y * b1x;
	dotp = b1x * b2x + b1y * b2y;
	if(crossp > 0.)
		return Math.acos(dotp);
	return -Math.acos(dotp);
}*/

function getPoints(x1, y1, x2, y2, N)
{
    var points = [];
    for (var step = 0; step <= N; step++) {
        var t = step / N;
        points.push(lerpPoint(x1, y1, x2, y2, t));
    }

    return points;
}

function squaresHit(x1, y1, x2, y2, N)
{
    var points = [];
    for (var step = 0; step <= N; step++) {
        var t = step / N;
        points.push(lerpPoint(x1, y1, x2, y2, t));
    }
    points.map(function (point) {
        point[0] = Math.floor(point[0]);
        point[1] = Math.floor(point[1]);
    });

    return points;
}

function lerp(p1, p2, t)
{
    return p1 + t * (p2 - p1);
}

function lerpPoint(x1, y1, x2, y2, t)
{
    return [lerp(x1, x2, t), lerp(y1, y2, t)];
}

// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {

    // Check if none of the lines are of length 0
      if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
          return false
      }
  
      denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  
    // Lines are parallel
      if (denominator === 0) {
          return false
      }
  
      var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
      var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
  
    // is the intersection along the segments
      if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
          return false
      }
  
    // Return a object with the x and y coordinates of the intersection
      var x = x1 + ua * (x2 - x1)
      var y = y1 + ua * (y2 - y1)
  
      return {x: x, y: y}
  }

window.onload = function () {
    setup();
};