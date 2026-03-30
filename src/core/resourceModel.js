export class ResourceModel {
  constructor(resources = []) {
    this._resources = resources;
  }

  load(resources = []) {
    this._resources = resources;
  }

  all() {
    return this._resources;
  }

  byId(id) {
    return this._resources.find(r => r.id === id) || null;
  }
}
