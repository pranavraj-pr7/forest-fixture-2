class Animal {
  constructor() {
    this.name = null;
    this.index = null;
    this.positionX = 0;
    this.positionY = 0;
    this.rank = 0;
    this.fuel = 185;
    this.life = 185;
    this.score = 0;
  }

  addanimal() {
    var animalIndex = "animals/animal" + this.index;

    if (this.index === 1) {
      this.positionX = width / 2 - 100;
    } else {
      this.positionX = width / 2 + 100;
    }

    database.ref(animalIndex).set({
      name: this.name,
      positionX: this.positionX,
      positionY: this.positionY,
      rank: this.rank,
      score: this.score,
      life: this.life
    });
  }

  getDistance() {
    var animalDistanceRef = database.ref("animals/animal" + this.index);
    animalDistanceRef.on("value", data => {
      var data = data.val();
      this.positionX = data.positionX;
      this.positionY = data.positionY;
    });
  }

  getCount() {
    var animalCountRef = database.ref("animalCount");
    animalCountRef.on("value", data => {
      animalCount = data.val();
    });
  }

  updateCount(count) {
    database.ref("/").update({
      animalCount: count
    });
  }

  update() {
    var animalIndex = "animals/animal" + this.index;
    database.ref(animalIndex).update({
      positionX: this.positionX,
      positionY: this.positionY,
      rank: this.rank,
      score: this.score,
      life: this.life //C41//SA
    });
  }

  static getanimalsInfo() {
    var animalInfoRef = database.ref("animals");
    animalInfoRef.on("value", data => {
      allanimals = data.val();
    });
  }

  getanimalsAtEnd() {
    database.ref("animalsAtEnd").on("value", data => {
      this.rank = data.val();
    });
  }

  static updateanimalsAtEnd(rank) {
    database.ref("/").update({
      animalsAtEnd: rank
    });
  }
}
