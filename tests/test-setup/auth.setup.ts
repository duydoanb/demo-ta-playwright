import path from 'path';
import fs from 'fs';
import { test as setup } from '@playwright/test'
import { LoginPage } from '../../pages/loginPage';
import { Constants } from '../../utils/constants';
import { DataUtils, FileUtils } from '../../utils/utilities';
import { Credential } from '../../data-objects/credential';
import { Logger } from '../../utils/logger';

setup.describe.configure({ mode: 'default' });
setup(`Authenticate once for all credentials`, async ({ browser, page }, testInfo) => {
    Constants.SET_CURRENT_STEP_CONTEXT(testInfo);
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
                Logger.warn(`Could not find the auth data file at ${authDataFilePath}!`);
                Logger.info(`Need to generate a new auth data file for ${credData.alias}!`);
            } else {
                Logger.info(`Found the auth data file at ${authDataFilePath}!`);
            }
        });

        await setup.step(`Step #${stepNum++}: Check the validity of the authentication data of ${credData.alias}`, async () => {
            if (doesAuthFileExist) {
                try {
                    const creationTimeData: Record<string, Record<string, string>> = await fileUtils.getCredentialCreationTimeData();
                    const createdTime = creationTimeData[credData.alias].createdAt;

                    if (!createdTime) {
                        isAuthDataValid = false;
                        Logger.warn(`Auth data creation time of ${credData.alias} is not found! Saving new auth data!`);
                    } else {
                        if (DataUtils.generateUnixTimeStamp(true) <= Number(createdTime)) {
                            isAuthDataValid = false;
                            Logger.warn(`Auth data creation time of [${credData.alias}] is not correct. Saving new auth data!`);
                        } else if (DataUtils.generateUnixTimeStamp(true) - Number(createdTime) >= Constants.AUTH_DATA_LIFETIME_THRESHOLD) {
                            isAuthDataValid = false;
                            Logger.info("Auth data generation time exceeds threshold. Saving new auth data!");
                        } else {
                            Logger.info(`Auth data of [${credData.alias}] is still valid!`);
                        }
                    }
                } catch (error) {
                    isAuthDataValid = false;
                    Logger.warn(`Failed to validate the lifetime of the auth data of the ${credData.alias}! Saving new auth data!`);
                }
            }
        })

        await setup.step(`Step #${stepNum++}: Save new auth data for ${credData.alias} if needed`, async () => {
            if (!doesAuthFileExist || !isAuthDataValid) {
                Logger.info(`Saving new auth data to ${authDataFilePath}`);
                // Create a new and clean (incognito-like) session
                await page.context().close();
                const newContext = await browser.newContext();
                page = await newContext.newPage();

                await page.goto(Constants.LOGIN_URL);
                await new LoginPage(page).login(new Credential({ username: credData.username, password: credData.password }), false);
                await page.context().storageState({ path: authDataFilePath });

                Logger.info(`Saved new auth data to ${authDataFilePath}`);
                const creationTimeData: Record<string, Record<string, string>> = await fileUtils.getCredentialCreationTimeData();
                creationTimeData[credData.alias] = { createdAt: DataUtils.generateUnixTimeStamp(true).toString() }
                const updatedData = { ...creationTimeData };
                await fs.writeFileSync(credsCreationTimeFilePath, JSON.stringify(updatedData, null, 2));
                Logger.info(`The file ${credsCreationTimeFilePath} is updated with creation time of [${credData.alias}]!\n`);

            } else {
                Logger.info(`No need to save new auth data for [${credData.alias}]!\n`);
            }
            Logger.newEmptyLine();
        });
    }
});

setup("Prepare JSON file for credentials usages status", async ({ }) => {
    const credsUsageDataFilePath = path.join(Constants.TEMP_STORAGE_STATE_DIR_PATH, Constants.CREDENTIAL_USAGE_STATUS_FILE_NAME);
    const fileUtils = new FileUtils();
    await fileUtils.ensureJsonFileExists(credsUsageDataFilePath);
    await fileUtils.loadFreshContentToCredsUsageStatusFile();
    Logger.newEmptyLine();
});
