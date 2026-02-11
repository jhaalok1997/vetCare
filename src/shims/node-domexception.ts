export class DOMException extends Error {
  name = "DOMException";

  constructor(message = "DOMException") {
    super(message);
  }
}

export default DOMException;
