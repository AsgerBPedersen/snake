const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const state = {
    time: 0,
    size: 50,
    snake: [[3,1],[3,0]], // index 0 is row, index 1 is columns
    apple: [1,1],
    score: 0,
    frontier: [],
    calcPath: false,
    snakeDirection: 1,
    direction: 1, //0 = north, 1 = east, 2 south, 3 west
    path: []
}



const xy = c => Math.round(c * canvas.width / state.size);
const pointEq = (x, y) => (x[0] == y[0] && x[1] == y[1])? true : false;
const pointObjEq = (x, y) => (x.x == y.x && x.y == y.y)? true : false;
const calcDistance = (x1,x2,y1,y2) => (x2 - x1 > (0.5 * state.size)? state.size - (x2 - x1) : x2 - x1) + (y2 - y1 > (0.5 * state.size)? state.size - (y2 - y1) : y2 - y1);


const moves = (node, allNodes, bool) => {
    const {size} = state;
    const directions = [[-1, 0], [0, 1], [1,0], [0, -1]];  //0 = north, 1 = east, 2 south, 3 west
    let result = [];
    directions.forEach(d => {
        let newEdge;
        if(node[0] + d[0] == -1) {
            newEdge = [size - 1, node[1]];
        } else if(node[0] + d[0] == size) {
            newEdge = [0, node[1]]
        } else if(node[1] + d[1] == -1) {
            newEdge = [node[0], size -1]
        } else if(node[1] + d[1] == size) {
            newEdge = [node[0], 0]
        } else {
            newEdge = [node[0] + d[0],node[1] + d[1]]
        }
        const edge = allNodes.find(n => pointEq(n, newEdge));
        if(bool) {
            if(edge) {
                result.push(edge)
            }
        } else {
            if(edge == undefined) {
                result.push(newEdge)
            }
        }
    });
    
    return result;
}

const pathFinder = ({snake, apple, size}) => {
    
    let nodes = [];

    for(i = 0; i < size; i++) {
        for (y = 0; y < size; y++) {
            if(!snake.some(s => s[0] == i && s[1] == y)) {
                nodes.push([i,y]);
            }
        }
    }

    let frontier = [snake[0]];
    let visited = new Map();
    visited.set(snake[0], null)
    let current;
    while(frontier.length != 0) {
        current = frontier.shift();
        if(pointEq(current, apple)) {
            break;
        }
        const newEdges = moves(current, nodes, true);
        newEdges.forEach(e => {
            if(!visited.has(e)) {
                frontier.push(e);
                visited.set(e, current);
                if(state.calcPath) {
                    state.frontier.push(frontier.map(f => f))
                }
            }
        });
        
    }

    let path = [];
    while(current != snake[0]) {
        path.unshift(current);
        current = visited.get(current);
    }
    if(path.length == 0) {
        const nextMoves = moves(snake[0], snake, false);
        
        if(nextMoves.length == 0) {
            willCollide()
        } else {
            path.push(nextMoves[Math.floor(Math.random()*nextMoves.length)])
        }
    }
    return path;
}

const movesWithDistance = (node, allNodes) => {
    const {size} = state;
    const directions = [[-1, 0], [0, 1], [1,0], [0, -1]];  //0 = north, 1 = east, 2 south, 3 west
    let result = [];
    directions.forEach(d => {
        let newEdge;
        if(node.x + d[0] == -1) {
            newEdge = {
                x: size - 1,
                y: node.y,
                distance: 0
            };
        } else if(node.x + d[0] == size) {
            newEdge = {
                x: 0,
                y: node.y,
                distance: 0
            } 
        } else if(node.y + d[1] == -1) {
            newEdge = {
                x: node.x,
                y: size -1,
                distance: 0
            }
        } else if(node.y + d[1] == size) {
            newEdge = {
                x: node.x,
                y: 0,
                distance: 0
            }
        } else {
            newEdge = {
                x: node.x + d[0],
                y: node.y + d[1],
                distance: 0
            }
        }

        const edge = allNodes.find(n => pointObjEq(n, newEdge));
        
        if(edge) {
            if(edge.x > state.apple[0]) {
                if(edge.y > state.apple[1]) {
                    edge.distance = calcDistance(state.apple[0], edge.x, state.apple[1], edge.y);
                } else {
                    edge.distance = calcDistance(state.apple[0], edge.x, edge.y, state.apple[1]);
                }
            } else {
                if(edge.y > state.apple[1]) {
                    edge.distance = calcDistance(edge.x, state.apple[0], state.apple[1], edge.y);
                } else {
                    edge.distance = calcDistance(edge.x, state.apple[0], edge.y, state.apple[1]);
                }
            }
            result.push(edge)
        }
    });
    
    return result;
}

