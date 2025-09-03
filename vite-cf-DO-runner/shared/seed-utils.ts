import { GlobalDurableObject } from '../worker/core-utils';

interface Env {
  GlobalDurableObject: DurableObjectNamespace<GlobalDurableObject>;
}

export async function seedDurableObject(durableObjectStub: DurableObjectStub): Promise<void> {
  await durableObjectStub.getDemoItems();
}

export async function isDurableObjectSeeded(durableObjectStub: DurableObjectStub): Promise<boolean> {
  const items = await durableObjectStub.getDemoItems();
  return items.length > 0;
}

export async function seedAll(env: Env): Promise<{ durableObject: boolean }> {
  const durableObjectStub = env.GlobalDurableObject.get(env.GlobalDurableObject.idFromName("global"));
  
  if (await isDurableObjectSeeded(durableObjectStub)) {
    return { durableObject: false };
  }
  
  await seedDurableObject(durableObjectStub);
  return { durableObject: true };
}