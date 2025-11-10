let board;
let boardWidth = 700;
let boardHeight = 500;
let context;

let playerWidth = 80;
let playerHeight = 10;
let playerVelocityX = 10;

let player = { 
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX
};

let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 3;
let ballVelocityY = 2;

let ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: ballVelocityX,
    velocityY: ballVelocityY
};

let blockArray = []
let blockHeight = 15
let blockWidth = 40
let blockColumns = 10
let blockRows = 5
let blockCount = 0

let blockX = 15
let blockY = 45

let score = 0
let gameStarted = false
let gameOver = false

let bestScore = localStorage.getItem("bestScore") ? parseInt(localStorage.getItem("bestScore")) : 0

window.onload = function() {
    board = document.getElementById("board")
    board.height = boardHeight
    board.width = boardWidth
    context = board.getContext("2d")

    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer)

    createBlocks()
};

function update() {
    requestAnimationFrame(update)
    
    if (!gameStarted) {
        context.fillStyle = "white"
        context.font = "bold 36px Verdana"
        context.textAlign = "center"
        context.fillText("BREAKOUT", boardWidth / 2, 220)

        context.font = "bold italic 18px Verdana"
        context.fillText("Press SPACE to begin", boardWidth / 2, 260)
        return
    }
    
    if(gameOver) {
        context.fillStyle = "white"
        context.font = "bold 30px Verdana"
        context.textAlign = "center"
        context.fillText("GAME OVER", boardWidth / 2, boardHeight / 2)
        return
    }

    context.clearRect(0, 0, board.width, board.height)

    context.fillStyle = "lightgreen"
    context.fillRect(player.x, player.y, player.width, player.height)

    context.fillStyle = "lightgray"
    ball.x += ball.velocityX
    ball.y += ball.velocityY
    context.fillRect(ball.x, ball.y, ball.width, ball.height)

    if (ball.y <= 0) {
        ball.velocityY *= -1
    } else if (ball.x <= 0 || (ball.x + ball.width) >= boardWidth) {
        ball.velocityX *= -1
    } else if (ball.y + ball.height >= boardHeight) {
        gameOver = true
    } 

    if (detectCollision(ball, player)) {
        ball.velocityY *= -1
    }

    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i]
        if(!block.break) {
            context.fillStyle = block.color

            if(topCollision(ball, block) || bottomCollision(ball, block)) {
                block.break = true
                ball.velocityY *= -1
                blockCount -= 1
                score += 1
            } 
            else if(leftCollision(ball, block) || rightCollision(ball, block)) {
                block.break = true
                ball.velocityX *= -1
                blockCount -= 1
                score += 1
            }

            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem("bestScore", bestScore);
            }

            context.fillRect(block.x, block.y, block.width, block.height)
        }
    }

    if(blockCount == 0) {
        gameOver = true
        context.font = "40px Verdana bold"
        context.textAlign = "center"
        context.fillText("YOU WIN :D", boardWidth / 2, boardHeight / 2)
    }

    context.font = "20px Verdana"
    context.fillStyle = "white"
    context.textAlign = "left"
    context.fillText("Score: " + score, 20, 20)
    context.textAlign = "right"
    context.fillText("Best: " + bestScore, boardWidth - 100, 20)
}

function movePlayer(e) {
    if (!gameStarted && e.code === "Space") {
        gameStarted = true
        return
    }

    if (gameOver) return;

    if (e.code === "ArrowLeft") {
        let nextX = player.x - player.velocityX
        if (nextX >= 0) player.x = nextX
    } else if (e.code === "ArrowRight") {
        let nextX = player.x + player.velocityX
        if (nextX + player.width <= boardWidth) player.x = nextX
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function topCollision(ball, block) {
    return detectCollision(ball, block) &&
           ball.y + ball.height >= block.y &&
           ball.y < block.y;
}

function bottomCollision(ball, block) {
    return detectCollision(ball, block) &&
           block.y + block.height >= ball.y &&
           block.y < ball.y;
}

function leftCollision(ball, block) {
    return detectCollision(ball, block) &&
           ball.x + ball.width >= block.x &&
           ball.x < block.x;
}

function rightCollision(ball, block) {
    return detectCollision(ball, block) &&
           block.x + block.width >= ball.x &&
           block.x < ball.x;
}

function createBlocks() {
    blockArray = []
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let color;
            if (r === 0) color = "rgb(153, 51, 0)"
            else if (r === 1) color = "rgb(255, 0, 0)"
            else if (r === 2) color = "rgb(255, 153, 204)"
            else if (r === 3) color = "rgb(0, 255, 0)"
            else if (r === 4) color = "rgb(255, 255, 153)"

            let block = {
                x: blockX + c*blockWidth + c*30,
                y: blockY + r*blockHeight + r*15,
                width: blockWidth,
                height: blockHeight,
                color: color,
                break: false
            }
            blockArray.push(block)
        }
    }
    blockCount = blockArray.length
}
