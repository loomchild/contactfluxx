module.exports = function (list) {
  var listLength = list.length
  var chunk = 20
  var title = -1
  var listOfLists = []

  list.forEach((item, index) => {
    if(index%chunk === 0)
    {
      title++
      listOfLists.push([])
    }
    listOfLists[title].push(item)
  } )
  return listOfLists
}
