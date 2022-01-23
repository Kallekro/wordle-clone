from rest_framework import serializers
from .models import Game

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ('id', 'solution')

class ResultList:
    def __init__(self, result):
        self.result = result

class ResultSerializer(serializers.Serializer):
    result = serializers.ListField(
        child = serializers.IntegerField(min_value = 0, max_value = 2)
    )