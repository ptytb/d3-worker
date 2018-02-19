
export function createNode (type, doc, data) {
    if (doc instanceof DocumentFragment) {
        doc = doc.ownerDocument;
    }
    switch (type) {
      case 1:
        if (typeof data.tagName === "string") {
            // return doc.createElement(data.tagName);
            return doc.createElementNS("http://www.w3.org/2000/svg", data.tagName);
        }
        return false;

      case 3:
        if (typeof data.nodeValue === "string" && data.nodeValue.length) {
            return doc.createTextNode(data.nodeValue);
        }
        return doc.createTextNode("");

      case 7:
        if (data.hasOwnProperty("target") && data.hasOwnProperty("data")) {
            return doc.createProcessingInstruction(data.target, data.data);
        }
        return false;

      case 8:
        if (typeof data.nodeValue === "string") {
            return doc.createComment(data.nodeValue);
        }
        return doc.createComment("");

      case 9:
        return doc.implementation.createHTMLDocument(data);

      case 11:
        return doc;

      default:
        return false;
    }
}

export function toDOM (obj, parent, doc) {
    let node;
    if (obj.nodeType) {
        node = createNode(obj.nodeType, doc, obj);
        parent.appendChild(node);
    } else {
        return false;
    }
    for (let x in obj) {
        let v = obj[x];
        if (Array.isArray(v) || typeof v !== "object" && x !== "childNodes") {
            try {
                node[x] = v;
            } catch (e) {
                continue;
            }
        }
    }
    if (obj.nodeType === 1 && obj.tagName) {
        if (obj.attributes) {
            for (let k in obj.attributes) {
                node.setAttribute(k, obj.attributes[k]);
            }
        }
        for (let x in obj.style) {
            node.style[x] = obj.style[x];
        }
    }
    if (obj.childNodes && obj.childNodes.length) {
        for (let c in obj.childNodes) {
            toDOM(obj.childNodes[c], node, doc);
        }
    }
}
