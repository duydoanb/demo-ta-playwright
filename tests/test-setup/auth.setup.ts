import path from 'path';
import fs from 'fs';
import { test as setup } from '@playwright/test'
import { HomePage } from '../../pages/homePage';
import { LoginPage } from '../../pages/loginPage';
import { Constants } from '../../utils/constants';

const authDataFilePath = path.join(__dirname, `../../${Constants.TEMP_LOGIN_STATE_FILE_PATH}`);

setup('Authenticate once for all tests', async ({ page }) => {
    let doesAuthFileExist: boolean = true;
    let isAuthDataValid: boolean = true;

    await setup.step('Step #1: Check if the user.json exists', async () => {
        if (!fs.existsSync(authDataFilePath)) {
            doesAuthFileExist = false;
            console.log(`>>> Could not find the auth data file at ${authDataFilePath}!\nNeed to generate a new auth data file!`);
        } else {
            console.log(`>>> Found the auth data file at ${authDataFilePath}!`);
        }
    });

    await setup.step('Step #2: Check the validity of the authentication data', async () => {
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
                            console.log(">>> Auth data is expired");
                        } else if (currentTimestamp - authDataGenerationTimeStamp >= Constants.AUTH_DATA_LIFETIME_THRESHOLD) {
                            isAuthDataValid = false;
                            console.log(">>> Auth data generation time exceeds threshold. Saving new auth data!");
                        } else {
                            console.log(">>> Auth data is still valid!");
                        }
                    }
                }
            } catch (error) {
                isAuthDataValid = false;
                console.log(">>> Failed to validate the lifetime of the auth data!");
            }
        }
    })

    await setup.step('Step #3: Save new auth data if needed', async () => {
        if (!doesAuthFileExist || !isAuthDataValid) {
            console.log(`>>> Saving new auth data to ${authDataFilePath}`);
            const homePage = new HomePage(page);
            await homePage.navigateToTestSite();
            await homePage.clickLoginLink();
            await new LoginPage(page).login();
            await page.waitForLoadState('networkidle');
            await page.context().storageState({ path: authDataFilePath });
            console.log(`>>> Saved new auth data to ${authDataFilePath}\n`);
        } else {
            console.log(">>> No need to save new auth data!\n");
        }
    });
});
