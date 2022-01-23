from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .serializers import GameSerializer, ResultSerializer, ResultList
from .models import Game

def get_char_count(word):
    char_count = {}
    for c in word:
        char_count[c] = char_count.setdefault(c, 0) + 1
    return char_count

def check_guess(guess, solution):
    if guess == None or len(guess) != len(solution):
        return [0 for _ in range(len(solution))]
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

    return result

class CheckWordView(viewsets.ModelViewSet):
    serializer_class = ResultSerializer

    def get_queryset(self):
        guess = self.request.query_params.get('guess')
        solutionModel = Game.objects.order_by('-id')[0]
        result = check_guess(guess, solutionModel.solution)
        queryset = [ResultList(result)]
        return queryset

class GameView(viewsets.ModelViewSet):
    serializer_class = GameSerializer
    queryset = Game.objects.all()