const pathFinderAStar = ({snake, apple, size}) => {
    
    let nodes = [];

    for(x = 0; x < size; x++) {
        for (y = 0; y < size; y++) {
            if(!snake.some(s => s[0] == x && s[1] == y)) {
                nodes.push({
                    x: x,
                    y: y,
                    distance: 0
                });
            }
        }
    }

    const end = {
        x: snake[0][0],
        y: snake[0][1],
        distance: 9999
    };
    let frontier = [];
    frontier.unshift(end);
    let visited = new Map();
    visited.set(frontier[0], null)
    let current;
    while(frontier.length != 0) {
        
        current = frontier.shift();
        console.log(current);
        if(pointEq([current.x, current.y], apple)) {
            break;
        }
        const newEdges = movesWithDistance(current, nodes);
        
        newEdges.forEach(e => {
            if(!visited.has(e)) {
                frontier.push(e);
                frontier.sort((a,b) => a.distance - b.distance);
                visited.set(e, current);
                if(state.calcPath) {
                    state.frontier.push(frontier.map(f => f))
                }
            }
        });
        
    }
    
    let path = [];
    while(current != end) {
        path.unshift([current.x, current.y]);
        current = visited.get(current);
    }
    if(path.length == 0) {
        const nextMoves = moves(snake[0], snake, false);
        
        if(nextMoves.length == 0) {
            willCollide()
        } else {
            path.push(nextMoves[Math.floor(Math.random()*nextMoves.length)])
        }
    }
    console.log(path);
    return path;
}


const draw = ({ snake, apple, size, score }) => {

    ctx.fillStyle = '#232323';
    ctx.fillRect(0,0,canvas.width, canvas.height);

    ctx.fillStyle = 'rgb(0,200,50)';
    snake.map(s => ctx.fillRect(xy(s[1]), xy(s[0]), xy(1), xy(1)));

    ctx.fillStyle = '#232323';
    ctx.fillRect(xy(snake[0][1]) + xy(0.4), xy(snake[0][0]) + xy(0.15), xy(0.2),xy(0.2))
    ctx.fillRect(xy(snake[0][1]) + xy(0.4), xy(snake[0][0]) + xy(0.65), xy(0.2),xy(0.2))

    ctx.fillStyle = 'rgb(255,50,0)';
    ctx.fillRect(xy(apple[1]), xy(apple[0]), xy(1), xy(1));
    
};

const drawFrontier = ({ snake, apple, size, score }, frontier) => {

    ctx.fillStyle = '#232323';
    ctx.fillRect(0,0,canvas.width, canvas.height);

    ctx.fillStyle = 'rgb(0,200,50)';
    snake.map(s => ctx.fillRect(xy(s[1]), xy(s[0]), xy(1), xy(1)));

    ctx.fillStyle = '#232323';
    ctx.fillRect(xy(snake[0][1]) + xy(0.4), xy(snake[0][0]) + xy(0.15), xy(0.2),xy(0.2))
    ctx.fillRect(xy(snake[0][1]) + xy(0.4), xy(snake[0][0]) + xy(0.65), xy(0.2),xy(0.2))

    ctx.fillStyle = '#fefefe';
    const newFrontier = frontier.shift();
    newFrontier.map(f => ctx.fillRect(xy(f.y), xy(f.x), xy(1), xy(1)));
    
    ctx.fillStyle = 'rgb(255,50,0)';
    ctx.fillRect(xy(apple[1]), xy(apple[0]), xy(1), xy(1));

    if(frontier.length == 0) {
        state.calcPath = false;
        state.frontier = [];
    }
};

const willEat = ({ size, snake, apple, score }) => {
   state.score += 10; 
   state.apple = [Math.floor(Math.random()* size), Math.floor(Math.random()* size)];
   while(snake.some(e => e[0] == state.apple[0] && e[1] == state.apple[1])) {
    state.apple = [Math.floor(Math.random()* size), Math.floor(Math.random()* size)];
   }
   
};

const willCollide = () => {
    console.log("game over");
    process.exit()
};

const moveSnake = ({ path, size, snake, apple, direction, snakeDirection }) => {

    const nextMove = path.shift();
    if(snake.some(e => pointEq(e, nextMove))) {
        willCollide()
    }
    snake.unshift(nextMove)
    
    if (pointEq(snake[0], apple)) {
        willEat(state);
        state.calcPath = true;
    } else {
        snake.pop();
    }
    state.path = pathFinderAStar(state);
}


const step = t1 => t2 => {
    if(state.calcPath) {
        
        if( t2 - t1 > 20 ) {
            
            drawFrontier(state, state.frontier);
            window.requestAnimationFrame(step(t2))
        }
        else {
            window.requestAnimationFrame(step(t1))
        }
    } else {
        if( t2 - t1 > 20 ) {
            moveSnake(state);
            draw(state);
            console.log(state);
            window.requestAnimationFrame(step(t2))
        }
        else {
            window.requestAnimationFrame(step(t1))
        }
    }
};


state.path = pathFinderAStar(state);

draw(state)
window.requestAnimationFrame(step(0))

