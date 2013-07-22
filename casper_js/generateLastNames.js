// Many telcos allow a single error in the name, and still makes a valid match between CPR and name. This can be used to bypass the 5 limit restriction (max 5 look-ups per name)

// randomize elements in array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// remove duplicates in array
function removeDuplicates(array){
  return array.filter(function(elem, pos) {
      return array.indexOf(elem) == pos;
  });
}

exports.init = function(lastName){
  var lastNames = [];
  var alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","æ","ø","å","ö","ü"];
  shuffle(alphabet);

  // generate list of lastname combinations
  for (var i = 0; i < alphabet.length; i++) {
    var letter = alphabet[i];

    // add random characters before every letter in word
    for (var positionInName = 0; positionInName <= (lastName.length - 1); positionInName++) {
      var lastNameModified = lastName.slice(0, positionInName) + letter + lastName.slice(positionInName);
      lastNames.push(lastNameModified);
    }
  }

  // remove duplicate names
  lastNames = removeDuplicates(lastNames);

  // repeat x times, to make sure we got at least 185+ names
  totalLastNames = [];
  var numberOfRepeats = Math.ceil(185/lastNames.length);
  for (var j = 1; j <= numberOfRepeats; j++) {
      totalLastNames = totalLastNames.concat(lastNames);
  }

  return totalLastNames;
};