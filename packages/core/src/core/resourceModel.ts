// @ts-nocheck
export class ResourceModel {
  constructor(resources = [], fieldMap = {}) {
    this._fieldMap = fieldMap || {};
    this.load(resources, fieldMap);
  }

  load(resources = [], fieldMap = this._fieldMap) {
    this._fieldMap = fieldMap || {};
    this._resources = Array.isArray(resources) ? resources : [];
    this._flat = [];

    const idKey = this._fieldMap.id || 'id';
    const labelKey = this._fieldMap.label || 'title';

    const walk = (nodes, depth = 0, parentId = null, path = []) => {
      nodes.forEach((node, index) => {
        const location = [...path, index].join('-');
        const resolvedId = node?.[idKey] ?? node?.id ?? `resource-${location}`;
        const _id = String(resolvedId);
        const _label = node?.[labelKey] ?? node?.title ?? node?.label ?? node?.name ?? _id;

        this._flat.push({
          ...node,
          id: _id,
          title: _label,
          depth,
          parentId,
          _id,
          _label,
          _resource: node,
        });

        if (Array.isArray(node?.children) && node.children.length) {
          walk(node.children, depth + 1, _id, [...path, index]);
        }
      });
    };

    walk(this._resources, 0);
  }

  all() {
    return this._resources;
  }

  flat() {
    return this._flat;
  }

  byId(id) {
    return this._flat.find(resource => resource._id === String(id)) || null;
  }
}
