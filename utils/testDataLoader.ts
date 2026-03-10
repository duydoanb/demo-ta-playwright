import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

export class TestDataUtils {
    static loadTestDataForSpecificTestCase(testDirPath: string, testName: string,
        testDataFileName: string = 'testData.json'): Promise<Map<string, any>> {

        const testDataFilePath = path.join(testDirPath, testDataFileName);
        const fileContent = readFileSync(testDataFilePath, 'utf-8');
        const allTestsData: Record<string, any> = JSON.parse(fileContent);
        const testSpecificData = allTestsData[testName] || {};

        if (testSpecificData.length === 0) {
            console.warn(`[BEFORE METHOD] [${testName}] [DATA PROVIDER]: No specific test data found for ${testName} in ${testDataFileName}`);
        } else {
            console.log(`[BEFORE METHOD] [${testName}] [DATA PROVIDER]: Loaded test data for ${testName}: ${JSON.stringify(testSpecificData)}`);
        }
        return testSpecificData;
    }

    static loadFullDataSet(fileContext: string, testDataFileName: string = 'testData.json'): Record<string, Record<string, any>[]> {
        const testDataFilePath = PathUtils.getTestDataFilePathForCurrentTest(fileContext, testDataFileName);
        const data = JSON.parse(readFileSync(testDataFilePath, 'utf-8'));
        console.log(`LOADED FULL DATASET FOR [${fileContext}]`);
        return data;
    }
}

export class PathUtils {
    /**
     * Returns the absolute path of the current file directory for a given file context.
     * @param fileContext - Pass import.meta.url or __filename
     */
    static getParentDirPath(fileContext: string): string {
        // Check if it's a file URL (starts with file://)
        const absolutePath = fileContext.startsWith('file://')
            ? fileURLToPath(fileContext)
            : fileContext;

        const currentDir = path.dirname(absolutePath);
        return currentDir;
    }

    static getTestDataFilePathForCurrentTest(fileContext: string, testDataFileName: string = 'testData.json'): string {
        return path.join(this.getParentDirPath(fileContext), testDataFileName);
    }

    static getSimpleTestClassName(fileContext: string): string {
        const absolutePath = fileContext.startsWith('file://') ? fileURLToPath(fileContext) : fileContext;
        return path.parse(absolutePath).name.replace(/.spec.*/, "");
    }
}
