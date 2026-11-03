import { container } from '../src/infrastructure/container';
if (process.env.DEMO_MODE !== 'true') throw new Error('Set DEMO_MODE=true before seeding');
container();
console.log('Local demo dataset ready. No external services contacted.');
