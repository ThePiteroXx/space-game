import { EnemyMissile } from "./EnemyMissile.js";

export class Enemy {
  constructor(
    container,
    intervalTime,
    enemyClass,
    explosionClass,
    lives = 1,
    moveObject = false,
    reload
  ) {
    this.container = container;
    this.element = document.createElement("div");
    this.enemyClass = enemyClass;
    this.explosionClass = explosionClass;
    this.interval = null;
    this.moveObject = moveObject;
    this.intervalTime = intervalTime;
    this.intervalMissile = null;
    this.lives = lives;
    this.reload = reload;
    this.missiles = [];
  }
  init() {
    this.setEnemy();
    this.interval = setInterval(() => this.updatePosition(), this.intervalTime);
    this.intervalMissile = setInterval(() => this.shot(), this.reload);
  }

  setEnemy() {
    this.element.classList.add(this.enemyClass);
    this.container.appendChild(this.element);
    this.element.style.top = "0px";
    this.element.style.left = `${this.randomPosition()}px`;
  }

  randomPosition() {
    return Math.floor(
      Math.random() * (window.innerWidth - this.element.offsetWidth)
    );
  }

  updatePosition() {
    this.setNewPosition();

    if (this.moveObject) {
      const random = Math.floor(Math.random() * 2);
    }
  }

  getPosition() {
    return this.element.offsetLeft + this.element.offsetWidth / 2;
  }

  setNewPosition() {
    this.element.style.top = `${this.element.offsetTop + 1}px`;
  }

  setNewMoveRight() {
    this.element.style.left = `${this.element.offsetLeft + 3}px`;
  }

  setNewMoveLeft() {
    this.element.style.left = `${this.element.offsetLeft - 3}px`;
  }

  remove() {
    clearInterval(this.interval);
    clearInterval(this.intervalMissile);
    this.element.remove();
  }

  hit() {
    this.lives--;
    if (!this.lives) {
      this.explode();
      setTimeout(() => (this.missiles.forEach(missile => missile.remove())), 5000)
    }
  }

  shot() {
    if (this.moveObject) {
      const missile = new EnemyMissile(
        this.getPosition(),
        this.element.offsetTop + this.element.offsetHeight,
        this.container
      );

      missile.init();
      this.missiles.push(missile);
    }
  }

  explode() {
    this.element.classList.remove(this.enemyClass);
    this.element.classList.add(this.explosionClass);
    clearInterval(this.interval);
    clearInterval(this.intervalMissile);
    const animationTime = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--explosions-animation-time"
      ),
      10
    );
    setTimeout(() => this.element.remove(), animationTime);
  }

}
