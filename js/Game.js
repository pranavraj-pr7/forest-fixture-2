class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

    this.leadeboardTitle = createElement("h2");

    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
    this.animalMoving = false;

    this.leftKeyActive = false;
    this.blast = false; //C42//SA
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    animal = new Animal();
    animalCount = animal.getCount();

    form = new Form();
    form.display();

    lion = createSprite(width / 2 - 50, height - 100);
    lion.addImage("lion", lion_img);
    lion.scale = 0.07;

    lion.addImage("blast", blastImage); //C42 //SA

    zebra = createSprite(width / 2 + 100, height - 100);
    zebra.addImage("zebra", zebra_img);
    zebra.scale = 0.07;

    zebra.addImage("blast", blastImage); //C42//SA

    animals = [lion, zebra];

    fuels = new Group();
    powerCoins = new Group();
    obstacles = new Group(); //C41 //SA

    // Adding fuel sprite in the game
    this.addSprites(fuels, 4, fuelImage, 0.02);

    // Adding coin sprite in the game
    this.addSprites(powerCoins, 18, powerCoinImage, 0.2);

    //C41 //BP //SA
    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 1300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2Image },
      { x: width / 2, y: height - 2800, image: obstacle2Image },
      { x: width / 2 - 180, y: height - 3300, image: obstacle1Image },
      { x: width / 2 + 180, y: height - 3300, image: obstacle2Image },
      { x: width / 2 + 250, y: height - 3800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 4300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 4800, image: obstacle2Image },
      { x: width / 2, y: height - 5300, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 5500, image: obstacle2Image }
    ];

    //Adding obstacles sprite in the game
    this.addSprites(
      obstacles,
      obstaclesPositions.length,
      obstacle1Image,
      0.08,
      obstaclesPositions
    );
  }

  //C41 //SA
  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, positions = []) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;

      //C41 //SA
      if (positions.length > 0) {
        x = positions[i].x;
        y = positions[i].y;
        spriteImage = positions[i].image;
      } else {
        x = random(width / 2 + 150, width / 2 - 150);
        y = random(-height * 4.5, height - 400);
      }
      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    this.resetTitle.html("Reset Game");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leadeboardTitle.html("Leaderboard");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();

    Animal.getanimalsInfo();
    animal.getanimalsAtEnd();

    if (allanimals !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

      this.showFuelBar();
      this.showLife();
      this.showLeaderboard();

      //index of the array
      var index = 0;
      for (var plr in allanimals) {
        //add 1 to the index for every loop
        index = index + 1;

        //use data form the database to display the animals in x and y direction
        var x = allanimals[plr].positionX;
        var y = height - allanimals[plr].positionY;

        //C42//TA
        var currentlife = allanimals[plr].life;

        if (currentlife <= 0) {
          animals[index - 1].changeImage("blast");
          animals[index - 1].scale = 0.3;
        }

        animals[index - 1].position.x = x;
        animals[index - 1].position.y = y;

        if (index === animal.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.handleFuel(index);
          this.handlePowerCoins(index);
          this.handleCarACollisionWithCarB(index); //C41//BP//TA
          this.handleObstacleCollision(index); //C41//SA

          //C42//TA
          if (animal.life <= 0) {
            this.blast = true;
            this.animalMoving = false;
          }

          // Changing camera position in y direction
          camera.position.y = animals[index - 1].position.y;
        }
      }

      if (this.animalMoving) {
        animal.positionY += 5;
        animal.update();
      }

      // handling keyboard events
      this.handleanimalControls();

      // Finshing Line
      const finshLine = height * 6 - 100;

      if (animal.positionY > finshLine) {
        gameState = 2;
        animal.rank += 1;
        Animal.updateanimalsAtEnd(animal.rank);
        animal.update();
        this.showRank();
      }

      drawSprites();
    }
  }

  handleFuel(index) {
    // Adding fuel
    animals[index - 1].overlap(fuels, function(collector, collected) {
      animal.fuel = 185;
      //collected is the sprite in the group collectibles that triggered
      //the event
      collected.remove();
    });

    // Reducing animal car fuel
    if (animal.fuel > 0 && this.animalMoving) {
      animal.fuel -= 0.3;
    }

    if (animal.fuel <= 0) {
      gameState = 2;
      this.gameOver();
    }
  }

  handlePowerCoins(index) {
    animals[index - 1].overlap(powerCoins, function(collector, collected) {
      animal.score += 21;
      animal.update();
      //collected is the sprite in the group collectibles that triggered
      //the event
      collected.remove();
    });
  }

  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        animalsAtEnd: 0,
        animalCount: 0,
        gameState: 0,
        palyers: {}
      });
      window.location.reload();
    });
  }

  showFuelBar() {
    push();
    image(fuelImage, width / 2 - 130, height - animal.positionY - 350, 20, 20);
    fill("white");
    rect(width / 2 - 100, height - animal.positionY - 350, 185, 20);
    fill("#ffc400");
    rect(width / 2 - 100, height - animal.positionY - 350, animal.fuel, 20);
    noStroke();
    pop();
  }

  showLife() {
    push();
    image(lifeImage, width / 2 - 130, height - animal.positionY - 400, 20, 20);
    fill("white");
    rect(width / 2 - 100, height - animal.positionY - 400, 185, 20);
    fill("#f50057");
    rect(width / 2 - 100, height - animal.positionY - 400, animal.life, 20);
    noStroke();
    pop();
  }

  showLeaderboard() {
    var leader1, leader2;
    var animals = Object.values(allanimals);
    if (
      (animals[0].rank === 0 && animals[1].rank === 0) ||
      animals[0].rank === 1
    ) {
      // &emsp;    This tag is used for displaying four spaces.
      leader1 =
        animals[0].rank +
        "&emsp;" +
        animals[0].name +
        "&emsp;" +
        animals[0].score;

      leader2 =
        animals[1].rank +
        "&emsp;" +
        animals[1].name +
        "&emsp;" +
        animals[1].score;
    }

    if (animals[1].rank === 1) {
      leader1 =
        animals[1].rank +
        "&emsp;" +
        animals[1].name +
        "&emsp;" +
        animals[1].score;

      leader2 =
        animals[0].rank +
        "&emsp;" +
        animals[0].name +
        "&emsp;" +
        animals[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  handleanimalControls() {
    //C41 //TA
    if (!this.blast) {
      if (keyIsDown(UP_ARROW)) {
        this.animalMoving = true;
        animal.positionY += 10;
        animal.update();
      }

      if (keyIsDown(LEFT_ARROW) && animal.positionX > width / 3 - 50) {
        this.leftKeyActive = true;
        animal.positionX -= 5;
        animal.update();
      }

      if (keyIsDown(RIGHT_ARROW) && animal.positionX < width / 2 + 300) {
        this.leftKeyActive = false;
        animal.positionX += 5;
        animal.update();
      }
    }
  }

  //C41 //SA
  handleObstacleCollision(index) {
    if (animals[index - 1].collide(obstacles)) {
      //C41 //TA
      if (this.leftKeyActive) {
        animal.positionX += 100;
      } else {
        animal.positionX -= 100;
      }

      //C41 //SA
      //Reducing animal Life
      if (animal.life > 0) {
        animal.life -= 185 / 4;
      }

      animal.update();
    }
  }

  //C41 //TA //Bp
  handleCarACollisionWithCarB(index) {
    if (index === 1) {
      if (animals[index - 1].collide(animals[1])) {
        if (this.leftKeyActive) {
          animal.positionX += 100;
        } else {
          animal.positionX -= 100;
        }

        //Reducing animal Life
        if (animal.life > 0) {
          animal.life -= 185 / 4;
        }

        animal.update();
      }
    }
    if (index === 2) {
      if (animals[index - 1].collide(animals[0])) {
        if (this.leftKeyActive) {
          animal.positionX += 100;
        } else {
          animal.positionX -= 100;
        }

        //Reducing animal Life
        if (animal.life > 0) {
          animal.life -= 185 / 4;
        }

        animal.update();
      }
    }
  }

  showRank() {
    swal({
      title: `Awesome!${"\n"}Rank${"\n"}${animal.rank}`,
      text: "You reached the finish line successfully",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multianimal-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
    });
  }

  gameOver() {
    swal({
      title: `Game Over`,
      text: "Oops you lost the race....!!!",
      imageUrl:
        "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100x100",
      confirmButtonText: "Thanks For Playing"
    });
  }
  end() {
    console.log("Game Over");
  }
}
