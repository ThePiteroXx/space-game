import { Spaceship } from "./Spaceship.js";
import { Enemy } from "./Enemy.js";

class Game {
  htmlElements = {
    spaceship: document.querySelector("[data-spaceship]"),
    container: document.querySelector("[data-container]"),
    score: document.querySelector("[data-score]"),
    lives: document.querySelector("[data-lives]"),
    modal: document.querySelector("[data-modal]"),
    scoreInfo: document.querySelector("[data-score-info"),
    button: document.querySelector("[data-button]"),
  };
  ship = new Spaceship(
    this.htmlElements.spaceship,
    this.htmlElements.container
  );
  enemies = [];
  lives = 0;
  score = 0;
  reloadMissile = null;
  enemiesInterval = null;
  checkPositionInterval = null;
  createEnemyInterval = null;

  init() {
    this.ship.init();
    this.newGame();
    this.htmlElements.button.addEventListener("click", () => this.newGame());
  }

  newGame() {
    this.htmlElements.modal.classList.add("hide");
    this.reloadMissile = 4000;
    this.enemiesInterval = 30;
    this.lives = 3;
    this.score = 0;
    this.updateLivesText();
    this.updateScoreText();
    this.ship.element.style.left = "0px";
    this.ship.setPosition();
    this.createEnemyInterval = setInterval(() => this.randomNewEnemy(), 1000);
    clearInterval(this.checkPositionInterval);
    this.checkPositionInterval = setInterval(() => {
      this.checkPosition();
    }, 1);
  }

  endGame() {
    this.htmlElements.modal.classList.remove("hide");
    this.htmlElements.scoreInfo.textContent = `You loose! Your score is: ${this.score}`;
    this.enemies.forEach(enemy => {
      enemy.explode();
      enemy.missiles.forEach(missile => missile.remove());
    });
    this.enemies.length = 0;
    clearInterval(this.createEnemyInterval);
  }

  randomNewEnemy() {
    const randomNumber = Math.floor(Math.random() * 5) + 1;

    randomNumber % 5
      ? this.createNewEnemy(
          this.htmlElements.container,
          this.enemiesInterval,
          "enemy",
          "explosion"
        )
      : this.createNewEnemy(
          this.htmlElements.container,
          this.enemiesInterval * 2,
          "enemy--big", 
          "explosion--big",
          3
        );

    if (this.score > -1 && (randomNumber % 3)) {
      this.createNewEnemy(
        this.htmlElements.container,
        this.enemiesInterval,
        "enemy--shoter",
        "explosion",
        1,
        true,
        this.reloadMissile
      );
    }
  }

  createNewEnemy(...params) {
    const enemy = new Enemy(...params);
    enemy.init();
    this.enemies.push(enemy);
  }

  checkPosition() {
    //delete my missiles, under window
    this.ship.missiles.forEach((missile, missileIndex, missileArr) => {
      const missilePosition = {
        top: missile.element.offsetTop,
      };

      if (missilePosition.top <= 0) {
        missile.remove();
        missileArr.splice(missileIndex, 1);
      }
    });

    //delete enemy missiles, under window
    this.enemies.forEach((enemy) => {
      enemy.missiles.forEach((missile, missileIndex, missileArr) => {
        const missilePosition = {
          top: missile.element.offsetTop
        };
  
        if (missilePosition.top >= window.innerHeight - missile.element.offsetHeight - 1) {
          missile.remove();
          missileArr.splice(missileIndex, 1);
        }
      });
    });

    //delete ships under window
    this.enemies.forEach((enemy, enemyIndex, enemiesArr) => {
      const enemyPosition = {
        top: enemy.element.offsetTop,
        right: enemy.element.offsetLeft + enemy.element.offsetWidth,
        bottom: enemy.element.offsetTop + enemy.element.offsetHeight,
        left: enemy.element.offsetLeft,
      };

      if (enemyPosition.top > window.innerHeight) {
        enemy.explode();
        enemiesArr.splice(enemyIndex, 1);
        this.updateLives();
      }

      //missiles colision on enemy
      this.ship.missiles.forEach((missile, missileIndex, missileArr) => {
        const missilePosition = {
          top: missile.element.offsetTop,
          right: missile.element.offsetLeft + missile.element.offsetWidth,
          bottom: missile.element.offsetTop + missile.element.offsetHeight,
          left: missile.element.offsetLeft,
        };
        if (
          missilePosition.bottom >= enemyPosition.top &&
          missilePosition.top <= enemyPosition.bottom &&
          missilePosition.right >= enemyPosition.left &&
          missilePosition.left <= enemyPosition.right
        ) {
          enemy.hit();
          if (!enemy.lives) {
            enemiesArr.splice(enemyIndex, 1);
          }
          missile.remove();
          missileArr.splice(missileIndex, 1);
          this.updateScore();
        }
      });

      //missiles colision on my ship
      enemy.missiles.forEach((missile) => {
        const myShipPosition = {
          top: this.ship.element.offsetTop,
          right: this.ship.element.offsetLeft + this.ship.element.offsetWidth,
          bottom: this.ship.element.offsetTop + this.ship.element.offsetHeight,
          left: this.ship.element.offsetLeft,
        }

        const missileEnemyPosition = {
          top: missile.element.offsetTop,
          right: missile.element.offsetLeft + missile.element.offsetWidth,
          bottom: missile.element.offsetTop + missile.element.offsetHeight,
          left: missile.element.offsetLeft,
        };
        if (
          missileEnemyPosition.bottom >= myShipPosition.top &&
          missileEnemyPosition.top <= myShipPosition.bottom &&
          missileEnemyPosition.right >= myShipPosition.left &&
          missileEnemyPosition.left <= myShipPosition.right
        ) {
          this.updateLives();
          missile.remove();

        }
      });
    });
  }

  updateScore() {
    this.score++;
    if (!(this.score % 3)) {
      this.enemiesInterval--;
      this.reloadMissile -= 30;
    }
    this.updateScoreText();
  }

  updateLives() {
    this.lives--;
    this.updateLivesText();
    this.htmlElements.container.classList.add("hit");
    setTimeout(() => this.htmlElements.container.classList.remove("hit"), 100);
    if (!this.lives) {
      this.endGame();
    }
  }

  updateScoreText() {
    this.htmlElements.score.textContent = `Score: ${this.score}`;
  }

  updateLivesText() {
    this.htmlElements.lives.textContent = `Lives: ${this.lives}`;
  }
}

window.onload = function () {
  const game = new Game();
  game.init();
};
