// import { loadTestData } from "./testDataLoader";
// import { TestType, Page } from "@playwright/test";

// type MyFixtures = { page: Page; dataProvider: any; setupAction: Map<string, any> };

// export function runDataDrivenTest(
//   testName: string, testDirPath: string,
//   testBlock: (args: MyFixtures) => Promise<void>
// ) {
  
//   // 2. Find the array of data associated with this testTitle
//   const dataSets = loadTestData(testDirPath, testName);

//   // 3. Loop and register tests at the top level
//   for (const data of dataSets.entries()) {
//     test(`${testName} - Iteration ${index + 1}: ${data.description || ''}`, async ({ args.get('page') }) => {
//       // 4. Pass the 'page' and the specific 'data' row into your block
//       await testBlock({ page, dataProvider: null, setupAction: null });
//     });
//   }
// }