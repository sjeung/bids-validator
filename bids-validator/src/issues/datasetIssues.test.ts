import { assertEquals } from '../deps/asserts.ts'
import { BIDSFile, FileTree } from '../types/filetree.ts'
import { IssueFile } from '../types/issues.ts'
import { DatasetIssues } from './datasetIssues.ts'

Deno.test('DatasetIssues management class', async (t) => {
  await t.step('Constructor succeeds', () => {
    new DatasetIssues()
  })

  await t.step('add Issue with several kinds of files', () => {
    // This mostly tests the issueFile mapping function
    const issues = new DatasetIssues()
    const testStream = new ReadableStream()
    const text = () => Promise.resolve('')
    const root = new FileTree('', '/', undefined)
    const files = [
      {
        text,
        name: 'dataset_description.json',
        path: '/dataset_description.json',
        size: 500,
        ignored: false,
        stream: testStream,
        parent: root,
      } as BIDSFile,
      {
        text,
        name: 'README',
        path: '/README',
        size: 500,
        ignored: false,
        stream: testStream,
        line: 1,
        character: 5,
        severity: 'warning',
        reason: 'Readme borked',
        parent: root,
      } as IssueFile,
    ]
    issues.add({ code: 'TEST_FILES_ERROR', codeMessage: 'Test issue', location: files[1].path })
    const foundIssue = issues.get({location: '/README'})
    assertEquals(foundIssue.length, 1)
    assertEquals(foundIssue[0].code, 'TEST_FILES_ERROR')
  })
})
