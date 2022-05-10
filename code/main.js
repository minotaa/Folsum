import kaboom from "kaboom"
import rooms from './rooms'
import enemiesData from './enemies.json'

kaboom({
  height: 640,
  width: 640,
  background: [0, 0, 0],
  font: 'MidSim'
})

loadFont("MidSim", "sprites/MidSimFont2.png", 10, 10, {chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz:;><^%-.!?/()[]\"'|1234567890"});
loadSprite("bean", "sprites/bean.png")
loadSprite("bag", "sprites/bag.png")
loadSprite("ghosty", "sprites/ghosty.png")
loadSprite("mark", "sprites/mark.png")
loadSprite("steel", "sprites/steel.png")

layers([
  "bg",
  "game",
  "ui",
], "game")

scene('title', () => {
  add([
    rect(width(), height()),
    color(0, 0, 0),
    pos(width() / 2, height() / 2),
    origin('center'),
    outline(5, Color.WHITE)
  ])
  loop(0.5, () => {
    let amount = randi(15, 100)
    for (let i = 0; i < amount; i++) {
      let x = randi(-850, 850)
      let y = randi(-650, 650)
      let size = rand(1, 5)
      let particle = add([
        circle(size),
        pos(x, y),
        lifespan(1, { fade: 0.75 }),
        move(RIGHT, 20),
        layer("bg")
      ])
    }
  })
  add([
    text('folsum', {
      size: 48
    }),
    origin('center'),
    pos(width() / 2, (height() / 2) - 125),
    layer('ui')
  ])
  let start = add([
    text('start!', {
      size: 36
    }),
    area(),
    origin('center'),
    pos(width() / 2, (height() / 2) + 25),
    layer('ui')
  ])
  let options = add([
    text('options', {
      size: 36
    }),
    area(),
    origin('center'),
    pos(width() / 2, (height() / 2) + 100),
    layer('ui')
  ])
  start.onHover(() => {
    start.text = "> start! <"
  }, () => {
    start.text = "start!"
  })
  start.onClick(() => {
    options.hidden = true
    start.color = rgb(0, 255, 8)
    wait(0.15, () => {
      start.color = rgb(255, 255, 255)
      wait(0.15, () => {
        start.color = rgb(0, 255, 8)
        wait(0.15, () => {
          start.color = rgb(255, 255, 255)
          wait(0.15, () => {
            start.color = rgb(0, 255, 8)
            wait(0.15, () => {
              start.color = rgb(255, 255, 255)
              console.log('done')
              go('game')
            })
          })
        })
      })
    })
  })
  options.onClick(() => {
    start.hidden = true
    options.color = rgb(0, 255, 8)
    wait(0.15, () => {
      options.color = rgb(255, 255, 255)
      wait(0.15, () => {
        options.color = rgb(0, 255, 8)
        wait(0.15, () => {
          options.color = rgb(255, 255, 255)
          wait(0.15, () => {
            options.color = rgb(0, 255, 8)
            wait(0.15, () => {
              options.color = rgb(255, 255, 255)
              console.log('done')
              go('options')
            })
          })
        })
      })
    })
  })
  options.onHover(() => {
    options.text = "> options <"
  }, () => {
    options.text = "options"
  })
  let item = add([
    sprite('mark', {
      height: 64,
      width: 64
    }),
    pos(width() / 2, (height() / 2) + 205),
    layer('ui'),
    origin('center'),
    area(),
    rotate(0)
  ])
  let speed = 120
  item.onUpdate(() => {
  	item.angle += speed * dt() 
  })
  item.onClick(() => {
    speed += 5
  })
})

scene('options', () => {
  
})

// 0: Closed room
// 1: Room with door on right
let player = add([
  sprite('mark', {
    height: 64,
    width: 64
  }),
  area(),
  pos(center()),
  solid(),
  layer("game"),
  "player", 
  opacity(1),
  stay(),
  z(100),
  { invincible: null }
])

player.hidden = true

