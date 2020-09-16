// main canvas
const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')
const WIDTH = canvas.width
const HEIGHT = canvas.height

// auxillary canvas (image holder)
const name = document.querySelector('#name')
const nameCtx = name.getContext('2d')
const IMAGE_WIDTH = name.width
const IMAGE_HEIGHT = name.height


// params
const RADIUS = 2                 // radius of the balls
const TRACKING_SPEED = 2         // tracking speed of the balls
const RESOLUTION = 16            // higher value, lower resolution
const COLOR_THRESHOLD = 200      // higher value, less color-sensitivity
const MOUSE_SURROUND_RADIUS = 10 // radius of the balls surrounding mouse
const TRACKING_DELAY = 30        // delay time of the tracking interval
const RESUME_DELAY = 10          // delay time of the resuming interval

// array for balls
let ballPool = []

// image to be simulated
const image = new Image()
image.src = "alphabets/name.jpg"
console.log(image)

// clear canvas
function clear() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
}

// class for creating balls
function Circle(xpos, ypos) {
  this.x = xpos
  this.y = ypos
  this.r = RADIUS
  this.initX = xpos // initial positions
  this.initY = ypos // 

  // draw at (_x, _y) and change current position of the ball
  this.draw = (_x, _y) => {
    this.x = _x
    this.y = _y
    ctx.moveTo(this.x, this.x);
    ctx.beginPath();
    ctx.fillStyle = 'black'
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI)
    ctx.fill()
  }

  // move the ball towards the destination by small amount of distance
  this.move = (destX, destY) => {
    let dx = (destX - this.x) / 10 * TRACKING_SPEED
    let dy = (destY - this.y) / 10 * TRACKING_SPEED
    this.draw(this.x + dx, this.y + dy)
    // console.log(dx, dy)
  }

}

// prepare image, create and place the balls according to the image
function init() {
  // draw image on image holder canvas
  nameCtx.fillStyle = "#00000000"
  nameCtx.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
  nameCtx.drawImage(image, 0, 0)
  // get image pixelated data, 4 value in a point
  imageData = nameCtx.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT)
  // console.log(imageData)

  let xpos, ypos

  // create balls according to calculated position
  for (let i = 0; i < imageData.data.length; i += RESOLUTION) {
    let [r, g, b, a] = imageData.data.slice(i, i + 4)
    let avg = (r + g + b) / 3
    if (avg > COLOR_THRESHOLD) {
      xpos = Math.floor(i / 4) % imageData.width + (WIDTH - IMAGE_WIDTH) / 2
      ypos = Math.floor(Math.floor(i / 4) / imageData.width) + (HEIGHT - IMAGE_HEIGHT) / 2

      let ball = new Circle(xpos, ypos)
      ball.draw(xpos, ypos)
      ballPool.push(ball)
    }
  }
  // console.log(ballPool)
}

window.onload = function () {
  // track mouse position
  let startTracking = false
  // track mouse / initial image position
  let trackInterval, resumeInterval
  // mouse position (updated every mousemove)
  let mouseX, mouseY

  init()

  canvas.addEventListener('mouseenter', () => {
    startTracking = true
    clearInterval(resumeInterval)

    trackInterval = setInterval(() => {
      if (!startTracking) return
      clear()

      ballPool.forEach(ball => {
        // distribute balls by their initX to radians (angle)
        let theta = (ball.initX % 360) / 360 * 2 * Math.PI
        let newX, newY
        newX = mouseX + MOUSE_SURROUND_RADIUS * Math.cos(theta)
        newY = mouseY + MOUSE_SURROUND_RADIUS * Math.sin(theta)
        // add a randomly moving factor
        if ((Math.abs(ball.x - mouseX) + Math.abs(ball.y - mouseY)) > MOUSE_SURROUND_RADIUS * 40) {
          newX += 100 * Math.cos(Math.random() * 2 * Math.PI)
          newY += 100 * Math.sin(Math.random() * 2 * Math.PI)
        }
        // surround the mouse by the balls
        ball.move(
          newX,
          newY
        )
      })
    }, TRACKING_DELAY);
  })

  canvas.addEventListener('mouseout', () => {
    startTracking = false
    clearInterval(trackInterval)

    resumeInterval = setInterval(() => {
      if (startTracking) return
      clear()

      // move the balls back to initial position
      ballPool.forEach(ball => {
        ball.move(ball.initX, ball.initY)
      })
    }, RESUME_DELAY);
  })

  canvas.addEventListener('mousemove', (e) => {
    // update mouse position
    mouseX = e.offsetX
    mouseY = e.offsetY
  })

}