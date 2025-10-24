import {
  Extension,
  textInputRule
} from "./chunk-R3OWSBYM.js";
import "./chunk-4MBMRILA.js";

// node_modules/@tiptap/extension-typography/dist/index.js
var emDash = (override) => textInputRule({
  find: /--$/,
  replace: override != null ? override : "—"
});
var ellipsis = (override) => textInputRule({
  find: /\.\.\.$/,
  replace: override != null ? override : "…"
});
var openDoubleQuote = (override) => textInputRule({
  find: /(?:^|[\s{[(<'"\u2018\u201C])(")$/,
  replace: override != null ? override : "“"
});
var closeDoubleQuote = (override) => textInputRule({
  find: /"$/,
  replace: override != null ? override : "”"
});
var openSingleQuote = (override) => textInputRule({
  find: /(?:^|[\s{[(<'"\u2018\u201C])(')$/,
  replace: override != null ? override : "‘"
});
var closeSingleQuote = (override) => textInputRule({
  find: /'$/,
  replace: override != null ? override : "’"
});
var leftArrow = (override) => textInputRule({
  find: /<-$/,
  replace: override != null ? override : "←"
});
var rightArrow = (override) => textInputRule({
  find: /->$/,
  replace: override != null ? override : "→"
});
var copyright = (override) => textInputRule({
  find: /\(c\)$/,
  replace: override != null ? override : "©"
});
var trademark = (override) => textInputRule({
  find: /\(tm\)$/,
  replace: override != null ? override : "™"
});
var servicemark = (override) => textInputRule({
  find: /\(sm\)$/,
  replace: override != null ? override : "℠"
});
var registeredTrademark = (override) => textInputRule({
  find: /\(r\)$/,
  replace: override != null ? override : "®"
});
var oneHalf = (override) => textInputRule({
  find: /(?:^|\s)(1\/2)\s$/,
  replace: override != null ? override : "½"
});
var plusMinus = (override) => textInputRule({
  find: /\+\/-$/,
  replace: override != null ? override : "±"
});
var notEqual = (override) => textInputRule({
  find: /!=$/,
  replace: override != null ? override : "≠"
});
var laquo = (override) => textInputRule({
  find: /<<$/,
  replace: override != null ? override : "«"
});
var raquo = (override) => textInputRule({
  find: />>$/,
  replace: override != null ? override : "»"
});
var multiplication = (override) => textInputRule({
  find: /\d+\s?([*x])\s?\d+$/,
  replace: override != null ? override : "×"
});
var superscriptTwo = (override) => textInputRule({
  find: /\^2$/,
  replace: override != null ? override : "²"
});
var superscriptThree = (override) => textInputRule({
  find: /\^3$/,
  replace: override != null ? override : "³"
});
var oneQuarter = (override) => textInputRule({
  find: /(?:^|\s)(1\/4)\s$/,
  replace: override != null ? override : "¼"
});
var threeQuarters = (override) => textInputRule({
  find: /(?:^|\s)(3\/4)\s$/,
  replace: override != null ? override : "¾"
});
var Typography = Extension.create({
  name: "typography",
  addOptions() {
    return {
      closeDoubleQuote: "”",
      closeSingleQuote: "’",
      copyright: "©",
      ellipsis: "…",
      emDash: "—",
      laquo: "«",
      leftArrow: "←",
      multiplication: "×",
      notEqual: "≠",
      oneHalf: "½",
      oneQuarter: "¼",
      openDoubleQuote: "“",
      openSingleQuote: "‘",
      plusMinus: "±",
      raquo: "»",
      registeredTrademark: "®",
      rightArrow: "→",
      servicemark: "℠",
      superscriptThree: "³",
      superscriptTwo: "²",
      threeQuarters: "¾",
      trademark: "™"
    };
  },
  addInputRules() {
    const rules = [];
    if (this.options.emDash !== false) {
      rules.push(emDash(this.options.emDash));
    }
    if (this.options.ellipsis !== false) {
      rules.push(ellipsis(this.options.ellipsis));
    }
    if (this.options.openDoubleQuote !== false) {
      rules.push(openDoubleQuote(this.options.openDoubleQuote));
    }
    if (this.options.closeDoubleQuote !== false) {
      rules.push(closeDoubleQuote(this.options.closeDoubleQuote));
    }
    if (this.options.openSingleQuote !== false) {
      rules.push(openSingleQuote(this.options.openSingleQuote));
    }
    if (this.options.closeSingleQuote !== false) {
      rules.push(closeSingleQuote(this.options.closeSingleQuote));
    }
    if (this.options.leftArrow !== false) {
      rules.push(leftArrow(this.options.leftArrow));
    }
    if (this.options.rightArrow !== false) {
      rules.push(rightArrow(this.options.rightArrow));
    }
    if (this.options.copyright !== false) {
      rules.push(copyright(this.options.copyright));
    }
    if (this.options.trademark !== false) {
      rules.push(trademark(this.options.trademark));
    }
    if (this.options.servicemark !== false) {
      rules.push(servicemark(this.options.servicemark));
    }
    if (this.options.registeredTrademark !== false) {
      rules.push(registeredTrademark(this.options.registeredTrademark));
    }
    if (this.options.oneHalf !== false) {
      rules.push(oneHalf(this.options.oneHalf));
    }
    if (this.options.plusMinus !== false) {
      rules.push(plusMinus(this.options.plusMinus));
    }
    if (this.options.notEqual !== false) {
      rules.push(notEqual(this.options.notEqual));
    }
    if (this.options.laquo !== false) {
      rules.push(laquo(this.options.laquo));
    }
    if (this.options.raquo !== false) {
      rules.push(raquo(this.options.raquo));
    }
    if (this.options.multiplication !== false) {
      rules.push(multiplication(this.options.multiplication));
    }
    if (this.options.superscriptTwo !== false) {
      rules.push(superscriptTwo(this.options.superscriptTwo));
    }
    if (this.options.superscriptThree !== false) {
      rules.push(superscriptThree(this.options.superscriptThree));
    }
    if (this.options.oneQuarter !== false) {
      rules.push(oneQuarter(this.options.oneQuarter));
    }
    if (this.options.threeQuarters !== false) {
      rules.push(threeQuarters(this.options.threeQuarters));
    }
    return rules;
  }
});
var index_default = Typography;
export {
  Typography,
  closeDoubleQuote,
  closeSingleQuote,
  copyright,
  index_default as default,
  ellipsis,
  emDash,
  laquo,
  leftArrow,
  multiplication,
  notEqual,
  oneHalf,
  oneQuarter,
  openDoubleQuote,
  openSingleQuote,
  plusMinus,
  raquo,
  registeredTrademark,
  rightArrow,
  servicemark,
  superscriptThree,
  superscriptTwo,
  threeQuarters,
  trademark
};
//# sourceMappingURL=@tiptap_extension-typography.js.map