function generateRoom(id) {
  addLevel(rooms[id + 1].room, {
    width: 32,
    height: 32,
    pos: vec2(-32, -32),
    "+": () => [
      rect(32, 32),
      area(),
      solid(),
      layer("bg"),
      "wall"
    ], 
    "$": () => [
      color(0, 255, 0),
      rect(32, 32),
      area(),
      layer("bg"),
      "trigger"
    ]
  })
  generateEnemies(rooms[id + 1].enemies)
}


function generateEnemies(enemies) {
  let i = 0 
  for (enemy in enemies) {
    let y = (height() / 2) + 100
    let x
    if (i === 0 && enemies.length === 1) x = width() / 2
    if (i === 0 && enemies.length === 2) x = (width() / 2) - 40
    if (i === 1 && enemies.length === 2) x = (width() / 2) + 40
    if (i === 0 && enemies.length === 3) x = (width() / 2) - 60
    if (i === 1 && enemies.length === 3) x = (width() / 2)
    if (i === 2 && enemies.length === 3) x = (width() / 2) + 60
    if (i === 0 && enemies.length === 4) x = (width() / 2) - 120
    if (i === 1 && enemies.length === 4) x = (width() / 2) - 40
    if (i === 2 && enemies.length === 4) x = (width() / 2) + 40
    if (i === 3 && enemies.length === 4) x = (width() / 2) + 120
    console.log(enemies[enemy])
    let e = add([
      sprite(enemiesData[enemies[enemy]].sprite, {
        height: 64,
        width: 64
      }),
      area(),
      pos(x, y),
      layer('game'),
      "enemy",
      solid(),
      state("move", [ "attack", "move" ]),
      { 
        health: enemiesData[enemies[enemy]].health,
        name: enemiesData[enemies[enemy]].name,
        speed: enemiesData[enemies[enemy]].speed
      }
    ])
    
    e.onStateUpdate("move", () => {
      const dir = player.pos.sub(e.pos).unit()
      e.move(dir.scale(e.speed))
      if (e.pos.dist(player.pos) <= 200) {
        e.enterState("attack")
      }
    })

    e.onStateEnter("attack", async () => {
      await wait(2)
      if (e.exists()) {
        let mid = vec2(e.pos.x + 16, e.pos.y + 16)
        add([
          "enemyBullet",
          color(255, 0, 0),
          rect(10, 10),
          pos(mid),
          area(),
          cleanup(1),
          move(player.pos.angle(e.pos), 600)
        ])
        e.enterState("move") 
      }
    })
    i++
  }
  every("enemy", (e) => {
    e.enterState("move")
  })
}

