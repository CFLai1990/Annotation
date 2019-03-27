String.prototype.visualLength = function (d) {
  // let ruler = $('#ruler')
  // ruler.css('font-size', d + 'px').text(this)
  // return [ruler[0].offsetWidth, ruler[0].offsetHeight]
  let fontSize = d
	let test = document.getElementById("ruler")
	test.innerHTML = this
	test.style.fontSize = fontSize + 'px'
	let height = (test.offsetHeight + 1) + "px"
	let width = (test.offsetWidth + 1) + "px"
	console.log(height, width)
	return [width, height]
}
