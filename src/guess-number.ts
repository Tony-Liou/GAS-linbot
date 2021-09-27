const CORRECT_NUMBER = "correct-number";
const MIN_NUMBER = "min";
const MAX_NUMBER = "max";

function startNewGuessingGame(min: number = 1, max: number = 100): string {
  if (min >= max) {
    return "Wrong numbers. Please set the correct boundary.";
  }

  const prop = PropertiesService.getScriptProperties();
  const ans = getRandomInt(min, max);

  min--;

  prop.setProperties({
    [CORRECT_NUMBER]: ans.toString(),
    [MIN_NUMBER]: min.toString(),
    [MAX_NUMBER]: max.toString()
  });

  return `Select a number between ${min}~${max}`;
}

function pickNumber(numberText: string): string {
  const guessNumber = parseInt(numberText.trim(), 10);
  if (isNaN(guessNumber)) {
    return "Please input an integer.";
  }

  const prop = PropertiesService.getScriptProperties();
  const ansStr = prop.getProperty(CORRECT_NUMBER);
  if (ansStr === null) {
    return "Create a new game first.";
  }

  const ans = parseInt(ansStr, 10);
  if (guessNumber === ans) {
    prop.setProperty(CORRECT_NUMBER, "");
    return `Bingo! The answer is ${guessNumber}.`;
  }

  let min = parseInt(prop.getProperty(MIN_NUMBER) ?? "", 10);
  let max = parseInt(prop.getProperty(MAX_NUMBER) ?? "", 10);
  if (guessNumber > ans && guessNumber < max) {
    max = guessNumber;
    prop.setProperty(MAX_NUMBER, max.toString());
  } else if (guessNumber < ans && guessNumber > min) {
    min = guessNumber;
    prop.setProperty(MIN_NUMBER, min.toString());
  }

  return `Select a number between ${min}~${max}`;
}