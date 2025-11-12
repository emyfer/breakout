let canvas;
let boardWidth = 700;
let boardHeight = 600;
let context;

let playerWidth = 100;
let playerHeight = 10;
let playerVelocityX = 10;

let paddle = { 
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX
};

let ballWidth = 10;
let ballHeight = 10;


let ball = {
    x: paddle.x + paddle.width / 2 - ballWidth / 2,
    y: paddle.y - ballHeight,
    width: ballWidth,
    height: ballHeight,
    velocityX: 3 * (Math.random() < 0.5 ? -1 : 1),
    velocityY: -3
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
    canvas = document.getElementById("canvas")
    canvas.height = boardHeight
    canvas.width = boardWidth
    context = canvas.getContext("2d")

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

    if(blockCount == 0) {
        context.font = "40px Verdana bold"
        context.textAlign = "center"
        context.fillStyle = "white"
        context.fillText("YOU WIN :D", boardWidth / 2, boardHeight / 2)
        return
    }
    
    if(gameOver) {
        context.fillStyle = "white"
        context.font = "bold 30px Verdana"
        context.textAlign = "center"
        context.fillText("GAME OVER", boardWidth / 2, boardHeight / 2)
        return
    }

    context.clearRect(0, 0, canvas.width, canvas.height)

    context.shadowColor = "rgba(175, 201, 241, 0.84)"
    context.shadowBlur = 4
    context.shadowOffsetX = 2
    context.shadowOffsetY = 2 
    context.fillStyle = "lightgray"
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)

    context.fillStyle = "white"
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

    if (detectCollision(ball, paddle)) {
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


    context.shadowColor = null
    context.shadowBlur = 0
    context.shadowOffsetX = 0 
    context.shadowOffsetY = 0
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
        let nextX = paddle.x - paddle.velocityX
        if (nextX >= 0) paddle.x = nextX
    } else if (e.code === "ArrowRight") {
        let nextX = paddle.x + paddle.velocityX
        if (nextX + paddle.width <= boardWidth) paddle.x = nextX
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
