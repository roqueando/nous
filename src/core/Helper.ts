export default class Helper {

  /** @private
   * @function isJson
   * @description check if string is a JSON
   * @returns {Boolean}
   */
  static isJson(string: string): boolean {
    try {
      JSON.parse(string);
    } catch (e) {
      return false;
    }
    return true;
  }

  /**
   * @private
   * @function toTitleCase
   * @description puts string on title case
   * @returns {string}
   */
  static toTitleCase(word: string): string {
    return word.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }
  
  static decode(jsonText: string) {
    return JSON.parse(jsonText)
  }
}
