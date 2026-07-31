import type { StorageAdapter, WorldData } from "./types";

const store = new Map<string, WorldData>();

export const memoryStorage: StorageAdapter = {
  async listWorlds() {
    return Array.from(store.values());
  },

  async getWorld(id: string) {
    return store.get(id) ?? null;
  },

  async saveWorld(world: WorldData) {
    store.set(world.id, structuredClone(world));
  },

  async deleteWorld(id: string) {
    store.delete(id);
  },
};
