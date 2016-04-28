var m = require('mithril')
var j2c = require('j2c')
var R = require('ramda')
var f = require('flyd')
	f.every = require('flyd/module/every')
	f.dropRepeats = require('flyd/module/droprepeats').dropRepeatsWith(R.equals)
	f.lift = require('flyd/module/lift')
	f.filter = require('flyd/module/filter')

var Keyboard = require('./streams/keyboard')
var Gamepad = require('./streams/gamepad')
var GamepadInterface = require('./streams/interface')
var RAF = require('./streams/requestAnimationFrame')


var sheet = j2c.sheet({
	'.level' : {
		transform: 'translate3d(50vw, 50vh, 0px) scale3d(10,10,1)'
		,transform_origin: 'top left'
		,position: 'absolute'
	}
	,'.game': {
		margin: '0px'
		,image_rendering: 'pixelated'
		,position: 'absolute'
		,padding: '0px'
		,width: '100vw'
		,height: '100vh'
		,overflow: 'hidden'
	}
})

function Deer(gamepad, coords){

	var xAxis = gamepad.streams.axes.map(R.propOr(0, '0'))
	var yAxis = gamepad.streams.axes.map(R.propOr(0, '1'))

	var container = f.stream()
	var sprite = f.stream()

	var css = j2c.sheet({
		'.container' : {
			width: '15px'
			,height: '16px'
			,display: 'block'
			,zIndex: 1
			,position: 'absolute'
			,transform: 'translate3d(0px, 0px, 0px)'
			,overflow: 'hidden'
		}
		,'.sprite': {
			width: (16*7)+'px'
			,height: '16px'
			,transform: 'translate3d(0px, 0px, 0px)'
		}
		,'.running': {
			backgroundImage: 'url("img/original/characters/dear/right_running.png")'
			,'animation': 'running .5s steps(3) infinite'
		}
		,'@keyframes running': {
			'100%': {
				transform: 'translateX(-'+16*3+'px)'
				,image_rendering: 'pixelated'
				,filter: 'blur(0)'
				,transform_origin: '40% 50%'
			}
		}
		,'.idle': {
			backgroundImage: 'url("img/original/characters/dear/right_grazing.png")'
			,'animation': 'idle 7s steps(7) infinite'

		}
		,'@keyframes idle': {
			'100%': {
				transform: 'translateX(-'+16*7+'px)'
				,image_rendering: 'pixelated'
				,filter: 'blur(0)'
				,transform_origin: '40% 50%'
			}
		}
	})


	var v = { x:0, y: 0 }
	var p = { x:0 , y: 0}
	var friction = 0.6
	var acceleration = 1
	var running = f.stream(false)

	f.combine(function(){
		var a = { x:0 , y: 0}
		a.x = xAxis() * acceleration
		a.y = yAxis() * acceleration

		v.x += a.x
		v.y += a.y

		v.x *= friction
		v.y *= friction

		p.x += v.x
		p.y += v.y

		running(Math.hypot(v.x, v.y) > 0.25)
		coords(p)
	}, [xAxis, yAxis, gamepad.streams.state ])

	var zRotation = yAxis.map(function(y){
		return y * Math.abs(xAxis() * 5)
	})

	var xDirection = xAxis.map(function(x){
		return x > 0
			? 1
			: x == 1
			? xDirection && xDirection() || 1
			: -1
	})

	var style = f.combine(function(){
		sprite().className = css.sprite + ' ' + (running() ? css.running : css.idle)

		var translate = 'translate3d(0px, 0px, 0px) scale3d('+xDirection()+',1,1)'

		return {
			transform: translate
		}
	},[ f.dropRepeats(xDirection), f.dropRepeats(running), container ])

	f.dropRepeats(style)
		.map(function(){
			Object.assign(container().style, style())
		})

	return function(){
		return m('div',
			m('style', css)
			,m('div', { className: css.container, config: container },
				m('div', { config: sprite })

			)
		)
	}
}

var component = function(c){ return { controller: c, view: function(v){ return v() } } }

function NPCDeer(gamepad, coords){
	var el = f.stream()

	var style = coords.map(R.pipe(
		R.map(Math.floor)
		,function(p){
			return {
				position: 'absolute'
				,transform: 'translate3d('+p.x+'px, '+p.y+'px, 0px) scale3d(1,1,1)'
				,zIndex: 1
				,transition: 'transform 0.1s'
				,filter: 'blur(0)'
			}
		}
	))

	f.combine(function(el, style){
		Object.assign(el().style, style())
	}, [el, f.dropRepeats(style)])


	return function view(){
		return m('div.npc' ,{ config: el }
			,m.component(component(Deer), gamepad, coords)
		)
	}

}

