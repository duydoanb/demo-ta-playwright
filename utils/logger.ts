import { TestInfo } from '@playwright/test';
import { Constants } from './constants';
import { DataUtils } from './utilities';

export type StepContext = {
    testTitle?: string;
    dataSetId?: string;
    userAlias?: string;
    testRunId?: string;
    projectName?: string;
};

export class Logger {
    static info(message: string, context?: StepContext): void {
        const prefix = context ? this.formatContext(context) : `[INFO]${this.parseContextFromConstant()}`;
        console.log(`${DataUtils.getCurrentLocalISOTimeStamp()} ${prefix} ${message}`.trim());
    }

    static warn(message: string, context?: StepContext): void {
        const prefix = context ? this.formatContext(context) : `[WARNING] ${this.parseContextFromConstant()}`;
        console.warn(`${DataUtils.getCurrentLocalISOTimeStamp()} ${prefix} ${message}`.trim());
    }

    static error(message: string, context?: StepContext): void {
        const prefix = context ? this.formatContext(context) : `[ERROR] ${this.parseContextFromConstant()}`;
        console.error(`${DataUtils.getCurrentLocalISOTimeStamp()} ${prefix} ${message}`.trim());
    }

    static step(stepName: string, context?: StepContext): void {
        this.info(`[STEP] ${stepName}`, context);
    }

    static newEmptyLine(): void {
        console.log("\n");
    }

    static fromTestInfo(testInfo: TestInfo, overrides?: Partial<StepContext>): StepContext {
        const dataSetId = this.getAnnotation(testInfo, 'dataset') ?? this.extractDataSetIdFromTitle(testInfo.title);
        const userAlias = this.getAnnotation(testInfo, 'userAlias');
        return {
            testTitle: testInfo.title,
            projectName: testInfo.project.name,
            dataSetId,
            userAlias,
            testRunId: Constants.TEST_RUN_ID,
            ...overrides,
        };
    }

    private static getAnnotation(testInfo: TestInfo, type: string): string | undefined {
        return testInfo.annotations.find(a => a.type === type)?.description;
    }

    private static extractDataSetIdFromTitle(title: string): string | undefined {
        const regexForDataSet = /((?:dataset|set|setno|data|testdata|test data|data no) #?\d+)/i;
        const _match = title.match(regexForDataSet);
        if (_match) {
            return _match[1];
        } else {
            return undefined;
        }
    }

    private static formatContext(context?: StepContext): string {
        const ctx = context ?? {};
        const chunks: string[] = [];
        const testRunId = ctx.testRunId ?? Constants.TEST_RUN_ID;
        if (testRunId) chunks.push(`[RUN:${testRunId}]`);
        if (ctx.projectName) chunks.push(`[PROJ:${ctx.projectName}]`);
        if (ctx.testTitle) chunks.push(`[TEST:${ctx.testTitle}]`);
        if (ctx.dataSetId) chunks.push(`[DATA:${ctx.dataSetId}]`);
        if (ctx.userAlias) chunks.push(`[CRED:${ctx.userAlias}]`);
        return chunks.join(' ');
    }

    private static parseContextFromConstant(): string {
        const _ctx = Constants.CURRENT_STEP_CONTEXT;
        if (!_ctx) {
            throw new Error("Cannot initialize the logger since the Constants.CURRENT_STEP_CONTEXT is not loaded!!!");
        }

        const chunks: string[] = [];
        // chunks.push(`run ${Constants.TEST_RUN_ID}`);
        // TC ID/title
        chunks.push(_ctx.title?.split(": ")[0]?.trim());
        // data set count
        const dataSetNo = this.extractDataSetIdFromTitle(_ctx.title);
        if (dataSetNo) {
            chunks.push(dataSetNo);
        }
        chunks.push(`${this.getAnnotation(_ctx, 'userAlias') ?? "cred N/A"}`);
        chunks.push(`worker${_ctx.workerIndex}`);
        return `[${chunks.join(" ")}]`;
    }
}
