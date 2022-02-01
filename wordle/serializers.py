from rest_framework import serializers
from .models import Game

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['game_id']

class Result:
    def __init__(self, result, solved, error):
        self.result = result
        self.solved = solved
        self.error = error

class ResultSerializer(serializers.Serializer):
    result = serializers.ListField(
        child = serializers.IntegerField(min_value = 0, max_value = 2)
    )
    solved = serializers.BooleanField()
    error = serializers.CharField()

class SolutionSerializer(serializers.Serializer):
    solution = serializers.CharField()
    game_id = serializers.UUIDField()

class NewGameSerializer(serializers.Serializer):
    game_id = serializers.UUIDField()