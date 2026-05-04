import { getCatalog } from '../catalog.js';

export default async function catalogRoutes(fastify) {
  fastify.get('/api/catalog', () => getCatalog());
}