scene('game', () => {
  add([
    rect(width(), height()),
    color(0, 0, 0),
    pos(width() / 2, height() / 2),
    origin('center'),
    outline(5, Color.WHITE),
    layer("ui"),
    fixed()
  ])

  
  generateRoom(0)

  add([
    rect(425, 75),
    pos(width() - 50, height() - 50),
    origin('center'),
    layer("ui"),
    color(255, 255, 255),
    opacity(0.1),
    fixed()
  ])

  player.onUpdate(() => {
    camPos(player.pos)
    if (player.hidden == true) player.hidden = false
  })
  
  let keys = ["w", "a", "s", "d", "up", "left", "down", "right", "shift"]
  onUpdate(() => {
    let speed = 200
    if (isKeyDown("shift") && stamina > 0) {
      speed = 400
    }
    if (isKeyDown("w") || isKeyDown("up")) {
      player.move(0, -speed)
    }
    if (isKeyDown("s") || isKeyDown("down")) {
      player.move(0, speed)
    }
    if (isKeyDown("a") || isKeyDown("left")) {
      player.move(-speed, 0)
    }
    if (isKeyDown("d") || isKeyDown("right")) {
      player.move(speed, 0)
    }
  })

  onClick(() => {
    let mid = vec2(player.pos.x + 16, player.pos.y + 16)
    add([
      "bullet",
      color(255, 255, 255),
      rect(10, 10),
      pos(mid),
      area(),
      cleanup(1),
      move(toWorld(mousePos()).angle(player.pos), 600)
    ]) 
  })
  
  onKeyPress("space", () => {
    let mid = vec2(player.pos.x + 16, player.pos.y + 16)
    add([
      "bullet",
      color(255, 255, 255),
      rect(10, 10),
      pos(mid),
      area(),
      cleanup(1),
      move(toWorld(mousePos()).angle(player.pos), 600)
    ]) 
  })

  onCollide("bullet", "wall", (bullet, wall) => {
    bullet.destroy()
  })

  onCollide("player", "trigger", (player, trigger) => {
    
  })
  
  onCollide("bullet", "enemy", (bullet, enemy) => {
    enemy.health -= 1
    bullet.destroy()
    shake(1)
    if (enemy.health === 0) {
      enemy.destroy()
      shake(10)
      if (debug.inspect) debug.log(`Destroyed ${enemy.name}`)
    }
  })
  
  loop(1, () => {
    if (player.invincible != null) {
      player.invincible -= 1
      wait(0.08, () => {
        player.opacity = 0
        wait(0.08, () => {
          player.opacity = 1
        })
      })
      if (player.invincible == 0) {
        player.invincible = null
        player.opacity = 1
      }
    }
  })
  
  onCollide("player", "enemy", (player, enemy) => {
    if (player.invincible != null) return
    health -= 5
    healthLabel.text = `${health} HP`
    shake(12)
    player.invincible = 4
    if (health == 0) {
      health = 100
      healthLabel.text = `${health} HP`
      debug.log("insert game over logic")
    }
  })

  onCollide("player", "enemyBullet", (player, enemy) => {
    if (player.invincible != null) return
    health -= 10
    enemy.destroy()
    healthLabel.text = `${health} HP`
    shake(15)
    player.invincible = 5
    if (health == 0) {
      health = 100
      healthLabel.text = `${health} HP`
      debug.log("insert game over logic")
    }
  })
  
  let label

  onUpdate(() => {
    if (label != null && label.text == '0 HP') {
      label.destroy
      label = null
    }
  })
  
  onUpdate("enemy", (enemy) => {
    if (enemy.isHovering()) {
      if (label == null) {
          label = add([
          text(`${enemy.health} HP`, {
            size: 12
          }),
          pos(enemy.pos.x + 16, (enemy.pos.y + 16) - 32)
        ])
      } else {
        label.text = `${enemy.health} HP`
        label.pos = vec2(enemy.pos.x + 16, (enemy.pos.y + 16) - 32)
        if (enemy.health === 0) {
          label.destroy()
          label = null
        }
      }
    } else {
      if (label != null) {
        label.destroy()
        label = null
      }
    }
  })
  
  let stamina = 100
  let staminaLabel = add([
    color(255, 255, 255),
    text(`Stamina: ${stamina}`, {
      size: 18
    }),
    pos(width() - 125, height() - 40),
    color(255, 255, 255),
    layer("ui"),
    origin("center"),
    fixed()
  ])

  let health = 100
  let healthLabel = add([
    color(255, 255, 255), 
    text(`${health} HP`, {
      size: 18
    }),
    layer("ui"),
    origin("center"),
    pos(width() - 135, height() - 60),
    fixed()
  ])

  let ticks = 0
  loop(0.25, () => {
    if (keyIsDown("shift")) {
      if (stamina > 0) {
        stamina -= 1
        staminaLabel.text = `Stamina: ${stamina}`
      }
    } else {
      ticks++
      if (ticks == 2) {
        ticks = 0
        if (stamina !== 100) {
          stamina += 1
          staminaLabel.text = `Stamina: ${stamina}`
        }
      }
    }
  })

  let debugLocation = add([
    text(`X: ${Math.floor(player.pos.x)}\nY: ${Math.floor(player.pos.y)}`, {
      size: 16
    }),
    pos(75, 75),
    origin("center"),
    fixed()
  ])

  onUpdate(() => {
    if (debug.inspect) {
      debugLocation.hidden = false
      debugLocation.text = `X: ${Math.floor(player.pos.x)},\nY: ${Math.floor(player.pos.y)}`
    } else {
      debugLocation.hidden = true
    }
  })
})

go('title')