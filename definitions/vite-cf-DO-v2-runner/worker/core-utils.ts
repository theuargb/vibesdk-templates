/**
 * Core utilities for Multiple Entities sharing a single Durable Object class
 * DO NOT MODIFY THIS FILE - You may break the project functionality
 */
import type { ApiResponse } from "@shared/types";
import { DurableObject } from "cloudflare:workers";
import type { Context } from "hono";

export interface Env {
  GlobalDurableObject: DurableObjectNamespace<GlobalDurableObject>;
}

// Small helper to compose index node keys
const nodeKey = (rootKey: string, nodeId: string) => `${rootKey}:node:${nodeId}`;

type Doc<T> = { v: number; data: T };
type Node<T> = { items: T[]; next: string | null };

/**
 * Global Durable object for storage-purpose ONLY, to be used as a KV-like storage by multiple entities
 */
export class GlobalDurableObject extends DurableObject<Env, unknown> {
  constructor(public ctx: DurableObjectState, public env: Env) {
    super(ctx, env);
  }

  /** Delete a key; returns true if it existed. */
  async del(key: string): Promise<boolean> {
    const existed = (await this.ctx.storage.get(key)) !== undefined;
    await this.ctx.storage.delete(key);
    return existed;
  }

  /** Fast existence check. */
  async has(key: string): Promise<boolean> {
    return (await this.ctx.storage.get(key)) !== undefined;
  }

  async getDoc<T>(key: string): Promise<Doc<T> | null> {
    const v = await this.ctx.storage.get<Doc<T>>(key);
    return v ?? null;
  }

  async casPut<T>(key: string, expectedV: number, data: T): Promise<{ ok: boolean; v: number }> {
    return this.ctx.storage.transaction(async (txn) => {
      const cur = await txn.get<Doc<T>>(key);
      const curV = cur?.v ?? 0;
      if (curV !== expectedV) return { ok: false, v: curV };
      const nextV = curV + 1;
      await txn.put(key, { v: nextV, data });
      return { ok: true, v: nextV };
    });
  }

  // Append items with short transactions: fill tail or link one new page per txn
  async indexAddBatch<T>(rootKey: string, pageSize: number, items: T[]): Promise<void> {
    if (items.length === 0) return;
    let rem = items.slice();
    let rc = 2; // small retry budget per chunk
    while (rem.length > 0) {
      try {
        await this.ctx.storage.transaction(async (txn) => {
          const root = await txn.get<Doc<IR>>(rootKey);
          if (!root) throw new Error('Index root missing');
          const s = root.data;

          // No pages yet: create head with up to pageSize items
          if (s.tail_node_id === null) {
            const headId = crypto.randomUUID();
            const chunk = rem.splice(0, pageSize);
            await txn.put(nodeKey(rootKey, headId), { v: 1, data: { items: chunk, next: null } as Node<T> });
            const nextV = root.v + 1;
            await txn.put(rootKey, { v: nextV, data: { ...s, head_node_id: headId, tail_node_id: headId, total_count: s.total_count + chunk.length } });
            return;
          }

          // Fill remaining capacity on current tail, else link exactly one new node
          const tailId = s.tail_node_id;
          const tailDoc = await txn.get<Doc<Node<T>>>(nodeKey(rootKey, tailId));
          const curItems = tailDoc?.data.items ?? [];
          const cap = Math.max(0, pageSize - curItems.length);
          if (cap > 0 && rem.length > 0) {
            const toTail = rem.splice(0, cap);
            const nextTailV = (tailDoc?.v ?? 0) + 1;
            await txn.put(nodeKey(rootKey, tailId), { v: nextTailV, data: { items: [...curItems, ...toTail], next: null } });
            const nextV = root.v + 1;
            await txn.put(rootKey, { v: nextV, data: { ...s, total_count: s.total_count + toTail.length } });
            return;
          }

          // Link one new node and update root's tail pointer
          const newId = crypto.randomUUID();
          const chunk = rem.splice(0, pageSize);
          await txn.put(nodeKey(rootKey, newId), { v: 1, data: { items: chunk, next: null } });
          const linkDoc = await txn.get<Doc<Node<T>>>(nodeKey(rootKey, tailId));
          const linkV = (linkDoc?.v ?? 0) + 1;
          await txn.put(nodeKey(rootKey, tailId), { v: linkV, data: { items: linkDoc?.data.items ?? [], next: newId } });
          const nextV = root.v + 1;
          await txn.put(rootKey, { v: nextV, data: { ...s, tail_node_id: newId, total_count: s.total_count + chunk.length } });
        });
        rc = 2; // reset after success
      } catch (e) {
        if (rc-- > 0) continue;
        throw e;
      }
    }
  }

