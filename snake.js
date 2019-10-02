class Snake {

    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');

        //nerual network stuff
        this.inputs = 25;
        this.hidden = 45;
        this.outputs = 3;
        this.data = []

        // snake state. rise up!
        this.state = {
            time: 0,
            size: 10,
            snake: [[3, 1], [3, 0]], // index 0 is row, index 1 is columns
            apple: [1, 9],
            score: 0,
            frontier: [],
            calcPath: false,
            path: [],
            pathfinding: "aStar",
            vision: 3,
            lifetime: 0,
            leftToLive: 100
        }
    }




    // helper functions
    xy = c => Math.round(c * this.canvas.width / this.state.size);
    pointEq = (x, y) => (x[0] == y[0] && x[1] == y[1]) ? true : false;
    pointObjEq = (x, y) => (x.x == y.x && x.y == y.y) ? true : false;
    calcDistance = (x1, x2, y1, y2) => (x2 - x1 > (0.5 * this.state.size) ? this.state.size - (x2 - x1) : x2 - x1) + (y2 - y1 > (0.5 * this.state.size) ? this.state.size - (y2 - y1) : y2 - y1);

    //#region code

    getVision = () => {
        const { vision, snake, apple, size } = this.state;
        const range = Math.floor(vision / 2);
        let vis = [];

        for (let i = 0; i < vision; i++) {
            for (let j = 0; j < vision; j++) {
                let cord = [];


                if (snake[0][0] + i - range <= -1) {
                    cord.push(size + snake[0][0] + i - range);
                } else if (snake[0][0] + i - range >= size) {
                    cord.push(snake[0][0] + i - range - 1);
                } else {
                    cord.push(snake[0][0] + i - range)
                }

                if (snake[0][1] + j - range <= -1) {
                    cord.push(size + snake[0][1] + j - range);
                } else if (snake[0][1] + j - range >= size) {
                    cord.push(snake[0][1] + j - range - 1);
                } else {
                    cord.push(snake[0][1] + j - range)
                }

                if (snake.find(s => pointEq(s, cord))) {
                    vis.push(-1);
                } else if (pointEq(apple, cord)) {
                    vis.push(1)
                } else {
                    vis.push(0)
                }

            }
        }
        return vis;
    }

    // calculates the next available moves
    moves = (node, allNodes, bool) => {
        const { size } = this.state;
        const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];  //0 = north, 1 = east, 2 south, 3 west
        let result = [];
        directions.forEach(d => {
            let newEdge;
            if (node[0] + d[0] == -1) {
                newEdge = [size - 1, node[1]];
            } else if (node[0] + d[0] == size) {
                newEdge = [0, node[1]]
            } else if (node[1] + d[1] == -1) {
                newEdge = [node[0], size - 1]
            } else if (node[1] + d[1] == size) {
                newEdge = [node[0], 0]
            } else {
                newEdge = [node[0] + d[0], node[1] + d[1]]
            }
            const edge = allNodes.find(n => this.pointEq(n, newEdge));
            if (bool) {
                if (edge) {
                    result.push(edge)
                }
            } else {
                if (edge == undefined) {
                    result.push(newEdge)
                }
            }
        });

        return result;
    }

    // djikstra/breadth first pathfinding
    pathFinder = ({ snake, apple, size }) => {

        let nodes = [];

        for (let i = 0; i < size; i++) {
            for (let y = 0; y < size; y++) {
                if (!snake.some(s => s[0] == i && s[1] == y)) {
                    nodes.push([i, y]);
                }
            }
        }

        let frontier = [snake[0]];
        let visited = new Map();
        visited.set(snake[0], null)
        let current;
        while (frontier.length != 0) {
            current = frontier.shift();
            if (pointEq(current, apple)) {
                break;
            }
            const newEdges = moves(current, nodes, true);
            newEdges.forEach(e => {
                if (!visited.has(e)) {
                    frontier.push(e);
                    visited.set(e, current);
                    if (state.calcPath) {
                        state.frontier.push(frontier.map(f => { return { x: f[0], y: f[1] } }))
                    }
                }
            });

        }

        let path = [];
        while (current != snake[0]) {
            path.unshift(current);
            current = visited.get(current);
        }
        if (path.length == 0) {
            const nextMoves = moves(snake[0], snake, false);

            if (nextMoves.length == 0) {
                willCollide()
            } else {
                path.push(nextMoves[Math.floor(Math.random() * nextMoves.length)])
            }
        }
        return path;
    }

    // calculates the next available moves with distance relative to the apple
    movesWithDistance = (node, allNodes) => {
        const { size } = this.state;
        const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];  //0 = north, 1 = east, 2 south, 3 west
        let result = [];
        directions.forEach(d => {
            let newEdge;
            if (node.x + d[0] == -1) {
                newEdge = {
                    x: size - 1,
                    y: node.y,
                    distance: 0
                };
            } else if (node.x + d[0] == size) {
                newEdge = {
                    x: 0,
                    y: node.y,
                    distance: 0
                }
            } else if (node.y + d[1] == -1) {
                newEdge = {
                    x: node.x,
                    y: size - 1,
                    distance: 0
                }
            } else if (node.y + d[1] == size) {
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

            const edge = allNodes.find(n => this.pointObjEq(n, newEdge));

            if (edge) {
                if (edge.x > this.state.apple[0]) {
                    if (edge.y > this.state.apple[1]) {
                        edge.distance = this.calcDistance(this.state.apple[0], edge.x, this.state.apple[1], edge.y);
                    } else {
                        edge.distance = this.calcDistance(this.state.apple[0], edge.x, edge.y, this.state.apple[1]);
                    }
                } else {
                    if (edge.y > this.state.apple[1]) {
                        edge.distance = this.calcDistance(edge.x, this.state.apple[0], this.state.apple[1], edge.y);
                    } else {
                        edge.distance = this.calcDistance(edge.x, this.state.apple[0], edge.y, this.state.apple[1]);
                    }
                }
                result.push(edge)
            }
        });

        return result;
    }

    // A star pathfinding
    pathFinderAStar = ({ snake, apple, size }) => {

        let nodes = [];

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                if (!snake.some(s => s[0] == x && s[1] == y)) {
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
        while (frontier.length != 0) {

            current = frontier.shift();
            //console.log(current);
            if (this.pointEq([current.x, current.y], apple)) {
                break;
            }
            const newEdges = this.movesWithDistance(current, nodes);

            newEdges.forEach(e => {
                if (!visited.has(e)) {
                    frontier.push(e);

                    //TODO: frontier shouldnt be sorted each time, just insert the new edge at the correct index
                    frontier.sort((a, b) => a.distance - b.distance);
                    visited.set(e, current);
                    if (this.state.calcPath) {
                        this.state.frontier.push(frontier.map(f => f))
                    }
                }
            });

        }

        let path = [];
        while (current != end) {
            path.unshift([current.x, current.y]);
            current = visited.get(current);
        }
        if (path.length == 0) {
            const nextMoves = this.moves(snake[0], snake, false);

            if (nextMoves.length == 0) {
                this.willCollide()
            } else {
                path.push(nextMoves[Math.floor(Math.random() * nextMoves.length)])
            }
        }
        //console.log(path);
        return path;
    }

    // draws the current state of the game to the canvas, and draws the frontier if supplied
    draw = ({ snake, apple }, frontier = null) => {

        // background
        this.ctx.fillStyle = '#232323';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // snake
        this.ctx.fillStyle = 'rgb(0,200,50)';
        snake.map(s => this.ctx.fillRect(this.xy(s[1]), this.xy(s[0]), this.xy(1), this.xy(1)));

        // snakes eyes
        this.ctx.fillStyle = '#232323';
        this.ctx.fillRect(this.xy(snake[0][1]) + this.xy(0.4), this.xy(snake[0][0]) + this.xy(0.15), this.xy(0.2), this.xy(0.2))
        this.ctx.fillRect(this.xy(snake[0][1]) + this.xy(0.4), this.xy(snake[0][0]) + this.xy(0.65), this.xy(0.2), this.xy(0.2))

        //frontier
        if (frontier) {
            this.ctx.fillStyle = '#fefefe';
            const newFrontier = this.frontier.shift();
            newFrontier.map(f => this.ctx.fillRect(this.xy(f.y), this.xy(f.x), this.xy(1), this.xy(1)));
            if (this.frontier.length == 0) {
                state.calcPath = false;
                state.frontier = [];
            }
        }

        // apple
        this.ctx.fillStyle = 'rgb(255,50,0)';
        this.ctx.fillRect(this.xy(apple[1]), this.xy(apple[0]), this.xy(1), this.xy(1));

    };

    // called when the snake will eat the apple. calculates a random cords for a new apple
    willEat = ({ size, snake }) => {
        this.state.score += 10;
        this.state.apple = [Math.floor(Math.random() * size), Math.floor(Math.random() * size)];
        while (snake.some(e => e[0] == this.state.apple[0] && e[1] == this.state.apple[1])) {
            this.state.apple = [Math.floor(Math.random() * size), Math.floor(Math.random() * size)];
        }

    };

    // called when the snake collides with itself
    willCollide = () => {
        console.log("game over");

        // TODO: add a real game over that doesnt just crash
        process.exit()
    };

    // moves the snake and calls the relevant functions, then calculates a new path
    moveSnake = ({ path, snake, apple }) => {

        const nextMove = path.shift();
        if (snake.some(e => this.pointEq(e, nextMove))) {
            willCollide()
        }
        snake.unshift(nextMove)

        if (this.pointEq(snake[0], apple)) {
            this.willEat(this.state);
            this.state.calcPath = true;
        } else {
            snake.pop();
        }

        if (this.state.pathfinding == "breadth first") {
            this.state.path = this.pathFinder(this.state);
        } else {
            this.state.path = this.pathFinderAStar(this.state);
        }
    }

    // controls the pace of the game. adjust if statements to increase/decrease game speed
    step = t1 => t2 => {

        //draws the path progression
        if (false
            //state.calcPath
        ) {

            if (t2 - t1 > 20) {

                this.draw(this.state, this.state.frontier);
                window.requestAnimationFrame(step(t2))
            }
            else {
                window.requestAnimationFrame(step(t1))
            }
        } else { // controls the game
            if (t2 - t1 > 20) {
                this.moveSnake(this.state);
                this.draw(this.state);
                window.requestAnimationFrame(this.step(t2))
            }
            else {
                window.requestAnimationFrame(this.step(t1))
            }
        }
    };

    //#endregion

}