function Grass(){
	return function(){
		return m('div', { style: {
			width: '100vw'
			,height: '100vh'
			,backgroundRepeat: 'repeat'
			,backgroundImage: 'url("img/original/tiles/grass.png")'
			,imageRendering: 'pixelated'

			,transform: 'translate3d(-100px, -100px, 0px) scale3d(1.0,1, 1.0) rotateX(70deg) rotateZ(45deg)'
			,position: 'absolute'
			,transformOrigin: 'top left'
		}})
	}
}

function Menu(){

	var css = j2c.sheet({
		'.title': {
			animation: 'title 1s ease-in-out'
			,animation_fill_mode: 'forwards'
			,animation_delay: '1s'
			,transform: 'rotateX(0deg) scale(0)'
			,fontSize: '15vw'
		}
		,'@keyframes title': {
			to: {
				// '-webkit-filter': 'blur(0px)'
				'transform': 'rotateX(360deg) scale(1)'
			}
		}
		,'.play': {
			fontSize: '11vw'
			,top: 'calc(50vh - 12vw)'
			,textAlign: 'center'
			,opacity: 0
			,animation: 'play 2s linear'
			,animation_fill_mode: 'forwards'
			,animation_delay: '2.5s'
		}
		,'@keyframes play': {
			to: {
				opacity: 1
			}
		}
		,'.text': {
			width: '100%'
			,textAlign: 'center'
			,color: 'white'
			,position: 'absolute'
			,zIndex: 1
			,fontFamily: 'Helvetica'
		}
		,'.level': {
			transform: 'scale(10, 10) translate(50%, 50%)'
		}
	})

	return function(){
		return m('div', {className: sheet.game }
			,m('style', sheet)
			,m('style', css)
			,m('h1', {className: css.title + ' ' + css.text} , 'Deeeeerz')
			,m('a', { href: '/game', config: m.route}
				,m('h4', { className: css.text + ' ' + css.play }, 'Play?')
			)
			,m('div', { className: css.level }
				,m.component(component(Grass))
			)
		)
	}
}

function DeerAI(coords){
	var gamepad = GamepadInterface()
	var axes = [-0.3,0]
	var behavior = [
		[-0.3, 0]
		,[0,0],[0,0], [0,0]
		,[0.3, -0.3]
		,[0,0],[0,0], [0,0]
		,[0.3,0]
		,[0,0],[0,0], [0,0]
		,[0.3,0.3]
		,[0,0],[0,0], [0,0]
		,[-0.6, 0]
		,[0,0],[0,0], [0,0]
	]

	f.every(2000).map(function(){
		axes = behavior[0]
		console.log(axes)
		behavior.push(behavior.shift())
	})


	RAF().map(function(){
		var state = gamepad.streams.state()
		state.axes = axes
		gamepad.streams.state(state)
	})

	return m.component(component(NPCDeer), gamepad, coords)
}


function Game(){

	var coords = f.stream({ x:0, y: 0})
	var npcCoords = f.stream({ x:0, y: 0})

	var el = f.stream()

	var translate = coords.map(
		R.pipe(
			R.map(R.multiply(-1))
			,R.map(Math.floor)
			,function(coords){
				return 'translate3d('+coords.x+'px, '+coords.y+'px, 0px)'
			}
		)
	)


	f.combine(function(translate){
		el().style.transform = translate()
		el().style.transition = '0.2s'
		el().style.filter = 'none'
	}, [f.dropRepeats(translate), el])

	var poll = RAF()
	var keyboard = Keyboard({ poll: poll })
	var gamepad = Gamepad({ index: 0 , poll: poll })

	var menuIsPressed = R.pipe(
		R.prop(9)
		,R.prop('pressed')
	)
	var menuButton = f.filter(menuIsPressed, f.merge(gamepad.streams.buttons, keyboard.streams.buttons))

	menuButton.map(function(){ m.route('/menu') })

	return function(){

		return m('div', {className: sheet.game }
			,m('div', { className: sheet.level }
				,m('style', sheet)
				,m.component(component(Deer), keyboard, coords)
				// ,m.component(component(Deer), keyboard, coords)
				,m('div', { config: el }
					,DeerAI(npcCoords)
					// ,m.component( component(NPCDeer), deerAI, npcCoords )
					,m.component( component(Grass) )
				)
			)
		)
	}
}
document.body.style.margin = '0px'
m.route(document.body, '/menu', {
	'/game': component(Game)
	,'/menu': component(Menu)
})