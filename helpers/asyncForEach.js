

module.exports = async (array, callback) => {
	if(!array)
		return undefined 
	
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


// async function asyncForEach(array, callback) {
//   for (let index = 0; index < array.length; index++) {
//     await callback(array[index], index, array);
//   }
// }
