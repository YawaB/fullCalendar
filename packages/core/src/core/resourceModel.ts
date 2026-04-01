// @ts-nocheck
export class ResourceModel {
  constructor(resources = []) {
    this.load(resources);
  }

  load(resources = []) {
    this._resources = resources;
    this._flat = [];

    const walk = (nodes, depth = 0) => {
      nodes.forEach(node => {
        this._flat.push({ ...node, depth });
        if (Array.isArray(node.children) && node.children.length) walk(node.children, depth + 1);
      });
    };

    walk(resources, 0);
  }

  all() {
    return this._resources;
  }

  flat() {
    return this._flat;
  }

  byId(id) {
    return this._flat.find(r => r.id === id) || null;
  }
}
