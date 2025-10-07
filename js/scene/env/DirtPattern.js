export class DirtPattern {
  constructor({ getElement }) {
    this.patternEl = getElement('dirt-pattern'); // may be null
  }
  getChildren() {
    return this.patternEl ? Array.from(this.patternEl.children) : [];
  }
}

