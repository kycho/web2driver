import { toPairs } from 'lodash';

const W3C_ELEMENT_KEY = 'element-6066-11e4-a52e-4f735466cecf'
const JWP_ELEMENT_KEY = 'ELEMENT';

export default class UIElement {
  constructor (elementKey, findRes, parent) {
    this.elementKey = elementKey;
    this.elementId = this[elementKey] = findRes[elementKey];
    this.client = parent.client;
    this.__is_w2d_element = true;
  }

  get executeObj () {
    return {[this.elementKey]: this.elementId};
  }

  async findElement (using, value) {
    const res = await this.client.findElementFromElement(this.elementId, using, value);
    return getElementFromResponse(res, this);
  }

  async findElements (using, value) {
    const ress = await this.client.findElementsFromElement(this.elementId, using, value);
    return ress.map(res => getElementFromResponse(res, this));
  }
}


function getElementFromResponse (res, parent) {
  let elementKey;
  if (res[W3C_ELEMENT_KEY])  {
    elementKey = W3C_ELEMENT_KEY;
  } else {
    elementKey = JWP_ELEMENT_KEY;
  }

  if (!res[elementKey]) {
    throw new Error(`Bad findElement response; did not have element key. ` +
                    `Response was: ${res}`);
  }

  return new UIElement(elementKey, res, parent);
}

const ELEMENT_CMDS = {
  isElementSelected: "isSelected",
  isElementDisplayed: "isDisplayed",
  getElementAttribute: "getAttribute",
  getElementCSSValue: "getCSSValue",
  getElementText: "getText",
  getElementTagName: "getTagName",
  getElementLocation: "getLocation",
  getElementLocationInView: "getLocationInView",
  getElementProperty: "getProperty",
  getElementRect: "getRect",
  getElementSize: "getSize",
  getElementEnabled: "getEnabled",
  elementClick: "click",
  elementSubmit: "submit",
  elementClear: "clear",
  elementSendKeys: "sendKeys",
   // kycho 2019.10.31 수정 : 엘리먼트가 아닌 세션명령어를 사용하기 위해서 엘리먼트명령어에서는 제외 해야 session.js에서 필터링 안됨.
  //takeElementScreenshot: "takeScreenshot",
};

for (const [protoCmd, newCmd] of toPairs(ELEMENT_CMDS)) {
  UIElement.prototype[newCmd] = async function (...args) {
    return await this.client[protoCmd](this.elementId, ...args);
  }
}

export { ELEMENT_CMDS, W3C_ELEMENT_KEY, JWP_ELEMENT_KEY, getElementFromResponse };
