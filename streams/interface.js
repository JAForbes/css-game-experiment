var R = require('ramda')
var f = require('flyd')
	f.dropRepeats = require('flyd/module/droprepeats').dropRepeatsWith(R.equals)

/**
 *	An interface that matches a real gamepad stream.
 *	Use it as an adapter to other forms of input or AI
 */
function GamepadInterface(){
	var deadzone = 0.25
	var end = f.stream()
	var streams = {}

	var state = {
		buttons: R.times(R.always({ pressed: false, value: 0 }), 12)
		,axes: [ 0 , 0 ]
		,timestamp: new Date().getTime()
	}

	streams.state = f.stream(state)

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

module.exports = GamepadInterface