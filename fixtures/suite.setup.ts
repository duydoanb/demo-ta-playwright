import fs from 'fs'
import path from 'path';
import { DataUtils } from '../utils/utilities';
import { Logger } from '../utils/logger';

async function globalSetup() {
    Logger.info('[BEFORE SUITE]: START...');
    // BeforeSuite logic here - Executed only once per run, before all tests
    // BUT using a completely isolated process with other tests, so don't init/store any value here or they will be undefined at run-time

    if (!process.env.TEST_RUN_ID) {
        process.env.TEST_RUN_ID = `local-${DataUtils.getCurrentLocalISOTimeStamp()}`;
    }

    const allureResultsDir = path.join(process.cwd(), 'allure-results', process.env.TEST_RUN_ID);
    await fs.mkdirSync(allureResultsDir, { recursive: true });

    const content = [
        `TEST_RUN_ID=${process.env.TEST_RUN_ID}`,
        `BASE_URL=${process.env.BASE_URL}`,
        `ENVIRONMENT=QA`
    ].join('\n');

    await fs.writeFileSync(path.join(allureResultsDir, 'environment.properties'), content, 'utf8');
    Logger.info(`[BEFORE SUITE] Created a new allure result dir at [${allureResultsDir}]`);

    Logger.info('[BEFORE SUITE]: END...\n-----------------------------------------------------------------------------------------------------------------------------------------------');
    console.log('\n\n');
}

export default globalSetup;
