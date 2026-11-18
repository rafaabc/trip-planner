// Tiny generic in-memory collection (stands in for an in-memory database).
function createCollection() {
  const records = [];
  let nextId = 1;

  return {
    findAll: (predicate = () => true) => records.filter(predicate),
    findById: (id) => records.find((r) => r.id === id),
    findOne: (predicate) => records.find(predicate),
    create: (data) => {
      const record = { id: nextId++, ...data };
      records.push(record);
      return record;
    },
    update: (id, data) => {
      const index = records.findIndex((r) => r.id === id);
      if (index === -1) return null;
      records[index] = { ...records[index], ...data, id };
      return records[index];
    },
    remove: (id) => {
      const index = records.findIndex((r) => r.id === id);
      if (index === -1) return false;
      records.splice(index, 1);
      return true;
    },
    removeWhere: (predicate) => {
      for (let i = records.length - 1; i >= 0; i--) {
        if (predicate(records[i])) records.splice(i, 1);
      }
    },
  };
}

module.exports = { createCollection };
