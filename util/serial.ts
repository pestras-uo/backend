export default {

  separator: '_',

  regex: /^\d{4}(_\d{4})*$/,

  isValid(serial: string) {
    return this.regex.test(serial)
  },

  isRoot(serial: string) {
    return this.countLevels(serial) === 1;
  },

  countLevels(serial: string) {
    return serial.split(this.separator).length;
  },

  getRoot(serial: string) {
    return serial.split(this.separator)[0];
  },

  getParent(serial: string) {
    return serial.split(this.separator).slice(0, -1).join(this.separator);
  },

  getLast(serial: string) {
    const length = this.countLevels(serial);
    return length > 0 ? serial.split(this.separator)[length - 1] : '';
  },

  toTree(serial: string) {
    const all: string[] = [];
    const blocks = serial.split(this.separator);

    for (let i = 0; i < blocks.length; i++)
      all.push(i === 0 ? blocks[i] : `${all[i - 1]}${this.separator}${blocks[i]}`);

    return all;
  },

  areEquals(s1: string, s2: string) {
    return s1 === s2;
  },

  areSiblings(serial1: string, serial2: string) {
    return this.getParent(serial1) === this.getParent(serial2);
  },

  isDesc(descendant: string, serial: string, orIn = false) {
    return orIn ? descendant.indexOf(serial) === 0 : descendant.indexOf(serial) === 0 && serial !== descendant;
  },

  isAncs(ancestor: string, serial: string, orIn = false) {
    return orIn ? serial.indexOf(ancestor) === 0 : serial.indexOf(ancestor) === 0 && serial !== ancestor;
  },

  gen(parentSerial: string = '', exclude: string[] = []) {
    const chars = [
      'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','Y','V','W','X','Y','Z',
      '0','1','2','3','4','5','6','7','8','9'
    ];

    let newSerial = '';

    while (true) {
      newSerial = [
        chars[Math.round(Math.random() * 35)],
        chars[Math.round(Math.random() * 35)],
        chars[Math.round(Math.random() * 35)],
        chars[Math.round(Math.random() * 35)]
      ].join("");

      if (!exclude.includes(newSerial))
        return !!parentSerial ? `${parentSerial}${this.separator}${newSerial}` : newSerial;
    }
  }
}