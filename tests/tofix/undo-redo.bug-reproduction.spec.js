import { init } from '../testHelper.js'
import * as Y from 'yjs'
import * as t from 'lib0/testing'

/**
 * @param {t.TestCase} tc
 */
export const testUndoMapSetAndDeleteFromArray = tc => {
  const { testConnector, array0, array1 } = init(tc, { users: 3 })
  const undoManager = new Y.UndoManager(array0) // Other workaround: { ignoreRemoteMapChanges: true }

  const mapInArray = new Y.Map()
  mapInArray.set('untouchedProp', 'untouched prop value')
  const toBeChangedPropKey = 'toBeChangedProp'
  mapInArray.set(toBeChangedPropKey, 'before change')
  array0.push([mapInArray])
  testConnector.syncAll()

  // START UNDO BLOCK
  undoManager.stopCapturing()

  // Change some value in the YMap
  mapInArray.set(toBeChangedPropKey, 'changed content')
  testConnector.syncAll()

  // undoManager.stopCapturing() // Workaround is to split up the undo and then doing undo twice

  // Delete the YMap from its parent Array
  array0.delete(0, 1)
  testConnector.syncAll()

  // Undo the set + deletion from parent in 1 undo
  undoManager.undo()
  // undoManager.undo() // Workaround is to split up the undo and then doing undo twice

  testConnector.syncAll()

  t.assert(array0.toJSON()[0][toBeChangedPropKey] === 'before change') // OK
  t.assert(array1.toJSON()[0][toBeChangedPropKey] === 'before change') // Failing and undefined instead
}