  async indexRemoveBatch<T>(rootKey: string, items: T[]): Promise<number> {
    if (items.length === 0) return 0;
    return this.ctx.storage.transaction(async (txn) => {
      const root = await txn.get<Doc<IR>>(rootKey);
      if (!root) return 0;
      const s = root.data;
      const total = items.length;
      const toRemove = new Set<T>(items);
      let removed = 0;
      let current: string | null = s.head_node_id;
      while (current) {
        const nk = nodeKey(rootKey, current);
        const nodeDoc = await txn.get<Doc<Node<T>>>(nk);
        const node = nodeDoc?.data;
        if (!node) break;
        const before = node.items.length;
        const filtered = node.items.filter((it) => !toRemove.has(it));
        if (filtered.length !== before) {
          removed += before - filtered.length;
          const nextV = (nodeDoc?.v ?? 0) + 1;
          await txn.put(nk, { v: nextV, data: { items: filtered, next: node.next } });
        }
        if (removed >= total) break;
        current = node.next;
      }
      if (removed > 0) {
        const nextV = (root.v ?? 0) + 1;
        await txn.put(rootKey, {
          v: nextV,
          data: { ...s, total_count: Math.max(0, s.total_count - removed) },
        });
      }
      return removed;
    });
  }

  async indexDrop(rootKey: string): Promise<void> {
    await this.ctx.storage.transaction(async (txn) => {
      const root = await txn.get<Doc<IR>>(rootKey);
      if (!root) return;
      const s = root.data;
      let current: string | null = s.head_node_id;
      while (current) {
        const nk = nodeKey(rootKey, current);
        const nodeDoc = await txn.get<Doc<Node<unknown>>>(nk);
        const next = nodeDoc?.data?.next ?? null;
        await txn.delete(nk);
        current = next;
      }
      const nextV = (root.v ?? 0) + 1;
      await txn.put(rootKey, {
        v: nextV,
        data: { ...s, head_node_id: null, tail_node_id: null, total_count: 0 },
      });
    });
  }
}

export interface EntityStatics<S, T extends Entity<S>> {
  new (env: Env, id: string): T; // inherited default ctor
  readonly entityName: string;
  readonly initialState: S;
}

/**
 * Base class for entities - extend this class to create new entities
 */
export abstract class Entity<State> {
  protected _state!: State;
  protected _version: number = 0;
  protected readonly stub: DurableObjectStub<GlobalDurableObject>;
  protected readonly _id: string;
  protected readonly entityName: string;
  protected readonly env: Env;

  constructor(env: Env, id: string) {
    this.env = env;
    this._id = id;

    // Read subclass statics via new.target / constructor
    const Ctor = this.constructor as EntityStatics<State, this>;
    this.entityName = Ctor.entityName;

    const instanceName = `${this.entityName}:${this._id}`;
    const doId = env.GlobalDurableObject.idFromName(instanceName);
    this.stub = env.GlobalDurableObject.get(doId);
  }

  /** Synchronous accessors */
  get id(): string {
    return this._id;
  }
  get state(): State {
    return this._state;
  }

  /** Storage key for this entity document. */
  protected key(): string {
    return `${this.entityName}:${this._id}`;
  }

  /** Save and refresh cache. */
  async save(next: State): Promise<void> {
    for (let i = 0; i < 4; i++) {
      await this.ensureState();
      const res = await this.stub.casPut(this.key(), this._version, next);
      if (res.ok) {
        this._version = res.v;
        this._state = next;
        return;
      }
      // retry on contention
    }
    throw new Error("Concurrent modification detected");
  }

  protected async ensureState(): Promise<State> {
    const Ctor = this.constructor as EntityStatics<State, this>;
    const doc = (await this.stub.getDoc(this.key())) as Doc<State> | null;
    if (doc == null) {
      this._version = 0;
      this._state = Ctor.initialState;
      return this._state;
    }
    this._version = doc.v;
    this._state = doc.data;
    return this._state;
  }

  async mutate(updater: (current: State) => State): Promise<State> {
    // Small bounded retry loop for CAS contention
    for (let i = 0; i < 4; i++) {
      const current = await this.ensureState();
      const startV = this._version;
      const next = updater(current);
      const res = await this.stub.casPut(this.key(), startV, next);
      if (res.ok) {
        this._version = res.v;
        this._state = next;
        return next;
      }
      // someone else updated; retry
    }
    throw new Error("Concurrent modification detected");
  }

  async getState(): Promise<State> {
    return this.ensureState();
  }

  async patch(p: Partial<State>): Promise<void> {
    await this.mutate((s) => ({ ...s, ...p }));
  }

  async exists(): Promise<boolean> {
    return this.stub.has(this.key());
  }

  /** Delete the entity. */
  async delete(): Promise<boolean> {
    return this.stub.del(this.key());
  }
}

type IR = {
  head_node_id: string | null;
  tail_node_id: string | null;
  total_count: number;
  name: string; // The name of the index
  pageSize: number;
};

// Index is a persistent collection of items, for example to store the list of all users or chats.
export class Index<T> extends Entity<IR> {
  static readonly entityName = "sys-index-root";
  static readonly initialState: IR = {
    head_node_id: null,
    tail_node_id: null,
    total_count: 0,
    name: "",
    pageSize: 200,
  };

  constructor(env: Env, name: string) {
    super(env, `index:${name}`);
    // pageSize can be customized on first creation via seed/ensureRoot
  }

