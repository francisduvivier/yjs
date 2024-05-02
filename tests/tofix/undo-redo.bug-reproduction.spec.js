import { init } from '../testHelper.js'
import * as Y from 'yjs'
import * as t from 'lib0/testing'

/**
 * @param {Y.Array<any>} array0
 */
function arrayHasUnitWithUndefinedContent (array0) {
  const badUnit = array0.toJSON().find((u) => !u.content)
  return !!badUnit
}

/**
 * @param {t.TestCase} tc
 */
export const testUndoMapSetAndDeleteFromArray = tc => {
  const { testConnector, array0, array1 } = init(tc, { users: 3 })
  const undoManager = new Y.UndoManager(array0)

  const mapInArray = new Y.Map()
  mapInArray.set('custom-prop', 'untouched prop value')
  mapInArray.set('content', 'to be changed content')
  array0.push([mapInArray])
  testConnector.syncAll()

  // START UNDO BLOCK
  undoManager.stopCapturing()

  // Change unit1 content
  mapInArray.set('content', 'changed content')
  testConnector.syncAll()

  // Delete unit1 from parent
  array0.delete(0, 1)
  testConnector.syncAll()

  // Undo the change content + unit deletion
  undoManager.undo()

  t.assert(arrayHasUnitWithUndefinedContent(array0) === false) // OK
  t.assert(arrayHasUnitWithUndefinedContent(array1) === false) // OK

  testConnector.syncAll()

  t.assert(arrayHasUnitWithUndefinedContent(array0) === false) // OK
  t.assert(arrayHasUnitWithUndefinedContent(array1) === false) // Failing
}
