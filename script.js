const form = document.getElementsByTagName(`form`)[0];
const btn = document.getElementById(`submit`);
const inputsArray = [...document.getElementsByTagName(`input`)];
const passwordInput = inputsArray[2];

const passwdReqs = {
  regex: [
    /\d/,
    /[a-z]/,
    /[A-Z]/,
    /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/,
    /.{8,}/
  ],
  warnings: [
    `a number`,
    `a lowercase letter`,
    `an uppercase letter`,
    `a symbol`,
    `at least 8 characters`
  ]
};

const map = (fn) => (arr) => arr.map(fn);
const filter = (exp) => (arr) => arr.filter(exp);
const compose = (...fns) => (arg) => fns.reduceRight((v, f) => f(v), arg);

const checkRegex = (regex) => (element) => regex.test(element.value);
const getString = (string) => (condition) => (condition ? string : ``);

const checkIfNotEmpty = checkRegex(/\S+/);
const getRequiredWarning = getString(`please complete this field`);

const checkIfMatch = (element1) => (element2) =>
  element1.value.trim() === element2.value.trim();
const checkPasswdMatch = checkIfMatch(passwordInput);
const getConfirmWarning = getString(`please match the password field`);

const checkIfEmail = checkRegex(
  /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
);
const getEmailWarning = getString(`please enter a valid email`);

const checkMultiRegex = map(checkRegex);
const checkPasswdRegex = checkMultiRegex(passwdReqs.regex);
const checkIfPasswdMeetsReqs = (passwdElement) =>
  checkPasswdRegex.map((fn) => fn(passwdElement));
const getPasswdWarnings = getString(passwdReqs.warnings);
const getPasswdErrorItems = (input) =>
  checkIfPasswdMeetsReqs(input).map((check, i) => getPasswdWarnings(!check)[i]);
const joinPasswdErrorList = (errorItemsArray) =>
  errorItemsArray.length === 0
    ? ""
    : "password must contain: • " + errorItemsArray.join(" • ");
const filterUndefined = filter((item) => item !== undefined);

const getConnectedField = (fieldConnection) => (input) =>
  document.getElementById(`${input.id}-${fieldConnection}`);
const getErrorField = getConnectedField(`error`);
const getLedRow = getConnectedField(`leds`);

const runProperCheck = (input) => {
  switch (input.id) {
    case `username`:
      return checkIfNotEmpty(input);
    case `email`:
      return checkIfNotEmpty(input) && checkIfEmail(input);
    case `password`:
      return !checkIfPasswdMeetsReqs(input).includes(false);
    case `confirm-password`:
      return checkIfNotEmpty(input) && checkPasswdMatch(input);
    default:
  }
};

const passProperWarning = (input) => {
  switch (input.id) {
    case `username`:
      return getRequiredWarning(!checkIfNotEmpty(input));
    case `email`:
      return checkIfNotEmpty(input)
        ? getEmailWarning(!checkIfEmail(input))
        : getRequiredWarning(true);
    case `password`:
      return checkIfNotEmpty(input)
        ? compose(
            joinPasswdErrorList,
            filterUndefined,
            getPasswdErrorItems
          )(input)
        : getRequiredWarning(true);
    case `confirm-password`:
      return checkIfNotEmpty(input)
        ? getConfirmWarning(!checkPasswdMatch(input))
        : getRequiredWarning(true);
    default:
  }
};

const runAllChecksOnInputs = () =>
  inputsArray.map((input) => runProperCheck(input)).includes(false)
    ? "failed"
    : "passed";

const activateLedRow = (input) => {
  if (runProperCheck(input)) {
    getLedRow(input).children[1].classList.remove(`active`);
    getLedRow(input).children[0].classList.add(`active`);
  } else {
    getLedRow(input).children[0].classList.remove(`active`);
    getLedRow(input).children[1].classList.add(`active`);
  }
};

const submitBtnClass = () =>
  runAllChecksOnInputs() === "failed" ? "" : "enabled";

const preventSubmit = (e) => {
  if (runAllChecksOnInputs() === "passed") {
    alert(`Submission Successful!`);
  }
  e.preventDefault();
};

const inputEvents = (input) => {
  getErrorField(input).textContent = passProperWarning(input);
  btn.className = submitBtnClass();
  activateLedRow(input);
};

inputsArray.map((input) =>
  input.addEventListener("blur", () => inputEvents(input))
);

form.addEventListener("submit", (e) => {
  inputsArray.map((input) => inputEvents(input));
  preventSubmit(e);
});
