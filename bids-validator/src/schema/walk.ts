import { BIDSContext, type BIDSContextDataset } from './context.ts'
import type { BIDSFile, FileTree } from '../types/filetree.ts'
import type { DatasetIssues } from '../issues/datasetIssues.ts'
import { loadTSV } from '../files/tsv.ts'

function* quickWalk(dir: FileTree): Generator<BIDSFile> {
  for (const file of dir.files) {
    yield file
  }
  for (const subdir of dir.directories) {
    yield* quickWalk(subdir)
  }
}

const nullFile = {
  stream: new ReadableStream(),
  text: async () => '',
  readBytes: async (size: number, offset?: number) => new Uint8Array(),
}

function pseudoFile(dir: FileTree): BIDSFile {
  return {
    name: `${dir.name}/`,
    path: `${dir.path}/`,
    size: [...quickWalk(dir)].reduce((acc, file) => acc + file.size, 0),
    ignored: dir.ignored,
    parent: dir.parent as FileTree,
    viewed: false,
    ...nullFile,
  }
}

/** Recursive algorithm for visiting each file in the dataset, creating a context */
async function* _walkFileTree(
  fileTree: FileTree,
  dsContext: BIDSContextDataset,
): AsyncIterable<BIDSContext> {
  for (const file of fileTree.files) {
    yield new BIDSContext(file, dsContext)
  }
  for (const dir of fileTree.directories) {
    if (dsContext.isPseudoFile(dir)) {
      yield new BIDSContext(pseudoFile(dir), dsContext)
    } else {
      yield* _walkFileTree(dir, dsContext)
    }
  }
  loadTSV.cache.delete(fileTree.path)
}

/** Walk all files in the dataset and construct a context for each one */
export async function* walkFileTree(
  dsContext: BIDSContextDataset,
): AsyncIterable<BIDSContext> {
  yield* _walkFileTree(dsContext.tree, dsContext)
}
