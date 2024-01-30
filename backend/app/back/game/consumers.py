import json
from random import randint
from django.conf import settings
import threading
from channels.generic.websocket import AsyncWebsocketConsumer, SyncConsumer
from channels.exceptions import StopConsumer
from channels.db import database_sync_to_async
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from .pong import PongEngine
from asgiref.sync import async_to_sync, sync_to_async
from .models import Match, Tournament
from users.models import User
from django.shortcuts import get_object_or_404

# Function to create a match between two players asynchronously
@sync_to_async
def makeMatch(players):
	player1 = User.objects.get(username=players[0]['user'])
	player2 = User.objects.get(username=players[1]['user'])
	newMatch = Match.objects.create(player1=player1, player2=player2)
	id = str(newMatch.id)
	if not newMatch:
		message = {'response' : 'error', 'match_id' : 0}
	else:
		message = {'response' : 'match_found', 'match_id' : id}
	return message

from .tournament import TournamentEngine

@database_sync_to_async
def MakeTournament():
	tournament = Tournament.objects.create()
	return tournament.id

@database_sync_to_async
def addTournamentLoosers(tournament_id, looser):
	tournament = get_object_or_404(Tournament, id=tournament_id)
	tournament.loosers.add(looser)

class TournamentManager(AsyncWebsocketConsumer):
	async def connect(self):
		self.group_name = "tournament"
		if not self.scope['user'].is_authenticated:
			return
		await self.accept()

	async def receive(self, text_data):
		message = json.loads(text_data)["message"]
		if message == "heartbeat":
			return
		elif message == 'join':
			settings.TOURNAMENT.append({
					"user" : self.scope["user"].username,
					"channel_name" : self.channel_name,
				})
			if len(settings.TOURNAMENT) == 4:
				self.tournament_id = await sync_to_async(MakeTournament)()
				print("🔥")
				tour = TournamentEngine(settings.TOURNAMENT, self.channel_layer, self.tournament_id)
				tour.start()

				await self.channel_layer.group_send(
					self.group_name,
					{
						"type": "getTournamentId",
						"content": self.tournament_id
					}
				)
				settings.TOURNAMENT = []

	async def getTournamentId(self, event):
		self.tournament_id = event['content']

	async def disconnect(self, exit_code):
		await addTournamentLoosers(self.tournament_id, self.scope['user'])
		await self.channel_layer.group_discard(self.group_name, self.channel_name)
		raise StopConsumer("Disconected")

	async def get_match_id(self, event):
		match_id = event['match_id']
		await self.send(text_data=json.dumps(match_id))


# WebSocket consumer for managing the queue of players waiting for a match
class QueueManager(AsyncWebsocketConsumer):

	async def connect(self):
		self.room_group_name = "queue"
		if not self.scope['user'].is_authenticated:
			return
		await self.accept()
		await self.channel_layer.group_add(self.room_group_name, self.channel_name)

	async def disconnect(self, exit_code):
		await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
		if self.scope['user'].is_authenticated:
			for player in settings.QUEUE_MANAGER:
				if player['user'] == self.scope['user'].username:
					settings.QUEUE_MANAGER.remove(player)
					break
		raise StopConsumer("Disconected")

	async def sendResponse(self, event):
		content = event['content']
		await self.send(text_data=json.dumps(content))

	async def receive(self, text_data):
		message = json.loads(text_data)["message"] 
		if message == "heartbeat":
			return
		if message == 'join':
			settings.QUEUE_MANAGER.append({
					'user' : self.scope["user"].username,
					'channel_name' : self.channel_name,
				})
		if len(settings.QUEUE_MANAGER) >= 2:
			players = []
			for i, player in enumerate(settings.QUEUE_MANAGER):
				if i < 2:
					players.append(player)
			response = await makeMatch(players)
			for player in players:
				await self.channel_layer.send(player['channel_name'], {"type" : "sendResponse", "content" : response})

# Function to update the match details asynchronously
@database_sync_to_async
def updateMatch(id, content):
	curMatch = get_object_or_404(Match, id=id)
	curMatch.wScore = content['wScore']
	curMatch.lScore = content['lScore']
	curMatch.duration = content['duration']
	if content['winner'] == 'P1':
		curMatch.winner = curMatch.player1
	else:
		curMatch.winner = curMatch.player2
	curMatch.save()

# Function to get the player ID for a match asynchronously
@database_sync_to_async
def getPlayerID(id, user):
	match = Match.objects.get(id=id)
	if user == match.player1:
		return 1
	elif user == match.player2:
		return 2
	return 0

# WebSocket consumer for managing the players in a match
class PlayerConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.room_name = self.scope["url_route"]["kwargs"]["game"]
		self.group_name = "game_%s" % self.room_name
		self.playerID = await getPlayerID(self.room_name, self.scope["user"])
		if (self.playerID == 0):
			print("Could not connect user in room")
			await self.close()
		await self.channel_layer.group_add(self.group_name, self.channel_name)
		await self.accept()

		if not self.group_name in settings.ENGINES:
			settings.ENGINES[self.group_name] = PongEngine(self.group_name)

		if self.playerID == 1:
			settings.ENGINES[self.group_name].setWebsocket1(self)
		elif self.playerID == 2:
			settings.ENGINES[self.group_name].setWebsocket2(self)

		if settings.ENGINES[self.group_name].ready():
			settings.ENGINES[self.group_name].start()
			print(f"Connected in room : {str(self.room_name)}")

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(self.group_name, self.channel_name)
		raise StopConsumer("Disconnected")

	async def receive(self, text_data):
		content = json.loads(text_data)
		keyInput = content["message"]
		if keyInput == "heartbeat":
			return
		settings.ENGINES[self.group_name].setPlayerInputs(self.playerID, keyInput)

	async def endGame(self, event):
		content = event['content']
		# send to the front if the player won or lost
		if self.playerID == 1 and content['winner'] == 'P1' or self.playerID == 2 and content['winner'] == 'P2':
			await self.send(text_data=json.dumps({
				'type': 'results',
				'content': 'win'
				}))
		else:
			await self.send(text_data=json.dumps({
				'type': 'results',
				'content': 'lose'
				}))

		if self.playerID == 1:
			# Update the match details in the database
			await updateMatch(self.room_name, content)
		await self.close()

