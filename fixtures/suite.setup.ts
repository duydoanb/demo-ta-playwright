import { promises as fs } from 'fs';
import path from 'path';
import { DataUtils } from '../utils/utilities';

async function globalSetup() {
    console.log('[BEFORE SUITE]: START...');
    // BeforeSuite logic here - Executed only once per run, before all tests
    // BUT using a completely isolated process with other tests, so don't init/store any value here or they will be undefined at run-time

    if (!process.env.TEST_RUN_ID) {
        process.env.TEST_RUN_ID = `local-${DataUtils.getCurrentLocalISOTimeStamp()}`;
    }

    const allureResultsDir = path.join(process.cwd(), 'allure-results', process.env.TEST_RUN_ID);
    await fs.mkdir(allureResultsDir, { recursive: true });

    const content = [
        `TEST_RUN_ID=${process.env.TEST_RUN_ID}`,
        `BASE_URL=${process.env.BASE_URL}`,
        `ENVIRONMENT=QA`
    ].join('\n');

    await fs.writeFile(path.join(allureResultsDir, 'environment.properties'), content, 'utf8');
    console.log(`[BEFORE SUITE] Created a new allure result dir at [${allureResultsDir}]`);
    console.log('[BEFORE SUITE]: END...');
}

export default globalSetup;
