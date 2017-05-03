module.exports = function (list) {
  var chunk = 20
  var chunkI = -1
  var listOfLists = []

  list.forEach((item, index) => {
    if (index % chunk === 0) {
      chunkI++
      listOfLists.push([])
    }
    listOfLists[chunkI].push(item)
  })
  return listOfLists
}
