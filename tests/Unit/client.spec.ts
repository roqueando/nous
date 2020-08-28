import TestCase from '../TestCase'
import * as json from '../Fixtures/services/db/db.json'

export function jsonServiceTest(testCase: TestCase, done ?: Function) {
  setTimeout(async () => {
    const result = await testCase.client.send("HomeTest", {
      action: 'getJson',
      parameters: []
    });
    expect(result.data).toStrictEqual(json.data);
    done()
  }, 10)
}

