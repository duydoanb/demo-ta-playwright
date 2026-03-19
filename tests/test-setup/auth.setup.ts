import path from 'path';
import fs from 'fs';
import { test as setup } from '@playwright/test'
import { HomePage } from '../../pages/homePage';
import { LoginPage } from '../../pages/loginPage';
import { Constants } from '../../utils/constants';
import { FileUtils } from '../../utils/utilities';
import { Credential } from '../../data-objects/credential';

setup.describe.configure({ mode: 'default' });
setup(`Authenticate once for all credentials`, async ({ page }) => {
    let stepNum = 1;
    for (const credData of Constants.ALL_VALID_CREDENTIALS) {
        const authDataFilePath = path.join(__dirname, `../../${Constants.TEMP_LOGIN_STATE_FILE_PATH(credData.alias)}`);
        let doesAuthFileExist: boolean = true;
        let isAuthDataValid: boolean = true;

        await setup.step(`Step #${stepNum++}: Check if the ${credData.alias}.json exists`, async () => {
            if (!fs.existsSync(authDataFilePath)) {
                doesAuthFileExist = false;
                console.log(`>>> [INFO] setupAuth(): Could not find the auth data file at ${authDataFilePath}!`);
                console.log(`>>> [INFO] setupAuth(): Need to generate a new auth data file for ${credData.alias}!`);
            } else {
                console.log(`>>> [INFO] setupAuth(): Found the auth data file at ${authDataFilePath}!`);
            }
        });

        await setup.step(`Step #${stepNum++}: Check the validity of the authentication data of ${credData.alias}`, async () => {
            if (doesAuthFileExist) {
                try {
                    const authData: Record<string, any> = JSON.parse(fs.readFileSync(authDataFilePath, 'utf-8'));
                    const cookiesData = authData['cookies'];
                    for (const cookies of cookiesData) {
                        if (cookies['name'] === 'cookie_notice_accepted') {
                            // All timestamps are in seconds
                            const expiredTimestamp = cookies['expires'];
                            const authDataGenerationTimeStamp = expiredTimestamp - 30 * 24 * 60 * 60; // cookies lifetime = 30 days
                            const currentTimestamp: number = Math.floor(Date.now() / 1000);

                            if (currentTimestamp >= expiredTimestamp) {
                                isAuthDataValid = false;
                                console.log(">>> [INFO] setupAuth(): Auth data is expired");
                            } else if (currentTimestamp - authDataGenerationTimeStamp >= Constants.AUTH_DATA_LIFETIME_THRESHOLD) {
                                isAuthDataValid = false;
                                console.log(">>> [INFO] setupAuth(): Auth data generation time exceeds threshold. Saving new auth data!");
                            } else {
                                console.log(">>> [INFO] setupAuth(): Auth data is still valid!");
                            }
                        }
                    }
                } catch (error) {
                    isAuthDataValid = false;
                    console.log(">>> [INFO] setupAuth(): Failed to validate the lifetime of the auth data!");
                }
            }
        })

        await setup.step(`Step #${stepNum++}: Save new auth data for ${credData.alias} if needed`, async () => {
            if (!doesAuthFileExist || !isAuthDataValid) {
                console.log(`>>> [INFO] setupAuth(): Saving new auth data to ${authDataFilePath}`);
                const homePage = new HomePage(page);
                await homePage.navigateToTestSite();
                await homePage.clickLoginLink();
                await new LoginPage(page).login(new Credential({ username: credData.username, password: credData.password }), false);
                await page.waitForLoadState('networkidle');
                await page.context().storageState({ path: authDataFilePath });
                console.log(`>>> [INFO] setupAuth(): Saved new auth data to ${authDataFilePath}\n`);
            } else {
                console.log(">>> [INFO] setupAuth(): No need to save new auth data!\n");
            }
        });
    }
});

setup("Prepare JSON file for credentials usages status", async ({ page }) => {
    const credsUsageDataFilePath = path.join(__dirname, `../../.temp-storage-state-data/.auth/credential_usage_status.json`);
    const fileUtils = new FileUtils();
    await fileUtils.ensureJsonFileExists(credsUsageDataFilePath);
    await fileUtils.loadFreshContentToCredsUsageStatusFile(credsUsageDataFilePath);
});
