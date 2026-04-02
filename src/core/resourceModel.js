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
        const id = String(resolvedId);
        const label = node?.[labelKey] ?? node?.title ?? node?.name ?? id;

        this._flat.push({
          ...node,
          id,
          depth,
          parentId,
          _resourceId: id,
          _resourceLabel: label,
          _resource: node,
        });

        if (Array.isArray(node?.children) && node.children.length) {
          walk(node.children, depth + 1, id, [...path, index]);
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
    return this._flat.find(r => r.id === String(id)) || null;
  }
}
