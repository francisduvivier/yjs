import { init } from '../testHelper.js'
import * as Y from 'yjs'
import * as t from 'lib0/testing'

/**
 * @param {t.TestCase} tc
 */
export const testUndoMapSetAndDeleteFromArray = tc => {
  const { testConnector, array0: arrayInFirstClient, array1: arrayInOtherClient } = init(tc, { users: 3 })
  const undoManager = new Y.UndoManager(arrayInFirstClient) // Other workaround: { ignoreRemoteMapChanges: true }

  const mapInArray = new Y.Map()
  mapInArray.set('untouchedProp', 'untouched prop value')
  const toBeChangedPropKey = 'toBeChangedProp'
  mapInArray.set(toBeChangedPropKey, 'before change')
  arrayInFirstClient.push([mapInArray])
  testConnector.syncAll()

  // START UNDO BLOCK
  undoManager.stopCapturing()

  // Change some value in the YMap
  mapInArray.set(toBeChangedPropKey, 'changed content')
  testConnector.syncAll()

  // undoManager.stopCapturing() // Workaround is to split up the undo and then doing undo twice

  // Delete the YMap from its parent Array
  arrayInFirstClient.delete(0, 1)
  testConnector.syncAll()

  // Undo the set + deletion from parent in 1 undo
  undoManager.undo()
  // undoManager.undo() // Workaround is to split up the undo and then doing undo twice

  testConnector.syncAll()

  t.assert(arrayInFirstClient.toJSON()[0][toBeChangedPropKey] === 'before change') // OK
  t.assert(arrayInOtherClient.toJSON()[0][toBeChangedPropKey] === 'before change') // Failing and undefined instead
}
