from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, serializers
from .serializers import GameSerializer, NewGameSerializer, ResultSerializer, Result, SolutionSerializer
from .models import Game
from .word_data import words

def get_char_count(word):
    char_count = {}
    for c in word:
        char_count[c] = char_count.setdefault(c, 0) + 1
    return char_count

def check_guess(guess, solution):
    if guess == None or len(guess) != len(solution):
        return Result([0 for _ in range(len(solution))], False, "Guess does not meet specifications.")

    if guess.upper() not in words:
        return Result([0 for _ in range(len(solution))], False, "Not in word list.")

    solution_char_count = get_char_count(solution)
    guess_char_count = get_char_count(guess)
    result = []
    for i, c in enumerate(guess):
        if c == solution[i]:
            result.append(2)
        elif c in solution:
            result.append(1)
        else:
            result.append(0)

    for i in reversed(range(len(guess))):
        if result[i] == 1 and guess_char_count[guess[i]] > solution_char_count[guess[i]]:
            result[i] = 0
            guess_char_count[guess[i]] -= 1

    return Result(result, all(map(lambda x: x == 2, result)), "")

class CheckWordView(viewsets.ModelViewSet):
    serializer_class = ResultSerializer

    def get_queryset(self):
        guess = self.request.query_params.get('guess')
        game_id = self.request.query_params.get('id')
        solutionModel = Game.objects.filter(game_id=game_id)[0]
        result = check_guess(guess, solutionModel.solution)
        queryset = [result]
        return queryset


class SolutionView(viewsets.ModelViewSet):
    serializer_class = SolutionSerializer

    def get_queryset(self):
        game_id = self.request.query_params.get('id')
        solutionModel = Game.objects.filter(game_id=game_id)[0]
        queryset = [solutionModel]
        return queryset


class NewGameView(viewsets.ModelViewSet):
    serializer_class = NewGameSerializer

    def get_queryset(self):
        solutionModel = Game.objects.create()
        return [solutionModel]


class GameView(viewsets.ModelViewSet):
    serializer_class = GameSerializer
    queryset = Game.objects.all()