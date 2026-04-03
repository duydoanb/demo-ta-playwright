import { Logger } from '../utils/logger';

async function globalTeardown() {
    console.log("\n\n-----------------------------------------------------------------------------------------------------------------------------------------------");
    Logger.info('[AFTER SUITE]: START...');
    // AfterSuite logic here - Executed only once per run, after all tests
    Logger.info('[AFTER SUITE]: END...');
}

export default globalTeardown;
