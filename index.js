//inicijalizacija canvasa
let canvas;
let canvasWidth = 700;
let canvasHeight = 600;
let context;

//glavne postavke za paddle
let playerWidth = 100;
let playerHeight = 10;
let playerVelocityX = 10;

//struktura paddle kojoj ce se onda izmjenjivati vrijednotsi kako se pomice
let paddle = { 
    x: canvasWidth / 2 - playerWidth / 2,
    y: canvasHeight - playerHeight,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX
};

//glavne postavke za ball
let ballWidth = 10;
let ballHeight = 10;

//struktura za ball kojoj ce se onda izmjenjivati vrijednosti kako se pomice
let ball = {
    x: paddle.x + paddle.width / 2 - ballWidth / 2,
    y: paddle.y - ballHeight,
    width: ballWidth,
    height: ballHeight,
    velocityX: 3 * (Math.random() < 0.5 ? -1 : 1),
    velocityY: -3
};

//glavne postavke za polje blockova
let blockArray = []
//blockovi velicine 40x15
let blockHeight = 15
let blockWidth = 40
let blockColumns = 10
let blockRows = 5
let blockCount = 0

//od tu se krecu crtati
let blockX = 15
let blockY = 45

let score = 0
let gameStarted = false
let gameOver = false

//spremanje najboljeg scora do sad u local storage
let bestScore = localStorage.getItem("bestScore") ? parseInt(localStorage.getItem("bestScore")) : 0

//glavna funkcija od koje se krece ucitavanje igre pri ucitavanju stranice
window.onload = function() {
    canvas = document.getElementById("canvas")
    canvas.height = canvasHeight
    canvas.width = canvasWidth
    context = canvas.getContext("2d")

    requestAnimationFrame(draw);
    //slusamo koja se tipka pritisce
    document.addEventListener("keydown", play)

    blockSpawn()
};

function draw() {
    requestAnimationFrame(draw)
    
    //ako igra jos nije pocela ispisuje se breakout press space to begin
    if (!gameStarted) {
        context.fillStyle = "white"
        context.font = "bold 36px Verdana"
        context.textAlign = "center"
        context.fillText("BREAKOUT", canvasWidth / 2, canvasHeight/2)

        context.font = "bold italic 18px Verdana"
        //18 + 10px razlike = 28
        context.fillText("Press SPACE to begin", canvasWidth / 2, canvasHeight/2 + 28)
        return
    }

    //ako su svi blockovi rjeseni ispisuje se YOU WIN :D poruka
    if(blockCount == 0) {
        context.font = "40px Verdana bold"
        context.textAlign = "center"
        context.fillStyle = "white"
        context.fillText("YOU WIN :D", canvasWidth / 2, canvasHeight / 2)
        return
    }
    
    //ako je loptica pala dolje gubi se igra
    if(gameOver) {
        context.fillStyle = "yellow"
        context.font = "bold 40px Verdana"
        context.textAlign = "center"
        context.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2)
        return
    }

    //brise se trenutne stvari i crta se opet sve i tako u krug
    context.clearRect(0, 0, canvas.width, canvas.height)

    //3d efekt sa sjenom
    context.shadowColor = "rgba(175, 201, 241, 0.84)"
    context.shadowBlur = 6
    context.fillStyle = "lightgray"
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)

    //crtanje loptice
    context.fillStyle = "white"
    ball.x += ball.velocityX
    ball.y += ball.velocityY
    context.fillRect(ball.x, ball.y, ball.width, ball.height)

    if (ball.y <= 0) {
        ball.velocityY *= -1
    } else if (ball.x <= 0 || (ball.x + ball.width) >= canvasWidth) {
        ball.velocityX *= -1
    } else if (ball.y + ball.height >= canvasHeight) {
        //loptica se lupila u donji dio 
        gameOver = true
    } 

    //provjera kolizija loptice i paddlea 
    if (collide(ball, paddle)) {
        ball.velocityY *= -1
    }

    //crtanje blockova
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i]
        if(!block.break) {
            context.fillStyle = block.color
            context.fillRect(block.x, block.y, block.width, block.height)


            //provjere je li se loptica sudarila sa nekim od blockova
            if(topCollision(ball, block) || bottomCollision(ball, block)) {
                //lupljeni block postaje lupljen i mijenja se smjer loptice 
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

        }
    }

    //postavljanje novog najboljeg scora
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
    }

    //ispis trenutnog i najboljeg scora
    context.shadowColor = null
    context.shadowBlur = 0
    context.font = "20px Verdana"
    context.fillStyle = "white"
    context.textAlign = "left"
    context.fillText("Score: " + score, 20, 20)
    context.textAlign = "right"
    context.fillText("Best: " + bestScore, canvasWidth - 100, 20)
}

function play(e) {
    if (!gameStarted && e.code === "Space") {
        //pocetak igre
        gameStarted = true
        return
    }

    if (gameOver) return;

    //kretanje paddlea sa strelicama lijevo desno
    if (e.code === "ArrowLeft") {
        let nextX = paddle.x - paddle.velocityX
        if (nextX >= 0) paddle.x = nextX
    } else if (e.code === "ArrowRight") {
        let nextX = paddle.x + paddle.velocityX
        if (nextX + paddle.width <= canvasWidth) paddle.x = nextX
    }
}

//ovaj dio mi je pomogao youtube jer sam se gubila u svim tim provjerama :D
function collide(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function topCollision(ball, block) {
    return collide(ball, block) &&
           ball.y + ball.height >= block.y &&
           ball.y < block.y;
}

function bottomCollision(ball, block) {
    return collide(ball, block) &&
           block.y + block.height >= ball.y &&
           block.y < ball.y;
}

function leftCollision(ball, block) {
    return collide(ball, block) &&
           ball.x + ball.width >= block.x &&
           ball.x < block.x;
}

function rightCollision(ball, block) {
    return collide(ball, block) &&
           block.x + block.width >= ball.x &&
           block.x < ball.x;
}

//stvaranje blockova, njih 50 
function blockSpawn() {
    blockArray = []
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let color;
            if (r === 0) color = "rgb(153, 51, 0)"
            else if (r === 1) color = "rgb(255, 0, 0)"
            else if (r === 2) color = "rgb(255, 153, 204)"
            else if (r === 3) color = "rgb(0, 255, 0)"
            else if (r === 4) color = "rgb(255, 255, 153)"

            //razmak izn+medu blockova 30 x 15px
            let block = {
                x: blockX + c*blockWidth + c*30,
                y: blockY + r*blockHeight + r*15,
                width: blockWidth,
                height: blockHeight,
                color: color,
                //trenutno jos nisu lupljeni
                break: false
            }
            blockArray.push(block)
        }
    }
    blockCount = blockArray.length
}
