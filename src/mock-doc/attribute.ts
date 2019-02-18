

export class MockAttributeMap {
  items: MockAttr[] = [];

  get length() {
    return this.items.length;
  }

  getNamedItem(attrName: string) {
    attrName = attrName.toLowerCase();
    return this.items.find(attr => attr.name === attrName && (attr.namespaceURI == null || attr.namespaceURI === 'http://www.w3.org/1999/xlink')) || null;
  }

  setNamedItem(attr: MockAttr) {
    attr.namespaceURI = null;
    this.setNamedItemNS(attr);
  }

  removeNamedItem(attr: MockAttr) {
    this.removeNamedItemNS(attr);
  }

  item(index: number) {
    return this.items[index] || null;
  }

  getNamedItemNS(namespaceURI: string, attrName: string) {
    if (namespaceURI == null || namespaceURI === 'http://www.w3.org/1999/xlink') {
      return this.getNamedItem(attrName);
    }

    attrName = attrName.toLowerCase();
    return this.items.find(attr => attr.name === attrName && attr.namespaceURI === namespaceURI) || null;
  }

  setNamedItemNS(attr: MockAttr) {
    if (attr != null && attr.value != null) {
      attr.value = String(attr.value);
    }

    const existingAttr = this.items.find(a => a.name.toLowerCase() === attr.name.toLowerCase() && a.namespaceURI === attr.namespaceURI);
    if (existingAttr != null) {
      existingAttr.value = attr.value;
    } else {
      this.items.push(attr);
    }
  }

  removeNamedItemNS(attr: MockAttr) {
    for (let i = 0, ii = this.items.length; i < ii; i++) {
      if (this.items[i].name.toLowerCase() === attr.name && this.items[i].namespaceURI === attr.namespaceURI) {
        this.items.splice(i, 1);
        break;
      }
    }
  }
}

export function cloneAttributes(srcAttrs: MockAttributeMap) {
  const dstAttrs = new MockAttributeMap();
  if (srcAttrs != null) {
    for (let i = 0, ii = srcAttrs.length; i < ii; i++) {
      const srcAttr = srcAttrs.item(i);
      const dstAttr = new MockAttr(srcAttr.name, srcAttr.value, srcAttr.namespaceURI);
      dstAttrs.setNamedItemNS(dstAttr);
    }
  }
  return dstAttrs;
}


export class MockAttr {
  private _name: string;
  private _value: string;
  private _namespaceURI: string;

  constructor(attrName: string, attrValue = '', namespaceURL: string = null) {
    this._name = attrName.toLowerCase();
    this._value = String(attrValue || '');
    this._namespaceURI = (namespaceURL != null) ? namespaceURL.toLowerCase() : namespaceURL;
  }

  get name() {
    return this._name;
  }
  set name(value) {
    this._name = value.toLowerCase();
  }

  get value() {
    return this._value;
  }
  set value(value) {
    this._value = String(value || '');
  }

  get namespaceURI() {
    return this._namespaceURI;
  }
  set namespaceURI(namespaceURI) {
    this._namespaceURI = (namespaceURI != null) ? namespaceURI.toLowerCase() : namespaceURI;
  }
}