  private async ensureRoot(name?: string, pageSize?: number): Promise<void> {
    const doc = (await this.stub.getDoc(this.key())) as Doc<IR> | null;
    if (!doc) {
      await this.stub.casPut(this.key(), 0, {
        ...Index.initialState,
        name: name ?? this.id.replace(/^index:/, ''),
        pageSize: pageSize ?? Index.initialState.pageSize,
      });
    }
    await this.ensureState();
  }

  /**
   * Adds a batch of items to the index transactionally.
   */
  async addBatch(itemsToAdd: T[]): Promise<void> {
    if (itemsToAdd.length === 0) return;
    await this.ensureRoot();
    const { pageSize } = this.state;
    await this.stub.indexAddBatch(this.key(), pageSize, itemsToAdd);
  }

  async add(item: T): Promise<void> {
    return this.addBatch([item]);
  }

  async remove(item: T): Promise<boolean> {
    const removed = await this.removeBatch([item]);
    return removed > 0;
  }

  async removeBatch(itemsToRemove: T[]): Promise<number> {
    if (itemsToRemove.length === 0) return 0;
    await this.ensureRoot();
    const removed = await this.stub.indexRemoveBatch(this.key(), itemsToRemove);
    return removed;
  }

  async clear(): Promise<void> {
    await this.stub.indexDrop(this.key());
  }

  async *scan(): AsyncGenerator<T, void, void> {
    await this.ensureRoot();
    const s = this.state;
    let currentNodeId: string | null = s.head_node_id;

    while (currentNodeId) {
      const nk = nodeKey(this.key(), currentNodeId);
      const doc = (await this.stub.getDoc(nk)) as Doc<Node<T>> | null;
      const data = doc?.data;
      if (!data) break;
      for (const item of data.items) {
        yield item;
      }
      currentNodeId = data.next;
    }
  }

  async list(): Promise<T[]> {
    await this.ensureRoot();
    const out: T[] = [];
    for await (const it of this.scan()) out.push(it);
    return out;
  }
}

type IS<T> = T extends new (env: Env, id: string) => IndexedEntity<infer S> ? S : never;
type HS<TCtor> = TCtor & { indexName: string; keyOf(state: IS<TCtor>): string; seedData?: ReadonlyArray<IS<TCtor>> };
type CtorAny = new (env: Env, id: string) => IndexedEntity<{ id: string }>;

export abstract class IndexedEntity<S extends { id: string }> extends Entity<S> {
  static readonly indexName: string;
  static keyOf<U extends { id: string }>(state: U): string { return state.id; }

  // Static helpers infer S from `this` and the arguments
  static async create<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, state: IS<TCtor>): Promise<IS<TCtor>> {
    const id = this.keyOf(state);
    const inst = new this(env, id);
    await inst.save(state);
    const idx = new Index<string>(env, this.indexName);
    await idx.add(id);
    return state;
  }

  static async list<TCtor extends CtorAny>(this: HS<TCtor>, env: Env): Promise<IS<TCtor>[]> {
    const idx = new Index<string>(env, this.indexName);
    const ids = await idx.list();
    const items = (await Promise.all(ids.map((id) => new this(env, id).getState()))) as IS<TCtor>[];
    return items;
  }

  static async ensureSeed<TCtor extends CtorAny>(this: HS<TCtor>, env: Env): Promise<void> {
    const idx = new Index<string>(env, this.indexName);
    const ids = await idx.list();
    const seeds = this.seedData;
    if (ids.length === 0 && seeds && seeds.length > 0) {
      await Promise.all(seeds.map(s => new this(env, this.keyOf(s)).save(s)));
      await idx.addBatch(seeds.map(s => this.keyOf(s)));
    }
  }

  /** Delete an entity document and remove its id from the index. */
  static async delete<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, id: string): Promise<boolean> {
    const inst = new this(env, id);
    const existed = await inst.delete();
    const idx = new Index<string>(env, this.indexName);
    await idx.remove(id);
    return existed;
  }

  /** Delete many entities and prune their ids from the index. Returns number of docs removed. */
  static async deleteMany<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const results = await Promise.all(ids.map(async (id) => new this(env, id).delete()));
    const idx = new Index<string>(env, this.indexName);
    await idx.removeBatch(ids);
    return results.filter(Boolean).length;
  }

  /** Remove only the id from the index; does not delete the entity document. */
  static async removeFromIndex<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, id: string): Promise<void> {
    const idx = new Index<string>(env, this.indexName);
    await idx.remove(id);
  }

  protected override async ensureState(): Promise<S> {
    const s = (await super.ensureState()) as S;
    if (!s.id) {
      // Ensure the entity state id matches the instance id for consistency
      const withId = { ...s, id: this.id } as S;
      this._state = withId;
      return withId;
    }
    return s;
  }
}

// API HELPERS

export const ok = <T>(c: Context, data: T) => c.json({ success: true, data } as ApiResponse<T>);
export const bad = (c: Context, error: string) => c.json({ success: false, error } as ApiResponse, 400);
export const notFound = (c: Context, error = 'not found') => c.json({ success: false, error } as ApiResponse, 404);
export const isStr = (s: unknown): s is string => typeof s === 'string' && s.length > 0;