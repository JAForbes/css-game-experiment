var R = require('ramda')
var f = require('flyd')
	f.dropRepeats = require('flyd/module/droprepeats').dropRepeatsWith(R.equals)

function Gamepad(options){
	var index = options.index || 0
	var end = f.stream()
	var deadzone = 0.25

	var streams = {}

	var poll = options.poll

	streams.state = f.combine(function(){
		return navigator.getGamepads()[index]
	}, [poll])

	var extractButtons =
		R.pipe(
			R.prop('buttons')
			,R.map(R.pick(['pressed', 'value']))
		)

	streams.axes = f.dropRepeats(
		streams.state.map(
			R.pipe(
				R.prop('axes')
				,R.map(
					R.when(
						R.pipe(Math.abs, R.lt(R.__, deadzone)),
						R.always(0)
					)
				)
			)
		)
	)
	streams.buttons = f.dropRepeats(streams.state.map(extractButtons))
	streams.timestamp = f.dropRepeats(streams.state.map(R.prop('timestamp')))


	return {
		streams: streams
		,end: end
	}
}

module.exports = Gamepad