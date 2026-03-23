import path from 'path';
import fs from 'fs';
import { test as setup } from '@playwright/test'
import { LoginPage } from '../../pages/loginPage';
import { Constants } from '../../utils/constants';
import { DataUtils, FileUtils } from '../../utils/utilities';
import { Credential } from '../../data-objects/credential';

setup.describe.configure({ mode: 'default' });
setup(`Authenticate once for all credentials`, async ({ browser, page }) => {
    setup.slow();
    let stepNum = 1;

    const fileUtils = new FileUtils();
    const credsCreationTimeFilePath = path.join(Constants.TEMP_STORAGE_STATE_DIR_PATH, Constants.CREDENTIAL_CREATION_TIME_FILE_NAME);

    for (const credData of Constants.ALL_VALID_CREDENTIALS) {
        const authDataFilePath = path.join(__dirname, `../../${Constants.TEMP_LOGIN_STATE_FILE_PATH(credData.alias)}`);
        let doesAuthFileExist: boolean = true;
        let isAuthDataValid: boolean = true;

        await setup.step(`Step #${stepNum++}: Check if the ${credData.alias}.json exists`, async () => {
            if (!fs.existsSync(authDataFilePath)) {
                doesAuthFileExist = false;
                console.log(`>>> [WARNING] setupAuth(): Could not find the auth data file at ${authDataFilePath}!`);
                console.log(`>>> [INFO] setupAuth(): Need to generate a new auth data file for ${credData.alias}!`);
            } else {
                console.log(`>>> [INFO] setupAuth(): Found the auth data file at ${authDataFilePath}!`);
            }
        });

        await setup.step(`Step #${stepNum++}: Check the validity of the authentication data of ${credData.alias}`, async () => {
            if (doesAuthFileExist) {
                try {
                    const creationTimeData: Record<string, Record<string, string>> = await fileUtils.getCredentialCreationTimeData();
                    const createdTime = creationTimeData[credData.alias].createdAt;

                    if (!createdTime) {
                        isAuthDataValid = false;
                        console.log(`>>> [WARNING] setupAuth(): Auth data creation time of ${credData.alias} is not found! Saving new auth data!`);
                    } else {
                        if (DataUtils.generateUnixTimeStamp(true) <= Number(createdTime)) {
                            isAuthDataValid = false;
                            console.log(`>>> [WARNIG] setupAuth(): Auth data creation time of [${credData.alias}] is not correct. Saving new auth data!`);
                        } else if (DataUtils.generateUnixTimeStamp(true) - Number(createdTime) >= Constants.AUTH_DATA_LIFETIME_THRESHOLD) {
                            isAuthDataValid = false;
                            console.log(">>> [INFO] setupAuth(): Auth data generation time exceeds threshold. Saving new auth data!");
                        } else {
                            console.log(`>>> [INFO] setupAuth(): Auth data of [${credData.alias}] is still valid!`);
                        }
                    }
                } catch (error) {
                    isAuthDataValid = false;
                    console.log(`>>> [WARNING] setupAuth(): Failed to validate the lifetime of the auth data of the ${credData.alias}! Saving new auth data!`);
                }
            }
        })

        await setup.step(`Step #${stepNum++}: Save new auth data for ${credData.alias} if needed`, async () => {
            if (!doesAuthFileExist || !isAuthDataValid) {
                console.log(`>>> [INFO] setupAuth(): Saving new auth data to ${authDataFilePath}`);
                // Create a new and clean (incognito-like) session
                await page.context().close();
                const newContext = await browser.newContext();
                page = await newContext.newPage();

                await page.goto(Constants.LOGIN_URL);
                await new LoginPage(page).login(new Credential({ username: credData.username, password: credData.password }), false);
                await page.context().storageState({ path: authDataFilePath });

                console.log(`>>> [INFO] setupAuth(): Saved new auth data to ${authDataFilePath}`);
                const creationTimeData: Record<string, Record<string, string>> = await fileUtils.getCredentialCreationTimeData();
                creationTimeData[credData.alias] = { createdAt: DataUtils.generateUnixTimeStamp(true).toString() }
                const updatedData = { ...creationTimeData };
                await fs.writeFileSync(credsCreationTimeFilePath, JSON.stringify(updatedData, null, 2));
                console.log(`>>> [INFO] setupAuth(): The file ${credsCreationTimeFilePath} is updated with creation time of [${credData.alias}]!\n`);

            } else {
                console.log(`>>> [INFO] setupAuth(): No need to save new auth data for [${credData.alias}]!\n`);
            }
        });
    }
});

setup("Prepare JSON file for credentials usages status", async ({ page }) => {
    const credsUsageDataFilePath = path.join(Constants.TEMP_STORAGE_STATE_DIR_PATH, Constants.CREDENTIAL_USAGE_STATUS_FILE_NAME);
    const fileUtils = new FileUtils();
    await fileUtils.ensureJsonFileExists(credsUsageDataFilePath);
    await fileUtils.loadFreshContentToCredsUsageStatusFile();
});
