var f = require('flyd')

function RAF(){
	var poll = f.stream()

	function loop(){
		poll(new Date().getTime())
		if(!poll.end()){
			requestAnimationFrame(loop)
		}
	}
	loop()
	return poll
}

module.exports = RAF