CSS + Streams Game Experiment
=============================


Musings
-------

#### AI as a stream of input

Usually an AI controlled character and a player controlled character
have completely different code/requirements.

This can lead to problems when you would like to enable multiplayer
in a game that was previously against AI only.

If you can write all your entities as responding to a stream of input
from a gamepad.  Then you can control your AI characters by triggering
input, instead of directly mutating their internal state.

So in order for an NPC to jump, you'd write code for the player to jump.
You then trigger the input stream (a button press) to trigger the behavior.

#### The possibilities

- You could record player input and replay it as AI input
- You can send input events over the wire to enable multiplayer
or server controlled AI
- You have a single pattern for writing entities, instead of separate
codebases for AI/Human
- You can easily test AI behaviours/animations by taking control
- A player could drop in and out trivially of a game.  E.g. tails from Sonic
or coop mode in Lego Star Wars

#### The implementation

AI needs to respond to events in the game beyond input.  They
need more than just a stream of input, they also need a stream of
game events.

Effectively you need your AI layer to accept a superset of the player
API.  The AI layer needs to manage the input stream but also
respond to world events.  This means you need some kind of common
format for world events that must be agreed upon by multiple components.

But who triggers the world events?

#### World events

Perhaps you have a central component that observes the rest of the entities
and signals events that could be responded to.

> An animal sees a predator, (Animal AI decides to run).

Or

> A predator sees an Animal (Predator AI decides to give chase).

But how does the world event manager know what events are relevant.
Ultimately the AI itself knows what is and isn't important.
It may be possible for your game to decide which events are generally
useful (Collision, Sight).  And then the relevant components
can introduce eachother and come up with more specific event streams.