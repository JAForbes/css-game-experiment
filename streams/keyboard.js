var R = require('ramda')
var f = require('flyd')
	f.sampleOn = require('flyd/module/sampleon')

function Keyboard(options){
	var end = f.endsOn(options.poll.end, f.stream())
	var keydown = f.endsOn(end, f.stream())
	var keyup = f.endsOn(end, f.stream())

	window.addEventListener('keydown', keydown)
	window.addEventListener('keyup', keyup)
	f.on(function(){ window.removeEventListener('keydown', keydown) }, keydown.end)
	f.on(function(){ window.removeEventListener('keyup', keyup) }, keyup.end)

	var streams = {}

	var KB_W = 87
	var KB_A = 65
	var KB_S = 83
	var KB_D = 68
	var KB_UP = 38
	var KB_LEFT = 37
	var KB_RIGHT = 39
	var KB_DOWN = 40

	var X = {}
	var Y = {}

	X[KB_A] = X[KB_LEFT] = Y[KB_W] = Y[KB_UP] = -1
	X[KB_D] = X[KB_RIGHT] = Y[KB_DOWN] = Y[KB_S] = 1

	var state = {
		buttons: R.times(R.always({ pressed: false, value: 0 }), 12)
		,axes: [ 0 , 0 ]
		,timestamp: new Date().getTime()
	}

	var keydownState = f.combine(function(e){
		return (state = {
			buttons: R.times(R.always({ pressed: false, value: 0 }), 12)
			,axes: [
				X[e().keyCode] || state.axes[0]
				,Y[e().keyCode] || state.axes[1]
			]
			,timestamp: new Date().getTime()
		})
	}, [keydown])

	var keyupState = f.combine(function(e){
		return (state = {
			buttons: R.times(R.always({ pressed: false, value: 0 }), 12)
			,axes: [
				X[e().keyCode] == state.axes[0] ? 0 : state.axes[0]
				,Y[e().keyCode] == state.axes[1] ? 0 : state.axes[1]
			]
			,timestamp: new Date().getTime()
		})
	}, [ keyup ])

	streams.state =
		f.sampleOn(
			options.poll
			,f.merge(keydownState, keyupState)
		)


	streams.axes = streams.state.map(R.prop('axes'))
	streams.buttons = streams.state.map(R.prop('buttons'))

	return {
		streams: streams
		,end: end
	}
}

module.exports = Keyboard