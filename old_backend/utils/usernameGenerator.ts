const ADJECTIVES = [
  "Cool",
  "Happy",
  "Lazy",
  "Brave",
  "Clever",
  "Witty",
  "Silly",
  "Chill",
  "Snappy",
  "Loyal",
];

const NOUNS = [
  "Panda",
  "Tiger",
  "Sloth",
  "Falcon",
  "Otter",
  "Phoenix",
  "Cheetah",
  "Koala",
  "Wolf",
  "Raven",
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomUsername(): string {
  return `${getRandomElement(ADJECTIVES)}${getRandomElement(NOUNS)}${Math.floor(
    Math.random() * 10000
  )}`;
}

async function generateUniqueUsername(
  isUniqueFn: (username: string) => Promise<boolean>
): Promise<string> {
  let username: string;

  do {
    username = generateRandomUsername();
  } while (!(await isUniqueFn(username)));

  return username;
}

export default generateUniqueUsername;
